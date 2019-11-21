const Flappy = artifacts.require('Flappy');
const Flappy2 = artifacts.require('Flappy2');

module.exports = function(deployer) {
  deployer.deploy(Flappy);
  deployer.deploy(Flappy2);
};
