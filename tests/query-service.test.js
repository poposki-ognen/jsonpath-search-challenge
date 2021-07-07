const queryService = require('../services/query-service');
describe('/services/query-service.js processQueryParameters', () => {
    it('processQueryParameters should return parameters processed', () => {
        const params = {
            name: 'protein'
        }
        const processedParams = queryService.processQueryParameters(params);
        expect(processedParams).toEqual({
            name: '.*(?=.*\\bprotein\\b).*'
        })
    })

    it('processQueryParameters should return multiple properties', () => {
        const params = {
            name: 'protein',
            author: 'name'
        }
        const processedParams = queryService.processQueryParameters(params);
        expect(processedParams).toEqual({
            name: '.*(?=.*\\bprotein\\b).*',
            author: '.*(?=.*\\bname\\b).*'
        })
    })

    it('processQueryParameters should ignore empty properties', () => {
        const params = {
            name: ''
        }
        const processedParams = queryService.processQueryParameters(params);
        expect(processedParams).toEqual({})
    })

    it('processQueryParameters should accept multiple words', () => {
        const params = {
            name: 'protein substance'
        }
        const processedParams = queryService.processQueryParameters(params);
        expect(processedParams).toEqual({
            name: '.*(?=.*\\bprotein\\b)(?=.*\\bsubstance\\b).*'
        })
    })
})

describe('/services/query-service.js convertPointersToIds', () => {
    it('convertPointersToIds should return joined ids', () => {
        const ids = ['/1/path','/2/path','/3/path'];
        const processedIds = queryService.convertPointersToIds(ids);
        expect(processedIds).toEqual('1,2,3')
    })
})

describe('/services/query-service.js packResponse', () => {
    it('packResponse should return paginated response', () => {
        const itemsToReturn = [{
            "id": "C44264",
            "name": "ALL-1/AF-4 clone 25 mutant fusion protein",
            "authors": [
                {
                    "author": "Gu, Y."
                },
                {
                    "author": "Nakamura, T."
                },
                {
                    "author": "Alder, H."
                },
                {
                    "author": "Prasad, R."
                },
                {
                    "author": "Canaani, O."
                },
                {
                    "author": "Cimino, G."
                },
                {
                    "author": "Croce, C.M."
                },
                {
                    "author": "Canaani, E."
                }
            ],
            "keywords": [
                {
                    "keyword": "fusion protein"
                }
            ]
        }]

        const packedResponse = queryService.packResponse(itemsToReturn, 1);
        expect(packedResponse).toEqual({
            total: 1,
            proteins: [{
                name: "ALL-1/AF-4 clone 25 mutant fusion protein",
                authors: [
                    "Gu, Y.",
                    "Nakamura, T.",
                    "Alder, H.",
                    "Prasad, R.",
                    "Canaani, O.",
                    "Cimino, G.",
                    "Croce, C.M.",
                    "Canaani, E.",

                ],
                keywords: [
                    "fusion protein"
                ]
            }]
        })
    })

    it('packResponse should return empty array when page is greater than available pages', () => {
        const itemsToReturn = [{
            "id": "C44264",
            "name": "ALL-1/AF-4 clone 25 mutant fusion protein",
            "authors": [
                {
                    "author": "Gu, Y."
                },
                {
                    "author": "Nakamura, T."
                },
                {
                    "author": "Alder, H."
                },
                {
                    "author": "Prasad, R."
                },
                {
                    "author": "Canaani, O."
                },
                {
                    "author": "Cimino, G."
                },
                {
                    "author": "Croce, C.M."
                },
                {
                    "author": "Canaani, E."
                }
            ],
            "keywords": [
                {
                    "keyword": "fusion protein"
                }
            ]
        }]

        const packedResponse = queryService.packResponse(itemsToReturn, 2);
        expect(packedResponse).toEqual({
            total: 1,
            proteins: []
        })
    })
})