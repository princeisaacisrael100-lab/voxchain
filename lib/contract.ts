export const CONTRACT_ADDRESS = "0x256e1d3bd8ebcf7bd8df5458b02f5ba92224e8d3";
export const SEPOLIA_CHAIN_ID = "0xaa36a7";

export const CONTRACT_ABI = [
  "function createPoll(string memory question, string[] memory options) external returns (uint256)",
  "function vote(uint256 id, uint256 option) external",
  "function closePoll(uint256 id) external",
  "function deletePoll(uint256 id) external",
  "function getPoll(uint256 id) external view returns (string memory question, string[] memory options, uint256[] memory votes, bool active)",
  "function totalPolls() external view returns (uint256)",
  "function totalVotes(uint256 id) external view returns (uint256)",
  "function didVote(uint256 id, address voter) external view returns (bool)",
  "function isDeleted(uint256 id) external view returns (bool)",
  "function winner(uint256 id) external view returns (uint256 winnerIndex, uint256 winnerVotes)",
];

export interface Poll {
  id: number;
  question: string;
  options: string[];
  votes: number[];
  active: boolean;
  voted: boolean;
  isCreator: boolean;
}
