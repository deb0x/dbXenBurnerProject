import { CompressOutlined } from '@mui/icons-material';
let { convertBytes32ToString } = require('./Converter.js')
let { ethers } = require("ethers");
const Web3 = require('web3');
const web3 = new Web3();

const APIKEY = 'ckey_b065aa22fc1e4b68a13efab2521';
const baseURL = 'https://api.covalenthq.com/v1'
const blockchainChainId = '137'
const sentEventTopic = '0xa33bc9a10d8f3a335b59663beb6a02681748ac0b3db1251c7bb08f3e99dd0bb4';
const startBlock = '36051352';
const endBlock = 'latest';
const contractAddress = '0xA06735da049041eb523Ccf0b8c3fB9D36216c646';

async function getEvents(secondaryTopicsData, pageNumber) {
    const pageSize = 100;
    const url = new URL(`${baseURL}/${blockchainChainId}/events/topics/${sentEventTopic}/?quote-currency=USD&format=JSON&starting-block=${startBlock}&ending-block=${endBlock}&sender-address=${contractAddress}&secondary-topics=${secondaryTopicsData}&page-number=${pageNumber}&page-size=${pageSize}&key=${APIKEY}`);
    const response = await fetch(url);
    const result = await response.json();
    const data = result.data;
    return data;
}

const setKeyEventTopic = '0x8e06b8416b712e88dc5bdfc009fcc4de46c26bf894cd73d9a855ceb8170ea78d';
async function getSetKeyEvents(secondaryTopicsData) {
    const url = new URL(`${baseURL}/${blockchainChainId}/events/topics/${setKeyEventTopic}/?quote-currency=USD&format=JSON&starting-block=${startBlock}&ending-block=${endBlock}&sender-address=${contractAddress}&secondary-topics=${secondaryTopicsData}&key=${APIKEY}`);
    const response = await fetch(url);
    const result = await response.json();
    const data = result.data;
    return data;
}

async function getSentMessageEvents(pageNumber) {
    const pageSize = 100;
    const url = new URL(`${baseURL}/${blockchainChainId}/events/topics/${sentEventTopic}/?quote-currency=USD&format=JSON&starting-block=${startBlock}&ending-block=${endBlock}&sender-address=${contractAddress}&page-number=${pageNumber}&page-size=${pageSize}&key=${APIKEY}`);
    const response = await fetch(url);
    const result = await response.json();
    const data = result.data;
    return data;
}

function calculateStartBlockAndEndBlock(currentCycle) {
    let startBlockForLastEvents;
    let endBlockForLastEvents;
    if (currentCycle == 1) {
        startBlockForLastEvents = startBlock;
        endBlockForLastEvents = 'latest';
    } else {
        if (currentCycle == 2) {
            startBlockForLastEvents = parseInt(startBlock);
            endBlockForLastEvents = parseInt(startBlock) + 32000;
        } else {
            startBlockForLastEvents = (parseInt(startBlock) + ((currentCycle - 2) * 32000) + 1);
            endBlockForLastEvents = (parseInt(startBlock) + ((currentCycle - 1) * 32000));
        }
    }
    return { startBlockForLastEvents, endBlockForLastEvents }
}

async function getLast24HoursSentEvents(currentCycle, pageNumber) {
    let { startBlockForLastEvents, endBlockForLastEvents } = calculateStartBlockAndEndBlock(currentCycle);
    let pageSize = 100;
    const url = new URL(`${baseURL}/${blockchainChainId}/events/topics/${sentEventTopic}/?quote-currency=USD&format=JSON&starting-block=${startBlockForLastEvents}&ending-block=${endBlockForLastEvents}&sender-address=${contractAddress}&page-number=${pageNumber}&page-size=${pageSize}&key=${APIKEY}`);
    const response = await fetch(url);
    const result = await response.json();
    const data = result.data;
    return data;
}

