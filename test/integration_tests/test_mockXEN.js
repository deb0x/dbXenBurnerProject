const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe.only("Integration tests that covers big minting numbers", function() {
  async function environmentFixture() {
    const [owner, add1, add2] = await ethers.getSigners();

    const MathX = await ethers.getContractFactory("MathX");
    const mathX = await MathX.deploy();
    await mathX.deployed();

    const MockXenCrypto = await ethers.getContractFactory("MockXENCrypto", {
      libraries: {
        MathX: mathX.address,
      },
    });
    const mockXenCrypto = await MockXenCrypto.deploy();
    await mockXenCrypto.deployed();

    const DBXen = await ethers.getContractFactory("DBXen");
    const dbXen = await DBXen.deploy(
      ethers.constants.AddressZero,
      mockXenCrypto.address
    );
    await dbXen.deployed();

    return { mathX, mockXenCrypto, dbXen, owner, add1, add2 };
  }

  it("Should mint through DBXen", async () => {
    const { mockXenCrypto, dbXen, owner } = await loadFixture(
      environmentFixture
    );

    await mockXenCrypto.connect(owner).approve(dbXen.address, ethers.utils.parseEther("25000000000"));
    await dbXen
      .connect(owner)
      .burnBatch(10000, { value: ethers.utils.parseEther("1") });

    let ownerBalance = await mockXenCrypto.balanceOf(owner.address);
    expect(await mockXenCrypto.totalSupply()).to.equal(ownerBalance);
  });
});
