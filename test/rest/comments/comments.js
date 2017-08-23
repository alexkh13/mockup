const Collection = require('../../../collection');

module.exports = Collection('Comments', {
    count: 100,
    schema: {
        _id:    { type: 'Number', incremental: true, index: true },
        user:   { type: 'StringRandom', random: 'name', limit: 2 },
        productId: {
            type: 'Ref',
            collection: 'Products',
            where: (def) => def.getAttribute('_id').then((id) => {
                return {
                    type: id%2===0?'D':'E'
                }
            }),
            pick: '_id'
        }
    }
});