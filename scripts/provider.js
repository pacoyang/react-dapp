import hre from "hardhat";
import fs from "fs";

const SLEEP_TIME = 2000;
const BATCH_SIZE = 3;

function getRandomInteger(min, max) {
  min = Math.floor(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const provider = new ethers.WebSocketProvider("ws://localhost:8545");
const signer = await provider.getSigner();
console.info("Signer address:", signer.address);

// deploy contracts
const randOracle = await ethers.deployContract("RandOracle");
await randOracle.waitForDeployment();
console.info("RandOracle deployed to:", randOracle.target);
const caller = await ethers.deployContract("Caller");
await caller.waitForDeployment();
console.info("Caller deployed to:", caller.target);

// listen to contract event
const RandOracle = JSON.parse(
  fs
    .readFileSync("./artifacts/contracts/RandOracle.sol/RandOracle.json")
    .toString()
);
const contract = new ethers.Contract(
  randOracle.target,
  RandOracle.abi,
  signer
);
await randOracle.addProvider(signer);
const requestsQueue = [];
contract.on(
  "RandomNumberRequested",
  async (callerAddress, id) => {
    console.info(`RandomNumberRequested: ${callerAddress} ${id}`);
    requestsQueue.push({ callerAddress, id });
  }
);

// process requests queue at intervals
setInterval(async () => {
  let processedRequests = 0;
  while (requestsQueue.length > 0 && processedRequests < BATCH_SIZE) {
    const request = requestsQueue.shift();
    if (request) {
      const randomNumber = getRandomInteger(1, 1000);
      await contract.returnRandomNumber(
        randomNumber,
        request.callerAddress,
        request.id
      );
      processedRequests++;
    }
  }
}, SLEEP_TIME);
