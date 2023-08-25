import AWS from 'aws-sdk/global.js';
import S3 from 'aws-sdk/clients/s3.js';
import cron from 'node-cron';
import { JsonRpcProvider } from 'ethers';
import { ethers, formatUnits, formatEther } from 'ethers';
import Factory from "./dbxenftFactory.js";
import dotenv from 'dotenv';
import BigNumber from 'bignumber.js';
import Moralis from "moralis";
import ElasticInference from 'aws-sdk/clients/elasticinference.js';
dotenv.config();

const dbxenftFactoryAddress = "0x06623F5416C7BD2cE79e332276F718697D0AA39b";
AWS.config.update({
    secretAccessKey: process.env.REACT_APP_ACCESS_SECRET_POLYGON,
    accessKeyId: process.env.REACT_APP_ACCESS_KEY_POLYGON,
    region: process.env.REACT_APP_REGION,
});
const s3 = new AWS.S3();

async function generateAfterReveal() {
    const provider = new JsonRpcProvider("https://polygon-mumbai.blockpi.network/v1/rpc/public");
    let factory = Factory(provider, dbxenftFactoryAddress);
    // let currentCycle = Number(await factory.currentCycle());
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
    let lastActiveCycleFromFile = await readLastActiveCycle(lastActiveCycle);
    console.log("lastActiveCycleFromFile" + lastActiveCycleFromFile)
    if (lastActiveCycleFromFile != -1 && lastActiveCycleFromFile == true) {
        console.log(lastActiveCycleFromFile)
        console.log("here")
        console.log("ultimul ciclu activ " + lastActiveCycle)
        console.log("*****************************")
        let ids = await getIdsMintedPerCycle(lastActiveCycle);
        console.log("id uri mintate deja " + ids);
        console.log("##################################")
        console.log("##################################")
        let ok = false;
        for (let i = 0; i < ids.length; i++) {
            let fileName = ids[i] + ".json";
            console.log("************************************");
            console.log(fileName);
            console.log(ids[i]);
            let tokenEntryCycle = Number(await factory.tokenEntryCycle(ids[i]));
            let dbxenftEntryPower = ethers.utils.formatEther(await factory.dbxenftEntryPower(ids[i]))
            console.log("*****")
            console.log(Number(tokenEntryCycle))
            console.log(tokenEntryCycle);
            console.log("*****")
            console.log("dbxenftEntryPower");
            console.log((dbxenftEntryPower));
            let rewardPerCycle = ethers.utils.formatEther(await factory.rewardPerCycle(tokenEntryCycle))
            console.log("rewardPerCycle");
            console.log(rewardPerCycle);
            let totalEntryPowerPerCycle = ethers.utils.formatEther(await factory.totalEntryPowerPerCycle(tokenEntryCycle))
            console.log("totalEntryPowerPerCycle")
            console.log(totalEntryPowerPerCycle)
            console.log("ggggg");
            console.log(mulDiv(dbxenftEntryPower.toString(), rewardPerCycle.toString(), totalEntryPowerPerCycle.toString()))
            let newPower = mulDiv(dbxenftEntryPower.toString(), rewardPerCycle.toString(), totalEntryPowerPerCycle.toString())
            console.log("************************************")
            console.log("newPower")
            console.log(newPower)
            const params = {
                Bucket: process.env.REACT_APP_METADATA_BUCKET_POLYGON,
                Key: fileName,
            }
            try {
                let response = await s3.getObject(params).promise();
                let objectData = response.Body.toString('utf-8');
                let attributesValue = [{
                        "trait_type": "DBXEN NFT POWER",
                        "value": newPower.toString()
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

                (async() => {
                    s3.putObject({
                        Bucket: process.env.REACT_APP_METADATA_BUCKET_POLYGON,
                        Key: fileName,
                        Body: JSON.stringify(standardMetadata),
                        "ContentType": "application/json",
                    }).promise();
                })();
                console.log("L-AM URCAT!!!!");
                if (ok == false) {
                    updateLastActiveCycle(lastActiveCycle);
                    ok = true;
                }
            } catch (err) {
                console.log(err)
                if (err.code == "NoSuchKey") {
                    console.log("IMPOSIBIL SA NU AVEM FISIER AICI LA UPDATE!!!")
                } else {
                    throw err;
                }
            }
        }
    }
    console.log("se scrie pe fisier");
}

function getImage(power) {
    if (power >= 0 && power <= 500)
        return "https://imagesfornft.s3.eu-west-3.amazonaws.com/4DBXeNFT_1.jpg";
    if (power > 500 && power <= 1000)
        return "https://imagesfornft.s3.eu-west-3.amazonaws.com/4DBXeNFT_2.jpg"
    if (power > 1000 && power <= 2500)
        return "https://imagesfornft.s3.eu-west-3.amazonaws.com/4DBXeNFT_3.jpg"
    if (power > 2500 && power <= 5000)
        return "https://imagesfornft.s3.eu-west-3.amazonaws.com/4DBXeNFT_4.jpg"
    if (power > 5000 && power <= 7500)
        return "https://imagesfornft.s3.eu-west-3.amazonaws.com/4DBXeNFT_5.jpg"
    if (power > 7500 && power <= 10000)
        return "https://imagesfornft.s3.eu-west-3.amazonaws.com/4DBXeNFT_6.jpg"
    if (power > 10000 && power <= 12500)
        return "https://imagesfornft.s3.eu-west-3.amazonaws.com/5DBXeNFT_5.jpg"
    if (power > 12500 && power <= 15000)
        return "https://imagesfornft.s3.eu-west-3.amazonaws.com/5DBXeNFT_6.jpg"
    if (power > 15000)
        return "https://imagesfornft.s3.eu-west-3.amazonaws.com/6DBXeNFT_6.jpg"
}

async function getIdsMintedPerCycle(cycle) {
    let fileName = cycle + ".txt";

    const params = {
        Bucket: process.env.REACT_APP_CYCLES_BUCKET_POLYGON,
        Key: fileName,
    }
    console.log(process.env.REACT_APP_CYCLES_BUCKET_POLYGON);
    let ids;
    let removeNewLine;
    try {
        let response = await s3.getObject(params).promise();
        let objectData = response.Body.toString('utf-8');
        if (objectData.includes('\n')) {
            removeNewLine = objectData.split("\n");
            console.log(removeNewLine);
            ids = removeNewLine[0].concat(removeNewLine[1]);
        } else {
            ids = objectData.split(',');
        }
        console.log("id-uri curente am !!!!");
        console.log(ids);
        return ids;
    } catch (err) {
        console.log(err)
        if (err.code == "NoSuchKey") {
            console.log("IMPOSIBIL SA NU AVEM FISIER AICI LA UPDATE!!!")
        } else {
            throw err;
        }
    }
    return [];
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
    console.log(process.env.REACT_APP_MINTEDIDS_ACTIVE_CYCLES_POLYGON);
    const params = {
        Bucket: process.env.REACT_APP_MINTEDIDS_ACTIVE_CYCLES_POLYGON,
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
    console.log(process.env.REACT_APP_MINTEDIDS_ACTIVE_CYCLES_POLYGON);
    console.log(cycle);
    const params = {
        Bucket: process.env.REACT_APP_MINTEDIDS_ACTIVE_CYCLES_POLYGON,
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
                Bucket: process.env.REACT_APP_MINTEDIDS_ACTIVE_CYCLES_POLYGON,
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
    AWS.config.update({
        secretAccessKey: process.env.REACT_APP_ACCESS_SECRET_POLYGON,
        accessKeyId: process.env.REACT_APP_ACCESS_KEY_POLYGON,
        region: process.env.REACT_APP_REGION,
    })
    const s3 = new AWS.S3();
    let fileName = id + ".json";

    const params = {
        Bucket: process.env.REACT_APP_METADATA_BUCKET_POLYGON,
        Key: fileName,
    }

    try {
        let response = await s3.getObject(params).promise();
        let objectData = response.Body.toString('utf-8');
        console.log("ALREADY FILE EXIST!!!!!!!");
        console.log("update...........");
    } catch (err) {
        console.log(err)
        if (err.code == "NoSuchKey") {
            let attributesValue = [{
                "trait_type": "DBXEN NFT POWER",
                "value": "0"
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
                    Bucket: process.env.REACT_APP_METADATA_BUCKET_POLYGON,
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

    let idsForLastUpdateCycle = await getIdsMintedPerCycle(lastActiveCycle);
    console.log(" idsForLastUpdateCycle " + idsForLastUpdateCycle);
    Moralis.start({ apiKey: process.env.REACT_APP_MORALIS_KEY_NFT })
        .catch((e) => console.log("moralis error"))
    const response = await Moralis.EvmApi.events.getContractEvents({
        "chain": "0x13881",
        "topic": "0x351a36c9c7d284a243725ea280c7ca2b2b1b02bf301dd57d03cbc43956164e78",
        "fromDate": "2023-08-23T13:46:15.000Z",
        "address": "0x06623F5416C7BD2cE79e332276F718697D0AA39b",
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
    let differenceArray = [];
    for (let i = 0; i < idsFromEvent.length; i++) {
        if (!idsForLastUpdateCycle.includes(idsFromEvent[i].toString())) {
            differenceArray.push(idsFromEvent[i])
        }
    }
    console.log("3232");
    console.log(differenceArray);
    writeIds(differenceArray, idsForLastUpdateCycle, lastActiveCycle);
}

async function writeIds(differenceArray, idsForLastUpdateCycle, cycle) {
    AWS.config.update({
        secretAccessKey: process.env.REACT_APP_ACCESS_SECRET_POLYGON,
        accessKeyId: process.env.REACT_APP_ACCESS_KEY_POLYGON,
        region: process.env.REACT_APP_REGION,
    })

    const s3 = new AWS.S3();
    let fileName = cycle.toString() + ".txt";
    const params = {
        Bucket: process.env.REACT_APP_CYCLES_BUCKET_POLYGON,
        Key: fileName,
    }
    let content = ""
    if (idsForLastUpdateCycle != null)
        content = idsForLastUpdateCycle.toString() + "," + differenceArray.toString() + ",";
    else
        content = differenceArray.toString() + ",";

    try {
        (async() => {
            s3.putObject({
                Bucket: process.env.REACT_APP_CYCLES_BUCKET_POLYGON,
                Key: fileName,
                Body: content,
                "ContentType": "txt",
            }).promise();
            await generateAfterRevealForMissedIDS(cycle, differenceArray);
        })();
    } catch (err) {
        console.log(err)
        if (err.code == "NoSuchKey") {
            let newFileName = cycle.toString() + ".txt";
            (async() => {
                s3.putObject({
                    Bucket: process.env.REACT_APP_CYCLES_BUCKET_POLYGON,
                    Key: newFileName,
                    Body: content,
                    "ContentType": "txt",
                }).promise();
                await generateAfterRevealForMissedIDS(cycle, differenceArray);
            })();
        } else {
            throw err;
        }
    }
}

async function generateAfterRevealForMissedIDS(cycle, differenceArray) {
    console.log("generete pe after reveal!!!");
    console.log(differenceArray);
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
        let ids = differenceArray;
        console.log("id uri mintate deja " + ids);
        console.log("##################################")
        console.log("##################################")
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
            const result = String((await factory.dbxenftEntryPower(ids[i]))); // Replace this with your actual contract call
            console.log(result)
            const formattedValue = formatEther(result); // Convert to human-readable format
            console.log("*****")
            console.log(result);
            console.log(formattedValue)
            console.log("**************")
            console.log(Number(tokenEntryCycle))
            console.log(tokenEntryCycle);
            console.log("*****")
            console.log("dbxenftEntryPower");
            console.log((dbxenftEntryPower));
            const result2 = BigNumber((await factory.rewardPerCycle(ids[i]))) // Replace this with your actual contract call
                //const regularNumber2 = Number(result2); // Convert BigInt to regular number
            console.log(result2);
            const rewardPerCycle = ethers.utils.formatEther(result2.toString()); // Convert to human-readable format

            //let rewardPerCycle = ethers.utils.formatEther(Number(await factory.rewardPerCycle(tokenEntryCycle)))
            console.log("rewardPerCycle");
            console.log(rewardPerCycle);
            //let totalEntryPowerPerCycle = ethers.utils.formatEther(Number(await factory.totalEntryPowerPerCycle(tokenEntryCycle)))
            const result3 = BigNumber((await factory.totalEntryPowerPerCycle(ids[i]))); // Replace this with your actual contract call
            console.log(result3);
            // const regularNumber3 = Number(result3); // Convert BigInt to regular number
            const totalEntryPowerPerCycle = ethers.utils.formatEther(result3.toString()); // Convert to human-readable format
            console.log("totalEntryPowerPerCycle")
            console.log(totalEntryPowerPerCycle)
            console.log("ggggg");
            console.log(mulDiv(dbxenftEntryPower.toString(), rewardPerCycle.toString(), totalEntryPowerPerCycle.toString()))
            let newPower = mulDiv(dbxenftEntryPower.toString(), rewardPerCycle.toString(), totalEntryPowerPerCycle.toString())
            console.log("************************************")
            console.log("newPower")
            console.log(newPower)
            const params = {
                Bucket: process.env.REACT_APP_METADATA_BUCKET_POLYGON,
                Key: fileName,
            }
            try {
                let response = await s3.getObject(params).promise();
                let objectData = response.Body.toString('utf-8');
                let attributesValue = [{
                        "trait_type": "DBXEN NFT POWER",
                        "value": newPower.toString()
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

                (async() => {
                    s3.putObject({
                        Bucket: process.env.REACT_APP_METADATA_BUCKET_POLYGON,
                        Key: fileName,
                        Body: JSON.stringify(standardMetadata),
                        "ContentType": "application/json",
                    }).promise();
                })();
                console.log("L-AM URCAT!!!!");
            } catch (err) {
                console.log(err)
                if (err.code == "NoSuchKey") {
                    console.log("IMPOSIBIL SA NU AVEM FISIER AICI LA UPDATE!!!")
                } else {
                    throw err;
                }
            }
        }
    }
    console.log("se scrie pe fisier");
}


// cron.schedule('17 13 18 * * *', async() => {
//     await generateAfterReveal();
// });

cron.schedule('*/1 * * * *', async() => {
    await getLast24HoursIdsMinted();
});