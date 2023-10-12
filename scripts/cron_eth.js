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
dotenv.config();           

const dbxenftFactoryAddress = "0xA06735da049041eb523Ccf0b8c3fB9D36216c646";
const mintInfoAddress = "0xE8dee287a293F67d53f178cD34815d37E78Ff4e2";
const xenftAddress = "0x0a252663DBCc0b073063D6420a40319e438Cfa59";

const STORAGE_EP = "https://dbxen-be.prodigy-it-solutions.com/api/storage/";
const METADATA_BUCKET_ETH = "deboxnft-minting-eth"

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
    let dateForParam = subMinutes(new Date(), 25 * 60);
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
        "chain": "1",
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
    const provider = new JsonRpcProvider(`https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_KEY}`);
    let factory = Factory(provider, dbxenftFactoryAddress);
    let ids = await getLast24HoursIdsMinted();
    const MintInfoContract = mintInfo(provider, mintInfoAddress);
    const XENFTContract = XENFT(provider, xenftAddress);
    let counter1 = 1;
    let counter2 = 1;
    let counter3 = 1;
    let counter4 = 1;
    let counter5 = 1;
    let counter6 = 1;
    let counter7 = 1;
    let counter8 = 1;
    let counter9 = 1;
    for (let i = ids.length - 1; i >= 0; i--) {
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
            let result = getImage(newPower, counter1, counter2, counter3, counter4, counter5, counter6, counter7, counter8, counter9);
            let standardMetadata = {
                "id": `${ids[i]}`,
                "name": `#${ids[i]} DBXeNFT: Cool art & Trustless Daily Yield`,
                "description": "",
                "image": result.link,
                "external_url": `https://dbxen.org/your-dbxenfts/${METADATA_BUCKET_ETH}/${ids[i]}`,
                "attributes": attributesValue
            }

            console.log(JSON.stringify(standardMetadata));

            switch (result.value) {
                case 1:
                    if (counter1 + 1 > 10000)
                        counter1 = 1;
                    else
                        counter1++
                        break;
                case 2:
                    if (counter2 + 1 > 10000)
                        counter2 = 1
                    else
                        counter2++
                        break;
                case 3:
                    if (counter3 + 1 > 10000)
                        counter3 = 1
                    else
                        counter3++
                        break;
                case 4:
                    if (counter4 + 1 > 10000)
                        counter4 = 1
                    else
                        counter4++
                        break;
                case 5:
                    if (counter5 + 1 > 10000)
                        counter5 = 1
                    else
                        counter5++
                        break;
                case 6:
                    if (counter6 + 1 > 6000)
                        counter6 = 1
                    else
                        counter6++
                        break;
                case 7:
                    if (counter7 + 1 > 6000)
                        counter7 = 1
                    else
                        counter7++
                        break;
                case 8:
                    if (counter8 + 1 > 3500)
                        counter8 = 1
                    else
                        counter8++
                        break;
                case 9:
                    if (counter9 + 1 > 2500)
                        counter9 = 1
                    else
                        counter9++
                        break;
                default:
                    console.log("Default case")
                    break;
            }
            const params = {
                Bucket: METADATA_BUCKET_ETH,
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

function getImage(power, counter1, counter2, counter3, counter4, counter5, counter6, counter7, counter8, counter9) {
    if (power >= 0 && power <= 500)
        return { link: `https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-0-500/[0-500]_DBXENFT_${counter1}.png`, value: 1 }
    if (power > 500 && power <= 1000)
        return { link: `https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-501-1000/[500-1000]_DBXENFT_${counter2}.png`, value: 2 }
    if (power > 1000 && power <= 2500)
        return { link: `https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-1001-2500/[1000_2500]_DBXENFT_${counter3}.png`, value: 3 }
    if (power > 2500 && power <= 5000)
        return { link: `https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-2501-5000/[2500_5000]_DBXENFT_${counter4}.png`, value: 4 }
    if (power > 5000 && power <= 7500)
        return { link: `https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-5001-7500/[5000-7500]_DBXENFT_${counter5}.png`, value: 5 }
    if (power > 7500 && power <= 10000)
        return { link: `https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-7501-10000/[7501-10000]_DBXENFT_${counter6}.png`, value: 6 }
    if (power > 10000 && power <= 12500)
        return { link: `https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-10001-12500/[10001-12500]_DBXENFT${counter7}.png`, value: 7 }
    if (power > 12500 && power <= 15000)
        return { link: `https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-12501-15000/[12501-15000]_DBXENFT_${counter8}.png`, value: 8 }
    if (power > 15000)
        return { link: `https://dbxen-be.prodigy-it-solutions.com/api/assets/deboxnft-assets-15000/[15000]_DBXENFT_${counter9}.png`, value: 9 }
}

cron.schedule('11 11 14 * * *', async() => {
    await generateAfterReveal();
});