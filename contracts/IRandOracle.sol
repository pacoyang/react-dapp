// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

interface IRandOracle {
    function requestRandomNumber() external returns (uint256);
}