import "../../componentsStyling/dbxenft.scss";
import nftPlaceholder from "../../photos/icons/nft-placeholder.png";
import nftImage from "../../photos/xenft.svg";
import { useState, useEffect, useContext } from 'react';
import { useWeb3React } from '@web3-react/core';
import ChainContext from '../Contexts/ChainContext';
import DBXENFTFactory from "../../ethereum/dbxenftFactory";
import XENFT from "../../ethereum/xenTorrent";
import XENCrypto from "../../ethereum/XENCrypto";
import mintInfo from "../../ethereum/mintInfo";
import DXN from "../../ethereum/dbxenerc20"
import LoadingButton from '@mui/lab/LoadingButton';
import { Spinner } from './Spinner';
import SnackbarNotification from './Snackbar';
import axios, { Method } from 'axios';
import web3 from 'web3';
import { ethers } from "ethers";
import {
    Multicall,
    ContractCallResults,
    ContractCallContext,
} from 'ethereum-multicall';
import Moralis from "moralis";
import { StringMap } from "i18next";
import formatAccountName from '../Common/AccountName';
import { writePerCycle, generateAfterReveal, getIdsMintedPerCycle } from "../Common/aws-interaction";
import { arrToBufArr } from "ethereumjs-util";

const { abi } = require("../../ethereum/DBXeNFTFactory.json");
const { BigNumber } = require("ethers");

interface XENFTEntry {
    id: number;
    claimStatus: string;
    class: string;
    VMUs: number;
    cRank: string;
    AMP: number;
    EAA: string;
    maturityDateTime: Date;
    term: number;
    xenBurned: string;
    category: string;
    image: string;
}
interface DBXENFT {
    protocolFee: string;
    transactionFee: string
}

