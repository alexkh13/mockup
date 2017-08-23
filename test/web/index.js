import { Mock } from '../../mockup.web';

let mock = Mock({
    context: require.context('../rest', true, /\/index\.js$/),
    base: '/api',
    debug: true
});

mock({
    url: '/api/stats/products',
    method: 'GET'
}).then((data) => {
    console.log(data);
});