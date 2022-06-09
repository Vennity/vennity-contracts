const VennityCreator = artifacts.require("VennityCreator");

module.exports = function (deployer) {
  deployer.deploy(VennityCreator);
};
