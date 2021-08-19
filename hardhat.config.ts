import { HardhatUserConfig } from "hardhat/config";
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import 'hardhat-gas-reporter'
import 'dotenv/config'

const config: HardhatUserConfig = {
  networks: {
    kovan: {
      url: process.env.INFURA_KOVAN_URL
    },
    mumbai: {
      url: process.env.INFURA_MUMBAI_URL
    },
    rinkeby: {
      url: process.env.INFURA_RINKEBY_URL
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.8.4',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      },
      {
        version: '0.5.2',
      },
    ]
  },
  gasReporter: {
    currency: 'USD',
    gasPrice: 1.2, // Note: 5 this is Matic's current `fast` gasPrice
  },
  typechain: {
    outDir: './types',
    target: 'ethers-v5',
  },
  mocha: {
    timeout: 100000
  },
}

export default config