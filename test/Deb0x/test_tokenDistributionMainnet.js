const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const { ContractFunctionVisibility } = require("hardhat/internal/hardhat-network/stack-traces/model");
const { abi } = require("../../artifacts/contracts/Deb0xERC20.sol/Deb0xERC20.json")
const { NumUtils } = require("../utils/NumUtils.ts");

let DEBOX_ADDRESS = "0xA06735da049041eb523Ccf0b8c3fB9D36216c646";
let DEBOXVIEW_ADDRESS = "0x51CcBf6DA6c14b6A31Bc0FcA07056151fA003aBC";
let DBX_ADDRESS = "0x22c3f74d4AA7c7e11A7637d589026aa85c7AF88a"
let addresses = [
    "0x00611057ee8eff397c5007370cff5537ebf36eb3",
    "0x01eb619fde01ed6ef5c75b6111a9f019bf15c26a",
    "0x0bc5e470689c7042370dee85b92e216f5a60ebb2",
    "0x13420478b855a8fd26ae31fce2622bdc59dc404b",
    "0x14c287587d53c00e93e73fcf4694b0c64bd39d45",
    "0x16ee6ce5d7428a028bc9a08ee69b3814c9717a06",
    "0x1a4927a9672991725f0bb527225285203f3ce201",
    "0x1b34e2fa75bae673c2fd6e78da39716202f2f41f",
    "0x1f095e1b3184001e23ca53d96039de821da120d3",
    "0x2542e1bb6b348de3082629167b920fa64eaf434c",
    "0x263e2786adb06a347dc733b40edc5ba82566b9cb",
    "0x2dad87948265fb9a64f1532fe6d0bff12dfbeed1",
    "0x32ff0e97339975186fb83f9a6a181ec4de48aa32",
    "0x3fe5e4335d9b1faa03b049045515c379688bb48c",
    "0x40922a8c7aa8117ac62adf381b2149aef98ab7c5",
    "0x4a11ccc2afcefded0d96bf93e42288d82674b9e9",
    "0x4b04293c162b77e75090d5069aae063957a2a81e",
    "0x4b42f0a8a3e270ada60e0fa0b15be79fd68bdb85",
    "0x4beeb4ad1cd28588f45ef032c8d1f8eaf5c79fda",
    "0x4fa2afe9d1240dc41d1c2d9e472c80b05c866746",
    "0x529647127c73ea234c8202df94d8fcd0b5d4eac7",
    "0x563bd42ab3d70324d3fecfa666718ce008af90c6",
    "0x580b092fd7632899fe091dc2cba5b5fdc0782d58",
    "0x58facb5aa241a3334a9208553845538dc17d1dfd",
    "0x5b4afca3b882dbb0e35618608621a45a8068a729",
    "0x5c6db08ed64fe5236f9cddcf4dbb609515037a51",
    "0x5d4c8219d489c08346ce66b1ce57a32ba903a9fd",
    "0x5eb52aabb9c0e5f29ad04205941a8fb5a90c05f0",
    "0x6380cbd365f0b363296e514d9e901ea5fe0267e7",
    "0x6bde606a0a610c5f3743cb82d2415a065b96829d",
    "0x6ef199c42f69ebd488140eaac56de299b09619a9",
    "0x7bdbd04519a09ac1159980db0b03e6119053d885",
    "0x7ca1a885ca6334b928c45f1d3a3a758c3039b339",
    "0x7dfa0800eb6bb757892244e1026815c7684da0a5",
    "0x7f749b520817b9f9591d79268b192c9d18e54f9f",
    "0x842cf5d0855c58a45c765cc37bf5f53122b70236",
    "0x845a1a2e29095c469e755456aa49b09d366f0beb",
    "0x8476de8513c0494631f64984580b780534a9cd0b",
    "0x88f55b75a25a2a9ecbd136b3d573b4a8632994e5",
    "0x899a60d8102161f642e5a3dea8ce55d1f1c35d37",
    "0x8d6235b207ff5d882bae0fe0ab8813f0dcd279e4",
    "0x8df66b63d3c2d086a9fa4afa997d9e5b7c849047",
    "0x90bf2a422f0e6ac00376c813536adba1b527350f",
    "0x9c3c2f4c8fc85190af7759fea09e536ec0c5978d",
    "0x9d8ea60bee0d3e965b59e409e6869c2545b083a9",
    "0xa2784173d3dd644021f766951b00c8a00259887b",
    "0xa3437d75a5dc10aa7f2982714e0c1fa062057f26",
    "0xa4fe18a8bb61c43aefdf88cff6a02d506d40e0b9",
    "0xa7dbd4bcaa39d91b0db9f94015d33a11eaf2c289",
    "0xa907b9ad914be4e2e0ad5b5fecd3c6cad959ee5a",
    "0xa9386296ac7cd56a201416356ab17e54a9d18a37",
    "0xa9682c9d299ad60834a648cc421de171e002dce4",
    "0xad6120732718d3ff26fd5f490d4c51347f96dab6",
    "0xb64d32ed2d062e6400b2db51fdc3d0ba8e1d9336",
    "0xb73b5078445b46ea970a124759831f04956d59ca",
    "0xb93488d4dbc38224e8f4d3436bbb81901ef21825",
    "0xba677f4842ddcffc35badf3cb525d56d2dbb0e66",
    "0xbc0c04d52f3c40f134808fbdb9fe4ab9733c0ab1",
    "0xc3ac8408fbbe50fc0ec0d8055f4b9c4d71698b1e",
    "0xcb276e3bde9b741b8e7cdbae4fb160d119c86744",
    "0xd18c711f66745b8287dd708ec75ff80fa30c7b0b",
    "0xd1c740e1c900a586afc8a570a2c2eedef5ffbd9d",
    "0xdbf9fab2eb982859c5851f3579bb5b64ae06c44d",
    "0xdc86636d25590320c8026c52506ada4dfc3b08ba",
    "0xdfb6bfac83b7f5e02f198a81b6b46b18c8c73aeb",
    "0xe80496089f318dc08ab5177578a7e7cad074460c",
    "0xea9d70f248125a57baf1d4ceb0058ae98087aca6",
    "0xee7e76acb8db805e113f8ffaa4fe93d2a778f8af",
    "0xef7921205d5798dfa54fd23ced5644509d69394f",
    "0xf44570d260b6a54b716ac7ad71745dfbacc3f345",
    "0xf4cdfc702b1c2020f4c90047387b15c1991a55e7",
    "0xf55cf45cbae4fd3fdd54bb00398cc8e8635a75ba",
    "0xf6ee182da9759a14620a2f131a9be49b33bbcac8",
    "0xf7e6abced1f5ace75a660b4e98b6347047f7081b",
    "0xfab6081ba365dd87623b3fdaa8f0bb0d4413030e",
    "0xfba408fee62b16d185fdec548a2609e27f46e027",
    "0xfd10afd3c4b6f312816f35ef8477215aa753cb81"
]

