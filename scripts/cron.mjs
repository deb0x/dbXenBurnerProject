import AWS from 'aws-sdk/global.js';
import S3 from 'aws-sdk/clients/s3.js';
import cron from 'node-cron'
import ethers from "ethers"
import Factory from "./dbxenftFactory.js";
import dotenv from 'dotenv'
import BigNumber from 'bignumber.js';
dotenv.config()

const dbxenftFactoryAddress = "0x1Ee075c785C3853FCFe4E248905e094bdd7d74B8";
AWS.config.update({
    secretAccessKey: process.env.REACT_APP_ACCESS_SECRET,
    accessKeyId: process.env.REACT_APP_ACCESS_KEY,
    region: process.env.REACT_APP_REGION,
})
const s3 = new AWS.S3();

async function generateAfterReveal(id, power) {
    const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.blockpi.network/v1/rpc/public");
    let factory = Factory(provider, dbxenftFactoryAddress);
    let ids = await getIdsMintedPerCycle(0);
    for (let i = 0; i < ids.length; i++) {
        let fileName = ids[i] + ".json";
        let tokenEntryCycle = Number(await factory.tokenEntryCycle(ids[i]));
        let dbxenftEntryPower = await factory.dbxenftEntryPower(ids[i]);
        console.log("*****")
        console.log(Number(tokenEntryCycle))
        console.log(ethers.utils.formatUnits(tokenEntryCycle));
        console.log("*****")
        console.log("dbxenftEntryPower");
        console.log(ethers.utils.formatUnits((dbxenftEntryPower)));
        let rewardPerCycle = await factory.rewardPerCycle(tokenEntryCycle)
        console.log("rewardPerCycle");
        console.log(ethers.utils.formatUnits(rewardPerCycle));
        let totalEntryPowerPerCycle = await factory.totalEntryPowerPerCycle(tokenEntryCycle)
        console.log("totalEntryPowerPerCycle")
        console.log(ethers.utils.formatUnits(totalEntryPowerPerCycle))
        console.log("ggggg");
        console.log(mulDiv(dbxenftEntryPower.toString(), rewardPerCycle.toString(), totalEntryPowerPerCycle.toString()))
            // const params = {
            //     Bucket: process.env.REACT_APP_BUCKET,
            //     Key: fileName,
            // }
            // try {
            //     let response = await s3.getObject(params).promise();
            //     let objectData = response.Body.toString('utf-8');
            //     let attributesValue = [{
            //         "trait_type": "DBXEN NFT POWER",
            //         "value": power.toString()
            //     }]
            //     let standardMetadata = {
            //         "id": `${id}`,
            //         "name": `THIS IS REAL TEST DBXEN NFT #${id}, NOW REVEAL!`,
            //         "description": "DBXEN NFT FOR PASSIVE INCOME and reveal",
            //         "image": "https://imagesfornft.s3.eu-west-3.amazonaws.com/Screenshot+from+2023-07-05+16-28-05.png",
            //         "external_url": `https://dbxen.org/your-dbxenfts/${id}`,
            //         "attributes": attributesValue
            //     }
            //     console.log(JSON.stringify(standardMetadata));

        //     (async() => {
        //         s3.putObject({
        //             Bucket: process.env.REACT_APP_BUCKET,
        //             Key: fileName,
        //             Body: JSON.stringify(standardMetadata),
        //             "ContentType": "application/json",
        //         }).promise();
        //     })();
        //     console.log("L-AM URCAT!!!!");
        // } catch (err) {
        //     console.log(err)
        //     if (err.code == "NoSuchKey") {
        //         console.log("IMPOSIBIL SA NU AVEM FISIER AICI LA UPDATE!!!")
        //     } else {
        //         throw err;
        //     }
        // }
    }
}

async function getIdsMintedPerCycle(cycle) {
    console.log("Fffffffffff");

    let fileName = cycle + ".txt";

    const params = {
        Bucket: process.env.REACT_APP_BUCKET_PER_CYCLE,
        Key: fileName,
    }
    console.log(process.env.REACT_APP_BUCKET_PER_CYCLE);
    let ids;
    let removeNewLine;
    console.log("Dddddddd")
    try {
        let response = await s3.getObject(params).promise();
        let objectData = response.Body.toString('utf-8');
        console.log(objectData)
        if (objectData.includes('\n')) {
            removeNewLine = objectData.split("\n");
            console.log(removeNewLine);
            ids = removeNewLine[0].concat(removeNewLine[1]);
        } else {
            ids = objectData.split(',');
        }
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

cron.schedule('*/1 * * * *', async() => {
    await generateAfterReveal(2, 2);

});