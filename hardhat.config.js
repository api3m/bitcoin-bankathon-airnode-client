require("@nomiclabs/hardhat-waffle");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.6.12",
  networks: {
	  testnet: {
		  url: "https://public-node.testnet.rsk.co",
		  accounts: ["0x74babe13003763a98b33bd88b66c58a206cf3e967d9c7ce855d8d44b27493101"]
	  }
  }
};
