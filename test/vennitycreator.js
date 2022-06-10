const truffleAssert = require('truffle-assertions');
const VennityCreator = artifacts.require("./VennityCreator.sol");
const VenProxy = artifacts.require("VenProxy")

contract("VennityCreator", accounts => {
  it("...should deploy proxy with VennityCreator address for implementation", async () => {
    const vennityCreatorInstance = await VennityCreator.deployed()
    const venProxyInstance = await VenProxy.new(vennityCreatorInstance.address)

    assert.equal(vennityCreatorInstance.address, await venProxyInstance.implementation())
  })

})
