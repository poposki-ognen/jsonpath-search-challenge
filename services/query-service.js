const {JSONPath} = require('jsonpath-plus');

const processQueryParameters = (queryParams) => {
    const processedQueryWords = {}
    for (let [queryParam, paramValue] of Object.entries(queryParams)) {
        if(!!paramValue) {
            const queryWords = paramValue.split(' ');
            processedQueryWords[queryParam] = queryWords.map(word => `(?=.*\\b${word.toLowerCase()}\\b)`).join('');
            processedQueryWords[queryParam] = '.*' + processedQueryWords[queryParam] + '.*';
        }
    }
    return processedQueryWords;
}
const convertPointersToIds = (pointers) => {
    const processedPointers = (pointers || []).map(item => {
        const splitItems = item.split('/');
        return splitItems[1];
    })
    return processedPointers.join();
}

const packResponse = (data, page) => {
    const paginatedItems = JSONPath({
        path: `$[${(page - 1) * 10}:${page * 10}]`,
        json: data,
    })
    const processedItems = paginatedItems.map(item => ({
        name: item.name,
        authors: item.authors.map(authorItem => authorItem.author),
        keywords: item.keywords.map(keywordItem => keywordItem.keyword),
    }))

    return {
        total: data.length,
        proteins: processedItems
    }
}
module.exports.processQueryParameters = processQueryParameters;
module.exports.convertPointersToIds = convertPointersToIds;
module.exports.packResponse = packResponse;