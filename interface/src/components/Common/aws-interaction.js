const fs = require("fs-extra");
const AWS = require("aws-sdk");
const cron = require("node-cron");
const { faCropSimple } = require("@fortawesome/free-solid-svg-icons");
require('dotenv').config()

AWS.config.update({
    secretAccessKey: process.env.ACCESS_SECRET,
    accessKeyId: process.env.ACCESS_KEY,
    region: process.env.REGION,
})
const s3 = new AWS.S3();

async function addToAWS(jsonFileName, revealOrUnreveal) {
    console.log("apoi here!");
    let configs;
    if (!fs.existsSync(`./${revealOrUnreveal}/${jsonFileName}`)) {
        console.log(`File ${jsonFileName} doesn't exist.`)
        process.exit()
    } else {
        configs = JSON.parse(await fs.readFile(`./${revealOrUnreveal}/${jsonFileName}`, "utf-8"));
        console.log("De aici am ");
        console.log(configs)
    }
    console.log(process.env.BUCKET);

    (async() => {
        s3.putObject({
            Bucket: process.env.BUCKET,
            Key: jsonFileName,
            Body: JSON.stringify(configs),
            "ContentType": "application/json",
        }).promise();
    })();

    console.log("update s3...");
    console.log("ADAUGAT")
}

async function generateBeforeReveal(id) {
    let config = null;
    let all_metadata = []
    if (!fs.existsSync("./meta-config-unreveal.json")) {
        console.log("File meta-config-unreveal.json doesn't exist.")
        process.exit()
    } else {
        config = JSON.parse(await fs.readFile("./meta-config-unreveal.json", "utf-8"))
    }

    const fillTemplate = function(templateString, templateVars) {
        return new Function("return `" + templateString + "`;").call(templateVars);
    }
    const templateVarsForName = {
        id: id
    }
    let name = fillTemplate(config.name, templateVarsForName);
    let url = fillTemplate(config.external_url, templateVarsForName);
    let attributes = [{
        dbxen_nft_power: 0,
        dbxenstake: 0,
    }]
    let description = config.description;
    var obj = { id: id, name: name, description: description, image: config.image, external_url: url, attributes: attributes };
    all_metadata.push(obj)
    await fs.writeFile(`./metadata-unreveal/${id}.json`, JSON.stringify(obj), "utf-8"),
        function(err) {
            if (err) throw err;
            console.log('completed');
        }
    console.log("here!");
    await addToAWS(id.toString() + ".json", "metadata-unreveal");
}

async function writeLastActiveCycle(cycle) {
    let data = await readLastActiveCycle();
    if (Number(data.lastCycle) != cycle) {
        let obj = {
            "lastCycle": cycle,
        }
        console.log(obj)
        await fs.writeFile(`lastActiveCycle.json`, JSON.stringify(obj), "utf-8"),
            function(err) {
                if (err) throw err;
                console.log('completed');
            }
    }
}

async function readLastActiveCycle() {
    if (!fs.existsSync("./lastActiveCycle.json")) {
        console.log("lastActiveCycle.json doesn't exist.")
        process.exit()
    } else {
        config = JSON.parse(await fs.readFile("./lastActiveCycle.json", "utf-8"))
        return config;
    }
}

async function generateAfterReveal(id, power, stakeAmount) {
    let config = null;
    let all_metadata = []
    if (!fs.existsSync("./meta-config.json")) {
        console.log("File meta-config.json doesn't exist.")
        process.exit()
    } else {
        config = JSON.parse(await fs.readFile("./meta-config.json", "utf-8"))
    }

    const fillTemplate = function(templateString, templateVars) {
        return new Function("return `" + templateString + "`;").call(templateVars);
    }
    const templateVarsForName = {
        id: id
    }
    let name = fillTemplate(config.name, templateVarsForName);
    let url = fillTemplate(config.external_url, templateVarsForName);
    let attributes = [{
        dbxen_nft_power: power,
        dbxenstake: stakeAmount,
    }]
    let description = config.description;
    var obj = { id: id, name: name, description: description, image: config.image, external_url: url, attributes: attributes };
    console.log(obj);
    all_metadata.push(obj)
    await fs.writeFile(`./metadata/${id}.json`, JSON.stringify(obj), "utf-8"),
        function(err) {
            if (err) throw err;
            console.log('completed');
        }
    await addToAWS(id.toString() + ".json", "metadata");
}

async function updateData(cycle) {
    let ids = [];
    let lastActiveCycle = await readLastActiveCycle();
    console.log("jere  eeee");
    console.log(lastActiveCycle);
    if (lastActiveCycle.lastCycle < cycle) {
        console.log("E mai mic intradevar ");
        if (fs.existsSync(`./idsPerCycle/${cycle}.txt`)) {
            console.log("avem id uri");
            await fs.readFile(`./idsPerCycle/${cycle}.txt`, 'utf-8', async(err, data) => {
                if (err) {
                    throw err;
                } else {
                    console.log("AICI AGAIN?");
                    console.log(data)
                    ids = data.split(' ');
                    console.log(ids.length);
                    console.log(ids[3]);
                    for (let i = 0; i < ids.length; i++) {
                        console.log("Ssssss")
                        const params = { Bucket: process.env.BUCKET, Key: ids[i].toString() + '.json' }
                        console.log(params);
                        const response = await s3.getObject(params).promise() // await the promise
                        const fileContent = response.Body.toString('utf-8');
                        const jsonType = JSON.parse(fileContent);
                        console.log("Actual content!");
                        await generateAfterReveal(jsonType.id, 21, 13);
                        await writeLastActiveCycle(cycle);
                    }
                }
            })
        }
    }
}

async function writeNewId(cycle, id) {
    if (!fs.existsSync(`./idsPerCycle/${cycle}.txt`)) {
        console.log("Se intra aici!");
        await fs.writeFile(`./idsPerCycle/${cycle}.txt`, id + " ");
        await generateBeforeReveal(id);
    } else {
        console.log("sau aici?");
        await fs.appendFileSync(`./idsPerCycle/${cycle}.txt`, id + " ");
        await generateBeforeReveal(id);
    }
}

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

cron.schedule('*/1 * * * *', async() => {
    // let currentId = 5;
    // let lastId = await readLastId();
    // console.log("last id ", lastId);
    console.log("22222222222222222222");
    await updateData(2);
    console.log("111111111");
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