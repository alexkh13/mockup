const qs = require('qs');

export function Mock(options) {

    const router = require('./router')();

    const req = options.context;

    req.keys().forEach(function(r) {
        let path = r.substring(1).replace(/\/index\.js$/, '');
        router.use(path, req(r));
    });

    return function(httpOptions) {
        return new Promise((resolve, reject) => {
            let request = {
                // TODO: avoid sending this
                url: httpOptions.url,
                method: httpOptions.method,
                body: (httpOptions.data && httpOptions.contentType === 'application/json') ? JSON.parse(httpOptions.data) : httpOptions.data,
                query: qs.parse(httpOptions.url.split('?')[1])
            };

            let statusCode;

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