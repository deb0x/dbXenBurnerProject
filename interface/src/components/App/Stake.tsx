import { useState, useEffect, useContext } from 'react';
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
import { useTranslation } from 'react-i18next';
import ChainContext from '../Contexts/ChainContext';

const { whitelist } = dataFromWhitelist;

export function Stake(props: any): any {

    const { account, library, activate } = useWeb3React()
    const { chain } = useContext(ChainContext)
    const [notificationState, setNotificationState] = useState({})
    const gaEventTracker = useAnalyticsEventTracker('Stake');
    const [previousCycleXENBurned, setPreviousCycleXENBurned] = useState<any>();
    const dateEthereum: any = new Date(Date.UTC(2023, 12, 22, 14, 0, 11, 0));
    const datePolygon: any = new Date(Date.UTC(2023, 12, 17, 14, 3, 19, 0));
    const dateAvalanche: any = new Date(Date.UTC(2023, 12, 17, 14, 7, 20, 0));
    const dateBinance: any = new Date(Date.UTC(2023, 12, 17, 13, 57, 40, 0));
    const dateOKXChain: any = new Date(Date.UTC(2023, 12, 17, 11, 24, 7, 0));
    const dateFantom: any = new Date(Date.UTC(2023, 12, 17, 11, 44, 7, 0));
    const dateDogechain: any = new Date(Date.UTC(2023, 12, 17, 11, 55, 14, 0));
    const dateMoonbeam: any = new Date(Date.UTC(2023, 12, 17, 12, 3, 30, 0));
    const dateEvmos: any = new Date(Date.UTC(2023, 12, 17, 12, 16, 48, 0));
    const dateEthereumPow: any = new Date(Date.UTC(2023, 12, 17, 12, 24, 59, 0));
    const now: any = Date.now();
    const { t } = useTranslation();
    const [endDate, setEndDate] = useState<any>();

    const renderer = ({ hours, minutes, seconds, completed }: any) => {
        if (completed) {
            // Render a complete state
            return (
                <span>
                    ~ {zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}
                </span>
            );
        } else {
            // Render a countdown
            return (
                <span>
                    ~ {zeroPad(hours)}:{zeroPad(minutes)}:{zeroPad(seconds)}
                </span>
            );
        }
    };

    useEffect(() => {
        timer();
    }, [])

    useEffect(() => {
        timer();
    }, [chain.chainId])

    function timer() {
        switch (Number(chain.chainId)) {
            case 1:
                setEndDate(dateEthereum.getTime() - now);
                break;
            case 137:
                setEndDate(datePolygon.getTime() - now);
                break;
            case 43114:
                setEndDate(dateAvalanche.getTime() - now);
                break;
            case 56:
                setEndDate(dateBinance.getTime() - now);
                break;
            case 250:
                setEndDate(dateFantom.getTime() - now);
                break;
            case 1284:
                setEndDate(dateMoonbeam.getTime() - now);
                break;
            case 66:
                setEndDate(dateOKXChain.getTime() - now);
                break;
            case 9001:
                setEndDate(dateEvmos.getTime() - now);
                break;
            case 2000:
                setEndDate(dateDogechain.getTime() - now);
                break;
            case 10001:
                setEndDate(dateEthereumPow.getTime() - now);
                break;
        }
    }

    function FeesPanel() {
        const [feesUnclaimed, setFeesUnclaimed] = useState("")
        const [loading, setLoading] = useState(false)

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
            const deb0xContract = DBXen(signer, chain.deb0xAddress)

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
            const deb0xViewsContract = DBXenViews(library, chain.deb0xViewsAddress);
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
                                message: t("fees.toastify.success"), open: true,
                                severity: "success"
                            })
                        } else {
                            setNotificationState({
                                message: t("fees.toastify.error"), open: true,
                                severity: "error"
                            })
                            setLoading(false)
                        }
                    } catch (error) {
                        if (data.status == "pending") {
                            setNotificationState({
                                message: t("fees.toastify.info"),
                                open: true,
                                severity: "info"
                            })
                        } else if (data.status == "error") {
                            setNotificationState({
                                message: t("fees.toastify.transaction_error"),
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
                            message: t("fees.toastify.success"), open: true,
                            severity: "success"
                        })
                        //setLoading(false)
                    })
                    .catch((error: any) => {
                        setNotificationState({
                            message: t("fees.toastify.error"), open: true,
                            severity: "error"
                        })
                        setLoading(false)
                    })
            } catch (error: any) {
                setNotificationState({
                    message: t("fees.toastify.rejected"),
                    open: true,
                    severity: "info"
                })
                setLoading(false)
            }
        }

        async function claimFees() {
            setLoading(true)

            const signer = await library.getSigner(0)

            const deb0xContract = DBXen(signer, chain.deb0xAddress)

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
                        message: t("fees.toastify.rejected"),
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
                                {t("fees.title")}
                            </Typography>
                            <Typography className="data-height">
                                {t("fees.unclaimed_fees")} {chain.currency} {t("fees.unclaimed_fees_2")}:&nbsp;
                                <strong>
                                    {Number(feesUnclaimed).toLocaleString('en-US', {
                                        minimumFractionDigits: 10,
                                        maximumFractionDigits: 10
                                    })}
                                </strong>
                            </Typography>
                            <p className='my-2 counter'>
                                {t("fees.counter")}
                                {/* <Countdown date={Date.now() + endDate} renderer={renderer} /> */}
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
                            {t("fees.collect")}
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
            }).then((result: any) => {

            })
        }

        useEffect(() => {
            getChainId();
        }, [])

        useEffect(() => {
            cycleReward()
        }, [currentReward]);

        async function cycleReward() {
            const deb0xContract = DBXen(library, chain.deb0xAddress);
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
                                {t("daily_stats.title")}
                            </Typography>
                            <Typography className="data-height">
                                {t("daily_stats.this_cycle")}:&nbsp;
                                <strong>
                                    {Number(currentReward).toLocaleString('en-US', {
                                        minimumFractionDigits: 10,
                                        maximumFractionDigits: 10
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
            }).then((result: any) => {

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
            const deb0xViewsContract = DBXenViews(library, chain.deb0xViewsAddress);

            await deb0xViewsContract.getUnclaimedRewards(account).then((result: any) => {
                setRewardsUnclaimed(ethers.utils.formatEther(result))
            })
        }

        async function feeShare() {
            const deb0xViewsContract = DBXenViews(library, chain.deb0xViewsAddress);

            const deb0xContract = DBXen(library, chain.deb0xAddress);

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
                    try {
                        const { tx: txReceipt } = JSON.parse(data.result)
                        if (txReceipt.status == 1) {
                            setNotificationState({
                                message: t("rewards.toastify.success"), open: true,
                                severity: "success"
                            })
                        } else {
                            setNotificationState({
                                message: t("rewards.toastify.error"), open: true,
                                severity: "error"
                            })
                            setLoading(false)
                        }
                    } catch (error) {
                        if (data.status == "pending") {
                            setNotificationState({
                                message: t("rewards.toastify.info"),
                                open: true,
                                severity: "info"
                            })
                        } else if (data.status == "error") {
                            setNotificationState({
                                message: t("rewards.toastify.transaction_error"),
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
                            message: t("rewards.toastify.success"), open: true,
                            severity: "success"
                        })
                        //setLoading(false)

                    })
                    .catch((error: any) => {
                        setNotificationState({
                            message: t("rewards.toastify.error"), open: true,
                            severity: "error"
                        })
                        setLoading(false)
                    })
            } catch (error: any) {
                setNotificationState({
                    message: t("rewards.toastify.rejected"),
                    open: true,
                    severity: "info"
                })
                setLoading(false)
            }
        }

        async function claimRewards() {
            setLoading(true)

            const signer = await library.getSigner(0)

            const deb0xContract = DBXen(signer, chain.deb0xAddress)


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
                        message: t("rewards.toastify.rejected"),
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
                                {t("rewards.title")}
                            </Typography>
                            <Typography className="data-height">
                                {t("rewards.unclaimed_rewards")}:&nbsp;
                                <strong>
                                    {Number(rewardsUnclaimed).toLocaleString('en-US', {
                                        minimumFractionDigits: 10,
                                        maximumFractionDigits: 10
                                    })}
                                </strong>
                            </Typography>
                            <p className='my-2 counter'>
                                {t("rewards.counter")}
                                {/* <Countdown date={Date.now() + endDate} renderer={renderer} /> */}
                            </p>
                        </div>
                        <div className='col-12 col-md-2 d-flex justify-content-end align-items-start'>
                            <img src={finance} alt="trophyRewards" className="p-3 medium-img" />
                        </div>
                    </CardContent>
                    <CardActions className='button-container px-3'>
                        <LoadingButton className="collect-btn" loading={loading} variant="contained" onClick={claimRewards}>
                            {t("rewards.claim")}
                        </LoadingButton>
                        <span className="text">{t("rewards.claim_description")}</span>
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
        const [backButton, setBack] = useState<Boolean | null>(false)

        async function getChainId() {
            const currentChainId = await window.ethereum.request({
                method: 'eth_chainId',
            }).then((result: any) => {

            })
        }

        useEffect(() => {
            getChainId();
        }, [])

        const handleChange = (
            event: React.MouseEvent<HTMLElement>,
            newAlignment: string,
        ) => {
            console.log(newAlignment);
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
        }, []);

        useEffect(() => {
            setStakeAmount();
        }, [amountToStake]);

        async function setStakeAmount() {
            const deb0xERC20Contract = DBXenERC20(library, chain.deb0xERC20Address)
            await deb0xERC20Contract.allowance(account, chain.deb0xAddress).then((allowance: any) => {
                let allowanceValue = ethers.utils.formatEther(allowance.toString());
                if (Number(amountToStake) > 0.0) {
                    if (Number(allowanceValue) < Number(amountToStake)) {
                        setApproved(false)
                        setBack(true);
                    } else {
                        setBack(false);
                        setApproved(true)
                    }
                }
            })
        }

        async function backToApprove() {
            setBack(false);
            setApproved(true);
            setAmountToStake("");
        }

        async function setStakedAmount() {
            const deb0xContract = await DBXen(library, chain.deb0xAddress)
            const deb0xViewsContract = await DBXenViews(library, chain.deb0xViewsAddress)
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
            const deb0xViewsContract = DBXenViews(library, chain.deb0xViewsAddress)
            const balance = await deb0xViewsContract.getAccWithdrawableStake(account).then((balance: any) => {
                setTokenForUnstake(ethers.utils.formatEther(balance.toString()));
            })
        }

        async function setUnstakedAmount() {
            const deb0xERC20Contract = await DBXenERC20(library, chain.deb0xERC20Address)
            const balance = await deb0xERC20Contract.balanceOf(account).then((balance: any) => {
                let number = ethers.utils.formatEther(balance);
                setUserUnstakedAmount(parseFloat(number.slice(0, (number.indexOf(".")) + 3)).toString())
            })
        }

        async function setApproval() {
            const deb0xERC20Contract = DBXenERC20(library, chain.deb0xERC20Address)

            await deb0xERC20Contract.allowance(account, chain.deb0xAddress).then((allowance: any) =>
                allowance > 0 ? setApproved(true) : setApproved(false)
            )
        }

        async function totalAmountStaked() {

            const deb0xContract = DBXen(library, chain.deb0xAddress)

            await deb0xContract.currentStartedCycle().then(async (currentCycle: any) => {
                await deb0xContract.summedCycleStakes(currentCycle).then((totalSupply: any) => {
                    setTotalStaked(ethers.utils.formatEther(totalSupply))
                })
            })
        }

        async function approveStaking() {
            setLoading(true)

            const signer = await library.getSigner(0)
            const deb0xERC20Contract = DBXenERC20(signer, chain.deb0xERC20Address)

            try {
                const tx = await deb0xERC20Contract.approve(chain.deb0xAddress, ethers.utils.parseEther("5010000"))
                tx.wait()
                    .then((result: any) => {
                        setNotificationState({
                            message: t("stake.toastify.success"), open: true,
                            severity: "success"
                        })
                        setLoading(false)

                        gaEventTracker("Success: Approve staking");

                    })
                    .catch((error: any) => {
                        setNotificationState({
                            message: t("stake.toastify.error"), open: true,
                            severity: "error"
                        })
                        setLoading(false)
                        gaEventTracker("Error: Approve staking");
                    })
            } catch (error) {
                setNotificationState({
                    message: t("stake.toastify.info"), open: true,
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
                                message: t("unstake.toastify.success"), open: true,
                                severity: "success"
                            })
                            setLoading(false)
                        } else {
                            setNotificationState({
                                message: t("unstake.toastify.error"), open: true,
                                severity: "error"
                            })
                            setLoading(false)
                        }
                    } catch (error) {
                        if (data.status == "pending") {
                            setNotificationState({
                                message: t("unstake.toastify.info"),
                                open: true,
                                severity: "info"
                            })
                        } else if (data.status == "error") {
                            setNotificationState({
                                message: t("unstake.toastify.transaction_error"),
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
                            message: t("unstake.toastify.success"), open: true,
                            severity: "success"
                        })
                        setTokensForUntakedAmount();
                        setLoading(false)

                    })
                    .catch((error: any) => {
                        setLoading(false)
                        setNotificationState({
                            message: t("unstake.toastify.error"), open: true,
                            severity: "error"
                        })

                    })
            } catch (error) {
                setNotificationState({
                    message: t("unstake.toastify.rejected"),
                    open: true,
                    severity: "info"
                })
                setLoading(false)
            }
        }

        async function unstake() {
            setLoading(true)

            const signer = await library.getSigner(0)

            const deb0xContract = DBXen(signer, chain.deb0xAddress)

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
                        message: t("unstake.toastify.rejected"),
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
                                message: t("stake.toastify.staked"), open: true,
                                severity: "success"
                            })
                        } else {
                            setNotificationState({
                                message: t("stake.toastify.claim_error"), open: true,
                                severity: "error"
                            })
                            setLoading(false)
                        }
                    } catch (error) {
                        if (data.status == "pending") {
                            setNotificationState({
                                message: t("stake.toastify.stake_info"),
                                open: true,
                                severity: "info"
                            })
                        } else if (data.status == "error") {
                            setNotificationState({
                                message: t("stake.toastify.stake_transaction_error"),
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
                            message: t("stake.toastify.staked"), open: true,
                            severity: "success"
                        })
                        //
                        let tokensInWallet = Number(userUnstakedAmount) - Number(amountToStake);
                        setUserUnstakedAmount(tokensInWallet.toString())
                        //setLoading(false)

                    })
                    .catch((error: any) => {
                        setNotificationState({
                            message: t("stake.toastify.stake_error"), open: true,
                            severity: "error"
                        })
                        setLoading(false)
                    })
            } catch (error) {
                setNotificationState({
                    message: t("stake.toastify.rejected"),
                    open: true,
                    severity: "info"
                })
                setLoading(false)
            }
        }

        async function stake() {
            setLoading(true)

            const signer = await library.getSigner(0)

            const deb0xContract = DBXen(signer, chain.deb0xAddress)

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
                        message: t("stake.toastify.rejected"),
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
                    <ToggleButton className="tab-btn" value="stake">{t("stake.stake")}</ToggleButton>
                    <ToggleButton className="tab-btn" value="unstake" >{t("unstake.unstake")}</ToggleButton>

                </ToggleButtonGroup>

                {
                    alignment === "stake" ?

                        <>
                            <CardContent className="row">
                                <div className="col-6 px-3">
                                    <img className="display-element" src={theme === "classic" ? coinBagDark : coinBagLight} alt="coinbag" />
                                    <Typography className="p-0">
                                        {t("stake.staked_amount")}:
                                    </Typography>
                                    <Typography variant="h6" className="p-0 data-height">
                                        <strong>
                                            {Number(userStakedAmount).toLocaleString('en-US', {
                                                minimumFractionDigits: 10,
                                                maximumFractionDigits: 10
                                            })} DXN</strong>
                                    </Typography>
                                </div>
                                <div className="col-6 px-3">
                                    <img className="display-element" src={theme === "classic" ? walletDark : walletLight} alt="coinbag" />
                                    <Typography className="p-0">
                                        {t("stake.wallet")}:
                                    </Typography>
                                    <Typography variant="h6" className="p-0 data-height" data-height>
                                        <strong>
                                            {Number(userUnstakedAmount).toLocaleString('en-US', {
                                                minimumFractionDigits: 10,
                                                maximumFractionDigits: 10
                                            })} DXN</strong>
                                    </Typography>
                                </div>
                                {approved && <Grid className="amount-row px-3" container>
                                    <Grid item>
                                        <OutlinedInput id="outlined-basic"
                                            placeholder={t("stake.amount_to_stake")}
                                            type="number"
                                            value={amountToStake}
                                            inputProps={{ min: 0 }}
                                            onChange={e => setAmountToStake(e.target.value)} />
                                    </Grid>
                                    <Grid className="max-btn-container" item>
                                        <Button className="max-btn"
                                            size="small" variant="contained" color="error"
                                            onClick={() => setAmountToStake(userUnstakedAmount)}>
                                            {t("stake.max")}
                                        </Button>
                                    </Grid>
                                </Grid>}
                            </CardContent>
                            <CardActions className='button-container multi-actions px-3'>
                                {approved &&
                                    <LoadingButton disabled={!amountToStake} className="collect-btn" loading={loading} variant="contained" onClick={stake}>
                                        {t("stake.stake")}
                                    </LoadingButton>}
                                {!approved &&
                                    <div className="collect">
                                        <LoadingButton
                                            className="collect-btn"
                                            loading={loading}
                                            variant="contained"
                                            disabled={userUnstakedAmount === '0.00' || userUnstakedAmount === '0'}
                                            onClick={approveStaking}>
                                            {t("stake.init_button")}
                                        </LoadingButton>
                                        <span className="text">
                                            {t("stake.init_text")}
                                        </span>
                                    </div>
                                }
                                {backButton &&
                                    <div className="back-to-approve">
                                        <LoadingButton
                                            className="collect-btn"
                                            loading={false}
                                            variant="contained"
                                            onClick={backToApprove}>
                                            Back
                                        </LoadingButton>
                                        <span className="text">
                                            Your input value is grather than your current approved value!
                                            Back to input or approve!
                                        </span>
                                    </div>
                                }
                            </CardActions>
                        </>
                        :

                        <>
                            <CardContent className="row">
                                <div className="col-6 px-3">
                                    <img className="display-element" src={theme === "classic" ? coinBagDark : coinBagLight} alt="coinbag" />
                                    <Typography className="p-0">
                                        {t("unstake.available")}:
                                    </Typography>
                                    <Typography variant="h6" className="p-0">
                                        <strong>{Number(tokensForUnstake).toLocaleString('en-US', {
                                            minimumFractionDigits: 10,
                                            maximumFractionDigits: 10
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
                                            placeholder={t("unstake.amount_to_unstake")}
                                            onChange={e => setAmountToUnstake(e.target.value)}
                                            inputProps={{ min: 0 }}
                                            type="number" />
                                    </Grid>
                                    <Grid className="max-btn-container" item>
                                        <Button className="max-btn"
                                            size="small" variant="contained" color="error"
                                            onClick={() => setAmountToUnstake(tokensForUnstake)}>
                                            {t("unstake.max")}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </CardContent>
                            <CardActions className='button-container px-3'>
                                <LoadingButton className="collect-btn" disabled={!amountToUnstake} loading={loading} variant="contained" onClick={unstake}>
                                    {t("unstake.unstake")}
                                </LoadingButton>
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

            const deb0xContract = DBXen(library, chain.deb0xAddress)

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