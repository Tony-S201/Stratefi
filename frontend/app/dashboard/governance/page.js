'use client';

// Constants
import { contractAbi, contractAddress } from "@/constants/governance";

// Wagmi
import { useWatchContractEvent, useWriteContract, useWatchBlockNumber } from "wagmi";

// React
import { useState } from "react";

// UI
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

const Governance = () => {

  const { toast } = useToast();

  const [ currentBlockNumber, setCurrentBlockNumber ] = useState(0);

  useWatchBlockNumber({
    onBlockNumber(blockNumber) {
      setCurrentBlockNumber(Number(blockNumber))
    },
  });

  const [ proposals, setProposals ] = useState();

  useWatchContractEvent({
    address: contractAddress,
    abi: contractAbi,
    fromBlock: BigInt(0),
    eventName: "ProposalCreated",
    onLogs(logs) {
      console.log(logs)
      if (logs.length > 0) {
        setProposals(logs);
      }
    }
  });

  const timeRemaining = (voteEnd) => {
    if (voteEnd && currentBlockNumber) {
      const blocksRemaining = voteEnd - currentBlockNumber;
      const secondsPerBlock = 13;
      const timeRemainingInSeconds = blocksRemaining * secondsPerBlock;
      const timeRemainingInMinutes = timeRemainingInSeconds / 60;
      const timeRemainingInHours = timeRemainingInMinutes / 60;
      return Math.round(timeRemainingInHours / 24);
    }
    return 0;
  };

  const [ proposalInput, setProposalInput ] = useState("");

  const handleInputChange = (event) => {
    setProposalInput(event.target.value);
  };

  const { writeContractAsync } = useWriteContract();

  const handleAddProposal = async() => {
    try {
      await writeContractAsync({
        abi: contractAbi,
        address: contractAddress,
        functionName: "propose",
        args: [
          ["0x0000000000000000000000000000000000000000"],
          [0],
          ["0x"],
          proposalInput
        ]
      })

      setProposalInput("");
    } catch (err) {
      console.log(err);
    }
  };

  const [ votes, setVotes ] = useState({});

  const handleVoteSelection = (index, choice) => {
    setVotes((prevVotes) => ({
      ...prevVotes,
      [index]: choice
    }));
  };

  const { writeContract } = useWriteContract();

  const handleVoteSubmit = (index, proposalId) => {
    const vote = votes[index];
    if (vote !== undefined && proposalId) {

      writeContract({
        abi: contractAbi,
        address: contractAddress,
        functionName: "castVote",
        args: [
          [proposalId],
          [vote]
        ]
      }, {onError: (error) => {
        toast({
          variant: "destructive",
          title: "Vote error.",
          description: error.cause.message
        }) 
      }});
    } else {
      toast({
        variant: "destructive",
        title: "Something went wrong.",
        description: "No vote selected for proposal"
      })
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold">Proposals</h2>
      <div className="flex my-4">
        <Input onChange={handleInputChange} type="text" placeholder="Description" className="w-1/2 mr-4 rounded-xl"/>
        <Button onClick={handleAddProposal}>Add New Proposal</Button>
      </div>
      {!proposals || proposals.length === 0 ? (
        <div>No proposals</div>
      ) : (
        <div className="flex flex-col w-2/3 max-height-60 overflow-y-scroll">
          {proposals.map((proposal, index) => (
            <div key={index} className="border rounded-xl p-4 my-4">
              <div className="flex justify-between">
                <div className="flex items-center">
                  <Avatar className="mr-1">
                    <AvatarFallback>T</AvatarFallback>
                  </Avatar>
                  <div>{proposal.args.proposer}</div>
                </div>
                <Badge variant="secondary">{timeRemaining(Number(proposal.args.voteEnd))} days</Badge>
              </div>
              <p className="p-4">{proposal.args.description}</p>
              <div className="px-4">
                <div className="mb-2 font-bold">Cast your vote</div>
                <div className="w-36 text-center">
                <div
                    className={`border rounded-xl p-1 mb-1 cursor-pointer ${votes[index] === 1 ? 'bg-green-200' : ''}`}
                    onClick={() => handleVoteSelection(index, 1)}
                  >
                    For
                  </div>
                  <div
                    className={`border rounded-xl p-1 mb-1 cursor-pointer ${votes[index] === 0 ? 'bg-red-200' : ''}`}
                    onClick={() => handleVoteSelection(index, 0)}
                  >
                    Against
                  </div>
                  <div
                    className={`border rounded-xl p-1 mb-1 cursor-pointer ${votes[index] === 2 ? 'bg-yellow-200' : ''}`}
                    onClick={() => handleVoteSelection(index, 2)}
                  >
                    Abstain
                  </div>
                  <Button className="border rounded-xl p-1 my-1 w-36" onClick={() => handleVoteSubmit(index, proposal.args.proposalId)}>
                    Vote
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Governance;