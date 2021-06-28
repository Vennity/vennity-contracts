// SPDX-License-Identifier: MIT
pragma solidity >=0.8.4 <=0.9.0;

import "./OwnableDelegateProxy.sol";

contract ProxyRegistry {
    mapping(address => OwnableDelegateProxy) public proxies;
}
