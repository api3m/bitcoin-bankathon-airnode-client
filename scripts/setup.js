const fs = require('fs');
const airnodeProtocol = require('@api3/airnode-protocol');
const airnodeAdmin = require('@api3/airnode-admin');
require('./common.js');


async function main() {
  // Get from your MetaMask account details
  const myWalletPrivateKey = TODO Put your exported private key here;

  // Get the api provider ID from the API Airnode docs
  const apiProviderId = "0x189989906bd5b4076005549386731dbcb69329d7b7ae4de32707a441a936ad78";

  const rpcProviderUrl = "https://public-node.testnet.rsk.co";
  const airnodeContractAddress = "0x1190a5e1f2afe4c8128fd820a7ac85a95a9e6e3e";

  // Connect your wallet to the blockchain provider node
  const provider = new ethers.providers.JsonRpcProvider(rpcProviderUrl);
  const wallet = new ethers.Wallet(myWalletPrivateKey).connect(provider);
  accounting.wallet = wallet; // store globally just for accounting
  await logStep(`Wallet ${wallet.address} connected to ${rpcProviderUrl}`);

  // Create a requester record
  const airnode = new ethers.Contract(airnodeContractAddress,
    airnodeProtocol.AirnodeArtifact.abi,
    wallet);
  const requesterIndex = await airnodeAdmin.createRequester(airnode, wallet.address);
  await logStep(`Created requester at index ${requesterIndex}`);

  // Deploy the client contract
  const ExampleClientFactory = await ethers.getContractFactory("ExampleClient");
  const exampleClient = await ExampleClientFactory.deploy(airnode.address);
  await exampleClient.deployed();
  await logStep(`ExampleClient deployed at address ${exampleClient.address}`);

  // Endorse the client contract with the requester
  await airnodeAdmin.endorseClient(airnode, requesterIndex, exampleClient.address);
  await logStep(`Endorsed ${exampleClient.address} by requester with index ${requesterIndex}`);

  // Derive the designated wallet address
  const designatedWalletAddress = await airnodeAdmin.deriveDesignatedWallet(
    airnode,
    apiProviderId,
    requesterIndex
  );
  console.log(`Derived the address of the wallet designated for requester with index ${requesterIndex} by provider with ID ${apiProviderId} to be ${designatedWalletAddress}`);

  // Fund the designated wallet
  const amount = '0.001'; // ETH
  const sendTxn = await wallet.sendTransaction({
    to: designatedWalletAddress,
    value: ethers.utils.parseEther(amount),
  });
  await sendTxn.wait();
  await logStep(`Sent ${amount} ETH to the designated wallet with address ${designatedWalletAddress}`);

  // Print how much we've spent and how much RBTC is in the designated wallet
  const totalSpentRBTC = weiToEthFixedNumber(accounting.totalSpent);
  const designatedWalletBalance = weiToEthFixedNumber(await ethers.provider.getBalance(designatedWalletAddress));
  console.log(`spent a total of ${totalSpentRBTC} RBTC, designated wallet ${designatedWalletAddress} has ${designatedWalletBalance} RBTC`);

  // Store the config object to use in make-request.js
  const config = {
    myWalletPrivateKey,
    apiProviderId,
    rpcProviderUrl,
    airnodeContractAddress,
    requesterIndex,
    exampleClientAddress: exampleClient.address,
    designatedWalletAddress
  };
  fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
  console.log("Wrote the coniguration to config.json")
}


// Just some accounting and formatting stuff so we can see what's happening. ///
const accounting = {
  wallet: null,
  balance: null,
  totalSpent: ethers.BigNumber.from("0"),
  time: Date.now()
};
async function logStep(logLine) {
  const newTime = Date.now();
  const newBalance = await accounting.wallet.getBalance();
  if (accounting.balance === null) {
    accounting.balance = newBalance;
  }
  const spent = accounting.balance.sub(newBalance);
  const spentNanoRBTC = spent.div(ethers.BigNumber.from("1000000000"));
  const newBalanceRBTC = weiToEthFixedNumber(newBalance);
  const elapsed = ((newTime - accounting.time) / 1000).toFixed(2);
  const accountingLine = `--- spent ${spentNanoRBTC} nanoRBTC, have ${newBalanceRBTC} RBTC (${elapsed}s)`;
  accounting.balance = newBalance;
  accounting.totalSpent = accounting.totalSpent.add(spent);
  accounting.time = Date.now();
  console.log(logLine);
  console.log(accountingLine);
}
////////////////////////////////////////////////////////////////////////////////


main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
