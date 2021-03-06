# Bitcoin Bankathon Airnode Client

This is a basic demo project that uses Airnode to call APIs available in the [Bitcoin Bankathon](https://bitcoin-alliance.org/). All of the APIs listed at https://api3.org/results?search=bankathon are available to use. If you need an API that isn't listed here, just ask!

The project uses [Hardhat](https://hardhat.org/getting-started/), [NodeJS](https://nodejs.dev/learn/introduction-to-nodejs), [RSK](https://developers.rsk.co/), and [Airnode Pre-Alpha](https://docs.api3.org/airnode/pre-alpha/).

RSK mines a block about [once every 30 seconds](https://www.rsk.co/faqs#scalability) so be patient when running the scripts.

### Set Up Your Test Wallet

1. [Configure MetaMask for RSK Testnet](https://developers.rsk.co/wallet/use/metamask/).

2. [Create a new test account](https://metamask.zendesk.com/hc/en-us/articles/360015289452-How-to-create-an-additional-account-in-your-MetaMask-wallet). DO NOT use a mainnet account as we'll be insecurely exporting and handling the private key.

3. [Fund your test account](https://faucet.rsk.co/) with the RSK Testnet faucet. You can add 0.05 RBTC to your test wallet per day using the faucet.

4. [Export your test wallet private key](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-Export-an-Account-Private-Key) and put it in [hardhat.config.js](/hardhat.config.js).

```javascript
  networks: {
	  testnet: {
		  url: "https://testnet.sovryn.app/rpc",
		  accounts: ["0xPUT YOUR TEST WALLET PRIVATE KEY HERE"]
	  }
  }
```

> :information_source: It's not necessary to use MetaMask to create your test wallet but it's informative to do so. Alternatively, you can generate a test wallet with [ethers.Wallet.createRandom()](https://docs.ethers.io/v5/api/signer/#Wallet-createRandom) and fund that instead.

### Set Up and Run the Code

1. Install the dependencies.
```
npm install
```

2. Compile the ExampleClient contract.
```
npx hardhat compile
```

3. Deploy the ExampleClient contract and create a requester on RSK Testnet. You only need to run this once.
```
npx hardhat --network testnet run scripts/setup.js
```

4. Make a request. You can run this repeatedly to make API requests.
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

#### Open Bank Project : Get Customer Attributes

[Web2 Docs](https://apiexplorersandbox.openbankproject.com/?version=OBPv4.0.0&operation_id=OBPv4_0_0-getCustomerAttributes&currentTag=Customer#OBPv4_0_0-getCustomerAttributes), [Airnode Docs](https://gist.github.com/camronh/70f3356d54defd3dbebbac868ac73805#get-obpv400banksbank_idcustomerscustomer_idattributes-)

```javascript
const apiProviderId = "0xc6323485739cdf4f1073c1b21bb21a8a5c0a619ffb84dd56c4f4454af2802a40";
const endpointId = "0x0e55b7a2e98c1ec9d8c8d11e19bcf9b91e1e0e6a31b51d4817d54177470ba517";
const requestParams = [
    { name: '_path', type: 'bytes32', value: 'customer_attributes.0.name'},
    { name: '_type', type: 'bytes32', value: 'bytes32'},
    { name: 'BANK_ID', type: 'bytes32', value: 'slv.01.uk.bk0'},
    { name: 'CUSTOMER_ID', type: 'string', value: '887674a5-9cf9-4481-a2a2-bd09fc277fc1'}
];
const showResult = (data) => ethers.utils.parseBytes32String(data);
```

#### dxFeed : Get Events

[Web2 Docs](https://tools.dxfeed.com/webservice/rest-demo.jsp), [Airnode Docs](https://gist.github.com/camronh/f4439dad5de9eafad7b1ea75e5ac6656#0x4903a994f440e0bf4c4389832e18f7cff6ead57195b5f50a4cab92369b4621f4)

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

#### Finage : Get Forex Last Trade

[Web2 Docs](https://finage.co.uk/docs/api/forex-last-trade), [Airnode Docs](https://gist.github.com/camronh/a3b40c696822b1aa833f5a2cf7e5e7db#0x455674d3e409af26694a6bf1f2f912d1f451fdff94468cf00daa3e7e17cdb4c7)

```javascript
const apiProviderId = "0xa22d277d24393dfafdb4567e706bad68c74f71c0ed409a563f8aaba38ba5d0c6";
const endpointId = "0x455674d3e409af26694a6bf1f2f912d1f451fdff94468cf00daa3e7e17cdb4c7";
const requestParams = [
	{ name: '_path', type: 'bytes32', value: 'price'},
	{ name: '_type', type: 'bytes32', value: 'bytes32'},
	{ name: 'symbol', type: 'bytes32', value: 'GBPUSD' }
];
const showResult = (data) => ethers.utils.parseBytes32String(data) + " GBP/USD";
```

#### Finage : Get Market News

[Web2 Docs](https://finage.co.uk/docs/api/market-news-api), [Airnode Docs](https://gist.github.com/camronh/a3b40c696822b1aa833f5a2cf7e5e7db#0x9e9f633e661f61820364c47c12a95074d00b9a9d2e9041ff37415e7cacd05481)

```javascript
const apiProviderId = "0xa22d277d24393dfafdb4567e706bad68c74f71c0ed409a563f8aaba38ba5d0c6";
const endpointId = "0x9e9f633e661f61820364c47c12a95074d00b9a9d2e9041ff37415e7cacd05481";
const requestParams = [
    { name: '_path', type: 'bytes32', value: '1.title'},
    { name: '_type', type: 'bytes32', value: 'bytes32'},
    { name: 'symbol', type: 'bytes32', value: 'GOGL' }
];
const showResult = (data) => ethers.utils.parseBytes32String(data);
```

#### Finage : Get Sector Performance

[Web2 Docs](https://finage.co.uk/docs/api/sector-performance-api), [Airnode Docs](https://gist.github.com/camronh/a3b40c696822b1aa833f5a2cf7e5e7db#0x9d5a3e52a7ee9d9027420ffcd606b6417b81048fc79e15a84c020205b9b67eaf)

```javascript
const apiProviderId = "0xa22d277d24393dfafdb4567e706bad68c74f71c0ed409a563f8aaba38ba5d0c6";
const endpointId = "0x9d5a3e52a7ee9d9027420ffcd606b6417b81048fc79e15a84c020205b9b67eaf";
const requestParams = [
	{ name: '_path', type: 'bytes32', value: '0.change_percentage'},
	{ name: '_type', type: 'bytes32', value: 'bytes32'}
];
const showResult = (data) => ethers.utils.parseBytes32String(data);
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

#### Sanctions.io : Get Sources

[Web2 Docs](https://app.swaggerhub.com/apis-docs/Sanctions.IO/sanctions-io_api/d8b6c665-a2e7-4346-a53b-c56c0f0210ed#/sources/sources), [Airnode Docs](https://gist.github.com/camronh/b80b3b2aa87211f38ca48693d82740c8#0x4b1da580aa6ef185c68df7956ea256686384627cecdc2b7ea3d686adad11c6b1)

```javascript
const apiProviderId = "0x797a83d217645fc2f6af6f96a63795a02b6243908070eaa48be2a5bacb435956";
const endpointId = "0x4b1da580aa6ef185c68df7956ea256686384627cecdc2b7ea3d686adad11c6b1";
const requestParams = [
	{ name: '_path', type: 'bytes32', value: 'results.0.name'},
	{ name: '_type', type: 'bytes32', value: 'bytes32'}
];
const showResult = (data) => ethers.utils.parseBytes32String(data);
```

#### PWP Leeway : Get Live Price

[Web2 Docs](https://leeway.tech/api-doc/general?lang=eng), [Airnode Docs](https://gist.github.com/camronh/55286c02ef368a2581fa11dac54db68c#0x765b30b1ab1e8fe30fcd25bff1d1e247b05e8893038625830779869230acdd0f)

```javascript
const apiProviderId = "0x312add0c7b18e839a8d3cf793f85ccb431f4f52418fba494680eb2c46ac14e7e";
const endpointId = "0x765b30b1ab1e8fe30fcd25bff1d1e247b05e8893038625830779869230acdd0f";
const requestParams = [
	{ name: '_path', type: 'bytes32', value: 'close'},
	{ name: '_type', type: 'bytes32', value: 'bytes32'},
	{ name: 'symbolExchange', type: 'bytes32', value: 'SAP.XETRA' }
];
const showResult = (data) => "$" + ethers.utils.parseBytes32String(data) + " closing price";
```

#### Cignals : Get Instruments

[Web2 Docs](https://docs.cignals.io/#instruments), [Airnode Docs](https://gist.github.com/camronh/df819747f434d642cdf67487370e5500#0x057d95392ec5c49ee236b7bd5f7a237a1cf1964d2dad815677ed4d8e31d2fedf)

```javascript
const apiProviderId = "0xe13ae740d08cfa4b7ad1e1a202136cc663924db80fd2ec41864c4c2f315f54dc";
const endpointId = "0x057d95392ec5c49ee236b7bd5f7a237a1cf1964d2dad815677ed4d8e31d2fedf";
const requestParams = [
	{ name: '_path', type: 'bytes32', value: '0.exchange'},
	{ name: '_type', type: 'bytes32', value: 'bytes32'}
];
const showResult = (data) => ethers.utils.parseBytes32String(data);
```

#### CoinGecko : Get Price

```javascript
const apiProviderId = "0x189989906bd5b4076005549386731dbcb69329d7b7ae4de32707a441a936ad78";
const endpointId = "0xf466b8feec41e9e50815e0c9dca4db1ff959637e564bb13fefa99e9f9f90453c";
const requestParams = [{ name: 'coinId', type: 'bytes32', value: 'ethereum' }];
const showResult = (data) => (data / 1e6) + " USD";
```

#### Interzoid : Get Metal Price

> :warning: This API is not currently working. Please stand by.

[Web2 Docs](https://www.interzoid.com/services/getmetalprices), [Airnode Docs](https://gist.github.com/interzoid/f05e63df824a772565d5b389204defc3#0xc0aa4a6c85fb5b6fba3cde7be72746a30bfdb03e1cedaaac68dd794063851094)

```javascript
const apiProviderId = "0xa89a4d199eebf5ceb85b87d6aad3199e74e465b1529b850cde96981b7db9a0a7";
const endpointId = "0xc0aa4a6c85fb5b6fba3cde7be72746a30bfdb03e1cedaaac68dd794063851094";
const requestParams = [
	{ name: '_path', type: 'bytes32', value: 'Price'},
	{ name: '_type', type: 'bytes32', value: 'bytes32'},
	{ name: 'metal', type: 'bytes32', value: 'gold' }
];
const showResult = (data) => "$" + ethers.utils.parseBytes32String(data) + " gold/USD";
```

#### Cignals : Get OHLC(V)

> :warning: This API is not currently working. Please stand by.

[Web2 Docs](https://docs.cignals.io/#ohlc-v), [Airnode Docs](https://gist.github.com/camronh/df819747f434d642cdf67487370e5500#ohlc-)

```javascript
const apiProviderId = "0xe13ae740d08cfa4b7ad1e1a202136cc663924db80fd2ec41864c4c2f315f54dc";
const endpointId = "0x31c4ef729dac3e40538d729fce8f4bae96ece2263ee265bca58f975c2886a890";
const requestParams = [
	{ name: '_path', type: 'bytes32', value: '0.side'},
	{ name: '_type', type: 'bytes32', value: 'bytes32'},
	{ name: 'instrument_id', type: 'bytes32', value: '272' },
	{ name: 'start_range', type: 'bytes32', value: '1605027600000' },
	{ name: 'end_range', type: 'bytes32', value: '1605031200000' },
	{ name: 'time_step', type: 'bytes32', value: '1h' }
];
const showResult = (data) => ethers.utils.parseBytes32String(data);
```

#### Real Digital Asset Index : Get IV Ranking

> :warning: This API is not currently working. Please stand by.

[Web2 Docs](https://gist.github.com/rdaindex/68fe93e19644d83d3da76b218119b3ed#get-apirdaindexcomenterpriseivranking), [Airnode Docs](https://gist.github.com/rdaindex/e01cb50abe88cbf766ea8a53ef8b4819#0x42d949f6ac0a6b8110c53c8b80f1895651f966b6646a645eff797c9ae884aca5)

```javascript
const apiProviderId = "0xf2e72b2362478bf542101f0b2cdbac92bcfa54a2c47deecadd9688470837e9d6";
const endpointId = "0x42d949f6ac0a6b8110c53c8b80f1895651f966b6646a645eff797c9ae884aca5";
const requestParams = [
  { name: '_path', type: 'bytes32', value: '1.marketivlevelAsset.asset.name'},
  { name: '_type', type: 'bytes32', value: 'bytes32'}];
const showResult = (data) => ethers.utils.parseBytes32String(data) + " name";
```

#### Twelve Data : Get Quote

> :warning: This API is not currently working. Please stand by.

[Web2 Docs](https://twelvedata.com/docs#quote), [Airnode Docs](https://gist.github.com/midasSSS/7e49c95024212d0e4f3e0a7c58f2b14f#0x1b0e1584305a8bca993cdbad1ccae231e38d539b1dbcc1fdc532e921edd1f822)

```javascript
const apiProviderId = "0x5adf9ca6515f595e5441c7b4617aebdd5b8db81781d4a399e5406f03d241a5fc";
const endpointId = "0x1b0e1584305a8bca993cdbad1ccae231e38d539b1dbcc1fdc532e921edd1f822";
const requestParams = [
	{ name: '_path', type: 'bytes32', value: 'open'},
	{ name: '_type', type: 'bytes32', value: 'bytes32'},
	{ name: 'symbol', type: 'bytes32', value: 'AAPL' }
];
const showResult = (data) => "$" + ethers.utils.parseBytes32String(data) + " open price";
```