async function get24HoursUserMessagessSent(currentCycle, secondaryTopicsData, pageNumber) {
    let pageSize = 100;
    let { startBlockForLastEvents, endBlockForLastEvents } = calculateStartBlockAndEndBlock(currentCycle);
    const url = new URL(`${baseURL}/${blockchainChainId}/events/topics/${sentEventTopic}/?quote-currency=USD&format=JSON&starting-block=${startBlockForLastEvents}&ending-block=${endBlockForLastEvents}&sender-address=${contractAddress}&secondary-topics=${secondaryTopicsData}&page-number=${pageNumber}&page-size=${pageSize}&key=${APIKEY}`);
    const response = await fetch(url);
    const result = await response.json();
    const data = result.data;
    return data;
}

export async function fetchMessageSenders(account) {
    let secondaryTopics = '0x000000000000000000000000' + account.slice(2);
    let events = [];
    let pageNumber = 0;
    let intermediateEvents = await getEvents(secondaryTopics, pageNumber);
    if (intermediateEvents.items.length > 0 && intermediateEvents != null)
        events.push(intermediateEvents.items);
    while (intermediateEvents.items.length > 0) {
        pageNumber++;
        intermediateEvents = await getEvents(secondaryTopics, pageNumber);
        if (intermediateEvents != null) {
            if (intermediateEvents.items.length > 0) {
                events.push(intermediateEvents.items);
            }
        }
    }
    let newEvents = events.flat();
    let messageSenders = newEvents.filter(element => (element.raw_log_topics[1].toLowerCase() === secondaryTopics.toLowerCase()) &&
        (secondaryTopics.toLowerCase() != element.raw_log_topics[2].toLowerCase())).map(element => '0x' + element.raw_log_topics[2].slice(26));
    return messageSenders
}

export async function fetchMessages(to, from) {
    let secondaryTopics = '0x000000000000000000000000' + to.slice(2);
    let events = [];
    let pageNumber = 0;
    let intermediateEvents = await getEvents(secondaryTopics, pageNumber);
    if (intermediateEvents.items.length > 0 && intermediateEvents != null)
        events.push(intermediateEvents.items);
    while (intermediateEvents.items.length > 0) {
        pageNumber++;
        intermediateEvents = await getEvents(secondaryTopics, pageNumber);
        if (intermediateEvents != null) {
            if (intermediateEvents.items.length > 0) {
                events.push(intermediateEvents.items);
            }
        }
    }
    let newEvents = events.flat();
    let filterAfterFrom = '0x000000000000000000000000' + from.slice(2);
    let froms = newEvents.filter(element => (filterAfterFrom.toLowerCase() === element.raw_log_topics[2].toLowerCase()));
    const typesArray = [
        { type: 'uint256', name: 'sentId' },
        { type: 'uint256', name: 'timestamp' },
        { type: 'bytes32[]', name: 'content' },
    ];
    let returnedData = [];
    let argumentsArray = [];
    let contentValue = '';
    for (let i = 0; i < froms.length; i++) {
        let dataAboutEvent = web3.eth.abi.decodeParameters(typesArray, froms[i].raw_log_data);
        argumentsArray.push(ethers.utils.arrayify(dataAboutEvent[2][0]))
        argumentsArray.push(ethers.utils.arrayify(ethers.utils.stripZeros(dataAboutEvent[2][1])))
        contentValue = convertBytes32ToString(argumentsArray);
        returnedData.push({ "content": contentValue, "timestamp": dataAboutEvent[1] });
        argumentsArray = [];
        contentValue = '';
    }
    return returnedData;
}
export async function fetchSentMessages(sender) {
    let secondaryTopics = '0x000000000000000000000000' + sender.slice(2);
    let pageNumber = 0;
    let events = [];
    let intermediateEvents = await getSentMessageEvents(pageNumber);
    if (intermediateEvents.items.length > 0 && intermediateEvents != null)
        events.push(intermediateEvents.items);
    while (intermediateEvents.items.length > 0) {
        pageNumber++;
        intermediateEvents = await getSentMessageEvents(pageNumber);
        if (intermediateEvents != null) {
            if (intermediateEvents.items.length > 0) {
                events.push(intermediateEvents.items);
            }
        }
    }

    let newEvents = events.flat();
    const typesArray = [
        { type: 'uint256', name: 'sentId' },
        { type: 'uint256', name: 'timestamp' },
        { type: 'bytes32[]', name: 'content' },
    ];
    let mapForRecipients = new Map();
    let mapForEnvelope = new Map();
    let filterAfterFrom = '0x000000000000000000000000' + sender.slice(2);
    let froms = newEvents.filter(element => (filterAfterFrom.toLowerCase() === element.raw_log_topics[2].toLowerCase()));
    let argumentsArray = [];
    let contentValue = '';
    for (let i = 0; i < froms.length; i++) {
        let dataAboutEvent = web3.eth.abi.decodeParameters(typesArray, froms[i].raw_log_data);
        argumentsArray.push(ethers.utils.arrayify(dataAboutEvent[2][0]))
        argumentsArray.push(ethers.utils.arrayify(ethers.utils.stripZeros(dataAboutEvent[2][1])))
        contentValue = convertBytes32ToString(argumentsArray);

        if (froms[i].raw_log_topics[2].toLowerCase() === secondaryTopics.toLowerCase()) {
            if (mapForRecipients.has(dataAboutEvent[0])) {
                let value = mapForRecipients.get(dataAboutEvent[0]);
                value.push('0x' + froms[i].raw_log_topics[1].slice(26));
                mapForRecipients.set(dataAboutEvent[0], value);
                mapForEnvelope.set(dataAboutEvent[0], { "timestamp": dataAboutEvent[1], "content": contentValue })
            } else {
                mapForRecipients.set(dataAboutEvent[0], ['0x' + froms[i].raw_log_topics[1].slice(26)])
            }
        }
        argumentsArray = [];
        contentValue = '';
    }
    let arrayOfRecipients = [];
    let arrrayOfEnvelope = [];
    let allData = [];
    arrayOfRecipients = Array.from(mapForRecipients.values());
    for (const [key, value] of mapForEnvelope) {
        arrrayOfEnvelope.push({ "content": value.content, "timestamp": value.timestamp });
    }
    for (let i = 0; i < arrayOfRecipients.length; i++) {
        allData[i] = [
            [{ "recipients": arrayOfRecipients[i] }],
            [{ "contentData": arrrayOfEnvelope[i] }]
        ];
    }
    return allData;

}

