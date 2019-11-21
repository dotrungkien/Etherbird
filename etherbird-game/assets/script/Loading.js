cc.Class({
  extends: cc.Component,

  properties: {
    sprite: {
      default: null,
      type: cc.Sprite
    }
  },

  start() {
    this.sprite = this.getComponent(cc.Sprite);
    this.sprite.fillRange = 0;
  },

  update(dt) {
    this.sprite.fillRange += 0.01;
    if (this.sprite.fillRange >= 1) {
      this.sprite.fillRange = 0;
    }
  }
});
