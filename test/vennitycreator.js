const truffleAssert = require('truffle-assertions');
const VennityCreator = artifacts.require("./VennityCreator.sol");
const VenProxy = artifacts.require("VenProxy")

contract("VennityCreator", accounts => {
  it("...should deploy proxy with VennityCreator address for implementation", async () => {
    const cURI = 'http://gateway.pinata.cloud/ipfs/QmPVyfBmV1XbP7cXRkYt65hC4FPoeLvjGfUSk9SoytBD9C'

    const vennityCreatorInstance = await VennityCreator.deployed()
    const venProxyInstance = await VenProxy.new(vennityCreatorInstance.address, cURI)

    assert.equal(vennityCreatorInstance.address, await venProxyInstance.implementation())

    const proxyImpl = await VennityCreator.at(venProxyInstance.address)
    assert.equal(await proxyImpl.contractURI(), cURI)

  })

})
