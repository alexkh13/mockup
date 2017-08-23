const _ = require('underscore');
const Endpoint = require('./endpoint');
const Chance = require('chance');
const chance = new Chance();

let collections = {};

module.exports = Collection;

function Collection(name, def) {

    let pendingItems = [];
    let itemsPromise = generateItems(def);
    let idAttr = getIdAttr(def);

    def.$collection = name;

    collections[name] = {
        query: () => {
            return itemsPromise.then((items) => {
                return items.concat(pendingItems);
            });
        },
        chain: (callback) => {
            return itemsPromise.then((items) => {
                return callback(_.chain(items)).value();
            });
        },
        create: (template) => {
            return generateItem(def, template).then((item) => {
                pendingItems.push(item);
                return item;
            });
        },
        getEndpoint: () => {
            let endpoint = Endpoint();

            endpoint.get(() => collections[name].query());
            endpoint.get('/:id', (req) => {
                return collections[name].query().then((items) => {
                    let id = +req.params.id;
                    for(let i in items) {
                        if(items.hasOwnProperty(i)) {
                            if (items[i][idAttr] === id) {
                                return items[i];
                            }
                        }
                    }
                    return Promise.reject({
                        status: 404,
                        message: id + " not found"
                    });
                });
            });

            return endpoint;
        }
    };

    return collections[name];

}

function getIdAttr(def) {
    for(let attr in def.schema) {
        if (def.schema.hasOwnProperty(attr)) {
            if (def.schema[attr].index) {
                return attr;
            }
        }
    }
    return 'id';
}

function generateItems(def) {
    if (def instanceof Array) {
        return Promise.resolve(def);
    }
    else {
        let items = [];
        let total = def.count || 10;
        let promise = Promise.resolve();
        while(total-- > 0) {
            promise = promise.then(() => {
                return generateItem(def).then((item) => {
                    items.push(item);
                    return item;
                });
            });
        }
        return promise.then(() => {
            return items;
        });
    }
}

function generateItem(def, template) {

    let promises = _.mapObject(def.schema, () => {
        return {};
    });

    _.mapObject(promises, (obj) => {
        obj.promise = new Promise((resolve) => {
            obj.resolve = resolve;
        });
    });

    return Promise.all(_.map(def.schema, (attrDef, attr) => {

        return Promise.resolve(getAttributeValue(attrDef, attr)).then((value) => {
            promises[attr].resolve(value);
            return {
                attr: attr,
                value: value
            }
        });
    })).then((results) => {
        return _.chain(results)
            .indexBy('attr')
            .mapObject((obj) => obj.value)
            .value();
    });

    function getAttributeValue(attrDef, attr) {
        if (template && template[attr]) {
            return template[attr];
        }
        switch(attrDef.type) {
            case 'Number':
                if (attrDef.incremental) {
                    return attrDef._current ? ++attrDef._current : attrDef._current=1;
                }
                else {
                    return chance.natural();
                }
            case 'StringPattern':
                let regex = /\${([^}]*)}/g;
                let matches = [];
                let valuePromises = [];
                let match;
                while(match = regex.exec(attrDef.pattern)) {
                    let attr = match[1];
                    valuePromises.push((promises[attr]||{}).promise);
                    matches.push(match);
                }
                return Promise.all(valuePromises).then((values) => {
                    let i = 0;
                    return attrDef.pattern.replace(regex, () => {
                        return values[i++];
                    });
                });
            case 'StringEnum':
                return chance.pickone(attrDef.enums);
            case 'StringRandom':
                if (attrDef.limit) {
                    let rnds = attrDef._limit || (attrDef._limit = chance.n(function() {
                            if (attrDef.n) {
                                return chance.n(chance[attrDef.random], attrDef.n, attrDef.options)
                            }
                            else {
                                return chance[attrDef.random](attrDef.options);
                            }
                        }, attrDef.limit, attrDef.options));
                    return chance.pickone(rnds);
                }
                else {
                    return chance[attrDef.random](attrDef.options);
                }
            case 'Collection':
                return Collection([def.$collection,attr].join('_'), attrDef.def).query();
            case 'Ref':
                let collection = collections[attrDef.collection];
                return collection.query().then((items) => {
                    let wherePromise = (() => {
                        if (typeof attrDef.where === 'function') {
                            return attrDef.where({
                                getAttribute: (attr) => {
                                    return (promises[attr]||{}).promise;
                                }
                            });
                        }
                        else {
                            return Promise.resolve(attrDef.where);
                        }
                    })();

                    let item = (() => {
                        if (attrDef.where) {
                            return wherePromise.then((q) => {
                                return _.findWhere(items, q);
                            });
                        }
                        else {
                            chance.pickone(items)
                        }
                    })();
                    return Promise.resolve(item).then((item) => {
                        return Promise.resolve(item || wherePromise.then((q)=>collection.create(q))).then((item) => {
                            return attrDef.pick && item[attrDef.pick] || item;
                        });
                    });
                });
        }
    }

}