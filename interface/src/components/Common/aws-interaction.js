import { type } from "os";

const AWS = require("aws-sdk");
const cron = require("node-cron");
require('dotenv').config()

// async function addToAWS(jsonFileName, revealOrUnreveal) {
//     const fs = require("fs");
//     console.log("apoi here!");
//     let configs;
//     if (!fs.existsSync(`./${revealOrUnreveal}/${jsonFileName}`)) {
//         console.log(`File ${jsonFileName} doesn't exist.`)
//         process.exit()
//     } else {
//         configs = JSON.parse(await fs.readFile(`./${revealOrUnreveal}/${jsonFileName}`, "utf-8"));
//     }
//     console.log(process.env.BUCKET);

//     (async() => {
//         s3.putObject({
//             Bucket: process.env.BUCKET,
//             Key: jsonFileName,
//             Body: JSON.stringify(configs),
//             "ContentType": "application/json",
//         }).promise();
//     })();

//     console.log("update s3...");
//     console.log("ADAUGAT")
// }

async function generateBeforeReveal(cycle, id) {
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
    } catch (err) {
        console.log(err)
        if (err.code == "NoSuchKey") {
            let attributesValue = [{
                "trait_type": "DBXEN NFT POWER",
                "value": "0"
            }, {
                "trait_type": "DBXEN STAKE",
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
                    Bucket: process.env.REACT_APP_BUCKET,
                    Key: fileName,
                    Body: JSON.stringify(standardMetadata),
                    "ContentType": "application/json",
                }).promise();
            })();
            console.log("LAST ACTIVE CYCLE!");
            console.log(await writeLastActiveCycle(cycle));
            console.log("update...........");
        } else {
            throw err;
        }
    }
}

async function writeLastActiveCycle(cycle) {
    console.log("here se intra!");
    AWS.config.update({
        secretAccessKey: process.env.REACT_APP_ACCESS_SECRET,
        accessKeyId: process.env.REACT_APP_ACCESS_KEY,
        region: process.env.REACT_APP_REGION,
    })
    const s3 = new AWS.S3();
    let fileName = "lastCycle.txt";
    const params = {
        Bucket: process.env.REACT_APP_BUCKET_IMAGE,
        Key: fileName,
    }

    try {
        let response = await s3.getObject(params).promise();
        let objectData = response.Body.toString('utf-8');
        console.log(objectData);
        console.log(typeof(objectData));
        console.log(typeof(cycle));
        if (Number(objectData) < cycle) {
            let content = cycle.toString();
            (async() => {
                s3.putObject({
                    Bucket: process.env.REACT_APP_BUCKET_IMAGE,
                    Key: fileName,
                    Body: cycle.toString(),
                    "ContentType": "txt",
                }).promise();
            })();
        } else {
            return Number(objectData);
        }
    } catch (err) {
        console.log(err)
        if (err.code == "NoSuchKey") {
            let content = cycle.toString();
            let newFileName = cycle.toString();
            (async() => {
                s3.putObject({
                    Bucket: process.env.REACT_APP_BUCKET_IMAGE,
                    Key: fileName,
                    Body: cycle.toString(),
                    "ContentType": "txt",
                }).promise();
            })();
            return cycle;
        } else {
            throw err;
        }
    }
}



// const fs = require("fs");
// let data = await readLastActiveCycle();
// if (Number(data.lastCycle) != cycle) {
//     let obj = {
//         "lastCycle": cycle,
//     }
//     console.log(obj)
//     await fs.writeFile(`lastActiveCycle.json`, JSON.stringify(obj), {
//         encoding: "utf8",
//     }, (err) => {
//         if (err) throw err;
//     })
// }

// async function readLastActiveCycle() {
//     const fs = require("fs");
//     let config;
//     if (!fs.existsSync("./lastActiveCycle.json")) {
//         console.log("lastActiveCycle.json doesn't exist.")
//         process.exit()
//     } else {
//         config = JSON.parse(await fs.readFile("./lastActiveCycle.json", "utf-8"))
//         return config;
//     }
// }

