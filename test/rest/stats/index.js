const Endpoint = require('../../../endpoint');
const products = require('../products/products');
const endpoint = Endpoint();

endpoint.get('/:type', req => {
    switch(req.params.type) {
        case 'products':
            return products.chain((products) => {
                return products
                    .groupBy('type')
                    .mapObject(products => products.length);
            });
    }
});

module.exports = endpoint;