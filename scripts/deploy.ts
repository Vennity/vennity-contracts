/* External imports */
import { ethers } from 'hardhat'
import {
  BigNumber,
  Wallet
} from 'ethers'
import 'dotenv/config'

/* Internal imports */
import { VennityCollectionFactory } from '../types/VennityCollectionFactory'
import { MaticToken } from '../types/MaticToken'

let mumbaiProvider = new ethers.providers.JsonRpcProvider(
    process.env.INFURA_MUMBAI_URL
)

let privateKey1: string = process.env.METAMASK_WALLET_PRIVATE_KEY_1 as string
let l1Wallet1: Wallet = new ethers.Wallet(privateKey1, mumbaiProvider)
let matic: MaticToken
const adminAddress = l1Wallet1.address

let CollectionFactory: VennityCollectionFactory
let adminMaticBalanceBefore: BigNumber,
    adminMaticBalanceAfter: BigNumber,

const MATIC_PRICE = 1

async function main() {
    matic = await ethers.getContractAt(
        'IERC20',
        '0x0000000000000000000000000000000000001010'
      ) as MaticToken

    const Factory__VennityCollectionFactory = await ethers.getContractFactory(
        'VennityCollectionFactory'
      )

      adminMaticBalanceBefore = await matic.balanceOf(adminAddress)

      CollectionFactory = await Factory__VennityCollectionFactory
        .connect(l1Wallet1)
        .deploy() as VennityCollectionFactory

      let awaitDeployedVennityCollectionFactory = await CollectionFactory
        .deployTransaction.wait()

      console.log(
        'VennityCollectionFactory contract address: ',
        CollectionFactory.address
      )

      console.log(
        'Gas used to deploy VennityCollectionFactory contract: ',
        awaitDeployedVennityCollectionFactory.gasUsed.toString(),
        ' gas'
      )

      adminMaticBalanceAfter = await matic.balanceOf(adminAddress)

      // Log MATIC balance spent to deploy contract
      console.log(
        'Amount of MATIC tokens spent by admin to deploy VennityCollectionFactory contract: ',
        adminMaticBalanceBefore
          .sub(adminMaticBalanceAfter)
          .mul(MATIC_PRICE)
          .toString()
      )

}