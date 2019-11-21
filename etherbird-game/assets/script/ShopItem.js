var Web3Controller = require('Web3Controller');

cc.Class({
  extends: cc.Component,

  properties: {
    id: null,
    owned: false,
    itemName: 'bird-x',
    icon: cc.Sprite,
    usingBg: cc.Node,
    price: cc.Label
  },

  init: function(data) {
    this.id = data.id;
    if (data.id == 0) this.owned = true;
    this.itemName = data.itemName;
    this.icon.spriteFrame = data.icon;
    this.price.string = this.owned ? '' : data.price + ' ETH';
    this.updateStatus();
  },

  onSelected(birdId) {
    this.node.color = this.id == birdId ? cc.Color.YELLOW : cc.Color.WHITE;
  },

  updateStatus() {
    if (this.owned) this.price.string = '';
    Web3Controller.instance.fetchUsingBird().then(usingBirdId => {
      this.usingBg.active = this.id == usingBirdId;
    });
  }
});
