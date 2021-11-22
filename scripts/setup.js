const fs = require('fs');
const airnodeProtocol = require('@api3/airnode-protocol');
const airnodeAdmin = require('@api3/airnode-admin');
const common = require('./common.js');

const configFileName = "airnode-starter.config.json";

async function main() {
  // Get the config object with Airnode and API info
  const config = JSON.parse(fs.readFileSync(configFileName));
  console.log(`Using ${configFileName}: ` + JSON.stringify(config, null, 2));

  // Get the preconnected wallet from Hardhat
  const [wallet] = await ethers.getSigners();
  common.accountForWallet(wallet); // Not required, just so we can print wallet balances
  const network = await ethers.provider.getNetwork();
  await common.logStep(`Wallet ${wallet.address} connected to network ${network.name}:${network.chainId}`);

  // Create a requester record
  const airnode = new ethers.Contract(
    config.airnodeContractAddress,
    airnodeProtocol.AirnodeArtifact.abi,
    wallet
  );
  config.requesterIndex = await airnodeAdmin.createRequester(airnode, wallet.address);
  await common.logStep(`Created requester at index ${config.requesterIndex}`);

  // Deploy the client contract
  const ExampleClientFactory = await ethers.getContractFactory("ExampleClient");
  const exampleClient = await ExampleClientFactory.deploy(airnode.address);
  await exampleClient.deployed();
  config.exampleClientAddress = exampleClient.address;
  await common.logStep(`ExampleClient contract deployed at address ${config.exampleClientAddress}`);

  // Endorse the client contract with the requester
  await airnodeAdmin.endorseClient(airnode, config.requesterIndex, exampleClient.address);
  await common.logStep(`Endorsed ${exampleClient.address} by requester with index ${config.requesterIndex}`);

  // Derive the designated wallet address
  config.designatedWalletAddress = await airnodeAdmin.deriveDesignatedWallet(
    airnode,
    config.apiProviderId,
    config.requesterIndex
  );
  console.log(`Derived the designated wallet ${config.designatedWalletAddress} for requester index ${config.requesterIndex} by provider ${config.apiProviderId}`);

  // Fund the designated wallet
  const fundingAmountEth = '0.002';
  const sendTxn = await wallet.sendTransaction({
    to: config.designatedWalletAddress,
    value: ethers.utils.parseEther(fundingAmountEth)
  });
  await sendTxn.wait();
  await common.logStep(`Sent ${fundingAmountEth} ETH to designated wallet ${config.designatedWalletAddress}`);

  // Print how much we've spent and how much RBTC is in the designated wallet
  const totalSpentRBTC = common.weiToEth(common.getTotalSpent());
  const designatedWalletBalance = common.weiToEth(await ethers.provider.getBalance(config.designatedWalletAddress));
  console.log(`Spent a total of ${totalSpentRBTC} RBTC, designated wallet ${config.designatedWalletAddress} has ${designatedWalletBalance} RBTC`);

  // Store the config with the newly generated included info to use in make-request.js
  const dotConfigData = JSON.stringify(config, null, 2);
  fs.writeFileSync('.' + configFileName, dotConfigData);
  console.log(`Generated .${configFileName}: ${dotConfigData}`);
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
