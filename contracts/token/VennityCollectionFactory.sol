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
    event VennityCollectionCreated(
        address admin,
        address address_,
        string uuid,
        string name
    );

    struct Collection {
        address admin;
        address address_;
        string uuid;
        string name;
    }

    /**************************
     * Public State Variables *
     *************************/
    address public admin;
    // Used to keep track of how many times `_mint()` method is called.
    // We use this `mintCount` to assign `id`s in the call stack of the
    // `_mint()` method.
    uint256 private mintCount;

    mapping(string => uint256) public _ids;

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
        string memory name
    ) public returns (VennityCollection tokenAddress) {
        require(
            admin == msg.sender,
            "VennityCollectionFactory: Must be the admin!"
        );

        // Used to set `id` to the number of times `_mint` has been called.
        uint256 id;

        // Setting the token ID to `mintCount`.
        mintCount += 1;
        id = mintCount - 1;

        _ids[uuid] = id;

        // Create a new `VennityCollection` contract and return its address.
        // From the JavaScript side, the return type
        // of this function is `address`, as this is
        // the closest type available in the ABI.
        VennityCollection collection = new VennityCollection(name, _admin);
        emit VennityCollectionCreated(_admin, address(collection), uuid, name);

        Collection memory _collection = Collection(
            admin,
            address(collection),
            uuid,
            name
        );
        collections.push(_collection);

        return collection;
    }

    function getCollection(string memory uuid)
        public
        view
        virtual
        returns (Collection memory collectionAddress)
    {
        uint256 collectionId = getId(uuid);
        Collection memory _collection = collections[collectionId];

        return _collection;
    }

    function getAdmin(Collection memory collectionAddress)
        public
        view
        virtual
        returns (address)
    {
        return collectionAddress.admin;
    }

    function getAddress(Collection memory collectionAddress)
        public
        view
        virtual
        returns (address)
    {
        return collectionAddress.address_;
    }

    function getName(Collection memory collectionAddress)
        public
        view
        virtual
        returns (string memory)
    {
        return collectionAddress.name;
    }

    function getUuid(Collection memory collectionAddress)
        public
        view
        virtual
        returns (string memory)
    {
        return collectionAddress.uuid;
    }

    /**
     * @dev Returns the token ID from its token UUID
     */
    function getId(string memory uuid) public view virtual returns (uint256) {
        return _ids[uuid];
    }

    function changeName(VennityCollection tokenAddress, string memory name)
        public
    {
        // Again, the external type of `tokenAddress` is
        // simply `address`.
        tokenAddress.setName(name);
    }
}
