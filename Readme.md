# Bitcoin Bankathon Airnode Client

This is a basic demo project that uses Airnode to call APIs available in the [Bitcoin Bankathon](https://bitcoin-alliance.org/). All of the APIs listed at https://api3.org/results?search=bankathon are available to use. If you need an API that isn't listed here, just ask!

The project uses [Hardhat](https://hardhat.org/getting-started/), [NodeJS](https://nodejs.dev/learn/introduction-to-nodejs), [RSK](https://developers.rsk.co/), and [Airnode Pre-Alpha](https://docs.api3.org/airnode/pre-alpha/).

RSK mines a block about [once every 30 seconds](https://www.rsk.co/faqs#scalability) so be patient when running the scripts.

### Set Up Your Test Wallet

1. [Configure MetaMask for RSK Testnet](https://developers.rsk.co/wallet/use/metamask/).

2. [Create a new test account](https://metamask.zendesk.com/hc/en-us/articles/360015289452-How-to-create-an-additional-account-in-your-MetaMask-wallet). DO NOT use a mainnet account as we'll be insecurely exporting and handling the private key.

3. [Fund your test account](https://faucet.rsk.co/) with the RSK Testnet faucet. You can add 0.05 RBTC to your test wallet per day using the faucet.

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

3. Put your test wallet private key in [hardhat.config.js](/hardhat.config.js).
```javascript
  networks: {
	  testnet: {
		  url: "https://testnet.sovryn.app/rpc",
		  accounts: ["0xPUT YOUR TEST WALLET PRIVATE KEY HERE"]
	  }
  }
```

4. Deploy the ExampleClient contract and create a requester on RSK Testnet. You only need to run this once.
```
npx hardhat --network testnet run scripts/setup.js
```

5. Make a request. You can run this repeatedly to make API requests.
```
npx hardhat --network testnet run scripts/make-request.js
```

### Read the Code

There are 3 files to read.

1. [contracts/ExampleClient.sol](/contracts/ExampleClient.sol) is the smart contract that makes API requests to Airnode.
2. [scripts/setup.js](/scripts/setup.js) is the script you run once to set everything up. It uses Airnode Admin.
3. [scripts/make-request.js](/scripts/make-request.js) is the script that triggers an Airnode request. You can run it repeatedly to call different APIs.

### Call More APIs

Out of the box, make-request.js calls the "Get Banks" API from the [Banco Hipotecario Open Bank Project sandbox](https://obp-apiexplorer.bancohipotecario.com.sv/). You can call [additional Bitcoin Bankathon APIs](https://api3.org/results?search=bankathon) by replacing the code near the top of make-request.js where it says `Copy/paste API examples from the Readme here!!!` with the different examples here.

For each API we need to specify these 4 things:

* **apiProviderId:** The *Provider ID* found in the Airnode docs for the API.
* **endpointId:** The *Endpoint ID* found in the Airnode docs for the API.
* **requestParams:** Any [request parameters](https://docs.api3.org/airnode/pre-alpha/airnode/specifications/ois.html#_5-5-parameters) or [reserved parameters](https://docs.api3.org/airnode/pre-alpha/airnode/specifications/reserved-parameters.html) to include in the request. These depend on the endpoint and how you're using it. See the API's Web2 Docs and Airnode Docs for more info.
* **showResult:** A JavaScript [function expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions) that takes the response data ([as a Solidity bytes32](https://docs.ethers.io/v5/api/utils/bytes/)) and returns the value you want printed to the screen (usually a string).

#### Open Bank Project : Get Banks

[Web2 Docs](https://obp-apiexplorer.bancohipotecario.com.sv/?version=OBPv4.0.0&operation_id=OBPv4_0_0-getBanks&currentTag=Bank#OBPv4_0_0-getBanks), [Airnode Docs](https://gist.github.com/camronh/70f3356d54defd3dbebbac868ac73805#0xbfd499b3bebd55fe02ddcdd5a2f1ab36ef75fb3ace1de05c878d0b53ce4a7296)

```javascript
const apiProviderId = "0xc6323485739cdf4f1073c1b21bb21a8a5c0a619ffb84dd56c4f4454af2802a40";
const endpointId = "0xbfd499b3bebd55fe02ddcdd5a2f1ab36ef75fb3ace1de05c878d0b53ce4a7296";
const requestParams = [
	{ name: '_path', type: 'bytes32', value: 'banks.0.id'},
	{ name: '_type', type: 'bytes32', value: 'bytes32'}
];
const showResult = (data) => ethers.utils.parseBytes32String(data);
```

#### dxFeed : Get Events

[Web2 Docs](https://tools.dxfeed.com/webservice/rest-demo.jsp), [Airnode Docs](https://gist.github.com/camronh/f4439dad5de9eafad7b1ea75e5ac6656)

```javascript
const apiProviderId = "0x155b746ad948bdbbaa6ae4279ae4c024403984ddf364499409697b66c42b826c";
const endpointId = "0x4903a994f440e0bf4c4389832e18f7cff6ead57195b5f50a4cab92369b4621f4";
const requestParams = [
	{ name: '_path', type: 'bytes32', value: 'Summary.MSFT.dayHighPrice'},
	{ name: '_type', type: 'bytes32', value: 'bytes32'},
	{ name: 'event', type: 'bytes32', value: 'Summary' },
	{ name: 'symbol', type: 'bytes32', value: 'MSFT' }
];
const showResult = (data) => "$" + ethers.utils.parseBytes32String(data) + " day high";
```

#### Sanctions.io : Get Programs

[Web2 Docs](https://app.swaggerhub.com/apis-docs/Sanctions.IO/sanctions-io_api/d8b6c665-a2e7-4346-a53b-c56c0f0210ed#/sources/programs), [Airnode Docs](https://gist.github.com/camronh/b80b3b2aa87211f38ca48693d82740c8#0x809a51553f8634545ea95cbe6a90f7902d4d0056fae1aa3ec7b709664aec891b)

```javascript
const apiProviderId = "0x797a83d217645fc2f6af6f96a63795a02b6243908070eaa48be2a5bacb435956";
const endpointId = "0x809a51553f8634545ea95cbe6a90f7902d4d0056fae1aa3ec7b709664aec891b";
const requestParams = [
	{ name: '_path', type: 'bytes32', value: 'count'},
	{ name: '_type', type: 'bytes32', value: 'int256'}
];
const showResult = (data) => parseInt(data) + " programs";
```

#### CoinGecko : Get Price

```javascript
const apiProviderId = "0x189989906bd5b4076005549386731dbcb69329d7b7ae4de32707a441a936ad78";
const endpointId = "0xf466b8feec41e9e50815e0c9dca4db1ff959637e564bb13fefa99e9f9f90453c";
const requestParams = [{ name: 'coinId', type: 'bytes32', value: 'ethereum' }];
const showResult = (data) => (data / 1e6) + " USD";
```
