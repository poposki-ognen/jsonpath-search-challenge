const express = require('express');
const fs = require('fs');
const xml2json = require('xml2json');
const app = express();
const port = 3001;
const {JSONPath} = require('jsonpath-plus');
const XmlLoader = require('./services/xml-loader.js');
const XmlTranslator = require('./services/xml-translator');
const xmlTranslator = new XmlTranslator();
const xmlLoader = new XmlLoader('psd7003.xml', 'processed.json');
const queryHelper = require('./services/query-service');

var items = [];

app.get('/search', async (req, res) => {
    const page = (req.query.page && req.query.page > 0) ?  req.query.page : 1;
    const filteredParams  = {
    ...(!!req.query.name && {name: req.query.name}),
    ...(!!req.query.author && {author: req.query.author}),
    ...(!!req.query.keyword && {keyword: req.query.keyword})
    };

    const processedQueryParams = queryHelper.processQueryParameters(filteredParams);
    let itemsResponse = items;
    if(!!processedQueryParams.name) {
        itemsResponse = JSONPath({
            path: `$.*[?(@property === "name" && @.match(/${processedQueryParams.name}/i))]^`,
            json: itemsResponse
        });
    }
    if(!!processedQueryParams.author) {
        const foundItemsAuthors = JSONPath({
            path: `$.*.authors.[?(@property === "author" && @.match(/${processedQueryParams.author}/i))]^`,
            json: itemsResponse,
            resultType: "pointer"
        });
        const foundAuthorsPointers = queryHelper.convertPointersToIds(foundItemsAuthors);
        itemsResponse = JSONPath({
            path: `$[${foundAuthorsPointers}]`,
            json: itemsResponse,
        })
    }
    if(!!processedQueryParams.keyword) {
        const foundItems = JSONPath({
            path: `$.*.keywords.[?(@property === "keyword" && @.match(/${processedQueryParams.keyword}/i))]^`,
            json: itemsResponse,
            resultType: "pointer"
        });
        const foundKeywordsPointers = queryHelper.convertPointersToIds(foundItems);
        itemsResponse = JSONPath({
            path: `$[${foundKeywordsPointers}]`,
            json: itemsResponse,
        })
    }

    res.type('json');
    res.send(queryHelper.packResponse(itemsResponse || [], page));
});

app.listen(port, async () => {
    console.log("Processing xml, please wait...");
    items = await xmlLoader.processXml(xmlTranslator);
    console.log(`protein-search listening at http://localhost:${port}`);
});