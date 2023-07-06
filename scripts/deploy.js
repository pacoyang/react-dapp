// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
import hre from "hardhat";

const greeter = await hre.ethers.deployContract("Greeter", ["Hello World"]);
await greeter.waitForDeployment();

const token = await hre.ethers.deployContract("Token");
await token.waitForDeployment();

const openToken = await hre.ethers.deployContract("OpenToken", ["Open Fun Token", "OFN"]);
await openToken.waitForDeployment();

console.log(`Greeter successfully deployed to ${greeter.target}`);
console.log(`Token successfully deployed to ${token.target}`);
console.log(`OpenToken successfully deployed to ${openToken.target}`);
