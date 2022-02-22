//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * Inspired by https://github.com/austintgriffith/bouncer-proxy/blob/master/BouncerProxy/BouncerProxy.sol
 *             https://github.com/OpenZeppelin/openzeppelin-contracts/blob/master/contracts/metatx/MinimalForwarder.sol
 */

contract Forwarder is Ownable {
    using ECDSA for bytes32;

    uint256 CALL_LIMIT = 100;  // TODO implement call limit

    struct Invoice {
        address user;           // address of user
        address collection;     // address of collection (VennityCollection)
        uint256 value;          // payable value - will be zero since user does not pay
        uint256 nonce;          // nonce of user to avoid replay
        bytes data;             // data of function signature to call obtained by 
                                //   `abi.encodeWithSignature(_mint(address,string,string,uint256,string), comma-separated inputs..)` 
                                //   for example. Would work for any function signature (mint, burn, transfer, etc.) and returns bytes
    }

    mapping(address => uint256) private _nonces; // keeps track of user's nonces
    mapping(address => uint256) private callCount; // keeps track of call limit per user
    mapping(address => uint256) private subscriptionPlan; // keeps track of user's subscription plan
    mapping(address => bool) private whitelist; // keeps track if user is whitelisted

    event whitelisted(address account);
    event executedCall(Invoice request);

    constructor() {
        whitelist[msg.sender] = true;
    }

    ///////////////////////////////////////
    // |        VIEW FUNCTIONS         | //
    ///////////////////////////////////////

    function getNonce(address from) public view returns (uint256) {
        return _nonces[from];
    }

    function isWhitelist(address account) public view returns (bool) {
        return whitelist[account];
    }

    ///////////////////////////////////////
    // |          ONLY OWNER           | //
    ///////////////////////////////////////
    
    /**
     * @dev adds user to the whitelist by first verifying that she signed the message letting us whitelist them
     */
    function addWhitelist(bytes calldata message, bytes calldata signature, address account) external onlyOwner {
        require(!whitelist[account], "user is already whitelisted");
        if (verify(message, signature, account)) {
            whitelist[account] = true;
            emit whitelisted(account);
        }
    }

    ///////////////////////////////////////
    // |       VERIFY SIGNATURE        | //
    ///////////////////////////////////////

    /**
     * Comes from https://docs.openzeppelin.com/contracts/2.x/utilities
     * @dev verfies a signature given a message, the signature, and an account address
     */
    function verify(bytes calldata message, bytes calldata signature, address account) internal pure returns (bool) {
        return keccak256(message)
            .toEthSignedMessageHash()
            .recover(signature) == account;
    }

    //borrowed from OpenZeppelin's ECDSA stuff:
    //https://github.com/OpenZeppelin/openzeppelin-solidity/blob/master/contracts/cryptography/ECDSA.sol
    /* TODO Examine this potentially more thorough verification method
    function signerIsWhitelisted(bytes32 _hash, bytes memory _signature) internal view returns (bool){
        bytes32 r;
        bytes32 s;
        uint8 v;
        // Check the signature length
        if (_signature.length != 65) {
            return false;
        }
        // Divide the signature in r, s and v variables
        // ecrecover takes the signature parameters, and the only way to get them
        // currently is to use assembly.
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            r := mload(add(_signature, 32))
            s := mload(add(_signature, 64))
            v := byte(0, mload(add(_signature, 96)))
        }
        // Version of signature should be 27 or 28, but 0 and 1 are also possible versions
        if (v < 27) {
            v += 27;
        }
        // If the version is correct return the signer address
        if (v != 27 && v != 28) {
            return false;
        } else {
            // solium-disable-next-line arg-overflow
            return whitelist[ecrecover(keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", _hash)
            ), v, r, s)];
        }
    }    
    */

    ///////////////////////////////////////
    // |        CALL A FUNCTION        | //
    ///////////////////////////////////////

    function executeCall(Invoice calldata req)
        public
        payable
        returns (bool, bytes memory)
    {
        require(whitelist[req.user], "User is not whitelisted");
        _nonces[req.user] = req.nonce + 1;
        uint gas = gasleft(); // gas is amount paid to execute call
        (bool success, bytes memory returndata) = req.collection.call{gas: gas, value: req.value}(req.data);
        if (success) { emit executedCall(req); }
        // Validate that the relayer has sent enough gas for the call.
        // See https://ronan.eth.link/blog/ethereum-gas-dangers/
        assert(gasleft() > gas / 63);

        return (success, returndata);
    }

}