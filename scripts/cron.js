import AWS from 'aws-sdk/global.js';
import S3 from 'aws-sdk/clients/s3.js';
import cron from 'node-cron'
import ethers from "ethers"
import Factory from "./dbxenftFactory.js";
import dotenv from 'dotenv'
import BigNumber from 'bignumber.js';
dotenv.config()

const dbxenftFactoryAddress = "0xd2d0d9264D4eC70768617CE04Df7E99A8514ea26";
AWS.config.update({
    secretAccessKey: process.env.REACT_APP_ACCESS_SECRET,
    accessKeyId: process.env.REACT_APP_ACCESS_KEY,
    region: process.env.REACT_APP_REGION,
})
const s3 = new AWS.S3();

async function generateAfterReveal() {
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.blockpi.network/v1/rpc/public");
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
                Bucket: process.env.REACT_APP_BUCKET,
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
                        Bucket: process.env.REACT_APP_BUCKET,
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
        Bucket: process.env.REACT_APP_BUCKET_PER_CYCLE,
        Key: fileName,
    }
    console.log(process.env.REACT_APP_BUCKET_PER_CYCLE);
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
    console.log(process.env.REACT_APP_BUCKET_IMAGE);
    const params = {
        Bucket: process.env.REACT_APP_BUCKET_IMAGE,
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
    console.log(process.env.REACT_APP_BUCKET_IMAGE);
    console.log(cycle);
    const params = {
        Bucket: process.env.REACT_APP_BUCKET_IMAGE,
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
                Bucket: process.env.REACT_APP_BUCKET_IMAGE,
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

// cron.schedule('17 13 18 * * *', async() => {
//     await generateAfterReveal();
// });

cron.schedule('*/11 * * * *', async() => {
    await generateAfterReveal(1);
});