import { useState, useEffect, useContext, createContext } from 'react';
import { useWeb3React } from '@web3-react/core';
import Deb0x from "../../ethereum/deb0x"
import { ethers } from "ethers";
import { getKeyMoralis,fetchMessageSendersMoralis, fetchMessagesMoralis} from '../../ethereum/EventLogsMoralis.js';
import {
    Tooltip, List, ListItem, ListItemText, ListItemButton, Typography, Box, 
    CircularProgress,
    Button,
    Modal
} from '@mui/material';
import Stepper from './Stepper'
import IconButton from "@mui/material/IconButton";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Pagination from "@mui/material/Pagination";
import RefreshIcon from '@mui/icons-material/Refresh';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import axios from 'axios';
import formatAccountName from "../Common/AccountName";
import "../../componentsStyling/decrypt.scss"
import { Add, CompressOutlined, ConstructionOutlined } from '@mui/icons-material';
import { Announcement } from '@mui/icons-material';
import ContactsSetter from '../ContactsSetter';
import lock from '../../photos/lock.svg';
import airplane from '../../photos/airplane.svg';
import users from '../../photos/users.svg';
import hand from '../../photos/hand.svg';
import avatar from '../../photos/icons/avatars/test-avatar-1.svg';
import ReadedMessagesContext from '../Contexts/ReadedMessagesContext';
import ReadedMessagesProvider from '../Contexts/ReadedMessagesProvider';
import { Encrypt } from './Encrypt';
import useAnalyticsEventTracker from '../Common/GaEventTracker';

const deb0xAddress = "0xA06735da049041eb523Ccf0b8c3fB9D36216c646";

