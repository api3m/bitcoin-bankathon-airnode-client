# Bitcoin Bankathon Airnode Client

This is a very simple demo that uses Airnode to call APIs available for the [Bitcoin Bankathon](https://bitcoin-alliance.org/).

It uses [Hardhat](https://hardhat.org/getting-started/), [RSK](https://developers.rsk.co/), [NodeJS](https://nodejs.dev/learn/introduction-to-nodejs), and [Airnode Pre-Alpha](https://docs.api3.org/airnode/pre-alpha/).

### Set Up Your Test Wallet

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

4. Deploy the requester and client contract on RSK Testnet.
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
2. [scripts/setup.js](https://github.com/37Rb/airnode-client-starter-rsk/blob/main/scripts/setup.js) is the script you have to run once to set everything up. It uses Airnode Admin to prepare everything.
3. [scripts/make-request.js](https://github.com/37Rb/airnode-client-starter-rsk/blob/main/scripts/make-request.js) is the script that triggers a single Airnode request. You can run it repeatedly but you will need to re-fund your designated wallet eventually.

### Call More APIs

Out of the box make-request.js calls the Get Banks API from the [Banco Hipotecario Open Bank Project sandbox](https://obp-apiexplorer.bancohipotecario.com.sv/). You can call additional APIs by replacing the code near the top of make-request.js with these other examples.

#### Open Bank Project > Get Banks

```javascript
const apiProviderId = "0xc6323485739cdf4f1073c1b21bb21a8a5c0a619ffb84dd56c4f4454af2802a40";
const endpointId = "0xbfd499b3bebd55fe02ddcdd5a2f1ab36ef75fb3ace1de05c878d0b53ce4a7296";
const endpointAbi = [
	{ name: '_path', type: 'bytes32', value: 'banks.0.id'},
	{ name: '_type', type: 'bytes32', value: 'bytes32'}
];
const showResult = (data) => ethers.utils.parseBytes32String(data);
```

#### CoinGecko > Get Price

```javascript
const apiProviderId = "0x189989906bd5b4076005549386731dbcb69329d7b7ae4de32707a441a936ad78";
const endpointId = "0xf466b8feec41e9e50815e0c9dca4db1ff959637e564bb13fefa99e9f9f90453c";
const endpointAbi = [{ name: 'coinId', type: 'bytes32', value: 'ethereum' }];
const showResult = (data) => (data / 1e6) + " USD";
```
