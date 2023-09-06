require('dotenv').config()

const STORAGE_EP = "https://dbxen-be.prodigy-it-solutions.com/api/storage/";
const IMAGE_EP = "https://dbxen-be.prodigy-it-solutions.com/api/assets/";
const REACT_APP_METADATA_BUCKET_POLYGON = "deboxnft-metadata-polygon"
    // const REACT_APP_METADATA_BUCKET_POLYGON=""
const IMAGE_BUCKET = "deboxnft-assets-polygon";

const createApiOptions = (data) =>
    ({ method: "POST", body: JSON.stringify(data) });

const getStorageObject = (data) =>
    fetch(STORAGE_EP + "GetObjectCommand", createApiOptions(data))
    .then((result) => result.json());

const putStorageObject = (data) =>
    fetch(STORAGE_EP + "PutObjectCommand", createApiOptions(data))
    .then((result) => result.json());

const createApiOptionsForGet = data =>
    ({ method: "GET", body: JSON.stringify(data) });

const getAssets = (data) =>
    fetch(IMAGE_EP, createApiOptionsForGet(data))
    .then((result) => {
        console.log(result)
        return result.json()
    });

async function generateBeforeReveal(cycle, id) {
    console.log("se intra!!!");
    let fileName = id + ".json";

    const params = {
        Bucket: REACT_APP_METADATA_BUCKET_POLYGON,
        Key: fileName,
    }

    const imageParams = {
        Bucket: IMAGE_BUCKET,
        Key: "dbxenNft-beforeReveal.png" 
    }
    let objectData = await getStorageObject(params);
    let imageData = await getAssets(imageParams)

    console.log(imageData)

    console.log(objectData.client_error.Code)
    if (objectData.client_error.Code === "NoSuchKey") {
        const standardMetadata = {
            "id": `${id}`,
            "name": `THIS IS REAL TEST DBXEN NFT #${id}, BUT IS UNREVEAL`,
            "description": "DBXEN NFT FOR PASSIVE INCOME",
            // "image": `${IMAGE_EP + IMAGE_BUCKET}/dbxenNft-beforeReveal.png`,
            "image": imageData,
            "external_url": `https://dbxen.org/your-dbxenfts/${id}`,
            "attributes": [{
                "trait_type": "DBXEN NFT POWER",
                "value": "0"
            }]
        }
        const params = {
            Bucket: REACT_APP_METADATA_BUCKET_POLYGON,
            Key: fileName,
            Body: JSON.stringify(standardMetadata),
            Tagging: 'public=yes',
            "ContentType": "application/json",
        };
        putStorageObject(params)
            .then((result) => {
                console.log("PARAMS", params)
                // result.client_error;
                console.log(result)
            }).catch((error) => console.log(error));

    }
}

export async function writeLastActiveCycle(cycle) {
    const fileName = "lastCycle.txt";
    const params = {
        Bucket: REACT_APP_METADATA_BUCKET_POLYGON,
        Key: fileName,
    }
    const putStorageParams = (key, body) => ({
        Bucket: REACT_APP_METADATA_BUCKET_POLYGON,
        Key: key,
        Body: body,
        "ContentType": "txt",
    });
    let objectData = await getStorageObject(params);
    try {

        const data = objectData.split('\n');
        if ((JSON.parse(data[data.length - 2])).cycle !== cycle) {
            const content = objectData
                .concat(`{"cycle": ${cycle},"alreadyUpdated": false}\n`);

            putStorageObject(putStorageParams(fileName, content))
                .then((result) => result.client_error && console.log(result));
        }
    } catch (err) {
        if (objectData.client_error.Code === "NoSuchKey") {
            const content = `{"cycle": ${cycle},"alreadyUpdated": false}\n`;
            putStorageObject(putStorageParams(fileName, content))
                .then((result) => {
                    // result.client_error;
                    console.log(result)
                }).catch((error) => console.log(error));
        } else {
            throw err;
        }
    }
}

export async function generateAfterReveal(id, power) {
    const fileName = id + ".json";

    const params = {
        Bucket: REACT_APP_METADATA_BUCKET_POLYGON,
        Key: fileName,
    }

    let objectData = await getStorageObject(params);

    try {
        await getStorageObject(params);
        const standardMetadata = {
            "id": `${id}`,
            "name": `THIS IS REAL TEST DBXEN NFT #${id}, NOW REVEAL!`,
            "description": "DBXEN NFT FOR PASSIVE INCOME and reveal",
            "image": getAssets("dbxenNft-beforeReveal.png"),
            "external_url": `https://dbxen.org/your-dbxenfts/${id}`,
            "attributes": [{
                "trait_type": "DBXEN NFT POWER",
                "value": power.toString()
            }]
        }

        putStorageObject({
            Bucket: REACT_APP_METADATA_BUCKET_POLYGON,
            Key: fileName,
            Body: JSON.stringify(standardMetadata),
            "ContentType": "application/json",
        }).then((result) => result.client_error && console.log(result));
    } catch (err) {
        if (objectData.client_error.Code === "NoSuchKey") {
            console.log(err)
        } else {
            throw err;
        }
    }
}

export async function getIdsMintedPerCycle(cycle) {
    const fileName = cycle + ".txt";
    const params = {
        Bucket: REACT_APP_METADATA_BUCKET_POLYGON,
        Key: fileName,
    }
    const objectData = await getStorageObject(params);

    try {
        if (objectData.includes('\n')) {
            const removeNewLine = objectData.split("\n");

            return removeNewLine[0].concat(removeNewLine[1]);
        } else {
            return objectData.split(',');
        }
    } catch (err) {
        if (objectData.client_error.Code === "NoSuchKey") {
            console.log("IMPOSIBIL SA NU AVEM FISIER AICI LA UPDATE!!!")
        } else {
            throw err;
        }
    }
    return [];
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
    console.log("179 linia ");
    console.log(objectData);
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

export async function writePerCycle(cycle, id) {
    const idsMinted = await idsAlreadyMinted(id);
    console.log("idsMIntesd")
    console.log("cu id ul asta vine ");
    console.log(id);
    console.log(idsMinted);
    console.log("cyclul curent " + cycle)
    const fileName = cycle.toString() + ".json";
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

    const objectData = await getStorageObject(params);
    try {
        let ids;
        if (!objectData.tokenId.includes(id.toString())) {
            objectData.tokenId.push(id);
            putStorageObject(putStorageParams(fileName, { tokenId: objectData.tokenId }))
                .then(() => generateBeforeReveal(cycle, id));
        }
    } catch (err) {
        if (objectData.client_error.Code === "NoSuchKey") {
            const fileNameForNewCycle = cycle.toString() + ".json";
            const params = putStorageParams(
                fileNameForNewCycle, { tokenId: [id] }
            );
            putStorageObject(params)
                .then(() => generateBeforeReveal(cycle, id));
        } else {
            throw err;
        }
    }
}