const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("HenHouse - stopWork", function () {
    let henHouse, henNft, henToken, eggToken;
    let owner, addr1;

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();

        // Deploy HenToken
        const HenToken = await ethers.getContractFactory("HenToken");
        henToken = await upgrades.deployProxy(HenToken);
        await henToken.deployed();

        // Deploy EggToken
        const EggToken = await ethers.getContractFactory("EggToken");
        eggToken = await upgrades.deployProxy(EggToken);
        await eggToken.deployed();

        // Deploy HenNFT
        const HenNFT = await ethers.getContractFactory("HenNFT");
        henNft = await upgrades.deployProxy(HenNFT, ["Black Hen", "BlackHEN"]);
        await henNft.deployed();

        // Deploy HenHouse
        const HenHouse = await ethers.getContractFactory("HenHouse");
        henHouse = await upgrades.deployProxy(HenHouse);
        await henHouse.deployed();

        // Wire up contracts
        await henHouse.setHen(henNft.address);
        await henHouse.setHenToken(henToken.address);
        await henHouse.setEggToken(eggToken.address);

        // Grant MINTER_ROLE to HenHouse on EggToken so it can mint eggs
        const MINTER_ROLE = await eggToken.MINTER_ROLE();
        await eggToken.grantRole(MINTER_ROLE, henHouse.address);

        // Mint an NFT to addr1
        await henNft.safeMint(addr1.address);

        // addr1 approves HenHouse to transfer NFTs
        await henNft.connect(addr1).setApprovalForAll(henHouse.address, true);

        // Create a house with minLevel=1, minProductivity=1
        await henHouse.createHouse(1, 1);
    });

    it("should allow a worker to stop work and get their hen back", async function () {
        // addr1 starts work with tokenId 0 in house 1
        await henHouse.connect(addr1).startWork(1, 0);

        // Hen should be owned by HenHouse contract now
        expect(await henNft.ownerOf(0)).to.equal(henHouse.address);

        // Mine a few blocks to accumulate eggs
        await ethers.provider.send("evm_mine", []);
        await ethers.provider.send("evm_mine", []);

        // addr1 stops work
        await expect(henHouse.connect(addr1).stopWork(1))
            .to.emit(henHouse, "WorkStopped")
            .withArgs(1, 0, addr1.address);

        // Hen should be returned to addr1
        expect(await henNft.ownerOf(0)).to.equal(addr1.address);

        // addr1 should have received some egg tokens
        const eggBalance = await eggToken.balanceOf(addr1.address);
        expect(eggBalance).to.be.gt(0);

        // Work entry should be cleared
        const work = await henHouse.getWork(1);
        expect(work.owner).to.equal(ethers.constants.AddressZero);
    });

    it("should revert when non-owner tries to stop work", async function () {
        await henHouse.connect(addr1).startWork(1, 0);

        await expect(
            henHouse.connect(owner).stopWork(1)
        ).to.be.revertedWith("You can only stop your own work");
    });

    it("should revert for invalid work ID", async function () {
        await expect(
            henHouse.connect(addr1).stopWork(999)
        ).to.be.revertedWith("HenHouse: work does not exist");
    });

    it("should handle stopWork when no eggs accumulated (same block)", async function () {
        await henHouse.connect(addr1).startWork(1, 0);

        // Stop immediately - eggs may be 0 or minimal
        await henHouse.connect(addr1).stopWork(1);

        // Hen should still be returned
        expect(await henNft.ownerOf(0)).to.equal(addr1.address);
    });
});

describe("Marketplace - cancelListing", function () {
    let marketplace, henNft, henToken;
    let owner, seller, buyer;

    beforeEach(async function () {
        [owner, seller, buyer] = await ethers.getSigners();

        // Deploy HenToken
        const HenToken = await ethers.getContractFactory("HenToken");
        henToken = await upgrades.deployProxy(HenToken);
        await henToken.deployed();

        // Deploy HenNFT
        const HenNFT = await ethers.getContractFactory("HenNFT");
        henNft = await upgrades.deployProxy(HenNFT, ["Black Hen", "BlackHEN"]);
        await henNft.deployed();

        // Deploy Marketplace
        const Marketplace = await ethers.getContractFactory("Marketplace");
        marketplace = await upgrades.deployProxy(Marketplace);
        await marketplace.deployed();

        // Wire up
        await marketplace.setHenToken(henToken.address);

        // Mint NFT to seller
        await henNft.safeMint(seller.address);

        // Seller approves Marketplace
        await henNft.connect(seller).setApprovalForAll(marketplace.address, true);
    });

    it("should allow seller to cancel listing and get NFT back", async function () {
        const price = ethers.utils.parseEther("10");

        // Seller lists NFT
        await marketplace.connect(seller).createMarketItem(henNft.address, 0, price);

        // NFT should be in marketplace
        expect(await henNft.ownerOf(0)).to.equal(marketplace.address);

        // Seller cancels
        await expect(marketplace.connect(seller).cancelListing(1))
            .to.emit(marketplace, "MarketItemCancelled")
            .withArgs(1, 0, seller.address);

        // NFT returned to seller
        expect(await henNft.ownerOf(0)).to.equal(seller.address);

        // Item should no longer appear in active listings
        const items = await marketplace.fetchMarketItems();
        expect(items.length).to.equal(0);
    });

    it("should revert when non-seller tries to cancel", async function () {
        const price = ethers.utils.parseEther("10");
        await marketplace.connect(seller).createMarketItem(henNft.address, 0, price);

        await expect(
            marketplace.connect(buyer).cancelListing(1)
        ).to.be.revertedWith("Marketplace: only seller can cancel");
    });

    it("should revert for invalid item ID", async function () {
        await expect(
            marketplace.connect(seller).cancelListing(999)
        ).to.be.revertedWith("Marketplace: item does not exist");
    });

    it("should revert when cancelling an already sold item", async function () {
        const price = ethers.utils.parseEther("10");
        await marketplace.connect(seller).createMarketItem(henNft.address, 0, price);

        // Give buyer tokens and approve
        await henToken.mint(buyer.address, ethers.utils.parseEther("100"));
        await henToken.connect(buyer).approve(marketplace.address, ethers.utils.parseEther("100"));

        // Buyer purchases
        await marketplace.connect(buyer).createMarketSale(henNft.address, 1);

        // Seller tries to cancel already sold item
        await expect(
            marketplace.connect(seller).cancelListing(1)
        ).to.be.revertedWith("Marketplace: item already sold");
    });

    it("should revert when cancelling an already cancelled item", async function () {
        const price = ethers.utils.parseEther("10");
        await marketplace.connect(seller).createMarketItem(henNft.address, 0, price);

        // Cancel once
        await marketplace.connect(seller).cancelListing(1);

        // Try to cancel again
        await expect(
            marketplace.connect(seller).cancelListing(1)
        ).to.be.revertedWith("Marketplace: item already sold");
    });
});
