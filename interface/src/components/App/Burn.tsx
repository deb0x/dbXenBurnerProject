import { useState, useEffect } from 'react';
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
const { BigNumber } = require("ethers");

const deb0xAddress = "0x4F3ce26D9749C0f36012C9AbB41BF9938476c462";
const xenCryptoAddress = "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e";

export function Burn(): any {
    const context = useWeb3React()
    const { library, account } = context
    const [notificationState, setNotificationState] = useState({});
    const [value, setValue] = useState(1);
    const [approveBrun, setApproveBurn] = useState<boolean>();
    const [balanceGratherThanZero, checkBalance] = useState("");
    const [maticValue, setMaticValue] = useState<any>();
    const [totalCost, setTotalCost] = useState<any>();
    const [totalAmountOfXEN, setXENAmount] = useState<any>();
    const [loading, setLoading] = useState(false)

    useEffect( () => {
        setApproveBurn(false)
    }, [account]);

    useEffect( () => {
        setApproveBurn(false);
        getCurrentGasLimit().then(async (data) => {
            estimationValue(data).then(async (resut) =>{
            setMaticValue(resut.fee);
            })
        })
    },[value]);

    useEffect( () => {
        setApproveBurn(false);
        getCurrentGasLimit().then(async (data) => {
            estimationValue(data).then(async (resut) =>{
                setTotalCost(resut.total);
            })
        })
    },[value]);

    useEffect( () => {
        setXENAmount(value*2500000);
    },[value]);

    useEffect(() => {
        setBalance()
    }, [account,balanceGratherThanZero]);

    async function setBalance(){
        setLoading(true);
        const signer = await library.getSigner(0)
        const xenContract = await XENCrypto(signer, xenCryptoAddress);
        let number;

        await xenContract.balanceOf(account).then((balance: any) => {
            number = ethers.utils.formatEther(balance);
            checkBalance(number.toString()) 
            setLoading(false);
        })
    }

    async function getCurrentPrice(){
        let method: Method = 'POST';
        const options = {
            method: method,
            url: 'https://polygon-mainnet.infura.io/v3/6010818c577b4531b1886965421a91d3 ',
            port: 443,
            headers: {
                'Content-Type': 'application/json'
              },
            data: JSON.stringify({
                "jsonrpc":"2.0","method":"eth_gasPrice","params": [],"id":1
              })
        };

        let requestValue = await axios.request(options)
        return web3.utils.fromWei(requestValue.data.result.toString(), "Gwei")
    }

    async  function estimationValue(gasLimitIntervalValue: number){
        let price = Number(await getCurrentPrice());
        let protocol_fee = value *(1 - 0.00005*value) ;
        let fee = gasLimitIntervalValue * price * protocol_fee / 1000000000;
        let totalValue = fee +(fee /((1- 0.00005*value) * value));
        let obj = {fee:fee.toFixed(4), total:totalValue.toFixed(4)}
        return obj;
    }
    
    async function getCurrentGasLimit(){
        const signer = await library.getSigner(0)
        const deb0xContract = DBXen(signer, deb0xAddress)
        let currentCycle = await deb0xContract.getCurrentCycle();
        let numberBatchesBurnedInCurrentCycle;
        let batchBurned = 0;

        numberBatchesBurnedInCurrentCycle = await deb0xContract.cycleTotalBatchesBurned(currentCycle);
        batchBurned =numberBatchesBurnedInCurrentCycle.toNumber();
        
        let gasLimitIntervalValue;
            if(batchBurned != 0)
                gasLimitIntervalValue = BigNumber.from("130000");
                    else
                gasLimitIntervalValue = BigNumber.from("400000");
        return gasLimitIntervalValue;
    }

    async function setApproval() {
        setLoading(true);
        const signer = await library.getSigner(0)
        const xenContract = await XENCrypto(signer, xenCryptoAddress)
        let totalAmountToBurn = value * 2500000;
        try {
            const tx = await xenContract.approve(deb0xAddress, ethers.utils.parseEther(totalAmountToBurn.toString()))
            tx.wait()
                .then((result: any) => {
                    setApproveBurn(true);
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

    async function burnXEN(){
        setLoading(true)
        const signer = await library.getSigner(0)
        const deb0xContract = DBXen(signer, deb0xAddress)
        let gasLimitIntervalValue = await getCurrentGasLimit();
        let currentValue = (await estimationValue(gasLimitIntervalValue)).fee;
        try {
            const overrides = 
                { value: ethers.utils.parseUnits(currentValue.toString(), "ether"),
                    gasLimit:gasLimitIntervalValue }
            const tx = await deb0xContract["burnBatch(uint256)"](value,overrides)

            await tx.wait()
                .then((result: any) => {
                    setNotificationState({
                        message: "Burn completed",
                        open: true,
                        severity: "success"
                    })
                    setLoading(false)
                    setApproveBurn(false)
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

    useEffect(() => {
        setTimeout(() => {setNotificationState({})}, 2000)
    }, [notificationState])

    const handleInputChange = (e: any)=>{
        if(value > 10000) {
            setValue(10000)
        } else {
            setValue(e.target.value);
        }
    }

    const incNum = () => {
        if(value < 10000)
            setValue(Number(value)+1);
    };

    const decNum = () => {
        if(value > 1)
            setValue(value - 1);
    }

    useEffect(() => {
        if (value > 10000) {
            setValue(10000)
        }
        if (value <= 0 ) {
            setValue(1)
        }
    }, [value])
    
    return (
        <>
            <SnackbarNotification state={notificationState} 
                    setNotificationState={setNotificationState} />
            <div className="side-menu--bottom burn-container">
                <div className="row">
                    <p className="text-center mb-0">Choose the number of XEN batches you want to burn</p>
                    <p className="text-center">(1 batch = 2 500 000 XEN)</p>
                </div>
                <div className="row">
                    <div className="col input-col">
                        <input type="number" value={value} max="10000" onChange={handleInputChange}/>
                    </div>
                </div>
                <div className="row">
                    <button className="btn count-btn col" type="button" onClick={decNum}>-</button>
                    <button className="btn count-btn col" type="button" onClick={incNum}>+</button>
                </div>
                <div className="row">
                    <button className="btn count-btn max-btn col" type="button" 
                        onClick={() => setValue(10000)}>MAX</button>
                </div>
                <div className="values-container">
                    <div className="value-content">
                        <p>Protocol Fee:</p>
                        <p> ~{maticValue} MATIC</p>
                    </div>
                    <div className="value-content">
                        <p>Total transaction cost:</p>
                        <p> ~{totalCost} MATIC</p>
                    </div>
                    <div className="value-content">
                        <p>Total XEN burned:</p>
                        <p> {totalAmountOfXEN} XEN</p>
                    </div>
                </div>
                {approveBrun ?
                    <LoadingButton className="burn-btn" 
                        loadingPosition="end"
                        onClick={() => burnXEN()} >
                            {loading ? <Spinner color={'black'} /> : "Burn XEN" }
                    </LoadingButton> :
                    balanceGratherThanZero === '0.0' ||  balanceGratherThanZero === '0' ? 
                    <LoadingButton className="burn-btn" 
                        loadingPosition="end"
                        disabled={ balanceGratherThanZero === '0.0' ||  balanceGratherThanZero === '0'}>
                            {loading ? <Spinner color={'black'} /> : "Your balance is 0!" }
                    </LoadingButton> :
                    <LoadingButton className="burn-btn" 
                        loadingPosition="end"
                        disabled={  balanceGratherThanZero === '0.0' ||  balanceGratherThanZero === '0'}
                        onClick={() => setApproval()} >
                            {loading ? <Spinner color={'black'} /> : "Approve Burn XEN" }
                    </LoadingButton>
                }
            </div>
        </>
    )
}
