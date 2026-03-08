const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("HenArena", function () {
    let henArena, henNft, eggToken;
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

        // Deploy HenArena
        const HenArena = await ethers.getContractFactory("HenArena");
        henArena = await upgrades.deployProxy(HenArena);
        await henArena.deployed();

        // Wire up
        await henArena.setHen(henNft.address);
        await henArena.setEggToken(eggToken.address);
        await henArena.setEntryFee(ethers.utils.parseEther("5"));
        await henArena.setRewardAmount(ethers.utils.parseEther("15"));

        // Grant MINTER_ROLE to arena on EggToken so it can mint rewards
        const MINTER_ROLE = await eggToken.MINTER_ROLE();
        await eggToken.grantRole(MINTER_ROLE, henArena.address);

        // Mint an NFT to addr1
        await henNft.safeMint(addr1.address);

        // Give addr1 EGG tokens for entry fees
        await eggToken.mint(addr1.address, ethers.utils.parseEther("100"));
    });

    it("should allow a player to fight and emit BattleResult", async function () {
        await eggToken.connect(addr1).approve(henArena.address, ethers.utils.parseEther("100"));

        const tx = await henArena.connect(addr1).fight(0);
        const receipt = await tx.wait();

        const event = receipt.events.find(e => e.event === "BattleResult");
        expect(event).to.not.be.undefined;
        expect(event.args.player).to.equal(addr1.address);
        expect(event.args.tokenId).to.equal(0);

        // Battle count should be 1
        expect(await henArena.getBattleCount()).to.equal(1);
    });

    it("should record battle in history", async function () {
        await eggToken.connect(addr1).approve(henArena.address, ethers.utils.parseEther("100"));
        await henArena.connect(addr1).fight(0);

        const battle = await henArena.getBattle(1);
        expect(battle.player).to.equal(addr1.address);
        expect(battle.tokenId).to.equal(0);
        expect(battle.enemyStrength).to.be.gt(0);
        expect(battle.enemyStamina).to.be.gt(0);
        expect(battle.enemyHealth).to.be.gt(0);
    });

    it("should track player battles", async function () {
        await eggToken.connect(addr1).approve(henArena.address, ethers.utils.parseEther("100"));
        await henArena.connect(addr1).fight(0);
        await henArena.connect(addr1).fight(0);

        const playerBattles = await henArena.getPlayerBattles(addr1.address);
        expect(playerBattles.length).to.equal(2);
    });

    it("should charge entry fee", async function () {
        await eggToken.connect(addr1).approve(henArena.address, ethers.utils.parseEther("100"));

        const balBefore = await eggToken.balanceOf(addr1.address);
        await henArena.connect(addr1).fight(0);
        const balAfter = await eggToken.balanceOf(addr1.address);

        const battle = await henArena.getBattle(1);

        if (battle.won) {
            // Won: paid 5, got 15 => net +10
            expect(balAfter.sub(balBefore)).to.equal(ethers.utils.parseEther("10"));
        } else {
            // Lost: paid 5, got 0 => net -5
            expect(balBefore.sub(balAfter)).to.equal(ethers.utils.parseEther("5"));
        }
    });

    it("should revert when non-owner tries to fight", async function () {
        await eggToken.connect(addr1).approve(henArena.address, ethers.utils.parseEther("100"));

        await expect(
            henArena.connect(owner).fight(0)
        ).to.be.revertedWith("HenArena: you do not own this hen");
    });

    it("should revert when not approved to spend tokens", async function () {
        await expect(
            henArena.connect(addr1).fight(0)
        ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("should allow fighting with zero entry fee", async function () {
        await henArena.setEntryFee(0);

        // No approval needed when fee is 0
        const tx = await henArena.connect(addr1).fight(0);
        const receipt = await tx.wait();

        const event = receipt.events.find(e => e.event === "BattleResult");
        expect(event).to.not.be.undefined;
    });

    it("should return correct config values", async function () {
        expect(await henArena.getEntryFee()).to.equal(ethers.utils.parseEther("5"));
        expect(await henArena.getRewardAmount()).to.equal(ethers.utils.parseEther("15"));
    });

    it("should allow owner to update config", async function () {
        await henArena.setEntryFee(ethers.utils.parseEther("10"));
        await henArena.setRewardAmount(ethers.utils.parseEther("30"));
        expect(await henArena.getEntryFee()).to.equal(ethers.utils.parseEther("10"));
        expect(await henArena.getRewardAmount()).to.equal(ethers.utils.parseEther("30"));
    });

    it("should revert for invalid battle ID", async function () {
        await expect(
            henArena.getBattle(999)
        ).to.be.revertedWith("HenArena: battle does not exist");
    });
});
