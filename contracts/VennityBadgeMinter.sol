// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4 <=0.9.0;

import {VennityBadge} from "./token/VennityBadge.sol";
import "hardhat/console.sol";

contract VennityBadgeMinter {
    address admin;

    event VennityBadgeCreated(address indexed vennityBadge, string tokenUUID);

    struct Badge {
        address badgeAddress;
        string badgeUUID;
    }

    /**
     * TODO: Need events for minting of badges
     */
    Badge[] public badges;

    constructor() {
        admin = msg.sender;
    }

    /**
     * @dev Creates a new VennityBadge as an ERC1155 token.
     */
    function create(
        string memory _tokenUUID,
        string memory _name,
        string memory _uri,
        uint256 _amount
    ) public returns (VennityBadge badgeAddress) {
        require(
            msg.sender == admin,
            "VennityBadgeMinter: msg.sender is not the admin!"
        );

        // NOTE: `vennityBadge` is a new instance of an ERC1155 token.
        VennityBadge vennityBadge = new VennityBadge();

        Badge memory badge = Badge(address(vennityBadge), _tokenUUID);
        badges.push(badge);

        // Emit event of token creation to retrieve event data on FE.
        emit VennityBadgeCreated(badge.badgeAddress, badge.badgeUUID);

        mint(vennityBadge, _name, _uri, _amount, _tokenUUID);

        return vennityBadge;
    }

    /**
     * TODO: Need to be able to transfer minted tokens from the receiving
     *       address
     */
    function mint(
        VennityBadge badgeAddress,
        string memory _name,
        string memory _uri,
        uint256 _amount,
        string memory _tokenUUID
    ) public {
        // console.log("Admin address of VennityBadgeMinter: ", admin);
        // // console.log("The calling address of VennityBadgeMinter: ", msg.sender);
        // console.log("Address of VennityBadgeMinter contract: ", address(this));
        require(
            msg.sender == admin,
            "VennityBadgeFactory: msg.sender is not the admin!"
        );

        bytes memory data = abi.encode(_tokenUUID);

        badgeAddress._mint(msg.sender, _name, _uri, _amount, data);
    }
}
