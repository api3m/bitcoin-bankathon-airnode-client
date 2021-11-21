const fs = require('fs');
const airnodeProtocol = require('@api3/airnode-protocol');
const airnodeAbi = require('@api3/airnode-abi');
require('./common.js');

// Get the endpoint ID from the API Airnode docs
const endpointId = "0xf466b8feec41e9e50815e0c9dca4db1ff959637e564bb13fefa99e9f9f90453c";

// Get the config object created by setup.js
const config = JSON.parse(fs.readFileSync("config.json"));


async function main() {
  console.log("Using config: " + JSON.stringify(config, null, 2));

  // Connect your wallet to the blockchain provider node
  const provider = new ethers.providers.JsonRpcProvider(config.rpcProviderUrl);
  const wallet = new ethers.Wallet(config.myWalletPrivateKey).connect(provider);
  console.log(`Wallet ${wallet.address} connected to ${config.rpcProviderUrl}`);

  // Get an instance of the ExampleClient we deployed
  const exampleClient = await ethers.getContractAt("ExampleClient", config.exampleClientAddress, wallet);

  // Get an instance if the Airnode RRP contract
  const airnode = new ethers.Contract(
    config.airnodeContractAddress,
    airnodeProtocol.AirnodeArtifact.abi,
    wallet
  );

  // Show the balance in the designated wallet
  const designatedWalletBalance = weiToEthFixedNumber(await ethers.provider.getBalance(config.designatedWalletAddress));
  console.log(`Designated wallet ${config.designatedWalletAddress} has ${designatedWalletBalance} RBTC`);

  console.log('Making the request...');
  async function makeRequest() {
    const receipt = await exampleClient.makeRequest(
      config.apiProviderId,
      endpointId,
      config.requesterIndex,
      config.designatedWalletAddress,
      airnodeAbi.encode([{
        name: 'coinId',
        type: 'bytes32',
        value: 'ethereum'
      }])
    );
    return new Promise((resolve) =>
      wallet.provider.once(receipt.hash, (tx) => {
        const parsedLog = airnode.interface.parseLog(tx.logs[0]);
        resolve(parsedLog.args.requestId);
      })
    );
  }
  const requestId = await makeRequest();
  console.log(`Made the request with ID ${requestId}.\nWaiting for it to be fulfilled...`);

  function fulfilled(requestId) {
    return new Promise((resolve) =>
      wallet.provider.once(airnode.filters.ClientRequestFulfilled(null, requestId), resolve)
    );
  }
  await fulfilled(requestId);
  console.log('Request fulfilled');
  console.log(`returned data is ${(await exampleClient.fulfilledData(requestId)) / 1e6} USD`);
}


main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
