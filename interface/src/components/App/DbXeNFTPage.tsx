import { useWeb3React } from "@web3-react/core";
import Moralis from "moralis/.";
import { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ChainContext from "../Contexts/ChainContext";
import DBXENFTFactory from "../../ethereum/dbxenftFactory.js";
import DXN from "../../ethereum/dbxenerc20";
import { BigNumber, ethers } from "ethers";
import { Button, Card, CardActions, CardContent, Grid, OutlinedInput, ToggleButton, ToggleButtonGroup } from "@mui/material";
import LoadingButton from "@mui/lab/LoadingButton";
import "../../componentsStyling/dbxenftPage.scss";
import nftPlaceholder from "../../photos/icons/nft-placeholder.png";
import coinBagLight from "../../photos/icons/coin-bag-solid--light.svg";
import walletLight from "../../photos/icons/wallet--light.svg";
import DBXenERC20 from "../../ethereum/dbxenerc20";
import {
    ContractCallContext,
    ContractCallResults,
    Multicall
} from "ethereum-multicall";

const { abi } = require("../../ethereum/DBXeNFTFactory.json");
interface DBXENFTEntry {
    id: number;
    description: string
    name: string;
    image: string;
}

export function DbXeNFTPage(): any {
    const context = useWeb3React();
    const { account, library } = context
    const { chain } = useContext(ChainContext);
    const [DBXENFTs, setDBXENFTs] = useState<DBXENFTEntry[]>([]);
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [claimLoading, setClaimLoading] = useState(false);
    const [notificationState, setNotificationState] = useState({});
    const [alignment, setAlignment] = useState("stake");
    const [approved, setApproved] = useState<Boolean | null>(false);
    const [amountToStake, setAmountToStake] = useState("");
    const [userUnstakedAmount, setUserUnstakedAmount] = useState("");
    const [userStakedAmount, setUserStakedAmount] = useState("");
    const [amountToUnstake, setAmountToUnstake] = useState("")
    const [tokensForUnstake, setTokenForUnstake] = useState("");
    const [backButton, setBack] = useState<Boolean | null>(false);
    const [unclaimedFees, setUnclaimedFees] = useState("0.0");
    const [baseDBXENFTPower, setBaseDBXENFTPower] = useState("")
    const [dbxenftPower, setDBXENFTPower] = useState("")

    useEffect(() => {
        startMoralis();
        getDBXeNFTs();
        getUpdatedDBXENFTData(id);
    }, [chain])

    useEffect(() => {
        console.log(approved)
        setStakeAmount();
        getDBXENFTTotalAndWithdrawableStake(id)
        setUnstakedAmount();
    }, [amountToStake, amountToUnstake]);

    useEffect(() => {
        setUnstakedAmount()
    }, [userUnstakedAmount]);

    useEffect(() => {
        getUnclaimedFees(id)
    }, [unclaimedFees])

    const startMoralis = () => {
        Moralis.start({ apiKey: process.env.REACT_APP_MORALIS_KEY_NFT })
            .catch(() => console.log("moralis error"))
    }

    const getDBXeNFTs = () => {
        Moralis.EvmApi.nft.getWalletNFTs({
            chain: chain.chainId,
            format: "decimal",
            normalizeMetadata: true,
            tokenAddresses: [chain.dbxenftAddress],
            address: account ? account : ""
        }).then((result) => {
            const response = result.raw;
            const resultArray: any = response.result;
            let dbxenftEntries: DBXENFTEntry[] = [];

            for (let i = 0; i < resultArray?.length; i++) {
                let result = resultArray[i];
                const resultAttributes: any[] = result.normalized_metadata;
                if (result.token_id == id) {
                    dbxenftEntries.push({
                        id: result.token_id,
                        name: result.normalized_metadata.name,
                        description: result.normalized_metadata.description,
                        image: result.normalized_metadata.image
                    });
                }
                setDBXENFTs(dbxenftEntries);
            }

        })
    }

    async function approveDXN() {
        setLoading(true);
        const signer = library.getSigner(0)
        const xenftContract = DXN(signer, chain.deb0xERC20Address);

        try {
            console.log("try")
            const tx = await xenftContract.approve(chain.dbxenftFactoryAddress, ethers.constants.MaxUint256)
            console.log(tx)
            tx.wait()
                .then((result: any) => {
                    setNotificationState({
                        message: "Your succesfully approved contract for accepting DXN.", open: true,
                        severity: "success"
                    })
                    setApproved(true)
                    setLoading(false)
                })
                .catch((error: any) => {
                    console.log(error)
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

    const stake = (tokenId: any) => {
        setLoading(true)
        const signer = library.getSigner(0)
        const dbxenftFactory = DBXENFTFactory(signer, chain.dbxenftFactoryAddress);

        const overrides = {
            value: ethers.utils.parseEther((Number(amountToStake) * 0.001).toString())
        }

        dbxenftFactory.stake(ethers.utils.parseEther(amountToStake).toString(), tokenId, overrides).then((tx: any) => {
            tx.wait()
                .then((result: any) => {
                    console.log(result)
                    setNotificationState({
                        message: "You succesfully staked on your DBXENFT.", open: true,
                        severity: "success"
                    })
                    setLoading(false)
                    setAmountToStake("")
                })
                .catch((error: any) => {
                    setNotificationState({
                        message: "Staking for your DBXENFT was unsuccesful!", open: true,
                        severity: "error"
                    })
                    setLoading(false)
                })
        }).catch((error: any) => {
            setNotificationState({
                message: "You rejected the transaction. Contract hasn't been approved for burn.", open: true,
                severity: "info"
            })
            setLoading(false)
        })
    }

    async function unstake(tokenId: any, amount: any) {
        setLoading(true)
        const signer = library.getSigner(0)
        const dbxenftFactory = DBXENFTFactory(signer, chain.dbxenftFactoryAddress)

        try {

            const tx = await dbxenftFactory.unstake(tokenId, ethers.utils.parseEther(amount).toString())
            await tx.wait()
                .then((result: any) => {
                    console.log(result)
                    setNotificationState({
                        message: "You succesfully unstaked your DXN.", open: true,
                        severity: "success"
                    })
                    setLoading(false)
                    setAmountToUnstake("")
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

    const setStakeAmount = () => {
        const signer = library.getSigner(0)
        const xenftContract = DXN(signer, chain.deb0xERC20Address);

        xenftContract.allowance(account, chain.dbxenftFactoryAddress)
            .then((allowance: any) => {
                let allowanceValue = ethers.utils.formatEther(allowance.toString());
                console.log(allowanceValue);

                allowance > 0 ? setApproved(true) : setApproved(false);

                if (Number(amountToStake) > 0.0) {
                    if (Number(allowanceValue) < Number(amountToStake)) {
                        setApproved(false)
                        setBack(true);
                    } else {
                        setBack(false);
                        setApproved(true)
                    }
                }
            }
            )
    }

    async function setUnstakedAmount() {
        const deb0xERC20Contract = DBXenERC20(library, chain.deb0xERC20Address)
        deb0xERC20Contract.balanceOf(account).then((balance: any) => {
            let number = ethers.utils.formatEther(balance);
            setUserUnstakedAmount(parseFloat(number.slice(0, (number.indexOf(".")) + 3)).toString())
        })
    }

    // async function setTokensForUnstakedAmount() {
    //     const deb0xERC20Contract = DBXenERC20(library, chain.deb0xERC20Address)
    //     deb0xERC20Contract.dbxenftWithdrawableStake(account).then((balance: any) => {
    //         setTokenForUnstake(ethers.utils.formatEther(balance.toString()));
    //     })
    // }

    // useEffect(() => {
    //     setTokensForUnstakedAmount()
    // }, []);

    function claimFees(tokenId: any) {
        setClaimLoading(true)
        const signer = library.getSigner(0)
        const dbxenftFactory = DBXENFTFactory(signer, chain.dbxenftFactoryAddress)

        dbxenftFactory.claimFees(tokenId).then((tx: any) => {
            tx.wait()
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
        }).catch((error: any) => {
            setNotificationState({
                message: "You rejected the transaction. Your fees haven't been claimed.", open: true,
                severity: "info"
            })
            setClaimLoading(false)
        })
    }

    const backToApprove = () => {
        setBack(false);
        setApproved(true);
        setAmountToStake("");
    }

    const handleChange = (
        event: React.MouseEvent<HTMLElement>,
        newAlignment: string
    ) => {
        newAlignment === alignment || newAlignment === null ?
            setAlignment(alignment) :
            alignment === "stake" ?
                setAlignment("unstake") :
                setAlignment("stake")
    };

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

            if (!pendingDXN.isZero) {
                stakeCycle = stakeCycle.sub(BigNumber.from("1"))
                const extraPower = baseDBXENFTPower.mul(pendingDXN).div(ethers.utils.parseEther("100"))

                if ((!lastStartedCycle.eq(stakeCycle)) && (!currentStartedCycle.eq(lastStartedCycle))) {
                    dbxenftAccruedFees = dbxenftAccruedFees.add(
                        extraPower.mul(CFPPSLastStartedCycle.sub(CFPPSStakeCycle.add(BigNumber.from("1"))))
                            .div(BigNumber.from("10000000000000000000000000000000000000000"))
                    )
                }

                return dbxenftAccruedFees;
            }
        }

        setUnclaimedFees(ethers.utils.formatUnits(dbxenftAccruedFees))
    }

    async function getDBXENFTTotalAndWithdrawableStake(tokenId: any) {
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
        const currentCycle = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[0].returnValues[0])
        const dbxenftFirstStake = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[1].returnValues[0])
        const dbxenftSecondStake = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[2].returnValues[0])
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
        const dbxenftFirstStakeCycle = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[0].returnValues[0])
        const dbxenfSecondStakeCycle = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[1].returnValues[0])
        const dbxenftWithdrawableStake = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[2].returnValues[0])

        let unlockedStake = BigNumber.from(0)
        let totalStaked = dbxenftFirstStakeCycle.add(dbxenfSecondStakeCycle).add(dbxenftWithdrawableStake)
        if (!dbxenftFirstStake.isZero() && currentCycle.gt(dbxenftFirstStake)) {
            unlockedStake = unlockedStake.add(dbxenftFirstStakeCycle)

            if (!dbxenftSecondStake.isZero() && currentCycle.gt(dbxenftSecondStake)) {
                unlockedStake = unlockedStake.add(dbxenfSecondStakeCycle)
            }
        }

        let totalUnstakedAmount = BigNumber.from(dbxenftWithdrawableStake).add(unlockedStake)

        console.log(ethers.utils.formatEther(totalUnstakedAmount))

        setTokenForUnstake(ethers.utils.formatEther(totalUnstakedAmount))
        setUserStakedAmount(ethers.utils.formatEther(totalStaked))
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
        const dbxenftSecondStake = BigNumber.from(response.results.DBXENFTFactory.callsReturnContext[13].returnValues[0])

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
        const pendingDXN = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[6].returnValues[0])
        const dbxenftFirstStakeCycle = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[7].returnValues[0])
        const dbxenfSecondStakeCycle = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[8].returnValues[0])
        let dbxenftWithdrawableStake = BigNumber.from(response2.results.DBXENFTFactory.callsReturnContext[9].returnValues[0])
    
        

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
        let totalStaked = dbxenftFirstStakeCycle.add(dbxenfSecondStakeCycle).add(dbxenftWithdrawableStake)

        if(!dbxenftFirstStake.isZero() && currentCycle.gt(dbxenftFirstStake)) {
            unlockedStake = unlockedStake.add(dbxenftFirstStakeCycle)

            if(!dbxenftSecondStake.isZero() && currentCycle.gt(dbxenftSecondStake)) {
                unlockedStake = unlockedStake.add(dbxenfSecondStakeCycle)
            }
        }

        console.log(ethers.utils.formatEther(baseDBXENFTPower), ethers.utils.formatEther(dbxenftPower))

        dbxenftWithdrawableStake = dbxenftWithdrawableStake.add(unlockedStake)
        setTokenForUnstake(ethers.utils.formatEther(dbxenftWithdrawableStake))
        setUserStakedAmount(ethers.utils.formatEther(totalStaked))
        setBaseDBXENFTPower(ethers.utils.formatEther(baseDBXENFTPower))
        setDBXENFTPower(ethers.utils.formatEther(dbxenftPower))
    }

    return (
        <div className="content-box dbxenft-page">
            <div className="row card-container">
                <Card className="col-12 col-md-6 stake-card card">
                    <ToggleButtonGroup
                        className="button-group"
                        value={alignment}
                        exclusive
                        onChange={handleChange}
                    >
                        <ToggleButton className="tab-button" value="stake">Stake</ToggleButton>
                        <ToggleButton className="tab-button" value="unstake">Unstake</ToggleButton>
                    </ToggleButtonGroup>
                    {DBXENFTs.map((xenft, i) => (
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
                                                <span className="label">tokenID</span>
                                                <span className="value">{xenft.id}</span>
                                            </div>
                                            <div className="card-row">
                                                <span className="label">name</span>
                                                <span className="value">{xenft.name}</span>
                                            </div>
                                            <div className="card-row">
                                                <span className="label">description</span>
                                                <span className="value">{xenft.description}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                            <CardActions>
                                {alignment === "stake" ?
                                    <div>
                                        {approved &&
                                            <Grid className="amount-row" container>
                                                <Grid item>
                                                    <OutlinedInput id="outlined-basic"
                                                        placeholder="amount to stake"
                                                        type="number"
                                                        value={amountToStake}
                                                        inputProps={{ min: 0 }}
                                                        onChange={e => setAmountToStake(e.target.value)} />
                                                </Grid>
                                                <Grid className="max-btn-container" item>
                                                    <Button className="max-btn"
                                                        size="small" variant="contained" color="error"
                                                        onClick={() => setAmountToStake(userUnstakedAmount)}>
                                                        MAX
                                                    </Button>
                                                </Grid>
                                            </Grid>
                                        }
                                        {approved ?
                                            <LoadingButton
                                                className="stake-btn"
                                                loading={loading}
                                                variant="contained"
                                                type="button"
                                                onClick={() => stake(xenft.id)}>
                                                Stake
                                            </LoadingButton> :
                                            <LoadingButton
                                                className="approve-btn"
                                                loading={loading}
                                                variant="contained"
                                                type="button"
                                                onClick={() => approveDXN()}>
                                                Approve
                                            </LoadingButton>
                                        }
                                        {backButton &&
                                            <div className="back-to-approve">
                                                <LoadingButton
                                                    className="collect-btn"
                                                    loading={loading}
                                                    variant="contained"
                                                    onClick={backToApprove}>
                                                    Back
                                                </LoadingButton>
                                                <span className="text">
                                                    Your input value is greater than your current approved value!
                                                    Back to input or approve!
                                                </span>
                                            </div>
                                        }
                                    </div> :
                                    <div>
                                        <Grid className="amount-row" container>
                                            <Grid item>
                                                <OutlinedInput value={amountToUnstake}
                                                    id="outlined-basic"
                                                    className="max-field"
                                                    placeholder="amount to unstake"
                                                    onChange={e => setAmountToUnstake(e.target.value)}
                                                    inputProps={{ min: 0 }}
                                                    type="number" />
                                            </Grid>
                                            <Grid className="max-btn-container" item>
                                                <Button className="max-btn"
                                                    size="small" variant="contained" color="error"
                                                    onClick={() => setAmountToUnstake(tokensForUnstake)}>
                                                    MAX
                                                </Button>
                                            </Grid>
                                        </Grid>
                                        <LoadingButton
                                            className="unstake-btn"
                                            loading={loading}
                                            variant="contained"
                                            type="button"
                                            onClick={() => unstake(xenft.id, amountToUnstake)}>
                                            Unstake
                                        </LoadingButton>
                                    </div>
                                }
                            </CardActions>
                        </>
                    ))}
                </Card>
                <Card className="col-12 col-md-6 reward-card card">
                    <CardContent>
                        <div className="tokens-in-wallet">
                            <img className="display-element" src={walletLight} alt="wallet" />
                            <p className="">
                                Your tokens in wallet:
                            </p>
                            <p className="" >
                                <strong>
                                    {Number(userUnstakedAmount).toLocaleString('en-US', {
                                        minimumFractionDigits: 10,
                                        maximumFractionDigits: 10
                                    })} DXN
                                </strong>
                            </p>
                        </div>
                        <div className="tokens-in-wallet">
                            <img className="display-element" src={walletLight} alt="wallet" />
                            <p className="">
                                Your staked amount:
                            </p>
                            <p className="" >
                                <strong>
                                    {Number(userStakedAmount).toLocaleString('en-US', {
                                        minimumFractionDigits: 10,
                                        maximumFractionDigits: 10
                                    })} DXN
                                </strong>
                            </p>
                        </div>
                        <div className="tokens-in-wallet">
                            <img className="display-element" src={walletLight} alt="wallet" />
                            <p className="">
                                Available to unstake:
                            </p>
                            <p className="" >
                                <strong>
                                    {Number(tokensForUnstake).toLocaleString('en-US', {
                                        minimumFractionDigits: 10,
                                        maximumFractionDigits: 10
                                    })} DXN
                                </strong>
                            </p>
                        </div>
                        <div className="fees">
                            <img className="display-element" src={coinBagLight} alt="coinbag" />
                            <p className="">
                                Your unclaimed fees:
                            </p>
                            <p className="" >
                                {unclaimedFees}
                            </p>
                            <LoadingButton
                                className="collect-btn"
                                disabled={unclaimedFees == "0.0"}
                                loading={claimLoading}
                                variant="contained"
                                onClick={() => claimFees(id)}>
                                Claim
                            </LoadingButton>
                        </div>
                    </CardContent>
                    <CardActions>

                    </CardActions>
                </Card>
            </div>
        </div>
    );
}