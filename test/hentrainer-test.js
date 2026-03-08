const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("HenTrainer", function () {
    let henTrainer, henNft, eggToken;
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

        // Deploy HenTrainer
        const HenTrainer = await ethers.getContractFactory("HenTrainer");
        henTrainer = await upgrades.deployProxy(HenTrainer);
        await henTrainer.deployed();

        // Wire up contracts
        await henTrainer.setHen(henNft.address);
        await henTrainer.setEggToken(eggToken.address);
        await henTrainer.setTrainPrice(ethers.utils.parseEther("10"));

        // Grant MINTER_ROLE to HenTrainer on HenNFT so it can call levelUp
        const MINTER_ROLE = await henNft.MINTER_ROLE();
        await henNft.grantRole(MINTER_ROLE, henTrainer.address);

        // Mint an NFT to addr1
        await henNft.safeMint(addr1.address);

        // Give addr1 some EGG tokens
        await eggToken.mint(addr1.address, ethers.utils.parseEther("100"));
    });

    it("should train a hen and increase its level", async function () {
        const detailBefore = await henNft.getHenDetail(0);
        expect(detailBefore.level).to.equal(1);

        // Approve trainer to spend EGG tokens
        await eggToken.connect(addr1).approve(henTrainer.address, ethers.utils.parseEther("100"));

        // Train
        await expect(henTrainer.connect(addr1).train(0))
            .to.emit(henTrainer, "HenTrained")
            .withArgs(addr1.address, 0, 2);

        const detailAfter = await henNft.getHenDetail(0);
        expect(detailAfter.level).to.equal(2);

        // EGG balance should decrease
        const balance = await eggToken.balanceOf(addr1.address);
        expect(balance).to.equal(ethers.utils.parseEther("90"));
    });

    it("should allow training multiple times", async function () {
        await eggToken.connect(addr1).approve(henTrainer.address, ethers.utils.parseEther("100"));

        await henTrainer.connect(addr1).train(0);
        await henTrainer.connect(addr1).train(0);
        await henTrainer.connect(addr1).train(0);

        const detail = await henNft.getHenDetail(0);
        expect(detail.level).to.equal(4);

        const balance = await eggToken.balanceOf(addr1.address);
        expect(balance).to.equal(ethers.utils.parseEther("70"));
    });

    it("should revert when non-owner tries to train", async function () {
        await eggToken.connect(addr1).approve(henTrainer.address, ethers.utils.parseEther("100"));

        await expect(
            henTrainer.connect(owner).train(0)
        ).to.be.revertedWith("HenTrainer: you do not own this hen");
    });

    it("should revert when insufficient EGG balance", async function () {
        // Approve but with no balance
        await eggToken.connect(addr1).approve(henTrainer.address, ethers.utils.parseEther("100"));

        // Burn all tokens first
        await eggToken.connect(addr1).burn(ethers.utils.parseEther("100"));

        await expect(
            henTrainer.connect(addr1).train(0)
        ).to.be.revertedWith("ERC20: burn amount exceeds balance");
    });

    it("should revert when not approved to spend tokens", async function () {
        await expect(
            henTrainer.connect(addr1).train(0)
        ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("should return correct train price", async function () {
        const price = await henTrainer.getTrainPrice();
        expect(price).to.equal(ethers.utils.parseEther("10"));
    });

    it("should allow owner to update train price", async function () {
        await henTrainer.setTrainPrice(ethers.utils.parseEther("20"));
        const price = await henTrainer.getTrainPrice();
        expect(price).to.equal(ethers.utils.parseEther("20"));
    });
});
