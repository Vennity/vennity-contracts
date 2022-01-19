/* External imports */
import { ethers } from 'hardhat'
import {
  Wallet
} from 'ethers'
import 'dotenv/config'

/* Internal imports */

let provider = new ethers.providers.JsonRpcProvider(
  process.env.INFURA_URL
)

let privateKey1: string = process.env.PRIVATE_KEY as string
let l1Wallet1: Wallet = new ethers.Wallet(privateKey1, provider)
// let matic: MaticToken


async function main() {

  console.log('wallet', l1Wallet1)

  const balance = await l1Wallet1.getBalance()
  console.log('balance', balance)

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
