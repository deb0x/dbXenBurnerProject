import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import {
    Card, CardActions, CardContent, Button, Grid,
    Typography, Box, OutlinedInput
} from '@mui/material';

import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import LoadingButton from '@mui/lab/LoadingButton';
import DBXen from "../../ethereum/dbxen"
import DBXenViews from "../../ethereum/dbxenViews";
import DBXenERC20 from "../../ethereum/dbxenerc20"
import SnackbarNotification from './Snackbar';
import { BigNumber, ethers } from "ethers";
import "../../componentsStyling/stake.scss";
import token from "../../photos/icons/token.svg"
import coinBagLight from "../../photos/icons/coin-bag-solid--light.svg";
import coinBagDark from "../../photos/icons/coin-bag-solid--dark.svg";
import walletLight from "../../photos/icons/wallet--light.svg";
import walletDark from "../../photos/icons/wallet--dark.svg";
import fees from "../../photos/icons/fees.svg";
import finance from "../../photos/icons/finance.svg";
import { signMetaTxRequest } from '../../ethereum/signer';
import { createInstance } from '../../ethereum/forwarder'
import dataFromWhitelist from '../../constants.json';
import useAnalyticsEventTracker from '../Common/GaEventTracker';
import Countdown, { zeroPad } from "react-countdown";

const { whitelist } = dataFromWhitelist;
const deb0xAddress = "0x4F3ce26D9749C0f36012C9AbB41BF9938476c462";
const deb0xViewsAddress = "0xCF7582E5FaC8a6674CcD96ce71D807808Ca8ba6E";
const deb0xERC20Address = "0x47DD60FA40A050c0677dE19921Eb4cc512947729";

