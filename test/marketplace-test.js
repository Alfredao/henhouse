const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("Marketplace", function () {
    let marketplace, henNft, henToken;
    let owner, seller, buyer;

    beforeEach(async function () {
        [owner, seller, buyer] = await ethers.getSigners();

        // Deploy HenToken
        const HenToken = await ethers.getContractFactory("HenHouse");
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

        // Mint hen to seller
        await henNft.safeMint(seller.address); // tokenId 0

        // Mint HEN tokens to buyer for purchasing
        await henToken.mint(buyer.address, ethers.utils.parseEther("1000"));
    });

    describe("Listing and buying", function () {
        it("should create a market item", async function () {
            await henNft.connect(seller).approve(marketplace.address, 0);

            const tx = await marketplace.connect(seller).createMarketItem(
                henNft.address, 0, ethers.utils.parseEther("100")
            );
            const receipt = await tx.wait();

            const event = receipt.events.find(e => e.event === "MarketItemCreated");
            expect(event).to.not.be.undefined;
            expect(event.args.seller).to.equal(seller.address);
        });

        it("should complete a sale and record price history", async function () {
            await henNft.connect(seller).approve(marketplace.address, 0);
            await marketplace.connect(seller).createMarketItem(
                henNft.address, 0, ethers.utils.parseEther("100")
            );

            // Buyer approves HEN spend
            await henToken.connect(buyer).approve(marketplace.address, ethers.utils.parseEther("100"));

            const tx = await marketplace.connect(buyer).createMarketSale(henNft.address, 1);
            const receipt = await tx.wait();

            // Check MarketItemSold event
            const event = receipt.events.find(e => e.event === "MarketItemSold");
            expect(event).to.not.be.undefined;
            expect(event.args.seller).to.equal(seller.address);
            expect(event.args.buyer).to.equal(buyer.address);
            expect(event.args.price).to.equal(ethers.utils.parseEther("100"));

            // Check price history
            const history = await marketplace.getTokenSaleHistory(0);
            expect(history.length).to.equal(1);
            expect(history[0].price).to.equal(ethers.utils.parseEther("100"));
            expect(history[0].seller).to.equal(seller.address);
            expect(history[0].buyer).to.equal(buyer.address);
        });

        it("should track total sales", async function () {
            expect(await marketplace.getTotalSales()).to.equal(0);

            await henNft.connect(seller).approve(marketplace.address, 0);
            await marketplace.connect(seller).createMarketItem(
                henNft.address, 0, ethers.utils.parseEther("50")
            );
            await henToken.connect(buyer).approve(marketplace.address, ethers.utils.parseEther("50"));
            await marketplace.connect(buyer).createMarketSale(henNft.address, 1);

            expect(await marketplace.getTotalSales()).to.equal(1);
        });

        it("should return recent sales", async function () {
            // Make a sale
            await henNft.connect(seller).approve(marketplace.address, 0);
            await marketplace.connect(seller).createMarketItem(
                henNft.address, 0, ethers.utils.parseEther("75")
            );
            await henToken.connect(buyer).approve(marketplace.address, ethers.utils.parseEther("75"));
            await marketplace.connect(buyer).createMarketSale(henNft.address, 1);

            const recent = await marketplace.getRecentSales(10);
            expect(recent.length).to.equal(1);
            expect(recent[0].price).to.equal(ethers.utils.parseEther("75"));
        });
    });

    describe("Filtering", function () {
        beforeEach(async function () {
            // Create multiple listings
            await henNft.safeMint(seller.address); // tokenId 1
            await henNft.safeMint(seller.address); // tokenId 2

            await henNft.connect(seller).approve(marketplace.address, 0);
            await henNft.connect(seller).approve(marketplace.address, 1);
            await henNft.connect(seller).approve(marketplace.address, 2);

            await marketplace.connect(seller).createMarketItem(
                henNft.address, 0, ethers.utils.parseEther("50")
            );
            await marketplace.connect(seller).createMarketItem(
                henNft.address, 1, ethers.utils.parseEther("100")
            );
            await marketplace.connect(seller).createMarketItem(
                henNft.address, 2, ethers.utils.parseEther("200")
            );
        });

        it("should filter by max price", async function () {
            const items = await marketplace.fetchMarketItemsByMaxPrice(
                ethers.utils.parseEther("100")
            );
            expect(items.length).to.equal(2);
        });

        it("should filter by seller", async function () {
            const items = await marketplace.fetchMarketItemsBySeller(seller.address);
            expect(items.length).to.equal(3);

            const buyerItems = await marketplace.fetchMarketItemsBySeller(buyer.address);
            expect(buyerItems.length).to.equal(0);
        });

        it("should return all items with fetchMarketItems", async function () {
            const items = await marketplace.fetchMarketItems();
            expect(items.length).to.equal(3);
        });
    });

    describe("Cancel listing", function () {
        it("should allow seller to cancel", async function () {
            await henNft.connect(seller).approve(marketplace.address, 0);
            await marketplace.connect(seller).createMarketItem(
                henNft.address, 0, ethers.utils.parseEther("100")
            );

            await marketplace.connect(seller).cancelListing(1);

            // NFT should be back with seller
            expect(await henNft.ownerOf(0)).to.equal(seller.address);

            // Should not appear in market items
            const items = await marketplace.fetchMarketItems();
            expect(items.length).to.equal(0);
        });

        it("should reject cancel from non-seller", async function () {
            await henNft.connect(seller).approve(marketplace.address, 0);
            await marketplace.connect(seller).createMarketItem(
                henNft.address, 0, ethers.utils.parseEther("100")
            );

            await expect(
                marketplace.connect(buyer).cancelListing(1)
            ).to.be.revertedWith("Marketplace: only seller can cancel");
        });
    });
});
