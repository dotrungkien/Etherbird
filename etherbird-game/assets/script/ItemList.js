var Shop = require('Shop');
var ShopItem = require('ShopItem');
var Web3Controller = require('Web3Controller');

var Item = cc.Class({
  name: 'Item',
  properties: {
    id: 0,
    itemName: 'bird-x',
    price: '0',
    icon: cc.SpriteFrame
  }
});

const ItemList = cc.Class({
  extends: cc.Component,

  properties: {
    items: {
      default: [],
      type: Item
    },
    shopItems: {
      default: [],
      type: ShopItem
    },
    shop: Shop,
    shopPanel: cc.Node,
    itemPrefab: cc.Prefab,
    buyButton: cc.Button,
    useButton: cc.Button,
    startButton: cc.Node
  },

  onLoad() {
    this.ownedBirds = [];
    this.usingBirdId = 0;
    this.ready = false;
  },

  onEnable() {
    console.log(`onEnable, setting up the birds`);
    this.fetchAndUpdateBirdData();
  },
  onDisable() {
    console.log('onDisable');
    this.buyButton.active = true;
  },

  update(dt) {
    if (this.ready) return;
    if (Web3Controller.instance.Contract) {
      this.ready = true;
      this.init();
    }
  },

  fetchAndUpdateBirdData() {
    Web3Controller.instance.fetchBirds().then(fetchedBirds => {
      this.ownedBirds = fetchedBirds;
      Web3Controller.instance.fetchUsingBird().then(usingBirdId => {
        this.usingBirdId = usingBirdId;
        this.selectedBirdId = this.usingBirdId;

        this.updateShopItems();
      });
    });
  },

  init() {
    // console.log('=========== INIT SHOP============');
    Web3Controller.instance.fetchBirds().then(fetchedBirds => {
      this.ownedBirds = fetchedBirds;
      // console.log(this.ownedBirds);
      Web3Controller.instance.fetchUsingBird().then(usingBirdId => {
        this.usingBirdId = usingBirdId;
        // console.log(this.usingBirdId);
        this.shopItems = [];
        for (var i = 0; i < this.items.length; ++i) {
          var item = cc.instantiate(this.itemPrefab).getComponent(ShopItem);
          var data = this.items[i];
          this.node.addChild(item.node);
          item.owned = this.ownedBirds[i];

          item.init({
            id: data.id,
            itemName: data.itemName,
            price: data.price,
            icon: data.icon
          });

          let birdId = data.id;
          item.node.getComponent(cc.Button).node.on(
            'click',
            () => {
              this.selectBird(birdId);
            },
            this
          );
          this.shopItems.push(item);
        }

        let buyBtnClickHandler = new cc.Component.EventHandler();
        buyBtnClickHandler.target = this.node;
        buyBtnClickHandler.component = 'ItemList';
        buyBtnClickHandler.handler = 'buyBirds';
        buyBtnClickHandler.customEventData = this.selectedBirdId;
        this.buyButton.clickEvents.push(buyBtnClickHandler);

        this.useButton.node.on('click', this.useBird, this);

        this.selectBird(this.usingBirdId);
        this.updateShopItems();
      });
    });
    // console.log('=========== INIT SHOP COMPLETED============');
  },

  buyBirds(event, customEventData) {
    const birdId = this.selectedBirdId;
    const price = this.items[birdId].price;
    console.log(`purchasing birdId = ${birdId}, price = ${price}`);
    Web3Controller.instance.purchase(birdId, price).then(() => {
      let shopItem = this.shopItems[birdId].getComponent(ShopItem);
      shopItem.owned = this.ownedBirds[birdId];
      shopItem.price.string = '';
      shopItem.updateStatus();
      this.selectBird(birdId);
      this.buyButton.node.active = false;
      this.useButton.node.active = true;
    });
  },

  useBird() {
    this.usingBirdId = this.selectedBirdId;
    Web3Controller.instance.useBird(this.selectedBirdId).then(() => {
      this.shop.switchBird();
      // this.updateShopItems();
      this.shopPanel.active = false;
      this.startButton.active = true;
    });
  },

  selectBird(birdId) {
    // console.log('select birdID = ', birdId);
    this.selectedBirdId = birdId;
    for (var i = 0; i < this.shopItems.length; i++) {
      // Update other shop yellow color
      let shopItem = this.shopItems[i].getComponent(ShopItem);
      shopItem.onSelected(birdId);
      // update current BUY - USE button
      if (shopItem.id == this.selectedBirdId) {
        let buyable = !this.ownedBirds[i];
        let using = birdId == this.usingBirdId;
        let usable = !buyable && !using;
        this.buyButton.node.active = buyable;
        this.useButton.node.active = usable;
      }
    }
  },

  updateShopItems() {
    for (var i = 0; i < this.ownedBirds.length; i++) {
      let shopItem = this.shopItems[birds[i]].getComponent(ShopItem);
      shopItem.owned = this.ownedBirds[i];
      shopItem.updateStatus();
      // update current BUY - USE button
      if (shopItem.id == this.usingBirdId) {
        let buyable = !this.ownedBirds[i];
        let using = birdId == this.usingBirdId;
        let usable = !buyable && !using;
        this.buyButton.node.active = buyable;
        this.useButton.node.active = usable;
      }
    }
  }
});

module.exports = ItemList;
