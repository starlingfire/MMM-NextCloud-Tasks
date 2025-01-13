/* eslint-disable indent */
const { createClient } = require("webdav");
const ical = require('node-ical');
const transformer = require("./transformer");

function initWebDav(config) {
    return client = createClient(config.listUrl, {
        username: config.webDavAuth.username,
        password: config.webDavAuth.password,
        maxBodyLength: Infinity,
        maxContentLength: Infinity,
        timeout: 60000 // Increase timeout to 60 seconds
    });
}

function parseList(icsStrings, config) {
    let startsInDays = (config && config.startsInDays) || 0;
    let dueInDays = (config && config.dueInDays) || 0;
    let now = new Date();
    let startsDeadline = new Date(now.getTime() + startsInDays * 86400000); // this is 24 * 60 * 60 * 1000 = 1 day in milliseconds
    let dueDeadline = new Date(now.getTime() + dueInDays * 86400000);

    let elements = [];
    for (const icsStr of icsStrings) {
        const icsObj = ical.sync.parseICS(icsStr);
        Object.values(icsObj).forEach(element => {
            if (element.type === 'VTODO') {
                if (startsInDays > 0 && element.start && element.start > startsDeadline) return;
                if (dueInDays > 0 && element.due && element.due > dueDeadline) return;
                elements.push(element);
            }
        });
    }
    return elements;
}

async function fetchList(config) {
    const client = initWebDav(config);
    const directoryItems = await client.getDirectoryContents("/");

    let icsStrings = [];
    for (const element of directoryItems) {
        let icsStr;
        let retries = 3;
        while (retries > 0) {
            try {
                icsStr = await client.getFileContents(element.filename, { format: "text" });
                break; // Exit loop if successful
            } catch (error) {
                retries--;
                if (retries === 0) {
                    throw new Error("Failed to fetch file contents after multiple attempts");
                }
            }
        }
        icsStrings.push(icsStr);
    }
    return parseList(icsStrings, config);
}

module.exports = {
    parseList: parseList,
    fetchList: fetchList
};
