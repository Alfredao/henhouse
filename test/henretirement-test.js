const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("HenRetirement", function () {
    let henRetirement, henNft, eggToken;
    let owner, addr1;

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();

        // Deploy EggToken
        const EggToken = await ethers.getContractFactory("EggToken");
        eggToken = await upgrades.deployProxy(EggToken);
        await eggToken.deployed();

        // Deploy HenNFT
        const HenNFT = await ethers.getContractFactory("HenNFT");
        henNft = await upgrades.deployProxy(HenNFT, ["Black Hen", "BlackHEN"]);
        await henNft.deployed();

        // Deploy HenRetirement
        const HenRetirement = await ethers.getContractFactory("HenRetirement");
        henRetirement = await upgrades.deployProxy(HenRetirement);
        await henRetirement.deployed();

        // Wire up
        await henRetirement.setEggToken(eggToken.address);
        await henRetirement.setHen(henNft.address);

        // Grant MINTER_ROLE to retirement contract on EggToken (to mint rewards)
        const MINTER_ROLE = await eggToken.MINTER_ROLE();
        await eggToken.grantRole(MINTER_ROLE, henRetirement.address);

        // Mint a hen to addr1
        await henNft.safeMint(addr1.address); // tokenId 0
    });

    it("should retire a hen and receive EGG reward", async function () {
        // Approve retirement contract to transfer the NFT
        await henNft.connect(addr1).approve(henRetirement.address, 0);

        const tx = await henRetirement.connect(addr1).retire(0);
        const receipt = await tx.wait();

        const event = receipt.events.find(e => e.event === "HenRetired");
        expect(event).to.not.be.undefined;
        expect(event.args.owner).to.equal(addr1.address);
        expect(event.args.tokenId).to.equal(0);
        expect(event.args.level).to.equal(1);
        expect(event.args.reward).to.be.gt(0);

        // Hen should be burned (ownerOf should revert)
        await expect(henNft.ownerOf(0)).to.be.reverted;

        // Player should have EGG balance
        const balance = await eggToken.balanceOf(addr1.address);
        expect(balance).to.be.gt(0);
    });

    it("should calculate reward correctly", async function () {
        const reward = await henRetirement.calculateReward(0);
        const attr = await henNft.getHenDetail(0);

        const totalStats = attr.productivity + attr.endurance +
            attr.strength + attr.stamina + attr.health;

        // base (5) + level * 3 + totalStats * 0.1
        const expected = ethers.utils.parseEther("5")
            .add(ethers.utils.parseEther("3").mul(attr.level))
            .add(ethers.BigNumber.from("100000000000000000").mul(totalStats));

        expect(reward).to.equal(expected);
    });

    it("should revert when retiring someone else's hen", async function () {
        await expect(
            henRetirement.connect(owner).retire(0)
        ).to.be.revertedWith("HenRetirement: not your hen");
    });

    it("should increment total retired counter", async function () {
        expect(await henRetirement.getTotalRetired()).to.equal(0);

        await henNft.connect(addr1).approve(henRetirement.address, 0);
        await henRetirement.connect(addr1).retire(0);

        expect(await henRetirement.getTotalRetired()).to.equal(1);
    });

    it("should allow retiring multiple hens", async function () {
        await henNft.safeMint(addr1.address); // tokenId 1

        await henNft.connect(addr1).approve(henRetirement.address, 0);
        await henNft.connect(addr1).approve(henRetirement.address, 1);

        await henRetirement.connect(addr1).retire(0);
        await henRetirement.connect(addr1).retire(1);

        expect(await henRetirement.getTotalRetired()).to.equal(2);
    });

    it("should allow owner to update config", async function () {
        await henRetirement.setBaseRetirementReward(ethers.utils.parseEther("10"));
        await henRetirement.setLevelMultiplier(ethers.utils.parseEther("5"));
        await henRetirement.setStatMultiplier(ethers.utils.parseEther("1"));

        expect(await henRetirement.getBaseRetirementReward()).to.equal(ethers.utils.parseEther("10"));
        expect(await henRetirement.getLevelMultiplier()).to.equal(ethers.utils.parseEther("5"));
        expect(await henRetirement.getStatMultiplier()).to.equal(ethers.utils.parseEther("1"));
    });

    it("should revert if EGG token not set", async function () {
        const HenRetirement2 = await ethers.getContractFactory("HenRetirement");
        const hr2 = await upgrades.deployProxy(HenRetirement2);
        await hr2.deployed();
        await hr2.setHen(henNft.address);

        await henNft.safeMint(addr1.address); // tokenId 2
        await henNft.connect(addr1).approve(hr2.address, 2);

        await expect(
            hr2.connect(addr1).retire(2)
        ).to.be.revertedWith("HenRetirement: EGG token not set");
    });
});
