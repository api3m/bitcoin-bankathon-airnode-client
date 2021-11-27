require("@nomiclabs/hardhat-waffle");

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.6.12",
  networks: {
    testnet: {
      url: "https://testnet.sovryn.app/rpc",
      accounts: ["0xPUT YOUR TEST WALLET PRIVATE KEY HERE"]
    }
  }
};
