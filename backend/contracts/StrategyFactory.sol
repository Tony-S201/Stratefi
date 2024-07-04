// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "./Strategy.sol";

contract StrategyFactory {
    mapping (address => address) strategies;

    event StrategyCreated(address strategyAddress);

    function createStrategy(address _protocol, string memory _strategyType) public {
        Strategy newStrategy = new Strategy(msg.sender, _protocol, _strategyType);
        strategies[msg.sender] = address(newStrategy);
        emit StrategyCreated(address(newStrategy));
    }
}