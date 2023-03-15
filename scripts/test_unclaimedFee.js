const { ethers } = require("hardhat");
async function main(userAddress) {
    try {
        console.log("here")
        let dbXEN = await hre.ethers.getContractAt("DBXen", "0x9caf6C4e5B9E3A6f83182Befd782304c7A8EE6De")
        let dbXENView = await hre.ethers.getContractAt("DBXenViews", "0xA0C192aE0C75FDE64A42D9f0430e7163Fd6701e5")
        console.log("test")
        console.log(await dbXENView.getUnclaimedRewards("0xB4E20fF970aA1911C2a38058b2cdc7E66f393788"))
        console.log(await dbXENView.getUnclaimedFees("0xB4E20fF970aA1911C2a38058b2cdc7E66f393788"))
    } catch (e) {
        console.error(e);
    }
}

main("0x2dAD87948265Fb9a64F1532fe6d0BfF12dFBeED1")
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });