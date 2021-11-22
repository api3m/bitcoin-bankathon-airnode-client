const fs = require('fs');
const airnodeProtocol = require('@api3/airnode-protocol');
const airnodeAdmin = require('@api3/airnode-admin');
require('./common.js');


const configFileName = "airnode-starter.config.json";


async function main() {
  // Get the config object
  const config = JSON.parse(fs.readFileSync(configFileName));
  console.log(`Using ${configFileName}: ` + JSON.stringify(config, null, 2));

  const [wallet] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  accounting.wallet = wallet; // store globally just for accounting
  await logStep(`Wallet ${wallet.address} connected to ${network.name}:${network.chainId}`);

  // Create a requester record
  const airnode = new ethers.Contract(
    config.airnodeContractAddress,
    airnodeProtocol.AirnodeArtifact.abi,
    wallet
  );
  config.requesterIndex = await airnodeAdmin.createRequester(airnode, wallet.address);
  await logStep(`Created requester at index ${config.requesterIndex}`);

  // Deploy the client contract
  const ExampleClientFactory = await ethers.getContractFactory("ExampleClient");
  const exampleClient = await ExampleClientFactory.deploy(airnode.address);
  await exampleClient.deployed();
  config.exampleClientAddress = exampleClient.address;
  await logStep(`ExampleClient deployed at address ${config.exampleClientAddress}`);

  // Endorse the client contract with the requester
  await airnodeAdmin.endorseClient(airnode, config.requesterIndex, exampleClient.address);
  await logStep(`Endorsed ${exampleClient.address} by requester with index ${config.requesterIndex}`);

  // Derive the designated wallet address
  config.designatedWalletAddress = await airnodeAdmin.deriveDesignatedWallet(
    airnode,
    config.apiProviderId,
    config.requesterIndex
  );
  console.log(`Derived the address of the wallet designated for requester with index ${config.requesterIndex} by provider with ID ${config.apiProviderId} to be ${config.designatedWalletAddress}`);

  // Fund the designated wallet
  const fundingAmountEth = '0.002';
  const sendTxn = await wallet.sendTransaction({
    to: config.designatedWalletAddress,
    value: ethers.utils.parseEther(fundingAmountEth)
  });
  await sendTxn.wait();
  await logStep(`Sent ${fundingAmountEth} ETH to the designated wallet with address ${config.designatedWalletAddress}`);

  // Print how much we've spent and how much RBTC is in the designated wallet
  const totalSpentRBTC = weiToEthFixedNumber(accounting.totalSpent);
  const designatedWalletBalance = weiToEthFixedNumber(await ethers.provider.getBalance(config.designatedWalletAddress));
  console.log(`spent a total of ${totalSpentRBTC} RBTC, designated wallet ${config.designatedWalletAddress} has ${designatedWalletBalance} RBTC`);

  // Store the config with the newly generated included info to use in make-request.js
  const dotConfigData = JSON.stringify(config, null, 2);
  fs.writeFileSync('.' + configFileName, dotConfigData);
  console.log(`Generated .${configFileName}: ${dotConfigData}`);
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