// async function generateAfterReveal(id, power, stakeAmount) {
//     const fs = require("fs");
//     let config = null;
//     let all_metadata = []
//     if (!fs.existsSync("./meta-config.json")) {
//         console.log("File meta-config.json doesn't exist.")
//         process.exit()
//     } else {
//         config = JSON.parse(await fs.readFile("./meta-config.json", "utf-8"))
//     }

//     const fillTemplate = function(templateString, templateVars) {
//         return new Function("return `" + templateString + "`;").call(templateVars);
//     }
//     const templateVarsForName = {
//         id: id
//     }
//     let name = fillTemplate(config.name, templateVarsForName);
//     let url = fillTemplate(config.external_url, templateVarsForName);
//     let attributes = [{
//         "trait_type": "DBXEN NFT POWER",
//         "value": power.toString()
//     }, {
//         "trait_type": "DBXEN STAKE",
//         "value": stakeAmount.toString()
//     }]

//     let description = config.description;
//     var obj = { id: id, name: name, description: description, image: config.image, external_url: url, attributes: attributes };
//     console.log(obj);
//     all_metadata.push(obj)
//     await fs.writeFile(`./metadata/${id}.json`, JSON.stringify(obj), {
//         encoding: "utf8",
//     }, (err) => {
//         if (err) throw err;
//     })
//     await addToAWS(id.toString() + ".json", "metadata");
// }

// async function updateData(cycle) {
//     const fs = require("fs");
//     let ids = [];
//     let lastActiveCycle = await readLastActiveCycle();
//     console.log("jere  eeee");
//     console.log(lastActiveCycle);
//     if (lastActiveCycle.lastCycle == 1) {
//         if (fs.existsSync(`./idsPerCycle/${lastActiveCycle.lastCycle}.txt`)) {
//             console.log("avem id de pe 1");
//             await fs.readFile(`./idsPerCycle/${lastActiveCycle.lastCycle}.txt`, 'utf-8', async(err, data) => {
//                 if (err) {
//                     throw err;
//                 } else {
//                     ids = data.split(' ');
//                     console.log("am id ul ");
//                     console.log(ids);
//                     for (let i = 0; i < ids.length; i++) {
//                         console.log("Ssssss")
//                         const params = { Bucket: process.env.BUCKET, Key: ids[i].toString() + '.json' }
//                         console.log(params);
//                         const response = await s3.getObject(params).promise() // await the promise
//                         const fileContent = response.Body.toString('utf-8');
//                         const jsonType = JSON.parse(fileContent);
//                         console.log("Actual content!");
//                         await generateAfterReveal(jsonType.id, 11, 22);
//                         await writeLastActiveCycle(cycle);
//                     }
//                 }
//             })
//         }
//     }
//     if (lastActiveCycle.lastCycle < cycle) {
//         const fs = require("fs");
//         console.log("E mai mic intradevar ");
//         if (fs.existsSync(`./idsPerCycle/${lastActiveCycle.lastCycle}.txt`)) {
//             console.log("avem id uri");
//             await fs.readFile(`./idsPerCycle/${lastActiveCycle.lastCycle}.txt`, 'utf-8', async(err, data) => {
//                 if (err) {
//                     throw err;
//                 } else {
//                     console.log("AICI AGAIN?");
//                     console.log(data)
//                     ids = data.split(' ');
//                     console.log("am id ul ");
//                     console.log(ids);
//                     for (let i = 0; i < ids.length; i++) {
//                         console.log("Ssssss")
//                         const params = { Bucket: process.env.BUCKET, Key: ids[i].toString() + '.json' }
//                         console.log(params);
//                         const response = await s3.getObject(params).promise() // await the promise
//                         const fileContent = response.Body.toString('utf-8');
//                         const jsonType = JSON.parse(fileContent);
//                         console.log("Actual content!");
//                         await generateAfterReveal(jsonType.id, 11, 22);
//                         await writeLastActiveCycle(cycle);
//                     }
//                 }
//             })
//         }
//     }
// }

