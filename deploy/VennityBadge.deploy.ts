import { HardhatRuntimeEnvironment } from 'hardhat/types'
import {DeployFunction} from 'hardhat-deploy/types'
import { ethers } from 'ethers'
import { v4 as uuidv4 } from 'uuid'

// Just a standard hardhat-deploy deployment definition file!
async function deployVennityBadge(hre: HardhatRuntimeEnvironment) {
  const { deployments /*, getNamedAccounts*/ } = hre
  const { deploy } = deployments
  // const { deployer } = await getNamedAccounts()

  let kovanProvider = new ethers.providers.JsonRpcProvider(process.env.INFURA_KOVAN_URL)
  let privateKey1 = process.env.KOVAN_WALLET_PRIVATE_KEY_1 as string
  let l1Wallet1 = new ethers.Wallet(privateKey1, kovanProvider)

  await deploy('VennityBadge', {
    // from: deployer,
    from: l1Wallet1.address,
    args: [],
    log: true,
    gasPrice: ethers.BigNumber.from('0'),
    gasLimit: 8999999
  })
}

deployVennityBadge.tags = [ 'VennityBadge' ]
export default deployVennityBadge
