// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const {upgrades, ethers} = require("hardhat");

async function HenHouse() {
    const henHouseFactory = await ethers.getContractFactory("HenHouse");
    const henHouse = await upgrades.deployProxy(henHouseFactory);
    await henHouse.deployed();

    console.log("Hen House deployed to:", henHouse.address);
}

async function Egg() {
    const eggFactory = await ethers.getContractFactory("Egg");
    const egg = await upgrades.deployProxy(eggFactory);
    await egg.deployed();

    console.log("Egg deployed to:", egg.address);
}

async function ICO() {
    const icoContractFactory = await ethers.getContractFactory("HenHouseIco");
    const icoToken = await upgrades.deployProxy(icoContractFactory);
    await icoToken.deployed();

    console.log("ICO deployed to:", icoToken.address);
}

async function NFT(name, ticker) {
    const nftContractFactory = await ethers.getContractFactory("Hen");
    const nftToken = await upgrades.deployProxy(nftContractFactory, [name, ticker]);
    await nftToken.deployed();

    console.log("NFT token deployed to:", nftToken.address);
}

async function Summoner() {
    const summonerFactory = await ethers.getContractFactory("HenSummoner");
    const summoner = await upgrades.deployProxy(summonerFactory);
    await summoner.deployed();

    console.log("Summoner token deployed to:", summoner.address);
}

async function Marketplace() {
    // const marketplaceFactory = await ethers.getContractFactory("Marketplace");
    // const marketPlace = await upgrades.deployProxy(marketplaceFactory);
    // await marketPlace.deployed();
    //
    // console.log("Marketplace token deployed to:", marketPlace.address);

    const v2 = await ethers.getContractFactory("Marketplace");
    await upgrades.upgradeProxy('0xbb8910AB797d2860026BF221d268348ECEE27D0A', v2);

    console.log('Contract upgraded');
}

async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile
    // manually to make sure everything is compiled
    // await run('compile');

    // We get the contract to deploy

    // await HenHouse();
    // await Egg();
    // await ICO();
    // await NFT("Black Hen", "BlackHEN");
    // await Summoner();
    await Marketplace();
}

// We recommend this pattern to be able to use async/await everywhere-
// and properly handle errors.
main().then(() => process.exit(0)).catch((error) => {
    console.error(error);
    process.exit(1);
});
