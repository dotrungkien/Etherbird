const HUDController = require('HUDController');
const Web3 = require('web3.min');
const PRICE_PER_OPEN = '1'; //finney
const GAS_PRICE_DEFAULT = '20000000000';

const Web3Controller = cc.Class({
  extends: cc.Component,

  properties: {
    Web3: null,
    Web3Provider: null,
    Web3ProviderName: 'metamask',
    Contract: null,
    ContractABI: cc.JsonAsset,
    NetworkID: '123456789',
    CurrentAccount: 'NA',
    swooshingAudio: {
      default: null,
      type: cc.AudioClip
    },
    maskLayer: {
      default: null,
      type: cc.Node
    },
    txConfirm: cc.Node,
    playButton: cc.Node,
    settingButton: cc.Node
  },

  statics: {
    instance: null
  },

  onLoad() {
    Web3Controller.instance = this;
    this.initWeb3();
    this.txConfirm.active = false;
  },

  start() {},

  initWeb3() {
    const isWeb3Enabled = () => !!window.web3;
    if (isWeb3Enabled()) {
      this.Web3 = new Web3();

      //Request account access for modern dapp browsers
      if (window.ethereum) {
        this.Web3Provider = window.ethereum;
        this.Web3.setProvider(this.Web3Provider);
        window.ethereum
          .enable()
          .then(accounts => {
            this.initAccount();
            // this.initContract();
          })
          .catch(error => {
            console.error(error);
          });
      }
      //Request account access for legacy dapp browsers
      else if (window.web3) {
        this.Web3Provider = window.web3.currentProvider;
        this.Web3.setProvider(this.Web3Provider);

        this.initAccount();
        // this.initContract();
      }
    } else {
      console.error('You must enable and login into your Wallet or MetaMask accounts!');
    }
  },

  //Init current account address
  initAccount() {
    this.Web3.eth.getAccounts().then(accounts => {
      if (accounts.length > 0) {
        this.CurrentAccount = accounts[0].toLowerCase();
        HUDController.instance.updateAccountText(this.CurrentAccount);
        this.initContract();
        this.updateBalance();
      } else console.error('You must enable and login into your Wallet or MetaMask accounts!');
    });
  },

  initContract() {
    let networks = { main: '1', ropsten: '3', kovan: '42', rinkeby: '4' };
    this.Web3.eth.net.getNetworkType().then(netId => {
      this.Contract = new this.Web3.eth.Contract(
        this.ContractABI.json.abi,
        this.ContractABI.json.networks[networks[netId]].address
        // this.ContractABI.json.networks['123456789'].address
      );
    });
  },

  //Init current account balance
  updateBalance() {
    this.Web3.eth.getBalance(this.CurrentAccount, (err, balance) => {
      if (err) {
        console.error(err);
        return;
      }

      HUDController.instance.updateBalanceText(this.fromWei(balance));
    });
  },

  fetchBirds() {
    return new Promise((resolve, reject) => {
      this.Contract.methods
        .getMyBirds()
        .call({ from: this.CurrentAccount })
        .then(birds => {
          resolve(birds);
        })
        .catch(err => {
          console.error(err);
          reject();
        });
    });
  },
  fetchUsingBird() {
    return new Promise((resolve, reject) => {
      this.Contract.methods
        .getUsingBird()
        .call({ from: this.CurrentAccount })
        .then(birdId => {
          resolve(birdId);
        })
        .catch(err => {
          console.error(err);
          reject();
        });
    });
  },
  useBird(birdId) {
    this.txConfirm.active = true;
    console.log('Start using birdId = ', birdId);
    return new Promise((resolve, reject) => {
      this.Contract.methods
        .useBird(birdId)
        .send({
          from: this.CurrentAccount,
          gas: 250000,
          gasPrice: GAS_PRICE_DEFAULT
        })
        .on('transactionHash', hash => {
          console.log('transactionHash: ', hash);
        })
        .on('receipt', receipt => {
          console.log('receipt: ', receipt);
          this.txConfirm.active = false;
          resolve();
        })
        .on('error', error => {
          console.error('use bird error: ', error);
          this.txConfirm.active = false;
          reject();
        });
    });
  },

  purchase(birdId, price) {
    this.txConfirm.active = true;
    return new Promise((resolve, reject) => {
      this.Contract.methods
        .purchase(birdId)
        .send({
          from: this.CurrentAccount,
          value: this.Web3.utils.toWei(price, 'ether'),
          gas: 250000,
          gasPrice: GAS_PRICE_DEFAULT
        })
        .on('transactionHash', hash => {
          console.log('transactionHash: ', hash);
        })
        .on('receipt', receipt => {
          console.log('receipt: ', receipt);
          this.updateBalance();

          this.txConfirm.active = false;
          resolve();
        })
        .on('error', error => {
          console.error('purchase error: ', error);
          this.txConfirm.active = false;
          reject();
        });
    });
  },

  playTx() {
    this.txConfirm.active = true;
    this.playButton.active = false;
    this.settingButton.active = false;
    this.Contract.methods
      .play()
      .send({
        from: this.CurrentAccount,
        value: this.Web3.utils.toWei(PRICE_PER_OPEN, 'finney'),
        gas: 250000,
        gasPrice: GAS_PRICE_DEFAULT
      })
      .on('transactionHash', hash => {
        console.log('transactionHash: ', hash);
      })
      .on('receipt', receipt => {
        console.log('receipt: ', receipt);
        this.updateBalance();
        this.startGame();
        this.txConfirm.active = false;
        this.playButton.active = true;
        this.settingButton.active = true;
      })
      .on('error', error => {
        console.error('play error: ', error);
        this.txConfirm.active = false;
        this.playButton.active = true;
        this.settingButton.active = true;
      });
  },

  restartTx() {
    this.txConfirm.active = true;
    this.Contract.methods
      .play()
      .send({
        from: this.CurrentAccount,
        value: this.Web3.utils.toWei(PRICE_PER_OPEN, 'finney'),
        gas: 250000,
        gasPrice: GAS_PRICE_DEFAULT
      })
      .on('transactionHash', hash => {
        console.log('transactionHash: ', hash);
      })
      .on('receipt', receipt => {
        console.log('receipt: ', receipt);
        this.updateBalance();
        this.restart();
        this.txConfirm.active = false;
        this.playButton.active = true;
        this.settingButton.active = true;
      })
      .on('error', error => {
        console.error('restart error: ', error);
        this.txConfirm.active = false;
      });
  },

  endGameTx(score) {
    this.txConfirm.active = true;
    this.Contract.methods
      .endGame(score)
      .send({
        from: this.CurrentAccount,
        gas: 250000,
        gasPrice: GAS_PRICE_DEFAULT
      })
      .on('transactionHash', hash => {
        console.log('transactionHash: ', hash);
      })
      .on('receipt', receipt => {
        console.log('receipt: ', receipt);
        this.updateBalance();
        this.txConfirm.active = false;
      })
      .on('error', error => {
        console.error('endgame error: ', error);
        this.txConfirm.active = false;
      });
  },

  fromWei(value) {
    return parseInt(this.Web3.utils.fromWei(value, 'ether'));
  },

  startGame() {
    console.log('======START GAME======');
    cc.audioEngine.playEffect(this.swooshingAudio);
    this.maskLayer.active = true;
    this.maskLayer.opacity = 0;
    this.maskLayer.color = cc.Color.BLACK;
    this.maskLayer.runAction(
      cc.sequence(
        cc.fadeIn(0.2),
        cc.callFunc(() => {
          cc.director.loadScene('game');
        }, this)
      )
    );
  },

  restart() {
    cc.audioEngine.playEffect(this.swooshingAudio);
    this.maskLayer.color = cc.Color.BLACK;
    this.maskLayer.runAction(
      cc.sequence(
        cc.fadeIn(0.3),
        cc.callFunc(() => {
          cc.director.loadScene('game');
        }, this)
      )
    );
  }
});

module.exports = Web3Controller;
