import { Mock } from '../../mockup.web';

let mock = Mock({
    context: require.context('../rest', true, /\/index\.js$/),
    debug: true
});

mock({
    url: '/stats/products',
    method: 'GET'
}).then((data) => {
    console.log(data);
});