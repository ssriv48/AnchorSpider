const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const allLinks = new Set();
const sentLinks = new Set();

const maxLinks = 1000;
const domain = 'https://timesofindia.indiatimes.com';
const initialUrl = 'https://timesofindia.indiatimes.com/';
const resultFile = './result.txt';

const getLinks = (err, resp, body) => {
    if (err) return;

    const $ = cheerio.load(body);
    const $anchors = Array.from($('a'));
    
    $anchors.forEach(($a) => {
        try {
            let $href = $a.attribs.href;
            if (allLinks.size < maxLinks && $href !== '#' && $href !== 'javascript:void(0)') {
                if ($href.charAt(0) === '/') { $href = `${domain}$href`; }
                allLinks.add($href);
            }
        } catch (e) {}
    });

    const allLinksList = Array.from(allLinks);
    allLinksList.forEach(console.log);
    console.log(allLinks.size);
    fs.writeFileSync(path.join(resultFile), JSON.stringify(allLinksList), 'utf-8');
    allLinks.forEach(sendRequest);
}

const sendRequest = (url) => {
    if (allLinks.size < maxLinks) {
        if (sentLinks.has(url)) {
            return;
        } else {
            sentLinks.add(url);
            request.get(url, getLinks);
        }
    } else {
        console.log('*************** Exiting **********************');
        process.exit(0);
    }
}

sendRequest(initialUrl);
