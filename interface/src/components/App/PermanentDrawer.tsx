import React, { useState, useEffect, useContext } from 'react';
import { useWeb3React } from '@web3-react/core';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { injected } from '../../connectors';
import Deb0xERC20 from "../../ethereum/deb0xerc20"
import { ethers } from "ethers";
import "../../componentsStyling/permanentDrawer.scss";
import ScreenSize from '../Common/ScreenSize';
import SnackbarNotification from './Snackbar';
import LoadingButton from '@mui/lab/LoadingButton';

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
                                onClick={() => console.log("Burn XEN: " + value)} >
                                    Burn XEN
                            </LoadingButton> :
                            <LoadingButton className="burn-btn" 
                                loading={loading} 
                                loadingPosition="end"
                                onClick={() => console.log("Approve Burn XEN: " + value)} >
                                    Approve Burn XEN
                            </LoadingButton>
                        }
                        
                    </div>
                </Drawer>
            </Box>
        </>
    );
}