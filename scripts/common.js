global.weiToEthFixedNumber = function(wei) {
  return (wei.div(ethers.BigNumber.from("1000000000")).toNumber() / 1e9).toFixed(6);
}
