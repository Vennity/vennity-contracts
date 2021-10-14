// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.9 <=0.9.0;

// import "hardhat/console.sol";

/****************
 * Local imports
 ***************/
import "./VennityNFT.sol";
import "../utils/Context.sol";
import "../utils/Address.sol";
import "../utils/introspection/ERC165.sol";
import "./IERC1155Receiver.sol";
import "./extensions/IERC1155MetadataURI.sol";
import "./IERC1155.sol";

contract VennityNFTFactory {
    struct Badge {
        string tokenUUID;
        string name;
        string tokenURI;
        uint256 tokenSupply;
        uint256 tokenID;
        bytes tokenData;
    }

    /***************************
     * Private State Variables *
     **************************/
    // Mapping ERC1155 token ID to its token data (in bytes)
    mapping(uint256 => bytes) private _tokenData;

    // Mapping ERC1155 token data (in bytes) to its token IDs
    mapping(bytes => uint256) private _tokenIDs;

    /**************************
     * Public State Variables *
     *************************/
    /**
     * @dev Not part of ERC1155 standard.
     * Admin of the contract. Is the only one who can call `_mint()`.
     */
    address public admin;

    // Mapping token ID to its token URI (as a string)
    mapping(uint256 => string) public _tokenURIs;

    // Mapping token ID to its token name
    mapping(uint256 => string) public _tokenNames;

    // Used to track badges that are minted.
    Badge[] public badges;

    // Mapping token ID to its total supply
    mapping(uint256 => uint256) public _tokenSupplies;

    /********************
     * Public Functions *
     ********************/

    function createToken(string memory name)
        public
        returns (VennityNFT tokenAddress)
    {
        // Create a new `Token` contract and return its address.
        // From the JavaScript side, the return type
        // of this function is `address`, as this is
        // the closest type available in the ABI.
        return new VennityNFT(name);
    }

    function changeName(VennityNFT tokenAddress, string memory name) public {
        // Again, the external type of `tokenAddress` is
        // simply `address`.
        tokenAddress.setName(name);
    }

    // Perform checks to determine if transferring a token to the
    // `OwnedToken` contract should proceed
    function isTokenTransferOK(address currentOwner, address newOwner)
        public
        pure
        returns (bool ok)
    {
        // Check an arbitrary condition to see if transfer should proceed
        return currentOwner != newOwner;
    }
}
