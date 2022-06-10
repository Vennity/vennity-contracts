const truffleAssert = require('truffle-assertions');
const VennityCreator = artifacts.require("./VennityCreator.sol");
const VenProxy = artifacts.require("VenProxy")

let vennityCreatorInstance = null
let venProxyInstance = null
let proxyImpl = null
contract("VennityCreator", accounts => {
  it("...should deploy proxy with VennityCreator address for implementation", async () => {
    const cURI = 'http://gateway.pinata.cloud/ipfs/QmPVyfBmV1XbP7cXRkYt65hC4FPoeLvjGfUSk9SoytBD9C'

    vennityCreatorInstance = await VennityCreator.deployed()
    venProxyInstance = await VenProxy.new(vennityCreatorInstance.address, cURI)

    assert.equal(vennityCreatorInstance.address, await venProxyInstance.implementation())

    proxyImpl = await VennityCreator.at(venProxyInstance.address)
    assert.equal(await proxyImpl.contractURI(), cURI)

  })

  it("...should change contract URI", async () => {
    const cURI = 'http://gateway.pinata.cloud/ipfs/different'

    await proxyImpl.setContractURI(cURI)
    assert.equal(await proxyImpl.contractURI(), cURI)

  })

})
