/* External imports */
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {
  BigNumber,
  ContractReceipt,
  ContractTransaction,
  providers,
  utils,
  Wallet
} from 'ethers'
import { v4 as uuidv4 } from 'uuid'
import 'dotenv/config'

/* Internal imports */
import { VennityNFT } from '../types/VennityNFT'


/**
 * @dev This is a deployment script for Polygon Mainnet!
 */
describe(`VennityNFT (Optimistic Kovan)`, () => {
  const TOKEN_UUID_0 = uuidv4()
  const TOKEN_NAME_0 = 'VennityNFT 0th Edition'
  const TOKEN_AMOUNT_0 = 100
  // Token uris
  const TOKEN_URI_0 = 'ipfs://bafybeif5sp7bver5s25g4riysghkv2kdccousxo2gciid3r7sjdq4oj45y'
  const TOKEN_URI_1 = 'ipfs://bafybeih23ccdankvx33wjqacsolzrsoqwpa6fmhj4rqy4g3xnxrgk7rjpm'
  const TOKEN_URI_2 = 'ipfs://bafybeiebpwqcewopw3xkt335kdzw5dimvwmz5yfseidy5d2cpmi4o4hrma'


  let receipt: ContractReceipt

  let optimisticKovanProvider = new ethers.providers.JsonRpcProvider(
    'https://kovan.optimism.io'
  )

  let privateKey1: string = process.env.METAMASK_WALLET_PRIVATE_KEY_1 as string
  let privateKey2: string = process.env.METAMASK_WALLET_PRIVATE_KEY_2 as string

  let l1Wallet1: Wallet = new ethers.Wallet(privateKey1, optimisticKovanProvider)
  let l1Wallet2: Wallet = new ethers.Wallet(privateKey2, optimisticKovanProvider)

  const adminAddress = l1Wallet1.address
  const recipientAddress = l1Wallet2.address

  let adminBalanceBefore: BigNumber,
    adminBalanceAfter: BigNumber,
    recipientBalanceBefore: BigNumber,
    recipientBalanceAfter: BigNumber

  before(`inspect Optimistic ETH balances: `, async () => {
    console.log(
      'First Optimistic Kovan wallet: ',
      (await l1Wallet1.getBalance()).toString()
    )
    console.log(
      'Second Optimistic Kovan wallet: ',
      (await l1Wallet2.getBalance()).toString()
    )
  })

  describe(`VennityNFT NFT`, () => {
    describe(`VennityNFT 0th Edition`, () => {
      let mintTx0: ContractTransaction,
        mintTx1: ContractTransaction,
        mintTx2: ContractTransaction

      let VennityNFT: VennityNFT

      before(`deploy VennityNFT contract and mint ERC1155 tokens`, async () => {
        const Factory__VennityNFTFactory = await ethers.getContractFactory(
          'VennityNFT'
        )

        adminBalanceBefore = await l1Wallet1.getBalance()

        VennityNFT = await Factory__VennityNFTFactory
          .connect(l1Wallet1)
          .deploy({ gasLimit: 100_000 }) as VennityNFT

        let awaitDeployedVennityNFT = await VennityNFT.deployTransaction.wait()

        console.log(
          'First VennityNFT contract address: ',
          VennityNFT.address
        )

        console.log(
          'Gas used to deploy 1st VennityNFT contract: ',
          awaitDeployedVennityNFT.gasUsed.toString(),
          ' gas'
        )

        adminBalanceAfter = await l1Wallet1.getBalance()

        // Log ETH balance spent to deploy contract
        console.log(
          'Amount of ETH tokens spent by admin to deploy contract: ',
          adminBalanceBefore.sub(adminBalanceAfter).toString()
        )

        adminBalanceBefore = await l1Wallet1.getBalance()

        /**
         * @todo Throws a CALL_EXCEPTION error
         */
        mintTx0 = await VennityNFT
          .connect(l1Wallet1)
          ._mint(
            l1Wallet1.address,
            TOKEN_NAME_0,
            TOKEN_URI_0,
            TOKEN_AMOUNT_0,
            TOKEN_UUID_0,
            { gasLimit: 100_000 }
          )

        /**
         * @todo Receipt never gets returned.
         */
        receipt = await mintTx0.wait()

        adminBalanceAfter = await l1Wallet1.getBalance()

        console.log(
          'Gas used to call _mint: ',
          receipt.gasUsed.toString(),
          ' gas'
        )

        // Log ETH balance spent to deploy contract
        console.log(
          'Amount of ETH tokens spent by admin to call `_mint` 1 time: ',
          adminBalanceBefore.sub(adminBalanceAfter).toString()
        )
      })

      let tokenID0: BigNumber

      it(`should have created new VennityNFT contract and minted 1 set of an ERC1155 token with a name and token URI`, async () => {
        let eventArgs = receipt.events?.filter((x) => {
          return x.event == 'VennityNFTMinted'
        })[0].args

        let VennityTokenUUID: string = eventArgs
          ? eventArgs[1].tokenUUID
          : undefined
        let VennityTokenURI: string = eventArgs
          ? eventArgs[1].tokenURI
          : undefined

        expect(VennityTokenUUID).to.eq(TOKEN_UUID_0)
        expect(VennityTokenURI).to.eq(TOKEN_URI_0)
      })

      it(`should have minted 100 VennityNFT 0th Edition tokens after creation of VennityNFT contract`, async () => {
        tokenID0 = await VennityNFT.getTokenID(TOKEN_UUID_0)
        const tokenName: string = await VennityNFT.getTokenName(tokenID0)
        expect(tokenName).to.eq(TOKEN_NAME_0)
      })

      it(`should give the initial supply to the creator's address`, async () => {
        const balance = await VennityNFT.balanceOf(adminAddress, tokenID0)
        expect(balance).to.eq(TOKEN_AMOUNT_0)
      })

      it(`should have a total supply equal to the token amount specified when minting the tokens`, async () => {
        const totalSupply = await VennityNFT.getTokenSupply(tokenID0)
        expect(totalSupply).to.eq(TOKEN_AMOUNT_0)
      })

      // describe(`safeTransferFrom(...)`, () => {
      //   /**
      //    * @dev Note that the caller must be the contract admin, i.e. the
      //    *      `adminAddress`
      //    */
      //   it(`should revert when the sender does not have enough balance`, async () => {
      //     const tx = VennityNFT
      //       .connect(l1Wallet1)
      //       .safeTransferFrom(
      //         adminAddress,
      //         recipientAddress,
      //         tokenID0,
      //         TOKEN_AMOUNT_0 + 1000,
      //         "0x0000000000000000000000000000000000000000",
      //         { gasPrice: 15_000_000 }
      //       )

      //     await expect(tx).to.be.revertedWith(
      //       `ERC1155: insufficient balance for transfer`
      //     )
      //   })

      //   it(`should succeed when the sender has enough balance`, async () => {
      //     const tx = await VennityNFT
      //       .connect(l1Wallet1)
      //       .safeTransferFrom(
      //         adminAddress,
      //         recipientAddress,
      //         tokenID0,
      //         TOKEN_AMOUNT_0,
      //         "0x0000000000000000000000000000000000000000",
      //         { gasPrice: 15_000_000 }
      //       )

      //     await tx.wait()

      //     const deployerBalance: BigNumber = await VennityNFT.balanceOf(
      //       adminAddress,
      //       tokenID0
      //     )
      //     const recipientBalance: BigNumber = await VennityNFT.balanceOf(
      //       recipientAddress,
      //       tokenID0
      //     )

      //     expect(deployerBalance).to.eq(0)
      //     expect(recipientBalance).to.eq(TOKEN_AMOUNT_0)
      //   })
      // })
    })

    // describe(`VennityNFT 0th, 1st, and 2nd Editions`, () => {
    //   let VennityNFT: VennityNFT

    //   let mintTx0: ContractTransaction,
    //     mintTx1: ContractTransaction,
    //     mintTx2: ContractTransaction

    //   // Token information
    //   const TOKEN_NAME_1: string = 'VennityNFT 1st Edition'
    //   const TOKEN_NAME_2: string = 'VennityNFT 2nd Edition'

    //   const TOKEN_AMOUNT_1: number = 150
    //   const TOKEN_AMOUNT_2: number = 200

    //   const TOKEN_UUID_1: string = uuidv4()
    //   const TOKEN_UUID_2: string = uuidv4()

    //   let receipt0: ContractReceipt,
    //     receipt1: ContractReceipt,
    //     receipt2: ContractReceipt

    //   before(`deploy VennityNFT contract and mint ERC1155 tokens`, async () => {
    //     const Factory__VennityNFTFactory = await ethers.getContractFactory('VennityNFT')

    //     adminBalanceBefore = await l1Wallet1.getBalance()

    //     VennityNFT = await Factory__VennityNFTFactory
    //       .connect(l1Wallet1)
    //       .deploy({ gasPrice: 15_000_000 }) as VennityNFT

    //     console.log('Second VennityNFT contract address: ', VennityNFT.address)

    //     let awaitDeployedVennityNFT = await VennityNFT.deployTransaction.wait()
    //     console.log(
    //       'Gas used to deploy 2nd VennityNFT contract: ',
    //       awaitDeployedVennityNFT.gasUsed.toString(),
    //       ' gas'
    //     )

    //     adminBalanceAfter = await l1Wallet1.getBalance()
    //     // Log ETH balance spent to deploy contract
    //     console.log(
    //       'Amount of ETH tokens spent by admin to deploy contract: ',
    //       adminBalanceBefore.sub(adminBalanceAfter).toString()
    //     )

    //     adminBalanceBefore = await l1Wallet1.getBalance()

    //     mintTx0 = await VennityNFT
    //       .connect(l1Wallet1)
    //       ._mint(
    //         adminAddress,
    //         TOKEN_NAME_0,
    //         TOKEN_URI_0,
    //         TOKEN_AMOUNT_0,
    //         TOKEN_UUID_0,
    //         {
    //           gasPrice: 15_000_000
    //         }
    //       )

    //     receipt0 = await mintTx0.wait()
    //     console.log(
    //       'Gas used to call _mint (1/3): ',
    //       receipt0.gasUsed.toString(),
    //       ' gas'
    //     )

    //     adminBalanceAfter = await l1Wallet1.getBalance()
    //     // Log ETH balance spent to deploy contract
    //     console.log(
    //       'Amount of ETH tokens spent by admin to call `_mint` (1/3): ',
    //       adminBalanceBefore.sub(adminBalanceAfter).toString()
    //     )

    //     adminBalanceBefore = await l1Wallet1.getBalance()

    //     mintTx1 = await VennityNFT
    //       .connect(l1Wallet1)
    //       ._mint(
    //         adminAddress,
    //         TOKEN_NAME_1,
    //         TOKEN_URI_1,
    //         TOKEN_AMOUNT_1,
    //         TOKEN_UUID_1,
    //         {
    //           gasPrice: 15_000_000
    //         }
    //       )

    //     receipt1 = await mintTx1.wait()
    //     console.log(
    //       'Gas used to call _mint (2/3): ',
    //       receipt1.gasUsed.toString(),
    //       ' gas'
    //     )

    //     adminBalanceAfter = await l1Wallet1.getBalance()
    //     // Log ETH balance spent to deploy contract
    //     console.log(
    //       'Amount of ETH tokens spent by admin to call `_mint` (2/3): ',
    //       adminBalanceBefore.sub(adminBalanceAfter).toString()
    //     )

    //     adminBalanceBefore = await l1Wallet1.getBalance()

    //     mintTx2 = await VennityNFT
    //       .connect(l1Wallet1)
    //       ._mint(
    //         adminAddress,
    //         TOKEN_NAME_2,
    //         TOKEN_URI_2,
    //         TOKEN_AMOUNT_2,
    //         TOKEN_UUID_2,
    //         {
    //           gasPrice: 15_000_000
    //         }
    //       )

    //     receipt2 = await mintTx1.wait()
    //     console.log(
    //       'Gas used to call _mint (3/3): ',
    //       receipt2.gasUsed.toString(),
    //       ' gas'
    //     )

    //     adminBalanceAfter = await l1Wallet1.getBalance()
    //     // Log ETH balance spent to deploy contract
    //     console.log(
    //       'Amount of ETH tokens spent by admin to call `_mint` (3/3): ',
    //       adminBalanceBefore.sub(adminBalanceAfter).toString()
    //     )
    //   })

    //   it(`should have created new VennityNFT contract and minted 3 sets of ERC1155 tokens with names and token URIs`, async () => {
    //     let eventArgs0 = receipt0.events?.filter((x) => {
    //       return x.event == 'VennityNFTMinted'
    //     })[0].args

    //     let VennityTokenUUID0: string = eventArgs0
    //       ? eventArgs0[1].tokenUUID
    //       : undefined
    //     let VennityTokenURI0: string = eventArgs0
    //       ? eventArgs0[1].tokenURI
    //       : undefined

    //     let eventArgs1 = receipt1.events?.filter((x) => {
    //       return x.event == 'VennityNFTMinted'
    //     })[0].args

    //     let VennityTokenUUID1: string = eventArgs1
    //       ? eventArgs1[1].tokenUUID
    //       : undefined
    //     let VennityTokenURI1: string = eventArgs1
    //       ? eventArgs1[1].tokenURI
    //       : undefined

    //     let eventArgs2 = receipt2.events?.filter((x) => {
    //       return x.event == 'VennityNFTMinted'
    //     })[0].args

    //     let VennityTokenUUID2: string = eventArgs2
    //       ? eventArgs2[1].tokenUUID
    //       : undefined
    //     let VennityTokenURI2: string = eventArgs2
    //       ? eventArgs2[1].tokenURI
    //       : undefined

    //     expect(VennityTokenUUID0).to.eq(TOKEN_UUID_0)
    //     expect(VennityTokenURI0).to.eq(TOKEN_URI_0)

    //     expect(VennityTokenUUID1).to.eq(TOKEN_UUID_1)
    //     expect(VennityTokenURI1).to.eq(TOKEN_URI_1)

    //     expect(VennityTokenUUID2).to.eq(TOKEN_UUID_2)
    //     expect(VennityTokenURI2).to.eq(TOKEN_URI_2)
    //   })

    //   let tokenID0: BigNumber,
    //     tokenID1: BigNumber,
    //     tokenID2: BigNumber


    //   it(`should have minted 100 VennityNFT 0th Edition tokens`, async () => {
    //     tokenID0 = await VennityNFT.getTokenID(TOKEN_UUID_0)
    //     const tokenName: string = await VennityNFT.getTokenName(tokenID0)
    //     expect(tokenName).to.eq(TOKEN_NAME_0)
    //   })

    //   it(`should have minted 150 VennityNFT 1st Edition tokens`, async () => {
    //     tokenID1 = await VennityNFT.getTokenID(TOKEN_UUID_1)
    //     const tokenName: string = await VennityNFT.getTokenName(tokenID1)
    //     expect(tokenName).to.eq(TOKEN_NAME_1)
    //   })

    //   it(`should have minted 200 VennityNFT 2nd Edition tokens`, async () => {
    //     tokenID2 = await VennityNFT.getTokenID(TOKEN_UUID_2)
    //     const tokenName: string = await VennityNFT.getTokenName(tokenID2)
    //     expect(tokenName).to.eq(TOKEN_NAME_2)
    //   })

    //   it(`should give initial supply of VennityNFT 0th Edition to creator's address`, async () => {
    //     const balance = await VennityNFT.balanceOf(adminAddress, tokenID0)
    //     expect(balance).to.eq(TOKEN_AMOUNT_0)
    //   })

    //   it(`should give initial supply of VennityNFT 1st Edition to creator's address`, async () => {
    //     const balance = await VennityNFT.balanceOf(adminAddress, tokenID1)
    //     expect(balance).to.eq(TOKEN_AMOUNT_1)
    //   })

    //   it(`should give initial supply of VennityNFT 2nd Edition to creator's address`, async () => {
    //     const balance = await VennityNFT.balanceOf(adminAddress, tokenID2)
    //     expect(balance).to.eq(TOKEN_AMOUNT_2)
    //   })

    //   it(`should have a total supply of 100`, async () => {
    //     const totalSupply = await VennityNFT.getTokenSupply(tokenID0)
    //     expect(totalSupply).to.eq(TOKEN_AMOUNT_0)
    //   })

    //   it(`should have a total supply of 150`, async () => {
    //     const totalSupply = await VennityNFT.getTokenSupply(tokenID1)
    //     expect(totalSupply).to.eq(TOKEN_AMOUNT_1)
    //   })

    //   it(`should have a total supply of 200`, async () => {
    //     const totalSupply = await VennityNFT.getTokenSupply(tokenID2)
    //     expect(totalSupply).to.eq(TOKEN_AMOUNT_2)
    //   })

    //   /**
    //    * @dev This step requires for `_mint()` to be called twice so that the
    //    *      sender of `safeBatchTransferFrom` can send 2 batches of ERC1155
    //    *      tokens.
    //    */
    //   describe(`safeBatchTransferFrom(...)`, () => {
    //     it(`should revert when the sender does not have enough of a balance`, async () => {
    //       const tx = VennityNFT
    //         .connect(l1Wallet1)
    //         .safeBatchTransferFrom(
    //           adminAddress,
    //           recipientAddress,
    //           [tokenID0, tokenID1, tokenID2],
    //           [TOKEN_AMOUNT_0 + 1000, TOKEN_AMOUNT_1 + 1000, TOKEN_AMOUNT_2 + 1000],
    //           "0x0000000000000000000000000000000000000000",
    //           {
    //             gasPrice: 15_000_000
    //           }
    //         )

    //       await expect(tx).to.be.revertedWith(
    //         `ERC1155: insufficient balance for transfer`
    //       )
    //     })

    //     it(`should succeed when the owner has enough balance and the sender has a large enough balance`, async () => {
    //       const tx = await VennityNFT
    //         .connect(l1Wallet1)
    //         .safeBatchTransferFrom(
    //           adminAddress,
    //           recipientAddress,
    //           [tokenID0, tokenID1, tokenID2],
    //           [TOKEN_AMOUNT_0, TOKEN_AMOUNT_1, TOKEN_AMOUNT_2],
    //           "0x0000000000000000000000000000000000000000",
    //           {
    //             gasPrice: 15_000_000
    //           }
    //         )

    //       await tx.wait()

    //       // Array of token amounts for recipient balances.
    //       const tokenAmount0BN: BigNumber = ethers.BigNumber.from(TOKEN_AMOUNT_0)
    //       const tokenAmount1BN: BigNumber = ethers.BigNumber.from(TOKEN_AMOUNT_1)
    //       const tokenAmount2BN: BigNumber = ethers.BigNumber.from(TOKEN_AMOUNT_2)
    //       const TOKEN_AMOUNTS: BigNumber[] = [tokenAmount0BN, tokenAmount1BN, tokenAmount2BN]

    //       // Array of zeroes for deployer balances.
    //       const zeroBN = ethers.BigNumber.from(0)
    //       const ARRAY_OF_ZEROES = [zeroBN, zeroBN, zeroBN]

    //       const adminBalances: BigNumber[] = await VennityNFT.balanceOfBatch(
    //         [adminAddress, adminAddress, adminAddress],
    //         [tokenID0, tokenID1, tokenID2]
    //       )
    //       const recipientBalances: BigNumber[] = await VennityNFT.balanceOfBatch(
    //         [recipientAddress, recipientAddress, recipientAddress],
    //         [tokenID0, tokenID1, tokenID2]
    //       )

    //       // Check that individual balances are equal to the expected value.
    //       for (let i = 0; i < adminBalances.length; i++) {
    //         expect(adminBalances[i]).to.eq(ARRAY_OF_ZEROES[i])
    //       }
    //       for (let i = 0; i < recipientBalances.length; i++) {
    //         expect(recipientBalances[i]).to.eq(TOKEN_AMOUNTS[i])
    //       }
    //     })
    //   })
    // })
  })
})