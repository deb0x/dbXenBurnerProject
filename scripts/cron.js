import cron from 'node-cron';
import { JsonRpcProvider } from 'ethers';
import { formatEther } from 'ethers';
import Factory from "./dbxenftFactory.js";
import mintInfo from "./mintInfo.js";
import XENFT from "./DBXENFT.js";
import dotenv from 'dotenv';
import BigNumber from 'bignumber.js';
import Moralis from "moralis";
import fetch from "node-fetch";
import fs from "fs";
dotenv.config();

const dbxenftFactoryAddress = "0xDeD0C0cBE8c36A41892C489fcbE659773D137C0e";
const mintInfoAddress = "0x2B7B1173e5f5a1Bc74b0ad7618B1f87dB756d7d4";
const xenftAddress = "0x726bB6aC9b74441Eb8FB52163e9014302D4249e5";

const STORAGE_EP = "https://dbxen-be.prodigy-it-solutions.com/api/storage/";
const REACT_APP_METADATA_BUCKET_POLYGON = "deboxnft-metadata-polygon"

const config = JSON.parse(fs.readFileSync("./config.json"));

const networkCheckTimeout = config.networkCheckTimeout;

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
    let dateForParam = subMinutes(new Date(), 7200);
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
        "chain": "137",
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
    const provider = new JsonRpcProvider(`https://polygon-mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`);
    let factory = Factory(provider, dbxenftFactoryAddress);
    let ids = await getLast24HoursIdsMinted();
    const MintInfoContract = mintInfo(provider, mintInfoAddress);
    const XENFTContract = XENFT(provider, xenftAddress);
    console.log(ids.length);
    console.log(ids);
    for (let i = ids.length - 1; i > 0; i--) {
        console.log("TOKEN ID: " + ids[i])
        let XENFTID = Number(await factory.dbxenftUnderlyingXENFT(ids[i]));
        console.log("XENFTID " + XENFTID);
        let mintInforesult = await XENFTContract.mintInfo(XENFTID);
        console.log("Mint info result: " + mintInforesult);
        let mintInfoData = await MintInfoContract.decodeMintInfo(mintInforesult);
        console.log("Mint info data: " + mintInfoData);
        let maturityTs = Number(mintInfoData[1]);
        let fileName = ids[i] + ".json";
        let tokenEntryCycle = Number(await factory.tokenEntryCycle(ids[i]));
        console.log("tokenEntryCycle " + tokenEntryCycle);
        let dbxenftEntryPower = formatEther((await factory.dbxenftEntryPower(ids[i])))
        console.log("dbxenftEntryPower " + dbxenftEntryPower);
        let rewardPerCycle = formatEther(await factory.rewardPerCycle(tokenEntryCycle))
        console.log("rewardPerCycle " + rewardPerCycle);
        let totalEntryPowerPerCycle = formatEther(await factory.totalEntryPowerPerCycle(tokenEntryCycle))
        console.log("totalEntryPowerPerCycle " + totalEntryPowerPerCycle);
        let newPower = mulDiv(dbxenftEntryPower.toString(), rewardPerCycle.toString(), totalEntryPowerPerCycle.toString())
        console.log("NEW POWER!!! " + newPower);

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
                "name": "DBXeNFT: Cool art & Trustless Daily Yield",
                "description": "",
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

            // putStorageObject(params)
            //     .then((result) => {
            //         console.log(result)
            //     }).catch((error) => console.log(error));

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
        return "https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-polygon/4DBXeNFT_1.png";
    if (power > 500 && power <= 1000)
        return "https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-polygon/4DBXeNFT_2.png"
    if (power > 1000 && power <= 2500)
        return "https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-polygon/4DBXeNFT_3.png"
    if (power > 2500 && power <= 5000)
        return "https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-polygon/4DBXeNFT_4.png"
    if (power > 5000 && power <= 7500)
        return "https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-polygon/4DBXeNFT_5.png"
    if (power > 7500 && power <= 10000)
        return "https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-polygon/4DBXeNFT_6.png"
    if (power > 10000 && power <= 12500)
        return "https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-polygon/5DBXeNFT_5.png"
    if (power > 12500 && power <= 15000)
        return "https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-polygon/5DBXeNFT_6.png"
    if (power > 15000)
        return "https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-polygon/6DBXeNFT_6.png"
}

cron.schedule('*/1 * * * *', async() => {
    await generateAfterReveal()
}, { networkCheckTimeout: 50 });