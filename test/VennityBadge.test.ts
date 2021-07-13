/* External imports */
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from '@ethersproject/contracts'
import { BigNumber, ContractReceipt, providers, utils } from 'ethers'
import { v4 as uuidv4 } from 'uuid'

/* Internal imports */
import { VennityBadge } from '../types/VennityBadge'
import { connect } from 'http2'

describe(`VennityBadge`, () => {
  const TOKEN_UUID_0 = uuidv4()
  const TOKEN_NAME_0 = 'VennityBadge 0th Edition'
  const TOKEN_AMOUNT_0 = 100
  // should conform to the ERC-1155 Metadata URI JSON Schema
  const TOKEN_URI_0 = 'https://ipfs.fleek.co/ipfs/bafybeiakjlj2orkhuqv5rbenqhk2dclygbykpogbryrcjee5nxpo4ewqka'
  // const PROXY_ADDRESS_0 = '<PROXY_ADDRESS>'

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

  let VennityBadge: VennityBadge
  before(`deploy VennityBadge contract`, async () => {
    const Factory__VennityBadgeFactory = await ethers.getContractFactory('VennityBadge')

    VennityBadge = await Factory__VennityBadgeFactory
      .connect(deployer)
      .deploy() as VennityBadge

    await VennityBadge.deployTransaction.wait()
  })

  describe(`VennityBadgeMinter`, async () => {
    let TOKEN_UUID_1: string,
      TOKEN_UUID_2: string

    before(`minting ERC1155 token`, async () => {
      TOKEN_UUID_1 = uuidv4() // some random uuid
      TOKEN_UUID_2 = uuidv4() // some random uuid
    })

    it(`should create new VennityBadge contract`, async () => {
      let createTx = await VennityBadge
        .connect(deployer)
        ._mint(
          deployer.address,
          TOKEN_NAME_0,
          TOKEN_URI_0,
          TOKEN_AMOUNT_0,
          TOKEN_UUID_0
        )

      // Get tx receipt to retrieve `VennityBadgeMinted` event.
      let receipt: ContractReceipt = await createTx.wait()
      let eventArgs = receipt.events?.filter((x) => {
        return x.event == 'VennityBadgeMinted'
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

    describe(`VennityBadge 0th Edition`, async () => {
      let tokenID0: BigNumber

      it(`should have minted 100 VennityBadge 0th Edition tokens after creation of VennityBadge contract`, async () => {
        tokenID0 = await VennityBadge.tokenID(TOKEN_UUID_0)
        const tokenName0: string = await VennityBadge.tokenName(tokenID0)
        expect(tokenName0).to.eq(TOKEN_NAME_0)
      })

      it(`should give the initial supply to the creator's address`, async () => {
        const balance = await VennityBadge.balanceOf(deployerAddress, tokenID0)
        expect(balance).to.eq(TOKEN_AMOUNT_0)
      })

      it(`should have a total supply equal to the max minting cap`, async () => {
        const totalSupply0 = await VennityBadge.tokenSupply(tokenID0)
        expect(totalSupply0).to.eq(TOKEN_AMOUNT_0)
      })

      describe(`safeTransferFrom(...)`, () => {
        /**
         * @dev Note that the caller must be the contract admin, i.e. the
         *      `deployer` address.
         */
        it(`should revert when the sender does not have enough balance`, async () => {
          const tx = VennityBadge
            .connect(deployer)
            .safeTransferFrom(
              recipientAddress,
              deployerAddress,
              tokenID0,
              TOKEN_AMOUNT_0 + 1,
              '0x0000000000000000000000000000000000000000'
            )

          await expect(tx).to.be.revertedWith(
            `ERC1155: insufficient balance for transfer`
          )
        })

        it(`should succeed when the sender has enough balance`, async () => {
          const tx = await VennityBadge
            .connect(deployer)
            .safeTransferFrom(
              deployerAddress,
              recipientAddress,
              tokenID0,
              TOKEN_AMOUNT_0,
              '0x0000000000000000000000000000000000000000'
            )

          await tx.wait()

          const deployerBalance: BigNumber = await VennityBadge.balanceOf(
            deployerAddress,
            tokenID0
          )
          const recipientBalance: BigNumber = await VennityBadge.balanceOf(
            recipientAddress,
            tokenID0
          )

          expect(deployerBalance).to.eq(0)
          expect(recipientBalance).to.eq(TOKEN_AMOUNT_0)
        })
      })
    })


    // describe(`batchTransferFrom(...)`, async () => {
    //   let tokenID: number
    //   before(`get tokenID`, async () => {
    //     tokenID = await VennityBadge.getTokenID(BADGE_NAME_0)
    //   })

    //   it(`should revert when the sender does not have enough of an allowance`, async () => {
    //     const tx = VennityBadge.connect(recipient).batchTransferFrom(
    //       recipientAddress,
    //       deployerAddress,
    //       tokenID,
    //       BADGE_MAX_MINT_CAP_0,
    //       '0x0'
    //     )

    //     await expect(tx).to.be.revertedWith(
    //       "Can't transfer from the desired account because you don't have enough of an allowance."
    //     )
    //   })

    //   it(`should succeed when the owner has enough balance and the sender has a large enough allowance`, async () => {
    //     const setApprovalForAll_Tx = await VennityBadge.connect(deployer).setApprovalForAll(
    //       // address operator, // `operator` cannot be the caller
    //       // bool approved

    //     )

    //     await setApprovalForAll_Tx.wait()

    //     const safeTransferFrom_Tx = await VennityBadge.connect(recipient).safeTransferFrom(
    //       recipient,
    //       deployer,
    //       tokenID,
    //       BADGE_MAX_MINT_CAP_0,
    //       '0x0'
    //     )

    //     await safeTransferFrom_Tx.wait()
    //   })
    // })
  })
})