export function Decrypt(props: any): any {
    const { account, library } = useWeb3React()
    const [loading, setLoading] = useState(true)
    const [encryptionKeyInitialized, setEncryptionKeyInitialized] = 
        useState<boolean|undefined>(undefined);
    const [decrypted, setDecrypted] = useState<any>();
    const savedContacts = JSON.parse(localStorage.getItem('contacts') || 'null'); 
    const gaEventTracker = useAnalyticsEventTracker('Decrypt');
    const gaContactTracker = useAnalyticsEventTracker('Decrypt');

    useEffect(() => {
        setLoading(true)
        getPublicEncryptionKey()
    }, [account]);

    const getPublicEncryptionKey = async () => {      
        const key = await getKeyMoralis(account).then((result: any) => { 
            result !== '' ? props.checkIfInit(true) : props.checkIfInit(false);
            
            return result
        });
        const initialized = (key != '') ? true : false
        setEncryptionKeyInitialized(initialized);
    }

    async function decrypt(encryptedMessage: any) {
        try {
            const decryptedMessage = await library.provider.request({
                method: 'eth_decrypt',
                params: [encryptedMessage, account],
            });
            gaEventTracker('Success: message decrypted');
            return decryptedMessage
        } catch (error) {
            gaEventTracker('Rejected: message decrypted');
            return undefined
        }
    }

    async function fetchMessage(message: any) {
        return await axios.get(`https://deb0x-test.infura-ipfs.io/ipfs/${message}`)
    }

    function Message(props: any) {
        const { chainId } = useWeb3React()
        const encryptMessage = props.message.fetchedMessage.data
        const [message, setMessage] =
            useState(props.message.fetchedMessage.data)
        const [ensName,setEnsName] = useState("");
        //const [sender, setSender] = useState(props.messsage.sender)
        const [messageTime, setMessageTime] = useState(props.message.timestamp)
        const [isDecrypted, setIsDecrypted] = useState(false);
        const min = 1;
        const max = 50;
        const [randomImage] = useState<number>(Math.floor(Math.random() * (max - min + 1)) + min);
        let [show, setShow] = useState(false);
        const [isReaded, setIsReaded] = useState(false);
        
        const useMessages = () => useContext(ReadedMessagesContext)
        const {readed, setReaded} = useMessages()!;

        useEffect(()=>{
            checkENS();
        },[])

        const addMessage = () => {
            let messageList = JSON.parse(localStorage.getItem('messages') || 'null');
            if(!messageList.includes(message)) {
                readed.push(message);
                setReaded([...readed]);
            }
        }

        useEffect(() => {
            localStorage.setItem('messages', JSON.stringify(readed));
            checkMessageInLocalStorage();
        })

        const checkMessageInLocalStorage = () => {
            let messageList = JSON.parse(localStorage.getItem('messages') || 'null');
            messageList.map((element: any) => {
                if (element === message)
                    setIsReaded(true);
            })
        }

        useEffect(()=>{
            if(props.index !== props.previousIndex && isDecrypted===true){
                hideMessage();
            }

        },[props.previousIndex])


        async function checkENS() {
            if(chainId !=137){
                let name = await library.lookupAddress(props.message.sender);
                if(name !== null) {   
                    setEnsName(name);
                }
            }
        }

        async function decryptMessage() {
            const decryptedMessage = await decrypt(message)
            
            if(decryptedMessage) {
                setMessage(decryptedMessage);
                setIsDecrypted(true);
                props.setPreviousIndex(props.index);
            }

            checkMessageInLocalStorage();
        }

        async function hideMessage() {
            setMessage(encryptMessage);
            setIsDecrypted(false);
        }

        function checkSenderInLocalStorage(sender: any) {
            let user: any;

            if (ensName !== "") {
                user = ensName;
            } else {
                savedContacts.map((contact: any) => {
                    if (sender == (contact.address).toLowerCase()) {
                        user = true;
                    }
                })
            }

           return user;
        }


        return (
            <ReadedMessagesProvider>
                <ListItem
                    disablePadding 
                    key={props.index}    
                    secondaryAction={ 
                        <IconButton className={`${
                                (message !== props.message.fetchedMessage.data) ? 
                                "list-item-btn" : ""}`
                            }  
                            onClick={()=>{hideMessage()}}  
                            edge="end" 
                            aria-label="comments">
                            { (message !== props.message.fetchedMessage.data) ? 
                                <VisibilityOffIcon className='visibility-icon' /> : null
                            }
                        </IconButton>  
                    }
                    className={`messages-list-item card ${isReaded ? "read" : "unread"}` }>
                    <ListItemButton 
                        className={`list-item-button ${isDecrypted ? "active" : ""}` }
                        onClick={() => {
                            if(message === props.message.fetchedMessage.data) {
                                decryptMessage()
                            }
                            addMessage();
                        }}>
                        <div>
                            <img width="58px" height="58px" src={require(`../../photos/icons/avatars/animal-${randomImage}.svg`).default} alt="avatar"/>
                        </div>
                        <ListItemText primary={
                            <>
                                <div className="message-left">
                                    <div className="message-heading">
                                        <p>From: 
                                            {
                                                checkSenderInLocalStorage(props.message.sender) ?
                                                savedContacts.filter((contact: any) => props.message.sender == (contact.address).toLowerCase())
                                                    .map((filteredPerson: any) => (
                                                        filteredPerson.name
                                                    )) :
                                                    formatAccountName(
                                                        props.message.sender
                                                    )
                                            }
                                        </p>
                                        <p className="time-stamp">
                                            {messageTime}
                                        </p>
                                    </div>
                                    <div className="message-container">
                                        <p className="message message-overflow"
                                            dangerouslySetInnerHTML={{ __html: message }} />
                                        <Announcement className="new-message-icon" />
                                    </div>
                                </div>
                                
                            </> 
                        }/>
                    </ListItemButton>
                    {isDecrypted ? 
                        <div className="message-right inbox">
                            <div className="message-right--container">
                                <div className="message-heading">
                                    <div className="address">
                                        <p>From: 
                                            <strong>
                                            {
                                                checkSenderInLocalStorage(props.message.sender) ?
                                                    savedContacts.filter((contact: any) => props.message.sender == (contact.address).toLowerCase())
                                                        .map((filteredPerson: any) => (
                                                            filteredPerson.name
                                                        )) :
                                                        formatAccountName(
                                                            props.message.sender
                                                        )
                                            }
                                            </strong>
                                        </p>
                                        <>
                                            {!checkSenderInLocalStorage(props.message.sender) ? 
                                                <IconButton onClick={() => {
                                                    setShow(true); 
                                                    gaContactTracker("New contact from message");
                                                }}>
                                                    <Add />
                                                </IconButton> :
                                                <></>
                                            }
                                            
                                            <ContactsSetter show={show} props={props.message.sender} 
                                                onClickOutside={() => setShow(false)}/>
                                        </>
                                    </div>
                                    <p className="time-stamp">
                                        <small>
                                            {messageTime}
                                        </small>
                                    </p>
                                </div>
                                <p className="message" 
                                    dangerouslySetInnerHTML={{ __html: message }} />
                                <Encrypt props={props.message.sender}/>
                            </div>
                        </div> : 
                        <></> 
                    }
                </ListItem>
            </ReadedMessagesProvider>
        )
    }

    function GetMessages() {
        const [fetchedMessages, setFetchedMessages] = useState<any>([])
        const [sortedMessages, setSortedMessages] = useState<any>([])
        const [previousIndex, setPreviousIndex] = useState<number>();

        useEffect(() => {
            processMessages()
        }, []);

        async function processMessages() {
            const deb0xContract = Deb0x(library, deb0xAddress)
            const senderAddresses = 
                await fetchMessageSendersMoralis(account);
                if(senderAddresses.length!=0){
            const cidsPromises = 
                senderAddresses.map(async function(sender:any) {
                    return { 
                        cids: await fetchMessagesMoralis(account,sender),
                        sender: sender
                    }
                })
            const cids = await Promise.all(cidsPromises)
            const encryptedMessagesPromisesArray = 
                cids.map(async function(cidArray: any) {
                    const encryptedMessagesPromises = 
                        cidArray.cids.map(async function (cid: any) {
                            const unixTimestamp = cid.timestamp.toString()
                            const milliseconds = unixTimestamp * 1000 

                            const dateObject = new Date(milliseconds)

                            const humanDateFormat = dateObject.toLocaleString()
                            return { 
                                fetchedMessage: await fetchMessage(cid.content),
                                sender: cidArray.sender,
                                timestamp: humanDateFormat
                            }
                        })
                    const promise = await Promise.all(encryptedMessagesPromises)
                       
                    return promise
                })

            const encryptedMessages = await Promise.all(encryptedMessagesPromisesArray)
            const sortedEncryptedMessages = encryptedMessages?.flat();
            let sendersArray:any[] = [];
            let timestampArray:any[] = [];
            let transactions:any[] = [];
            let index = 0;
            sortedEncryptedMessages.forEach(element =>{
                if(sendersArray.length ==0 ){
                    sendersArray[index] = element.sender;
                    timestampArray[index] = element.timestamp;
                    transactions.push(element);
                    index++;
                } else {
                    let ok= 1;
                for(let i=0;i<sendersArray.length;i++){
                    if(sendersArray[i] == element.sender && timestampArray[i] == element.timestamp){
                        ok=0;
                    } 
                }
                if(ok==1){
                    sendersArray[index] = element.sender;
                    timestampArray[index] = element.timestamp;
                    transactions.push(element);
                    index++;
               }
                }
            })
            setFetchedMessages(transactions)
            setSortedMessages(transactions)
            setLoading(false)
        } else {
            setFetchedMessages([])
            setSortedMessages([])
            setLoading(false)
        }
        }

        if(!loading) {
            if (sortedMessages.length === 0) {
                return (
                    <div className='clouds'>
                        <div className="cloudOne">
                            <img src={require(`../../photos/icons/clouds/cloud-2.svg`).default} alt="cloud-1" />
                        </div>
                        <div className="cloudTwo">
                            <img src={require(`../../photos/icons/clouds/cloud-1.svg`).default} alt="cloud-2" />
                        </div>
                        <div className="cloudThree">
                            <img src={require(`../../photos/icons/clouds/cloud-3.svg`).default} alt="cloud-3" />
                        </div>
                        <div className="cloudText">
                            Cloudy with a chance of messages
                        </div>
                    </div>
                )
            } else {
                return (
                    <div className="row messages-list">
                        <List className="col-md-4 col-sm-12">
                            <Box className="pagination" sx={{display:"flex"}}>
                                <Pagination count={1} />
                                <IconButton size="large" onClick={()=> setLoading(true) }>
                                    <RefreshIcon fontSize="large"/>
                                </IconButton>
                            </Box>
                            {sortedMessages.map((message: any, i: any) => {
                                return (
                                    <Message message={message} index={i} 
                                        key={i} previousIndex={previousIndex} 
                                        setPreviousIndex={setPreviousIndex} />
                                )
                            })}
                        </List>
                        <Box className="corner-image col-md-8">
                            <div>
                                
                            </div>
                        </Box>
                    </div>
                )
            }
        } else {
            return (
                <div className="spinner">
                    <CircularProgress/>
                </div>
            )
        }
    }
    
    if (encryptionKeyInitialized === true) {
        return (
            <div className="content-box">
                <GetMessages />
            </div>
        )
    } else if (encryptionKeyInitialized === false) {
        return (
            <Stepper onDeboxInitialization={getPublicEncryptionKey}/>
        )
    } else {
        return(
            <div className="spinner">
                <CircularProgress/>
            </div>
        )
    }
}