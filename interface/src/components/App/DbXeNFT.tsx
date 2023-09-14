import "../../componentsStyling/dbxenft.scss";
import nftPlaceholder from "../../photos/icons/nft-placeholder.png";
import { useState, useEffect, useContext } from 'react';
import { useWeb3React } from '@web3-react/core';
import ChainContext from '../Contexts/ChainContext';
import DBXENFTFactory from "../../ethereum/dbxenftFactory";
import XENFT from "../../ethereum/xenTorrent";
import XENCrypto from "../../ethereum/XENCrypto";
import DXN from "../../ethereum/dbxenerc20"
import LoadingButton from '@mui/lab/LoadingButton';
import { Spinner } from './Spinner';
import SnackbarNotification from './Snackbar';
import { ethers } from "ethers";
import {
    Multicall,
    ContractCallResults,
    ContractCallContext,
  } from 'ethereum-multicall';
const { abi } = require("../../ethereum/DBXeNFTFactory.json");
const { BigNumber } = require("ethers");

export function DbXeNFT(): any {
    const context = useWeb3React()
    const { library, account } = context
    const { chain }  = useContext(ChainContext)
    const [notificationState, setNotificationState] = useState({});
    const [loading, setLoading] = useState(false)

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

        try{
            const tx = await xenftContract.setApprovalForAll(chain.dbxenftFactoryAddress, true)
            tx.wait()
                .then((result: any) => {
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
            cRank: string) 
    {
        setLoading(true)
        const signer = await library.getSigner(0)
        const dbxenftFactory = DBXENFTFactory(signer, chain.dbxenftFactoryAddress)

        try {
            const fee = await calcMintFee(
                maturityTs,
                VMUs,
                EAA,
                term,
                AMP,
                cRank
            )

            const overrides = {
                value: fee
            }
            console.log(ethers.utils.formatEther(fee))

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

    async function approveDXN() {
        setLoading(true);
        const signer = library.getSigner(0)
        const xenftContract = DXN(signer, chain.deb0xERC20Address);

        try{
            const tx = await xenftContract.approve(chain.dbxenftFactoryAddress, ethers.constants.MaxUint256)
            tx.wait()
                .then((result: any) => {
                    setNotificationState({
                        message: "Your succesfully approved contract for accepting DXN.", open: true,
                        severity: "success"
                    })
                    setLoading(false)
                })
                .catch((error: any) => {
                    setNotificationState({
                        message: "Contract couldn't be approved for accepting your DXN!", open: true,
                        severity: "error"
                    })
                    setLoading(false)
                })
        } catch (error) {
            setNotificationState({
                message: "You rejected the transaction. Contract hasn't been approved for accepting DXN.", open: true,
                severity: "info"
            })
            setLoading(false)
        }      
    }

    async function stake(tokenId: any, amount: any) {
        setLoading(true)
        const signer = await library.getSigner(0)
        const dbxenftFactory = DBXENFTFactory(signer, chain.dbxenftFactoryAddress)

        try {

            const overrides = {
                value: amount.div(1000)
            }

            const tx = await dbxenftFactory.stake(amount, tokenId, overrides)
            await tx.wait()
            .then((result: any) => {
                setNotificationState({
                    message: "You succesfully staked on your DBXENFT.", open: true,
                    severity: "success"
                })
                setLoading(false)
            })
            .catch((error: any) => {
                setNotificationState({
                    message: "Staking for your DBXENFT was unsuccesful!", open: true,
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

    async function unstake(tokenId: any, amount: any) {
        setLoading(true)
        const signer = await library.getSigner(0)
        const dbxenftFactory = DBXENFTFactory(signer, chain.dbxenftFactoryAddress)

        try {

            const tx = await dbxenftFactory.unstake(tokenId, amount)
            await tx.wait()
            .then((result: any) => {
                setNotificationState({
                    message: "You succesfully unstaked your DXN.", open: true,
                    severity: "success"
                })
                setLoading(false)
            })
            .catch((error: any) => {
                setNotificationState({
                    message: "Unstaking your DXN was unsuccesful!", open: true,
                    severity: "error"
                })
                setLoading(false)
            })
        } catch (error) {
            setNotificationState({
                message: "You rejected the transaction. Your DXN haven't been unstaked.", open: true,
                severity: "info"
            })
            setLoading(false)
        } 
    }

    async function claimFees(tokenId: any) {
        setLoading(true)
        const signer = await library.getSigner(0)
        const dbxenftFactory = DBXENFTFactory(signer, chain.dbxenftFactoryAddress)

        try {

            const tx = await dbxenftFactory.claimFees(tokenId)
            await tx.wait()
            .then((result: any) => {
                setNotificationState({
                    message: "You succesfully claimed your fees.", open: true,
                    severity: "success"
                })
                setLoading(false)
            })
            .catch((error: any) => {
                setNotificationState({
                    message: "Claiming your fees was unsuccesful!", open: true,
                    severity: "error"
                })
                setLoading(false)
            })
        } catch (error) { 
            setNotificationState({
                message: "You rejected the transaction. Your fees haven't been claimed.", open: true,
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
        
        if(currentTimestamp < maturityTs) {
            daysTillClaim = Math.floor((maturityTs - currentTimestamp) / SECONDS_IN_DAYS)
            daysSinceMinted = term - daysTillClaim
        } else {
            daysSinceMinted = Math.floor((term * SECONDS_IN_DAYS + (currentTimestamp - maturityTs))
                / SECONDS_IN_DAYS)
        }

        if(daysSinceMinted > daysTillClaim) {
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
        console.log(fee)

        return fee
    }

    async function getDBXENFTPower(tokenId: any) {
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
                    { reference: 'getLastStartedCycle', methodName: 'lastStartedCycle', methodParameters: [] },
                    { reference: 'getDBXENFTEntryPower', methodName: 'dbxenftEntryPower', methodParameters: [tokenId] },
                    { reference: 'getEntryCycleReward', methodName: 'rewardPerCycle', methodParameters: [entryCycle] },
                    { reference: 'getTotalEntryCycleEntryPower', methodName: 'totalEntryPowerPerCycle', methodParameters: [entryCycle] },
                    { reference: 'getBaseDBXENFTPower', methodName: 'baseDBXeNFTPower', methodParameters: [tokenId] },
                    { reference: 'getDBXENFTPower', methodName: 'dbxenftPower', methodParameters: [tokenId] },
                    { reference: 'getLastFeeUpdateCycle', methodName: 'lastFeeUpdateCycle', methodParameters: [tokenId] },
                    { reference: 'getPendingDXN', methodName: 'pendingDXN', methodParameters: [tokenId] }
                ]
            }
        ];

        const response: ContractCallResults = await multicall.call(contractCallContext);
        const currentCycle = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[0].returnValues[0])
        let lastStartedCycle = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[1].returnValues[0])
        const dbxenftEntryPower = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[2].returnValues[0])
        const entryCycleReward = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[3].returnValues[0])
        const totalEntryCycleEntryPower = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[4].returnValues[0])
        let baseDBXENFTPower = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[5].returnValues[0])
        let dbxenftPower = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[6].returnValues[0])
        const lastFeeUpdateCycle = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[7].returnValues[0])
        const pendingDXN = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[8].returnValues[0])

        if(baseDBXENFTPower.isZero() && currentCycle.gt(entryCycle)) {
            baseDBXENFTPower = dbxenftEntryPower.mul(entryCycleReward).div(totalEntryCycleEntryPower)
            dbxenftPower = dbxenftPower.add(baseDBXENFTPower)
        }

        if(currentCycle.gt(lastStartedCycle) && (!lastFeeUpdateCycle.eq(lastStartedCycle.add(BigNumber.from("1"))))
            && !pendingDXN.isZero()) {

            const extraPower = baseDBXENFTPower.mul(pendingDXN).div(ethers.utils.parseEther("100"))

            dbxenftPower = dbxenftPower.add(extraPower)
        }

        return dbxenftPower
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

        if(dbxenftFirstStake != 0 && currentCycle > dbxenftFirstStake) {
            unlockedStake += dbxenftFirstStakeCycle

            if(dbxenftSecondStake != 0 && currentCycle > dbxenftSecondStake) {
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
    
        

        if(currentCycle.gt(lastStartedCycle) && CFPPSLastStartedCycle.isZero()) {
            const feePerStake = (cycleAccruedFees.mul(BigNumber.from("10000000000000000000000000000000000000000")))
            .div(summedCyclePowers)

            CFPPSLastStartedCycle = CFPPSPreviousStartedCycle.add(feePerStake)
        }

        if(baseDBXENFTPower.isZero() && currentCycle.gt(entryCycle)) {
            baseDBXENFTPower = dbxenftEntryPower.mul(entryCycleReward).div(totalEntryCycleEntryPower)
            dbxenftPower = dbxenftPower.add(baseDBXENFTPower)
        }

        if(currentCycle.gt(lastStartedCycle) && (!lastFeeUpdateCycle.eq(lastStartedCycle.add(BigNumber.from("1"))))) {
            dbxenftAccruedFees = dbxenftAccruedFees.add(
                dbxenftPower.mul(CFPPSLastStartedCycle.sub(CFPPSLastFeeUpdateCycle))
                .div(BigNumber.from("10000000000000000000000000000000000000000"))
            )

            if(!pendingDXN.isZero()) {
                stakeCycle = stakeCycle.sub(BigNumber.from("1"))
                const extraPower = baseDBXENFTPower.mul(pendingDXN).div(ethers.utils.parseEther("100"))

                if((!lastStartedCycle.eq(stakeCycle)) && (!currentStartedCycle.eq(lastStartedCycle))) {
                    dbxenftAccruedFees = dbxenftAccruedFees.add(
                        extraPower.mul(CFPPSLastStartedCycle.sub(CFPPSStakeCycle.add(BigNumber.from("1"))))
                        .div(BigNumber.from("10000000000000000000000000000000000000000"))
                    )
                }
            }
        }
        console.log(dbxenftAccruedFees)
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
                    { reference: 'getDBXENFTSecondStake', methodName: 'dbxenftSecondStake', methodParameters: [tokenId] }
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
        const dbxenftSecondStake = response.results.DBXENFTFactory.callsReturnContext[13].returnValues[0]

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
                    { reference: 'getCFPPSStakeCycle', methodName: 'cycleFeesPerPowerSummed', methodParameters: [dbxenftFirstStake.add(BigNumber.from("1"))] },
                    { reference: 'getCycleAccruedFees', methodName: 'cycleAccruedFees', methodParameters: [lastStartedCycle] },
                    { reference: 'getPendingDXN', methodName: 'pendingDXN', methodParameters: [tokenId] },
                    { reference: 'getDBXENFTFirstStakeCycle', methodName: 'dbxenftStakeCycle', methodParameters: [tokenId, dbxenftFirstStake] },
                    { reference: 'getDBXENFTSecondStakeCycle', methodName: 'dbxenftStakeCycle', methodParameters: [tokenId, dbxenftSecondStake] },
                    { reference: 'getDBXENFTWithdrawableStake', methodName: 'dbxenftWithdrawableStake', methodParameters: [tokenId] }
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
        const dbxenftFirstStakeCycle = response2.results.DBXENFTFactory.callsReturnContext[7].returnValues[0]
        const dbxenfSecondStakeCycle = response2.results.DBXENFTFactory.callsReturnContext[8].returnValues[0]
        let dbxenftWithdrawableStake = response2.results.DBXENFTFactory.callsReturnContext[9].returnValues[0]
    
        

        if(currentCycle.gt(lastStartedCycle) && CFPPSLastStartedCycle.isZero()) {
            const feePerStake = (cycleAccruedFees.mul(BigNumber.from("10000000000000000000000000000000000000000")))
            .div(summedCyclePowers)

            CFPPSLastStartedCycle = CFPPSPreviousStartedCycle.add(feePerStake)
        }

        if(baseDBXENFTPower.isZero() && currentCycle.gt(entryCycle)) {
            baseDBXENFTPower = dbxenftEntryPower.mul(entryCycleReward).div(totalEntryCycleEntryPower)
            dbxenftPower = dbxenftPower.add(baseDBXENFTPower)
        }

        if(currentCycle.gt(lastStartedCycle) && (!lastFeeUpdateCycle.eq(lastStartedCycle.add(BigNumber.from("1"))))) {
            dbxenftAccruedFees = dbxenftAccruedFees.add(
                dbxenftPower.mul(CFPPSLastStartedCycle.sub(CFPPSLastFeeUpdateCycle))
                .div(BigNumber.from("10000000000000000000000000000000000000000"))
            )

            if(!pendingDXN.isZero()) {
                let stakeCycle = dbxenftFirstStake.sub(BigNumber.from("1"))
                const extraPower = baseDBXENFTPower.mul(pendingDXN).div(ethers.utils.parseEther("100"))

                if((!lastStartedCycle.eq(stakeCycle)) && (!currentStartedCycle.eq(lastStartedCycle))) {
                    dbxenftAccruedFees = dbxenftAccruedFees.add(
                        extraPower.mul(CFPPSLastStartedCycle.sub(CFPPSStakeCycle.add(BigNumber.from("1"))))
                        .div(BigNumber.from("10000000000000000000000000000000000000000"))
                    )
                }
            }
        }
        let unlockedStake = BigNumber.from(0)

        if(!dbxenftFirstStake.isZero() && currentCycle.gt(dbxenftFirstStake)) {
            unlockedStake = unlockedStake.add(dbxenftFirstStakeCycle)

            if(!dbxenftSecondStake.isZero() && currentCycle.gt(dbxenftSecondStake)) {
                unlockedStake = unlockedStake.add(dbxenfSecondStakeCycle)
            }
        }

        dbxenftWithdrawableStake = dbxenftWithdrawableStake.add(unlockedStake)

        return {
            dbxenftWithdrawableStake,
            dbxenftAccruedFees,
            baseDBXENFTPower,
            dbxenftPower
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
        if(currentTimestamp > maturityTs) {
            pen = calcPenalty(getTimestampInSeconds() - maturityTs)
        }
        const rew = Math.floor((reward * (100 - pen)) / 100);
        return BigNumber.from(rew).mul(BigNumber.from(VMUs)).mul(BigNumber.from(1e18.toString()))
    }

    function calcPenalty(secsLate: number) {
        const daysLate = Math.floor(secsLate / 86400)
        if(daysLate > 6) {
            return 99
        }
        console.log(daysLate + 3)
        const penalty = ((BigNumber.from(1).shl(daysLate + 3)).div(BigNumber.from(7)).sub(BigNumber.from(1))).toNumber()
        if(penalty < 99) {
            return penalty
        }
        return 99
    }

    function getTimestampInSeconds () {
        return Math.floor(Date.now() / 1000)
    }

    return (
        <>
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
                    <tr key="key">
                        <td>id</td>
                        <td>status</td>
                        <td>VMUs</td>
                        <td>term</td>
                        <td>maturity</td>
                        <td>EAA</td>
                        <td>cRank</td>
                        <td>AMP</td>
                        <td>xenBurned</td>
                        <td>category</td>
                        <td>class</td>
                        <td>
                            <button
                                className="detail-btn"
                                type="button"
                            >
                                Details
                            </button>
                        </td>
                    </tr>
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
                                Thank you for all the feedback. <br/> 
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
        </>
    );
}