const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("HenBreeder", function () {
    let henBreeder, henNft, eggToken;
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

        // Deploy HenBreeder
        const HenBreeder = await ethers.getContractFactory("HenBreeder");
        henBreeder = await upgrades.deployProxy(HenBreeder);
        await henBreeder.deployed();

        // Wire up
        await henBreeder.setHen(henNft.address);
        await henBreeder.setEggToken(eggToken.address);
        await henBreeder.setBreedPrice(ethers.utils.parseEther("20"));
        await henBreeder.setCooldownBlocks(5);

        // Grant MINTER_ROLE to breeder on HenNFT
        const MINTER_ROLE = await henNft.MINTER_ROLE();
        await henNft.grantRole(MINTER_ROLE, henBreeder.address);

        // Mint two NFTs to addr1
        await henNft.safeMint(addr1.address); // tokenId 0
        await henNft.safeMint(addr1.address); // tokenId 1

        // Give addr1 EGG tokens
        await eggToken.mint(addr1.address, ethers.utils.parseEther("200"));
    });

    it("should breed two hens and create a new one", async function () {
        await eggToken.connect(addr1).approve(henBreeder.address, ethers.utils.parseEther("200"));

        const tx = await henBreeder.connect(addr1).breed(0, 1);
        const receipt = await tx.wait();

        const event = receipt.events.find(e => e.event === "HenBred");
        expect(event).to.not.be.undefined;
        expect(event.args.owner).to.equal(addr1.address);
        expect(event.args.parent1TokenId).to.equal(0);
        expect(event.args.parent2TokenId).to.equal(1);

        // New child token should exist and be owned by addr1
        const childId = event.args.childTokenId;
        expect(await henNft.ownerOf(childId)).to.equal(addr1.address);

        // Child should have attributes
        const detail = await henNft.getHenDetail(childId);
        expect(detail.level).to.equal(1);
        expect(detail.productivity).to.be.gt(0);
    });

    it("should charge breed price", async function () {
        await eggToken.connect(addr1).approve(henBreeder.address, ethers.utils.parseEther("200"));

        const balBefore = await eggToken.balanceOf(addr1.address);
        await henBreeder.connect(addr1).breed(0, 1);
        const balAfter = await eggToken.balanceOf(addr1.address);

        expect(balBefore.sub(balAfter)).to.equal(ethers.utils.parseEther("20"));
    });

    it("should enforce cooldown on parents", async function () {
        await eggToken.connect(addr1).approve(henBreeder.address, ethers.utils.parseEther("200"));
        await henBreeder.connect(addr1).breed(0, 1);

        // Try to breed again immediately — should fail due to cooldown
        await expect(
            henBreeder.connect(addr1).breed(0, 1)
        ).to.be.revertedWith("HenBreeder: parent 1 is on cooldown");
    });

    it("should allow breeding after cooldown expires", async function () {
        await eggToken.connect(addr1).approve(henBreeder.address, ethers.utils.parseEther("200"));
        await henBreeder.connect(addr1).breed(0, 1);

        // Mine enough blocks to pass cooldown
        for (let i = 0; i < 6; i++) {
            await ethers.provider.send("evm_mine", []);
        }

        // Should succeed now
        await henBreeder.connect(addr1).breed(0, 1);
        expect(await henBreeder.getCooldownRemaining(0)).to.be.gt(0);
    });

    it("should revert when breeding with self", async function () {
        await eggToken.connect(addr1).approve(henBreeder.address, ethers.utils.parseEther("200"));

        await expect(
            henBreeder.connect(addr1).breed(0, 0)
        ).to.be.revertedWith("HenBreeder: cannot breed with self");
    });

    it("should revert when not owning parent", async function () {
        await eggToken.connect(addr1).approve(henBreeder.address, ethers.utils.parseEther("200"));

        await expect(
            henBreeder.connect(owner).breed(0, 1)
        ).to.be.revertedWith("HenBreeder: you do not own parent 1");
    });

    it("should revert when not approved to spend tokens", async function () {
        await expect(
            henBreeder.connect(addr1).breed(0, 1)
        ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("should return zero cooldown for never-bred hens", async function () {
        expect(await henBreeder.getCooldownRemaining(0)).to.equal(0);
    });

    it("should allow breeding with zero price", async function () {
        await henBreeder.setBreedPrice(0);

        const tx = await henBreeder.connect(addr1).breed(0, 1);
        const receipt = await tx.wait();

        const event = receipt.events.find(e => e.event === "HenBred");
        expect(event).to.not.be.undefined;
    });

    it("should allow owner to update config", async function () {
        await henBreeder.setBreedPrice(ethers.utils.parseEther("50"));
        await henBreeder.setCooldownBlocks(200);

        expect(await henBreeder.getBreedPrice()).to.equal(ethers.utils.parseEther("50"));
        expect(await henBreeder.getCooldownBlocks()).to.equal(200);
    });
});
