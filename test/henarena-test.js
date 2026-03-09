const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("HenArena", function () {
    let henArena, henNft, eggToken, henItem;
    let owner, addr1, addr2;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        // Deploy EggToken
        const EggToken = await ethers.getContractFactory("EggToken");
        eggToken = await upgrades.deployProxy(EggToken);
        await eggToken.deployed();

        // Deploy HenNFT
        const HenNFT = await ethers.getContractFactory("HenNFT");
        henNft = await upgrades.deployProxy(HenNFT, ["Black Hen", "BlackHEN"]);
        await henNft.deployed();

        // Deploy HenItem
        const HenItem = await ethers.getContractFactory("HenItem");
        henItem = await upgrades.deployProxy(HenItem);
        await henItem.deployed();
        await henItem.setEggToken(eggToken.address);

        // Create weapon and armor items
        await henItem.createItem("Espora Afiada", 3, 25, ethers.utils.parseEther("10")); // itemId=1 WEAPON
        await henItem.createItem("Armadura de Ferro", 2, 20, ethers.utils.parseEther("10")); // itemId=2 ARMOR
        await henItem.createItem("Ração Premium", 0, 10, ethers.utils.parseEther("5")); // itemId=3 FEED

        // Deploy HenArena
        const HenArena = await ethers.getContractFactory("HenArena");
        henArena = await upgrades.deployProxy(HenArena);
        await henArena.deployed();

        // Wire up
        await henArena.setHen(henNft.address);
        await henArena.setEggToken(eggToken.address);
        await henArena.setHenItem(henItem.address);
        await henArena.setEntryFee(ethers.utils.parseEther("5"));
        await henArena.setRewardAmount(ethers.utils.parseEther("15"));

        // Set arena as operator on HenItem
        await henItem.setOperator(henArena.address, true);

        // Grant MINTER_ROLE to arena on EggToken
        const MINTER_ROLE = await eggToken.MINTER_ROLE();
        await eggToken.grantRole(MINTER_ROLE, henArena.address);

        // Mint NFTs
        await henNft.safeMint(addr1.address);
        await henNft.safeMint(addr2.address);

        // Give EGG tokens
        await eggToken.mint(addr1.address, ethers.utils.parseEther("500"));
        await eggToken.mint(addr2.address, ethers.utils.parseEther("500"));
    });

    it("should allow a player to fight and emit BattleResult", async function () {
        await eggToken.connect(addr1).approve(henArena.address, ethers.utils.parseEther("100"));

        const tx = await henArena.connect(addr1).fight(0);
        const receipt = await tx.wait();

        const event = receipt.events.find(e => e.event === "BattleResult");
        expect(event).to.not.be.undefined;
        expect(event.args.player).to.equal(addr1.address);
        expect(event.args.tokenId).to.equal(0);
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
            expect(balAfter.sub(balBefore)).to.equal(ethers.utils.parseEther("10"));
        } else {
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

    // Item integration tests

    it("should allow fighting with weapon and armor items", async function () {
        // Buy weapon and armor
        await eggToken.connect(addr1).approve(henItem.address, ethers.utils.parseEther("200"));
        await henItem.connect(addr1).buyItem(1, 1); // weapon
        await henItem.connect(addr1).buyItem(2, 1); // armor

        await eggToken.connect(addr1).approve(henArena.address, ethers.utils.parseEther("100"));

        const tx = await henArena.connect(addr1).fightWithItems(0, 1, 2);
        const receipt = await tx.wait();

        const event = receipt.events.find(e => e.event === "BattleResult");
        expect(event).to.not.be.undefined;

        // Items should be consumed
        expect(await henItem.getBalance(addr1.address, 1)).to.equal(0);
        expect(await henItem.getBalance(addr1.address, 2)).to.equal(0);
    });

    it("should revert when using non-weapon item as weapon", async function () {
        await eggToken.connect(addr1).approve(henItem.address, ethers.utils.parseEther("200"));
        await henItem.connect(addr1).buyItem(3, 1); // feed item

        await eggToken.connect(addr1).approve(henArena.address, ethers.utils.parseEther("100"));

        await expect(
            henArena.connect(addr1).fightWithItems(0, 3, 0)
        ).to.be.revertedWith("HenArena: not a weapon");
    });

    it("should revert when player doesn't own the item", async function () {
        await eggToken.connect(addr1).approve(henArena.address, ethers.utils.parseEther("100"));

        await expect(
            henArena.connect(addr1).fightWithItems(0, 1, 0)
        ).to.be.revertedWith("HenItem: not enough items");
    });

    // Leaderboard tests

    it("should track player stats (wins/losses)", async function () {
        await eggToken.connect(addr1).approve(henArena.address, ethers.utils.parseEther("500"));

        // Fight multiple times
        for (let i = 0; i < 3; i++) {
            await henArena.connect(addr1).fight(0);
        }

        const stats = await henArena.getPlayerStats(addr1.address);
        expect(stats.wins.add(stats.losses)).to.equal(3);
    });

    it("should return leaderboard data", async function () {
        await eggToken.connect(addr1).approve(henArena.address, ethers.utils.parseEther("500"));
        await eggToken.connect(addr2).approve(henArena.address, ethers.utils.parseEther("500"));

        await henArena.connect(addr1).fight(0);
        await henArena.connect(addr2).fight(1);

        const lb = await henArena.getLeaderboard();
        expect(lb.addresses.length).to.equal(2);
        expect(lb.addresses).to.include(addr1.address);
        expect(lb.addresses).to.include(addr2.address);
    });

    it("should track earnings in leaderboard", async function () {
        await henArena.setEntryFee(0);

        await henArena.connect(addr1).fight(0);

        const stats = await henArena.getPlayerStats(addr1.address);
        if (stats.wins.gt(0)) {
            expect(stats.totalEarnings).to.equal(ethers.utils.parseEther("15"));
        } else {
            expect(stats.totalEarnings).to.equal(0);
        }
    });
});
