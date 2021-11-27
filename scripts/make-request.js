const fs = require('fs');
const airnodeProtocol = require('@api3/airnode-protocol');
const airnodeAbi = require('@api3/airnode-abi');
const airnodeAdmin = require('@api3/airnode-admin');


// Copy/paste API examples from the Readme here!!! /////////////////////////////
const apiProviderId = "0xc6323485739cdf4f1073c1b21bb21a8a5c0a619ffb84dd56c4f4454af2802a40";
const endpointId = "0xbfd499b3bebd55fe02ddcdd5a2f1ab36ef75fb3ace1de05c878d0b53ce4a7296";
const requestParams = [
	{ name: '_path', type: 'bytes32', value: 'banks.0.id'},
	{ name: '_type', type: 'bytes32', value: 'bytes32'}
];
const showResult = (data) => ethers.utils.parseBytes32String(data);
////////////////////////////////////////////////////////////////////////////////


async function main() {
  // Get the config object created by setup.js
  const config = JSON.parse(fs.readFileSync(".airnode-starter.config.json"));
  console.log(`Using config: ` + JSON.stringify(config, null, 2));

  // Get the preconnected wallet from Hardhat
  const [wallet] = await ethers.getSigners();
  console.log(`Using wallet ${wallet.address} and Airnode ${config.airnodeContractAddress}`);

  // Get an instance of the ExampleClient we deployed in setup.js
  const exampleClient = await ethers.getContractAt("ExampleClient", config.exampleClientAddress, wallet);

  // Get an instance if the Airnode RRP contract
  const airnode = new ethers.Contract(
    config.airnodeContractAddress,
    airnodeProtocol.AirnodeArtifact.abi,
    wallet
  );

  // Derive the designated wallet address
  const designatedWalletAddress = await airnodeAdmin.deriveDesignatedWallet(
    airnode,
    apiProviderId,
    config.requesterIndex
  );
  console.log(`Derived the designated wallet ${designatedWalletAddress} for requester index ${config.requesterIndex} by provider ${apiProviderId}`);

  // Check the designated wallet and make sure it's funded
  const designatedWalletBalance = await ethers.provider.getBalance(designatedWalletAddress);
  if (designatedWalletBalance >= 1e14) { // >= 0.0001 RBTC
    console.log(`Designated wallet ${designatedWalletAddress} has ${weiToEth(designatedWalletBalance)} RBTC`);
  } else {
    console.log(`Designated wallet ${designatedWalletAddress} has ${weiToEth(designatedWalletBalance)} RBTC, funding...`);
    const sendTxn = await wallet.sendTransaction({
      to: designatedWalletAddress,
      value: ethers.utils.parseEther('0.001')
    });
    await sendTxn.wait();
  }

  // Make the request
  async function makeRequest() {
    const receipt = await exampleClient.makeRequest(
      apiProviderId,
      endpointId,
      config.requesterIndex,
      designatedWalletAddress,
      airnodeAbi.encode(requestParams)
    );
    console.log(`Sent the request with transaction ${receipt.hash}`);

    return new Promise((resolve) =>
      wallet.provider.once(receipt.hash, (tx) => {
        const parsedLog = airnode.interface.parseLog(tx.logs[0]);
        resolve(parsedLog.args.requestId);
      })
    );
  }

  console.log(`Making the request to API provider ${apiProviderId} endoint ${endpointId}...`);
  const requestId = await makeRequest();
  console.log(`Completed the request with ID ${requestId}, waiting for fulfillment...`);

  // Listen for the event announcing that the request was fulfilled
  function fulfilled(requestId) {
    return new Promise((resolve) =>
      wallet.provider.once(airnode.filters.ClientRequestFulfilled(null, requestId), resolve)
    );
  }
  await fulfilled(requestId);
  console.log('Request fulfilled, getting response...');

  // Read the fulfilled result from the blockchain
  const result = showResult(await exampleClient.fulfilledData(requestId));
  console.log(`Got response: ${result}`);
}

function weiToEth(wei, precision = 6) {
  return Number(ethers.utils.formatEther(wei)).toFixed(precision);
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
