// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.8.9 <=0.9.0;

// import "hardhat/console.sol";

/****************
 * Local imports
 ***************/
import "../utils/Context.sol";
import "../utils/Address.sol";
import "./utils/introspection/ERC165.sol";
import "./IERC1155Receiver.sol";
import "./IERC1155MetadataURI.sol";
import "./IERC1155.sol";
import "./Ownable.sol";

/**
 * @dev Implementation of the basic standard multi-token.
 * See https://eips.ethereum.org/EIPS/eip-1155
 * Originally based on code by Enjin: https://github.com/enjin/erc-1155
 *
 * _Available since v3.1._
 */
contract VennityCollection is Context, ERC165, IERC1155, IERC1155MetadataURI, Ownable {
    using Address for address;

    event SetUri(uint256 id, string uri, string uuid);
    event VennityNFTMinted(uint256 index, NFT nft);

    struct NFT {
        string uuid;
        string name;
        string uri;
        uint256 supply;
        uint256 id;
        bytes data;
    }

    /***************************
     * Private State Variables *
     **************************/
    /******************
     * @dev Not in use!
     *****************/
    // // Mapping from account to operator approvals
    // mapping(address => mapping(address => bool)) private _operatorApprovals;

    // Used to keep track of how many times `_mint()` method is called.
    // We use this `mintCount` to assign `id`s in the call stack of the
    // `_mint()` method.
    uint256 private mintCount;

    // Mapping from token ID to account balances
    mapping(uint256 => mapping(address => uint256)) private _balances;

    // Mapping ERC1155 token ID to its token data (in bytes)
    mapping(uint256 => bytes) private _data;

    // Mapping ERC1155 token data (in bytes) to its token IDs
    mapping(bytes => uint256) private _ids;

    // Mapping from account to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    /**************************
     * Public State Variables *
     *************************/
    /**
     * @dev Not part of ERC1155 standard.
     * @dev va0422 Removing admin in favor of Ownable. 
     */
    //address public admin;
    string public name;
    string public cURI; // contractURI

    // Used to track NFTs that are minted.
    NFT[] public nfts;

    // Mapping token ID to its total supply
    mapping(uint256 => uint256) public _supplies;

    // Mapping token ID to its token URI (as a string)
    mapping(uint256 => string) public _uris;

    // Mapping token ID to its token name
    mapping(uint256 => string) public _names;

    /**
     * @dev Create new ERC1155 contract named `VennityNFT`.
     */
    constructor(string memory _name, string memory _cURI) {
        //admin = _admin;
        //_transferOwnership(_owner);
        name = _name;
        cURI = _cURI;
    }

    /**
     * @dev Returns the `admin` address of this contract.
     */
    /*function getAdmin() public view virtual returns (address admin_) {
        return admin;
    }*/

    /**
     * @dev Returns the name of the contract
     */
    function getCollectionName() public view virtual returns (string memory) {
        return name;
    }

    function getTokenName(uint256 id)
        public
        view
        virtual
        returns (string memory)
    {
        return _names[id];
    }

    /**
     * @dev Returns the token ID from its token UUID
     */
    function getId(string memory uuid) public view virtual returns (uint256) {
        bytes memory data = abi.encode(uuid);
        uint256 id = _ids[data];
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
        string memory uri_ = _uris[id];
        return uri_;
    }

    /**
     * @dev Inspired by {IERC1155MetadataURI-uri}.
     *
     * This implementation returns the token URI from its token UUID
     */
    function setURI(string memory _uuid, string memory _uri) public onlyOwner virtual {
        uint256 id = getId(_uuid);
        _uris[id] = _uri;

        emit SetUri(id, _uri, _uuid);
    }

    /**
     * @dev gets collection details for opensea
     */
    function contractURI() public view returns(string memory) {
        return cURI;
    }

    /**
     * @dev Sets the name of this contract
     */
    function setName(string memory _name) public onlyOwner virtual {
        name = _name;
    }

    /**
     * @dev Inspired by IERC20-totalSupply.
     * @param id The token's ID
     */
    function getSupply(uint256 id) public view virtual returns (uint256) {
        uint256 supply_ = _supplies[id];
        return supply_;
    }

    /**
     * @dev sets the contract URI
     */
    function setContractURI(string memory _cRUI) public onlyOwner virtual {
        cURI = _cRUI;
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
     *****************/
    function setApprovalForAll(address operator, bool approved)
        public
        virtual
        override
    {
        require(
            _msgSender() != operator,
            "ERC1155: setting approval status for self"
        );

        _operatorApprovals[_msgSender()][operator] = approved;
        emit ApprovalForAll(_msgSender(), operator, approved);
    }

    /******************
     *****************/
    function isApprovedForAll(address account, address operator)
        public
        view
        virtual
        override
        returns (bool)
    {
        return _operatorApprovals[account][operator];
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public virtual override {
        require(
            from == _msgSender() || isApprovedForAll(from, _msgSender()),
            "ERC1155: caller is not owner nor approved"
        );
        _safeTransferFrom(from, to, id, amount, data);
    }

    function safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) public virtual override {
         require(
            from == _msgSender() || isApprovedForAll(from, _msgSender()),
            "ERC1155: transfer caller is not owner nor approved"
        );
        _safeBatchTransferFrom(from, to, ids, amounts, data);
    }

    function _safeTransferFrom(
        address from,
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) internal virtual {
        require(to != address(0), "ERC1155: transfer to the zero address");

        address operator = _msgSender();

        _beforeTokenTransfer(operator, from, to, _asSingletonArray(id), _asSingletonArray(amount), data);

        uint256 fromBalance = _balances[id][from];
        require(fromBalance >= amount, "ERC1155: insufficient balance for transfer");
        unchecked {
            _balances[id][from] = fromBalance - amount;
        }
        _balances[id][to] += amount;

        emit TransferSingle(operator, from, to, id, amount);

        _doSafeTransferAcceptanceCheck(operator, from, to, id, amount, data);
    }

    function _safeBatchTransferFrom(
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual {
        require(ids.length == amounts.length, "ERC1155: ids and amounts length mismatch");
        require(to != address(0), "ERC1155: transfer to the zero address");

        address operator = _msgSender();

        _beforeTokenTransfer(operator, from, to, ids, amounts, data);

        for (uint256 i = 0; i < ids.length; ++i) {
            uint256 id = ids[i];
            uint256 amount = amounts[i];

            uint256 fromBalance = _balances[id][from];
            require(fromBalance >= amount, "ERC1155: insufficient balance for transfer");
            unchecked {
                _balances[id][from] = fromBalance - amount;
            }
            _balances[id][to] += amount;
        }

        emit TransferBatch(operator, from, to, ids, amounts);

        _doSafeBatchTransferAcceptanceCheck(operator, from, to, ids, amounts, data);
    }
    
    function mint(address account, string memory name, string memory uri, uint256 amount, string memory uuid)
        public onlyOwner
    {
        _mint(account, name, uri, amount, uuid);
    }

    function _mint(
        address account_,
        string memory name_,
        string memory uri_,
        uint256 amount_,
        string memory uuid_
    ) virtual internal {
        require(
            account_ != address(0),
            "ERC1155: cannot mint to the zero address"
        );
        //require(
        //    msg.sender == admin,
        //    "ERC1155: only the admin of this contract can call `_mint()`!"
        //);
        //require(account_ == admin, "ERC1155: account must be the admin!");

        // Get the bytes of `uuid`.
        bytes memory data = abi.encode(uuid_);
        // Used to set `id` to the number of times `_mint` has been called.
        uint256 id;
        // Used to get the sha256 of the token data
        bytes memory data_;

        // Setting the token ID to `mintCount`.
        mintCount += 1;
        id = mintCount - 1;

        // Variables with `<NAME>_` notation represent variables that I
        // create from inputs.
        data_ = _data[id];

        // If ERC1155 token data is not already mapped, create mapping.
        if (keccak256(data_) != keccak256(data)) {
            _data[id] = data;
            data_ = _data[id];
        }

        _ids[data_] = id; // Set token ID.
        _names[id] = name_; // Set token name.
        _uris[id] = uri_; // Set token URI

        // Set the total token supply for these ERC1155 tokens that are minted.
        if (_supplies[id] != 0) {
            _supplies[id] = amount_;
        } else {
            _supplies[id] = 0;
            _supplies[id] = amount_;
        }

        NFT memory nft = NFT(uuid_, name_, uri_, amount_, id, data);
        // Push new nft struct to storage.
        nfts.push(nft);

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
        emit VennityNFTMinted(nfts.length - 1, nft);

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

    function mintBatch(address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data)
        public onlyOwner
    {
        _mintBatch(to, ids, amounts, data);
    }
    
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
    function burn(	
        address account,	
        uint256 id,	
        uint256 value	
    ) public virtual {	
        require(	
            account == _msgSender() || isApprovedForAll(account, _msgSender()),	
            "ERC1155: caller is not owner nor approved"	
        );	
        _burn(account, id, value);	
    }	
    
    function burnBatch(	
        address account,	
        uint256[] memory ids,	
        uint256[] memory values	
    ) public virtual {	
        require(	
            account == _msgSender() || isApprovedForAll(account, _msgSender()),	
            "ERC1155: caller is not owner nor approved"	
        );	
        _burnBatch(account, ids, values);	
    }

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
