const fs = require('fs');
const airnodeProtocol = require('@api3/airnode-protocol');
const airnodeAdmin = require('@api3/airnode-admin');

async function main() {
  // Get the config object with Airnode and API info
  const config = {
    airnodeContractAddress: "0x1190a5e1f2afe4c8128fd820a7ac85a95a9e6e3e"
  };

  // Get the preconnected wallet from Hardhat
  const [wallet] = await ethers.getSigners();
  console.log(`Using wallet ${wallet.address} and Airnode contract ${config.airnodeContractAddress}`);

  // Create a requester record
  const airnode = new ethers.Contract(
    config.airnodeContractAddress,
    airnodeProtocol.AirnodeArtifact.abi,
    wallet
  );
  config.requesterIndex = await airnodeAdmin.createRequester(airnode, wallet.address);
  console.log(`Created requester at index ${config.requesterIndex}`);

  // Deploy the client contract
  const ExampleClientFactory = await ethers.getContractFactory("ExampleClient");
  const exampleClient = await ExampleClientFactory.deploy(airnode.address);
  await exampleClient.deployed();
  config.exampleClientAddress = exampleClient.address;
  console.log(`ExampleClient contract deployed at address ${config.exampleClientAddress}`);

  // Endorse the client contract with the requester
  await airnodeAdmin.endorseClient(airnode, config.requesterIndex, exampleClient.address);
  console.log(`Endorsed ${exampleClient.address} by requester with index ${config.requesterIndex}`);

  // Store the config with the newly generated included info to use in make-request.js
  const configFileName = ".airnode-starter.config.json";
  const configData = JSON.stringify(config, null, 2);
  fs.writeFileSync(configFileName, configData);
  console.log(`Generated ${configFileName}: ${configData}`);
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