export async function getKey(to) {
    let secondaryTopics = '0x000000000000000000000000' + to.slice(2);
    let events = await getSetKeyEvents(secondaryTopics);
    if (events.items.length != 0) {
        for (let i = 0; i < events.items.length; i++) {
            if (events.items[i].raw_log_topics[1].toLowerCase() === secondaryTopics.toLowerCase()) {
                return ethers.utils.base64.encode(ethers.utils.arrayify(events.items[i].raw_log_topics[2]));
            } else {
                return '';
            }
        }
    } else
        return '';
}

export async function dailyStats(currentCycle) {
    let events = [];
    let pageNumber = 0;
    let intermediateEvents = await getLast24HoursSentEvents(currentCycle, pageNumber);
    if (intermediateEvents.items.length > 0 && intermediateEvents != null)
        events.push(intermediateEvents.items);
    while (intermediateEvents.items.length > 0) {
        pageNumber++;
        intermediateEvents = await getLast24HoursSentEvents(currentCycle, pageNumber);
        if (intermediateEvents != null) {
            if (intermediateEvents.items.length > 0) {
                events.push(intermediateEvents.items);
            }
        }
    }
    return events;
}

export async function userDailyStas(sender, currentCycle) {
    let secondaryTopics = '0x000000000000000000000000' + sender.slice(2);
    let events = [];
    let pageNumber = 0;
    let intermediateEvents = await get24HoursUserMessagessSent(currentCycle, secondaryTopics, pageNumber);
    if (intermediateEvents.items.length > 0 && intermediateEvents != null)
        events.push(intermediateEvents.items);
    while (intermediateEvents.items.length > 0) {
        pageNumber++;
        intermediateEvents = await get24HoursUserMessagessSent(currentCycle, secondaryTopics, pageNumber);
        if (intermediateEvents != null) {
            if (intermediateEvents.items.length > 0) {
                events.push(intermediateEvents.items);
            }
        }
    }
    let newEvents = events.flat();
    let froms = newEvents.filter(element => (secondaryTopics.toLowerCase() === element.raw_log_topics[2].toLowerCase()));
    return froms.length;
}