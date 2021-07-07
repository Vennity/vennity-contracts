/* External imports */
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from '@ethersproject/contracts'
import { BigNumber, ContractReceipt, providers, utils } from 'ethers'
import { v4 as uuidv4 } from 'uuid'

/* Internal imports */
import { VennityBadgeMinter } from '../types/VennityBadgeMinter'
import { VennityBadge } from '../types/VennityBadge'

describe(`VennityBadge`, () => {
  const TOKEN_UUID_0 = uuidv4()
  const TOKEN_NAME_0 = 'First Vennity Badge'
  const MAX_MINT_CAP_0 = 100
  const PROXY_ADDRESS_0 = '<PROXY_ADDRESS>'
  const TOKEN_URI_0 = // should conform to the ERC-1155 Metadata URI JSON Schema
    'https://ipfs.fleek.co/ipfs/bafybeiakjlj2orkhuqv5rbenqhk2dclygbykpogbryrcjee5nxpo4ewqka'

  // Signers and addresses
  let deployer: SignerWithAddress,
    recipient: SignerWithAddress,
    deployerAddress: string,
    recipientAddress: string

  before(`load accounts`, async () => {
    // Get signers
    ;[deployer, recipient] = await ethers.getSigners()
    deployerAddress = await deployer.getAddress()
    recipientAddress = await recipient.getAddress()
  })

  let VennityBadgeMinter: VennityBadgeMinter
  beforeEach(`deploy VennityBadge contract`, async () => {
    const Factory__VennityBadgeFactory = await ethers.getContractFactory('VennityBadgeMinter')

    VennityBadgeMinter = await Factory__VennityBadgeFactory
      .connect(deployer)
      .deploy() as VennityBadgeMinter

    await VennityBadgeMinter.deployTransaction.wait()
  })

  describe(`VennityBadgeMinter`, async () => {
    let VennityBadge: VennityBadge

    it(`should create new VennityBadge as an ERC1155 token`, async () => {
      let tx = await VennityBadgeMinter
        .connect(deployer)
        .createThenMint(TOKEN_UUID_0)

      // Get tx receipt to retrieve `VennityBadgeCreated` event.
      let receipt: ContractReceipt = await tx.wait()
      let eventArgs = receipt.events?.filter((x) => {
        return x.event == 'VennityBadgeCreated'
      })[0].args

      let VennityBadgeAddress: string = eventArgs
        ? eventArgs[0]
        : undefined
      let VennityBadgeUUID: string = eventArgs
        ? eventArgs[1]
        : undefined

      expect(VennityBadgeUUID).to.eq(TOKEN_UUID_0)

      VennityBadge = await ethers.getContractAt(
        'VennityBadge',
        VennityBadgeAddress
      ) as VennityBadge
    })



    describe(`VennityBadge 0th Edition`, async () => {
      it(`should mint a new VennityBadge with a specified name`, async () => {
        VennityBadge
          .connect(deployer)
          ._mint(

          )

        const tokenID = await VennityBadge.tokenID(TOKEN_UUID_0)
        const tokenName0: string = await VennityBadge.tokenName(tokenID)
        expect(tokenName0).to.eq(TOKEN_NAME_0)
      })


      it(`should give the initial supply to the creator's address`, async () => {
        const balance = await VennityBadge.balanceOf(deployerAddress, 0)
        expect(balance).to.eq(MAX_MINT_CAP_0)
      })


      describe(`_mint(...)`, () => {
        let TOKEN_UUID_1: string,
          TOKEN_UUID_2: string

        before(`minting ERC1155 token`, async () => {
          TOKEN_UUID_1 = uuidv4() // some random uuid
          TOKEN_UUID_2 = uuidv4() // some random uuid
        })

        it(`should mint 100 tokens`, async () => {
          const tx = await VennityBadge.connect(deployer)
        })
      })

      it(`should have a total supply equal to the max minting cap`, async () => {
        /**
         * @dev Max minting cap can be thought of as the initial supply of the 
         *      token.
         */
        // const totalSupply0 = await VennityBadgeMinter.tokenSupply(TOKEN_UUID_0)
        // expect(totalSupply0).to.eq(MAX_MINT_CAP_0)
      })
    })

    // describe(`safeTransferFrom(...)`, () => {
    //   let tokenID: number
    //   before(`get tokenID`, async () => {
    //     tokenID = await VennityBadge.getTokenID(BADGE_NAME_0)
    //   })

    //   it(`should revert when the sender does not have enough balance`, async () => {
    //     const tx = VennityBadge.connect(deployer).safeTransferFrom(
    //       // address from,
    //       // address to,
    //       // uint256 id,
    //       // uint256 amount,
    //       // bytes memory data
    //       deployerAddress,
    //       recipientAddress,
    //       tokenID,
    //       BADGE_MAX_MINT_CAP_0 + 1,
    //       '0x0'
    //     )

    //     await expect(tx).to.be.revertedWith(
    //       `You don't have enough balance to make this transfer!`
    //     )
    //   })

    //   it(`should succeed when the sender has enough balance`, async () => {
    //     const tx = await VennityBadge.connect(recipient).safeTransferFrom(
    //       deployerAddress,
    //       recipientAddress,
    //       tokenID,
    //       BADGE_MAX_MINT_CAP_0,
    //       '0x0'
    //     )

    //     await tx.wait()

    //     const deployerBalance: BigNumber = await VennityBadge.balanceOf(
    //       deployerAddress,
    //       tokenID
    //     )
    //     const recipientBalance: BigNumber = await VennityBadge.balanceOf(
    //       recipientAddress,
    //       tokenID
    //     )

    //     expect(deployerBalance).to.eq(0)
    //     expect(recipientBalance).to.eq(BADGE_MAX_MINT_CAP_0)
    //   })

    //   // describe(`batchTransferFrom(...)`, async () => {
    //   //   let tokenID: number
    //   //   before(`get tokenID`, async () => {
    //   //     tokenID = await VennityBadge.getTokenID(BADGE_NAME_0)
    //   //   })

    //   //   it(`should revert when the sender does not have enough of an allowance`, async () => {
    //   //     const tx = VennityBadge.connect(recipient).batchTransferFrom(
    //   //       recipientAddress,
    //   //       deployerAddress,
    //   //       tokenID,
    //   //       BADGE_MAX_MINT_CAP_0,
    //   //       '0x0'
    //   //     )

    //   //     await expect(tx).to.be.revertedWith(
    //   //       "Can't transfer from the desired account because you don't have enough of an allowance."
    //   //     )
    //   //   })

    //   //   it(`should succeed when the owner has enough balance and the sender has a large enough allowance`, async () => {
    //   //     const setApprovalForAll_Tx = await VennityBadge.connect(deployer).setApprovalForAll(
    //   //       // address operator, // `operator` cannot be the caller
    //   //       // bool approved

    //   //     )

    //   //     await setApprovalForAll_Tx.wait()

    //   //     const safeTransferFrom_Tx = await VennityBadge.connect(recipient).safeTransferFrom(
    //   //       recipient,
    //   //       deployer,
    //   //       tokenID,
    //   //       BADGE_MAX_MINT_CAP_0,
    //   //       '0x0'
    //   //     )

    //   //     await safeTransferFrom_Tx.wait()
    //   //   })
    //   // })
    // })
  })
})
