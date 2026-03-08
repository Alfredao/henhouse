const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("DailyRewards", function () {
    let dailyRewards, eggToken;
    let owner, addr1;

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();

        // Deploy EggToken
        const EggToken = await ethers.getContractFactory("EggToken");
        eggToken = await upgrades.deployProxy(EggToken);
        await eggToken.deployed();

        // Deploy DailyRewards
        const DailyRewards = await ethers.getContractFactory("DailyRewards");
        dailyRewards = await upgrades.deployProxy(DailyRewards);
        await dailyRewards.deployed();

        // Wire up
        await dailyRewards.setEggToken(eggToken.address);

        // Grant MINTER_ROLE to DailyRewards on EggToken
        const MINTER_ROLE = await eggToken.MINTER_ROLE();
        await eggToken.grantRole(MINTER_ROLE, dailyRewards.address);
    });

    it("should allow first daily claim", async function () {
        const tx = await dailyRewards.connect(addr1).claimDailyReward();
        const receipt = await tx.wait();

        const event = receipt.events.find(e => e.event === "RewardClaimed");
        expect(event).to.not.be.undefined;
        expect(event.args.player).to.equal(addr1.address);
        expect(event.args.streakDays).to.equal(1);

        // Base reward = 10 EGG, streak day 1 = no bonus
        expect(event.args.amount).to.equal(ethers.utils.parseEther("10"));

        const balance = await eggToken.balanceOf(addr1.address);
        expect(balance).to.equal(ethers.utils.parseEther("10"));
    });

    it("should reject claim before cooldown expires", async function () {
        await dailyRewards.connect(addr1).claimDailyReward();

        await expect(
            dailyRewards.connect(addr1).claimDailyReward()
        ).to.be.revertedWith("DailyRewards: too early to claim");
    });

    it("should allow claim after cooldown and increase streak", async function () {
        await dailyRewards.connect(addr1).claimDailyReward();

        // Advance time by 24 hours
        await ethers.provider.send("evm_increaseTime", [86400]);
        await ethers.provider.send("evm_mine", []);

        const tx = await dailyRewards.connect(addr1).claimDailyReward();
        const receipt = await tx.wait();

        const event = receipt.events.find(e => e.event === "RewardClaimed");
        expect(event.args.streakDays).to.equal(2);
        // Base 10 + streak bonus (2 * 1) = 12 EGG
        expect(event.args.amount).to.equal(ethers.utils.parseEther("12"));
    });

    it("should reset streak after missing a day", async function () {
        await dailyRewards.connect(addr1).claimDailyReward();

        // Advance time by 49 hours (past 2x cooldown)
        await ethers.provider.send("evm_increaseTime", [176400]);
        await ethers.provider.send("evm_mine", []);

        const tx = await dailyRewards.connect(addr1).claimDailyReward();
        const receipt = await tx.wait();

        const event = receipt.events.find(e => e.event === "RewardClaimed");
        expect(event.args.streakDays).to.equal(1);
        expect(event.args.amount).to.equal(ethers.utils.parseEther("10"));
    });

    it("should cap streak at max streak days", async function () {
        // Claim 8 times (should cap at 7)
        for (let i = 0; i < 8; i++) {
            await dailyRewards.connect(addr1).claimDailyReward();
            if (i < 7) {
                await ethers.provider.send("evm_increaseTime", [86400]);
                await ethers.provider.send("evm_mine", []);
            }
        }

        const reward = await dailyRewards.getPlayerReward(addr1.address);
        expect(reward.streakDays).to.equal(7);
    });

    it("should report canClaim correctly", async function () {
        expect(await dailyRewards.canClaim(addr1.address)).to.equal(true);

        await dailyRewards.connect(addr1).claimDailyReward();
        expect(await dailyRewards.canClaim(addr1.address)).to.equal(false);

        await ethers.provider.send("evm_increaseTime", [86400]);
        await ethers.provider.send("evm_mine", []);
        expect(await dailyRewards.canClaim(addr1.address)).to.equal(true);
    });

    it("should return next claim time", async function () {
        // Never claimed — should be 0
        expect(await dailyRewards.getNextClaimTime(addr1.address)).to.equal(0);

        await dailyRewards.connect(addr1).claimDailyReward();
        const remaining = await dailyRewards.getNextClaimTime(addr1.address);
        expect(remaining).to.be.gt(0);
    });

    it("should track total claimed", async function () {
        await dailyRewards.connect(addr1).claimDailyReward();

        const reward = await dailyRewards.getPlayerReward(addr1.address);
        expect(reward.totalClaimed).to.equal(ethers.utils.parseEther("10"));
    });

    it("should allow owner to update config", async function () {
        await dailyRewards.setBaseReward(ethers.utils.parseEther("20"));
        await dailyRewards.setStreakBonus(ethers.utils.parseEther("5"));
        await dailyRewards.setMaxStreakDays(14);
        await dailyRewards.setClaimCooldown(43200); // 12 hours

        expect(await dailyRewards.getBaseReward()).to.equal(ethers.utils.parseEther("20"));
        expect(await dailyRewards.getStreakBonus()).to.equal(ethers.utils.parseEther("5"));
        expect(await dailyRewards.getMaxStreakDays()).to.equal(14);
        expect(await dailyRewards.getClaimCooldown()).to.equal(43200);
    });

    it("should revert if EGG token not set", async function () {
        const DailyRewards2 = await ethers.getContractFactory("DailyRewards");
        const dr2 = await upgrades.deployProxy(DailyRewards2);
        await dr2.deployed();

        await expect(
            dr2.connect(addr1).claimDailyReward()
        ).to.be.revertedWith("DailyRewards: EGG token not set");
    });
});
