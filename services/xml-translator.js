class XmlTranslatorBase {
    constructor() {}

    translateProperties(props) {
        let authors = [];
        let keywords = [];
        try {
            if(Array.isArray(props.reference) && (typeof props.reference !== "string")) {
                props.reference.forEach(refItem => {
                    if(refItem.refinfo.authors.author) {
                        if(Array.isArray(refItem.refinfo.authors.author)) {
                            authors.push(...refItem.refinfo.authors.author);
                        } else {
                            authors.push(refItem.refinfo.authors.author)
                        }

                    }
                    if(refItem.refinfo.authors.group) {
                        authors.push(refItem.refinfo.authors.group)
                    }
                })
                authors = Array.from(new Set(authors));
                authors = authors.map(author => ({author}))
            } else {
                if(Array.isArray(props.reference.refinfo.authors.author) && typeof props.reference.refinfo.authors.author !== "string") {
                    authors.push(...props.reference.refinfo.authors.author);
                } else {
                    authors = [props.reference.refinfo.authors.author];
                }
                authors = authors.map(author => ({author}))
            }
        } catch (e) {
            console.log(`Authors processing failed for ${props.id}`)
            console.log(e)
        }
        try {
            if(props.keywords) {
                if(Array.isArray(props.keywords.keyword)) {
                    keywords = [...props.keywords.keyword];
                } else {
                    keywords = [props.keywords.keyword]
                }
                keywords = keywords.map(keyword => ({keyword}))
            }

        } catch(e) {
            console.log(`Keywords processing failed for ${props.id}`)
        }

        return {
            id: props.id,
            name: props.protein.name,
            authors,
            keywords
        }
    }
}

module.exports = XmlTranslatorBase;