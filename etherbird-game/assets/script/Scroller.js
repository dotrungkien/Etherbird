cc.Class({
  extends: cc.Component,

  properties: {
    speed: -300,
    resetX: -300
  },

  onLoad() {
    this.canScroll = true;
  },

  update(dt) {
    if (!this.canScroll) {
      return;
    }
    this.node.x += this.speed * dt;
    if (this.node.x <= this.resetX) {
      this.node.x -= this.resetX;
    }
  },

  stopScroll() {
    this.canScroll = false;
  },

  startScroll() {
    this.canScroll = true;
  }
});
