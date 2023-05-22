import { useState, useEffect, useContext } from 'react';
import { useWeb3React } from '@web3-react/core';
import XENCrypto from '../../ethereum/XENCrypto';
import DBXen from "../../ethereum/dbxen"
import { ethers } from "ethers";
import "../../componentsStyling/permanentDrawer.scss";
import SnackbarNotification from './Snackbar';
import LoadingButton from '@mui/lab/LoadingButton';
import { Spinner } from './Spinner';
import axios, { Method } from 'axios';
import web3 from 'web3';
import ChainContext from '../Contexts/ChainContext';
import { useTranslation } from "react-i18next";
const { BigNumber } = require("ethers");

export function Burn(): any {
    const context = useWeb3React()
    const { library, account } = context
    const [notificationState, setNotificationState] = useState({});
    const [value, setValue] = useState(1);
    const [approveBurn, setApproveBurn] = useState<boolean>(false);
    const [balanceGratherThanZero, checkBalance] = useState("");
    const [maticValue, setMaticValue] = useState<any>();
    const [totalCost, setTotalCost] = useState<any>();
    const [totalAmountOfXEN, setXENAmount] = useState<any>();
    const [loading, setLoading] = useState(false)
    const [gasLimit, setCurrentGasLimit] = useState<number>();
    const [valueAndFee, setValueAndFee] = useState<any>();
    const [totalBatchApproved, setBatchApproved] = useState<number>();
    const [maxAvailableBatch, setMaxBatch] = useState<number>(0);
    const { chain }  = useContext(ChainContext)
    const { t } = useTranslation();

    useEffect(() => {
        getAllowanceForAccount();
        estimationValues();
    }, [account]);

    useEffect(() => {
    }, [chain.deb0xAddress]);

    useEffect(() => {
        getAllowanceForAccount();
        setXENAmount(value * 2500000);
        estimationValues();
        setBalance();
    }, [value]);

    useEffect(() => {
        setBalance()
    }, [account, balanceGratherThanZero]);

    async function getAllowanceForAccount() {
        const signer = library.getSigner(0)
        const xenContract = XENCrypto(signer, chain.xenCryptoAddress);
        await xenContract.allowance(account, chain.deb0xAddress).then((amount: any) =>{
            let batchApproved = Number(ethers.utils.formatEther(amount)) / 2500000;
            setBatchApproved(Math.trunc(batchApproved));
            Number(ethers.utils.formatEther(amount)) < value * 2500000 ?
                setApproveBurn(false) :
                setApproveBurn(true)
                setBalance();
            })
   
    }

    async function setBalance() {
        setLoading(true);
        const signer = library.getSigner(0)
        const xenContract = XENCrypto(signer, chain.xenCryptoAddress);
        let number;

        await xenContract.balanceOf(account).then((balance: any) => {
            number = ethers.utils.formatEther(balance);
            setMaxBatch(Math.trunc(Number(number)/2500000))
            checkBalance(number.toString())
            setLoading(false);
        })
    }

    async function estimationValues() {
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
        const signer = library.getSigner(0)
        const deb0xContract = DBXen(signer, chain.deb0xAddress)
        await deb0xContract.getCurrentCycle().then(async (currentCycle: any) => {
            await deb0xContract.cycleTotalBatchesBurned(currentCycle).then(
                async (numberBatchesBurnedInCurrentCycle: any) => {
                    if(Number(chain.chainId) !=56 && Number(chain.chainId) != 66 && Number(chain.chainId) != 2000){
                    await axios.request(options).then((result) => {
                        if(result.data.result != undefined){
                            let price = Number(web3.utils.fromWei(result.data.result.toString(), "Gwei"));
                        let protocol_fee = value * (1 - 0.00005 * value);
                        let gasLimitVal = 0;
                        if((Number(chain.chainId)) === 1){
                            numberBatchesBurnedInCurrentCycle != 0 ?
                            gasLimitVal = (BigNumber.from("270000")) :
                            gasLimitVal = (BigNumber.from("300000"))
                        }else{
                            (Number(chain.chainId)) === 137 ?
                            numberBatchesBurnedInCurrentCycle != 0 ?
                                gasLimitVal = (BigNumber.from("350000")) :
                                gasLimitVal = (BigNumber.from("500000"))
                                :
                                numberBatchesBurnedInCurrentCycle != 0 ?
                                gasLimitVal = (BigNumber.from("500000")) :
                                gasLimitVal = (BigNumber.from("700000"))
                        }
                        setCurrentGasLimit(gasLimitVal);
                        let fee = gasLimitVal * price * protocol_fee / 1000000000;
                        let totalValue = fee + (fee / ((1 - 0.00005 * value) * value));

                        setValueAndFee({ fee: fee.toFixed(4), total: totalValue.toFixed(4) })
                        setMaticValue(fee.toFixed(4));
                        setTotalCost(totalValue.toFixed(4));
                        }
                    })
                }
                 else {
                        if(Number(chain.chainId) === 56){
                        let price = 5;
                        let protocol_fee = value * (1 - 0.00005 * value);
                        let gasLimitVal = 0;
                        numberBatchesBurnedInCurrentCycle != 0 ?
                            gasLimitVal = (BigNumber.from("350000")) :
                            gasLimitVal = (BigNumber.from("500000"))
                   
                        setCurrentGasLimit(gasLimitVal);
                        let fee = gasLimitVal * price * protocol_fee / 1000000000;
                        let totalValue = fee + (fee / ((1 - 0.00005 * value) * value));
                        setValueAndFee({ fee: fee.toFixed(4), total: totalValue.toFixed(4) })
                        setMaticValue(fee.toFixed(4));
                        setTotalCost(totalValue.toFixed(4));
                    }
                    if(Number(chain.chainId) === 2000){
                        let price = 250;
                        let protocol_fee = value * (1 - 0.00005 * value);
                        let gasLimitVal = 0;
                        numberBatchesBurnedInCurrentCycle != 0 ?
                            gasLimitVal = (BigNumber.from("350000")) :
                            gasLimitVal = (BigNumber.from("500000"))
                   
                        setCurrentGasLimit(gasLimitVal);
                        let fee = gasLimitVal * price * protocol_fee / 1000000000;
                        let totalValue = fee + (fee / ((1 - 0.00005 * value) * value));
                        setValueAndFee({ fee: fee.toFixed(5), total: totalValue.toFixed(5) })
                        setMaticValue(fee.toFixed(5));
                        setTotalCost(totalValue.toFixed(5));
                    }
                  if(Number(chain.chainId) === 66){
                    let price = 0.1;
                    let protocol_fee = value * (1 - 0.00005 * value);
                    let gasLimitVal = 0;
                    numberBatchesBurnedInCurrentCycle != 0 ?
                        gasLimitVal = (BigNumber.from("350000")) :
                        gasLimitVal = (BigNumber.from("500000"))
               
                    setCurrentGasLimit(gasLimitVal);
                    let fee = gasLimitVal * price * protocol_fee / 1000000000;
                    let totalValue = fee + (fee / ((1 - 0.00005 * value) * value));
                    setValueAndFee({ fee: fee.toFixed(5), total: totalValue.toFixed(5) })
                    setMaticValue(fee.toFixed(5));
                    setTotalCost(totalValue.toFixed(5));
                }
            }
                }
            )
        })
    }

    async function setApproval() {
        setLoading(true);
        const signer = library.getSigner(0)
        const xenContract = XENCrypto(signer, chain.xenCryptoAddress)
        let amountToApprove = 0;
            if(totalBatchApproved != undefined){
                if(value > totalBatchApproved){
                    amountToApprove = value - totalBatchApproved;
                }
            }
        try {
            const tx = await xenContract.increaseAllowance(chain.deb0xAddress, ethers.utils.parseEther(Number(amountToApprove*2500000).toString()))
            tx.wait()
                .then((result: any) => {
                    getAllowanceForAccount();
                    setNotificationState({
                        message: "Your succesfully approved contract for burn.", open: true,
                        severity: "success"
                    })
                    setLoading(false)
                })
                .catch((error: any) => {
                    setNotificationState({
                        message: "Contract couldn't be approved for burn!", open: true,
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

    async function burnXEN() {
        if(valueAndFee === undefined){
            estimationValues();
        }
        else {
            setLoading(true)
            const signer = await library.getSigner(0)
            const deb0xContract = DBXen(signer, chain.deb0xAddress)
            let gasLimitIntervalValue = gasLimit
            let currentValue = valueAndFee.fee;
  
            try {
                const overrides =
                {
                    value: ethers.utils.parseUnits(currentValue.toString(), "ether"),
                    gasLimit: gasLimitIntervalValue
                }
                const tx = await deb0xContract["burnBatch(uint256)"](value, overrides)

                await tx.wait()
                    .then((result: any) => {
                        setNotificationState({
                            message: "Burn completed",
                            open: true,
                            severity: "success"
                        })
                        getAllowanceForAccount();
                        setLoading(false)
                    })
                    .catch((error: any) => {
                        setNotificationState({
                            message: "Something went wrong!",
                            open: true,
                            severity: "error"
                        })
                        setLoading(false)
                    })
            } catch (error: any) {
                console.log(error.message)
                setNotificationState({
                    message: "You rejected the transaction.",
                    open: true,
                    severity: "info"
                })
                setLoading(false)
            }
        }
    }

    useEffect(() => {
        setTimeout(() => { setNotificationState({}) }, 2000)
    }, [notificationState])

    const handleInputChange = (e: any) => {
        if (value > 10000) {
            setValue(10000)
        } else {
            setValue(e.target.value);
        }
    }

    const incNum = () => {
        if (value < 10000)
            setValue(Number(value) + 1);
    };

    const decNum = () => {
        if (value > 1)
            setValue(value - 1);
    }

    useEffect(() => {
        if (value > 10000) {
            setValue(10000)
        }
        if (value <= 0) {
            setValue(1)
        }
    }, [value])

    return (
        <>
            <SnackbarNotification state={notificationState}
                setNotificationState={setNotificationState} />
            <div className="side-menu--bottom burn-container">
                <div className="row">
                    <p className="text-center mb-0">{t("burn.label")}</p>
                    <p className="text-center">(1 batch = 2,500,000 XEN)</p>
                </div>
                <div className="row">
                    <div className="col input-col">
                        <input type="number" value={value} max="10000" onChange={handleInputChange} />
                    </div>
                </div>
                <div className="row">
                    <button className="btn count-btn col" type="button" onClick={decNum}>-</button>
                    <button className="btn count-btn col" type="button" onClick={incNum}>+</button>
                </div>
                <div className="row">
                    <button className="btn count-btn max-btn col" type="button"
                        onClick={() => setValue(10000)}>{t("burn.max")}</button>
                </div>
                <div className="values-container">
                    <div className="value-content">
                        <p>{t("burn.protocol_fee")}:</p>
                        <p> ~{maticValue} {chain.currency}</p>
                    </div>
                    <div className="value-content">
                        <p>{t("burn.transaction_cost")}:</p>
                        <p> ~{totalCost} {chain.currency}</p>
                    </div>
                    <div className="value-content">
                        <p>{t("burn.xen_burned")}:</p>
                        <p>
                            {Number(totalAmountOfXEN).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })} XEN</p>
                    </div>
                </div>
                {approveBurn ?
                maxAvailableBatch < value ?
                    <LoadingButton className="burn-btn"
                    loadingPosition="end"
                    disabled={true}>
                    {loading ? <Spinner color={'black'} /> : "Insufficient XEN balance"}
                </LoadingButton> :
                    <LoadingButton className="burn-btn"
                        loadingPosition="end"
                        onClick={() => burnXEN()} >
                        {loading ? <Spinner color={'black'} /> : t("burn.burn_button")}
                    </LoadingButton> :
                    balanceGratherThanZero === '0.0' || balanceGratherThanZero === '0' ?
                        <LoadingButton className="burn-btn"
                            loadingPosition="end"
                            disabled={balanceGratherThanZero === '0.0' || balanceGratherThanZero === '0'}>
                            {loading ? <Spinner color={'black'} /> : t("burn.balance")}
                        </LoadingButton> :
                        <LoadingButton className="burn-btn"
                            loadingPosition="end"
                            disabled={balanceGratherThanZero === '0.0' || balanceGratherThanZero === '0'}
                            onClick={() => setApproval()} >
                            {loading ? <Spinner color={'black'} /> : t("burn.approve_button")}
                        </LoadingButton>
                }
            </div>
        </>
    )
}
