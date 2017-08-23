const Router = require('./router');

module.exports = function() {

    let router = Router();

    function Endpoint() {
        return router.apply(this, arguments);
    }

    Endpoint.get = function(url, resolver) {
        if (typeof url === 'function') {
            resolver = url;
            url = "/";
        }
        router.get(url, (req, res) => {
            Promise.resolve(resolver(req)).then((data) => {
                res.send(data);
            }, (err) => {
                if (err) {
                    res.status(err.status || 500);
                    res.send(err.message || "exception");
                }
            });
        });
    };

    return Endpoint;
};