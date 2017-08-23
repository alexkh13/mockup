const Collection = require('../../../collection');

module.exports = Collection({
    count: 10,
    schema: {
        _id:    { type: 'Number', incremental: true, index: true },
        name:   { type: 'StringPattern', pattern: 'product_${type}_${_id}' },
        type:   { type: 'StringEnum', enums: ['A','B','C'] }
    }
});