// export async function writeNewId(cycle, id) {
//     const fs = require("fs");
//     console.log(cycle);
//     console.log(id);
//     if (!fs.existsSync(`./idsPerCycle/${cycle}.txt`)) {
//         console.log("Se intra aici!");
//         await fs.writeFile(`./idsPerCycle/${cycle}.txt`, id + " ");
//         await generateBeforeReveal(id);
//         await writeLastActiveCycle(cycle);
//     } else {
//         await fs.readFile(`./idsPerCycle/${cycle}.txt`, 'utf-8', async(err, data) => {
//             if (err) {
//                 throw err;
//             } else {
//                 let ids = data.split(' ');
//                 if (!ids.includes(id.toString())) {
//                     await fs.appendFileSync(`./idsPerCycle/${cycle}.txt`, " " + id);
//                     await generateBeforeReveal(id);
//                     await writeLastActiveCycle(cycle);
//                 }
//             }
//         })
//     }
// }
async function idsAlreadyMinted(id) {
    console.log("here se intra pe ids!");
    AWS.config.update({
        secretAccessKey: process.env.REACT_APP_ACCESS_SECRET,
        accessKeyId: process.env.REACT_APP_ACCESS_KEY,
        region: process.env.REACT_APP_REGION,
    })
    const s3 = new AWS.S3();
    let fileName = "allIdsMinted.txt";
    const params = {
        Bucket: process.env.REACT_APP_BUCKET_IMAGE,
        Key: fileName,
    }
    let ids;
    let removeNewLine;
    try {
        let response = await s3.getObject(params).promise();
        let objectData = response.Body.toString('utf-8')
        if (objectData.includes('\n')) {
            removeNewLine = objectData.split("\n");
            console.log(removeNewLine);
            ids = removeNewLine[0].concat(removeNewLine[1]);
        } else {
            ids = objectData.split(',');
        }
        console.log("herewwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww");
        console.log(ids);
        if (!ids.includes(id.toString())) {
            ids.push(id);
            (async() => {
                s3.putObject({
                    Bucket: process.env.REACT_APP_BUCKET_IMAGE,
                    Key: fileName,
                    Body: ids.toString(),
                    "ContentType": "txt",
                }).promise();
            })();
            console.log("AM PE RETURN1!!!!!!!!!");
            console.log(ids);
            return ids;
        } else {
            return ids
        }
    } catch (err) {
        console.log(err)
        if (err.code == "NoSuchKey") {
            let content = id.toString();
            (async() => {
                s3.putObject({
                    Bucket: process.env.REACT_APP_BUCKET_IMAGE,
                    Key: fileName,
                    Body: content,
                    "ContentType": "txt",
                }).promise();
            })();
            console.log("AM PE RETURN1!!!!!!!!!");
            console.log(ids);
            return [id];
        } else {
            throw err;
        }
    }
}

export async function writePerCycle(cycle, id) {
    AWS.config.update({
        secretAccessKey: process.env.REACT_APP_ACCESS_SECRET,
        accessKeyId: process.env.REACT_APP_ACCESS_KEY,
        region: process.env.REACT_APP_REGION,
    })
    const s3 = new AWS.S3();
    let fileName = cycle.toString() + ".txt";
    const params = {
        Bucket: process.env.REACT_APP_BUCKET_PER_CYCLE,
        Key: fileName,
    }
    let idsMinted = await idsAlreadyMinted(id);
    console.log(idsMinted);
    let ids;
    let removeNewLine;
    console.log(id);
    if (!idsMinted.includes(id.toString())) {
        try {
            let response = await s3.getObject(params).promise();
            let objectData = response.Body.toString('utf-8')
            if (objectData.includes('\n')) {
                removeNewLine = objectData.split("\n");
                console.log(removeNewLine);
                ids = removeNewLine[0].concat(removeNewLine[1]);
            } else {
                ids = objectData.split(',');
            }
            console.log("here");
            console.log(ids);
            if (!ids.includes(id.toString())) {
                ids.push(id);
                (async() => {
                    s3.putObject({
                        Bucket: process.env.REACT_APP_BUCKET_PER_CYCLE,
                        Key: fileName,
                        Body: ids.toString(),
                        "ContentType": "txt",
                    }).promise();
                    await generateBeforeReveal(cycle, id);
                })();
            }
        } catch (err) {
            console.log(err)
            if (err.code == "NoSuchKey") {
                let content = id.toString();
                let newFileName = cycle.toString() + ".txt";
                (async() => {
                    s3.putObject({
                        Bucket: process.env.REACT_APP_BUCKET_PER_CYCLE,
                        Key: newFileName,
                        Body: content,
                        "ContentType": "txt",
                    }).promise();
                    await generateBeforeReveal(cycle, id);
                })();
            } else {
                throw err;
            }
        }
    }
}

