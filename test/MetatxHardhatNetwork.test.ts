// deploy a vennity collection {vc}
// set an arbitrary user with no eth {u}
// deploy a forwarder contract
// have {u} sign a message and request to be on the whitelist
// confirm in forwarder that they signed the message and add them to whitelist
// mint from forwarder and ensure that no gas was paid by {u}

/* External imports */
import { ethers } from 'hardhat'
import { expect } from 'chai'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import {
  BigNumber,
  Contract,
  ContractReceipt,
  ContractTransaction,
  providers,
  utils,
  Wallet
} from 'ethers'
import { v4 as uuidv4 } from 'uuid'
import 'dotenv/config'
import { Interface, solidityKeccak256 } from 'ethers/lib/utils'

describe('Metatx Tests', () => {
    let Forwarder, forwarder: Contract, 
        Collection, collection: Contract, 
        admin: { address: any }, user: { address: any; signMessage: (arg0: string) => any }

    beforeEach(async () => {
        [admin, user] = await ethers.getSigners();
        Collection = await ethers.getContractFactory('VennityCollection');
        collection = await Collection.deploy('Test Collection', admin.address);
        Forwarder = await ethers.getContractFactory('Forwarder');
        forwarder = await Forwarder.deploy();
    });

    describe('Adding to whitelist', () => {
      it('User should not be on whitelist', async () => {
        const iswhitelist = await forwarder.isWhitelist(user.address);
        expect(iswhitelist).to.be.false;
      });
      it('Should add address to whitelist', async () => {
        await forwarder.addWhitelist(user.address);
        const iswhitelist = await forwarder.isWhitelist(user.address);
        expect(iswhitelist).to.be.true;
      });
    });

    describe('Executing Calls', () => {
      it('Should mint an NFT', () => {
        const iface = new Interface([
          "function _mint(address account_, string memory name_, string memory uri_, uint256 amount_, string memory uuid_)"
        ]);
        var value = [
          admin.address, 
          collection.address,
          0,
          0,
          iface.encodeFunctionData(
            "_mint", 
            [
              admin.address, 
              "testCollection",
              "testURI",
              1,
              "testUUID"
            ]
          )
        ]
        var [success, returndata] = forwarder.executeCall(value);
        expect(success).to.be.true;
      })
    });
})