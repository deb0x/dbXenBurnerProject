import React, { useState, useEffect, useContext } from 'react';
import { useWeb3React } from '@web3-react/core';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { injected } from '../../connectors';
import Deb0xERC20 from "../../ethereum/deb0xerc20"
import XENCrypto from '../../ethereum/XENCrypto';
import Deb0x from "../../ethereum/deb0x"
import { ethers } from "ethers";
import "../../componentsStyling/permanentDrawer.scss";
import ScreenSize from '../Common/ScreenSize';
import SnackbarNotification from './Snackbar';
import LoadingButton from '@mui/lab/LoadingButton';
const { BigNumber } = require("ethers");


const deb0xAddress = "0xfDd1715C5ee0d16e8C1667CF56E8D37a77E8220F";
const xenCryptoAddress = "0x2AB0e9e4eE70FFf1fB9D67031E44F6410170d00e";
const deb0xERC20Address = "0x22c3f74d4AA7c7e11A7637d589026aa85c7AF88a";

declare global {
    interface Window {
        ethereum: any;
    }
}

export function PermanentDrawer(props: any): any {
    const context = useWeb3React()
    const { connector, library, chainId, account } = context
    const [activatingConnector, setActivatingConnector] = useState<any>()
    const [ensName, setEnsName] = useState<any>("");
    const [userUnstakedAmount,setUserUnstakedAmount] = useState<any>(0);
    const dimensions = ScreenSize();
    const [notificationState, setNotificationState] = useState({});
    const [networkName, setNetworkName] = useState<any>();
    const [value, setValue] = useState(1);
    const [approveBrun, setApproveBurn] = useState<boolean>();

    const [loading, setLoading] = useState(false)

    if(library){
        setUnstakedAmount();
    }

    useEffect(() => {
        injected.supportedChainIds?.forEach(chainId => 
            setNetworkName((ethers.providers.getNetwork(chainId).name)));
        if (activatingConnector && activatingConnector === connector) {
            setActivatingConnector(undefined)
        }
    }, [activatingConnector, connector])

    async function setApproval() {
        const signer = await library.getSigner(0)
        const xenContract = await XENCrypto(signer, xenCryptoAddress)
        let totalAmountToBurn = value * 1;
        try {
            const tx = await xenContract.approve(deb0xAddress, ethers.utils.parseEther(totalAmountToBurn.toString()))
            tx.wait()
                .then((result: any) => {
                    setApproveBurn(true);
                    setNotificationState({
                        message: "Your succesfully approved contract for staking.", open: true,
                        severity: "success"
                    })
                    setLoading(false)

                })
                .catch((error: any) => {
                    console.log(error)
                    setNotificationState({
                        message: "Contract couldn't be approved for staking!", open: true,
                        severity: "error"
                    })
                    setLoading(false)
                })
        } catch (error) {
            console.log(error)

            setNotificationState({
                message: "You rejected the transaction. Contract hasn't been approved for staking.", open: true,
                severity: "info"
            })
            setLoading(false)
        }
    }

    async function burnXEN(){
        const signer = await library.getSigner(0)

        const deb0xContract = Deb0x(signer, deb0xAddress)

        let gasLimitIntervalValue = BigNumber.from("10000000");
        let firstValue =  "0.1";

        if(value > 99 && value < 200){
             gasLimitIntervalValue = BigNumber.from("20000000");
             firstValue =  "0.2";
        }

        if(value > 199 && value < 300){
            gasLimitIntervalValue = BigNumber.from("30000000");
            firstValue =  "0.3";
       }

       if(value > 299 && value < 400){
        gasLimitIntervalValue = BigNumber.from("40000000");
        firstValue =  "0.4";
        }

        if(value > 399 && value < 513){
            gasLimitIntervalValue = BigNumber.from("50000000");
            firstValue =  "0.5";
        }

        try {
            const overrides = 
                { value: ethers.utils.parseUnits(firstValue, "ether"),
                    gasLimit:gasLimitIntervalValue }
            const tx = await deb0xContract["burnBatch(uint256,address,uint256,uint256)"](value,
                ethers.constants.AddressZero,
                0,
                0,
                overrides)

            await tx.wait()
                .then((result: any) => {
                    setNotificationState({
                        message: "Message was succesfully sent.",
                        open: true,
                        severity: "success"
                    })
                })
                .catch((error: any) => {
                    console.log(error)
                    setNotificationState({
                        message: "Message couldn't be sent!",
                        open: true,
                        severity: "error"
                    })
                })
            } catch (error: any) {
                console.log(error)
                setNotificationState({
                    message: "You rejected the transaction. Message was not sent.",
                    open: true,
                    severity: "info"
                })
            }
    }

    
    async function setUnstakedAmount() {
        const deb0xERC20Contract = Deb0xERC20(library, deb0xERC20Address)
        if(account){
            const balance = await deb0xERC20Contract.balanceOf(account)
            setUserUnstakedAmount(ethers.utils.formatEther(balance))
        }
    }

    useEffect(() => {
        setUnstakedAmount();
    }, [userUnstakedAmount])

    useEffect(() => {
        setTimeout(() => {setNotificationState({})}, 2000)
    }, [notificationState])

    const handleInputChange = (e: any)=>{
        if(value > 1000000) {
            setValue(1000000)
        } else {
            setValue(e.target.value);
        }
    }

    const incNum = () => {
        if(value < 1000000)
            setValue(Number(value)+1);
    };

    const decNum = () => {
        if(value > 1)
            setValue(value - 1);
    }

    return (
        <>
            <SnackbarNotification state={notificationState} 
                setNotificationState={setNotificationState} />
            <Box className="side-menu-box" sx={{ display: 'flex' }}>
                <Drawer variant="permanent"
                    anchor={dimensions.width > 768 ? 'left' : 'bottom'}
                    className="side-menu">
                    <div className="image-container">
                        <div className="img"></div>
                    </div>
                    <div className="side-menu--bottom burn-container">
                        <div className="row">
                            <p>
                            Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
                            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
                            when an unknown printer took a galley of type and scrambled it to make a type specimen book.  
                            </p>
                        </div>
                        <div className="row">
                            <div className="col input-col">
                                <input type="number" value={value} max="1000000" onChange={handleInputChange}/>
                            </div>
                        </div>
                        <div className="row">
                            <button className="btn count-btn col" type="button" onClick={decNum}>-</button>
                            <button className="btn count-btn col" type="button" onClick={incNum}>+</button>
                        </div>
                        <div className="row">
                            <button className="btn count-btn max-btn col" type="button" 
                                onClick={() => setValue(1000000)}>MAX</button>
                        </div>
                        {approveBrun ?
                            <LoadingButton className="burn-btn" 
                                loading={loading} 
                                loadingPosition="end"
                                onClick={() => burnXEN()} >
                                    Burn XEN
                            </LoadingButton> :
                            <LoadingButton className="burn-btn" 
                                loading={loading} 
                                loadingPosition="end"
                                onClick={() => setApproval()} >
                                    Approve Burn XEN
                            </LoadingButton>
                        }
                        
                    </div>
                </Drawer>
            </Box>
        </>
    );
}