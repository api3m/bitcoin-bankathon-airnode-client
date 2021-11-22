const fs = require('fs');
const airnodeProtocol = require('@api3/airnode-protocol');
const airnodeAbi = require('@api3/airnode-abi');
const common = require('./common.js');

const dotConfigFileName = ".airnode-starter.config.json";

async function main() {
  // Get the config object created by setup.js
  const config = JSON.parse(fs.readFileSync(dotConfigFileName));
  console.log(`Using ${dotConfigFileName}: ` + JSON.stringify(config, null, 2));

  // Get the preconnected wallet from Hardhat
  const [wallet] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  console.log(`Wallet ${wallet.address} connected to network ${network.name}:${network.chainId}`);

  // Get an instance of the ExampleClient we deployed
  const exampleClient = await ethers.getContractAt("ExampleClient", config.exampleClientAddress, wallet);

  // Get an instance if the Airnode RRP contract
  const airnode = new ethers.Contract(
    config.airnodeContractAddress,
    airnodeProtocol.AirnodeArtifact.abi,
    wallet
  );

  // Show the balance in the designated wallet
  const designatedWalletBalance = common.weiToEth(await ethers.provider.getBalance(config.designatedWalletAddress));
  console.log(`Designated wallet ${config.designatedWalletAddress} has ${designatedWalletBalance} RBTC`);

  // Make the request
  async function makeRequest() {
    const receipt = await exampleClient.makeRequest(
      config.apiProviderId,
      config.endpointId,
      config.requesterIndex,
      config.designatedWalletAddress,
      airnodeAbi.encode([{
        name: 'coinId',
        type: 'bytes32',
        value: 'ethereum'
      }])
    );
    console.log(`Sent the request with transaction ${receipt.hash}`);
    return new Promise((resolve) =>
      wallet.provider.once(receipt.hash, (tx) => {
        const parsedLog = airnode.interface.parseLog(tx.logs[0]);
        resolve(parsedLog.args.requestId);
      })
    );
  }
  console.log(`Making the request...`);
  const requestId = await makeRequest();
  console.log(`Completed the request with ID ${requestId}, waiting for fulfillment...`);

  function fulfilled(requestId) {
    return new Promise((resolve) =>
      wallet.provider.once(airnode.filters.ClientRequestFulfilled(null, requestId), resolve)
    );
  }
  await fulfilled(requestId).catch((err) => {
    console.error(err);
  });
  console.log(`Request fulfilled with data: ${(await exampleClient.fulfilledData(requestId)) / 1e6} USD`);
}


main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
