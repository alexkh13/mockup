const qs = require('qs');

export function Mock(options) {

    const baseRouter = require('./router')();
    const router = require('./router')();

    baseRouter.use(options.base || '/', router);

    const req = options.context;

    req.keys().forEach(function(r) {
        let path = r.substring(1).replace(/\/index\.js$/, '');
        router.use(path, req(r));
    });

    return function(httpOptions) {
        return new Promise((resolve, reject) => {
            let request = {
                // TODO: avoid sending this
                url: httpOptions.url.replace(new RegExp('^'+options.base), ''),
                method: httpOptions.method,
                body: (httpOptions.data && httpOptions.contentType === 'application/json') ? JSON.parse(httpOptions.data) : httpOptions.data,
                query: qs.parse(httpOptions.url.split('?')[1])
            };

            let statusCode;

            if (options.debug) {
                console.log(httpOptions.url)
            }

            router(request, {
                send: httpResolve,
                end: httpResolve,
                status: (code) => {
                    statusCode = code;
                }
            }, (err) => {
                if (err) {
                    throw err;
                }
                else {
                    reject(new Error("URL not found " + request.url));
                }
            });

            function httpResolve(data) {
                switch(statusCode) {
                    case 200:
                    case undefined:
                        return resolve(data);
                    default:
                        return reject({
                            statusCode: statusCode
                        });
                }
            }
        });

    };

}