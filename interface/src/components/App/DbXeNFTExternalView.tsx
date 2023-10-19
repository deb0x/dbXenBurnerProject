import { useWeb3React } from "@web3-react/core";
import { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ChainContext from "../Contexts/ChainContext";
import DBXENFTFactory from "../../ethereum/dbxenftFactory.js";
import { BigNumber, ethers } from "ethers";
import { Card, CardActions, CardContent } from "@mui/material";
import "../../componentsStyling/dbxenftPage.scss";
import coinBagLight from "../../photos/icons/coin-bag-solid--light.svg";
import walletLight from "../../photos/icons/wallet--light.svg";
import DBXenERC20 from "../../ethereum/dbxenerc20";
import {
    ContractCallContext,
    ContractCallResults,
    Multicall
} from "ethereum-multicall";
import MintInfo from "../../ethereum/mintInfo.js";
import XENFT from "../../ethereum/xenTorrent";

const { abi } = require("../../ethereum/DBXeNFTFactory.json");
interface DBXENFTEntry {
    id: number;
    description: string
    name: string;
    image: string;
    maturityDate?: Date
}

export function DbXeNFTExternalView(): any {
    const context = useWeb3React();
    const { account, library } = context
    const { chain } = useContext(ChainContext);
    const [DBXENFT, setDBXENFT] = useState<DBXENFTEntry[]>([]);
    const { bucketName, id } = useParams();
    const [userUnstakedAmount, setUserUnstakedAmount] = useState("");
    const [userStakedAmount, setUserStakedAmount] = useState("");
    const [unclaimedFees, setUnclaimedFees] = useState("0.0");
    const [baseDBXENFTPower, setBaseDBXENFTPower] = useState("");
    const [dbxenftPower, setDBXENFTPower] = useState("");
    const [unclaimedXen, setUnclaimedXen] = useState("0.0");
    const [dxnTokenName, setDxnTokenName] = useState("");
    const [chainCurrency, setChainCurrency] = useState("");
    const STORAGE_EP = "https://dbxen-be.prodigy-it-solutions.com/api/storage/";
    const createApiOptions = (data: any) =>
        ({ method: "POST", body: JSON.stringify(data) });
    const getStorageObject = (data: any) =>
        fetch(STORAGE_EP + "GetObjectCommand", createApiOptions(data))
        .then((result) => result.json());
    const fileName = id + ".json";
    const params = {
        Bucket: bucketName,
        Key: fileName,
    }

    useEffect(() => {
        getDBXeNFTs();
        getUpdatedDBXENFTData(id);
        displayCurrencies();
    }, [chain, account])

    useEffect(() => {
        setUnstakedAmount()
    }, [userUnstakedAmount]);

    useEffect(() => {
        getUpdatedDBXENFTData(id);
    }, [unclaimedFees, unclaimedXen])

    const displayCurrencies = () => {
        const chainName = bucketName?.split("-").pop();

        switch(chainName) {
            case "polygon":
                setDxnTokenName("mDXN")
                setChainCurrency("MATIC")
                break;
            case "avax":
                setDxnTokenName("aDXN")
                setChainCurrency("AVAX")
                break;
            case "bsc":
                setDxnTokenName("bDXN")
                setChainCurrency("BNB")
                break;
            case "fantom":
                setDxnTokenName("fmDXN")
                setChainCurrency("FTM")
                break;
        }
    }

    const getDBXeNFTs = () => {
        getStorageObject(params).then((result) => {
            let dbxenftEntries: DBXENFTEntry[] = [];
            dbxenftEntries.push({
                id: result.id,
                name: result.name,
                description: result.description,
                image: result.image,
                maturityDate: result.attributes[2].value
            });
            setDBXENFT(dbxenftEntries);
        })
    }

    async function setUnstakedAmount() {
        const deb0xERC20Contract = DBXenERC20(library, chain.deb0xERC20Address)
        deb0xERC20Contract.balanceOf(account).then((balance: any) => {
            let number = ethers.utils.formatEther(balance);
            setUserUnstakedAmount(parseFloat(number.slice(0, (number.indexOf(".")) + 3)).toString())
        })
    }

    async function getUpdatedDBXENFTData(tokenId: any) {
        const multicall = new Multicall({ ethersProvider: library, tryAggregate: true });

        const dbxenftFactory = DBXENFTFactory(library, chain.dbxenftFactoryAddress)
        const entryCycle = await dbxenftFactory.tokenEntryCycle(tokenId)

        const contractCallContext: ContractCallContext[] = [
            {
                reference: 'DBXENFTFactory',
                contractAddress: chain.dbxenftFactoryAddress,
                abi,
                calls: [
                    { reference: 'getCurrentCycleCall', methodName: 'getCurrentCycle', methodParameters: [] },
                    { reference: 'getDBXENFTAccruedFees', methodName: 'dbxenftAccruedFees', methodParameters: [tokenId] },
                    { reference: 'getPreviousStartedCycle', methodName: 'previousStartedCycle', methodParameters: [] },
                    { reference: 'getLastStartedCycle', methodName: 'lastStartedCycle', methodParameters: [] },
                    { reference: 'getCurrentStartedCycle', methodName: 'currentStartedCycle', methodParameters: [] },
                    { reference: 'getPendingFees', methodName: 'pendingFees', methodParameters: [] },
                    { reference: 'getDBXENFTEntryPower', methodName: 'dbxenftEntryPower', methodParameters: [tokenId] },
                    { reference: 'getEntryCycleReward', methodName: 'rewardPerCycle', methodParameters: [entryCycle] },
                    { reference: 'getTotalEntryCycleEntryPower', methodName: 'totalEntryPowerPerCycle', methodParameters: [entryCycle] },
                    { reference: 'getBaseDBXENFTPower', methodName: 'baseDBXeNFTPower', methodParameters: [tokenId] },
                    { reference: 'getDBXENFTPower', methodName: 'dbxenftPower', methodParameters: [tokenId] },
                    { reference: 'getLastFeeUpdateCycle', methodName: 'lastFeeUpdateCycle', methodParameters: [tokenId] },
                    { reference: 'getDBXENFTFirstStake', methodName: 'dbxenftFirstStake', methodParameters: [tokenId] },
                    { reference: 'getDBXENFTSecondStake', methodName: 'dbxenftSecondStake', methodParameters: [tokenId] },
                    { reference: 'getLastPowerUpdateCycle', methodName: 'lastPowerUpdateCycle', methodParameters: [tokenId] }
                ]
            }
        ];

        const response: ContractCallResults = await multicall.call(contractCallContext);
        const currentCycle = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[0].returnValues[0])
        let dbxenftAccruedFees = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[1].returnValues[0])
        let previousStartedCycle = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[2].returnValues[0])
        let lastStartedCycle = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[3].returnValues[0])
        const currentStartedCycle = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[4].returnValues[0])
        const pendingFees = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[5].returnValues[0])
        const dbxenftEntryPower = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[6].returnValues[0])
        const entryCycleReward = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[7].returnValues[0])
        const totalEntryCycleEntryPower = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[8].returnValues[0])
        let baseDBXENFTPower = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[9].returnValues[0])
        let dbxenftPower = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[10].returnValues[0])
        const lastFeeUpdateCycle = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[11].returnValues[0])
        const dbxenftFirstStake = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[12].returnValues[0])
        const dbxenftSecondStake = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[13].returnValues[0])
        const lastPowerUpdateCycle = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[14].returnValues[0])

        if(!currentCycle.eq(currentStartedCycle)) {
            previousStartedCycle = lastStartedCycle.add(BigNumber.from("1"))
            lastStartedCycle = currentStartedCycle
        }

        const contractCallContext2: ContractCallContext[] = [
            {
                reference: 'DBXENFTFactory',
                contractAddress: chain.dbxenftFactoryAddress,
                abi,
                calls: [
                    { reference: 'getSummedCyclePowers', methodName: 'summedCyclePowers', methodParameters: [lastStartedCycle] },
                    { reference: 'getCFPPSLastStartedCycle', methodName: 'cycleFeesPerPowerSummed', methodParameters: [lastStartedCycle.add(BigNumber.from("1"))] },
                    { reference: 'getCFPPSPreviousStartedCycle', methodName: 'cycleFeesPerPowerSummed', methodParameters: [previousStartedCycle] },
                    { reference: 'getCFPPSLastFeeUpdateCycle', methodName: 'cycleFeesPerPowerSummed', methodParameters: [lastFeeUpdateCycle] },
                    { reference: 'getCFPPSStakeCycle', methodName: 'cycleFeesPerPowerSummed', methodParameters: [dbxenftFirstStake] },
                    { reference: 'getCycleAccruedFees', methodName: 'cycleAccruedFees', methodParameters: [lastStartedCycle] },
                    { reference: 'getPendingDXN', methodName: 'pendingDXN', methodParameters: [tokenId] },
                    { reference: 'getDBXENFTFirstStakeCycle', methodName: 'dbxenftStakeCycle', methodParameters: [tokenId, dbxenftFirstStake] },
                    { reference: 'getDBXENFTSecondStakeCycle', methodName: 'dbxenftStakeCycle', methodParameters: [tokenId, dbxenftSecondStake] },
                    { reference: 'getDBXENFTWithdrawableStake', methodName: 'dbxenftWithdrawableStake', methodParameters: [tokenId] },
                    { reference: 'getCFPPSStakeCycle', methodName: 'cycleFeesPerPowerSummed', methodParameters: [dbxenftSecondStake] }
                ]
            }
        ];

        const response2: ContractCallResults = await multicall.call(contractCallContext2);

        const summedCyclePowers = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[0].returnValues[0])
        let CFPPSLastStartedCycle = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[1].returnValues[0])
        const CFPPSPreviousStartedCycle = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[2].returnValues[0])
        const CFPPSLastFeeUpdateCycle = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[3].returnValues[0])
        const CFPPSStakeCycleFirstStake = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[4].returnValues[0])
        const cycleAccruedFees = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[5].returnValues[0])
        const pendingDXN = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[6].returnValues[0])
        const dbxenftFirstStakeCycle = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[7].returnValues[0])
        const dbxenfSecondStakeCycle = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[8].returnValues[0])
        let dbxenftWithdrawableStake = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[9].returnValues[0])
        const CFPPSStakeCycleSecondStake = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[10].returnValues[0])
    
        if(currentCycle.gt(lastStartedCycle) && CFPPSLastStartedCycle.isZero()) { 
            const feePerStake = (cycleAccruedFees.mul(BigNumber.from("10000000000000000000000000000000000000000")))
            .div(summedCyclePowers)

            CFPPSLastStartedCycle = CFPPSPreviousStartedCycle.add(feePerStake)
        }

        if(baseDBXENFTPower.isZero() && currentCycle.gt(entryCycle)) {
            baseDBXENFTPower = dbxenftEntryPower.mul(entryCycleReward).div(totalEntryCycleEntryPower)
            dbxenftPower = dbxenftPower.add(baseDBXENFTPower)
        }

        let extraPower = BigNumber.from(0)
        const dbxenftPowerBeforeExtraPower = dbxenftPower 
        if(currentCycle.gt(lastPowerUpdateCycle) && !pendingDXN.isZero()) {
            extraPower = baseDBXENFTPower.mul(pendingDXN).div(ethers.utils.parseEther("100"))
            dbxenftPower = dbxenftPower.add(extraPower)
        }

        if(currentCycle.gt(lastStartedCycle) && (!lastFeeUpdateCycle.eq(lastStartedCycle.add(BigNumber.from("1"))))) {
            dbxenftAccruedFees = dbxenftAccruedFees.add(
                dbxenftPowerBeforeExtraPower.mul(CFPPSLastStartedCycle.sub(CFPPSLastFeeUpdateCycle))
                .div(BigNumber.from("10000000000000000000000000000000000000000"))
            )

            if(!pendingDXN.isZero()) {
                let stakeCycle, CFPPSStakeCycle
                if(!dbxenftSecondStake.isZero()) {
                    stakeCycle = dbxenftSecondStake
                    CFPPSStakeCycle = CFPPSStakeCycleSecondStake
                } else {
                    stakeCycle = dbxenftFirstStake
                    CFPPSStakeCycle = CFPPSStakeCycleFirstStake
                }
                

                if(lastStartedCycle.gt(stakeCycle.sub(BigNumber.from("1")))) {
                    dbxenftAccruedFees = dbxenftAccruedFees.add(
                        extraPower.mul(CFPPSLastStartedCycle.sub(CFPPSStakeCycle))
                        .div(BigNumber.from("10000000000000000000000000000000000000000"))
                    )
                }
            }
        }
        let unlockedStake = BigNumber.from(0)
        let totalStaked = dbxenftFirstStakeCycle.add(dbxenfSecondStakeCycle).add(dbxenftWithdrawableStake)

        if(!dbxenftFirstStake.isZero() && currentCycle.gt(dbxenftFirstStake)) {
            unlockedStake = unlockedStake.add(dbxenftFirstStakeCycle)

            if(!dbxenftSecondStake.isZero() && currentCycle.gt(dbxenftSecondStake)) {
                unlockedStake = unlockedStake.add(dbxenfSecondStakeCycle)
            }
        }

        dbxenftWithdrawableStake = dbxenftWithdrawableStake.add(unlockedStake)
        setUserStakedAmount(ethers.utils.formatEther(totalStaked))
        setBaseDBXENFTPower(ethers.utils.formatEther(baseDBXENFTPower))
        setDBXENFTPower(ethers.utils.formatEther(dbxenftPower))
        setUnclaimedFees(ethers.utils.formatEther(dbxenftAccruedFees))
        isXenftRedeemed(id).then((redeemed) => redeemed ? setUnclaimedXen("0.0") : setUnclaimedXen(ethers.utils.formatEther(dbxenftEntryPower)))
    }

    async function isXenftRedeemed(dbxenftId: any) {
        const dbxenftFactory = DBXENFTFactory(library, chain.dbxenftFactoryAddress);
        const xenftId = await dbxenftFactory.dbxenftUnderlyingXENFT(dbxenftId)
        const MintInfoContract = MintInfo(library, chain.mintInfoAddress)
        const XENFTContract = XENFT(library,  chain.xenftAddress)
        const isRedeemed = await MintInfoContract.getRedeemed(
            await XENFTContract.mintInfo(xenftId)
        );

        return isRedeemed
    }

    return (
        <div className="content-box dbxenft-page">
            <div className="row card-container">
                <Card className="col-12 col-md-6 stake-card card">
                    {DBXENFT.map((xenft: any, i: any) => (
                        <>
                            <CardContent>
                                <div className="" key={i}>
                                    <div className="nft-card">
                                        <div className="card-row card-header">
                                            <img src={xenft.image} alt="nft-placeholder" />
                                        </div>
                                        <div className="card-details">
                                            <div className="dbxenft-power">
                                                <span className="label">DBXENFT base power</span>
                                                <span className="value">{baseDBXENFTPower}</span>
                                            </div>
                                            <div className="dbxenft-power">
                                                <span className="label">DBXENFT total power</span>
                                                <span className="value">{dbxenftPower}</span>
                                            </div>
                                            <div className="card-row">
                                                <span className="label">tokenID: </span>
                                                <span className="value">{xenft.id}</span>
                                            </div>
                                            <div className="card-row">
                                                <span className="label">name: </span>
                                                <span className="value">{xenft.name}</span>
                                            </div>
                                            <div className="card-row mb-3">
                                                <span className="label">matures on: </span>
                                                <span className="value">{new Date(xenft.maturityDate).toLocaleString()}</span>
                                            </div>
                                        </div>
                                        <div className="stake-container">
                                            <div className="tokens-in-wallet">
                                                <img className="display-element" src={coinBagLight} alt="wallet" />
                                                <p className="label">
                                                    Your staked amount:
                                                </p>
                                                <p className="m-0" >
                                                    <strong>
                                                        {Number(userStakedAmount).toLocaleString('en-US', {
                                                            minimumFractionDigits: 4,
                                                            maximumFractionDigits: 4
                                                        })} DXN
                                                    </strong>
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </>
                    ))}
                </Card>
                <Card className="col-12 col-md-6 reward-card card">
                    <CardContent>
                        <div className="tokens-in-wallet">
                            <img className="display-element" src={walletLight} alt="wallet" />
                            <p className="mb-0">
                                DXN tokens in your wallet:
                            </p>
                            <p className="m-0" >
                                <strong>
                                    {Number(userUnstakedAmount).toLocaleString('en-US', {
                                        minimumFractionDigits: 4,
                                        maximumFractionDigits: 4
                                    })} {dxnTokenName}
                                </strong>
                            </p>
                        </div>
                        <div className="fees native-fees">
                            <img className="display-element" src={coinBagLight} alt="coinbag" />
                            <p className="m-0">
                                Unclaimed fees:
                            </p>
                            <p className="m-0" >
                                {unclaimedFees} {chainCurrency}
                            </p>
                        </div>

                        <div className="fees xen-fees">
                            <img className="display-element" src={coinBagLight} alt="coinbag" />
                            <p className="m-0">
                                Unclaimed XEN:
                            </p>
                            <p className="m-0" >
                                {unclaimedXen}
                            </p>
                        </div>
                    </CardContent>
                    <CardActions>

                    </CardActions>
                </Card>
            </div>
        </div>
    );
}