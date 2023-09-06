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


async function generateAfterReveal() {
    const provider = new JsonRpcProvider("https://polygon-mumbai.blockpi.network/v1/rpc/public");
    let factory = Factory(provider, dbxenftFactoryAddress);
    let currentCycle = Number(await factory.getCurrentCycle());
    let currentStartedCycle = Number(await factory.currentStartedCycle());
    let lastStartedCycle = Number(await factory.lastStartedCycle());
    console.log("currentCycle " + currentCycle);
    console.log("currentStartedCycle " + currentStartedCycle);
    console.log("lastStartedCycle " + lastStartedCycle);
    let lastActiveCycle;
    if (currentCycle != currentStartedCycle) {
        lastActiveCycle = currentStartedCycle;
    } else {
        lastActiveCycle = lastStartedCycle
    }
    console.log("parametru pe functie " + lastActiveCycle)
    if (lastActiveCycle != -1) {
        console.log("here")
        console.log("ultimul ciclu activ " + lastActiveCycle)
        console.log("*****************************")
        let ids = await getIdsMintedPerCycle(lastActiveCycle);
        console.log("id uri mintate deja " + ids);
        console.log("##################################")
        console.log("##################################")
        let ok = false;
        const MintInfoContract = mintInfo(provider, mintInfoAddress);
        const XENFTContract = XENFT(provider, xenftAddress);
        console.log("instantelee efeweww")
        for (let i = 0; i < ids.length; i++) {
            console.log("aaaaaa");
            console.log(ids[i]);
            console.log(typeof ids[i])
            let XENFTID = Number(await factory.dbxenftUnderlyingXENFT(ids[i]));
            console.log("AM ID");
            console.log(XENFTID)
            let mintInforesult = await XENFTContract.mintInfo(XENFTID);
            console.log("mintInforesult", mintInforesult)
            let mintInfoData = await MintInfoContract.decodeMintInfo(mintInforesult);
            console.log("mintInfoData", mintInfoData)
            let maturityTs = Number(mintInfoData[1]);
            console.log("MATURITY IS HERE ");
            console.log(maturityTs);
            let fileName = ids[i] + ".json";
            console.log("************************************");
            console.log(fileName);
            console.log(ids[i]);
            console.log("here");
            let tokenEntryCycle = Number(await factory.tokenEntryCycle(ids[i]));
            let dbxenftEntryPower = formatEther((await factory.dbxenftEntryPower(ids[i])))
            console.log("*****");
            console.log("dbxenftEntryPower");
            console.log(dbxenftEntryPower);
            console.log("*****");
            let rewardPerCycle = formatEther(await factory.rewardPerCycle(tokenEntryCycle))
            console.log("rewardPerCycle");
            console.log(rewardPerCycle);
            let totalEntryPowerPerCycle = formatEther(await factory.totalEntryPowerPerCycle(tokenEntryCycle))
            console.log("totalEntryPowerPerCycle")
            console.log(totalEntryPowerPerCycle)
            console.log("ggggg");
            console.log(mulDiv(dbxenftEntryPower.toString(), rewardPerCycle.toString(), totalEntryPowerPerCycle.toString()))
            let newPower = mulDiv(dbxenftEntryPower.toString(), rewardPerCycle.toString(), totalEntryPowerPerCycle.toString())
            console.log("************************************")
            console.log("newPower");
            console.log(newPower)

            try {
                // let response = await s3.getObject(params).promise();
                // let objectData = response.Body.toString('utf-8');
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
                    //let imageLink = getImage(newPower);
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

                console.log("L-AM URCAT!!!!");
            } catch (err) {
                console.log(err)
                if (err.client_error.Code == "NoSuchKey") {
                    console.log("IMPOSIBIL SA NU AVEM FISIER AICI LA UPDATE!!!")
                } else {
                    throw err;
                }
            }
        }
    }
    console.log("se scrie pe fisier from heres boss");
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

async function idsAlreadyMinted(id) {
    const fileName = "allIdsMinted3.json";
    const params = {
        Bucket: REACT_APP_METADATA_BUCKET_POLYGON,
        Key: fileName,
    }
    const putStorageParams = (key, body) => ({
        Bucket: REACT_APP_METADATA_BUCKET_POLYGON,
        Key: key,
        Body: JSON.stringify(body),
        "ContentType": "application/json",
    });
    let objectData = await getStorageObject(params);
    try {
        let ids;
        console.log(objectData.tokenId)

        if (!objectData.tokenId.includes(id)) {
            objectData.tokenId.push(id);
            console.log(ids, typeof ids)
            putStorageObject(putStorageParams(fileName, { tokenId: objectData.tokenId }))
                .then((result) => result.client_error && console.log(result));

        }
        console.log(objectData.tokenId);
        return objectData.tokenId;
    } catch (err) {
        console.log(err)
        console.log("intru pe eroare de la ids already mitedd")
        if (objectData.client_error.Code === "NoSuchKey") {
            putStorageObject(putStorageParams(fileName, { tokenId: [id] }))
                .then((result) => result.client_error && console.log(result));
            return [id];
        } else {
            throw err;
        }
    }
}

async function getIdsMintedPerCycle(cycle) {
    const fileName = cycle + ".json";
    const params = {
        Bucket: REACT_APP_METADATA_BUCKET_POLYGON,
        Key: fileName,
    }
    console.log(params)
    try {
        let objectData = await getStorageObject(params);
        console.log("heress");
        console.log(objectData);
        console.log(objectData.tokenId);
        if (objectData.tokenId != [] && objectData != undefined)
            return objectData.tokenId;
        else {
            if (objectData.client_error.Code === "NoSuchKey")
                return [];
            else
                return [];
        }
    } catch (err) {
        console.log(err)
        console.log("intru pe eroare pentru id-urile de pe cycle")
        return [];
    }
}

function mulDiv(x, y, denominator) {
    // Convert input to BigNumber for arbitrary-precision arithmetic
    const bx = new BigNumber(x);
    const by = new BigNumber(y);
    const bDenominator = new BigNumber(denominator);

    console.log(bx);
    console.log(by);
    console.log(bDenominator);
    // Calculate x * y / denominator
    const result = bx.times(by).dividedBy(bDenominator);

    return result.toString();
}

async function readLastActiveCycle(lastActiveCycle) {
    console.log("READ LAST ACTIVE CYCLE:");
    console.log("INTRU CU CICLUL " + lastActiveCycle);
    let fileName = "lastCycle.txt";
    console.log(REACT_APP_METADATA_BUCKET_POLYGON);
    const params = {
        Bucket: REACT_APP_METADATA_BUCKET_POLYGON,
        Key: fileName,
    }
    try {
        let response = await s3.getObject(params).promise();
        let objectData = response.Body.toString('utf-8');
        let data = objectData.split('\n');
        data.pop();
        console.log(data);
        for (let i = data.length - 1; i >= 0; i--) {
            console.log("INSIDE FOR LA READ ACTIVE CYCLE")
            if (data[i] != '') {
                let jsonData = JSON.parse(data[i]);
                console.log(jsonData);
                if (jsonData.cycle == lastActiveCycle) {
                    if (jsonData.alreadyUpdated == false) {
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        }
        return -1;
    } catch (err) {
        console.log(err)
        return -1;
    }
}

async function updateLastActiveCycle(cycle) {
    console.log("UPDATE LAST ACTIVE CYCLE")
    let fileName = "lastCycle.txt";
    console.log(REACT_APP_METADATA_BUCKET_POLYGON);
    console.log(cycle);
    const params = {
        Bucket: REACT_APP_METADATA_BUCKET_POLYGON,
        Key: fileName,
    }
    try {
        let response = await s3.getObject(params).promise();
        let objectData = response.Body.toString('utf-8');
        let data = objectData.split('\n');
        data.pop();
        let newJsonData = "";
        let initJsonData = "\n";
        console.log("data from update cycle data  " + data);
        for (let i = data.length - 1; i >= 0; i--) {
            console.log("ISIDE FOR")
            console.log(data);
            console.log(data[i]);
            if (data[i] != '') {
                let jsonData = JSON.parse(data[i]);
                console.log(jsonData);
                if (jsonData.cycle == cycle) {
                    console.log("here");
                    newJsonData = newJsonData.concat("\n");
                    initJsonData = newJsonData.concat(`{"cycle": ${cycle},"alreadyUpdated": true}`);
                    console.log(initJsonData);
                    newJsonData = initJsonData.concat("\n");
                    console.log(newJsonData);
                } else {
                    console.log("else");
                    newJsonData = newJsonData.concat("\n");
                    newJsonData = newJsonData.concat(`{"cycle": ${jsonData.cycle},"alreadyUpdated": ${jsonData.alreadyUpdated}}`);
                    newJsonData = newJsonData.concat("\n");
                }
                console.log("SUNT PE FORRRR");
            }
            console.log(newJsonData);
        }
        (async() => {
            s3.putObject({
                Bucket: REACT_APP_METADATA_BUCKET_POLYGON,
                Key: fileName,
                Body: newJsonData,
                "ContentType": "txt",
            }).promise();
        })();
    } catch (err) {
        console.log("Ssss")
        console.log(err)
    }
}

async function addMetadataForOmittedId(id) {
    const provider = new JsonRpcProvider("https://polygon-mumbai.blockpi.network/v1/rpc/public");
    let factory = Factory(provider, dbxenftFactoryAddress);
    let XENFTID = await factory.dbxenftUnderlyingXENFT(id);
    const MintInfoContract = mintInfo(provider, mintInfoAddress);
    const XENFTContract = XENFT(provider, xenftAddress);
    let mintInforesult = await XENFTContract.mintInfo(XENFTID);
    let mintInfoData = await MintInfoContract.decodeMintInfo(mintInforesult);
    let maturityTs = mintInfoData[1];
    let fileName = id + ".json";

    const params = {
        Bucket: REACT_APP_METADATA_BUCKET_POLYGON,
        Key: fileName,
    }

    try {
        let response = await s3.getObject(params).promise();
        let objectData = response.Body.toString('utf-8');
        console.log("ALREADY FILE EXIST!!!!!!!");
        console.log("update...........");
    } catch (err) {
        let dbxenftEntryPower = formatEther((await factory.dbxenftEntryPower(id)));
        console.log(err)
        if (err.code == "NoSuchKey") {
            let attributesValue = [{
                "trait_type": "DBXEN NFT POWER",
                "value": "0"
            }, {
                "trait_type": "ESTIMATED XEN",
                "value": dbxenftEntryPower.toString(),
            }, {
                "trait_type": "MATURITY DATE",
                "value": new Date(maturityTs * 1000).toString()
            }]

            let standardMetadata = {
                "id": `${id}`,
                "name": `THIS IS REAL TEST DBXEN NFT #${id}, BUT IS UNREVEAL`,
                "description": "DBXEN NFT FOR PASSIVE INCOME",
                "image": "https://imagesfornft.s3.eu-west-3.amazonaws.com/2DBXeNFT_Final+with+writing.jpg",
                "external_url": `https://dbxen.org/your-dbxenfts/${id}`,
                "attributes": attributesValue
            }
            console.log(JSON.stringify(standardMetadata));
            (async() => {
                s3.putObject({
                    Bucket: REACT_APP_METADATA_BUCKET_POLYGON,
                    Key: fileName,
                    Body: JSON.stringify(standardMetadata),
                    "ContentType": "application/json",
                }).promise();
            })();
            console.log("LAST ACTIVE CYCLE!");
            console.log("update...........");
        } else {
            throw err;
        }
    }
}

function subMinutes(date, minutes) {
    date.setMinutes(date.getMinutes() - minutes);

    return date;
}

async function getLast24HoursIdsMinted() {
    console.log("Testing#1");
    const provider = new JsonRpcProvider("https://polygon-mumbai.blockpi.network/v1/rpc/public");
    let factory = Factory(provider, dbxenftFactoryAddress);
    let currentCycle = Number(await factory.getCurrentCycle());
    let currentStartedCycle = Number(await factory.currentStartedCycle());
    let lastStartedCycle = Number(await factory.lastStartedCycle());
    let lastActiveCycle;
    console.log("Testing#2");
    console.log(currentCycle);
    if (currentCycle != currentStartedCycle) {
        lastActiveCycle = currentStartedCycle;
    } else {
        lastActiveCycle = lastStartedCycle
    }
    console.log("lastActiveCycle");
    console.log(lastActiveCycle);
    let idsForLastUpdateCycle = await getIdsMintedPerCycle(lastActiveCycle);
    console.log(" idsForLastUpdateCycle ");
    console.log(idsForLastUpdateCycle);
    Moralis.start({ apiKey: process.env.REACT_APP_MORALIS_KEY_NFT })
        .catch((e) => console.log("moralis error"))
    let dateForParam = subMinutes(new Date(), 11);
    console.log("Date for param");
    console.log(dateForParam);
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
    console.log("response!!!")
    let responseArray = response.raw.result;
    let idsFromEvent = [];
    for (let i = 0; i < responseArray.length; i++) {
        idsFromEvent.push(+responseArray[i].data.amount);
    }
    console.log("ids from events!!!");
    console.log(idsFromEvent)
    let differenceArray = [];
    console.log(idsForLastUpdateCycle);
    for (let i = 0; i < idsFromEvent.length; i++) {
        console.log(idsFromEvent[i]);
        console.log(!idsForLastUpdateCycle.includes(idsFromEvent[i]));
        if (!idsForLastUpdateCycle.includes(idsFromEvent[i])) {
            differenceArray.push(idsFromEvent[i])
        }
    }
    console.log("3232");
    console.log(differenceArray);
    writeIds(differenceArray, idsForLastUpdateCycle, lastActiveCycle, idsFromEvent);
}

async function writeIds(differenceArray, idsForLastUpdateCycle, cycle, idsFromEvent) {
    const fileName = cycle + ".json";

    const params = {
        Bucket: REACT_APP_METADATA_BUCKET_POLYGON,
        Key: fileName,
    }

    const putStorageParams = (key, body) => ({
        Bucket: REACT_APP_METADATA_BUCKET_POLYGON,
        Key: key,
        Body: JSON.stringify(body),
        "ContentType": "application/json",
    });

    console.log("write pe cycle");
    console.log(differenceArray);
    console.log(idsForLastUpdateCycle);
    let content;
    if (idsForLastUpdateCycle != null)
        content = differenceArray.concat(idsForLastUpdateCycle);
    else
        content = differenceArray;

    content = idsFromEvent;
    console.log("ID FOR UPDATE!!! ");
    console.log("COntent");
    console.log(content);
    try {
        // putStorageObject(putStorageParams(fileName, { tokenId: content }))
        //     .then((result) => result.client_error && console.log(result));
        console.log("Am pus aici!!!");
        await generateAfterRevealForMissedIDS(cycle, differenceArray, fileName, content);

    } catch (err) {
        console.log(err)
        if (err.client_error.Code === "NoSuchKey") {
            let newFileName = cycle + ".json";
            // putStorageObject(putStorageParams(fileName, { tokenId: content }))
            //     .then((result) => result.client_error && console.log(result));
            console.log("Am pus pe eroare!!!!");
            await generateAfterRevealForMissedIDS(cycle, differenceArray, fileName, content);
        } else {
            throw err;
        }
    }
}

async function generateAfterRevealForMissedIDS(cycle, differenceArray, fileName, content) {
    console.log("generete pe after reveal!!!");
    console.log(differenceArray);
    const provider = new JsonRpcProvider("https://polygon-mumbai.blockpi.network/v1/rpc/public");
    let factory = Factory(provider, dbxenftFactoryAddress);
    let currentCycle = Number(await factory.getCurrentCycle());
    let currentStartedCycle = Number(await factory.currentStartedCycle());
    let lastStartedCycle = Number(await factory.lastStartedCycle());
    console.log("currentCycle " + currentCycle);
    console.log("currentStartedCycle " + currentStartedCycle);
    console.log("lastStartedCycle " + lastStartedCycle);
    let lastActiveCycle;
    if (currentCycle != currentStartedCycle) {
        lastActiveCycle = currentStartedCycle;
    } else {
        lastActiveCycle = lastStartedCycle
    }
    console.log("parametru pe functie " + lastActiveCycle)
    if (cycle != -1) {
        console.log("here")
        console.log("*****************************")
        let ids = content;
        console.log("id uri mintate deja " + ids);
        console.log("##################################")
        console.log("##################################")
        const MintInfoContract = mintInfo(provider, mintInfoAddress);
        const XENFTContract = XENFT(provider, xenftAddress);
        console.log("sdsadsadsadasdasdadawdsa")
        let counter = 0;
        for (let i = 0; i < ids.length; i++) {
            console.log(ids[i]);
            let fileName = ids[i] + ".json";
            console.log("************************************");
            console.log(fileName);
            console.log(ids[i]);
            let tokenEntryCycle = Number(await factory.tokenEntryCycle(ids[i]));
            console.log("here")
            console.log(ids[i]);
            console.log(tokenEntryCycle)
            console.log("there");
            let dbxenftEntryPower = formatEther((await factory.dbxenftEntryPower(ids[i]))); // Replace this with your actual contract call
            console.log("*****")
            console.log("**************")
            console.log(tokenEntryCycle);
            console.log("*****")
            console.log("dbxenftEntryPower");
            console.log((dbxenftEntryPower));
            let rewardPerCycle = formatEther(await factory.rewardPerCycle(tokenEntryCycle)) // Replace this with your actual contract call
            console.log("rewardPerCycle");
            console.log(rewardPerCycle);
            let totalEntryPowerPerCycle = formatEther(await factory.totalEntryPowerPerCycle(tokenEntryCycle)); // Replace this with your actual contract call
            console.log("totalEntryPowerPerCycle")
            console.log(totalEntryPowerPerCycle)
            console.log("ggggg");
            console.log(mulDiv(dbxenftEntryPower.toString(), rewardPerCycle.toString(), totalEntryPowerPerCycle.toString()))
            let newPower = mulDiv(dbxenftEntryPower.toString(), rewardPerCycle.toString(), totalEntryPowerPerCycle.toString())
            console.log("************************************")
            console.log("newPower")
            console.log(newPower);
            let XENFTID = await factory.dbxenftUnderlyingXENFT(ids[i]);
            let mintInforesult = await XENFTContract.mintInfo(XENFTID);
            let mintInfoData = await MintInfoContract.decodeMintInfo(mintInforesult);
            let maturityTs = Number(mintInfoData[1]);
            try {
                // let response = await s3.getObject(params).promise();
                // let objectData = response.Body.toString('utf-8');
                let attributesValue = [{
                        "trait_type": "DBXEN NFT POWER",
                        "value": newPower.toString()
                    }, {
                        "trait_type": "ESTIMATED XEN",
                        "value": dbxenftEntryPower.toString(),
                    }, {
                        "trait_type": "MATURITY DATE",
                        "value": new Date(maturityTs * 1000).toString()
                    }]
                    //let imageLink = getImage(newPower);
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
                console.log("gegeesssssssssssssssssssssssssse")
                putStorageObject(params)
                    .then((result) => {
                        console.log(result)
                    }).catch((error) => console.log(error));
                counter++;
                console.log("L-AM URCAT!!!!");
            } catch (err) {
                console.log("dc pe eroare a???");
                console.log(err)
                if (err.code == "NoSuchKey") {
                    console.log("IMPOSIBIL SA NU AVEM FISIER AICI LA UPDATE!!!")
                } else {
                    throw err;
                }
            }
        }
        //This means all token id are .json and we put id in file
        if (counter === ids.length) {
            const putStorageParams = (key, body) => ({
                Bucket: REACT_APP_METADATA_BUCKET_POLYGON,
                Key: key,
                Body: JSON.stringify(body),
                "ContentType": "application/json",
            });
            putStorageObject(putStorageParams(fileName, { tokenId: content }))
                .then((result) => result.client_error && console.log(result));
        }
    }
    console.log("se scrie pe fisiesssssssssssssssssr");
}


// cron.schedule('17 13 18 * * *', async() => {
//     await generateAfterReveal();
// });

cron.schedule('*/11 * * * *', async() => {
    console.log("from here");
    // await generateAfterReveal();
    await getLast24HoursIdsMinted();
    //console.log(getLast24HoursIdsMinted());
});