export function Stake(props: any): any {

    const { account, library, activate } = useWeb3React()
    const [notificationState, setNotificationState] = useState({})
    const gaEventTracker = useAnalyticsEventTracker('Stake');
    const [previousCycleXENBurned, setPreviousCycleXENBurned] = useState<any>();
    const date: any = new Date(Date.UTC(2023, 2, 17, 14, 3, 19, 0));
    const now: any = Date.now()
    let endDate = date.getTime() - now;
    const [deb0xViewsAddress, setDeb0xViewsAddress] = useState("0xCF7582E5FaC8a6674CcD96ce71D807808Ca8ba6E")
    const [deb0xAddress, setDeb0xAddress] = useState("0x4F3ce26D9749C0f36012C9AbB41BF9938476c462")
    const [deb0xERC20Address, setDeb0xERC20Address] = useState("0x47DD60FA40A050c0677dE19921Eb4cc512947729")
    const [xenAddress, setXENAddress] = useState("0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e")
    
    const renderer = ({ hours, minutes, seconds, completed }: any) => {
        if (completed) {
            // Render a complete state
            return;
        } else {
            // Render a countdown
            return (
                <span>
                    ~ {zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}
                </span>
            );
        }
    };

    function FeesPanel() {
        const [feesUnclaimed, setFeesUnclaimed] = useState("")
        const [loading, setLoading] = useState(false)


    
        async function getChainId() {
            const currentChainId = await window.ethereum.request({
                method: 'eth_chainId',
            }).then((result:any) =>{
                console.log("Resul" +result)
                if(parseInt(result, 16) === 137) {
                    setDeb0xAddress("0x4F3ce26D9749C0f36012C9AbB41BF9938476c462")
                    setDeb0xViewsAddress("0xCF7582E5FaC8a6674CcD96ce71D807808Ca8ba6E")
                    setDeb0xERC20Address("0x47DD60FA40A050c0677dE19921Eb4cc512947729")
                    setXENAddress("0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e")
                } else {
                    console.log("INTU AICI ?");
                    setDeb0xAddress("0xAEC85ff2A37Ac2E0F277667bFc1Ce1ffFa6d782A")
                    setDeb0xViewsAddress("0x5f8cABEa25AdA7DB13e590c34Ae4A1B1191ab997")
                    setDeb0xERC20Address("0x24b8cd32f93aC877D4Cc6da2369d73a6aC47Cb7b")
                    setXENAddress("0xC0C5AA69Dbe4d6DDdfBc89c0957686ec60F24389")
                }
            })
        }

        useEffect(() => {
            getChainId();
        }, [])

        useEffect(() => {
            feesAccrued()
        }, [feesUnclaimed]);


        useEffect(() => {
            totalXenBurnedPreviousCycle();
        }, []);

        async function totalXenBurnedPreviousCycle() {
            await getTotalXenBurnedInPreviusCycle().then((result: any) => {
                setPreviousCycleXENBurned(result);
            })
        }

        async function getTotalXenBurnedInPreviusCycle() {
            const signer = await library.getSigner(0)
            const deb0xContract = DBXen(signer, deb0xAddress)

            console.log("XXXX", deb0xAddress)

            await deb0xContract.getCurrentCycle().then(async (currentCycle: any) => {
                if (currentCycle != 0) {
                    await deb0xContract.cycleTotalBatchesBurned(currentCycle)
                        .then((numberBatchesBurnedInCurrentCycle: any) => {
                            return numberBatchesBurnedInCurrentCycle.toNumber() * 2500000;
                        })
                }
            })
            return 0;
        }

        async function feesAccrued() {
            const deb0xViewsContract = DBXenViews(library, deb0xViewsAddress);
            await deb0xViewsContract.getUnclaimedFees(account).then((result: any) => {
                setFeesUnclaimed(ethers.utils.formatEther(result))
            });
        }

        async function fetchClaimFeesResult(request: any, url: any) {
            await fetch(url, {
                method: 'POST',
                body: JSON.stringify(request),
                headers: { 'Content-Type': 'application/json' },
            })
                .then((response) => response.json())
                .then(async (data) => {
                    try {
                        const { tx: txReceipt } = JSON.parse(data.result)
                        if (txReceipt.status == 1) {
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
                    } catch (error) {
                        if (data.status == "pending") {
                            setNotificationState({
                                message: "Your transaction is pending. Your fees should arrive shortly",
                                open: true,
                                severity: "info"
                            })
                        } else if (data.status == "error") {
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

            const deb0xContract = DBXen(signer, deb0xAddress)

            const from = signer.getAddress();
            if (whitelist.includes(from)) {
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
                        <div className="col-12 col-md-8 mb-2">
                            <Typography variant="h4" component="div" className="rewards mb-3">
                                Your protocol fee share
                            </Typography>
                            <Typography >
                                Your unclaimed MATIC fees:&nbsp;
                                <strong>
                                    {Number(feesUnclaimed).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </strong>
                            </Typography>
                            <p className='my-2 counter'>
                                Get next fees in <Countdown date={Date.now() + endDate} renderer={renderer} />
                            </p>
                        </div>
                        <div className='col-12 col-md-4 d-flex justify-content-end align-items-start'>
                            <img src={fees} alt="trophyRewards" className="p-3 medium-img" />
                        </div>
                    </CardContent>
                    <CardActions className='button-container px-3'>
                        <LoadingButton
                            className="collect-btn"
                            disabled={feesUnclaimed == "0.0"}
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

    
        async function getChainId() {
            const currentChainId = await window.ethereum.request({
                method: 'eth_chainId',
            }).then((result:any) =>{
                if(parseInt(result, 16) === 137) {
                    console.log("Resul" +result)
                    setDeb0xAddress("0x4F3ce26D9749C0f36012C9AbB41BF9938476c462")
                    setDeb0xViewsAddress("0xCF7582E5FaC8a6674CcD96ce71D807808Ca8ba6E")
                    setDeb0xERC20Address("0x47DD60FA40A050c0677dE19921Eb4cc512947729")
                    setXENAddress("0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e")
                } else {
                    console.log("INTU AICI ?");
                    setDeb0xAddress("0xAEC85ff2A37Ac2E0F277667bFc1Ce1ffFa6d782A")
                    setDeb0xViewsAddress("0x5f8cABEa25AdA7DB13e590c34Ae4A1B1191ab997")
                    setDeb0xERC20Address("0x24b8cd32f93aC877D4Cc6da2369d73a6aC47Cb7b")
                    setXENAddress("0xC0C5AA69Dbe4d6DDdfBc89c0957686ec60F24389")
                }
            })
        }

        useEffect(() => {
            getChainId();
        }, [])

        useEffect(() => {
            cycleReward()
        }, [currentReward]);

        async function cycleReward() {
            const deb0xContract = DBXen(library, deb0xAddress);
            await deb0xContract.currentCycleReward().then((result: any) => {
                setCurrentReward(ethers.utils.formatEther(result))
            })
        }
        return (
            <>
                <Card variant="outlined" className="card-container">
                    <CardContent className="row">
                        <div className="col-12 col-md-12 mb-2">
                            <Typography variant="h4" component="div" className="rewards mb-3">
                                Daily stats
                            </Typography>
                            <Typography className="data-height">
                                This cycle mints:&nbsp;
                                <strong>
                                    {Number(currentReward).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </strong> DXN
                            </Typography>
                            {/* <Typography className="data-height">
                            Total XEN burned in previous cycle: <strong>{previousCycleXENBurned}</strong>
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

    
        async function getChainId() {
            const currentChainId = await window.ethereum.request({
                method: 'eth_chainId',
            }).then((result:any) =>{
                console.log(result === 0x89)
                if(parseInt(result, 16) === 137) {
                    setDeb0xAddress("0x4F3ce26D9749C0f36012C9AbB41BF9938476c462")
                    setDeb0xViewsAddress("0xCF7582E5FaC8a6674CcD96ce71D807808Ca8ba6E")
                    setDeb0xERC20Address("0x47DD60FA40A050c0677dE19921Eb4cc512947729")
                    setXENAddress("0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e")
                } else {
                    console.log("INTU AICI ?");
                    setDeb0xAddress("0xAEC85ff2A37Ac2E0F277667bFc1Ce1ffFa6d782A")
                    setDeb0xViewsAddress("0x5f8cABEa25AdA7DB13e590c34Ae4A1B1191ab997")
                    setDeb0xERC20Address("0x24b8cd32f93aC877D4Cc6da2369d73a6aC47Cb7b")
                    setXENAddress("0xC0C5AA69Dbe4d6DDdfBc89c0957686ec60F24389")
                }
            })
        }

        useEffect(() => {
            getChainId();
        }, [])

        useEffect(() => {
            rewardsAccrued()
        }, [rewardsUnclaimed]);

        useEffect(() => {
            feeShare()
        }, [feeSharePercentage]);

        async function rewardsAccrued() {
            const deb0xViewsContract = DBXenViews(library, deb0xViewsAddress);

            await deb0xViewsContract.getUnclaimedRewards(account).then((result: any) => {
                setRewardsUnclaimed(ethers.utils.formatEther(result))
            })
        }

        async function feeShare() {
            const deb0xViewsContract = DBXenViews(library, deb0xViewsAddress);

            const deb0xContract = DBXen(library, deb0xAddress);

            const unclaimedRewards = await deb0xViewsContract.getUnclaimedRewards(account);

            const accWithdrawableStake = await deb0xViewsContract.getAccWithdrawableStake(account);

            let balance = parseFloat((ethers.utils.formatEther(unclaimedRewards.add(accWithdrawableStake))))

            console.log("bbbbbbbbbbbbbb  "+deb0xContract)
            const currentCycle = await deb0xContract.currentStartedCycle();
            console.log("cccccccccccccccccccccccc   "+currentCycle)

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
                    try {
                        const { tx: txReceipt } = JSON.parse(data.result)
                        if (txReceipt.status == 1) {
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
                    } catch (error) {
                        if (data.status == "pending") {
                            setNotificationState({
                                message: "Your transaction is pending. Your rewards should arrive shortly",
                                open: true,
                                severity: "info"
                            })
                        } else if (data.status == "error") {
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

            const deb0xContract = DBXen(signer, deb0xAddress)


            const from = await signer.getAddress();
            if (whitelist.includes(from)) {
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
                        <div className="col-12 col-md-10 mb-2">
                            <Typography variant="h4" component="div" className="rewards mb-3">
                                Your rewards
                            </Typography>
                            <Typography >
                                Your unclaimed DXN rewards:&nbsp;
                                <strong>
                                    {Number(rewardsUnclaimed).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    })}
                                </strong>
                            </Typography>
                            <p className='my-2 counter'>
                                Get next rewards in <Countdown date={Date.now() + endDate} renderer={renderer} />
                            </p>
                        </div>
                        <div className='col-12 col-md-2 d-flex justify-content-end align-items-start'>
                            <img src={finance} alt="trophyRewards" className="p-3 medium-img" />
                        </div>
                    </CardContent>
                    <CardActions className='button-container px-3'>
                        <LoadingButton className="collect-btn" loading={loading} variant="contained" onClick={claimRewards}>Claim</LoadingButton>
                        <span className="text">Unclaimed DXN is considered automatically staked. Only claim when you want to trade.</span>
                    </CardActions>
                </Card>
            </>
        )
    }

    function floorPrecised(number: any) {
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

    
        async function getChainId() {
            const currentChainId = await window.ethereum.request({
                method: 'eth_chainId',
            }).then((result:any) =>{
                console.log("Resul" +result)
                if(parseInt(result, 16) === 137) {
                    setDeb0xAddress("0x4F3ce26D9749C0f36012C9AbB41BF9938476c462")
                    setDeb0xViewsAddress("0xCF7582E5FaC8a6674CcD96ce71D807808Ca8ba6E")
                    setDeb0xERC20Address("0x47DD60FA40A050c0677dE19921Eb4cc512947729")
                    setXENAddress("0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e")
                } else {
                    console.log("INTU AICI ?");
                    setDeb0xAddress("0xAEC85ff2A37Ac2E0F277667bFc1Ce1ffFa6d782A")
                    setDeb0xViewsAddress("0x5f8cABEa25AdA7DB13e590c34Ae4A1B1191ab997")
                    setDeb0xERC20Address("0x24b8cd32f93aC877D4Cc6da2369d73a6aC47Cb7b")
                    setXENAddress("0xC0C5AA69Dbe4d6DDdfBc89c0957686ec60F24389")
                }
            })
        }

        useEffect(() => {
            getChainId();
        }, [])

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
        }, []);

        useEffect(() => {
            setUnstakedAmount()
        }, [userUnstakedAmount]);

        useEffect(() => {
            setApproval()
        }, [approved]);

        async function setStakedAmount() {
            const deb0xContract = await DBXen(library, deb0xAddress)
            const deb0xViewsContract = await DBXenViews(library, deb0xViewsAddress)
            const balance = await deb0xViewsContract.getAccWithdrawableStake(account)
            let firstStakeCycle = await deb0xContract.accFirstStake(account)
            let secondStakeCycle = await deb0xContract.accSecondStake(account)
            let firstStakeCycleAmount = await deb0xContract.accStakeCycle(account, firstStakeCycle);
            let secondStakeCycleAmount = await deb0xContract.accStakeCycle(account, secondStakeCycle);
            let withdawbleStake = await deb0xContract.accWithdrawableStake(account);
            let totalStakedAmount = BigNumber.from(firstStakeCycleAmount).add(BigNumber.from(secondStakeCycleAmount)).add(BigNumber.from(withdawbleStake))
            setUserStakedAmount(ethers.utils.formatEther(totalStakedAmount))
        }

        async function setTokensForUntakedAmount() {
            const deb0xViewsContract =  DBXenViews(library, deb0xViewsAddress)
            const balance = await deb0xViewsContract.getAccWithdrawableStake(account).then((balance:any) =>{
                setTokenForUnstake(ethers.utils.formatEther(balance.toString()));
            })
        }

        async function setUnstakedAmount() {
            const deb0xERC20Contract = await DBXenERC20(library, deb0xERC20Address)
            const balance = await deb0xERC20Contract.balanceOf(account).then((balance:any) =>{
                let number = ethers.utils.formatEther(balance);
                setUserUnstakedAmount(parseFloat(number.slice(0, (number.indexOf(".")) + 3)).toString())
            })
        }

        async function setApproval() {
            const deb0xERC20Contract = DBXenERC20(library, deb0xERC20Address)

            await deb0xERC20Contract.allowance(account, deb0xAddress).then((allowance:any) =>
                 allowance > 0 ? setApproved(true) : setApproved(false)
            )
        }

        async function totalAmountStaked() {

            const deb0xContract = DBXen(library, deb0xAddress)

            console.log("ssssssssssssssssss "+deb0xContract.address)
           await deb0xContract.currentStartedCycle().then(async (currentCycle:any) =>{
            console.log("hhhhhhh "+currentCycle)
                await deb0xContract.summedCycleStakes(currentCycle).then((totalSupply:any) => {
                    setTotalStaked(ethers.utils.formatEther(totalSupply))
                })
            })

        }

        async function approveStaking() {
            setLoading(true)

            const signer = await library.getSigner(0)
            const deb0xERC20Contract = DBXenERC20(signer, deb0xERC20Address)

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
                    try {
                        const { tx: txReceipt } = JSON.parse(data.result)
                        if (txReceipt.status == 1) {
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
                    } catch (error) {
                        if (data.status == "pending") {
                            setNotificationState({
                                message: "Your transaction is pending. Your DXN should be unstaked shortly",
                                open: true,
                                severity: "info"
                            })
                        } else if (data.status == "error") {
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
            } catch (error) {
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

            const deb0xContract = DBXen(signer, deb0xAddress)

            const from = await signer.getAddress();
            if (whitelist.includes(from)) {
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
                        message: "You rejected the transaction. DXN were not unstaked.",
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
                    try {
                        const { tx: txReceipt } = JSON.parse(data.result)
                        if (txReceipt.status == 1) {
                            setNotificationState({
                                message: "You succesfully staked your DXN.", open: true,
                                severity: "success"
                            })
                        } else {
                            setNotificationState({
                                message: "DXN couldn't be claimed!", open: true,
                                severity: "error"
                            })
                            setLoading(false)
                        }
                    } catch (error) {
                        if (data.status == "pending") {
                            setNotificationState({
                                message: "Your transaction is pending. Your DXN should be staked shortly",
                                open: true,
                                severity: "info"
                            })
                        } else if (data.status == "error") {
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
                        //
                        let tokensInWallet = Number(userUnstakedAmount) - Number(amountToStake);
                        setUserUnstakedAmount(tokensInWallet.toString())
                        //setLoading(false)

                    })
                    .catch((error: any) => {
                        setNotificationState({
                            message: "Your tokens couldn't be staked!", open: true,
                            severity: "error"
                        })
                        setLoading(false)
                    })
            } catch (error) {
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

            const deb0xContract = DBXen(signer, deb0xAddress)

            const from = await signer.getAddress();
            if (whitelist.includes(from)) {
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
                        message: "You rejected the transaction. DXN were not staked.",
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
            <Card variant="outlined" className="card-container">
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
                                        <strong>
                                            {Number(userStakedAmount).toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })} DXN</strong>
                                    </Typography>
                                </div>
                                <div className="col-6 px-3">
                                    <img className="display-element" src={theme === "classic" ? walletDark : walletLight} alt="coinbag" />
                                    <Typography className="p-0">
                                        Available DXN in your wallet:
                                    </Typography>
                                    <Typography variant="h6" className="p-0" data-height>
                                        <strong>
                                            {Number(userUnstakedAmount).toLocaleString('en-US', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2
                                            })} DXN</strong>
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
                                            onClick={() => setAmountToStake(userUnstakedAmount)}>
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
                                            disabled={userUnstakedAmount === '0.00' || userUnstakedAmount === '0'}
                                            onClick={approveStaking}>
                                            Initialize Staking
                                        </LoadingButton>
                                        <span className="text">
                                            Make sure you have DXN tokens in your wallet before you can stake them.
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
                                        <strong>{Number(tokensForUnstake).toLocaleString('en-US', {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })} DXN</strong>
                                    </Typography>
                                </div>
                                {/* <div className="col-6 px-3">
                        <img className="display-element" src={theme === "classic" ? walletDark : walletLight} alt="coinbag" />
                        <Typography className="p-0">
                            Your actual stake:
                        </Typography>
                        <Typography variant="h6" className="p-0 data-height">
                            <strong>{userStakedAmount} DXN</strong>
                        </Typography>
                    </div> */}


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
                                            onClick={() => setAmountToUnstake(tokensForUnstake)}>
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

            const deb0xContract = DBXen(library, deb0xAddress)

            const currentCycle = await deb0xContract.currentStartedCycle()

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
                        {totalStaked} DXN
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
                        <Grid item className="col col-12 col-md-6 ">
                            <FeesPanel />
                        </Grid>
                        <Grid item className="col col-12 col-md-6">
                            <CyclePanel />
                        </Grid>
                    </div>
                    <div className='row'>
                        <Grid item className="col col-12 col-md-6 ">
                            <RewardsPanel />
                        </Grid>
                        <Grid item className="col col-12 col-md-6">
                            <StakeUnstake />
                        </Grid>
                    </div>
                </div>
            </Box>
        </>
    )
}