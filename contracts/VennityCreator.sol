// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@manifoldxyz/creator-core-solidity/contracts/ERC1155CreatorUpgradeable.sol";
import "./extensions/ContractMetadataURIUpgradeable.sol";

contract VennityCreator is ERC1155CreatorUpgradeable, ContractMetadataURIUpgradeable {
    
    
    function initialize(string memory _cURI) public initializer {
        ERC1155CreatorUpgradeable.initialize(); // Do not forget this call!
        __ContractMetadataURIUpgradeable_init(_cURI);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155CreatorUpgradeable, ContractMetadataURIUpgradeable) returns (bool) {
        return ERC1155CreatorUpgradeable.supportsInterface(interfaceId) || ContractMetadataURIUpgradeable.supportsInterface(interfaceId);
    }
}