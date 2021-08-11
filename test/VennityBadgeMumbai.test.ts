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

/* Internal imports */
import { VennityBadge } from '../types/VennityBadge'
import { MaticToken } from '../types/MaticToken'


/**
 * @dev This set of unit tests are to be run on Polygon's Mumbai testnet.
 */
describe(`VennityBadge (Mumbai testnet)`, () => {
  const TOKEN_UUID_0 = uuidv4()
  const TOKEN_NAME_0 = 'VennityBadge 0th Edition'
  const TOKEN_AMOUNT_0 = 100
  // Token uris
  const TOKEN_URI_0 = 'https://ipfs.fleek.co/ipfs/bafybeiakjlj2orkhuqv5rbenqhk2dclygbykpogbryrcjee5nxpo4ewqka'
  const TOKEN_URI_1 = 'https://ipfs.fleek.co/ipfs/bafybeiahrj5dy3zqno5na4pi22lqqvd327mv76oklgxs576e2mxzbohkne'
  const TOKEN_URI_2 = 'https://ipfs.fleek.co/ipfs/bafybeie5mzmitctjwcvyap5bzw5btw3n2umge5plvcpr6rbdkjbke524me'


  let receipt: ContractReceipt,
    matic

  let mumbaiProvider = new ethers.providers.JsonRpcProvider(
    process.env.INFURA_MUMBAI_URL
  )

  let privateKey1: string = process.env.METAMASK_WALLET_PRIVATE_KEY_1 as string
  let privateKey2: string = process.env.METAMASK_WALLET_PRIVATE_KEY_2 as string

  let l1Wallet1: Wallet = new ethers.Wallet(privateKey1, mumbaiProvider)
  let l1Wallet2: Wallet = new ethers.Wallet(privateKey2, mumbaiProvider)

  // console.log('This is the first Mumbai wallet: ', l1Wallet1)
  // console.log('This is the second Mumbai wallet: ', l1Wallet2)

  const adminAddress = l1Wallet1.address
  const recipientAddress = l1Wallet2.address

  before(`inspect Mumbai MATIC balances: `, async () => {
    matic = await ethers.getContractAt(
      'IERC20',
      '0x0000000000000000000000000000000000001010'
    ) as MaticToken

    console.log(
      'First mumbai wallet balance: ',
      (await matic.balanceOf(adminAddress)).toString()
    )
    console.log(
      'Second mumbai wallet balance: ',
      (await matic.balanceOf(recipientAddress)).toString()
    )
  })

  describe(`VennityBadge NFT`, () => {
    describe(`VennityBadge 0th Edition`, () => {
      let mintTx0: ContractTransaction,
        mintTx1: ContractTransaction,
        mintTx2: ContractTransaction

      let VennityBadge: VennityBadge

      before(`deploy VennityBadge contract and mint ERC1155 tokens`, async () => {
        const Factory__VennityBadgeFactory = await ethers.getContractFactory(
          'VennityBadge'
        )

        VennityBadge = await Factory__VennityBadgeFactory
          .connect(l1Wallet1)
          .deploy() as VennityBadge

        await VennityBadge.deployTransaction.wait()

        console.log(
          'First VennityBadge contract address: ',
          VennityBadge.address
        )

        /**
         * @todo Throws a CALL_EXCEPTION error
         */
        mintTx0 = await VennityBadge
          .connect(l1Wallet1)
          ._mint(
            l1Wallet1.address,
            TOKEN_NAME_0,
            TOKEN_URI_0,
            TOKEN_AMOUNT_0,
            TOKEN_UUID_0
          )

        /**
         * @todo Receipt never gets returned.
         */
        receipt = await mintTx0.wait()
      })

      let tokenID0: BigNumber

      it(`should have created new VennityBadge contract and minted 1 set of an ERC1155 token with a name and token URI`, async () => {
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
        tokenID0 = await VennityBadge.getTokenID(TOKEN_UUID_0)
        const tokenName: string = await VennityBadge.getTokenName(tokenID0)
        expect(tokenName).to.eq(TOKEN_NAME_0)
      })

      it(`should give the initial supply to the creator's address`, async () => {
        const balance = await VennityBadge.balanceOf(adminAddress, tokenID0)
        expect(balance).to.eq(TOKEN_AMOUNT_0)
      })

      it(`should have a total supply equal to the token amount specified when minting the tokens`, async () => {
        const totalSupply = await VennityBadge.getTokenSupply(tokenID0)
        expect(totalSupply).to.eq(TOKEN_AMOUNT_0)
      })

      describe(`safeTransferFrom(...)`, () => {
        /**
         * @dev Note that the caller must be the contract admin, i.e. the
         *      `adminAddress`
         */
        it(`should revert when the sender does not have enough balance`, async () => {
          const tx = VennityBadge
            .connect(l1Wallet1)
            .safeTransferFrom(
              adminAddress,
              recipientAddress,
              tokenID0,
              TOKEN_AMOUNT_0 + 1000,
              "0x0000000000000000000000000000000000000000"
            )

          await expect(tx).to.be.revertedWith(
            `ERC1155: insufficient balance for transfer`
          )
        })

        it(`should succeed when the sender has enough balance`, async () => {
          const tx = await VennityBadge
            .connect(l1Wallet1)
            .safeTransferFrom(
              adminAddress,
              recipientAddress,
              tokenID0,
              TOKEN_AMOUNT_0,
              "0x0000000000000000000000000000000000000000"
            )

          await tx.wait()

          const deployerBalance: BigNumber = await VennityBadge.balanceOf(
            adminAddress,
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

      let mintTx0: ContractTransaction,
        mintTx1: ContractTransaction,
        mintTx2: ContractTransaction

      // Token information
      const TOKEN_NAME_1: string = 'VennityBadge 1st Edition'
      const TOKEN_NAME_2: string = 'VennityBadge 2nd Edition'

      const TOKEN_AMOUNT_1: number = 150
      const TOKEN_AMOUNT_2: number = 200

      const TOKEN_UUID_1: string = uuidv4()
      const TOKEN_UUID_2: string = uuidv4()

      let receipt0: ContractReceipt,
        receipt1: ContractReceipt,
        receipt2: ContractReceipt

      before(`deploy VennityBadge contract and mint ERC1155 tokens`, async () => {
        const Factory__VennityBadgeFactory = await ethers.getContractFactory('VennityBadge')

        VennityBadge = await Factory__VennityBadgeFactory
          .connect(l1Wallet1)
          .deploy() as VennityBadge

        console.log('Second VennityBadge contract address: ', VennityBadge.address)

        await VennityBadge.deployTransaction.wait()

        mintTx0 = await VennityBadge
          .connect(l1Wallet1)
          ._mint(
            adminAddress,
            TOKEN_NAME_0,
            TOKEN_URI_0,
            TOKEN_AMOUNT_0,
            TOKEN_UUID_0
          )

        receipt0 = await mintTx0.wait()

        mintTx1 = await VennityBadge
          .connect(l1Wallet1)
          ._mint(
            adminAddress,
            TOKEN_NAME_1,
            TOKEN_URI_1,
            TOKEN_AMOUNT_1,
            TOKEN_UUID_1
          )

        receipt1 = await mintTx1.wait()

        mintTx2 = await VennityBadge
          .connect(l1Wallet1)
          ._mint(
            adminAddress,
            TOKEN_NAME_2,
            TOKEN_URI_2,
            TOKEN_AMOUNT_2,
            TOKEN_UUID_2
          )

        receipt2 = await mintTx1.wait()
      })

      it(`should have created new VennityBadge contract and minted 3 sets of ERC1155 tokens with names and token URIs`, async () => {
        let eventArgs0 = receipt0.events?.filter((x) => {
          return x.event == 'VennityBadgeMinted'
        })[0].args

        let VennityTokenUUID0: string = eventArgs0
          ? eventArgs0[1].tokenUUID
          : undefined
        let VennityTokenURI0: string = eventArgs0
          ? eventArgs0[1].tokenURI
          : undefined

        let eventArgs1 = receipt1.events?.filter((x) => {
          return x.event == 'VennityBadgeMinted'
        })[0].args

        let VennityTokenUUID1: string = eventArgs1
          ? eventArgs1[1].tokenUUID
          : undefined
        let VennityTokenURI1: string = eventArgs1
          ? eventArgs1[1].tokenURI
          : undefined

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
        tokenID0 = await VennityBadge.getTokenID(TOKEN_UUID_0)
        const tokenName: string = await VennityBadge.getTokenName(tokenID0)
        expect(tokenName).to.eq(TOKEN_NAME_0)
      })

      it(`should have minted 150 VennityBadge 1st Edition tokens`, async () => {
        tokenID1 = await VennityBadge.getTokenID(TOKEN_UUID_1)
        const tokenName: string = await VennityBadge.getTokenName(tokenID1)
        expect(tokenName).to.eq(TOKEN_NAME_1)
      })

      it(`should have minted 200 VennityBadge 2nd Edition tokens`, async () => {
        tokenID2 = await VennityBadge.getTokenID(TOKEN_UUID_2)
        const tokenName: string = await VennityBadge.getTokenName(tokenID2)
        expect(tokenName).to.eq(TOKEN_NAME_2)
      })

      it(`should give initial supply of VennityBadge 0th Edition to creator's address`, async () => {
        const balance = await VennityBadge.balanceOf(adminAddress, tokenID0)
        expect(balance).to.eq(TOKEN_AMOUNT_0)
      })

      it(`should give initial supply of VennityBadge 1st Edition to creator's address`, async () => {
        const balance = await VennityBadge.balanceOf(adminAddress, tokenID1)
        expect(balance).to.eq(TOKEN_AMOUNT_1)
      })

      it(`should give initial supply of VennityBadge 2nd Edition to creator's address`, async () => {
        const balance = await VennityBadge.balanceOf(adminAddress, tokenID2)
        expect(balance).to.eq(TOKEN_AMOUNT_2)
      })

      it(`should have a total supply of 100`, async () => {
        const totalSupply = await VennityBadge.getTokenSupply(tokenID0)
        expect(totalSupply).to.eq(TOKEN_AMOUNT_0)
      })

      it(`should have a total supply of 150`, async () => {
        const totalSupply = await VennityBadge.getTokenSupply(tokenID1)
        expect(totalSupply).to.eq(TOKEN_AMOUNT_1)
      })

      it(`should have a total supply of 200`, async () => {
        const totalSupply = await VennityBadge.getTokenSupply(tokenID2)
        expect(totalSupply).to.eq(TOKEN_AMOUNT_2)
      })

      /**
       * @dev This step requires for `_mint()` to be called twice so that the
       *      sender of `safeBatchTransferFrom` can send 2 batches of ERC1155
       *      tokens.
       */
      describe(`safeBatchTransferFrom(...)`, () => {
        it(`should revert when the sender does not have enough of a balance`, async () => {
          const tx = VennityBadge
            .connect(l1Wallet1)
            .safeBatchTransferFrom(
              adminAddress,
              recipientAddress,
              [tokenID0, tokenID1, tokenID2],
              [TOKEN_AMOUNT_0 + 1000, TOKEN_AMOUNT_1 + 1000, TOKEN_AMOUNT_2 + 1000],
              "0x0000000000000000000000000000000000000000"
            )

          await expect(tx).to.be.revertedWith(
            `ERC1155: insufficient balance for transfer`
          )
        })

        it(`should succeed when the owner has enough balance and the sender has a large enough balance`, async () => {
          const tx = await VennityBadge
            .connect(l1Wallet1)
            .safeBatchTransferFrom(
              adminAddress,
              recipientAddress,
              [tokenID0, tokenID1, tokenID2],
              [TOKEN_AMOUNT_0, TOKEN_AMOUNT_1, TOKEN_AMOUNT_2],
              "0x0000000000000000000000000000000000000000"
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

          const adminBalances: BigNumber[] = await VennityBadge.balanceOfBatch(
            [adminAddress, adminAddress, adminAddress],
            [tokenID0, tokenID1, tokenID2]
          )
          const recipientBalances: BigNumber[] = await VennityBadge.balanceOfBatch(
            [recipientAddress, recipientAddress, recipientAddress],
            [tokenID0, tokenID1, tokenID2]
          )

          // Check that individual balances are equal to the expected value.
          for (let i = 0; i < adminBalances.length; i++) {
            expect(adminBalances[i]).to.eq(ARRAY_OF_ZEROES[i])
          }
          for (let i = 0; i < recipientBalances.length; i++) {
            expect(recipientBalances[i]).to.eq(TOKEN_AMOUNTS[i])
          }
        })
      })
    })
  })
})