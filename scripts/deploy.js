// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await hre.run('compile');

    // We get the contract to deploy
    const contractFactory = await hre.ethers.getContractFactory("HenHouse");
    const token = await contractFactory.deploy();

    await token.initialize();
    await token.deployed();

    console.log("Token deployed to:", token.address);

    const nftContractFactory = await hre.ethers.getContractFactory("Hen");
    const nftToken = await nftContractFactory.deploy();

    await nftToken.initialize("Black Hen", "BlackHEN");
    await nftToken.deployed();

    console.log("NFT token deployed to:", nftToken.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch((error) => {
    console.error(error);
    process.exit(1);
});
