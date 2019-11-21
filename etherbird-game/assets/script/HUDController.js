const HUDController = cc.Class({
  extends: cc.Component,

  properties: {
    accountText: cc.Label,
    balanceText: cc.Label
  },

  statics: {
    instance: null
  },

  onLoad() {
    HUDController.instance = this;
  },

  start() {},

  // update (dt) {},

  updateAccountText(address) {
    this.accountText.string = cc.js.formatStr('Account: %s', address);
  },

  updateBalanceText(balance) {
    this.balanceText.string = cc.js.formatStr('Balance: %d ETH', balance);
  }
});
