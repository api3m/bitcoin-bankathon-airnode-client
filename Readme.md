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
		  url: "https://public-node.testnet.rsk.co",
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
