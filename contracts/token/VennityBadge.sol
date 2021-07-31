// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4 <=0.9.0;

/*******************
 * External imports
 ******************/
// import "@openzeppelin/contracts/utils/Context.sol";
// import "@openzeppelin/contracts/utils/Address.sol";
// import "@openzeppelin/contracts/utils/introspection/ERC165.sol";
// import "@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol";
// import "@openzeppelin/contracts/token/ERC1155/extensions/IERC1155MetadataURI.sol";
// import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "hardhat/console.sol";

/****************
 * Local imports
 ***************/
import "../utils/Context.sol";
import "../utils/Address.sol";
import "../utils/introspection/ERC165.sol";
import "./IERC1155Receiver.sol";
import "./extensions/IERC1155MetadataURI.sol";
import "./IERC1155.sol";

/**
 * @dev Implementation of the basic standard multi-token.
 * See https://eips.ethereum.org/EIPS/eip-1155
 * Originally based on code by Enjin: https://github.com/enjin/erc-1155
 *
 * _Available since v3.1._
 */
contract VennityBadge is Context, ERC165, IERC1155, IERC1155MetadataURI {
    using Address for address;

    struct Badge {
        string tokenUUID;
        string name;
        string tokenURI;
        string tokenMetadata;
        uint256 tokenSupply;
        uint256 tokenID;
        bytes tokenData;
    }

    event SetTokenURI(uint256 id, string tokenURI, string tokenUUID);
    event VennityBadgeMinted(uint256 index, Badge badge);

    // Mapping from token ID to account balances
    mapping(uint256 => mapping(address => uint256)) private _balances;

    // Mapping ERC1155 token ID to its token data (in bytes)
    mapping(uint256 => bytes) private _tokenData;

    // Mapping ERC1155 token data (in bytes) to its token IDs
    mapping(bytes => uint256) private _tokenIDs;

    // Mapping token ID to its total supply
    mapping(uint256 => uint256) public _tokenSupplies;

    // Mapping token ID to its token URI (as a string)
    mapping(uint256 => string) public _tokenURIs;

    // Mapping ERC1155 token ID to its token metadata URL (as a string)
    mapping(uint256 => string) private _tokenMetadatas;

    // Mapping token ID to its token name
    mapping(uint256 => string) public _tokenNames;

    // Used to track badges that are minted.
    Badge[] public badges;

    // Used to keep track of how many times `_mint()` method is called.
    // We use this `mintCount` to assign `id`s in the call stack of the
    // `_mint()` method.
    uint256 private mintCount;

    /**
     * @dev Not part of ERC1155 standard.
     * Admin of the contract. Is the only one who can call `_mint()`.
     */
    address _admin;

    /**
     * @dev Create new ERC1155 contract named `VennityBadge`.
     */
    constructor() {
        _admin = msg.sender;
    }

    /**
     * @dev Returns the `_admin` address of this contract.
     */
    function getAdmin() public view virtual returns (address admin_) {
        return _admin;
    }

    /**
     * @dev Returns the name of the token from its ID
     */
    function tokenName(uint256 id) public view virtual returns (string memory) {
        string memory _name = _tokenNames[id];
        return _name;
    }

    /**
     * @dev Returns the token ID from its token UUID
     */
    function tokenID(string memory tokenUUID)
        public
        view
        virtual
        returns (uint256)
    {
        bytes memory tokenData = abi.encode(tokenUUID);
        uint256 id = _tokenIDs[tokenData];
        return id;
    }

    /**
     * @dev Inspired by {IERC1155MetadataURI-uri}.
     *
     * This implementation returns the token URI from its token UUID
     */
    function uri(uint256 id)
        public
        view
        virtual
        override
        returns (string memory)
    {
        string memory uri_ = _tokenURIs[id];
        return uri_;
    }

    /**
     * @dev Inspired by {IERC1155MetadataURI-uri}.
     *
     * This implementation returns the token URI from its token UUID
     */
    function setURI(string memory _tokenUUID, string memory _uri)
        public
        virtual
    {
        uint256 id = tokenID(_tokenUUID);
        _tokenURIs[id] = _uri;

        emit SetTokenURI(id, _uri, _tokenUUID);
    }

    /**
     * @dev Inspired by IERC20-totalSupply.
     * @param id The token's ID
     */
    function tokenSupply(uint256 id) public view virtual returns (uint256) {
        uint256 tokenSupply_ = _tokenSupplies[id];
        return tokenSupply_;
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC165, IERC165)
        returns (bool)
    {
        return
            interfaceId == type(IERC1155).interfaceId ||
            interfaceId == type(IERC1155MetadataURI).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    /**
     * @dev See {IERC1155-balanceOf}.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     */
    function balanceOf(address account, uint256 id)
        public
        view
        virtual
        override
        returns (uint256)
    {
        require(
            account != address(0),
            "ERC1155: balance query for the zero address"
        );
        return _balances[id][account];
    }

    /**
     * @dev See {IERC1155-balanceOfBatch}.
     *
     * Requirements:
     *
     * - `accounts` and `ids` must have the same length.
     */
    function balanceOfBatch(address[] memory accounts, uint256[] memory ids)
        public
        view
        virtual
        override
        returns (uint256[] memory)
    {
        require(
            accounts.length == ids.length,
            "ERC1155: accounts and ids length mismatch"
        );

        uint256[] memory batchBalances = new uint256[](accounts.length);

        for (uint256 i = 0; i < accounts.length; ++i) {
            batchBalances[i] = balanceOf(accounts[i], ids[i]);
        }

        return batchBalances;
    }

    /******************
     * @dev Not in use!
     *****************/
    // function setApprovalForAll(address operator, bool approved)
    //     public
    //     virtual
    //     override
    // {
    //     require(
    //         _msgSender() != operator,
    //         "ERC1155: setting approval status for self"
    //     );

    //     _operatorApprovals[_msgSender()][operator] = approved;
    //     emit ApprovalForAll(_msgSender(), operator, approved);
    // }

    /******************
     * @dev Not in use!
     *****************/
    // function isApprovedForAll(address account, address operator)
    //     public
    //     view
    //     virtual
    //     override
    //     returns (bool)
    // {
    //     return _operatorApprovals[account][operator];
    // }

    /**
     * @dev See {IERC1155-safeTransferFrom}.
     */
    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount // bytes memory data // OMIT this to save on gas.
    ) public virtual {
        require(to != address(0), "ERC1155: transfer to the zero address");
        require(
            msg.sender == _admin,
            "ERC1155: caller is not the contract admin!"
        );

        address operator = _msgSender();

        bytes memory data = _tokenData[id];

        _beforeTokenTransfer(
            operator,
            from,
            to,
            _asSingletonArray(id),
            _asSingletonArray(amount),
            data
        );

        uint256 fromBalance = _balances[id][from];
        require(
            fromBalance >= amount,
            "ERC1155: insufficient balance for transfer"
        );
        _balances[id][from] = fromBalance - amount;
        _balances[id][to] += amount;

        emit TransferSingle(operator, from, to, id, amount);

        _doSafeTransferAcceptanceCheck(operator, from, to, id, amount, data);
    }

    /**
     * @dev See {IERC1155-safeBatchTransferFrom}.
     */
    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public virtual override {
        require(
            ids.length == amounts.length,
            "ERC1155: ids and amounts length mismatch"
        );
        require(to != address(0), "ERC1155: transfer to the zero address");
        require(
            msg.sender == _admin,
            "ERC1155: caller is not the contract admin!"
        );

        address operator = _msgSender();

        _beforeTokenTransfer(operator, from, to, ids, amounts, data);

        for (uint256 i = 0; i < ids.length; ++i) {
            uint256 id = ids[i];
            uint256 amount = amounts[i];

            uint256 fromBalance = _balances[id][from];
            require(
                fromBalance >= amount,
                "ERC1155: insufficient balance for transfer"
            );
            _balances[id][from] = fromBalance - amount;
            _balances[id][to] += amount;
        }

        emit TransferBatch(operator, from, to, ids, amounts);

        _doSafeBatchTransferAcceptanceCheck(
            operator,
            from,
            to,
            ids,
            amounts,
            data
        );
    }

    /**
     * @dev Creates `amount` tokens of token type `id`, and holds on to them in
     *      this contract.
     *
     * Emits a {TransferSingle} event.
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - If `account` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155Received} and return the
     * acceptance magic value.
     */
    function _mint(
        string memory name_,
        string memory uri_,
        string memory tokenMetadata_,
        uint256 amount_,
        string memory tokenUUID_
    ) public {
        require(
            msg.sender == _admin,
            "ERC1155: only the admin of this contract can call `_mint()`!"
        );

        // Set account to transfer to to be this VennityBadge contract.
        address account_ = address(this);

        // Get the bytes of `tokenUUID`.
        bytes memory data = abi.encode(tokenUUID_);
        // Used to set `tokenID` to the number of times `_mint` has been called.
        uint256 id;
        // Used to get the sha256 of the token data
        bytes memory tokenData_;

        // Setting the token ID to `mintCount`.
        mintCount += 1;
        id = mintCount - 1;

        // Variables with `<NAME>_` notation represent variables that I
        // create from inputs.
        tokenData_ = _tokenData[id];

        // If ERC1155 token data is not already mapped, create mapping.
        if (keccak256(tokenData_) != keccak256(data)) {
            _tokenData[id] = data;
            tokenData_ = _tokenData[id];
        }

        _tokenIDs[tokenData_] = id; // Set token's ID.
        _tokenNames[id] = name_; // Set token's name.
        _tokenURIs[id] = uri_; // Set token's URI
        _tokenMetadatas[id] = tokenMetadata_; // Set the token's metadata.

        // Set the total token supply for these ERC1155 tokens that are minted.
        if (_tokenSupplies[id] != 0) {
            _tokenSupplies[id] = amount_;
        } else {
            _tokenSupplies[id] = 0;
            _tokenSupplies[id] = amount_;
        }

        Badge memory badge = Badge(
            tokenUUID_,
            name_,
            uri_,
            tokenMetadata_,
            amount_,
            id,
            data
        );
        // Push new badge struct to storage.
        badges.push(badge);

        address operator = _msgSender();

        _beforeTokenTransfer(
            operator,
            address(0),
            account_,
            _asSingletonArray(id),
            _asSingletonArray(amount_),
            data
        );

        _balances[id][account_] += amount_;

        emit TransferSingle(operator, address(0), account_, id, amount_);
        // Emit event of token creation to retrieve event data on FE.
        emit VennityBadgeMinted(badges.length - 1, badge);

        _doSafeTransferAcceptanceCheck(
            operator,
            address(0),
            account_,
            id,
            amount_,
            data
        );
    }

    /**
     * @dev xref:ROOT:erc1155.adoc#batch-operations[Batched] version of {_mint}.
     *
     * Requirements:
     *
     * - `ids` and `amounts` must have the same length.
     * - If `to` refers to a smart contract, it must implement {IERC1155Receiver-onERC1155BatchReceived} and return the
     * acceptance magic value.
     */
    function _mintBatch(
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual {
        require(to != address(0), "ERC1155: mint to the zero address");
        require(
            ids.length == amounts.length,
            "ERC1155: ids and amounts length mismatch"
        );

        address operator = _msgSender();

        _beforeTokenTransfer(operator, address(0), to, ids, amounts, data);

        for (uint256 i = 0; i < ids.length; i++) {
            _balances[ids[i]][to] += amounts[i];
        }

        emit TransferBatch(operator, address(0), to, ids, amounts);

        _doSafeBatchTransferAcceptanceCheck(
            operator,
            address(0),
            to,
            ids,
            amounts,
            data
        );
    }

    /**
     * @dev Destroys `amount` tokens of token type `id` from `account`
     *
     * Requirements:
     *
     * - `account` cannot be the zero address.
     * - `account` must have at least `amount` tokens of token type `id`.
     */
    function _burn(
        address account,
        uint256 id,
        uint256 amount
    ) internal virtual {
        require(account != address(0), "ERC1155: burn from the zero address");

        address operator = _msgSender();

        _beforeTokenTransfer(
            operator,
            account,
            address(0),
            _asSingletonArray(id),
            _asSingletonArray(amount),
            ""
        );

        uint256 accountBalance = _balances[id][account];
        require(
            accountBalance >= amount,
            "ERC1155: burn amount exceeds balance"
        );
        _balances[id][account] = accountBalance - amount;

        emit TransferSingle(operator, account, address(0), id, amount);
    }

    /**
     * @dev xref:ROOT:erc1155.adoc#batch-operations[Batched] version of {_burn}.
     *
     * Requirements:
     *
     * - `ids` and `amounts` must have the same length.
     */
    function _burnBatch(
        address account,
        uint256[] memory ids,
        uint256[] memory amounts
    ) internal virtual {
        require(account != address(0), "ERC1155: burn from the zero address");
        require(
            ids.length == amounts.length,
            "ERC1155: ids and amounts length mismatch"
        );

        address operator = _msgSender();

        _beforeTokenTransfer(operator, account, address(0), ids, amounts, "");

        for (uint256 i = 0; i < ids.length; i++) {
            uint256 id = ids[i];
            uint256 amount = amounts[i];

            uint256 accountBalance = _balances[id][account];
            require(
                accountBalance >= amount,
                "ERC1155: burn amount exceeds balance"
            );
            _balances[id][account] = accountBalance - amount;
        }

        emit TransferBatch(operator, account, address(0), ids, amounts);
    }

    /**
     * @dev Hook that is called before any token transfer. This includes minting
     * and burning, as well as batched variants.
     *
     * The same hook is called on both single and batched variants. For single
     * transfers, the length of the `id` and `amount` arrays will be 1.
     *
     * Calling conditions (for each `id` and `amount` pair):
     *
     * - When `from` and `to` are both non-zero, `amount` of ``from``'s tokens
     * of token type `id` will be  transferred to `to`.
     * - When `from` is zero, `amount` tokens of token type `id` will be minted
     * for `to`.
     * - when `to` is zero, `amount` of ``from``'s tokens of token type `id`
     * will be burned.
     * - `from` and `to` are never both zero.
     * - `ids` and `amounts` have the same, non-zero length.
     *
     * To learn more about hooks, head to xref:ROOT:extending-contracts.adoc#using-hooks[Using Hooks].
     */
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual {}

    function _doSafeTransferAcceptanceCheck(
        address operator,
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) private {
        if (to.isContract()) {
            try
                IERC1155Receiver(to).onERC1155Received(
                    operator,
                    from,
                    id,
                    amount,
                    data
                )
            returns (bytes4 response) {
                if (
                    response != IERC1155Receiver(to).onERC1155Received.selector
                ) {
                    revert("ERC1155: ERC1155Receiver rejected tokens");
                }
            } catch Error(string memory reason) {
                revert(reason);
            } catch {
                revert("ERC1155: transfer to non ERC1155Receiver implementer");
            }
        }
    }

    function _doSafeBatchTransferAcceptanceCheck(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) private {
        if (to.isContract()) {
            try
                IERC1155Receiver(to).onERC1155BatchReceived(
                    operator,
                    from,
                    ids,
                    amounts,
                    data
                )
            returns (bytes4 response) {
                if (
                    response !=
                    IERC1155Receiver(to).onERC1155BatchReceived.selector
                ) {
                    revert("ERC1155: ERC1155Receiver rejected tokens");
                }
            } catch Error(string memory reason) {
                revert(reason);
            } catch {
                revert("ERC1155: transfer to non ERC1155Receiver implementer");
            }
        }
    }

    function _asSingletonArray(uint256 element)
        private
        pure
        returns (uint256[] memory)
    {
        uint256[] memory array = new uint256[](1);
        array[0] = element;

        return array;
    }
}
