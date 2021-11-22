# Airnode Client Starter (RSK)

### Set Up Test Your Wallet

1. [Configure MetaMask for RSK Testnet](https://developers.rsk.co/wallet/use/metamask/).

2. [Create a new test account](https://metamask.zendesk.com/hc/en-us/articles/360015289452-How-to-create-an-additional-account-in-your-MetaMask-wallet). DO NOT use a mainnet account as we'll be insecurely exporting and handling the private key.

3. [Fund your test account](https://faucet.rsk.co/) with the RSK Testnet faucet. You can add 0.05 RBTC to your test wallet per day.

4. [Export your test wallet private key](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key). You'll need it in the next section.

### Set Up and Run the Code

1. Install the dependencies.
```
npm install
```

2. Compile the ExampleClient contract.
```
npx hardhat compile
```

3. Put your test wallet private key in hardhat.config.js.
```
  networks: {
	  testnet: {
		  url: "https://testnet.sovryn.app/rpc",
		  accounts: ["PUT YOUR TEST WALLET PRIVATE KEY HERE"]
	  }
  }
```

4. Setup the requester and contract on RSK Testnet.
```
npx hardhat --network testnet run scripts/setup.js
```

5. Make a request.
```
npx hardhat --network testnet run scripts/make-request.js
```

### Read the Code

There are 3 files to read.

1. [contracts/ExampleClient.sol](https://github.com/37Rb/airnode-client-starter-rsk/blob/main/contracts/ExampleClient.sol) is the smart contract that makes the CoinGecko API Airnode request.
2. [scripts/setup.js](https://github.com/37Rb/airnode-client-starter-rsk/blob/main/scripts/setup.js) is the script you have to run once to set everything up. It uses Airnode Admin.
3. [scripts/make-request.js](https://github.com/37Rb/airnode-client-starter-rsk/blob/main/scripts/make-request.js) is the script that triggers a single Airnode request. You can run it repeatedly but you will need to re-fund your designated wallet eventually.

The configuration info in airnode-starter.config.json depends on the API you're calling and the blockchain you're calling it from. It can be found in the Airnode documentation for each API at https://api3.org/apis.

```
{
  "airnodeContractAddress": "0x1190a5e1f2afe4c8128fd820a7ac85a95a9e6e3e",
  "apiProviderId": "0x189989906bd5b4076005549386731dbcb69329d7b7ae4de32707a441a936ad78",
  "endpointId": "0xf466b8feec41e9e50815e0c9dca4db1ff959637e564bb13fefa99e9f9f90453c"
}
```
