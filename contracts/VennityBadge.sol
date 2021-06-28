// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4 <=0.9.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "./proxies/ProxyRegistry.sol";

contract VennityBadge is ERC1155 {
    using Strings for string;

    address proxyRegistryAddress;
    uint256 private _currentTokenID = 0;
    mapping(uint256 => address) public creators;
    mapping(uint256 => uint256) public tokenSupply;

    // Contract name
    string public name;
    // Contract symbol
    string public symbol;

    constructor() ERC1155("ipfs://vennity-contracts-url") {)
        string memory _name,
        string memory _symbol,
        address _proxyRegistryAddress
    ) public {
        name = _name;
        symbol = _symbol;
        proxyRegistryAddress = _proxyRegistryAddress;
    }

    function someFunction(address _address) public returns (bool) {
        require(_address == msg.sender, "Can only be called by msg.sender!");

        return true;
    }
}
