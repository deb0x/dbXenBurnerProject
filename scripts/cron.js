import { type } from "os";

const AWS = require("aws-sdk");
const cron = require("node-cron");
require('dotenv').config()

export async function generateAfterReveal(id, power) {
    AWS.config.update({
        secretAccessKey: process.env.REACT_APP_ACCESS_SECRET,
        accessKeyId: process.env.REACT_APP_ACCESS_KEY,
        region: process.env.REACT_APP_REGION,
    })
    const s3 = new AWS.S3();
    let fileName = id + ".json";

    const params = {
        Bucket: process.env.REACT_APP_BUCKET,
        Key: fileName,
    }

    try {
        let response = await s3.getObject(params).promise();
        let objectData = response.Body.toString('utf-8');
        let attributesValue = [{
            "trait_type": "DBXEN NFT POWER",
            "value": power.toString()
        }]
        let standardMetadata = {
            "id": `${id}`,
            "name": `THIS IS REAL TEST DBXEN NFT #${id}, NOW REVEAL!`,
            "description": "DBXEN NFT FOR PASSIVE INCOME and reveal",
            "image": "https://imagesfornft.s3.eu-west-3.amazonaws.com/Screenshot+from+2023-07-05+16-28-05.png",
            "external_url": `https://dbxen.org/your-dbxenfts/${id}`,
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
    } catch (err) {
        console.log(err)
        if (err.code == "NoSuchKey") {
            console.log("IMPOSIBIL SA NU AVEM FISIER AICI LA UPDATE!!!")
        } else {
            throw err;
        }
    }
}


cron.schedule('*/1 * * * *', async() => {
    // let currentId = 5;
    // let lastId = await readLastId();
    // console.log("last id ", lastId);
    await updateData(2);
    // console.log("22222222222222222222");
    // await updateData(2);
    // console.log("111111111");
    // generateBeforeReveal(21);
    // generateBeforeReveal(22);
    // generateBeforeReveal(23);
    // generateBeforeReveal(24);
    // generateBeforeReveal(25);
    // await generateBeforeReveal(122, 11);
    // console.log("Sssssssssssssssssss")
    // getData("5.json");
    // for (let i = lastId; i <= currentId; i++) {
    //     console.log(i);
    //     generateAfterReveal(i, 110, 30).then(async(result) => {
    //         let name = i.toString() + ".json";
    //         console.log(name);
    //         addToAWS(name);
    //     })
    // }
});