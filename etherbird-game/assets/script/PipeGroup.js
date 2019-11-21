cc.Class({
  extends: cc.Component,
  properties: {
    topPipeMinHeight: 150,
    bottomPipeMinHeight: 150,
    spacingMinValue: 150,
    spacingMaxValue: 200,
    topPipe: cc.Node,
    bottomPipe: cc.Node
  },

  init(pipeManager) {
    this.pipeManager = pipeManager;
    this.initPositionX();
    this.initPositionY();
  },

  initPositionX() {
    let visibleSize = cc.find('Canvas');
    let sceneLeft = -visibleSize.width / 2;
    let sceneRight = visibleSize.width / 2;
    this.node.x = sceneRight + 300;
    this.recylceX = sceneLeft - Math.max(this.topPipe.width, this.bottomPipe.width);
  },

  initPositionY() {
    let visibleSize = cc.find('Canvas');
    let topPipeMaxY = visibleSize.height / 2 - this.topPipeMinHeight;
    let bottomPipeMinY = cc.find('Canvas/ground').y + this.bottomPipeMinHeight;
    let spacing =
      this.spacingMinValue + Math.random() * (this.spacingMaxValue - this.spacingMinValue);
    this.topPipe.y = topPipeMaxY - Math.random() * (topPipeMaxY - bottomPipeMinY - spacing);
    this.bottomPipe.y = this.topPipe.y - spacing;
  },

  update(dt) {
    if (!this.pipeManager.pipeIsRunning) return;
    this.node.x += this.pipeManager.pipeMoveSpeed * dt;
    if (this.node.x < this.recylceX) this.pipeManager.recyclePipe(this);
  }
});
