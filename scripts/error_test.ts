/* External imports */
import { ethers } from 'hardhat'
import {
  BigNumber,
  Wallet
} from 'ethers'
import 'dotenv/config'

/* Internal imports */
import {MaticToken} from "../types";

let provider = new ethers.providers.JsonRpcProvider(
  process.env.INFURA_URL
)

let privateKey1: string = process.env.PRIVATE_KEY as string
let l1Wallet1: Wallet = new ethers.Wallet(privateKey1, provider)
const adminAddress = l1Wallet1.address

let matic: MaticToken
let adminMaticBalanceBefore: BigNumber

async function main() {
  console.log('wallet', l1Wallet1)

  matic = await ethers.getContractAt(
    'IERC20',
    '0x0000000000000000000000000000000000001010'
  ) as MaticToken

  console.log('matic', matic)

  const balance = await l1Wallet1.getBalance()
  // works
  console.log('balance', balance)

  // sometimes does not work,
  adminMaticBalanceBefore = await matic.balanceOf(adminAddress)
  console.log('adminMaticBalanceBefore', adminMaticBalanceBefore)

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
