import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import Deb0x from "../../ethereum/deb0x"
import {
    List, ListItem, Chip,
    ListItemText, ListItemButton, 
    Box, CircularProgress, Stack
} from '@mui/material';
import Stepper from './Stepper'
import IconButton from "@mui/material/IconButton";
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Pagination from "@mui/material/Pagination";
import RefreshIcon from '@mui/icons-material/Refresh';
import '../../componentsStyling/decrypt.scss';
import formatAccountName from '../Common/AccountName';
import cloud1 from '../../photos/icons/clouds/cloud-1.svg';
import cloud2 from '../../photos/icons/clouds/cloud-2.svg';
import cloud3 from '../../photos/icons/clouds/cloud-3.svg';
import {fetchSentMessagesMoralis,getKeyMoralis} from '../../ethereum/EventLogsMoralis.js';;

const axios = require('axios')
const deb0xAddress = "0xA06735da049041eb523Ccf0b8c3fB9D36216c646";

export function Sent(props: any): any {
    const { account, library } = useWeb3React()
    const [loading, setLoading] = useState(true)
    const [encryptionKeyInitialized, setEncryptionKeyInitialized] = useState<boolean|undefined>(undefined)
    const [messageSent, setmessageSent] = useState(false);

    useEffect(() => {
        setLoading(true)
        getPublicEncryptionKey()
    }, [account]);

    const getPublicEncryptionKey = async () => {
        const deb0xContract = Deb0x(library, deb0xAddress)
        const key = await getKeyMoralis(account)
        const initialized = (key != '') ? true : false
        setEncryptionKeyInitialized(initialized)
    }

    async function decrypt(encryptedMessage: any) {
        try {
            const decryptedMessage = await library.provider.request({
                method: 'eth_decrypt',
                params: [encryptedMessage, account],
            });
            return decryptedMessage
        } catch (error) {
            return undefined
        }
    }

    async function fetchMessage(message: any) {
        return await axios.get(`https://deb0x-test.infura-ipfs.io/ipfs/${message}`)
    }

    function Message(props: any) {
        const { chainId} = useWeb3React()
        const encryptMessage = props.message.fetchedMessage.data
        const [message, setMessage] = useState(props.message.fetchedMessage.data)
        const [recipients, setRecipients] = useState<string[]>([]);
        //const [sender, setSender] = useState(props.messsage.sender)
        const [messageTime,setMessageTime] = useState(props.message.timestamp)
        const [ensName,setEnsName] = useState("");
        const [isDecrypted, setIsDecrypted] = useState(false);
        const savedContacts = JSON.parse(localStorage.getItem('contacts') || 'null'); 
        const min = 1;
        const max = 50;
        const [randomImage] = useState<number>(Math.floor(Math.random() * (max - min + 1)) + min);
        
        useEffect(()=> {
            checkENS();
        },[])

        useEffect(()=>{
            if(props.index !== props.previousIndex && isDecrypted===true){
                hideMessage();
            }

        },[props.previousIndex])

        function onlyUnique(value: any, index: any, self: string | any[]) {
            return self.indexOf(value) === index;
        }

        async function checkENS() {
            let recipientsTemp:any = []
            const recipients = props.message.recipients.filter((recipient:any) => recipient.toLowerCase() != account?.toLowerCase());
            var recipientsFiltered = recipients.filter(onlyUnique);

            for(let recipient of recipientsFiltered) {

                // not suported for Polygon
                // let name = await library.lookupAddress(recipient);
                // if(name !== null)
                // {   
                //     recipientsTemp = [...recipientsTemp, name];
                // } else {
                //     recipientsTemp = [...recipientsTemp, recipient];
                // }
                recipientsTemp = [...recipientsTemp, recipient];

            }

            setRecipients(recipientsTemp)
        }

        async function decryptMessage() {
            const decryptedMessage = await decrypt(message)
            if(decryptedMessage) {
                setIsDecrypted(false);
                setMessage(decryptedMessage);
                setIsDecrypted(true);
                props.setPreviousIndex(props.index);
            }
        }

        async function hideMessage(){
            setMessage(encryptMessage);
            setIsDecrypted(false);
        }

        function checkSenderInLocalStorage(sender: any) {
            let user: any;

            if (ensName !== "") {
                user = ensName;
            } else {
                savedContacts.map((contact: any) => {
                    if (sender == contact.address) {
                        user = true;
                    }
                })
            }

           return user;
        }

        function handleDecryptMessage() {
            if(message === props.message.fetchedMessage.data) {
                decryptMessage()
            }
        }
    
        return (
            <ListItem disablePadding key={props.index}
                secondaryAction={ 
                    <IconButton 
                        className={`${(message != props.message.fetchedMessage.data) ? "list-item-btn" : ""}`}  
                        onClick={()=> hideMessage() }  edge="end" aria-label="comments">
                        { (message != props.message.fetchedMessage.data) ? <VisibilityOffIcon  />: null}
                    </IconButton>  
                }
                className="messages-list-item"
            >
                <ListItemButton className={`list-item-button ${isDecrypted ? "active" : ""}` }
                    onClick={() => handleDecryptMessage()}>
                    <div>
                        <img width="58px" height="58px" src={require(`../../photos/icons/avatars/animal-${randomImage}.svg`).default} alt="avatar"/>
                    </div>
                    <ListItemText primary={
                        <>
                            <div className="message-left">
                                <div className="message-heading">
                                    <div className="d-flex align-items-center">
                                        <small>To: </small>
                                        <div className="message-overflow">
                                            {
                                                recipients.length > 0 ?
                                                recipients.map((recipient: any) => {
                                                    return (
                                                        <span
                                                            key={recipient}>
                                                                {
                                                                checkSenderInLocalStorage(recipient) ?
                                                                    savedContacts.filter((contact: any) => recipient == contact.address)
                                                                        .map((filteredPerson: any) => (
                                                                            filteredPerson.name
                                                                        )) :
                                                                        formatAccountName(recipient)
                                                                }
                                                                {
                                                                    recipients.length > 1 ? <>, </> : <></>
                                                                }
                                                        </span>
                                                    )
                                                }) :
                                                account
                                            }
                                        </div>
                                        {
                                            recipients.length > 1 ? <span>({recipients.length})</span> : <></>
                                        }
                                    </div>
                                    <p className="time-stamp">
                                        <small>
                                            {messageTime}
                                        </small>
                                    </p>
                                </div>
                                <p className={`message message-overflow
                                        ${message === props.message.fetchedMessage.data ? 
                                        "message-overflow" : ""}` }
                                    dangerouslySetInnerHTML={{ __html: message }}>
                                </p>
                            </div>
                        </>
                    }/>
                </ListItemButton>
                {isDecrypted ? 
                    <div className="message-right full-height">
                        <div className="message-right--container">
                            <div className="message-heading">
                                <div className="address">
                                    <p>To:
                                        <strong>
                                        {
                                            recipients.map((recipient: any) => {
                                                return (
                                                    <span
                                                        key={recipient}>
                                                            {
                                                            checkSenderInLocalStorage(recipient) ?
                                                                savedContacts.filter((contact: any) => recipient == contact.address)
                                                                    .map((filteredPerson: any) => (
                                                                        filteredPerson.name
                                                                    )) :
                                                                    recipient
                                                            }
                                                                                                                        {
                                                                    recipients.length > 1 ? <> | </> : <></>
                                                                }
                                                    </span>
                                                )
                                            }) 
                                        }
                                        </strong>
                                    </p>
                                </div>
                                <p className="time-stamp">
                                    <small>
                                        {messageTime}
                                    </small>
                                </p>
                            </div>
                            <p className={`message ${message === props.message.fetchedMessage.data ? "message-overflow" : ""}` }
                                dangerouslySetInnerHTML={{ __html: message }}>
                            </p>
                        </div>
                    </div> : 
                    <></>
                }
            </ListItem>
            )
    }

    function GetMessages() {
        const [fetchedMessages, setFetchedMessages] = useState<any>([]);
        const [sortedMessages, setSortedMessages] = useState<any>([]);
        const [previousIndex,setPreviousIndex] = useState<number>();

        useEffect(() => {
            processMessages()
        }, []);

        async function processMessages() {
            const deb0xContract = Deb0x(library, deb0xAddress)
            const sentMessages = await fetchSentMessagesMoralis(account)
            const sentMessagesRetrieved = sentMessages.map(async function (item: any) {
                let intermediateValueForContentData = item[1];
                let intermediateValueForRecipients = item[0];
                if(intermediateValueForContentData[0].contentData !== undefined) {
                    const fetchedMessageContent = await fetchMessage(intermediateValueForContentData[0].contentData.content)
                    const unixTimestamp = intermediateValueForContentData[0].contentData.timestamp.toString()
    
                    const milliseconds = unixTimestamp * 1000 
    
                    const dateObject = new Date(milliseconds)
                    const humanDateFormat = dateObject.toLocaleString()
                    return { fetchedMessage: fetchedMessageContent,
                             recipients: intermediateValueForRecipients[0].recipients,
                             timestamp: humanDateFormat}
                } else {
                    return { fetchedMessage: "",
                        recipients: intermediateValueForRecipients[0].recipients,
                        timestamp: ""}
                }
                
            })

            const messages = await Promise.all(sentMessagesRetrieved)
            setFetchedMessages(messages)
            setSortedMessages(messages)
            setLoading(false)
        }

        if(!loading) {
            if (fetchedMessages.length === 0) {
                return (
                    <>
                        <div className='clouds'>
                            <div className="cloudOne">
                                <img src={cloud2} alt="cloud-2" />
                            </div>
                            <div className="cloudTwo">
                                <img src={cloud1} alt="cloud-1" />
                            </div>
                            <div className="cloudThree">
                                <img src={cloud3} alt="cloud-3" />
                            </div>
                            <div className="cloudText">
                                Cloudy with a chance of messages
                            </div>
                        </div>
                    </>
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
                        <Box className="intro-box sent col-md-8">
                            <div className="open-message">
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
    
    if(encryptionKeyInitialized == true){
        return (
            <div className="content-box">
                <GetMessages />
           </div>
        )
    } else if(encryptionKeyInitialized == false){
        return (
            <Stepper onDeboxInitialization={getPublicEncryptionKey}/>
        )
    } else{
        return(
            <div className="spinner">
                <CircularProgress/>
            </div>
        )
    }
}