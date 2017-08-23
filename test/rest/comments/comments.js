const Collection = require('../../../collection');
const products = require('../products/products');

module.exports = Collection({
    count: 100,
    schema: {
        _id:    { type: 'Number', incremental: true, index: true },
        user:   { type: 'StringRandom', random: 'name', limit: 2 },
        productId: {
            type: 'Ref',
            collection: products,
            where: (def) => def.getAttribute('_id').then((id) => {
                return {
                    type: id%2===0?'D':'E'
                }
            }),
            pick: '_id'
        }
    }
});