export function MintDbXeNFT(): any {
    const context = useWeb3React()
    const { library, account } = context
    const { chain } = useContext(ChainContext)
    const [notificationState, setNotificationState] = useState({});
    const [loading, setLoading] = useState(false);
    const [XENFTs, setXENFTs] = useState<XENFTEntry[]>([]);
    const [DBXENFT, setDBXNFT] = useState<DBXENFT>();

    useEffect(() => {
        startMoralis();
        getXENFTs();
    }, [chain])

    const startMoralis = () => {
        Moralis.start({ apiKey: process.env.REACT_APP_MORALIS_KEY_NFT })
            .catch((e) => console.log("moralis error"))
    }

    const getXENFTs = () => {

        Moralis.EvmApi.nft.getWalletNFTs({
            chain: chain.chainId,
            format: "decimal",
            normalizeMetadata: true,
            tokenAddresses: [chain.xenftAddress],
            address: account ? account : ""
        }).then(async (result) => {
            const response = result.raw;
            if (response) {
                const resultArray: any = response.result;

                let xenftEntries: XENFTEntry[] = [];
                const thisDate = new Date();

                for (let i = 0; i < resultArray?.length; i++) {
                    let result = resultArray[i];
                    const resultAttributes: any[] = result.normalized_metadata.attributes;


                    console.log(result)
                    if (chain.chainId == "80001") {
                        xenftEntries.push({
                            id: result.token_id,
                            claimStatus:
                                resultAttributes[7].value == "no"
                                    ? new Date(resultAttributes[6].value * 1000) < new Date()
                                        ? "Claimable"
                                        : ` ${daysLeft(
                                            new Date(resultAttributes[6].value * 1000),
                                            new Date()
                                        )} day(s) left`
                                    : "Redeemed",
                            class: resultAttributes[0].value,
                            VMUs: parseInt(resultAttributes[1].value),
                            cRank: resultAttributes[2].value,
                            AMP: parseInt(resultAttributes[3].value),
                            EAA: resultAttributes[5].value,
                            maturityDateTime: resultAttributes[7].value,
                            term: resultAttributes[8].value,
                            xenBurned: resultAttributes[9].value,
                            category: resultAttributes[10].value,
                            image: result.normalized_metadata.image
                        });
                    } else {
                        const maturityDateObject = resultAttributes.find(
                            (item) => item.trait_type == "Maturity DateTime"
                        );
                        const signer = library.getSigner(0)
                        const MintInfoContract = mintInfo(signer, chain.mintInfoAddress);
                        const XENFTContract = XENFT(signer, chain.xenftAddress);
                        const isRedeemed = await MintInfoContract.getRedeemed(
                            await XENFTContract.mintInfo(result.token_id)
                        )

                        try {
                            const maturityDate = new Date(maturityDateObject.value);

                            let claimStatus;
                            if (thisDate < maturityDate) {
                                const daysToGo = daysLeft(maturityDate, thisDate);
                                claimStatus = `${daysToGo} days left`;
                            } else if (isRedeemed) {
                                claimStatus = "Redeemed";
                            } else if ((thisDate.getTime() - maturityDate.getTime()) / (1000 * 3600 * 24) >= 6) {
                                claimStatus = "Penalized"
                            }
                            else {
                                claimStatus = "Claimable";
                            }
                            xenftEntries.push({
                                id: result.token_id,
                                claimStatus: claimStatus,
                                class: resultAttributes[0].value,
                                VMUs: parseInt(resultAttributes[1].value),
                                cRank: resultAttributes[2].value,
                                AMP: parseInt(resultAttributes[3].value),
                                EAA: resultAttributes[5].value,
                                maturityDateTime: resultAttributes[7].value,
                                term: parseInt(resultAttributes[8].value),
                                xenBurned: resultAttributes[9].value,
                                category: resultAttributes[10].value,
                                image: result.normalized_metadata.image
                            });
                        } catch (err) {
                            console.log(err);
                        }
                    }
                }
                setXENFTs(xenftEntries);
                setLoading(false);
            }
        })
    }

    const daysLeft = (date_1: Date, date_2: Date) => {

        let difference = date_1.getTime() - date_2.getTime();
        let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
        return TotalDays;
    };

    async function isXENFTApproved(tokenId: any) {
        const xenftContract = XENFT(library, chain.xenftAddress);
        const approvedAddress = await xenftContract.getApproved(tokenId)
        const isApproved = approvedAddress == chain.dbxenftFactoryAddress
        console.log(isApproved)
        return isApproved
    }

    async function isApprovedForAll() {
        const xenftContract = XENFT(library, chain.xenftAddress);
        const isApprovedForAll = await xenftContract.isApprovedForAll(account, chain.dbxenftFactoryAddress)
        console.log(isApprovedForAll)
        return isApprovedForAll
    }

    async function approveForAll() {
        setLoading(true);
        const signer = library.getSigner(0)
        const xenftContract = XENFT(signer, chain.xenftAddress);

        console.log("aaa")

        try {
            const tx = await xenftContract.setApprovalForAll(chain.dbxenftFactoryAddress, true)
            tx.wait()
                .then((result: any) => {
                    console.log(result)
                    setNotificationState({
                        message: "Your succesfully approved contract for handling your XENFTs.", open: true,
                        severity: "success"
                    })
                    setLoading(false)
                })
                .catch((error: any) => {
                    setNotificationState({
                        message: "Contract couldn't be approved for handling your XENFTs!", open: true,
                        severity: "error"
                    })
                    setLoading(false)
                })
        } catch (error) {
            setNotificationState({
                message: "You rejected the transaction. Contract hasn't been approved for burn.", open: true,
                severity: "info"
            })
            setLoading(false)
        }
    }

    async function mintDBXENFT(
        tokenId: any,
        maturityTs: number,
        VMUs: number,
        EAA: string,
        term: number,
        AMP: number,
        cRank: string,
        claimStatus: string) {
        setLoading(true)
        const signer = await library.getSigner(0)
        const dbxenftFactory = DBXENFTFactory(signer, chain.dbxenftFactoryAddress)
        let fee;

        try {
            // if (claimStatus == "Redeemed") {
            //     fee = ethers.utils.parseEther("0.01");
            // } else {
            fee = await calcMintFee(
                maturityTs,
                VMUs,
                EAA,
                term,
                AMP,
                cRank
            )
            // }
            const overrides = {
                value: fee,
                gasLimit: (BigNumber.from("400000"))
            }

            const tx = await dbxenftFactory.mintDBXENFT(tokenId, overrides)
            await tx.wait()
                .then((result: any) => {
                    setNotificationState({
                        message: "Your succesfully minted a DBXENFT.", open: true,
                        severity: "success"
                    })
                    setLoading(false)
                })
                .catch((error: any) => {
                    setNotificationState({
                        message: "Contract couldn't mint your DBXENFT!", open: true,
                        severity: "error"
                    })
                    setLoading(false)
                })
        } catch (error) {
            console.log(error)
            setNotificationState({
                message: "You rejected the transaction. Contract hasn't been approved for burn.", open: true,
                severity: "info"
            })
            setLoading(false)
        }
    }

    async function claimXen(tokenId: any) {
        setLoading(true)
        const signer = await library.getSigner(0)
        const dbxenftFactory = DBXENFTFactory(signer, chain.dbxenftFactoryAddress)

        try {

            const tx = await dbxenftFactory.claimXen(tokenId)
            await tx.wait()
                .then((result: any) => {
                    setNotificationState({
                        message: "You succesfully claimed your Xen.", open: true,
                        severity: "success"
                    })
                    setLoading(false)
                })
                .catch((error: any) => {
                    setNotificationState({
                        message: "Claiming your Xen was unsuccesful!", open: true,
                        severity: "error"
                    })
                    setLoading(false)
                })
        } catch (error) {
            setNotificationState({
                message: "You rejected the transaction. Your Xen haven't been claimed.", open: true,
                severity: "info"
            })
            setLoading(false)
        }
    }

    function calcMaturityDays(term: any, maturityTs: any) {
        let daysTillClaim = 0
        let daysSinceMinted = 0
        let maturityDays = 0;

        const currentTimestamp = getTimestampInSeconds()
        const SECONDS_IN_DAYS = 3600 * 24

        if (currentTimestamp < maturityTs) {
            daysTillClaim = Math.floor((maturityTs - currentTimestamp) / SECONDS_IN_DAYS);
            daysSinceMinted = term - daysTillClaim
        } else {
            daysSinceMinted = Math.floor((term * SECONDS_IN_DAYS + (currentTimestamp - maturityTs))
                / SECONDS_IN_DAYS)
        }

        if (daysSinceMinted > daysTillClaim) {
            maturityDays = daysSinceMinted - daysTillClaim
        }

        return maturityDays
    }

    async function calcMintFee(
        maturityTs: number,
        VMUs: number,
        EAA: string,
        term: number,
        AMP: number,
        cRank: string
    ) {
        const estReward: any = await getNFTRewardInXen(
            maturityTs,
            VMUs,
            EAA,
            term,
            AMP,
            cRank
        )

        const maturityDays = calcMaturityDays(term, maturityTs)
        const daysReduction = 11389 * maturityDays
        const maxSubtrahend = Math.min(daysReduction, 5_000_000)
        const difference = 10_000_000 - maxSubtrahend
        const maxPctReduction = Math.max(difference, 5_000_000)
        const xenMulReduction = estReward.mul(BigNumber.from(maxPctReduction)).div(BigNumber.from(10_000_000))
        const minFee = BigNumber.from(1e15)
        const rewardWithReduction = xenMulReduction.div(BigNumber.from(1_000_000_000))
        const fee = minFee.gt(rewardWithReduction) ? minFee : rewardWithReduction

        return fee
    }

    async function getDBXENFTWithdrawableStake(tokenId: any) {
        const multicall = new Multicall({ ethersProvider: library, tryAggregate: true });

        const contractCallContext: ContractCallContext[] = [
            {
                reference: 'DBXENFTFactory',
                contractAddress: chain.dbxenftFactoryAddress,
                abi,
                calls: [
                    { reference: 'getCurrentCycleCall', methodName: 'getCurrentCycle', methodParameters: [] },
                    { reference: 'getDBXENFTFirstStake', methodName: 'dbxenftFirstStake', methodParameters: [tokenId] },
                    { reference: 'getDBXENFTSecondStake', methodName: 'dbxenftSecondStake', methodParameters: [tokenId] }
                ]
            }
        ];

        const response: ContractCallResults = await multicall.call(contractCallContext);
        const currentCycle = response.results.DBXENFTFactory.callsReturnContext[0].returnValues[0]
        const dbxenftFirstStake = response.results.DBXENFTFactory.callsReturnContext[1].returnValues[0]
        const dbxenftSecondStake = response.results.DBXENFTFactory.callsReturnContext[2].returnValues[0]

        const contractCallContext2: ContractCallContext[] = [
            {
                reference: 'DBXENFTFactory',
                contractAddress: chain.dbxenftFactoryAddress,
                abi,
                calls: [
                    { reference: 'getDBXENFTFirstStakeCycle', methodName: 'dbxenftStakeCycle', methodParameters: [tokenId, dbxenftFirstStake] },
                    { reference: 'getDBXENFTSecondStakeCycle', methodName: 'dbxenftStakeCycle', methodParameters: [tokenId, dbxenftSecondStake] },
                    { reference: 'getDBXENFTWithdrawableStake', methodName: 'dbxenftWithdrawableStake', methodParameters: [tokenId] }
                ]
            }
        ];

        const response2: ContractCallResults = await multicall.call(contractCallContext2);
        const dbxenftFirstStakeCycle = response2.results.DBXENFTFactory.callsReturnContext[0].returnValues[0]
        const dbxenfSecondStakeCycle = response2.results.DBXENFTFactory.callsReturnContext[1].returnValues[0]
        const dbxenftWithdrawableStake = response2.results.DBXENFTFactory.callsReturnContext[2].returnValues[0]

        let unlockedStake = 0

        if (dbxenftFirstStake != 0 && currentCycle > dbxenftFirstStake) {
            unlockedStake += dbxenftFirstStakeCycle

            if (dbxenftSecondStake != 0 && currentCycle > dbxenftSecondStake) {
                unlockedStake += dbxenfSecondStakeCycle
            }
        }

        return dbxenftWithdrawableStake + unlockedStake
    }

    async function getUnclaimedFees(tokenId: any) {
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
        let stakeCycle = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[12].returnValues[0])

        if (!currentCycle.eq(currentStartedCycle)) {
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
                    { reference: 'getCFPPSStakeCycle', methodName: 'cycleFeesPerPowerSummed', methodParameters: [stakeCycle.add(BigNumber.from("1"))] },
                    { reference: 'getCycleAccruedFees', methodName: 'cycleAccruedFees', methodParameters: [lastStartedCycle] },
                    { reference: 'getPendingDXN', methodName: 'pendingDXN', methodParameters: [tokenId] }
                ]
            }
        ];

        const response2: ContractCallResults = await multicall.call(contractCallContext2);

        const summedCyclePowers = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[0].returnValues[0])
        let CFPPSLastStartedCycle = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[1].returnValues[0])
        const CFPPSPreviousStartedCycle = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[2].returnValues[0])
        const CFPPSLastFeeUpdateCycle = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[3].returnValues[0])
        const CFPPSStakeCycle = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[4].returnValues[0])
        const cycleAccruedFees = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[5].returnValues[0])
        //const pendingDXN = BigNumber.from("100000000000000000000")
        const pendingDXN = response2.results.DBXENFTFactory.callsReturnContext[6].returnValues[0]



        if (currentCycle.gt(lastStartedCycle) && CFPPSLastStartedCycle.isZero()) {
            const feePerStake = (cycleAccruedFees.mul(BigNumber.from("10000000000000000000000000000000000000000")))
                .div(summedCyclePowers)

            CFPPSLastStartedCycle = CFPPSPreviousStartedCycle.add(feePerStake)
        }

        if (baseDBXENFTPower.isZero() && currentCycle.gt(entryCycle)) {
            baseDBXENFTPower = dbxenftEntryPower.mul(entryCycleReward).div(totalEntryCycleEntryPower)
            dbxenftPower = dbxenftPower.add(baseDBXENFTPower)
        }

        if (currentCycle.gt(lastStartedCycle) && (!lastFeeUpdateCycle.eq(lastStartedCycle.add(BigNumber.from("1"))))) {
            dbxenftAccruedFees = dbxenftAccruedFees.add(
                dbxenftPower.mul(CFPPSLastStartedCycle.sub(CFPPSLastFeeUpdateCycle))
                    .div(BigNumber.from("10000000000000000000000000000000000000000"))
            )

            if (!pendingDXN.isZero()) {
                stakeCycle = stakeCycle.sub(BigNumber.from("1"))
                const extraPower = baseDBXENFTPower.mul(pendingDXN).div(ethers.utils.parseEther("100"))

                if ((!lastStartedCycle.eq(stakeCycle)) && (!currentStartedCycle.eq(lastStartedCycle))) {
                    dbxenftAccruedFees = dbxenftAccruedFees.add(
                        extraPower.mul(CFPPSLastStartedCycle.sub(CFPPSStakeCycle.add(BigNumber.from("1"))))
                            .div(BigNumber.from("10000000000000000000000000000000000000000"))
                    )
                }
            }
        }
    }

    async function getNFTRewardInXen(
        maturityTs: number,
        VMUs: number,
        EAA: string,
        term: number,
        AMP: number,
        cRank: string
    ): Promise<number> {
        const XENContract = XENCrypto(library, chain.xenCryptoAddress)
        const globalRank = await XENContract.globalRank();
        const cRankDelta = Math.max((globalRank.sub(BigNumber.from(cRank))).toNumber(), 2);

        const factor = 10_000;
        const reward = Math.floor(
            AMP
            * (Math.floor(Math.max(Math.log2(cRankDelta), 1) * factor) / factor)
            * (Number.isFinite(term) ? term : term)
            * ((parseInt(EAA) + 1) / 1_000)
        )

        let pen = 0
        const currentTimestamp = getTimestampInSeconds()
        if (currentTimestamp > maturityTs) {
            pen = calcPenalty(getTimestampInSeconds() - maturityTs)
        }
        const rew = Math.floor((reward * (100 - pen)) / 100);
        return BigNumber.from(rew).mul(BigNumber.from(VMUs)).mul(BigNumber.from(1e18.toString()))
    }

    function calcPenalty(secsLate: number) {
        const daysLate = Math.floor(secsLate / 86400)
        if (daysLate > 6) {
            return 99
        }
        const penalty = ((BigNumber.from(1).shl(daysLate + 3)).div(BigNumber.from(7)).sub(BigNumber.from(1))).toNumber()
        if (penalty < 99) {
            return penalty
        }
        return 99
    }

    function getTimestampInSeconds() {
        return Math.floor(Date.now() / 1000)
    }

    const [displayXenftDetails, setDisplayXenftDetails] = useState(false);
    const [displayDbxenftDetails, setDisplayDbxenftDetails] = useState(false);
    const [xenftId, setXenftId] = useState();

    const handleExpandRow = (id: any) => {
        XENFTs.map((data: any) => {
            if (id == data.id) {
                setXenftId(data.id);
                setDisplayXenftDetails(!displayXenftDetails);
                setDisplayDbxenftDetails(false);
                setDBXNFT({
                    protocolFee: "0",
                    transactionFee: "0"
                })
            }
        })
    }

    const previewData = async (NFTData: any) => {
        let arr = await getIdsMintedPerCycle(1);
        if (arr != undefined) {
            for (let i = 0; i < arr.length; i++)
                await generateAfterReveal(arr[i], 234);
        }
        console.log(arr[0]);
        setDisplayDbxenftDetails(true);
        const signer = library.getSigner(0);
        const MintInfoContract = mintInfo(signer, chain.mintInfoAddress);
        const XENFTContract = XENFT(signer, chain.xenftAddress);
        let mintInforesult = await XENFTContract.mintInfo(NFTData.id)
        let mintInfoData = await MintInfoContract.decodeMintInfo(mintInforesult);
        let term = mintInfoData[0];
        let maturityTs = mintInfoData[1];
        let amp = mintInfoData[2];
        let eea = mintInfoData[3];

        let priceURL = chain.priceURL;
        let method: Method = 'POST';
        const options = {
            method: method,
            url: priceURL,
            port: 443,
            headers: {
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({
                "jsonrpc": "2.0", "method": "eth_gasPrice", "params": [], "id": 1
            })
        };
        let gasLimitVal;
        let price;
        let transactionFee;

        axios.request(options).then(async (result) => {
            console.log(result)
            if (result.data.result != undefined) {
                if (Number(chain.chainId) === 80001) {
                    gasLimitVal = (BigNumber.from("400000"));
                    price = Number(web3.utils.fromWei(result.data.result.toString(), "Gwei"));
                    transactionFee = gasLimitVal * price / 1000000000;
                    console.log("transactionFee " + transactionFee);
                    let protocolFee =
                        NFTData.claimStatus == "Redeemed" ?
                            "0.001" :
                            await calcMintFee(Number(maturityTs), Number(NFTData.VMUs), eea, Number(term), Number(amp), NFTData.cRank)
                    setDBXNFT({
                        protocolFee: protocolFee,
                        transactionFee: transactionFee.toString()
                    })
                }
            }
        })
    }

    const handleBurnXenft = async (NFTData: any) => {
        const signer = library.getSigner(0);
        const MintInfoContract = mintInfo(signer, chain.mintInfoAddress);
        const XENFTContract = XENFT(signer, chain.xenftAddress);
        let mintInforesult = await XENFTContract.mintInfo(NFTData.id)
        let mintInfoData = await MintInfoContract.decodeMintInfo(mintInforesult);
        let term = mintInfoData[0];
        let maturityTs = mintInfoData[1];
        let amp = mintInfoData[2];
        let eea = mintInfoData[3];


        isApprovedForAll()
            .then((result) => {
                console.log(NFTData.id)
                result ?
                    mintDBXENFT(NFTData.id, Number(maturityTs), Number(NFTData.VMUs), eea, Number(term), Number(amp), NFTData.cRank, NFTData.claimStatus) :
                    approveForAll().then((result) => console.log("XXX", result))
            })
    }

    return (
        <div className="content-box">
            <SnackbarNotification state={notificationState}
                setNotificationState={setNotificationState} />
            <div className="table-view table-responsive-xl">
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Token ID</th>
                            <th scope="col">Status</th>
                            <th scope="col">VMUs</th>
                            <th scope="col">Term (days)</th>
                            <th scope="col">Maturiy</th>
                            <th scope="col">EAA</th>
                            <th scope="col">cRank</th>
                            <th scope="col">AMP</th>
                            <th scope="col">xenBurned</th>
                            <th scope="col">Category</th>
                            <th scope="col">Class</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {XENFTs.map((data: any, i: any) =>
                            <>
                                <tr key={i}>
                                    <td>{data.id}</td>
                                    <td>{data.claimStatus}</td>
                                    <td>{data.VMUs}</td>
                                    <td>{data.term}</td>
                                    <td>{data.maturityDateTime}</td>
                                    <td>{data.EAA}</td>
                                    <td>{data.cRank}</td>
                                    <td>{data.AMP}</td>
                                    <td>{data.xenBurned}</td>
                                    <td>{data.category}</td>
                                    <td>{data.class}</td>
                                    <td>
                                        <button
                                            className="detail-btn"
                                            type="button"
                                            onClick={() => handleExpandRow(data.id)}
                                        >
                                            Details
                                        </button>
                                    </td>
                                </tr>
                                {displayXenftDetails && xenftId === data.id ?
                                    <tr className="xenft-details-row">
                                        <td colSpan={displayDbxenftDetails ? 6 : 12}>
                                            <div className="detailed-view row">
                                                <div className="col xenft-container">
                                                    <div className="xenft-details">
                                                        <div className="img-container">
                                                            <img src={data.image} alt="nft-image" />
                                                        </div>
                                                        <div className="details-container">
                                                            <div className="row">
                                                                <div className="col-4">
                                                                    <p className="label">
                                                                        Matures on
                                                                    </p>
                                                                    <p className="value">
                                                                        {data.maturityDateTime}
                                                                    </p>
                                                                </div>
                                                                <div className="col-4">
                                                                    <p className="label">
                                                                        cRank
                                                                    </p>
                                                                    <p className="value">
                                                                        {data.cRank}
                                                                    </p>
                                                                </div>
                                                                <div className="col-4">
                                                                    <p className="label">
                                                                        AMP
                                                                    </p>
                                                                    <p className="value">
                                                                        {data.AMP}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="row">
                                                                <div className="col-4">
                                                                    <p className="label">
                                                                        Category
                                                                    </p>
                                                                    <p className="value">
                                                                        {data.category}
                                                                    </p>
                                                                </div>
                                                                <div className="col-4">
                                                                    <p className="label">
                                                                        Class
                                                                    </p>
                                                                    <p className="value">
                                                                        {data.class}
                                                                    </p>
                                                                </div>
                                                                <div className="col-4">
                                                                    <p className="label">
                                                                        VMUs
                                                                    </p>
                                                                    <p className="value">
                                                                        {data.VMUs}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="row">
                                                                <div className="col-4">
                                                                    <p className="label">
                                                                        Contract
                                                                    </p>
                                                                    <p className="value">
                                                                        {formatAccountName(chain.xenftAddress)}
                                                                    </p>
                                                                </div>
                                                                <div className="col-4">
                                                                    <p className="label">
                                                                        EAA
                                                                    </p>
                                                                    <p className="value">
                                                                        {data.EAA}
                                                                    </p>
                                                                </div>
                                                                <div className="col-4">
                                                                    <p className="label">
                                                                        Chain
                                                                    </p>
                                                                    <p className="value">
                                                                        {chain.chainName}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="power">
                                                        <p className="label">DBXen power</p>
                                                        <p className="value">
                                                            299994830.049458 $DXN
                                                        </p>
                                                    </div>
                                                    <div className="burn-button-container">
                                                        <button className="btn burn-button"
                                                            onClick={() => previewData(data)}>
                                                            PREVIEW DATA
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        {displayDbxenftDetails ?
                                            <td colSpan={displayDbxenftDetails ? 6 : 12}>
                                                {DBXENFT != null ?
                                                    <div className="detailed-view row">
                                                        <div className="col xenft-container">
                                                            <div className="xenft-details">
                                                                <div className="img-container">
                                                                    <img src={nftImage} alt="nft-image" />
                                                                </div>
                                                                <div className="details-container">
                                                                    <div className="row">
                                                                        <div className="col-4">
                                                                            <p className="label">
                                                                                Protocol fee
                                                                            </p>
                                                                            <p className="value">
                                                                                {DBXENFT?.protocolFee.toString()}
                                                                            </p>
                                                                        </div>
                                                                        <div className="col-4">
                                                                            <p className="label">
                                                                                Transaction cost
                                                                            </p>
                                                                            <p className="value">
                                                                                {DBXENFT?.transactionFee.toString()}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                    <div className="row">
                                                                    </div>
                                                                    <div className="row">
                                                                        <div className="col-4">
                                                                            <p className="label">
                                                                                Contract
                                                                            </p>
                                                                            <p className="value">
                                                                                0x0a25…fa59
                                                                            </p>
                                                                        </div>
                                                                        <div className="col-4">
                                                                        </div>
                                                                        <div className="col-4">
                                                                            <p className="label">
                                                                                Chain
                                                                            </p>
                                                                            <p className="value">
                                                                                {chain.chainName}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="power">
                                                                <p className="label">DBXen power</p>
                                                                <p className="value">
                                                                    299994830.049458 $DXN
                                                                </p>
                                                            </div>
                                                            <div className="burn-button-container">
                                                                <button className="btn burn-button"
                                                                    onClick={() => handleBurnXenft(data)}>
                                                                    BURN XEN
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div> :
                                                    <div>
                                                        <p>Wait for date please</p>
                                                    </div>
                                                }
                                            </td> :
                                            <></>
                                        }
                                    </tr> :
                                    <></>
                                }
                            </>
                        )
                        }
                    </tbody>
                </table>
            </div>

            <div className="text-container-nft">
                <div className="upper-container">
                    <div className="card">
                        <img className="card-img-top" src={nftPlaceholder} alt="Card image cap" />
                        <div className="card-body">
                            <h5 className="card-title"> DBXeNFT litepaper </h5>
                            <p className="card-text">
                                Thank you for all the feedback. <br />
                                We now have the final version of the lite paper available here.
                            </p>
                            <a href="https://dbxenft-litepaper.gitbook.io/dbxenft/" target="_blank" className="btn">Read the document</a>
                        </div>
                    </div>
                </div>
                <LoadingButton className="burn-btn"
                    loadingPosition="end"
                    onClick={() => getUnclaimedFees(11)} >
                    {loading ? <Spinner color={'black'} /> : "Do stuff"}
                </LoadingButton>
                <div className="text-down">
                    <p>Fair crypto matters.</p>
                </div>
            </div>
        </div>
    );
}