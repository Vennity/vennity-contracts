// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// @author: vennity

import "@openzeppelin/contracts-upgradeable/utils/introspection/IERC165Upgradeable.sol";

interface IContractMetadataURIUpgradeable is IERC165Upgradeable {

    function contractURI() external view returns (string memory);

    function setContractURI(string memory _cURI) external;
}
