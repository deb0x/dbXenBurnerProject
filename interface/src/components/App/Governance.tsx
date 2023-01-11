import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import Deb0x from "../../ethereum/deb0x"
import {fetchMessagesMoralis,fetchMessageSendersMoralis} from '../../ethereum/EventLogsMoralis.js';
import {
    List, Card, CardActions, CardContent, Button, Grid, Box,
    Typography, TextField, CircularProgress, Divider
} from '@mui/material';

const axios = require('axios')
const deb0xAddress = "0xA06735da049041eb523Ccf0b8c3fB9D36216c646";


export function Governance(props: any): any {
    const { account, library } = useWeb3React()
    const [loading, setLoading] = useState(true)
    const [encryptionKeyInitialized, setEncryptionKeyInitialized] = 
        useState<boolean|undefined>(undefined)



    function VoteFeePanel() {
        return (
            <Card variant="outlined" className="card-container">
                <CardContent>
                    <Typography variant="h4" component="div">
                        Vote Fee
                    </Typography>
                    <Divider className="divider-pink" />
                    <Typography>
                        Proposals to change fee to: 
                    </Typography>
                    <Typography variant="h6">
                        <strong>11%</strong>
                    </Typography>
                    <Divider className="divider-pink" />
                    <Typography variant="h5">
                        
                    </Typography>
                  
                    <Typography variant="h6">
                        We want to raise this to 11% because 5% is to low and people can send to many transactions
                    </Typography>
                    <Divider className="divider-pink" />
                </CardContent>
                <CardActions>
                    <Box>
                        <Button className="submit-vote approve-btn" variant="contained" color="primary">Yes</Button>
                        <Button className="submit-vote decline-btn" variant="contained" color="error">No</Button>
                    </Box>
                </CardActions>
            </Card>
        )
    }

    function ProposeFeePanel() {
        return (
            <Card variant="outlined" className="card-container">
                <CardContent>
                    <Typography variant="h4" component="div">
                        Propose Fee
                    </Typography>
                    <Divider className="divider-pink" />
                    <Typography>
                        Submit your proposal
                    </Typography>
                    <Typography variant="h6">
                        <TextField id="outlined-basic" label="Motivation" variant="outlined" />
                    </Typography>
                    <Typography variant="h6">
                        <TextField id="outlined-basic" label="Value" variant="outlined" />
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button className="submit-btn" variant="contained" color="secondary">Submit</Button>
                </CardActions>
            </Card>
        )
    }

    //need to be modified
    function GetMessages() {
        const proposals = [{motivation:"make fee 100", value:100, votes:12 }, 
                    {motivation:"make fee 500", value:500, votes:5}]

        const [fetchedMessages, setFetchedMessages] = useState<any>([])

        useEffect(() => {
            processMessages()
        }, []);

        async function processMessages() {
            const deb0xContract = Deb0x(library, deb0xAddress)
            
            const senderAddresses =  await fetchMessageSendersMoralis(account)

            const cidsPromises = senderAddresses.map(async function(sender:any){
                return { cids: await fetchMessagesMoralis(account,sender), sender: sender}
            })

            const cids = await Promise.all(cidsPromises)

            const encryptedMessagesPromisesArray = cids.map(async function(cidArray: any) {

            })

            const encryptedMessages = await Promise.all(encryptedMessagesPromisesArray)
            
            setFetchedMessages(encryptedMessages.flat())
            setLoading(false)
        }

        if(!loading) {
            if (fetchedMessages.length == 0) {
                return (
                    <>
                        <div >
                            <Typography variant="h5"
                                gutterBottom
                                component="div">
                                No messages founded.
                            </Typography>
                        </div>
                    </>
                )
            } else {
                return (
                    <Box>
                        <List>
                            {fetchedMessages.map((message: any, i: any) => {
                                return (
                                    <p></p>
                                )
                            })}
                        </List>
                    </Box>
                )
            }
        } else {
            return (
                <CircularProgress/>
            )
        }

    }



    return (
        <>
            <Grid className="cards-grid" container spacing={2}>
                <Grid item>
                    <VoteFeePanel />
                </Grid>
                <Grid item>
                    <ProposeFeePanel />
                </Grid>
            </Grid>
        </>
    )
}