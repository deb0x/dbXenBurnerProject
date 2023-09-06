import AWS from 'aws-sdk/global.js';
import S3 from 'aws-sdk/clients/s3.js';
import cron from 'node-cron';
import { JsonRpcProvider } from 'ethers';
import { ethers, formatUnits, formatEther } from 'ethers';
import Factory from "./dbxenftFactory.js";
import mintInfo from "./mintInfo.js";
import XENFT from "./DBXENFT.js";
import dotenv from 'dotenv';
import BigNumber from 'bignumber.js';
import Moralis from "moralis";
dotenv.config();

const dbxenftFactoryAddress = "0x0754795792A2B3Eda57010371B3576573A34eba5";
const mintInfoAddress = "0x2c1c89ce0537A5565da812A9afdBee0184851612";
const xenftAddress = "0xd78FDA2e353C63bb0d7F6DF58C67a46dD4BBDd48";

const STORAGE_EP = "https://dbxen-be.prodigy-it-solutions.com/api/storage/";
const REACT_APP_METADATA_BUCKET_POLYGON = "deboxnft-metadata-polygon"

const createApiOptions = (data) =>
    ({ method: "POST", body: JSON.stringify(data) });

const getStorageObject = (data) =>
    fetch(STORAGE_EP + "GetObjectCommand", createApiOptions(data))
    .then((result) => result.json());

const putStorageObject = (data) =>
    fetch(STORAGE_EP + "PutObjectCommand", createApiOptions(data))
    .then((result) => result.json());

function subMinutes(date, minutes) {
    date.setMinutes(date.getMinutes() - minutes);
    return date;
}

function mulDiv(x, y, denominator) {
    const bx = new BigNumber(x);
    const by = new BigNumber(y);
    const bDenominator = new BigNumber(denominator);
    const result = bx.times(by).dividedBy(bDenominator);

    return result.toString();
}

async function getLast24HoursIdsMinted() {
    Moralis.start({ apiKey: process.env.REACT_APP_MORALIS_KEY_NFT })
        .catch((e) => console.log("moralis error"))
    let dateForParam = subMinutes(new Date(), 11);
    const response = await Moralis.EvmApi.events.getContractEvents({
        "chain": "0x13881",
        "topic": "0x351a36c9c7d284a243725ea280c7ca2b2b1b02bf301dd57d03cbc43956164e78",
        "fromDate": `${dateForParam}`,
        "address": "0x0754795792A2B3Eda57010371B3576573A34eba5",
        "abi": {
            "anonymous": false,
            "inputs": [{
                    "indexed": true,
                    "name": "from",
                    "type": "address",
                    "internal_type": "address"
                },
                {
                    "indexed": true,
                    "name": "to",
                    "type": "address",
                    "internal_type": "address"
                },
                {
                    "indexed": false,
                    "name": "amount",
                    "type": "uint256",
                    "internal_type": "uint256"
                }
            ],
            "name": "Transfer",
            "type": "event"
        }
    });
    let responseArray = response.raw.result;
    let idsFromEvent = [];
    for (let i = 0; i < responseArray.length; i++) {
        idsFromEvent.push(+responseArray[i].data.amount);
    }
    return idsFromEvent;
}

async function generateAfterReveal() {
    const provider = new JsonRpcProvider("https://polygon-mumbai.blockpi.network/v1/rpc/public");
    let factory = Factory(provider, dbxenftFactoryAddress);
    let ids = await getLast24HoursIdsMinted();
    const MintInfoContract = mintInfo(provider, mintInfoAddress);
    const XENFTContract = XENFT(provider, xenftAddress);
    for (let i = 0; i < ids.length; i++) {
        let XENFTID = Number(await factory.dbxenftUnderlyingXENFT(ids[i]));
        let mintInforesult = await XENFTContract.mintInfo(XENFTID);
        let mintInfoData = await MintInfoContract.decodeMintInfo(mintInforesult);
        let maturityTs = Number(mintInfoData[1]);
        let fileName = ids[i] + ".json";
        let tokenEntryCycle = Number(await factory.tokenEntryCycle(ids[i]));
        let dbxenftEntryPower = formatEther((await factory.dbxenftEntryPower(ids[i])))
        let rewardPerCycle = formatEther(await factory.rewardPerCycle(tokenEntryCycle))
        let totalEntryPowerPerCycle = formatEther(await factory.totalEntryPowerPerCycle(tokenEntryCycle))
        let newPower = mulDiv(dbxenftEntryPower.toString(), rewardPerCycle.toString(), totalEntryPowerPerCycle.toString())
        console.log("NEW POWER!!!");

        try {
            let attributesValue = [{
                "trait_type": "DBXEN NFT POWER",
                "value": newPower.toString()
            }, {
                "trait_type": "ESTIMATED XEN",
                "value": dbxenftEntryPower.toString(),
            }, {
                "trait_type": "MATURITY DATE",
                "value": new Date(maturityTs * 1000).toString(),
            }, ]
            let imageLink = "https://imagesfornft.s3.eu-west-3.amazonaws.com/Screenshot+from+2023-07-05+16-28-05.png"
            let standardMetadata = {
                "id": `${ids[i]}`,
                "name": `THIS IS REAL TEST DBXEN NFT #${ids[i]}, NOW REVEAL!`,
                "description": "DBXEN NFT FOR PASSIVE INCOME and reveal",
                "image": imageLink,
                "external_url": `https://dbxen.org/your-dbxenfts/${ids[i]}`,
                "attributes": attributesValue
            }
            console.log(JSON.stringify(standardMetadata));
            const params = {
                Bucket: REACT_APP_METADATA_BUCKET_POLYGON,
                Key: fileName,
                Body: JSON.stringify(standardMetadata),
                Tagging: 'public=yes',
                "ContentType": "application/json",
            };

            putStorageObject(params)
                .then((result) => {
                    console.log(result)
                }).catch((error) => console.log(error));

        } catch (err) {
            console.log(err)
            if (err.client_error.Code == "NoSuchKey") {
                console.log("ERROR AT UPDATE!!!")
            } else {
                throw err;
            }
        }
    }
}

cron.schedule('*/11 * * * *', async() => {
    await generateAfterReveal();
});