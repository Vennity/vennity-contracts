// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./VennityCreatorProxy.sol";

contract VenProxy is VennityCreatorProxy {
    constructor(address _implementation, string memory _cURI) VennityCreatorProxy(_implementation, _cURI) {}
}
