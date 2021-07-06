const fs = require('fs')
const path = require('path');
const saxpath = require('saxpath');
const sax = require('sax');
const xml2json = require('xml2json')
const XmlTranslator = require('./xml-translator');

class XmlLoader {
    #path;
    #destinationPath;
    #syncFilePath;
    #cacheTime;
    constructor(xmlPath, destinationPath, cacheTime = 36000000) {
        this.#path = path.resolve(__dirname, '../', xmlPath);
        this.#destinationPath = path.resolve(__dirname, '../', destinationPath);
        this.#syncFilePath = path.resolve(__dirname, '../', 'syncDate-' + destinationPath);
        this.#cacheTime = cacheTime;
    }

    #getItemsFromCache() {
        const lastSyncDate = fs.readFileSync(this.#syncFilePath).toString();
        const currentTime = Date.now();

        if(currentTime - lastSyncDate < this.#cacheTime) {
            try {
                const items = JSON.parse(fs.readFileSync(this.#destinationPath));
                return items;
            } catch (e) {
                console.log("No cache found, resuming");
            }
        }
    }
    #saveItemsToCache(data) {
        fs.writeFileSync(this.#destinationPath , JSON.stringify(data), {encoding: 'utf-8'});
        fs.writeFileSync(this.#syncFilePath, Date.now().toString(), {encoding: 'utf-8'});
    }
    processXml(translator = new XmlTranslator()) {
        return new Promise((resolve, reject) => {
            try {
                const items = this.#getItemsFromCache();
                return resolve(items);
            } catch (e) {
                console.log("No sync file found");
            }
            let results = []
            var stream = fs.createReadStream(this.#path);
            var saxParser  = sax.createStream(true);
            var streamer   = new saxpath.SaXPath(saxParser, '//ProteinEntry');
            streamer.on('match', function(xml) {
                const proteinEntryObject = JSON.parse(xml2json.toJson(xml));
                const translatedProperties = translator.translateProperties(proteinEntryObject.ProteinEntry);
                results.push(translatedProperties)
            });
            streamer.on('end', () => {
                this.#saveItemsToCache(results);
                resolve(results)
            });
            stream.pipe(saxParser);

        })

    }

}

module.exports = XmlLoader;