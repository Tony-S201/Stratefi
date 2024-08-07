// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity 0.8.24;

import {Governor} from "@openzeppelin/contracts/governance/Governor.sol";
import {GovernorCountingSimple} from "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import {GovernorVotes} from "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import {GovernorVotesQuorumFraction} from "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import {IVotes} from "@openzeppelin/contracts/governance/utils/IVotes.sol";

interface IERC20 {
    function balanceOf(address account) external returns(uint256);
}

/**
 * @title Governance contract for StrateFi DAO.
 * @dev Extends various OpenZeppelin governance modules.
 */
contract StrateFiGovernance is Governor, GovernorCountingSimple, GovernorVotes, GovernorVotesQuorumFraction {

    IERC20 public immutable governanceToken;

    /**
     * @dev Initialize the contract.
     * @param _token The address of the governance token used for voting.
     */
    constructor(IVotes _token)
        Governor("StrateFiGovernance")
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(66)
    {
        governanceToken = IERC20(address(_token));
    }

    // The following functions are overrides required by Solidity.

    /**
     * @notice Override function to custom the voting delay value.
     * @return The voting delay required for voting.
     */
    function votingDelay() public pure virtual override returns (uint256) {
        return 0;
    }

    /**
     * @notice Override function to custom the voting period value.
     * @return The voting period required for voting.
     */
    function votingPeriod() public pure virtual override returns (uint256) {
        return 100800; // 2 weeks
    }

    /**
     * @notice Override function to custom the proposal threshold value.
     * @return The min of votes required to create a proposal.
     */
    function proposalThreshold() public pure virtual override returns (uint256) {
        return 1;
    }

    /**
     * @notice Override function to create a proposal with default parameters except for the description.
     * @param targets List of contract addresses.
     * @param values List of ETH values to send.
     * @param calldatas List of function to call.
     * @param description Description of the proposal.
     */
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    )
        public
        override(Governor)
        returns (uint256)
    {
        targets[0] = 0x0000000000000000000000000000000000000000;
        values[0] = 0;
        calldatas[0] = "";

        address proposer = _msgSender();

        // check description restriction
        if (!_isValidDescriptionForProposer(proposer, description)) {
            revert GovernorRestrictedProposer(proposer);
        }

        // check proposal threshold
        uint256 proposerVotes = governanceToken.balanceOf(proposer);
        uint256 votesThreshold = proposalThreshold();
        if (proposerVotes < votesThreshold) {
            revert GovernorInsufficientProposerVotes(proposer, proposerVotes, votesThreshold);
        }

        return _propose(targets, values, calldatas, description, proposer);
    }
}
