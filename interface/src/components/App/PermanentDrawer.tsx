import React, { useState, useEffect, useContext } from 'react';
import { useWeb3React } from '@web3-react/core';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/Delete';
import add from '../../photos/icons/ios-compose.svg';
import trophy from '../../photos/icons/trophy.svg';
import coins from '../../photos/icons/coins-solid.svg';
import users from '../../photos/icons/users-solid.svg';
import Button from '@mui/material/Button'
import Popper from '@mui/material/Popper'
import { injected } from '../../connectors';
import { Spinner } from './Spinner'
import { useEagerConnect } from '../../hooks';
import IconButton from "@mui/material/IconButton";
import { faDiscord, faTwitter, faGithub } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import Deb0xERC20 from "../../ethereum/deb0xerc20"
import { ethers } from "ethers";
import "../../componentsStyling/permanentDrawer.scss";
import ThemeSetter from '../ThemeSetter';
import ScreenSize from '../Common/ScreenSize';
import ContactsContext from '../Contexts/ContactsContext';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SnackbarNotification from './Snackbar';
import { Add } from '@mui/icons-material';
import ContactsSetter from '../ContactsSetter';
import useAnalyticsEventTracker from '../Common/GaEventTracker';

const deb0xERC20Address = "0x22c3f74d4AA7c7e11A7637d589026aa85c7AF88a";

enum ConnectorNames { Injected = 'Injected' };

const connectorsByName: { [connectorName in ConnectorNames]: any } = {
    [ConnectorNames.Injected]: injected
}

declare global {
    interface Window {
        ethereum: any;
    }
}

