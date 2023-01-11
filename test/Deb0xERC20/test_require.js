const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { abi } = require("../../artifacts/contracts/Deb0xERC20.sol/Deb0xERC20.json")
const { NumUtils } = require("../utils/NumUtils.ts");
const { Converter } = require("../utils/Converter.ts");
let ipfsLink = "QmWfmAHFy6hgr9BPmh2DX31qhAs4bYoteDDwK51eyG9En9";
let payload = Converter.convertStringToBytes32(ipfsLink);

describe("Memory intensive tests: ERC20 supply limit", async function() {

    let userReward, user1Reward, user2Reward, user3Reward, frontend, dbxERC20, totalMinted;
    let user1, user2;
    beforeEach("Set enviroment", async() => {
        [user1, user2, user3, messageReceiver, feeReceiver] = await ethers.getSigners();

        const Deb0x = await ethers.getContractFactory("Deb0x");
        userReward = await Deb0x.deploy(ethers.constants.AddressZero);
        await userReward.deployed();

        const dbxAddress = await userReward.dbx()
        dbxERC20 = new ethers.Contract(dbxAddress, abi, hre.ethers.provider)

        user1Reward = userReward.connect(user1)
        user2Reward = userReward.connect(user2)
        user3Reward = userReward.connect(user3)
        frontend = userReward.connect(feeReceiver)
    })

    it.ignore(`Should test require`, async() => {
        for (let i = 0; i < 22532; i++) {
            await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
            await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
            await hre.ethers.provider.send("evm_mine")
            try {
                await user1Reward.claimRewards();
            } catch (e) {
                console.log('Claim rewards failed. Probably last day?');
            }
            if (i % 100 == 0) {
                console.log(`Days past: ${i}`);
            }
        }

        //console.log(`Last cycle:   ${await user1Reward.getCurrentCycle()}`);
        //console.log(`Last reward:  ${await user1Reward.calculateCycleReward()}`);
        //console.log(`User balance: ${await dbxERC20.balanceOf(user1.address)}`);
        //console.log(`Total supply: ${await dbxERC20.totalSupply()}`);

        //console.log("Rewards should be ended. Adding 10 more sends");
        for (let i = 0; i < 10; i++) {
            await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
            await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
            await hre.ethers.provider.send("evm_mine")
                //console.log(`Extra days past: ${i}`);
        }

        await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
        await hre.ethers.provider.send("evm_mine")

        let user1Balance = await dbxERC20.balanceOf(user1.address);
        let totalSupply = await dbxERC20.totalSupply();
        expect(user1Balance).to.equal(totalSupply);
    });

    //This test can be use to test require in Deb0xERC20 contract. Require condition must be modified with a value lower than total supply
    it.ignore(`Should test require`, async() => {
        try {
            for (let i = 0; i < 15000; i++) {
                await user1Reward["send(address[],bytes32[][],address,uint256,uint256)"]([messageReceiver.address], [payload], ethers.constants.AddressZero, 0, 0, { value: ethers.utils.parseEther("1") })
                await hre.ethers.provider.send("evm_increaseTime", [60 * 60 * 24])
                await hre.ethers.provider.send("evm_mine")
                await user1Reward.claimRewards();
            }
        } catch (error) {
            expect(error.message).to.include("DBX: max supply already minted");
        }
    });
});

/// LOG  OUTPUT
/// LOG  OUTPUT
/// LOG  OUTPUT
/// LOG  OUTPUT
// 
// 
// Days past: 22100
// Days past: 22200
// Days past: 22300
// Days past: 22400
// Days past: 22500
// Last cycle:   22532
// Last reward:  1
// User balance: 5009999999999999994375938
// Total supply: 5009999999999999994375938
// Rewards should be ended. Adding 10 more sends
// Extra days past: 0
// 
//     1) Should test require
// 
// ·-----------------------------|---------------------------|-----------|-----------------------------·
// |    Solc version: 0.8.17     ·  Optimizer enabled: true  ·  Runs: 1  ·  Block limit: 30000000 gas  │
// ······························|···························|···········|······························
// |  Methods                                                                                          │
// ·············|················|·············|·············|···········|···············|··············
// |  Contract  ·  Method        ·  Min        ·  Max        ·  Avg      ·  # calls      ·  usd (avg)  │
// ·············|················|·············|·············|···········|···············|··············
// |  Deb0x     ·  claimRewards  ·     143195  ·     245795  ·   143200  ·        22532  ·          -  │
// ·············|················|·············|·············|···········|···············|··············
// |  Deb0x     ·  send          ·     129856  ·     329601  ·   229799  ·        22533  ·          -  │
// ·············|················|·············|·············|···········|···············|··············
// |  Deployments                ·                                       ·  % of limit   ·             │
// ······························|·············|·············|···········|···············|··············
// |  Deb0x                      ·          -  ·          -  ·  6067644  ·       20.2 %  ·          -  │
// ·-----------------------------|-------------|-------------|-----------|---------------|-------------·
// 
//   0 passing (29m)
//   1 failing
// 
//   1) Memory intensive tests: ERC20 supply limit
//        Should test require:
//      Error: VM Exception while processing transaction: reverted with panic code 0x12 (Division or modulo division by zero)
//       at Deb0x.updateCycleFeesPerStakeSummed (contracts/Deb0x.sol:185)
//       at Deb0x.send (contracts/Deb0x.sol:361)
//       at runMicrotasks (<anonymous>)
//       at processTicksAndRejections (internal/process/task_queues.js:95:5)
//       at runNextTicks (internal/process/task_queues.js:64:3)
//       at listOnTimeout (internal/timers.js:524:9)
//       at processTimers (internal/timers.js:498:7)
//       at HardhatNode._mineBlockWithPendingTxs (node_modules/hardhat/src/internal/hardhat-network/provider/node.ts:1802:23)
//       at HardhatNode.mineBlock (node_modules/hardhat/src/internal/hardhat-network/provider/node.ts:491:16)
// 
// 
// 
// npm ERR! Test failed.  See above for more details.
//