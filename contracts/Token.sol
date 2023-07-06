// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
import "hardhat/console.sol";

contract Token {
    string public name = "Fun Token";
    string public symbol = "FUN";
    uint public totalSupply = 1000000;

    mapping(address => uint) balances;

    constructor() {
        balances[msg.sender] = totalSupply;
    }

    function balanceOf(address account) external view returns (uint) {
        return balances[account];
    }

    function transfer(address toUser, uint amount) external {
        require(balances[msg.sender] >= amount, "Not enough tokens");
        balances[msg.sender] -= amount;
        balances[toUser] += amount;
    }
}