const { expect } = require("chai");
const { ethers, upgrades } = require("hardhat");

describe("HenItem", function () {
    let henItem, eggToken;
    let owner, addr1;

    beforeEach(async function () {
        [owner, addr1] = await ethers.getSigners();

        // Deploy EggToken
        const EggToken = await ethers.getContractFactory("EggToken");
        eggToken = await upgrades.deployProxy(EggToken);
        await eggToken.deployed();

        // Deploy HenItem
        const HenItem = await ethers.getContractFactory("HenItem");
        henItem = await upgrades.deployProxy(HenItem);
        await henItem.deployed();

        // Wire up
        await henItem.setEggToken(eggToken.address);

        // Create some shop items
        await henItem.createItem("Ração Premium", 0, 10, ethers.utils.parseEther("5")); // FEED
        await henItem.createItem("Vitamina A", 1, 15, ethers.utils.parseEther("8"));     // VITAMIN
        await henItem.createItem("Armadura de Ferro", 2, 20, ethers.utils.parseEther("20")); // ARMOR
        await henItem.createItem("Espora Afiada", 3, 25, ethers.utils.parseEther("30"));  // WEAPON

        // Give addr1 EGG tokens
        await eggToken.mint(addr1.address, ethers.utils.parseEther("200"));
    });

    it("should create items correctly", async function () {
        expect(await henItem.getItemCount()).to.equal(4);

        const item1 = await henItem.getItem(1);
        expect(item1.name).to.equal("Ração Premium");
        expect(item1.itemType).to.equal(0); // FEED
        expect(item1.boostValue).to.equal(10);
        expect(item1.price).to.equal(ethers.utils.parseEther("5"));
        expect(item1.active).to.be.true;
    });

    it("should allow player to buy items", async function () {
        await eggToken.connect(addr1).approve(henItem.address, ethers.utils.parseEther("200"));

        await expect(henItem.connect(addr1).buyItem(1, 3))
            .to.emit(henItem, "ItemPurchased")
            .withArgs(addr1.address, 1, 3);

        expect(await henItem.getBalance(addr1.address, 1)).to.equal(3);

        // Should have spent 15 EGG (5 * 3)
        const bal = await eggToken.balanceOf(addr1.address);
        expect(bal).to.equal(ethers.utils.parseEther("185"));
    });

    it("should allow player to use items", async function () {
        await eggToken.connect(addr1).approve(henItem.address, ethers.utils.parseEther("200"));
        await henItem.connect(addr1).buyItem(1, 5);

        await expect(henItem.connect(addr1).useItem(1, 2))
            .to.emit(henItem, "ItemUsed")
            .withArgs(addr1.address, 1, 2);

        expect(await henItem.getBalance(addr1.address, 1)).to.equal(3);
    });

    it("should return player inventory", async function () {
        await eggToken.connect(addr1).approve(henItem.address, ethers.utils.parseEther("200"));
        await henItem.connect(addr1).buyItem(1, 2);
        await henItem.connect(addr1).buyItem(3, 1);

        const inv = await henItem.getInventory(addr1.address);
        expect(inv.length).to.equal(2);
        expect(inv[0].itemId).to.equal(1);
        expect(inv[0].quantity).to.equal(2);
        expect(inv[1].itemId).to.equal(3);
        expect(inv[1].quantity).to.equal(1);
    });

    it("should not show zero-quantity items in inventory", async function () {
        await eggToken.connect(addr1).approve(henItem.address, ethers.utils.parseEther("200"));
        await henItem.connect(addr1).buyItem(1, 1);
        await henItem.connect(addr1).useItem(1, 1);

        const inv = await henItem.getInventory(addr1.address);
        expect(inv.length).to.equal(0);
    });

    it("should revert when buying non-existent item", async function () {
        await eggToken.connect(addr1).approve(henItem.address, ethers.utils.parseEther("200"));

        await expect(
            henItem.connect(addr1).buyItem(99, 1)
        ).to.be.revertedWith("HenItem: item does not exist");
    });

    it("should revert when using more items than owned", async function () {
        await eggToken.connect(addr1).approve(henItem.address, ethers.utils.parseEther("200"));
        await henItem.connect(addr1).buyItem(1, 1);

        await expect(
            henItem.connect(addr1).useItem(1, 5)
        ).to.be.revertedWith("HenItem: not enough items");
    });

    it("should revert when buying with zero quantity", async function () {
        await eggToken.connect(addr1).approve(henItem.address, ethers.utils.parseEther("200"));

        await expect(
            henItem.connect(addr1).buyItem(1, 0)
        ).to.be.revertedWith("HenItem: quantity must be > 0");
    });

    it("should allow owner to deactivate items", async function () {
        await henItem.setItemActive(1, false);

        await eggToken.connect(addr1).approve(henItem.address, ethers.utils.parseEther("200"));

        await expect(
            henItem.connect(addr1).buyItem(1, 1)
        ).to.be.revertedWith("HenItem: item not available");
    });

    it("should allow owner to update item price", async function () {
        await henItem.setItemPrice(1, ethers.utils.parseEther("10"));

        const item1 = await henItem.getItem(1);
        expect(item1.price).to.equal(ethers.utils.parseEther("10"));
    });

    it("should revert when not approved to spend tokens", async function () {
        await expect(
            henItem.connect(addr1).buyItem(1, 1)
        ).to.be.revertedWith("ERC20: insufficient allowance");
    });
});
