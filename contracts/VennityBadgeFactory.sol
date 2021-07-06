// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4 <=0.9.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import {ERC1155} from "./token/ERC1155.sol";

contract VennityBadgeFactory {
    event VennityBadgeCreated(
        address indexed _vennityBadge,
        string indexed tokenUUID
    );

    address admin;

    constructor() {
        admin = msg.sender;
    }

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
     * @param name_ Name of VennityBadge to create
     * @param uri_ URI of VennityBadge to create
     * @param amount_ Amount of VennityBadges to create.
     */
    function createERC1155(
        string memory name_,
        string memory uri_,
        uint256 amount_,
        string memory tokenUUID_
    ) external {
        require(
            msg.sender == admin,
            "VennityBadgeFactory: msg.sender is not the admin!"
        );

        address _account;
        bytes memory data;

        // Get the bytes of the token UUID.
        data = abi.encode(tokenUUID_);

        ERC1155 vennityBadge = new ERC1155(name_, uri_, amount_, tokenUUID_);

        emit VennityBadgeCreated(address(vennityBadge), tokenUUID_);
    }
}
