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
import fetch from "node-fetch";
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
        .catch((e) => console.log("Moralis Error"))
    let dateForParam = subMinutes(new Date(), 10);
    let results = [];
    await getIdsFromEvent(null, dateForParam).then(async(result) => {
        for (let i = 0; i < result.raw.result.length; i++) {
            results.push(result.raw.result[i].data.amount);
        }
        let cursor = result.raw.cursor;
        if (cursor != null) {
            while (cursor != null) {
                let newPage = await getIdsFromEvent(cursor, dateForParam);
                cursor = newPage.raw.cursor;
                if (newPage.result.length != 0 && newPage.result != undefined) {
                    for (let i = 0; i < newPage.raw.result.length; i++) {
                        results.push(newPage.raw.result[i].data.amount);
                    }
                }
            }
        }
    })
    return results;
}

async function getIdsFromEvent(cursor, dateForParam) {
    let cursorData;
    if (cursor != null)
        cursorData = cursor.toString()
    const response = await Moralis.EvmApi.events.getContractEvents({
        "chain": "0x13881",
        "topic": "0x351a36c9c7d284a243725ea280c7ca2b2b1b02bf301dd57d03cbc43956164e78",
        "cursor": cursorData,
        "fromDate": dateForParam,
        "address": dbxenftFactoryAddress,
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
    return response;
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
            let standardMetadata = {
                "id": `${ids[i]}`,
                "name": `THIS IS REAL TEST DBXEN NFT #${ids[i]}, NOW REVEAL!`,
                "description": "DBXEN NFT FOR PASSIVE INCOME and reveal",
                "image": getImage(newPower),
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

function getImage(power) {
    if (power >= 0 && power <= 500)
        return "https://deboxnft-assets-polygon.s3.eu-west-1.amazonaws.com/4DBXeNFT_1.png";
    if (power > 500 && power <= 1000)
        return "https://deboxnft-assets-polygon.s3.eu-west-1.amazonaws.com/4DBXeNFT_2.png"
    if (power > 1000 && power <= 2500)
        return "https://deboxnft-assets-polygon.s3.eu-west-1.amazonaws.com/4DBXeNFT_3.png"
    if (power > 2500 && power <= 5000)
        return "https://deboxnft-assets-polygon.s3.eu-west-1.amazonaws.com/4DBXeNFT_4.png"
    if (power > 5000 && power <= 7500)
        return "https://deboxnft-assets-polygon.s3.eu-west-1.amazonaws.com/4DBXeNFT_5.png"
    if (power > 7500 && power <= 10000)
        return "https://deboxnft-assets-polygon.s3.eu-west-1.amazonaws.com/4DBXeNFT_6.png"
    if (power > 10000 && power <= 12500)
        return "https://deboxnft-assets-polygon.s3.eu-west-1.amazonaws.com/5DBXeNFT_5.png"
    if (power > 12500 && power <= 15000)
        return "https://deboxnft-assets-polygon.s3.eu-west-1.amazonaws.com/5DBXeNFT_6.png"
    if (power > 15000)
        return "https://deboxnft-assets-polygon.s3.eu-west-1.amazonaws.com/6DBXeNFT_6.png"
}

cron.schedule('*/10 * * * *', async() => {
    await generateAfterReveal();
});