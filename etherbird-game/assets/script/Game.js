var PipeManager = require('PipeManager');
var Bird = require('Bird');
var Scroller = require('Scroller');
var Web3Controller = require('Web3Controller');
const USING_KEY = 'usingBirdId';

cc.Class({
  extends: cc.Component,

  properties: {
    goldScore: 30,
    silverScore: 10,
    pipeManager: PipeManager,
    allBirds: [Bird],
    bird: Bird,
    scoreLabel: cc.Label,
    maskLayer: {
      default: null,
      type: cc.Node
    },
    ground: {
      default: null,
      type: cc.Node
    },
    readyMenu: {
      default: null,
      type: cc.Node
    },
    gameOverMenu: {
      default: null,
      type: cc.Node
    },
    scoreAudio: {
      default: null,
      type: cc.AudioClip
    },
    swooshingAudio: {
      default: null,
      type: cc.AudioClip
    }
  },

  onLoad() {
    this.score = 0;
    this.scoreLabel.string = this.score;
    this.ready = false;
  },

  update(dt) {
    if (this.ready) return;
    if (Web3Controller.instance.Contract) {
      Web3Controller.instance.fetchUsingBird().then(usingBirdId => {
        this.bird = this.allBirds[usingBirdId];
        for (var i = 0; i < this.allBirds.length; i++) {
          this.allBirds[i].node.active = usingBirdId == i;
        }
        this.bird.init(this);
        this.enableInput(true);
        this.revealScene();
        this.ready = true;
      });
    }
  },

  revealScene() {
    this.maskLayer.active = true;
    this.maskLayer.color = cc.Color.BLACK;
    this.maskLayer.runAction(cc.fadeOut(0.3));
  },

  gameStart() {
    this.hideReadyMenu();
    this.pipeManager.startSpawn();
    this.bird.startFly();
  },

  gameOver() {
    this.pipeManager.reset();
    this.ground.getComponent(Scroller).stopScroll();
    this.enableInput(false);
    this.blinkOnce();
    this.showGameOverMenu();
  },

  gainScore() {
    this.score++;
    this.scoreLabel.string = this.score;
    cc.audioEngine.playEffect(this.scoreAudio);
  },

  hideReadyMenu() {
    this.scoreLabel.node.runAction(cc.fadeIn(0.3));
    this.readyMenu.runAction(
      cc.sequence(
        cc.fadeOut(0.5),
        cc.callFunc(() => {
          this.readyMenu.active = false;
        }, this)
      )
    );
  },

  blinkOnce() {
    this.maskLayer.color = cc.Color.WHITE;
    this.maskLayer.runAction(cc.sequence(cc.fadeTo(0.1, 200), cc.fadeOut(0.1)));
  },

  showGameOverMenu() {
    this.scoreLabel.node.runAction(
      cc.sequence(
        cc.fadeOut(0.3),
        cc.callFunc(() => {
          this.scoreLabel.active = false;
        }, this)
      )
    );

    let gameOverNode = this.gameOverMenu.getChildByName('gameOverLabel');
    let resultBoardNode = this.gameOverMenu.getChildByName('resultBoard');
    let startButtonNode = this.gameOverMenu.getChildByName('startButton');
    let backButtonNode = this.gameOverMenu.getChildByName('backButton');
    let currentScoreNode = resultBoardNode.getChildByName('currentScore');
    let bestScoreNode = resultBoardNode.getChildByName('bestScore');
    let medalNode = resultBoardNode.getChildByName('medal');

    const KEY_BEST_SCORE = 'bestScore';
    let bestScore = cc.sys.localStorage.getItem(KEY_BEST_SCORE);
    if (bestScore === 'null' || this.score > bestScore) {
      bestScore = this.score;
    }
    cc.sys.localStorage.setItem(KEY_BEST_SCORE, bestScore);

    currentScoreNode.getComponent(cc.Label).string = this.score;
    bestScoreNode.getComponent(cc.Label).string = bestScore;

    if (this.score >= this.silverScore) {
      Web3Controller.instance.endGameTx(this.score);
    }

    let showMedal = (err, spriteFrame) => {
      if (this.score >= this.goldScore) {
        medalNode.getComponent(cc.Sprite).spriteFrame = spriteFrame._spriteFrames.medal_gold;
      } else if (this.score >= this.silverScore) {
        medalNode.getComponent(cc.Sprite).spriteFrame = spriteFrame._spriteFrames.medal_silver;
      } else {
        medalNode.getComponent(cc.Sprite).spriteFrame = null;
      }
    };

    cc.loader.loadRes('image/res_bundle', cc.SpriteAtlas, showMedal);

    var showNode = (node, action, callback) => {
      startButtonNode.active = true;
      backButtonNode.active = true;
      cc.audioEngine.playEffect(this.swooshingAudio);
      node.runAction(
        cc.sequence(
          action,
          cc.callFunc(() => {
            if (callback) {
              callback();
            }
          }, this)
        )
      );
    };
    this.gameOverMenu.active = true;
    let showNodeFunc = () =>
      showNode(
        gameOverNode,
        cc.spawn(
          cc.fadeIn(0.2),
          cc.sequence(cc.moveBy(0.2, cc.v2(0, 10)), cc.moveBy(0.5, cc.v2(0, -10)))
        ),
        () =>
          showNode(
            resultBoardNode,
            cc.moveTo(0.5, cc.v2(resultBoardNode.x, -250)).easing(cc.easeCubicActionOut()),
            () => showNode(startButtonNode, cc.fadeIn(0.5))
          )
      );
    this.scheduleOnce(showNodeFunc, 0.55);
  },

  startGameOrJumpBird() {
    if (this.bird.state === Bird.State.Ready) {
      this.gameStart();
    } else {
      this.bird.rise();
    }
  },

  enableInput(enable) {
    if (enable) {
      this.node.on(cc.Node.EventType.TOUCH_START, this.startGameOrJumpBird, this);
      cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.startGameOrJumpBird, this);
    } else {
      this.node.off(cc.Node.EventType.TOUCH_START, this.startGameOrJumpBird, this);
      cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.startGameOrJumpBird, this);
    }
  },

  backToHome() {
    cc.audioEngine.playEffect(this.swooshingAudio);
    this.maskLayer.color = cc.Color.BLACK;
    this.maskLayer.runAction(
      cc.sequence(
        cc.fadeIn(0.3),
        cc.callFunc(() => {
          cc.director.loadScene('entrance');
        }, this)
      )
    );
  }
});
