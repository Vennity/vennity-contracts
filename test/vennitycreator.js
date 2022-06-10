const truffleAssert = require('truffle-assertions');
const VennityCreator = artifacts.require("./VennityCreator.sol");
const VenProxy = artifacts.require("VenProxy")

let vennityCreatorInstance = null
let venProxyInstance = null
let proxyImpl = null

contract("VennityCreator", accounts => {
  const adminAccount = accounts[0]
  const userAccount = accounts[1]

  it("...should deploy proxy with VennityCreator address for implementation", async () => {

    console.log('adminAccount', adminAccount)
    console.log('userAccount', userAccount)

    const cURI = 'http://gateway.pinata.cloud/ipfs/QmPVyfBmV1XbP7cXRkYt65hC4FPoeLvjGfUSk9SoytBD9C'

    vennityCreatorInstance = await VennityCreator.new()
    console.log('vennityCreatorInstance owner', await vennityCreatorInstance.owner())
    venProxyInstance = await VenProxy.new(vennityCreatorInstance.address, cURI, userAccount, {from: adminAccount})
    assert.equal(vennityCreatorInstance.address, await venProxyInstance.implementation())

    proxyImpl = await VennityCreator.at(venProxyInstance.address)
    assert.equal(userAccount, await proxyImpl.owner())
    assert.equal(true, await proxyImpl.isAdmin(adminAccount))

    assert.equal(await proxyImpl.contractURI(), cURI)

  })

  it("...should change contract URI", async () => {
    const cURI = 'http://gateway.pinata.cloud/ipfs/different'

    await proxyImpl.setContractURI(cURI)
    assert.equal(await proxyImpl.contractURI(), cURI)

  })

})
