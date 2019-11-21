const State = cc.Enum({
  Ready: -1,
  Rise: -1,
  FreeFall: -1,
  Drop: -1,
  Dead: -1
});

cc.Class({
  statics: {
    State: State
  },

  extends: cc.Component,

  properties: {
    initRiseSpeed: 800,
    gravity: 1000,
    state: {
      default: State.Ready,
      type: State
    },
    ground: {
      default: null,
      type: cc.Node
    },
    riseAudio: {
      default: null,
      type: cc.AudioClip
    },
    dropAudio: {
      default: null,
      type: cc.AudioClip
    },
    hitAudio: {
      default: null,
      type: cc.AudioClip
    }
  },

  onLoad() {
    const manager = cc.director.getCollisionManager();
    manager.enabled = true;
    this.collideWithPipe = false;
    this.collideWithGround = false;
  },

  init(game) {
    this.game = game;
    this.state = State.Ready;
    this.currentSpeed = 0;
    this.anim = this.getComponent(cc.Animation);
    this.anim.playAdditive('birdFlapping');
  },

  startFly() {
    this.getNextPipe();
    this.anim.stop('birdFlapping');
    this.rise();
  },

  getNextPipe() {
    this.nextPipe = this.game.pipeManager.getNext();
  },

  update(dt) {
    if (this.state === State.Ready || this.state === State.Dead) {
      return;
    }
    this.updatePosition(dt);
    this.updateState(dt);
    this.detectCollision();
    this.fixBirdFinalPosition();
  },

  updatePosition(dt) {
    var flying =
      this.state === State.Rise || this.state === State.FreeFall || this.state === State.Drop;
    if (flying) {
      this.currentSpeed -= dt * this.gravity;
      this.node.y += dt * this.currentSpeed;
    }
  },

  updateState(dt) {
    switch (this.state) {
      case State.Rise:
        if (this.currentSpeed < 0) {
          this.state = State.FreeFall;
          this.runFallAction();
        }
        break;
      case State.Drop:
        if (this.collideWithGround) this.state = State.Dead;
        break;
    }
  },
  detectCollision() {
    if (!this.nextPipe) return;
    if (this.state === State.Ready || this.state === State.Dead || this.state === State.Drop)
      return;

    if (this.collideWithPipe || this.collideWithGround) {
      if (this.collideWithGround) {
        this.state = State.Dead;
      } else {
        this.state = State.Drop;
        this.runDropAction();
        this.scheduleOnce(() => {}, 0.3);
      }
      this.anim.stop();
      this.game.gameOver();
    } else {
      let birdLeft = this.node.x;
      let pipeRight = this.nextPipe.node.x + this.nextPipe.topPipe.width;
      let crossPipe = birdLeft > pipeRight;
      if (crossPipe) {
        this.game.gainScore();
        this.getNextPipe();
      }
    }
  },
  fixBirdFinalPosition() {
    if (this.collideWithGround)
      this.node.y = this.ground.y + this.ground.height / 2 + this.node.width / 2;
  },
  onCollisionEnter(other, self) {
    cc.audioEngine.playEffect(this.hitAudio);
    if (other.node.name === 'topPipe' || other.node.name === 'bottomPipe')
      this.collideWithPipe = true;

    if (other.node.name === 'ground') this.collideWithGround = true;
  },

  rise() {
    this.state = State.Rise;
    this.currentSpeed = this.initRiseSpeed;
    this.runRiseAction();
    cc.audioEngine.playEffect(this.riseAudio);
  },

  runRiseAction() {
    this.node.stopAllActions();
    let jumpAction = cc.rotateTo(0.3, -30).easing(cc.easeCubicActionOut());
    this.node.runAction(jumpAction);
  },

  runFallAction(duration = 0.6) {
    this.node.stopAllActions();
    let dropAction = cc.rotateTo(duration, 90).easing(cc.easeCubicActionIn());
    this.node.runAction(dropAction);
  },

  runDropAction() {
    if (this.currentSpeed > 0) {
      this.currentSpeed = 0;
    }
    this.runFallAction(0.4);
  }
});
