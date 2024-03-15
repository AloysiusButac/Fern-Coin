// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Fern is ERC20, Ownable {
    mapping(address => uint256) private _stakes;                // no. of stakes
    mapping(address => uint256) private _lastStakeTimestamp;    // tiem since last stake
    uint256 private _rewardRate = 1;                            // set reward rate
    uint256 private lockInPeriod = 30;                          // withdrawal waiting period


    // CONSTRUCTOR
    constructor(address initialOwner) ERC20("Fern", "FRN") Ownable(initialOwner)
    {}

    // Mints Coins
    function mint(address addrReceiver, uint256 amount) external onlyOwner 
    {
        // Get equiv amount in Fern
        uint256 adjustedAmount = amount * 1e18;
        _mint(addrReceiver, adjustedAmount);
    }

    // Stake Coins
    function stake(uint256 amount) external 
    {
        require(amount * 1e18 > 0, "Cannot stake 0 tokens");                        // Staked amount should be > zero
        require(balanceOf(msg.sender) >= amount * 1e18, "Insufficient balance");    // Sender should have enough funds

        // Get equivalend Wei
        uint256 adjustedAmount = amount * 1e18;

        // Calculate and process stake
        _stakes[msg.sender] = _stakes[msg.sender] + adjustedAmount;         // Record stake
        _lastStakeTimestamp[msg.sender] = block.timestamp;                  // Record time since last stake
        _transfer(msg.sender, address(this), adjustedAmount);               // Stake an amount
    }

    // Iwthdraw oins
    function withdraw() external {
        // Wait for waiting period
        require( block.timestamp > (_lastStakeTimestamp[msg.sender] + lockInPeriod), "Cannot withdraw, still in the lock-in period");
        // Make sure to have enough staked tokens
        require(_stakes[msg.sender] > 0, "No staked tokens");

        uint256 stakedAmount = _stakes[msg.sender];
        uint256 reward = (block.timestamp - _lastStakeTimestamp[msg.sender]) * _rewardRate * 1e18;

        _stakes[msg.sender] = 0;
        _transfer(address(this), msg.sender, stakedAmount);
        _mint(msg.sender, reward);
    }

    // HELPER FUNCTIONS

    // Get stakes of Fern Coins
    function getStake(address account) external view returns (uint256) {
        uint256 stakedInWei = _stakes[account];
        return stakedInWei / 1e18;
    }

    function getWithdraw(address account) external view returns (uint256) {
        uint256 stakedAmount = _stakes[account] / 1e18;
        uint256 reward = (block.timestamp - _lastStakeTimestamp[account]) * _rewardRate;

        return stakedAmount + reward;
    }

    function getElapsedStakeTime(address account) external view returns (uint256) {
        return block.timestamp - _lastStakeTimestamp[account];
    }

    function getLastStakeTimestamp(address account) external view returns (uint256) {
        return _lastStakeTimestamp[account];
    }
}
