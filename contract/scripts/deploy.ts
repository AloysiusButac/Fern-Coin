import { ethers } from "hardhat";

async function main() {
  const lock = await ethers.deployContract("Fern", ["0x4d63B50bba1714449c17A58aEDb6e5bf6A7728e5"]);

  await lock.waitForDeployment();

  console.log(
    `Token deployed to ${lock.target}`
  );
}

// Run main then exit
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});