export function PermanentDrawer(props: any): any {
    const context = useWeb3React()
    const { connector, library, chainId, account, activate, deactivate, active, error } = context
    const [activatingConnector, setActivatingConnector] = useState<any>()
    const triedEager = useEagerConnect()
    const [selectedIndex, setSelectedIndex] = useState<any>(6);
    const [searchBarValue, setSearchBarValue] = useState<any>("search");
    const [ensName, setEnsName] = useState<any>("");
    // const [balance, setBalance] = useState<any>("8.13");
    const [userUnstakedAmount,setUserUnstakedAmount] = useState<any>(0);
    const menuItems = ['Compose', 'Deb0x', 'Stake', 'Sent', 'Mint', 'DBX Yellow pages'];
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const id = open ? 'simple-popper' : undefined;
    const dimensions = ScreenSize();
    const useContacts = () => useContext(ContactsContext);
    const { contacts, setContacts } = useContacts()!;
    const [notificationState, setNotificationState] = useState({});
    const [networkName, setNetworkName] = useState<any>();
    let errorMessage;
    let [show, setShow] = useState(false);
    const gaEventTracker = useAnalyticsEventTracker('Add Contact');

    if(library){
        // checkENS();
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

    async function checkENS(){
        if(chainId !=137){
            var name = await library.lookupAddress(account);
            if(name !== null)
            {   
                setEnsName(name);
            }
        }
    }

    useEffect(() => {
        setUnstakedAmount();
    },[userUnstakedAmount])

    function handleClick (event: React.MouseEvent<HTMLElement>) {
        setAnchorEl(anchorEl ? null : event.currentTarget);
    };

    function handleChange(text: any, index: any) {
        setSelectedIndex(index)
        props.onChange(text)
        if(index !== 0)
            localStorage.removeItem('input')
    }

    function deleteContact(index: any) {
        const contactsList = contacts.filter((_, i) => i !== index);
        setContacts(contactsList);
    }

    const [display, setDisplay] = useState();

    function getErrorMessage(error: string) {
        errorMessage = error;
        return errorMessage;
    }

    useEffect(() => {
        setTimeout(() => {setNotificationState({})}, 2000)
    }, [notificationState])

    return (
        <>
            {/* <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {!!errorMessage && 
                    <p className='alert alert-danger position-fixed' style={{ marginTop: '4rem', marginBottom: '0' }}>
                        {getErrorMessage(errorMessage)}
                    </p>
                }
            </div> */}
            <SnackbarNotification state={notificationState} 
                setNotificationState={setNotificationState} />
            <Box className="side-menu-box" sx={{ display: 'flex' }}>
                <Drawer variant="permanent"
                    anchor={dimensions.width > 768 ? 'left' : 'bottom'}
                    className="side-menu">
                    <div className="image-container" 
                        onClick={() => handleChange("Home", 4)}>
                        <div className="img"></div>
                    </div>
                    { account  && 
                        <List className="menu-list">
                            {menuItems.map((text, index) => (
                                <>
                                    <ListItem button key={text} 
                                        selected={selectedIndex === index} 
                                        onClick={() => handleChange(text, index)}
                                        className={`list-item ${index === 0 ? "send-item" : ""}` }>
                                        
                                        <ListItemIcon className="icon" >
                                            {index === 0 && <img src={add} />}
                                            {index === 1 && <InboxIcon />} 
                                            {index === 2 && <img src={trophy} />}
                                            {index === 3 && <SendIcon className="sent-icon-color"/>}
                                            {index === 4 && <img src={coins} />}
                                            {index === 5 && <img src={users} />}
                                        </ListItemIcon>
                                        <ListItemText className="text" primary={text} />
                                    </ListItem>
                                </>
                            ))}
                        </List>
                    }
                    
                    <div className="side-menu--bottom">
                        { (account && props.walletInitialized) && 
                            <div className="contacts">
                                <List>
                                    {contacts.map((contact: any, index: any) => (
                                        <ListItem button key={contact.name}>
                                            <ListItemText className="text" primary={contact.name}/>
                                            <div className="col-4 buttons">
                                                <IconButton size="small"
                                                    onClick={() => {
                                                            navigator.clipboard.writeText(contact.address);
                                                            setNotificationState({
                                                                message: "Address added to clipboard.",
                                                                open: true,
                                                                severity: "success"
                                                            })
                                                        }}>
                                                    <ContentCopyIcon className="copy-icon" fontSize="small"/>
                                                </IconButton>
                                                <IconButton size="small"
                                                    onClick={() => {
                                                        // setNotificationState({})
                                                        localStorage.setItem("input", JSON.stringify(contact.address));
                                                        if (document.querySelector(".editor")) {
                                                            (document.querySelector(".editor") as HTMLElement).click();
                                                        } else {
                                                            handleChange("Compose", 0)
                                                        }
                                                    }}>
                                                    <SendIcon className="send-icon" fontSize="small"/>
                                                </IconButton>
                                                <IconButton size="small"
                                                    onClick={() => {
                                                        deleteContact(index)
                                                    }}>
                                                    <DeleteIcon className="delete-icon" fontSize="small"/>
                                                </IconButton>
                                            </div>
                                        </ListItem>
                                    ))}
                                </List>
                                <>
                                    <IconButton className='add-new-all' onClick={() => {setShow(true); gaEventTracker('New contact menu');}}>
                                        <Add className="add-button"/>
                                        <p className='add-new mb-0'>Add new</p>
                                    </IconButton>
                                    {show ? 
                                        <ContactsSetter show={show} onClickOutside={() => setShow(false)}/> : 
                                        <></>
                                    }    
                                </>
                            </div>
                        }
                        <div className="content">
                            <div className="social-media">
                                <a href="https://mobile.twitter.com/deb0xDAO" target="_blank" className="logo-text-color">
                                    <FontAwesomeIcon icon={faTwitter} size="xl"/>
                                </a>
                                <a href="https://discord.com/invite/btejt3kUcN" target="_blank" className="logo-text-color">
                                    <FontAwesomeIcon icon={faDiscord} size="xl"/>
                                </a>
                                <a href="https://github.com/deb0x" target="_blank" className="logo-text-color">
                                    <FontAwesomeIcon icon={faGithub} size="xl"/>
                                </a>
                            </div>
                            <a href="https://www.deb0x.org" target="_blank" className='logo-text-color'>
                                www.deb0x.org
                            </a>
                        </div>
                    </div>
                </Drawer>
            </Box>
        </>
    );
}