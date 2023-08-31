const AWS = require("aws-sdk");
const cron = require("node-cron");
require('dotenv').config()

async function generateBeforeReveal(cycle, id) {
    console.log("12222222222sss222321");
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
        console.log("response");
        console.log(response)
        let objectData = response.Body.toString('utf-8');
        console.log("ALREADY FILE EXIST!!!!!!!");
        console.log(await writeLastActiveCycle(cycle));
        console.log("update...........");
    } catch (err) {
        console.log("EROARE EROARE EROARE!!!!")
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
                    Tagging: 'public=yes',
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

// async function writeLastActiveCycle(cycle) {
//     console.log("here se intra!");
//     AWS.config.update({
//         secretAccessKey: process.env.REACT_APP_ACCESS_SECRET,
//         accessKeyId: process.env.REACT_APP_ACCESS_KEY,
//         region: process.env.REACT_APP_REGION,
//     })
//     const s3 = new AWS.S3();
//     let fileName = "lastCycle.txt";
//     const params = {
//         Bucket: process.env.REACT_APP_BUCKET_IMAGE,
//         Key: fileName,
//     }

//     try {
//         let response = await s3.getObject(params).promise();
//         let objectData = response.Body.toString('utf-8');
//         console.log(objectData);
//         console.log(typeof(objectData));
//         console.log(typeof(cycle));
//         if (Number(objectData) == -1) {
//             let content = cycle.toString();
//             (async() => {
//                 s3.putObject({
//                     Bucket: process.env.REACT_APP_BUCKET_IMAGE,
//                     Key: fileName,
//                     Body: cycle.toString(),
//                     "ContentType": "txt",
//                 }).promise();
//             })();
//         } else {
//             return Number(objectData);
//         }
//     } catch (err) {
//         console.log(err)
//         if (err.code == "NoSuchKey") {
//             let content = cycle.toString();
//             let newFileName = cycle.toString();
//             (async() => {
//                 s3.putObject({
//                     Bucket: process.env.REACT_APP_BUCKET_IMAGE,
//                     Key: fileName,
//                     Body: cycle.toString(),
//                     "ContentType": "txt",
//                 }).promise();
//             })();
//             return cycle;
//         } else {
//             throw err;
//         }
//     }
// }

export async function writeLastActiveCycle(cycle) {
    console.log("here se intra!");
    AWS.config.update({
        secretAccessKey: process.env.REACT_APP_ACCESS_SECRET_POLYGON,
        accessKeyId: process.env.REACT_APP_ACCESS_KEY_POLYGON,
        region: process.env.REACT_APP_REGION,
    })
    const s3 = new AWS.S3();
    let fileName = "lastCycle.txt";
    const params = {
        Bucket: process.env.REACT_APP_METADATA_BUCKET_POLYGON,
        Key: fileName,
    }

    let ids;
    let removeNewLine;
    try {
        let response = await s3.getObject(params).promise();
        let objectData = response.Body.toString('utf-8');
        console.log("Se intra aici!!!!");
        console.log(objectData)
        let data = objectData.split('\n');
        console.log(data);
        console.log(data.length)
        console.log(data.length - 1)
        console.log(data[data.length - 2]);
        console.log(JSON.parse(data[data.length - 2]));
        if ((JSON.parse(data[data.length - 2])).cycle != cycle) {
            console.log("DIFERIT");
            let initContent = objectData.concat(`{"cycle": ${cycle},"alreadyUpdated": false}`);
            console.log(initContent)
            let content = initContent.concat('\n')
            console.log(content);
            (async() => {
                s3.putObject({
                    Bucket: process.env.REACT_APP_METADATA_BUCKET_POLYGON,
                    Key: fileName,
                    Body: content,
                    "ContentType": "txt",
                }).promise();
            })();
        } else {
            console.log("exista deja ");
        }
    } catch (err) {
        console.log(err)
        if (err.code == "NoSuchKey") {
            console.log(err)
            console.log("ghggggggggggggggggggggggggggggg");
            let content = (`{"cycle": ${cycle},"alreadyUpdated": false}`).concat("\n")
            console.log(content);
            (async() => {
                s3.putObject({
                    Bucket: process.env.REACT_APP_MINTEDIDS_ACTIVE_CYCLES_POLYGON,
                    Key: fileName,
                    Body: content,
                    "ContentType": "txt",
                }).promise();
            })();
        } else {
            throw err;
        }
    }
}

export async function generateAfterReveal(id, power) {
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

export async function getIdsMintedPerCycle(cycle) {
    AWS.config.update({
        secretAccessKey: process.env.REACT_APP_ACCESS_SECRET_POLYGON,
        accessKeyId: process.env.REACT_APP_ACCESS_KEY_POLYGON,
        region: process.env.REACT_APP_REGION,
    })
    const s3 = new AWS.S3();
    let fileName = cycle + ".txt";

    const params = {
        Bucket: process.env.REACT_APP_CYCLES_BUCKET_POLYGON,
        Key: fileName,
    }
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

async function idsAlreadyMinted(id) {
    console.log("here se intra pe ids!");
    AWS.config.update({
        secretAccessKey: process.env.REACT_APP_ACCESS_SECRET_POLYGON,
        accessKeyId: process.env.REACT_APP_ACCESS_KEY_POLYGON,
        region: process.env.REACT_APP_REGION,
    })

    const s3 = new AWS.S3();
    let fileName = "allIdsMinted.txt";
    const params = {
        Bucket: process.env.REACT_APP_METADATA_BUCKET_POLYGON,
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
                    Bucket: process.env.REACT_APP_METADATA_BUCKET_POLYGON,
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
                    Bucket: process.env.REACT_APP_MINTEDIDS_ACTIVE_CYCLES_POLYGON,
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
    console.log("INTRU AICI !!!!!");
    AWS.config.update({
        secretAccessKey: process.env.REACT_APP_ACCESS_SECRET_POLYGON,
        accessKeyId: process.env.REACT_APP_ACCESS_KEY_POLYGON,
        region: process.env.REACT_APP_REGION,
    })


    const s3 = new AWS.S3();
    let fileName = cycle.toString() + ".txt";
    const params = {
        Bucket: process.env.REACT_APP_METADATA_BUCKET_POLYGON,
        Key: fileName,
    }
    let idsMinted = await idsAlreadyMinted(id);
    console.log("sssssssssssssssssssssssssssssssssssssssssss")
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
                        Bucket: process.env.REACT_APP_CYCLES_BUCKET_POLYGON,
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
                        Bucket: process.env.REACT_APP_CYCLES_BUCKET_POLYGON,
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


// export async function updateData(lastActiveCycle) {
//     console.log("here se intra la update!");
//     AWS.config.update({
//         secretAccessKey: process.env.REACT_APP_ACCESS_SECRET,
//         accessKeyId: process.env.REACT_APP_ACCESS_KEY,
//         region: process.env.REACT_APP_REGION,
//     })
//     const s3 = new AWS.S3();
//     let removeNewLine;
//     let ids;
//     let fileName = "lastCycle.txt";
//     const params = {
//         Bucket: process.env.REACT_APP_BUCKET_PER_CYCLE,
//         Key: fileName,
//     }

//     try {
//         let response = await s3.getObject(params).promise();
//         let objectData = response.Body.toString('utf-8')
//         if (objectData.includes('\n')) {
//             removeNewLine = objectData.split("\n");
//             console.log(removeNewLine);
//             ids = removeNewLine[0].concat(removeNewLine[1]);
//         } else {
//             ids = objectData.split(',');
//         }
//         if (!ids.includes(id.toString())) {
//             ids.push(id);
//             (async() => {
//                 s3.putObject({
//                     Bucket: process.env.REACT_APP_BUCKET_PER_CYCLE,
//                     Key: fileName,
//                     Body: ids.toString(),
//                     "ContentType": "txt",
//                 }).promise();
//                 await generateBeforeReveal(cycle, id);
//             })();
//         }
//     } catch (err) {
//         console.log(err)
//         if (err.code == "NoSuchKey") {
//             let content = id.toString();
//             let newFileName = cycle.toString() + ".txt";
//             (async() => {
//                 s3.putObject({
//                     Bucket: process.env.REACT_APP_BUCKET_PER_CYCLE,
//                     Key: newFileName,
//                     Body: content,
//                     "ContentType": "txt",
//                 }).promise();
//                 await generateBeforeReveal(cycle, id);
//             })();
//         } else {
//             throw err;
//         }
//     }
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