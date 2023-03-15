const { ethers } = require("hardhat");
async function main(userAddress) {
    try {
        console.log("here")
        let dbXEN = await hre.ethers.getContractAt("DBXen", "0x9caf6C4e5B9E3A6f83182Befd782304c7A8EE6De")
        let dbXENView = await hre.ethers.getContractAt("DBXenViews", "0xaf51dbf9081016ec784B54214A988Db1136dFaF0")
        console.log("test")
        console.log(await dbXENView.getUnclaimedRewards("0xB4E20fF970aA1911C2a38058b2cdc7E66f393788"))
        console.log(await dbXENView.getUnclaimedFees("0xB4E20fF970aA1911C2a38058b2cdc7E66f393788"))
    } catch (e) {
        console.error(e);
    }
}

main("0xB4E20fF970aA1911C2a38058b2cdc7E66f393788")
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });