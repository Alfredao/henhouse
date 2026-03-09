const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("HenPvpArena", function () {
    let pvpArena, henNft, eggToken, henItem;
    let owner, player1, player2, player3;

    beforeEach(async function () {
        [owner, player1, player2, player3] = await ethers.getSigners();

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

        // Deploy HenPvpArena
        const HenPvpArena = await ethers.getContractFactory("HenPvpArena");
        pvpArena = await upgrades.deployProxy(HenPvpArena);
        await pvpArena.deployed();

        // Wire up
        await pvpArena.setHen(henNft.address);
        await pvpArena.setEggToken(eggToken.address);
        await pvpArena.setHenItem(henItem.address);

        // Set pvpArena as operator on HenItem
        await henItem.setOperator(pvpArena.address, true);

        // Grant MINTER_ROLE to pvpArena on EggToken
        const MINTER_ROLE = await eggToken.MINTER_ROLE();
        await eggToken.grantRole(MINTER_ROLE, pvpArena.address);

        // Mint NFTs
        await henNft.safeMint(player1.address); // tokenId 0
        await henNft.safeMint(player2.address); // tokenId 1
        await henNft.safeMint(player3.address); // tokenId 2

        // Give EGG tokens
        await eggToken.mint(player1.address, ethers.utils.parseEther("500"));
        await eggToken.mint(player2.address, ethers.utils.parseEther("500"));
        await eggToken.mint(player3.address, ethers.utils.parseEther("500"));
    });

    describe("Challenge creation", function () {
        it("should create a challenge", async function () {
            await eggToken.connect(player1).approve(pvpArena.address, ethers.utils.parseEther("100"));

            const tx = await pvpArena.connect(player1).createChallenge(0, ethers.utils.parseEther("50"), 0, 0);
            const receipt = await tx.wait();

            const event = receipt.events.find(e => e.event === "ChallengeCreated");
            expect(event).to.not.be.undefined;
            expect(event.args.challenger).to.equal(player1.address);
            expect(event.args.wager).to.equal(ethers.utils.parseEther("50"));

            expect(await pvpArena.getChallengeCount()).to.equal(1);
        });

        it("should deduct wager from challenger", async function () {
            await eggToken.connect(player1).approve(pvpArena.address, ethers.utils.parseEther("100"));

            const balBefore = await eggToken.balanceOf(player1.address);
            await pvpArena.connect(player1).createChallenge(0, ethers.utils.parseEther("50"), 0, 0);
            const balAfter = await eggToken.balanceOf(player1.address);

            expect(balBefore.sub(balAfter)).to.equal(ethers.utils.parseEther("50"));
        });

        it("should revert if wager below minimum", async function () {
            await eggToken.connect(player1).approve(pvpArena.address, ethers.utils.parseEther("100"));

            await expect(
                pvpArena.connect(player1).createChallenge(0, ethers.utils.parseEther("1"), 0, 0)
            ).to.be.revertedWith("HenPvpArena: wager below minimum");
        });

        it("should revert if not hen owner", async function () {
            await eggToken.connect(player1).approve(pvpArena.address, ethers.utils.parseEther("100"));

            await expect(
                pvpArena.connect(player1).createChallenge(1, ethers.utils.parseEther("10"), 0, 0)
            ).to.be.revertedWith("HenPvpArena: not your hen");
        });
    });

    describe("Challenge cancellation", function () {
        it("should cancel and refund", async function () {
            await eggToken.connect(player1).approve(pvpArena.address, ethers.utils.parseEther("100"));
            await pvpArena.connect(player1).createChallenge(0, ethers.utils.parseEther("50"), 0, 0);

            const balBefore = await eggToken.balanceOf(player1.address);
            await pvpArena.connect(player1).cancelChallenge(1);
            const balAfter = await eggToken.balanceOf(player1.address);

            expect(balAfter.sub(balBefore)).to.equal(ethers.utils.parseEther("50"));

            const challenge = await pvpArena.getChallenge(1);
            expect(challenge.status).to.equal(2); // CANCELLED
        });

        it("should revert if not the challenger", async function () {
            await eggToken.connect(player1).approve(pvpArena.address, ethers.utils.parseEther("100"));
            await pvpArena.connect(player1).createChallenge(0, ethers.utils.parseEther("50"), 0, 0);

            await expect(
                pvpArena.connect(player2).cancelChallenge(1)
            ).to.be.revertedWith("HenPvpArena: not your challenge");
        });

        it("should not appear in open challenges after cancel", async function () {
            await eggToken.connect(player1).approve(pvpArena.address, ethers.utils.parseEther("100"));
            await pvpArena.connect(player1).createChallenge(0, ethers.utils.parseEther("50"), 0, 0);
            await pvpArena.connect(player1).cancelChallenge(1);

            const open = await pvpArena.getOpenChallenges();
            expect(open.length).to.equal(0);
        });
    });

    describe("Accept challenge (PvP battle)", function () {
        beforeEach(async function () {
            await eggToken.connect(player1).approve(pvpArena.address, ethers.utils.parseEther("500"));
            await eggToken.connect(player2).approve(pvpArena.address, ethers.utils.parseEther("500"));
            await pvpArena.connect(player1).createChallenge(0, ethers.utils.parseEther("50"), 0, 0);
        });

        it("should execute a PvP battle", async function () {
            const tx = await pvpArena.connect(player2).acceptChallenge(1, 1, 0, 0);
            const receipt = await tx.wait();

            const event = receipt.events.find(e => e.event === "PvpBattleResult");
            expect(event).to.not.be.undefined;
            expect(event.args.player1).to.equal(player1.address);
            expect(event.args.player2).to.equal(player2.address);

            // Winner should be one of them
            expect([player1.address, player2.address]).to.include(event.args.winner);

            expect(await pvpArena.getBattleCount()).to.equal(1);
        });

        it("should deduct wager from acceptor", async function () {
            const balBefore = await eggToken.balanceOf(player2.address);
            await pvpArena.connect(player2).acceptChallenge(1, 1, 0, 0);
            const balAfter = await eggToken.balanceOf(player2.address);

            const battle = await pvpArena.getPvpBattle(1);
            if (battle.winner === player2.address) {
                // Won: paid 50, received reward
                expect(balAfter).to.be.gt(balBefore.sub(ethers.utils.parseEther("50")));
            } else {
                // Lost: paid 50, received nothing
                expect(balBefore.sub(balAfter)).to.equal(ethers.utils.parseEther("50"));
            }
        });

        it("should pay winner with platform fee deducted", async function () {
            const bal1Before = await eggToken.balanceOf(player1.address);
            const bal2Before = await eggToken.balanceOf(player2.address);

            await pvpArena.connect(player2).acceptChallenge(1, 1, 0, 0);

            const bal1After = await eggToken.balanceOf(player1.address);
            const bal2After = await eggToken.balanceOf(player2.address);

            const battle = await pvpArena.getPvpBattle(1);
            // Total pot = 100 EGG, 5% fee = 5 EGG, winner gets 95 EGG
            expect(battle.winnerReward).to.equal(ethers.utils.parseEther("95"));
        });

        it("should revert when fighting yourself", async function () {
            await expect(
                pvpArena.connect(player1).acceptChallenge(1, 0, 0, 0)
            ).to.be.revertedWith("HenPvpArena: cannot fight yourself");
        });

        it("should revert when challenge not open", async function () {
            await pvpArena.connect(player2).acceptChallenge(1, 1, 0, 0);

            await eggToken.connect(player3).approve(pvpArena.address, ethers.utils.parseEther("500"));
            await expect(
                pvpArena.connect(player3).acceptChallenge(1, 2, 0, 0)
            ).to.be.revertedWith("HenPvpArena: challenge not open");
        });

        it("should mark challenge as accepted after battle", async function () {
            await pvpArena.connect(player2).acceptChallenge(1, 1, 0, 0);

            const challenge = await pvpArena.getChallenge(1);
            expect(challenge.status).to.equal(1); // ACCEPTED
        });
    });

    describe("Stats and leaderboard", function () {
        it("should track PvP stats for both players", async function () {
            await eggToken.connect(player1).approve(pvpArena.address, ethers.utils.parseEther("500"));
            await eggToken.connect(player2).approve(pvpArena.address, ethers.utils.parseEther("500"));

            await pvpArena.connect(player1).createChallenge(0, ethers.utils.parseEther("10"), 0, 0);
            await pvpArena.connect(player2).acceptChallenge(1, 1, 0, 0);

            const stats1 = await pvpArena.getPvpStats(player1.address);
            const stats2 = await pvpArena.getPvpStats(player2.address);

            expect(stats1.wins.add(stats1.losses)).to.equal(1);
            expect(stats2.wins.add(stats2.losses)).to.equal(1);
            expect(stats1.totalWagered).to.equal(ethers.utils.parseEther("10"));
            expect(stats2.totalWagered).to.equal(ethers.utils.parseEther("10"));
        });

        it("should build leaderboard with both players", async function () {
            await eggToken.connect(player1).approve(pvpArena.address, ethers.utils.parseEther("500"));
            await eggToken.connect(player2).approve(pvpArena.address, ethers.utils.parseEther("500"));

            await pvpArena.connect(player1).createChallenge(0, ethers.utils.parseEther("10"), 0, 0);
            await pvpArena.connect(player2).acceptChallenge(1, 1, 0, 0);

            const lb = await pvpArena.getPvpLeaderboard();
            expect(lb.addresses.length).to.equal(2);
            expect(lb.addresses).to.include(player1.address);
            expect(lb.addresses).to.include(player2.address);
        });

        it("should record battle in both players histories", async function () {
            await eggToken.connect(player1).approve(pvpArena.address, ethers.utils.parseEther("500"));
            await eggToken.connect(player2).approve(pvpArena.address, ethers.utils.parseEther("500"));

            await pvpArena.connect(player1).createChallenge(0, ethers.utils.parseEther("10"), 0, 0);
            await pvpArena.connect(player2).acceptChallenge(1, 1, 0, 0);

            const p1Battles = await pvpArena.getPlayerPvpBattles(player1.address);
            const p2Battles = await pvpArena.getPlayerPvpBattles(player2.address);

            expect(p1Battles.length).to.equal(1);
            expect(p2Battles.length).to.equal(1);
        });
    });

    describe("Open challenges", function () {
        it("should list only open challenges", async function () {
            await eggToken.connect(player1).approve(pvpArena.address, ethers.utils.parseEther("500"));
            await eggToken.connect(player2).approve(pvpArena.address, ethers.utils.parseEther("500"));
            await eggToken.connect(player3).approve(pvpArena.address, ethers.utils.parseEther("500"));

            await pvpArena.connect(player1).createChallenge(0, ethers.utils.parseEther("10"), 0, 0);
            await pvpArena.connect(player2).createChallenge(1, ethers.utils.parseEther("20"), 0, 0);

            // Accept challenge 1
            await pvpArena.connect(player3).acceptChallenge(1, 2, 0, 0);

            const open = await pvpArena.getOpenChallenges();
            expect(open.length).to.equal(1);
            expect(open[0].challengeId).to.equal(2);
        });
    });

    describe("Item integration", function () {
        it("should allow creating challenge with items", async function () {
            // Buy items
            await eggToken.connect(player1).approve(henItem.address, ethers.utils.parseEther("200"));
            await henItem.connect(player1).buyItem(1, 1); // weapon
            await henItem.connect(player1).buyItem(2, 1); // armor

            await eggToken.connect(player1).approve(pvpArena.address, ethers.utils.parseEther("100"));
            await pvpArena.connect(player1).createChallenge(0, ethers.utils.parseEther("10"), 1, 2);

            // Items consumed
            expect(await henItem.getBalance(player1.address, 1)).to.equal(0);
            expect(await henItem.getBalance(player1.address, 2)).to.equal(0);

            const challenge = await pvpArena.getChallenge(1);
            expect(challenge.challengerWeaponId).to.equal(1);
            expect(challenge.challengerArmorId).to.equal(2);
        });
    });

    describe("Admin config", function () {
        it("should return default config", async function () {
            expect(await pvpArena.getMinWager()).to.equal(ethers.utils.parseEther("5"));
            expect(await pvpArena.getMaxWager()).to.equal(ethers.utils.parseEther("1000"));
            expect(await pvpArena.getPlatformFeePercent()).to.equal(5);
        });

        it("should allow owner to update config", async function () {
            await pvpArena.setMinWager(ethers.utils.parseEther("10"));
            await pvpArena.setMaxWager(ethers.utils.parseEther("500"));
            await pvpArena.setPlatformFeePercent(10);

            expect(await pvpArena.getMinWager()).to.equal(ethers.utils.parseEther("10"));
            expect(await pvpArena.getMaxWager()).to.equal(ethers.utils.parseEther("500"));
            expect(await pvpArena.getPlatformFeePercent()).to.equal(10);
        });

        it("should reject fee above 20%", async function () {
            await expect(
                pvpArena.setPlatformFeePercent(25)
            ).to.be.revertedWith("HenPvpArena: fee too high");
        });
    });
});
