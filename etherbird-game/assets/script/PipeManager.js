const PipeGroup = require('PipeGroup');

cc.Class({
  extends: cc.Component,

  properties: {
    pipePrefab: cc.Prefab,
    pipeMoveSpeed: -300,
    pipeSpacing: 400
  },

  onLoad() {
    this.pipeList = [];
    this.pipeIsRunning = false;
    this.pipePool = new cc.NodePool();
  },

  startSpawn() {
    this.spawnPipe();
    let spawnInterval = Math.abs(this.pipeSpacing / this.pipeMoveSpeed);
    this.schedule(this.spawnPipe, spawnInterval);
    this.pipeIsRunning = true;
  },

  spawnPipe() {
    let pipeGroup = null;

    if (this.pipePool.size() > 0) {
      pipeGroup = this.pipePool.get().getComponent(PipeGroup);
    } else {
      pipeGroup = cc.instantiate(this.pipePrefab).getComponent(PipeGroup);
    }
    this.node.addChild(pipeGroup.node);
    pipeGroup.node.active = true;
    pipeGroup.init(this);
    this.pipeList.push(pipeGroup);
  },

  recyclePipe(pipe) {
    pipe.node.active = false;
    this.pipePool.put(pipe.node);
  },

  getNext() {
    return this.pipeList.shift();
  },

  reset() {
    this.unschedule(this.spawnPipe);
    this.pipeList = [];
    this.pipeIsRunning = false;
  }
});
