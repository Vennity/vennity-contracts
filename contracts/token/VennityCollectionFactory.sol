// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.9 <=0.9.0;

// import "hardhat/console.sol";

/****************
 * Local imports
 ***************/
import "./VennityCollection.sol";
import "../utils/Context.sol";
import "../utils/Address.sol";
import "../utils/introspection/ERC165.sol";
import "./IERC1155Receiver.sol";
import "./extensions/IERC1155MetadataURI.sol";
import "./IERC1155.sol";

contract VennityCollectionFactory {
    struct Collection {
        address admin;
        string uuid;
        string name;
        uint256 supply;
        uint256 id;
        bytes data;
    }

    /**************************
     * Public State Variables *
     *************************/
    address public admin;
    // Used to track badges that are minted.
    Collection[] public collections;

    constructor() {
        admin = msg.sender;
    }

    /********************
     * Public Functions *
     ********************/
    function createCollection(
        address _admin,
        string memory uuid,
        string memory name,
        uint256 supply,
        uint256 id,
        bytes memory data
    ) public returns (VennityCollection tokenAddress) {
        require(
            admin == msg.sender,
            "VennityCollectionFactory: Must be the admin!"
        );

        // Create a new `Token` contract and return its address.
        // From the JavaScript side, the return type
        // of this function is `address`, as this is
        // the closest type available in the ABI.
        VennityCollection collection = new VennityCollection(name, _admin);

        Collection memory _collection = Collection(
            admin,
            uuid,
            name,
            supply,
            id,
            data
        );
        collections.push(_collection);

        return collection;
    }

    function changeName(VennityCollection tokenAddress, string memory name)
        public
    {
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
