// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const {upgrades, ethers} = require("hardhat");

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await run('compile');

    // We get the contract to deploy

    const contractFactory = await ethers.getContractFactory("CryptoRocketV1");
    const token = await upgrades.deployProxy(contractFactory);
    await token.deployed();

    console.log("Token deployed to:", token.address);

    const contractFactoryv2 = await ethers.getContractFactory("CryptoRocketV2");
    await upgrades.upgradeProxy(token.address, contractFactoryv2);

    console.log('Contract upgraded');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().then(() => process.exit(0)).catch((error) => {
    console.error(error);
    process.exit(1);
});