//     if (!fs.existsSync(`./idsPerCycle/${cycle}.txt`)) {
//         console.log("Se intra aici!");
//         await fs.writeFile(`./idsPerCycle/${cycle}.txt`, id + " ");
//         await generateBeforeReveal(id);
//         await writeLastActiveCycle(cycle);
//     } else {
//         await fs.readFile(`./idsPerCycle/${cycle}.txt`, 'utf-8', async(err, data) => {
//             if (err) {
//                 throw err;
//             } else {
//                 let ids = data.split(' ');
//                 if (!ids.includes(id.toString())) {
//                     await fs.appendFileSync(`./idsPerCycle/${cycle}.txt`, " " + id);
//                     await generateBeforeReveal(id);
//                     await writeLastActiveCycle(cycle);
//                 }
//             }
//         })
//     }


// s3.getObject(params, function(err, data) {
//     // Handle any error and exit
//     if (err)
//         console.log(err);

//     // No error happened
//     // Convert Body from a Buffer to a String
//     if (data != undefined) {
//         let objectData = data.Body.toString('utf-8'); // Use the encoding necessary
//         console.log(JSON.parse(objectData))
//     }
// }).on('error', error => {
//     console.log("Sss")
//     console.log(error)
//         // Catching NoSuchKey & StreamContentLengthMismatch
// });

// s3.getObject(params).then((result) => {
//     let objectData = result.Body.toString('utf-8'); // Use the encoding necessary
//     console.log(JSON.parse(objectData))
// }).catch((err: any) => {
//     console.log(err)
// })

// try {
//     const response = await s3.getObject(params).promise()
// } catch (err) {
//     console.log(err);
// }


// console.log(response);
// const fileContent = response.Body.toString('utf-8');
// const jsonType = JSON.parse(fileContent);
// console.log(fileContent);


// async function updateData(cycle) {
//     // console.log("Ssssssssss");
//     // await readLastId(cycle);
//     // let idsPerCycle = await readLastId(cycle);
//     // console.log("ggggggggggggggggggggggggggggg")
//     // console.log(idsPerCycle);
//     // console.log(idsPerCycle[0]);
//     // if (idsPerCycle.length != 0) {
//     //     for (let i = 0; i < idsPerCycle.length; i++) {
//     //         console.log("jersssssssssssssse");
//     //         const params = { Bucket: process.env.BUCKET, Key: idsPerCycle[i].toString() + '.json' }
//     //         const response = await s3.getObject(params).promise() // await the promise
//     //         const fileContent = response.Body.toString('utf-8');
//     //         const jsonType = JSON.parse(fileContent);
//     //         console.log("Actual content!");
//     //         await generateAfterReveal(jsonType.id, 3333, 111);
//     //     }
//     // }
// }
// cron.schedule('*/1 * * * *', async() => {
//     // let currentId = 5;
//     // let lastId = await readLastId();
//     // console.log("last id ", lastId);
//     await updateData(2);
//     // console.log("22222222222222222222");
//     // await updateData(2);
//     // console.log("111111111");
//     // generateBeforeReveal(21);
//     // generateBeforeReveal(22);
//     // generateBeforeReveal(23);
//     // generateBeforeReveal(24);
//     // generateBeforeReveal(25);
//     // await generateBeforeReveal(122, 11);
//     // console.log("Sssssssssssssssssss")
//     // getData("5.json");
//     // for (let i = lastId; i <= currentId; i++) {
//     //     console.log(i);
//     //     generateAfterReveal(i, 110, 30).then(async(result) => {
//     //         let name = i.toString() + ".json";
//     //         console.log(name);
//     //         addToAWS(name);
//     //     })
//     // }
// });