var Web3Controller = require('Web3Controller');

cc.Class({
  extends: cc.Component,

  properties: {
    allBirds: [cc.Node],
    shopPanel: cc.Node,
    shopButton: cc.Button,
    backButton: cc.Button,
    startButton: cc.Node
  },

  onLoad() {
    this.ready = false;
    for (var i = 0; i < this.allBirds.length; i++) {
      this.allBirds[i].active = false;
    }
    this.shopButton.node.on('click', this.openShopPanel, this);
    this.backButton.node.on('click', this.closeShopPanel, this);
  },

  update(dt) {
    if (this.ready) return;
    if (Web3Controller.instance.Contract) {
      this.ready = true;
      this.switchBird();
    }
  },

  switchBird() {
    Web3Controller.instance.fetchUsingBird().then(usingBirdId => {
      for (var i = 0; i < this.allBirds.length; i++) {
        this.allBirds[i].active = usingBirdId == i;
      }
    });
  },

  openShopPanel() {
    this.shopPanel.active = true;
    this.startButton.active = false;
  },
  closeShopPanel() {
    this.shopPanel.active = false;
    this.startButton.active = true;
  }
});
