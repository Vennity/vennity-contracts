import { HardhatUserConfig } from "hardhat/config";
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@typechain/hardhat'
import '@eth-optimism/hardhat-ovm'
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
    polygonMainnet: {
      url: process.env.INFURA_POLYGON_MAINNET_URL
    },
    optimisticMainnet: {
      gasPrice: 15_000_000, 
      url: process.env.INFURA_OPTIMISTIC_MAINNET_URL
    },
    optimisticKovan: {
      gasPrice: 15_000_000, 
      url: process.env.INFURA_OPTIMISTIC_KOVAN_URL
    }
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
    currency: 'USD'
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