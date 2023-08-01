const fs = require("fs-extra");
const AWS = require("aws-sdk");
const cron = require("node-cron");
require('dotenv').config()

AWS.config.update({
    secretAccessKey: process.env.ACCESS_SECRET,
    accessKeyId: process.env.ACCESS_KEY,
    region: process.env.REGION,
})
const s3 = new AWS.S3();

async function addToAWS(jsonFileName) {
    let configs;
    if (!fs.existsSync(`./metadata/${jsonFileName}`)) {
        console.log(`File ${jsonFileName} doesn't exist.`)
        process.exit()
    } else {
        configs = JSON.parse(await fs.readFile(`./metadata/${jsonFileName}`, "utf-8"));
        console.log("De aici am ");
        console.log(configs)
    }

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

async function generateBeforeReveal(cycle, id) {
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
        //await fs.writeFile("./all.json", JSON.stringify(all_metadata), "utf-8");
}

async function writeLastActiveCycle(cycle) {
    await fs.writeFile(`lastActiveCycle.txt`, cycle.toString(), "utf-8"),
        function(err) {
            if (err) throw err;
            console.log('completed');
        }
}

async function readLastActiveCycle() {
    if (fs.existsSync(`lastActiveCycle.txt`)) {
        await fs.readFile(`lastActiveCycle.txt`, 'utf-8', (err, data) => {
            if (err) {
                throw err;
            } else {
                return Number(data);
            }
        })
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
        //await fs.writeFile("./all.json", JSON.stringify(all_metadata), "utf-8");
}

async function readLastId(id) {
    let ids = [];
    if (fs.existsSync(`./idsPerCycle/${id}.txt`)) {
        fs.readFile(`./idsPerCycle/${id}.txt`, 'utf-8', (err, data) => {
            if (err) {
                throw err;
            } else {
                console.log(data)
                ids = data.split(' ');
            }
        })
    }
    return ids;
}

async function writeNewId(id) {
    console.log(!fs.existsSync(`./idsPerCycle/${id}.txt`));
    if (!fs.existsSync(`./idsPerCycle/${id}.txt`)) {
        await fs.writeFile(`./idsPerCycle/${id}.txt`, id + " "),
            console.log("pe assta?");
    } else {
        console.log("sau aici?");
        await fs.appendFileSync(`./idsPerCycle/${id}.txt`, 332 + " ");
    }
}

async function getData(jsonFileName) {
    const params = { Bucket: process.env.BUCKET, Key: '5.json' }
    const response = await s3.getObject(params).promise() // await the promise
    const fileContent = response.Body.toString('utf-8');
    const jsonType = JSON.parse(fileContent);
    console.log(jsonType);
    console.log(jsonType.id);
    await generateAfterReveal(jsonType.id, 3333, 111);
    let name = jsonType.id.toString() + ".json";
    await addToAWS(name);
}
// const response = await s3.getObject(params).promise() // await the promise
// const fileContent = response.Body.toString('utf-8');

cron.schedule('*/1 * * * *', async() => {
    // let currentId = 5;
    // let lastId = await readLastId();
    // console.log("last id ", lastId);
    let lastActive = await readLastActiveCycle();
    console.log("Ssssssss");
    console.log(lastActive);
    await generateBeforeReveal(122, 11);
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