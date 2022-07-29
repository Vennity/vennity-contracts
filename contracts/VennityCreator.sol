// // SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@manifoldxyz/creator-core-solidity/contracts/ERC1155CreatorUpgradeable.sol";

contract VennityCreator is ERC1155CreatorUpgradeable {
    
    string private cURI;

    function initialize(string memory _cURI) public initializer {
        ERC1155CreatorUpgradeable.initialize(); // Do not forget this call!
        setContractURI(_cURI);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC1155CreatorUpgradeable) returns (bool) {
        return ERC1155CreatorUpgradeable.supportsInterface(interfaceId);
    }

     /**
     * @dev gets collection details for opensea
    */
    function contractURI() public view returns(string memory) {
        return cURI;
    }

    /**
     * @dev sets the contract URI
    */
    function setContractURI(string memory _cURI) public adminRequired virtual {
        _setContractURI(_cURI);
    }

    function _setContractURI(string memory _cURI) internal virtual {
        cURI = _cURI;
    }
}
