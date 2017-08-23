const fs = require('fs');
const Router = require('./router');
const path = require('path');

module.exports = function(options) {

    return getRouter(options.path);

    function getRouter(basePath) {
        let router = Router();
        fs.readdirSync(basePath).forEach((filePath) => {
            let fullPath = path.resolve(basePath, filePath);
            let stats = fs.lstatSync(fullPath);
            if (stats.isDirectory()) {
                router.use('/' + filePath, getRouter(fullPath));
            }
            else if(filePath === 'index.js') {
                router.use(require(fullPath));
            }
        });
        return router;
    }
};