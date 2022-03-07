/* External imports */
import {ethers} from 'hardhat'
import {BigNumber, Wallet} from 'ethers'
import 'dotenv/config'

/* Internal imports */
import {MaticToken, VennityCollectionFactory} from '../types'

let mumbaiProvider = new ethers.providers.JsonRpcProvider(
  process.env.INFURA_URL
)

let privateKey1: string = process.env.PRIVATE_KEY as string
let l1Wallet1: Wallet = new ethers.Wallet(privateKey1, mumbaiProvider)
let matic: MaticToken
const adminAddress = l1Wallet1.address

let CollectionFactory: VennityCollectionFactory
let adminMaticBalanceBefore: BigNumber,
  adminMaticBalanceAfter: BigNumber

const MATIC_PRICE = 1

async function main() {

  matic = await ethers.getContractAt(
    'IERC20',
    '0x0000000000000000000000000000000000001010'
  ) as MaticToken
  console.log('deploying from address', adminAddress)
  adminMaticBalanceBefore = await l1Wallet1.getBalance()
  console.log('balance before', adminMaticBalanceBefore)

  const Factory__VennityCollectionFactory = await ethers.getContractFactory(
    'VennityCollectionFactory'
  )


  console.log('deploying contract...')
  CollectionFactory = await Factory__VennityCollectionFactory
    .connect(l1Wallet1)
    .deploy() as VennityCollectionFactory

  console.log('submitted deployment', CollectionFactory)

  console.log('waiting for confirmation')

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

  adminMaticBalanceAfter = await l1Wallet1.getBalance()
  console.log('balance after', adminMaticBalanceAfter)

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
