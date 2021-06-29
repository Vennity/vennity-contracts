// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4 <=0.9.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

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

    // /**
    //  * @dev Once deployed, we will be able to query the deployer's (i.e. the
    //  * `VennityDeployer.sol` contract) balance of `VennityBadge` ERC1155 tokens.
    //  *
    //  * To transfer tokens between accounts or users, use `safeTransferFrom()`.
    //  * You can confirm that the specified tokens were transferred successfully
    //  * by comparing the recipient and deployer's balances:
    //  * `VennityBadge.balanceOf(recipientAddress, tokenID)
    //  *   > VennityBadge.balanceOf(deployerAddress, tokenID)`
    //  *
    //  * To batch transfer
    //  * @param _name Name of this VennityBadge
    //  * @param _symbol Symbol of this VennityBadge
    //  * @param _proxyRegistryAddress Address of the proxy registry contract
    //  */
    // constructor(
    //     string memory _name,
    //     string memory _symbol,
    //     address _proxyRegistryAddress
    // ) ERC1155("ipfs://vennity-contracts-url") {
    // ) public {
    //     name = _name;
    //     symbol = _symbol;
    //     proxyRegistryAddress = _proxyRegistryAddress;
    // }

    /**
     * @dev Once deployed, we will be able to query the deployer's (i.e. the
     * `VennityDeployer.sol` contract) balance of `VennityBadge` ERC1155 tokens.
     *
     * To transfer tokens between accounts or users, use `safeTransferFrom()`.
     * You can confirm that the specified tokens were transferred successfully
     * by comparing the recipient and deployer's balances:
     * `VennityBadge.balanceOf(recipientAddress, tokenID)
     *   > VennityBadge.balanceOf(deployerAddress, tokenID)`
     *
     * To batch transfer
     * @param _name Name of this VennityBadge
     * @param _symbol Symbol of this VennityBadge
     */
    constructor(
        string memory _name,
        string memory _symbol,
        string memory _uri
    ) ERC1155(_uri) {
        name = _name;
        symbol = _symbol;
    }

    function getTokenID(address _address) public returns (bool) {
        require(_address == msg.sender, "Can only be called by msg.sender!");

        return true;
    }
}
