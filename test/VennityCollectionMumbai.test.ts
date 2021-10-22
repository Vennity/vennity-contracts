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
import { VennityCollectionFactory } from '../types/VennityCollectionFactory'
import { VennityCollection } from '../types/VennityCollection'
import { MaticToken } from '../types/MaticToken'
import { create } from 'domain'


/**
 * @dev This set of unit tests are to be run on Polygon's Mumbai testnet.
 */
describe(`VennityCollectionFactory and VennityCollection (Mumbai testnet)`, () => {
  /**
   * @notice Initialize contract and NFT variables
   */
  const TOKEN_UUID_0: string = uuidv4()
  const TOKEN_UUID_1 = uuidv4()
  const TOKEN_UUID_2 = uuidv4()

  const TOKEN_NAME_0: string = 'Vennity NFT 0th Edition'
  const TOKEN_NAME_1 = 'Vennity NFT 1st Edition'
  const TOKEN_NAME_2 = 'Vennity NFT 2nd Edition'

  const TOKEN_AMOUNT_0: number = 100
  const TOKEN_AMOUNT_1 = 150
  const TOKEN_AMOUNT_2 = 200

  // Token uris
  const TOKEN_URI_0 = 'ipfs://bafybeif5sp7bver5s25g4riysghkv2kdccousxo2gciid3r7sjdq4oj45y'
  const TOKEN_URI_1 = 'ipfs://bafybeih23ccdankvx33wjqacsolzrsoqwpa6fmhj4rqy4g3xnxrgk7rjpm'
  const TOKEN_URI_2 = 'ipfs://bafybeiebpwqcewopw3xkt335kdzw5dimvwmz5yfseidy5d2cpmi4o4hrma'

  const COLLECTION_UUID_0 = uuidv4()
  const COLLECTION_UUID_1 = uuidv4()
  const COLLECTION_UUID_2 = uuidv4()

  const COLLECTION_NAME_0 = 'VennityCollection Collection Name 0'
  const COLLECTION_NAME_1 = 'VennityCollection Collection Name 1'
  const COLLECTION_NAME_2 = 'VennityCollection Collection Name 2'

  let createTx0: ContractTransaction,
    createTx1: ContractTransaction,
    createTx2: ContractTransaction

  let mintTx0: ContractTransaction,
    mintTx1: ContractTransaction,
    mintTx2: ContractTransaction

  let receipt0: ContractReceipt,
    receipt1: ContractReceipt,
    receipt2: ContractReceipt

  let VennityCollectionFactory: VennityCollectionFactory

  let VennityCollection0: VennityCollection,
    VennityCollection1: VennityCollection,
    VennityCollection2: VennityCollection

  let VennityCollectionAddress0: string,
    VennityCollectionAddress1: string,
    VennityCollectionAddress2: string

  let tokenID0: BigNumber,
    tokenID1: BigNumber,
    tokenID2: BigNumber

  let matic: MaticToken

  let mumbaiProvider = new ethers.providers.JsonRpcProvider(
    process.env.INFURA_MUMBAI_URL
  )

  let privateKey1: string = process.env.METAMASK_WALLET_PRIVATE_KEY_1 as string
  let privateKey2: string = process.env.METAMASK_WALLET_PRIVATE_KEY_2 as string

  let l1Wallet1: Wallet = new ethers.Wallet(privateKey1, mumbaiProvider)
  let l1Wallet2: Wallet = new ethers.Wallet(privateKey2, mumbaiProvider)

  const adminAddress = l1Wallet1.address
  const recipientAddress = l1Wallet2.address
  const MATIC_PRICE = 1

  let adminMaticBalanceBefore: BigNumber,
    adminMaticBalanceAfter: BigNumber,
    recipientMaticBalanceBefore: BigNumber,
    recipientMaticBalanceAfter: BigNumber


  before(`inspect Mumbai MATIC balances: `, async () => {
    matic = await ethers.getContractAt(
      'IERC20',
      '0x0000000000000000000000000000000000001010'
    ) as MaticToken

    adminMaticBalanceBefore = await matic.balanceOf(adminAddress)
    recipientMaticBalanceBefore = await matic.balanceOf(recipientAddress)

    console.log(
      'First mumbai wallet balance before contract deployment: ',
      adminMaticBalanceBefore.mul(MATIC_PRICE).toString()
    )
    console.log(
      'Second mumbai wallet balance before contract deployment: ',
      recipientMaticBalanceBefore.mul(MATIC_PRICE).toString()
    )
  })

  // describe(`Minting 1 NFT from a single VennityCollection`, () => {
  //   describe(`Vennity NFT 0th Edition`, () => {
  //     before(`deploy 1 VennityCollectionFactory contract and deploy 1 VennityCollection contract`, async () => {
  //       const Factory__VennityCollectionFactory = await ethers.getContractFactory(
  //         'VennityCollectionFactory'
  //       )

  //       adminMaticBalanceBefore = await matic.balanceOf(adminAddress)

  //       VennityCollectionFactory = await Factory__VennityCollectionFactory
  //         .connect(l1Wallet1)
  //         .deploy() as VennityCollectionFactory

  //       let awaitDeployedVennityCollectionFactory = await VennityCollectionFactory
  //         .deployTransaction.wait()

  //       console.log(
  //         'First VennityCollectionFactory contract address: ',
  //         VennityCollectionFactory.address
  //       )

  //       console.log(
  //         'Gas used to deploy 1st VennityCollectionFactory contract: ',
  //         awaitDeployedVennityCollectionFactory.gasUsed.toString(),
  //         ' gas'
  //       )

  //       adminMaticBalanceAfter = await matic.balanceOf(adminAddress)

  //       // Log MATIC balance spent to deploy contract
  //       console.log(
  //         'Amount of MATIC tokens spent by admin to VennityFactory deploy contract: ',
  //         adminMaticBalanceBefore.sub(adminMaticBalanceAfter).mul(MATIC_PRICE).toString()
  //       )

  //       adminMaticBalanceBefore = await matic.balanceOf(adminAddress)

  //       createTx0 = await VennityCollectionFactory
  //         .connect(l1Wallet1)
  //         .createCollection(
  //           l1Wallet1.address,
  //           COLLECTION_UUID_0,
  //           COLLECTION_NAME_0
  //         )

  //       receipt0 = await createTx0.wait()

  //       adminMaticBalanceAfter = await matic.balanceOf(adminAddress)

  //       console.log(
  //         'Gas used to call `createCollection()`: ',
  //         receipt0.gasUsed.toString(),
  //         ' gas'
  //       )

  //       // Log MATIC balance spent to deploy contract
  //       console.log(
  //         'Amount of MATIC tokens spent by admin to call `createCollection()` 1 time: ',
  //         adminMaticBalanceBefore.sub(adminMaticBalanceAfter).mul(MATIC_PRICE).toString()
  //       )
  //     })

  //     let tokenID0: BigNumber

  //     it(`should have created 1 new VennityCollectionFactory contract and minted 1 NFT`, async () => {
  //       let eventArgs = receipt0.events?.filter((x) => {
  //         return x.event == 'VennityCollectionCreated'
  //       })[0].args

  //       let VennityCollectionAdmin: string = eventArgs
  //         ? eventArgs.admin
  //         : undefined
  //       let VennityCollectionUuid: string = eventArgs
  //         ? eventArgs.uuid
  //         : undefined
  //       let VennityCollectionName: string = eventArgs
  //         ? eventArgs.name
  //         : undefined

  //       VennityCollectionAddress0 = eventArgs
  //         ? eventArgs.address_
  //         : undefined

  //       console.log('VennityCollectionAddress0: ', VennityCollectionAddress0)

  //       expect(VennityCollectionAdmin).to.eq(l1Wallet1.address)
  //       expect(VennityCollectionUuid).to.eq(COLLECTION_UUID_0)
  //       expect(VennityCollectionName).to.eq(COLLECTION_NAME_0)

  //       /**
  //        * @dev Mint 1 new NFT
  //        */
  //       VennityCollection0 = await ethers.getContractAt(
  //         'VennityCollection',
  //         VennityCollectionAddress0
  //       ) as VennityCollection

  //       mintTx0 = await VennityCollection0
  //         .connect(l1Wallet1)
  //         ._mint(
  //           l1Wallet1.address,
  //           TOKEN_NAME_0,
  //           TOKEN_URI_0,
  //           TOKEN_AMOUNT_0,
  //           TOKEN_UUID_0
  //         )

  //       receipt0 = await mintTx0.wait()

  //       adminMaticBalanceAfter = await matic.balanceOf(adminAddress)

  //       console.log(
  //         'Gas used to call _mint: ',
  //         receipt0.gasUsed.toString(),
  //         ' gas'
  //       )

  //       // Log MATIC balance spent to deploy contract
  //       console.log(
  //         'Amount of MATIC tokens spent by admin to call `_mint` 1 time: ',
  //         adminMaticBalanceBefore.sub(adminMaticBalanceAfter).mul(MATIC_PRICE).toString()
  //       )
  //     })

  //     it(`should have minted 100 "Vennity NFT 0th Edition" tokens after creation of VennityCollection contract`, async () => {
  //       tokenID0 = await VennityCollection0.getId(TOKEN_UUID_0)
  //       const tokenName: string = await VennityCollection0.getTokenName(tokenID0)
  //       expect(tokenName).to.eq(TOKEN_NAME_0)
  //     })

  //     it(`should give the initial supply to the creator's address`, async () => {
  //       const balance = await VennityCollection0.balanceOf(adminAddress, tokenID0)
  //       expect(balance).to.eq(TOKEN_AMOUNT_0)
  //     })

  //     it(`should have a total supply equal to the token amount specified when minting the tokens`, async () => {
  //       const totalSupply = await VennityCollection0.getSupply(tokenID0)
  //       expect(totalSupply).to.eq(TOKEN_AMOUNT_0)
  //     })

  //     describe(`safeTransferFrom(...)`, () => {
  //       /**
  //        * @dev Note that the caller must be the contract admin, i.e. the
  //        *      `adminAddress`
  //        */
  //       it(`should revert when the sender does not have enough balance`, async () => {
  //         const tx = VennityCollection0
  //           .connect(l1Wallet1)
  //           .safeTransferFrom(
  //             adminAddress,
  //             recipientAddress,
  //             tokenID0,
  //             TOKEN_AMOUNT_0 + 1000,
  //             "0x0000000000000000000000000000000000000000"
  //           )

  //         await expect(tx).to.be.revertedWith(
  //           `ERC1155: insufficient balance for transfer`
  //         )
  //       })

  //       it(`should succeed when the sender has enough balance`, async () => {
  //         const tx = await VennityCollection0
  //           .connect(l1Wallet1)
  //           .safeTransferFrom(
  //             adminAddress,
  //             recipientAddress,
  //             tokenID0,
  //             TOKEN_AMOUNT_0,
  //             "0x0000000000000000000000000000000000000000"
  //           )

  //         await tx.wait()

  //         const deployerBalance: BigNumber = await VennityCollection0.balanceOf(
  //           adminAddress,
  //           tokenID0
  //         )
  //         const recipientBalance: BigNumber = await VennityCollection0.balanceOf(
  //           recipientAddress,
  //           tokenID0
  //         )

  //         expect(deployerBalance).to.eq(0)
  //         expect(recipientBalance).to.eq(TOKEN_AMOUNT_0)
  //       })
  //     })
  //   })
  // })

  describe(`VennityCollectionFactory (Mumbai)`, () => {
    before(`deploy 3 VennityCollection contracts and deploy 3 VennityCollection contracts`, async () => {
      const Factory__VennityCollectionFactory = await ethers.getContractFactory(
        'VennityCollectionFactory'
      )

      adminMaticBalanceBefore = await matic.balanceOf(adminAddress)

      VennityCollectionFactory = await Factory__VennityCollectionFactory
        .connect(l1Wallet1)
        .deploy() as VennityCollectionFactory

      let awaitDeployedVennityCollectionFactory = await VennityCollectionFactory
        .deployTransaction.wait()

      console.log(
        'First VennityCollectionFactory contract address: ',
        VennityCollectionFactory.address
      )

      console.log(
        'Gas used to deploy 1st VennityCollectionFactory contract: ',
        awaitDeployedVennityCollectionFactory.gasUsed.toString(),
        ' gas'
      )

      adminMaticBalanceAfter = await matic.balanceOf(adminAddress)

      // Log MATIC balance spent to deploy contract
      console.log(
        'Amount of MATIC tokens spent by admin to deploy VennityCollectionFactory contract: ',
        adminMaticBalanceBefore.sub(adminMaticBalanceAfter).mul(MATIC_PRICE).toString()
      )

      adminMaticBalanceBefore = await matic.balanceOf(adminAddress)

      createTx0 = await VennityCollectionFactory
        .connect(l1Wallet1)
        .createCollection(
          l1Wallet1.address,
          COLLECTION_UUID_0,
          COLLECTION_NAME_0
        )

      receipt0 = await createTx0.wait()

      adminMaticBalanceAfter = await matic.balanceOf(adminAddress)

      console.log(
        'Gas used to call `createCollection()`: (1/3)',
        receipt0.gasUsed.toString(),
        ' gas'
      )

      // Log MATIC balance spent to deploy contract
      console.log(
        'Amount of MATIC tokens spent by admin to call `createCollection()` 1 time: (1/3)',
        adminMaticBalanceBefore.sub(adminMaticBalanceAfter).mul(MATIC_PRICE).toString()
      )

      createTx1 = await VennityCollectionFactory
        .connect(l1Wallet1)
        .createCollection(
          l1Wallet1.address,
          COLLECTION_UUID_1,
          COLLECTION_NAME_1
        )

      receipt1 = await createTx1.wait()

      adminMaticBalanceAfter = await matic.balanceOf(adminAddress)

      console.log(
        'Gas used to call `createCollection()`: (2/3)',
        receipt1.gasUsed.toString(),
        ' gas'
      )

      // Log MATIC balance spent to deploy contract
      console.log(
        'Amount of MATIC tokens spent by admin to call `createCollection()` 1 time: (2/3)',
        adminMaticBalanceBefore.sub(adminMaticBalanceAfter).mul(MATIC_PRICE).toString()
      )

      createTx2 = await VennityCollectionFactory
        .connect(l1Wallet1)
        .createCollection(
          l1Wallet1.address,
          COLLECTION_UUID_2,
          COLLECTION_NAME_2
        )

      receipt2 = await createTx2.wait()

      adminMaticBalanceAfter = await matic.balanceOf(adminAddress)

      console.log(
        'Gas used to call `createCollection()`: (3/3)',
        receipt2.gasUsed.toString(),
        ' gas'
      )

      // Log MATIC balance spent to deploy contract
      console.log(
        'Amount of MATIC tokens spent by admin to call `createCollection()` 1 time: (3/3)',
        adminMaticBalanceBefore.sub(adminMaticBalanceAfter).mul(MATIC_PRICE).toString()
      )
    })

    it(`should have created 3 new VennityCollectionFactory contract and minted 3 NFTs on each`, async () => {
      let eventArgs0 = receipt0.events?.filter((x) => {
        return x.event == 'VennityCollectionCreated'
      })[0].args

      let VennityCollectionAdmin0: string = eventArgs0
        ? eventArgs0.admin
        : undefined
      let VennityCollectionUuid0: string = eventArgs0
        ? eventArgs0.uuid
        : undefined
      let VennityCollectionName0: string = eventArgs0
        ? eventArgs0.name
        : undefined

      VennityCollectionAddress0 = eventArgs0
        ? eventArgs0.address_
        : undefined

      console.log('VennityCollectionAddress0: ', VennityCollectionAddress0)

      let eventArgs1 = receipt1.events?.filter((x) => {
        return x.event == 'VennityCollectionCreated'
      })[0].args

      let VennityCollectionAdmin1: string = eventArgs1
        ? eventArgs1.admin
        : undefined
      let VennityCollectionUuid1: string = eventArgs1
        ? eventArgs1.uuid
        : undefined
      let VennityCollectionName1: string = eventArgs1
        ? eventArgs1.name
        : undefined

      VennityCollectionAddress1 = eventArgs1
        ? eventArgs1.address_
        : undefined

      console.log('VennityCollectionAddress1: ', VennityCollectionAddress1)


      let eventArgs2 = receipt2.events?.filter((x) => {
        return x.event == 'VennityCollectionCreated'
      })[0].args

      let VennityCollectionAdmin2: string = eventArgs2
        ? eventArgs2.admin
        : undefined
      let VennityCollectionUuid2: string = eventArgs2
        ? eventArgs2.uuid
        : undefined
      let VennityCollectionName2: string = eventArgs2
        ? eventArgs2.name
        : undefined

      VennityCollectionAddress2 = eventArgs2
        ? eventArgs2.address_
        : undefined

      console.log('VennityCollectionAddress2: ', VennityCollectionAddress2)

      expect(VennityCollectionAdmin0).to.eq(l1Wallet1.address)
      expect(VennityCollectionUuid0).to.eq(COLLECTION_UUID_0)
      expect(VennityCollectionName0).to.eq(COLLECTION_NAME_0)

      expect(VennityCollectionAdmin1).to.eq(l1Wallet1.address)
      expect(VennityCollectionUuid1).to.eq(COLLECTION_UUID_1)
      expect(VennityCollectionName1).to.eq(COLLECTION_NAME_1)

      expect(VennityCollectionAdmin2).to.eq(l1Wallet1.address)
      expect(VennityCollectionUuid2).to.eq(COLLECTION_UUID_2)
      expect(VennityCollectionName2).to.eq(COLLECTION_NAME_2)


      VennityCollection0 = await ethers.getContractAt(
        'VennityCollection',
        VennityCollectionAddress0
      ) as VennityCollection
      VennityCollection1 = await ethers.getContractAt(
        'VennityCollection',
        VennityCollectionAddress1
      ) as VennityCollection
      VennityCollection2 = await ethers.getContractAt(
        'VennityCollection',
        VennityCollectionAddress2
      ) as VennityCollection

      /**
       * @dev First set of 3 mints
       */
      mintTx0 = await VennityCollection0
        .connect(l1Wallet1)
        ._mint(
          adminAddress,
          TOKEN_NAME_0,
          TOKEN_URI_0,
          TOKEN_AMOUNT_0,
          TOKEN_UUID_0
        )

      receipt0 = await mintTx0.wait()
      console.log(
        'Gas used to call _mint (1/3): ',
        receipt0.gasUsed.toString(),
        ' gas'
      )

      adminMaticBalanceAfter = await matic.balanceOf(adminAddress)
      // Log MATIC balance spent to deploy contract
      console.log(
        'Amount of MATIC tokens spent by admin to call `_mint` (1/3): ',
        adminMaticBalanceBefore.sub(adminMaticBalanceAfter).mul(MATIC_PRICE).toString()
      )

      adminMaticBalanceBefore = await matic.balanceOf(adminAddress)

      mintTx1 = await VennityCollection0
        .connect(l1Wallet1)
        ._mint(
          adminAddress,
          TOKEN_NAME_1,
          TOKEN_URI_1,
          TOKEN_AMOUNT_1,
          TOKEN_UUID_1
        )

      receipt1 = await mintTx1.wait()
      console.log(
        'Gas used to call _mint (2/3): ',
        receipt1.gasUsed.toString(),
        ' gas'
      )

      adminMaticBalanceAfter = await matic.balanceOf(adminAddress)
      // Log MATIC balance spent to deploy contract
      console.log(
        'Amount of MATIC tokens spent by admin to call `_mint` (2/3): ',
        adminMaticBalanceBefore.sub(adminMaticBalanceAfter).mul(MATIC_PRICE).toString()
      )

      adminMaticBalanceBefore = await matic.balanceOf(adminAddress)

      mintTx2 = await VennityCollection0
        .connect(l1Wallet1)
        ._mint(
          adminAddress,
          TOKEN_NAME_2,
          TOKEN_URI_2,
          TOKEN_AMOUNT_2,
          TOKEN_UUID_2
        )

      receipt2 = await mintTx1.wait()
      console.log(
        'Gas used to call _mint (3/3): ',
        receipt2.gasUsed.toString(),
        ' gas'
      )

      adminMaticBalanceAfter = await matic.balanceOf(adminAddress)
      // Log MATIC balance spent to deploy contract
      console.log(
        'Amount of MATIC tokens spent by admin to call `_mint` (3/3): ',
        adminMaticBalanceBefore.sub(adminMaticBalanceAfter).mul(MATIC_PRICE).toString()
      )

      /**
       * @dev Second set of 3 mints
       */
      mintTx0 = await VennityCollection1
        .connect(l1Wallet1)
        ._mint(
          adminAddress,
          TOKEN_NAME_0,
          TOKEN_URI_0,
          TOKEN_AMOUNT_0,
          TOKEN_UUID_0
        )

      receipt0 = await mintTx0.wait()
      console.log(
        'Gas used to call _mint (1/3): ',
        receipt0.gasUsed.toString(),
        ' gas'
      )

      adminMaticBalanceAfter = await matic.balanceOf(adminAddress)
      // Log MATIC balance spent to deploy contract
      console.log(
        'Amount of MATIC tokens spent by admin to call `_mint` (1/3): ',
        adminMaticBalanceBefore.sub(adminMaticBalanceAfter).mul(MATIC_PRICE).toString()
      )

      adminMaticBalanceBefore = await matic.balanceOf(adminAddress)

      mintTx1 = await VennityCollection1
        .connect(l1Wallet1)
        ._mint(
          adminAddress,
          TOKEN_NAME_1,
          TOKEN_URI_1,
          TOKEN_AMOUNT_1,
          TOKEN_UUID_1
        )

      receipt1 = await mintTx1.wait()
      console.log(
        'Gas used to call _mint (2/3): ',
        receipt1.gasUsed.toString(),
        ' gas'
      )

      adminMaticBalanceAfter = await matic.balanceOf(adminAddress)
      // Log MATIC balance spent to deploy contract
      console.log(
        'Amount of MATIC tokens spent by admin to call `_mint` (2/3): ',
        adminMaticBalanceBefore.sub(adminMaticBalanceAfter).mul(MATIC_PRICE).toString()
      )

      adminMaticBalanceBefore = await matic.balanceOf(adminAddress)

      mintTx2 = await VennityCollection1
        .connect(l1Wallet1)
        ._mint(
          adminAddress,
          TOKEN_NAME_2,
          TOKEN_URI_2,
          TOKEN_AMOUNT_2,
          TOKEN_UUID_2
        )

      receipt2 = await mintTx1.wait()
      console.log(
        'Gas used to call _mint (3/3): ',
        receipt2.gasUsed.toString(),
        ' gas'
      )

      adminMaticBalanceAfter = await matic.balanceOf(adminAddress)
      // Log MATIC balance spent to deploy contract
      console.log(
        'Amount of MATIC tokens spent by admin to call `_mint` (3/3): ',
        adminMaticBalanceBefore.sub(adminMaticBalanceAfter).mul(MATIC_PRICE).toString()
      )

      /**
       * @dev Third set of 3 mints
       */
      mintTx0 = await VennityCollection2
        .connect(l1Wallet1)
        ._mint(
          adminAddress,
          TOKEN_NAME_0,
          TOKEN_URI_0,
          TOKEN_AMOUNT_0,
          TOKEN_UUID_0
        )

      receipt0 = await mintTx0.wait()
      console.log(
        'Gas used to call _mint (1/3): ',
        receipt0.gasUsed.toString(),
        ' gas'
      )

      adminMaticBalanceAfter = await matic.balanceOf(adminAddress)
      // Log MATIC balance spent to deploy contract
      console.log(
        'Amount of MATIC tokens spent by admin to call `_mint` (1/3): ',
        adminMaticBalanceBefore.sub(adminMaticBalanceAfter).mul(MATIC_PRICE).toString()
      )

      adminMaticBalanceBefore = await matic.balanceOf(adminAddress)

      mintTx1 = await VennityCollection1
        .connect(l1Wallet1)
        ._mint(
          adminAddress,
          TOKEN_NAME_1,
          TOKEN_URI_1,
          TOKEN_AMOUNT_1,
          TOKEN_UUID_1
        )

      receipt1 = await mintTx1.wait()
      console.log(
        'Gas used to call _mint (2/3): ',
        receipt1.gasUsed.toString(),
        ' gas'
      )

      adminMaticBalanceAfter = await matic.balanceOf(adminAddress)
      // Log MATIC balance spent to deploy contract
      console.log(
        'Amount of MATIC tokens spent by admin to call `_mint` (2/3): ',
        adminMaticBalanceBefore.sub(adminMaticBalanceAfter).mul(MATIC_PRICE).toString()
      )

      adminMaticBalanceBefore = await matic.balanceOf(adminAddress)

      mintTx2 = await VennityCollection2
        .connect(l1Wallet1)
        ._mint(
          adminAddress,
          TOKEN_NAME_2,
          TOKEN_URI_2,
          TOKEN_AMOUNT_2,
          TOKEN_UUID_2
        )

      receipt2 = await mintTx1.wait()
      console.log(
        'Gas used to call _mint (3/3): ',
        receipt2.gasUsed.toString(),
        ' gas'
      )

      adminMaticBalanceAfter = await matic.balanceOf(adminAddress)
      // Log MATIC balance spent to deploy contract
      console.log(
        'Amount of MATIC tokens spent by admin to call `_mint` (3/3): ',
        adminMaticBalanceBefore.sub(adminMaticBalanceAfter).mul(MATIC_PRICE).toString()
      )
    })

    it(`should have minted 100 Vennity NFT 0th Edition tokens for each VennityCollection`, async () => {
      tokenID0 = await VennityCollection0.getId(TOKEN_UUID_0)
      tokenID1 = await VennityCollection1.getId(TOKEN_UUID_0)
      tokenID2 = await VennityCollection2.getId(TOKEN_UUID_0)

      const tokenName0: string = await VennityCollection0.getTokenName(tokenID0)
      const tokenName1: string = await VennityCollection1.getTokenName(tokenID1)
      const tokenName2: string = await VennityCollection2.getTokenName(tokenID2)

      expect(tokenName0).to.eq(TOKEN_NAME_0)
      expect(tokenName1).to.eq(TOKEN_NAME_0)
      expect(tokenName2).to.eq(TOKEN_NAME_0)
    })

    it(`should have minted 150 Vennity NFT 1st Edition tokens for each VennityCollection`, async () => {
      tokenID0 = await VennityCollection0.getId(TOKEN_UUID_1)
      tokenID1 = await VennityCollection1.getId(TOKEN_UUID_1)
      tokenID2 = await VennityCollection2.getId(TOKEN_UUID_1)

      const tokenName0: string = await VennityCollection0.getTokenName(tokenID0)
      const tokenName1: string = await VennityCollection1.getTokenName(tokenID1)
      const tokenName2: string = await VennityCollection2.getTokenName(tokenID2)

      expect(tokenName0).to.eq(TOKEN_NAME_1)
      expect(tokenName1).to.eq(TOKEN_NAME_1)
      expect(tokenName2).to.eq(TOKEN_NAME_1)
    })

    it(`should have minted 200 Vennity NFT 2nd Edition tokens`, async () => {
      tokenID0 = await VennityCollection0.getId(TOKEN_UUID_2)
      tokenID1 = await VennityCollection1.getId(TOKEN_UUID_2)
      tokenID2 = await VennityCollection2.getId(TOKEN_UUID_2)

      const tokenName0: string = await VennityCollection0.getTokenName(tokenID0)
      const tokenName1: string = await VennityCollection1.getTokenName(tokenID1)
      const tokenName2: string = await VennityCollection2.getTokenName(tokenID2)

      expect(tokenName0).to.eq(TOKEN_NAME_2)
      expect(tokenName1).to.eq(TOKEN_NAME_2)
      expect(tokenName2).to.eq(TOKEN_NAME_2)
    })

    it(`should give initial supply of each minted NFT to creator's address for each VennityCollection`, async () => {
      const tk0balance0 = await VennityCollection0.balanceOf(adminAddress, tokenID0)
      const tk0balance1 = await VennityCollection1.balanceOf(adminAddress, tokenID0)
      const tk0balance2 = await VennityCollection2.balanceOf(adminAddress, tokenID0)

      const tk1balance0 = await VennityCollection0.balanceOf(adminAddress, tokenID1)
      const tk1balance1 = await VennityCollection1.balanceOf(adminAddress, tokenID1)
      const tk1balance2 = await VennityCollection2.balanceOf(adminAddress, tokenID1)

      const tk2balance0 = await VennityCollection0.balanceOf(adminAddress, tokenID2)
      const tk2balance1 = await VennityCollection1.balanceOf(adminAddress, tokenID2)
      const tk2balance2 = await VennityCollection2.balanceOf(adminAddress, tokenID2)

      expect(tk0balance0).to.eq(TOKEN_AMOUNT_0)
      expect(tk0balance1).to.eq(TOKEN_AMOUNT_0)
      expect(tk0balance2).to.eq(TOKEN_AMOUNT_0)

      expect(tk1balance0).to.eq(TOKEN_AMOUNT_1)
      expect(tk1balance1).to.eq(TOKEN_AMOUNT_1)
      expect(tk1balance2).to.eq(TOKEN_AMOUNT_1)

      expect(tk2balance0).to.eq(TOKEN_AMOUNT_2)
      expect(tk2balance1).to.eq(TOKEN_AMOUNT_2)
      expect(tk2balance2).to.eq(TOKEN_AMOUNT_2)
    })


    it(`should have a total supply of 100 for each VennityNFT 0th Edition per VennityCollection`, async () => {
      const totalSupply0 = await VennityCollection0.getSupply(tokenID0)
      const totalSupply1 = await VennityCollection1.getSupply(tokenID0)
      const totalSupply2 = await VennityCollection2.getSupply(tokenID0)

      expect(totalSupply0).to.eq(TOKEN_AMOUNT_0)
      expect(totalSupply1).to.eq(TOKEN_AMOUNT_0)
      expect(totalSupply2).to.eq(TOKEN_AMOUNT_0)
    })

    it(`should have a total supply of 150 for each VennityNFT 1st Edition per VennityCollection`, async () => {
      const totalSupply0 = await VennityCollection0.getSupply(tokenID1)
      const totalSupply1 = await VennityCollection1.getSupply(tokenID1)
      const totalSupply2 = await VennityCollection2.getSupply(tokenID1)

      expect(totalSupply0).to.eq(TOKEN_AMOUNT_1)
      expect(totalSupply1).to.eq(TOKEN_AMOUNT_1)
      expect(totalSupply2).to.eq(TOKEN_AMOUNT_1)
    })

    it(`should have a total supply of 200 for each VennityNFT 2nd Edition per VennityCollection`, async () => {
      const totalSupply0 = await VennityCollection0.getSupply(tokenID2)
      const totalSupply1 = await VennityCollection1.getSupply(tokenID2)
      const totalSupply2 = await VennityCollection2.getSupply(tokenID2)

      expect(totalSupply0).to.eq(TOKEN_AMOUNT_2)
      expect(totalSupply1).to.eq(TOKEN_AMOUNT_2)
      expect(totalSupply2).to.eq(TOKEN_AMOUNT_2)
    })

    /**
     * @todo Finish safeBatchTransferFrom for 3 mints per collection
     */
    describe(`safeBatchTransferFrom(...)`, () => {
      it(`should revert when the sender does not have enough of a balance`, async () => {
        const tx0 = VennityCollection0
          .connect(l1Wallet1)
          .safeBatchTransferFrom(
            adminAddress,
            recipientAddress,
            [tokenID0, tokenID1, tokenID2],
            [TOKEN_AMOUNT_0 + 1000, TOKEN_AMOUNT_1 + 1000, TOKEN_AMOUNT_2 + 1000],
            "0x0000000000000000000000000000000000000000"
          )
        const tx1 = VennityCollection0
          .connect(l1Wallet1)
          .safeBatchTransferFrom(
            adminAddress,
            recipientAddress,
            [tokenID0, tokenID1, tokenID2],
            [TOKEN_AMOUNT_0 + 1000, TOKEN_AMOUNT_1 + 1000, TOKEN_AMOUNT_2 + 1000],
            "0x0000000000000000000000000000000000000000"
          )
        const tx2 = VennityCollection0
          .connect(l1Wallet1)
          .safeBatchTransferFrom(
            adminAddress,
            recipientAddress,
            [tokenID0, tokenID1, tokenID2],
            [TOKEN_AMOUNT_0 + 1000, TOKEN_AMOUNT_1 + 1000, TOKEN_AMOUNT_2 + 1000],
            "0x0000000000000000000000000000000000000000"
          )

        await expect(tx0).to.be.revertedWith(
          `ERC1155: insufficient balance for transfer`
        )
        await expect(tx1).to.be.revertedWith(
          `ERC1155: insufficient balance for transfer`
        )
        await expect(tx2).to.be.revertedWith(
          `ERC1155: insufficient balance for transfer`
        )
      })

      it(`should succeed when the owner has enough balance and the sender has a large enough balance`, async () => {
        /**
         * @dev First Collection
         */
        const tx0 = await VennityCollection0
          .connect(l1Wallet1)
          .safeBatchTransferFrom(
            adminAddress,
            recipientAddress,
            [tokenID0, tokenID1, tokenID2],
            [TOKEN_AMOUNT_0, TOKEN_AMOUNT_1, TOKEN_AMOUNT_2],
            "0x0000000000000000000000000000000000000000"
          )

        await tx0.wait()

        // Array of token amounts for recipient balances.
        const c0tokenAmount0BN: BigNumber = ethers.BigNumber.from(TOKEN_AMOUNT_0)
        const c0tokenAmount1BN: BigNumber = ethers.BigNumber.from(TOKEN_AMOUNT_1)
        const c0tokenAmount2BN: BigNumber = ethers.BigNumber.from(TOKEN_AMOUNT_2)
        const c0_TOKEN_AMOUNTS: BigNumber[] = [c0tokenAmount0BN, c0tokenAmount1BN, c0tokenAmount2BN]

        // Array of zeroes for deployer balances.
        const zeroBN = ethers.BigNumber.from(0)
        const ARRAY_OF_ZEROES = [zeroBN, zeroBN, zeroBN]

        const c0adminBalances: BigNumber[] = await VennityCollection0.balanceOfBatch(
          [adminAddress, adminAddress, adminAddress],
          [tokenID0, tokenID1, tokenID2]
        )
        const c0recipientBalances: BigNumber[] = await VennityCollection0.balanceOfBatch(
          [recipientAddress, recipientAddress, recipientAddress],
          [tokenID0, tokenID1, tokenID2]
        )

        // Check that individual balances are equal to the expected value.
        for (let i = 0; i < c0adminBalances.length; i++) {
          expect(c0adminBalances[i]).to.eq(ARRAY_OF_ZEROES[i])
        }
        for (let i = 0; i < c0recipientBalances.length; i++) {
          expect(c0recipientBalances[i]).to.eq(c0_TOKEN_AMOUNTS[i])
        }

        /**
         * @dev Second Collection
         */
        const tx1 = await VennityCollection1
          .connect(l1Wallet1)
          .safeBatchTransferFrom(
            adminAddress,
            recipientAddress,
            [tokenID0, tokenID1, tokenID2],
            [TOKEN_AMOUNT_0, TOKEN_AMOUNT_1, TOKEN_AMOUNT_2],
            "0x0000000000000000000000000000000000000000"
          )

        await tx1.wait()

        // Array of token amounts for recipient balances.
        const c1tokenAmount0BN: BigNumber = ethers.BigNumber.from(TOKEN_AMOUNT_0)
        const c1tokenAmount1BN: BigNumber = ethers.BigNumber.from(TOKEN_AMOUNT_1)
        const c1tokenAmount2BN: BigNumber = ethers.BigNumber.from(TOKEN_AMOUNT_2)
        const c1_TOKEN_AMOUNTS: BigNumber[] = [c1tokenAmount0BN, c1tokenAmount1BN, c1tokenAmount2BN]

        const c1adminBalances: BigNumber[] = await VennityCollection0.balanceOfBatch(
          [adminAddress, adminAddress, adminAddress],
          [tokenID0, tokenID1, tokenID2]
        )
        const c1recipientBalances: BigNumber[] = await VennityCollection0.balanceOfBatch(
          [recipientAddress, recipientAddress, recipientAddress],
          [tokenID0, tokenID1, tokenID2]
        )

        // Check that individual balances are equal to the expected value.
        for (let i = 0; i < c1adminBalances.length; i++) {
          expect(c1adminBalances[i]).to.eq(ARRAY_OF_ZEROES[i])
        }
        for (let i = 0; i < c1recipientBalances.length; i++) {
          expect(c1recipientBalances[i]).to.eq(c1_TOKEN_AMOUNTS[i])
        }

        /**
         * @dev Second Collection
         */
        const tx2 = await VennityCollection2
          .connect(l1Wallet1)
          .safeBatchTransferFrom(
            adminAddress,
            recipientAddress,
            [tokenID0, tokenID1, tokenID2],
            [TOKEN_AMOUNT_0, TOKEN_AMOUNT_1, TOKEN_AMOUNT_2],
            "0x0000000000000000000000000000000000000000"
          )

        await tx1.wait()

        // Array of token amounts for recipient balances.
        const c2tokenAmount0BN: BigNumber = ethers.BigNumber.from(TOKEN_AMOUNT_0)
        const c2tokenAmount1BN: BigNumber = ethers.BigNumber.from(TOKEN_AMOUNT_1)
        const c2tokenAmount2BN: BigNumber = ethers.BigNumber.from(TOKEN_AMOUNT_2)
        const c2_TOKEN_AMOUNTS: BigNumber[] = [c2tokenAmount0BN, c2tokenAmount1BN, c2tokenAmount2BN]

        const c2adminBalances: BigNumber[] = await VennityCollection0.balanceOfBatch(
          [adminAddress, adminAddress, adminAddress],
          [tokenID0, tokenID1, tokenID2]
        )
        const c2recipientBalances: BigNumber[] = await VennityCollection0.balanceOfBatch(
          [recipientAddress, recipientAddress, recipientAddress],
          [tokenID0, tokenID1, tokenID2]
        )

        // Check that individual balances are equal to the expected value.
        for (let i = 0; i < c2adminBalances.length; i++) {
          expect(c2adminBalances[i]).to.eq(ARRAY_OF_ZEROES[i])
        }
        for (let i = 0; i < c1recipientBalances.length; i++) {
          expect(c2recipientBalances[i]).to.eq(c2_TOKEN_AMOUNTS[i])
        }
      })
    })
  })
})