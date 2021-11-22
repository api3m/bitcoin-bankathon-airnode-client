const accounting = {
  wallet: null,
  balance: null,
  totalSpent: ethers.BigNumber.from("0"),
  time: Date.now()
};

function weiToEth(wei, precision = 6) {
  return Number(ethers.utils.formatEther(wei)).toFixed(precision);
}

function accountForWallet(wallet) {
  accounting.wallet = wallet;
}

function getTotalSpent() {
  return accounting.totalSpent;
}

async function logStep(logLine) {
  const newTime = Date.now();
  const newBalance = await accounting.wallet.getBalance();
  if (accounting.balance === null) {
    accounting.balance = newBalance;
  }
  const spent = accounting.balance.sub(newBalance);
  const spentNanoRBTC = spent.div(ethers.BigNumber.from("1000000000"));
  const newBalanceRBTC = weiToEth(newBalance);
  const elapsed = ((newTime - accounting.time) / 1000).toFixed(2);
  const accountingLine = `--- spent ${spentNanoRBTC} nanoRBTC, have ${newBalanceRBTC} RBTC (${elapsed}s)`;
  accounting.balance = newBalance;
  accounting.totalSpent = accounting.totalSpent.add(spent);
  accounting.time = Date.now();
  console.log(logLine);
  console.log(accountingLine);
}

module.exports = {
  weiToEth: weiToEth,
  accountForWallet: accountForWallet,
  logStep: logStep,
  getTotalSpent: getTotalSpent
};
