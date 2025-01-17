/* eslint-disable indent */
const { createClient } = require("webdav");
const ical = require('node-ical');
const transformer = require("./transformer");

function initWebDav(config) {
    return client = createClient(config.listUrl, config.webDavAuth);
}

function parseList(icsStrings, config) {
    let elements = [];
    for (let icsData of icsStrings) {
        if (typeof icsData !== "string") icsData = icsData.toString();
        const icsObj = ical.sync.parseICS(icsData);

        Object.values(icsObj).forEach(element => {
            if (element.type === 'VTODO') {
                elements.push(element);
            }
        });
    }
    return elements;
}

async function fetchList(config) {
    let icsStrings = [];
    for (const url of config.listUrl) {
        const client = createClient(url, config.webDavAuth);
        const directoryItems = await client.getDirectoryContents("/");
        for (const element of directoryItems) {
            const icsStr = await client.getFileContents(element.filename, { format: "text" });
            icsStrings.push(icsStr);
        }
    }
    return icsStrings;
}

module.exports = {
    parseList: parseList,
    fetchList: fetchList
};