// SPDX-License-Identifier: Unlicense
pragma solidity >=0.8.4 <=0.9.0;

import {VennityBadge} from "./token/VennityBadge.sol";

contract VennityBadgeMinter {
    address admin;
    VennityBadge vennityBadge;

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
    function create(string memory _tokenUUID) public {
        require(
            msg.sender == admin,
            "VennityBadgeMinter: msg.sender is not the admin!"
        );

        // NOTE: `vennityBadge` is a new instance of an ERC1155 token.
        vennityBadge = new VennityBadge();

        Badge memory badge = Badge(address(vennityBadge), _tokenUUID);
        badges.push(badge);

        // Emit event of token creation to retrieve event data on FE.
        emit VennityBadgeCreated(badge.badgeAddress, badge.badgeUUID);
    }

    /**
     * TODO: Need to be able to transfer minted tokens from the recieving
     *       address
     */
    function mint(
        address _account,
        string memory _name,
        string memory _uri,
        uint256 _amount,
        bytes memory _data
    ) public {
        require(
            msg.sender == admin,
            "VennityBadgeFactory: msg.sender is not the admin!"
        );

        vennityBadge._mint(_account, _name, _uri, _amount, _data);
    }

    /**
     * TODO: Need to be able to transfer minted tokens from the recieving
     *       address
     */
    function createThenMint(
        string memory _tokenUUID,
        address _account,
        string memory _name,
        string memory _uri,
        uint256 _amount,
        bytes memory _data
    ) external {
        create(_tokenUUID);
        mint(_account, _name, _uri, _amount, _data);
    }
}
