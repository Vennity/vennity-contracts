/* External imports */
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract } from '@ethersproject/contracts'
import { BigNumber, ContractReceipt, ContractTransaction, providers, utils } from 'ethers'
import { v4 as uuidv4 } from 'uuid'

/* Internal imports */
import { VennityBadge } from '../types/VennityBadge'

describe(`VennityBadge`, () => {
  const TOKEN_UUID_0 = uuidv4()
  const TOKEN_NAME_0 = 'VennityBadge 0th Edition'
  const TOKEN_AMOUNT_0 = 100
  // Token uris
  const TOKEN_URI_0 = 'https://ipfs.fleek.co/ipfs/bafybeiakjlj2orkhuqv5rbenqhk2dclygbykpogbryrcjee5nxpo4ewqka'
  const TOKEN_URI_1 = TOKEN_URI_0
  const TOKEN_URI_2 = TOKEN_URI_0
  // Token metadata
  const TOKEN_METADATA_0 = 'https://ipfs.fleek.co/ipfs/bafybeidsd2qmgoue33czk3se7p47yz26xn6lwywtpqiajxz6oz2uo2op3a'
  const TOKEN_METADATA_1 = 'https://ipfs.fleek.co/ipfs/bafybeigxvdqccezxii3u66tssx6rscmlnqqdc2nwk4w5ksk566afwb3ayi'
  const TOKEN_METADATA_2 = 'https://ipfs.fleek.co/ipfs/bafybeiexw3i342yjzykljhbakz7njlabsvm62ed6zt2bzhb7xh7tlfnbqy'
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

  describe(`VennityBadge`, () => {
    describe(`VennityBadge 0th Edition`, () => {
      let createTx0: ContractTransaction,
        createTx1: ContractTransaction,
        createTx2: ContractTransaction
      let VennityBadge: VennityBadge

      before(`deploy VennityBadge contract and mint ERC1155 tokens`, async () => {
        const Factory__VennityBadgeFactory = await ethers.getContractFactory('VennityBadge')

        VennityBadge = await Factory__VennityBadgeFactory
          .connect(deployer)
          .deploy() as VennityBadge

        await VennityBadge.deployTransaction.wait()

        createTx0 = await VennityBadge
          .connect(deployer)
          ._mint(
            deployer.address,
            TOKEN_NAME_0,
            TOKEN_URI_0,
            TOKEN_AMOUNT_0,
            TOKEN_UUID_0
          )
      })

      let tokenID0: BigNumber

      it(`should have created new VennityBadge contract and minted 1 set of an ERC1155 token with a name and token URI`, async () => {
        let receipt: ContractReceipt = await createTx0.wait()
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

      it(`should have minted 100 VennityBadge 0th Edition tokens after creation of VennityBadge contract`, async () => {
        tokenID0 = await VennityBadge.tokenID(TOKEN_UUID_0)
        const tokenName: string = await VennityBadge.tokenName(tokenID0)
        expect(tokenName).to.eq(TOKEN_NAME_0)
      })

      it(`should give the initial supply to the creator's address`, async () => {
        const balance = await VennityBadge.balanceOf(deployerAddress, tokenID0)
        expect(balance).to.eq(TOKEN_AMOUNT_0)
      })

      it(`should have a total supply equal to the token amount specified when minting the tokens`, async () => {
        const totalSupply = await VennityBadge.tokenSupply(tokenID0)
        expect(totalSupply).to.eq(TOKEN_AMOUNT_0)
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

    describe(`VennityBadge 0th, 1st, and 2nd Editions`, () => {
      let VennityBadge: VennityBadge

      let createTx0: ContractTransaction,
        createTx1: ContractTransaction,
        createTx2: ContractTransaction

      // Token information
      let TOKEN_NAME_1: string = 'VennityBadge 1st Edition',
        TOKEN_NAME_2: string = 'VennityBadge 2nd Edition'

      let TOKEN_AMOUNT_1: number = 150,
        TOKEN_AMOUNT_2: number = 200

      const TOKEN_UUID_1: string = uuidv4()
      const TOKEN_UUID_2: string = uuidv4()

      before(`deploy VennityBadge contract and mint ERC1155 tokens`, async () => {
        const Factory__VennityBadgeFactory = await ethers.getContractFactory('VennityBadge')

        VennityBadge = await Factory__VennityBadgeFactory
          .connect(deployer)
          .deploy() as VennityBadge

        await VennityBadge.deployTransaction.wait()

        createTx0 = await VennityBadge
          .connect(deployer)
          ._mint(
            deployer.address,
            TOKEN_NAME_0,
            TOKEN_URI_0,
            TOKEN_AMOUNT_0,
            TOKEN_UUID_0
          )
        createTx1 = await VennityBadge
          .connect(deployer)
          ._mint(
            deployer.address,
            TOKEN_NAME_1,
            TOKEN_URI_1,
            TOKEN_AMOUNT_1,
            TOKEN_UUID_1
          )
        createTx2 = await VennityBadge
          .connect(deployer)
          ._mint(
            deployer.address,
            TOKEN_NAME_2,
            TOKEN_URI_2,
            TOKEN_AMOUNT_2,
            TOKEN_UUID_2
          )
      })

      it(`should have created new VennityBadge contract and minted 3 sets of ERC1155 tokens with names and token URIs`, async () => {
        let receipt0: ContractReceipt = await createTx0.wait()
        let eventArgs0 = receipt0.events?.filter((x) => {
          return x.event == 'VennityBadgeMinted'
        })[0].args

        let VennityTokenUUID0: string = eventArgs0
          ? eventArgs0[1].tokenUUID
          : undefined
        let VennityTokenURI0: string = eventArgs0
          ? eventArgs0[1].tokenURI
          : undefined


        let receipt1: ContractReceipt = await createTx1.wait()
        let eventArgs1 = receipt1.events?.filter((x) => {
          return x.event == 'VennityBadgeMinted'
        })[0].args

        let VennityTokenUUID1: string = eventArgs1
          ? eventArgs1[1].tokenUUID
          : undefined
        let VennityTokenURI1: string = eventArgs1
          ? eventArgs1[1].tokenURI
          : undefined


        let receipt2: ContractReceipt = await createTx2.wait()
        let eventArgs2 = receipt2.events?.filter((x) => {
          return x.event == 'VennityBadgeMinted'
        })[0].args

        let VennityTokenUUID2: string = eventArgs2
          ? eventArgs2[1].tokenUUID
          : undefined
        let VennityTokenURI2: string = eventArgs2
          ? eventArgs2[1].tokenURI
          : undefined

        expect(VennityTokenUUID0).to.eq(TOKEN_UUID_0)
        expect(VennityTokenURI0).to.eq(TOKEN_URI_0)

        expect(VennityTokenUUID1).to.eq(TOKEN_UUID_1)
        expect(VennityTokenURI1).to.eq(TOKEN_URI_1)

        expect(VennityTokenUUID2).to.eq(TOKEN_UUID_2)
        expect(VennityTokenURI2).to.eq(TOKEN_URI_2)
      })

      let tokenID0: BigNumber,
        tokenID1: BigNumber,
        tokenID2: BigNumber


      it(`should have minted 100 VennityBadge 0th Edition tokens`, async () => {
        tokenID0 = await VennityBadge.tokenID(TOKEN_UUID_0)
        const tokenName: string = await VennityBadge.tokenName(tokenID0)
        expect(tokenName).to.eq(TOKEN_NAME_0)
      })

      it(`should have minted 150 VennityBadge 1st Edition tokens`, async () => {
        tokenID1 = await VennityBadge.tokenID(TOKEN_UUID_1)
        const tokenName: string = await VennityBadge.tokenName(tokenID1)
        expect(tokenName).to.eq(TOKEN_NAME_1)
      })

      it(`should have minted 200 VennityBadge 2nd Edition tokens`, async () => {
        tokenID2 = await VennityBadge.tokenID(TOKEN_UUID_2)
        const tokenName: string = await VennityBadge.tokenName(tokenID2)
        expect(tokenName).to.eq(TOKEN_NAME_2)
      })

      it(`should give initial supply of VennityBadge 0th Edition to creator's address`, async () => {
        const balance = await VennityBadge.balanceOf(deployerAddress, tokenID0)
        expect(balance).to.eq(TOKEN_AMOUNT_0)
      })

      it(`should give initial supply of VennityBadge 1st Edition to creator's address`, async () => {
        const balance = await VennityBadge.balanceOf(deployerAddress, tokenID1)
        expect(balance).to.eq(TOKEN_AMOUNT_1)
      })

      it(`should give initial supply of VennityBadge 1st Edition to creator's address`, async () => {
        const balance = await VennityBadge.balanceOf(deployerAddress, tokenID2)
        expect(balance).to.eq(TOKEN_AMOUNT_2)
      })

      it(`should have a total supply of 100`, async () => {
        const totalSupply = await VennityBadge.tokenSupply(tokenID0)
        expect(totalSupply).to.eq(TOKEN_AMOUNT_0)
      })

      it(`should have a total supply of 150`, async () => {
        const totalSupply = await VennityBadge.tokenSupply(tokenID1)
        expect(totalSupply).to.eq(TOKEN_AMOUNT_1)
      })

      it(`should have a total supply of 200`, async () => {
        const totalSupply = await VennityBadge.tokenSupply(tokenID2)
        expect(totalSupply).to.eq(TOKEN_AMOUNT_2)
      })

      /**
       * @dev This step requires for `_mint()` to be called twice so that the
       *      sender of `safeBatchTransferFrom` can send 2 batches of ERC1155
       *      tokens.
       */
      describe(`safeBatchTransferFrom(...)`, () => {
        it(`should revert when the sender does not have enough of an allowance`, async () => {
          const tx = VennityBadge
            .connect(deployer)
            .safeBatchTransferFrom(
              recipientAddress,
              deployerAddress,
              [tokenID0, tokenID1, tokenID2],
              [TOKEN_AMOUNT_0, TOKEN_AMOUNT_1, TOKEN_AMOUNT_2],
              '0x0000000000000000000000000000000000000000'
            )

          await expect(tx).to.be.revertedWith(
            `ERC1155: insufficient balance for transfer`
          )
        })

        it(`should succeed when the owner has enough balance and the sender has a large enough allowance`, async () => {
          const tx = await VennityBadge
            .connect(deployer)
            .safeBatchTransferFrom(
              deployerAddress,
              recipientAddress,
              [tokenID0, tokenID1, tokenID2],
              [TOKEN_AMOUNT_0, TOKEN_AMOUNT_1, TOKEN_AMOUNT_2],
              '0x0000000000000000000000000000000000000000'
            )

          await tx.wait()

          // Array of token amounts for recipient balances.
          const tokenAmount0BN: BigNumber = ethers.BigNumber.from(TOKEN_AMOUNT_0)
          const tokenAmount1BN: BigNumber = ethers.BigNumber.from(TOKEN_AMOUNT_1)
          const tokenAmount2BN: BigNumber = ethers.BigNumber.from(TOKEN_AMOUNT_2)
          const TOKEN_AMOUNTS: BigNumber[] = [tokenAmount0BN, tokenAmount1BN, tokenAmount2BN]

          // Array of zeroes for deployer balances.
          const zeroBN = ethers.BigNumber.from(0)
          const ARRAY_OF_ZEROES = [zeroBN, zeroBN, zeroBN]

          const deployerBalances: BigNumber[] = await VennityBadge.balanceOfBatch(
            [deployerAddress, deployerAddress, deployerAddress],
            [tokenID0, tokenID1, tokenID2]
          )
          const recipientBalances: BigNumber[] = await VennityBadge.balanceOfBatch(
            [recipientAddress, recipientAddress, recipientAddress],
            [tokenID0, tokenID1, tokenID2]
          )

          // Check that individual balances are equal to the expected value.
          for (let i = 0; i < deployerBalances.length; i++) {
            expect(deployerBalances[i]).to.eq(ARRAY_OF_ZEROES[i])
          }
          for (let i = 0; i < recipientBalances.length; i++) {
            expect(recipientBalances[i]).to.eq(TOKEN_AMOUNTS[i])
          }
        })
      })
    })
  })
})