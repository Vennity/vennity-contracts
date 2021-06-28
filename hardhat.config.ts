import { HardhatUserConfig } from "hardhat/config";
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import 'hardhat-deploy'

const config: HardhatUserConfig = {
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
      }
    ]
  },
  mocha: {
    timeout: 5000
  }
}

export default config