async function test() {

    const Deb0x = await ethers.getContractFactory("Deb0x");
    let deb0xContract = await Deb0x.attach(DEBOX_ADDRESS);

    const Deb0xViews = await ethers.getContractFactory("Deb0xViews");
    let deb0xViewContract = await Deb0xViews.attach(DEBOXVIEW_ADDRESS);

    const DBX = await ethers.getContractFactory("Deb0xERC20");
    let dbx_erc20 = await DBX.attach(DBX_ADDRESS);

    let totalRewardUntilCurrentCycle = BigNumber.from("0");
    let currentCycle = await deb0xContract.currentCycle();
    let currentCycleWithGaps = await deb0xContract.getCurrentCycle();

    let cycleNumber = 0;
    if (currentCycleWithGaps > currentCycle) {
        cycleNumber = currentCycle;
    } else {
        cycleNumber = currentCycle - 1;
    }

    for (let i = 0; i <= cycleNumber; i++) {
        let intermediateBalance = await deb0xContract.rewardPerCycle(i);
        let middle = BigNumber.from(intermediateBalance).add(BigNumber.from(totalRewardUntilCurrentCycle))
        totalRewardUntilCurrentCycle = middle
    }
    let totalAmountAtStakeFirstStake = BigNumber.from("0");;
    let totalAmountAtStakeaccSecondStake = BigNumber.from("0");;
    let totalBalanceOfDBX = BigNumber.from("0");
    let totalUnclaimedReward = BigNumber.from("0");

    for (let i = 0; i < addresses.length; i++) {

        let actualBalance = await dbx_erc20.balanceOf(addresses[i]);
        if (actualBalance != 0) {
            let intermediateBalance = BigNumber.from(totalBalanceOfDBX).add(BigNumber.from(actualBalance));
            totalBalanceOfDBX = intermediateBalance;
        }

        let unclaimedReward = await deb0xViewContract.getUnclaimedRewards(addresses[i]);
        if (unclaimedReward != 0) {
            let intermediatForUnclaimedReward = BigNumber.from(totalUnclaimedReward).add(BigNumber.from(unclaimedReward));
            totalUnclaimedReward = intermediatForUnclaimedReward
        }

        let stakeCycle = Number(await deb0xContract.accFirstStake(addresses[i]));
        let amountInStake = await deb0xContract.accStakeCycle(addresses[i], stakeCycle);
        if (amountInStake != 0) {
            let intermediateForStake = BigNumber.from(totalAmountAtStakeFirstStake).add(BigNumber.from(amountInStake));
            totalAmountAtStakeFirstStake = intermediateForStake;
        }

        let stakeCycle2 = Number(await deb0xContract.accSecondStake(addresses[i]));
        let amountInStake2 = await deb0xContract.accStakeCycle(addresses[i], stakeCycle2);
        totalAmountAtStakeaccSecondStake = BigNumber.from(totalAmountAtStakeaccSecondStake).add(amountInStake2);
        if (amountInStake2 != 0) {
            let intermediateForStake2 = BigNumber.from(totalAmountAtStakeaccSecondStake).add(BigNumber.from(amountInStake2));
            totalAmountAtStakeaccSecondStake = intermediateForStake2;
        }

    }
    let total = BigNumber.from(totalBalanceOfDBX).add(BigNumber.from(totalUnclaimedReward)).add(BigNumber.from(totalAmountAtStakeFirstStake)).add(BigNumber.from(totalAmountAtStakeaccSecondStake))
    expect(totalRewardUntilCurrentCycle).to.equal(total);
};

// Command for run this test: npx hardhat run --network matic test/Deb0x/test_tokenDistributionMainnet.js
test();