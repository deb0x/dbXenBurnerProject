const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');
const { load } = require('dotenv');

const blackOutline = '/home/sergiu/Desktop/DXNSCRIPT/dbXenBurnerProject/scripts/black-outline/';
const blueAccent = '/home/sergiu/Desktop/DXNSCRIPT/dbXenBurnerProject/scripts/blue-accent/';
const elephant = '/home/sergiu/Desktop/DXNSCRIPT/dbXenBurnerProject/scripts/elephant/';
const flangs = '/home/sergiu/Desktop/DXNSCRIPT/dbXenBurnerProject/scripts/fangs/';
const glasses = '/home/sergiu/Desktop/DXNSCRIPT/dbXenBurnerProject/scripts/glasses/';
const whiteAccent = '/home/sergiu/Desktop/DXNSCRIPT/dbXenBurnerProject/scripts/white-accent/';
const whiteOutline = '/home/sergiu/Desktop/DXNSCRIPT/dbXenBurnerProject/scripts/white-outline/';
const earrings = '/home/sergiu/Desktop/DXNSCRIPT/dbXenBurnerProject/scripts/earrings/';
const headphones = '/home/sergiu/Desktop/DXNSCRIPT/dbXenBurnerProject/scripts/headphones/';
const crown = '/home/sergiu/Desktop/DXNSCRIPT/dbXenBurnerProject/scripts/crown/';
const backgroung = '/home/sergiu/Desktop/DXNSCRIPT/dbXenBurnerProject/scripts/background/';
const dxnlogo = '/home/sergiu/Desktop/DXNSCRIPT/dbXenBurnerProject/scripts/dxnlogo/'
const createdCombinations = [];

function getRandomImage(folderPath) {
    const files = fs.readdirSync(folderPath);
    const randomIndex = Math.floor(Math.random() * files.length);
    return `${folderPath}${files[randomIndex]}`;
}

async function generateAndSaveImage() {
    const canvas = createCanvas( /* specify canvas dimensions */ );
    const ctx = canvas.getContext('2d');

    const randomBlackOutline = getRandomImage(blackOutline);
    const randomBlueAccent = getRandomImage(blueAccent);
    const randomElephant = getRandomImage(elephant);
    const randomFlangs = getRandomImage(flangs);
    const randomWhiteAccent = getRandomImage(whiteAccent);
    const randomWhiteOutline = getRandomImage(whiteOutline);
    const randomGlasses = getRandomImage(glasses);
    const randomEarrings = getRandomImage(earrings);
    const randomHeadphones = getRandomImage(headphones);
    const randomCrown = getRandomImage(crown);
    const randomBackground = getRandomImage(backgroung);
    const randomDxnlogo = getRandomImage(dxnlogo);

    const [
        blackOutlineImage,
        blueAccentImage,
        elephantImage,
        flangsImage,
        whiteAccentImage,
        whiteOutlineImage,
        glassesImage,
        earringsImage,
        headphonesImage,
        crownImage,
        backgroundImage,
        dxnlogoImage
    ] = await Promise.all([
        loadImage(randomBlackOutline),
        loadImage(randomBlueAccent),
        loadImage(randomElephant),
        loadImage(randomFlangs),
        loadImage(randomWhiteAccent),
        loadImage(randomWhiteOutline),
        loadImage(randomGlasses),
        loadImage(randomEarrings),
        loadImage(randomHeadphones),
        loadImage(randomCrown),
        loadImage(randomBackground),
        loadImage(randomDxnlogo)
    ]);

    const combinationString =
        `${randomBlackOutline}-${randomBlueAccent}-${randomElephant}-${randomFlangs}-${randomWhiteAccent}-${randomWhiteOutline}-${randomGlasses}-${randomEarrings}-${randomHeadphones}-${randomCrown}-${randomBackground}-${randomDxnlogo}`;

    if (createdCombinations.includes(combinationString)) {
        console.log("Duplicated!!!!!");
        generateAndSaveImage();
        return;
    }

    createdCombinations.push(combinationString);

    canvas.width = 1000;
    canvas.height = 1000;

    ctx.drawImage(backgroundImage, 0, 0);
    ctx.drawImage(blackOutlineImage, 0, 0);
    ctx.drawImage(blueAccentImage, 0, 0);
    ctx.drawImage(elephantImage, 0, 0);
    ctx.drawImage(flangsImage, 0, 0);
    ctx.drawImage(whiteAccentImage, 0, 0);
    ctx.drawImage(whiteOutlineImage, 0, 0)
    ctx.drawImage(glassesImage, 0, 0)
    ctx.drawImage(earringsImage, 0, 0)
    ctx.drawImage(headphonesImage, 0, 0)
    ctx.drawImage(crownImage, 0, 0)
    ctx.drawImage(dxnlogoImage, 0, 0)

    const outputFolder = '15000';
    const outputFileName = path.join(outputFolder, `[15000]_DBXENFT_${createdCombinations.length}.png`);

    if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder);
    }

    const out = fs.createWriteStream(outputFileName);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', () => {
        console.log(`Image saved as ${outputFileName}`);
        if (createdCombinations.length < 2500) {
            generateAndSaveImage();
        } else {
            console.log('10000 unique combinations have been generated.');
        }
    });
}

generateAndSaveImage();