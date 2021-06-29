// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4 <=0.9.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "./token/ERC1155.sol";

contract VennityBadge is ERC1155 {
    using Strings for string;

    address _proxyRegistryAddress;
    uint256 private _currentTokenID = 0;

    mapping(uint256 => address) public _creators;

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
     * @param name_ Name of this VennityBadge
     * @param uri_ Token URI of this VennityBadge
     */
    constructor(string memory name_, string memory uri_) ERC1155(name_, uri_) {}
}
