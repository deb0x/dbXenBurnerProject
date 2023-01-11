import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import {
    Card, CardActions, CardContent, Button, Grid,
    Typography, Box, OutlinedInput
} from '@mui/material';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import LoadingButton from '@mui/lab/LoadingButton';
import Deb0x from "../../ethereum/deb0x"
import Deb0xViews from "../../ethereum/deb0xViews";
import Deb0xERC20 from "../../ethereum/deb0xerc20"
import SnackbarNotification from './Snackbar';
import { BigNumber, ethers } from "ethers";
import "../../componentsStyling/stake.scss";
import token from "../../photos/icons/token.svg"
import coinBagLight from "../../photos/icons/coin-bag-solid--light.svg";
import coinBagDark from "../../photos/icons/coin-bag-solid--dark.svg";
import walletLight from "../../photos/icons/wallet--light.svg";
import walletDark from "../../photos/icons/wallet--dark.svg";
import trophyRewards from "../../photos/icons/trophyRewards.svg";
import { signMetaTxRequest } from '../../ethereum/signer';
import { createInstance } from '../../ethereum/forwarder'
import dataFromWhitelist from '../../constants.json';
import useAnalyticsEventTracker from '../Common/GaEventTracker';

const { whitelist } = dataFromWhitelist;
const deb0xAddress = "0xA06735da049041eb523Ccf0b8c3fB9D36216c646";
const deb0xViewsAddress = "0x51CcBf6DA6c14b6A31Bc0FcA07056151fA003aBC";
const deb0xERC20Address = "0x22c3f74d4AA7c7e11A7637d589026aa85c7AF88a";

