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
    polygonMainnet: {
      url: process.env.INFURA_POLYGON_MAINNET_URL
    },
    optimisticMainnet: {
      url: process.env.INFURA_OPTIMISTIC_MAINNET_URL,
    },
    optimisticKovan: {
      url: 'https://kovan.optimism.io',
    }
  },
  solidity: {
    compilers: [
      {
        version: '0.8.9',
      },
      {
        version: '0.8.4',
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