export function Stake(props: any): any {

    const { account, library } = useWeb3React()
    const [notificationState, setNotificationState] = useState({})
    const gaEventTracker = useAnalyticsEventTracker('Stake');

    function FeesPanel() {
        const [feesUnclaimed, setFeesUnclaimed] = useState("")
        const [loading, setLoading] = useState(false)

        useEffect(() => {
            feesAccrued()
        }, [feesUnclaimed]);

        async function feesAccrued() {
            const deb0xViewsContract = await Deb0xViews(library, deb0xViewsAddress);
            
            const unclaimedRewards = await deb0xViewsContract.getUnclaimedFees(account);

            setFeesUnclaimed(ethers.utils.formatEther(unclaimedRewards))
        }

        async function fetchClaimFeesResult(request: any, url: any) {
            await fetch(url, {
                method: 'POST',
                body: JSON.stringify(request),
                headers: { 'Content-Type': 'application/json' },
            })
                .then((response) => response.json())
                .then(async (data) => {
                    try{
                        const {tx: txReceipt} = JSON.parse(data.result)
                        if(txReceipt.status == 1){
                            setNotificationState({
                                message: "You succesfully claimed your fees.", open: true,
                                severity: "success"
                            })
                        } else {
                            setNotificationState({
                                message: "Fees couldn't be claimed!", open: true,
                                severity: "error"
                            })
                            setLoading(false)
                        }
                    } catch(error) {
                        if(data.status == "pending") {
                            setNotificationState({
                                message: "Your transaction is pending. Your fees should arrive shortly",
                                open: true,
                                severity: "info"
                            })
                        } else if(data.status == "error") {
                            setNotificationState({
                                message: "Transaction relayer error. Please try again",
                                open: true,
                                severity: "error"
                            })
                        }
                    }
                    
                })
        }

        async function sendClaimFeesTx(deb0xContract: any) {
            try {
                const tx = await deb0xContract.claimFees()

                tx.wait()
                    .then((result: any) => {
                        setNotificationState({
                            message: "You succesfully claimed your fees.", open: true,
                            severity: "success"
                        })
                        //setLoading(false)

                    })
                    .catch((error: any) => {
                        setNotificationState({
                            message: "Fees couldn't be claimed!", open: true,
                            severity: "error"
                        })
                        setLoading(false)
                    })
            } catch (error: any) {
                setNotificationState({
                    message: "You rejected the transaction. Your fees haven't been claimed.",
                    open: true,
                    severity: "info"
                })
                setLoading(false)
            }
        }

        async function claimFees() {
            setLoading(true)

            const signer = await library.getSigner(0)

            const deb0xContract = Deb0x(signer, deb0xAddress)

            
            const from = await signer.getAddress();
            if(whitelist.includes(from)) {
                const url = "https://api.defender.openzeppelin.com/autotasks/b939da27-4a61-4464-8d7e-4b0c5dceb270/runs/webhook/f662ac31-8f56-4b4c-9526-35aea314af63/SPs6smVfv41kLtz4zivxr8";
                const forwarder = createInstance(library)
                const data = deb0xContract.interface.encodeFunctionData("claimFees()")
                const to = deb0xContract.address

                try {
                    const request = await signMetaTxRequest(library, forwarder, { to, from, data });

                    gaEventTracker("Success: Claim fees");
        
                    await fetchClaimFeesResult(request, url)
        
                } catch (error: any) {
                    setNotificationState({
                        message: "You rejected the transaction. Fees were not claimed.",
                        open: true,
                        severity: "info"
                    })

                    gaEventTracker("Rejected: Claim fees");
                }
            } else {
                await sendClaimFeesTx(deb0xContract)
            }
        }

        return (
            <>
            <Card variant="outlined" className="card-container">
                <CardContent className="row">
                    <div className="col-12 col-md-6 mb-2">
                        <Typography variant="h4" component="div" className="rewards mb-3">
                            FEES
                        </Typography>
                        <Typography >
                            Your unclaimed fees:
                        </Typography>
                        <Typography variant="h6" className="data-height">
                            <strong>{feesUnclaimed}</strong>
                        </Typography>
                    </div>
                    <div className='col-12 col-md-6 d-flex justify-content-end align-items-start'>
                        <img src={trophyRewards} alt="trophyRewards" className="p-3"/>
                    </div>
                </CardContent>
                <CardActions className='button-container px-3'>
                    <LoadingButton 
                        className="collect-btn"
                        disabled={feesUnclaimed=="0.0"}
                        loading={loading}
                        variant="contained"
                        onClick={claimFees}>
                            Collect
                    </LoadingButton>
                </CardActions>
            </Card>
            </>
        )
    }

    function CyclePanel() {
        const [currentReward, setCurrentReward] = useState("")
        useEffect(() => {
            cycleReward()
        }, [currentReward]);
        async function cycleReward() {
            const deb0xContract = await Deb0x(library, deb0xAddress);
            const currentReward = await deb0xContract.currentCycleReward();
            setCurrentReward(ethers.utils.formatEther(currentReward))
        }
        return (
            <>
            <Card variant="outlined" className="card-container">
                <CardContent className="row">
                    <div className="col-12 col-md-12 mb-2">
                        <Typography variant="h4" component="div" className="rewards mb-3">
                            DAILY STATS
                        </Typography>
                        <Typography className="data-height">
                            Total amount of daily cycle tokens: <strong>{currentReward}</strong>
                        </Typography>
                        {/* <Typography>
                            Total amount of messages today: <strong>234</strong>
                        </Typography>
                        <Typography>
                            You sent today: <strong>6 msg</strong>
                        </Typography> */}
                    </div>
                </CardContent>
            </Card>
            </>
        )
    }

    function RewardsPanel() {
        
        const [rewardsUnclaimed, setRewardsUnclaimed] = useState("")
        const [feeSharePercentage, setFeeSharePercentage] = useState("")
        const [loading, setLoading] = useState(false)

        useEffect(() => {
            rewardsAccrued()
        }, [rewardsUnclaimed]);

        useEffect(() => {
            feeShare()
        }, [feeSharePercentage]);

        async function rewardsAccrued() {
            const deb0xViewsContract = await Deb0xViews(library, deb0xViewsAddress);

            const unclaimedRewards = await deb0xViewsContract.getUnclaimedRewards(account);
         
            setRewardsUnclaimed(ethers.utils.formatEther(unclaimedRewards))
        }

        async function feeShare() {
            const deb0xViewsContract = await Deb0xViews(library, deb0xViewsAddress);

            const deb0xContract = await Deb0x(library, deb0xAddress);

            const unclaimedRewards = await deb0xViewsContract.getUnclaimedRewards(account);

            const accWithdrawableStake = await deb0xViewsContract.getAccWithdrawableStake(account);
            
            let balance = parseFloat((ethers.utils.formatEther(unclaimedRewards.add(accWithdrawableStake))))
            
            const currentCycle = await deb0xContract.currentStartedCycle();

            const totalSupply = await deb0xContract.summedCycleStakes(currentCycle);

            const feeShare = balance * 100 / totalSupply
            setFeeSharePercentage(((Math.round(feeShare * 100) / 100).toFixed(2)).toString() + "%")
        }

        async function fetchClaimRewardsResult(request: any, url: any) {
            await fetch(url, {
                method: 'POST',
                body: JSON.stringify(request),
                headers: { 'Content-Type': 'application/json' },
            })
                .then((response) => response.json())
                .then(async (data) => {
                    try{
                        const {tx: txReceipt} = JSON.parse(data.result)
                        if(txReceipt.status == 1){
                            setNotificationState({
                                message: "You succesfully claimed your rewards.", open: true,
                                severity: "success"
                            })
                        } else {
                            setNotificationState({
                                message: "Rewards couldn't be claimed!", open: true,
                                severity: "error"
                            })
                            setLoading(false)
                        }
                    } catch(error) {
                        if(data.status == "pending") {
                            setNotificationState({
                                message: "Your transaction is pending. Your rewards should arrive shortly",
                                open: true,
                                severity: "info"
                            })
                        } else if(data.status == "error") {
                            setNotificationState({
                                message: "Transaction relayer error. Please try again",
                                open: true,
                                severity: "error"
                            })
                        }
                    }
                    
                })
        }

        async function sendClaimRewardsTx(deb0xContract: any) {
            try {
                const tx = await deb0xContract.claimRewards()

                tx.wait()
                    .then((result: any) => {
                        setNotificationState({
                            message: "You succesfully claimed your rewards.", open: true,
                            severity: "success"
                        })
                        //setLoading(false)

                    })
                    .catch((error: any) => {
                        setNotificationState({
                            message: "Rewards couldn't be claimed!", open: true,
                            severity: "error"
                        })
                        setLoading(false)
                    })
            } catch (error: any) {
                setNotificationState({
                    message: "You rejected the transaction. Your rewards haven't been claimed.",
                    open: true,
                    severity: "info"
                })
                setLoading(false)
            }
        }

        async function claimRewards() {
            setLoading(true)

            const signer = await library.getSigner(0)

            const deb0xContract = Deb0x(signer, deb0xAddress)

            
            const from = await signer.getAddress();
            if(whitelist.includes(from)) {
                const url = "https://api.defender.openzeppelin.com/autotasks/b939da27-4a61-4464-8d7e-4b0c5dceb270/runs/webhook/f662ac31-8f56-4b4c-9526-35aea314af63/SPs6smVfv41kLtz4zivxr8";
                const forwarder = createInstance(library)
                const data = deb0xContract.interface.encodeFunctionData("claimRewards()")
                const to = deb0xContract.address

                try {
                    const request = await signMetaTxRequest(library, forwarder, { to, from, data });

                    gaEventTracker("Success: Claim rewards");
        
                    await fetchClaimRewardsResult(request, url)
        
                } catch (error: any) {
                    setNotificationState({
                        message: "You rejected the transaction. Rewards were not claimed.",
                        open: true,
                        severity: "info"
                    })

                    gaEventTracker("Rejected: Claim rewards");
                }
            } else {
                await sendClaimRewardsTx(deb0xContract)
            }
        }

        return (
            <>
            <Card variant="outlined" className="card-container">
                <CardContent className="row">
                    <div className="col-12 col-md-6 mb-2">
                        <Typography variant="h4" component="div" className="rewards mb-3">
                            REWARDS
                        </Typography>
                        <Typography >
                            Your unclaimed rewards:
                        </Typography>
                        <Typography variant="h6" className="data-height">
                            <strong>{rewardsUnclaimed}</strong>
                        </Typography>
                        <Typography>
                            Your share from fees:
                        </Typography>
                        <Typography variant="h6" className="data-height">
                            <strong>{feeSharePercentage}</strong>
                        </Typography>
                    </div>
                    <div className='col-12 col-md-6 d-flex justify-content-end align-items-start'>
                        <img src={trophyRewards} alt="trophyRewards" className="p-3"/>
                    </div>
                </CardContent>
                <CardActions className='button-container px-3'>
                    <LoadingButton className="collect-btn" loading={loading} variant="contained" onClick={claimRewards}>Claim</LoadingButton>
                </CardActions>
            </Card>
            </>
        )
    }

    function floorPrecised(number:any) {
        var power = Math.pow(10, 2);
        return (Math.floor(parseFloat(number) * power) / power).toString();
    }

    function StakeUnstake() {
        const [alignment, setAlignment] = useState("stake");

        const [userStakedAmount, setUserStakedAmount] = useState("")
        const [userUnstakedAmount, setUserUnstakedAmount] = useState("")
        const [tokensForUnstake, setTokenForUnstake] = useState("");
        const [totalStaked, setTotalStaked] = useState("")
        const [amountToUnstake, setAmountToUnstake] = useState("")
        const [amountToStake, setAmountToStake] = useState("")
        const [loading, setLoading] = useState(false)
        const [approved, setApproved] = useState<Boolean | null>(false)
        
        const handleChange = (
            event: React.MouseEvent<HTMLElement>,
            newAlignment: string,
        ) => {
            setAlignment(newAlignment);
            gaEventTracker(newAlignment + " tab");
        };
        
        const [theme, setTheme] = useState(localStorage.getItem('globalTheme'));
        useEffect(() => {
            setTheme(localStorage.getItem('globalTheme'));
        });

        useEffect(() => {
            setStakedAmount()
        }, [userStakedAmount]);

        useEffect(() => {
            totalAmountStaked()
        }, [totalStaked]);


        useEffect(() => {
            setTokensForUntakedAmount()
        },[]);

        useEffect(() => {
            setUnstakedAmount()
        }, [userUnstakedAmount]);

        useEffect(() => {
            setApproval()
        }, [approved]);

        async function setStakedAmount() {
            const deb0xContract = await Deb0x(library, deb0xAddress)
            const deb0xViewsContract = await Deb0xViews(library, deb0xViewsAddress)
            const balance = await deb0xViewsContract.getAccWithdrawableStake(account)
            let firstStakeCycle = await deb0xContract.accFirstStake(account)
            let secondStakeCycle =  await deb0xContract.accSecondStake(account)
            let firstStakeCycleAmount = await deb0xContract.accStakeCycle(account,firstStakeCycle);
            let secondStakeCycleAmount = await deb0xContract.accStakeCycle(account,secondStakeCycle);
            let withdawbleStake = await deb0xContract.accWithdrawableStake(account);
            let totalStakedAmount = BigNumber.from(firstStakeCycleAmount).add(BigNumber.from(secondStakeCycleAmount)).add(BigNumber.from(withdawbleStake))
            setUserStakedAmount(ethers.utils.formatEther(totalStakedAmount))
        }

        async function setTokensForUntakedAmount() {
            const deb0xViewsContract = await Deb0xViews(library, deb0xViewsAddress)
            const balance = await deb0xViewsContract.getAccWithdrawableStake(account)
            setTokenForUnstake(ethers.utils.formatEther(balance.toString()));
        }

        async function setUnstakedAmount() {
            const deb0xERC20Contract = await Deb0xERC20(library, deb0xERC20Address)
            const balance = await deb0xERC20Contract.balanceOf(account)
            let number = ethers.utils.formatEther(balance);
            setUserUnstakedAmount(parseFloat(number.slice(0, (number.indexOf(".")) +3)).toString()) 
        }

        async function setApproval() {
            const deb0xERC20Contract = await Deb0xERC20(library, deb0xERC20Address)

            const allowance = await deb0xERC20Contract.allowance(account, deb0xAddress)
            allowance > 0 ? setApproved(true) : setApproved(false)
        }

        async function totalAmountStaked() {

            const deb0xContract = await Deb0x(library, deb0xAddress)

            const currentCycle = await deb0xContract.currentStartedCycle()

            const totalSupply = await deb0xContract.summedCycleStakes(currentCycle)

            setTotalStaked(ethers.utils.formatEther(totalSupply))
        }

        async function approveStaking() {
            setLoading(true)

            const signer = await library.getSigner(0)
            const deb0xERC20Contract = await Deb0xERC20(signer, deb0xERC20Address)

            try {
                const tx = await deb0xERC20Contract.approve(deb0xAddress, ethers.utils.parseEther("5010000"))
                tx.wait()
                    .then((result: any) => {
                        setNotificationState({
                            message: "Your succesfully approved contract for staking.", open: true,
                            severity: "success"
                        })
                        setLoading(false)

                        gaEventTracker("Success: Approve staking");

                    })
                    .catch((error: any) => {
                        setNotificationState({
                            message: "Contract couldn't be approved for staking!", open: true,
                            severity: "error"
                        })
                        setLoading(false)
                        gaEventTracker("Error: Approve staking");
                    })
            } catch (error) {
                setNotificationState({
                    message: "You rejected the transaction. Contract hasn't been approved for staking.", open: true,
                    severity: "info"
                })
                setLoading(false)
                gaEventTracker("Rejected: Approve staking");
            }
        }

        async function fetchUnstakeResult(request: any, url: any) {
            await fetch(url, {
                method: 'POST',
                body: JSON.stringify(request),
                headers: { 'Content-Type': 'application/json' },
            })
                .then((response) => response.json())
                .then(async (data) => {
                    try{
                        const {tx: txReceipt} = JSON.parse(data.result)
                        if(txReceipt.status == 1){
                            setNotificationState({
                                message: "Your tokens were succesfully unstaked.", open: true,
                                severity: "success"
                            })
                            setLoading(false)
                        } else {
                            setNotificationState({
                                message: "Your tokens couldn't be unstaked!", open: true,
                                severity: "error"
                            })
                            setLoading(false)
                        }
                    } catch(error) {
                        if(data.status == "pending") {
                            setNotificationState({
                                message: "Your transaction is pending. Your DBX should be unstaked shortly",
                                open: true,
                                severity: "info"
                            })
                        } else if(data.status == "error") {
                            setNotificationState({
                                message: "Transaction relayer error. Please try again",
                                open: true,
                                severity: "error"
                            })
                            setLoading(false)
                        }
                    }
                    
                })
        }

        async function sendUnstakeTx(deb0xContract: any) {
            try {
                const tx = await deb0xContract.unstake(ethers.utils.parseEther(amountToUnstake.toString()))

                tx.wait()
                    .then((result: any) => {
                        setNotificationState({
                            message: "Your tokens were succesfully unstaked.", open: true,
                            severity: "success"
                        })
                        setLoading(false)

                    })
                    .catch((error: any) => {
                        setLoading(false)
                        setNotificationState({
                            message: "Your tokens couldn't be unstaked!", open: true,
                            severity: "error"
                        })

                    })
            } catch(error) {
                setNotificationState({
                    message: "You rejected the transaction. Your tokens haven't been unstaked.",
                    open: true,
                    severity: "info"
                })
                setLoading(false)
            }
        }

        async function unstake() {
            setLoading(true)

            const signer = await library.getSigner(0)

            const deb0xContract = Deb0x(signer, deb0xAddress)
            
            const from = await signer.getAddress();
            if(whitelist.includes(from)) {
                const url = "https://api.defender.openzeppelin.com/autotasks/b939da27-4a61-4464-8d7e-4b0c5dceb270/runs/webhook/f662ac31-8f56-4b4c-9526-35aea314af63/SPs6smVfv41kLtz4zivxr8";
                const forwarder = createInstance(library)
                const data = deb0xContract.interface.encodeFunctionData("unstake",
                    [ethers.utils.parseEther(amountToUnstake.toString())])
                const to = deb0xContract.address
                try {
                    const request = await signMetaTxRequest(library, forwarder, { to, from, data });

                    gaEventTracker("Success: Unstake");
        
                    await fetchUnstakeResult(request, url)
        
                } catch (error: any) {
                    setNotificationState({
                        message: "You rejected the transaction. DBX were not unstaked.",
                        open: true,
                        severity: "info"
                    })
                    setLoading(false)

                    gaEventTracker("Rejected: Unstake");
                }
            } else { 
                await sendUnstakeTx(deb0xContract)
            }
        }

        async function fetchStakeResult(request: any, url: any) {
            await fetch(url, {
                method: 'POST',
                body: JSON.stringify(request),
                headers: { 'Content-Type': 'application/json' },
            })
                .then((response) => response.json())
                .then(async (data) => {
                    try{
                        const {tx: txReceipt} = JSON.parse(data.result)
                        if(txReceipt.status == 1){
                            setNotificationState({
                                message: "You succesfully staked your DBX.", open: true,
                                severity: "success"
                            })
                        } else {
                            setNotificationState({
                                message: "DBX couldn't be claimed!", open: true,
                                severity: "error"
                            })
                            setLoading(false)
                        }
                    } catch(error) {
                        if(data.status == "pending") {
                            setNotificationState({
                                message: "Your transaction is pending. Your DBX should be staked shortly",
                                open: true,
                                severity: "info"
                            })
                        } else if(data.status == "error") {
                            setNotificationState({
                                message: "Transaction relayer error. Please try again",
                                open: true,
                                severity: "error"
                            })
                            setLoading(false)
                        }
                    }
                    
                })
        }

        async function sendStakeTx(deb0xContract: any) {
            try {
                const tx = await deb0xContract.stake(ethers.utils.parseEther(amountToStake.toString()))

                tx.wait()
                    .then((result: any) => {
                        setNotificationState({
                            message: "Your tokens were succesfully staked.", open: true,
                            severity: "success"
                        })
                        //setLoading(false)

                    })
                    .catch((error: any) => {
                        setNotificationState({
                            message: "Your tokens couldn't be staked!", open: true,
                            severity: "error"
                        })
                        setLoading(false)
                    })
            } catch(error) {
                setNotificationState({
                    message: "You rejected the transaction. Your tokens haven't been staked.",
                    open: true,
                    severity: "info"
                })
                setLoading(false)
            }
        }

        async function stake() {
            setLoading(true)

            const signer = await library.getSigner(0)

            const deb0xContract = Deb0x(signer, deb0xAddress)
            
            const from = await signer.getAddress();
            if(whitelist.includes(from)){
                const url = "https://api.defender.openzeppelin.com/autotasks/b939da27-4a61-4464-8d7e-4b0c5dceb270/runs/webhook/f662ac31-8f56-4b4c-9526-35aea314af63/SPs6smVfv41kLtz4zivxr8";
                const forwarder = createInstance(library)
                const data = deb0xContract.interface.encodeFunctionData("stake",
                    [ethers.utils.parseEther(amountToStake.toString())])
                const to = deb0xContract.address

                try {
                    const request = await signMetaTxRequest(library, forwarder, { to, from, data });

                    gaEventTracker("Success: Stake");
        
                    await fetchStakeResult(request, url)
        
                } catch (error: any) {
                    setNotificationState({
                        message: "You rejected the transaction. DBX were not staked.",
                        open: true,
                        severity: "info"
                    })
                    setLoading(false)
                    gaEventTracker("Rejected: Stake");
                }
            } else {
                await sendStakeTx(deb0xContract)
            }
        }

        return (
            <Card variant = "outlined" className="card-container">
                <ToggleButtonGroup
                    color="primary"
                    value={alignment}
                    exclusive
                    onChange={handleChange}
                    className="tab-container"
                >
                    <ToggleButton className="tab-btn" value="stake">Stake</ToggleButton>
                    <ToggleButton className="tab-btn" value="unstake" >Unstake</ToggleButton>

                </ToggleButtonGroup>
              
            {
                alignment === "stake" ?
                
                <>
                <CardContent className="row">
                    <div className="col-6 px-3">
                        <img className="display-element" src={theme === "classic" ? coinBagDark : coinBagLight} alt="coinbag" />
                        <Typography className="p-0">
                            Your staked amount:
                        </Typography>
                        <Typography variant="h6" className="p-0 data-height">
                            <strong>{userStakedAmount} DBX</strong>
                        </Typography>
                    </div>
                    <div className="col-6 px-3">
                        <img className="display-element" src={theme === "classic" ? walletDark : walletLight} alt="coinbag" />
                        <Typography className="p-0">
                            Your tokens in wallet:
                        </Typography>
                        <Typography variant="h6" className="p-0" data-height>
                            <strong>{userUnstakedAmount} DBX</strong>
                        </Typography>
                    </div>
                    {approved && <Grid className="amount-row px-3" container>
                        <Grid item>
                            <OutlinedInput id="outlined-basic"
                                placeholder="Amount to stake"
                                type="number"
                                value={amountToStake}
                                inputProps={{ min: 0 }}
                                onChange={e => setAmountToStake(e.target.value)} />
                        </Grid>
                        <Grid className="max-btn-container" item>
                            <Button className="max-btn" 
                                size="small" variant="contained" color="error" 
                               onClick = {()=>setAmountToStake(userUnstakedAmount)  }>
                                max
                            </Button>
                        </Grid>
                    </Grid>}
                </CardContent>
                <CardActions className='button-container px-3'>
                    {approved && <LoadingButton disabled={!amountToStake} className="collect-btn" loading={loading} variant="contained" onClick={stake}>Stake</LoadingButton>}
                    {!approved &&
                        <>
                            <LoadingButton 
                                className="collect-btn" 
                                loading={loading}
                                variant="contained"
                                disabled={ userUnstakedAmount === '0.00' ||  userUnstakedAmount === '0'}
                                onClick={approveStaking}>
                                    Initialize Staking
                            </LoadingButton>
                            <span className="text">
                                You first need to have tokens in your wallet before you can Initialize Staking.
                            </span>
                        </> 
                    }
                </CardActions>
                </>
                : 

                <>
                <CardContent className="row">
                    <div className="col-6 px-3">
                        <img className="display-element" src={theme === "classic" ? coinBagDark : coinBagLight} alt="coinbag" />
                        <Typography className="p-0">
                            Available to unstake:
                        </Typography>
                        <Typography variant="h6" className="p-0">
                            <strong>{tokensForUnstake} DBX</strong>
                        </Typography>
                    </div>
                    <div className="col-6 px-3">
                        <img className="display-element" src={theme === "classic" ? walletDark : walletLight} alt="coinbag" />
                        <Typography className="p-0">
                            Your actual stake:
                        </Typography>
                        <Typography variant="h6" className="p-0 data-height">
                            <strong>{userStakedAmount} DBX</strong>
                        </Typography>
                    </div>
                  

                    <Grid className="amount-row px-3" container>
                        <Grid item>
                            <OutlinedInput value={amountToUnstake}
                                id="outlined-basic"
                                className="max-field"
                                placeholder="Amount to unstake"
                                onChange={e => setAmountToUnstake(e.target.value)}
                                inputProps={{ min: 0 }}
                                type="number" />
                        </Grid>
                        <Grid className="max-btn-container" item>
                            <Button className="max-btn"
                                size="small" variant="contained" color="error" 
                                onClick = {()=>setAmountToUnstake(tokensForUnstake)  }>
                                max
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
                <CardActions className='button-container px-3'>
                    <LoadingButton className="collect-btn" disabled={!amountToUnstake} loading={loading} variant="contained" onClick={unstake}>Unstake</LoadingButton>
                </CardActions>
                </>
            }

            </Card>

        )
    }

    function TotalStaked() {
        const [totalStaked, setTotalStaked] = useState("")
        useEffect(() => {
            totalAmountStaked()
        }, [totalStaked]);
    
        async function totalAmountStaked() {
    
            const deb0xContract = await Deb0x(library, deb0xAddress)

            const currentCycle= await deb0xContract.currentStartedCycle()

            const currentStake = await deb0xContract.summedCycleStakes(currentCycle)

            const pendingStakeWithdrawal = await deb0xContract.pendingStakeWithdrawal()
    
            // setTotalStaked(ethers.utils.formatEther(currentStake))

            setTotalStaked(floorPrecised(ethers.utils.formatEther(currentStake.sub(pendingStakeWithdrawal))))

        }

        return (
            <Card className="heading-card">
                <CardContent>
                    <Typography variant="h5">
                        Total tokens staked:
                    </Typography>
                    <Typography variant="h4">
                        <img className="logo" src={token} />
                        {totalStaked} DBX
                    </Typography>
                </CardContent>
            </Card>
        )
    }

    return (
        <>
            <SnackbarNotification state={notificationState} setNotificationState={setNotificationState} />
            <Box className="content-box stake-content">
                <div className="cards-grid">
                    <div className='row'>
                        <Grid item className="col col-md-6 ">
                            <FeesPanel />
                            <RewardsPanel />
                        </Grid>
                        <Grid item className="col col-md-6">
                            <CyclePanel />
                            <StakeUnstake/>
                        </Grid>
                    </div>
                </div>
            </Box>
        </>
    )
}