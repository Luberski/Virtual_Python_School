import ky from 'ky-universal';

let BASE_URL = `http://localhost:3000/api`;
if (process.env.NODE_ENV === 'production') {
  // TODO: move BASE_URL to .env
  BASE_URL = `http://virtualschool.wi.zut.edu.pl/api`;
}

export default ky.extend({
  prefixUrl: BASE_URL,
  headers: {
    'Access-Control-Allow-Private-Network': '*',
    'Access-Control-Allow-Origin': '*',
  },
});
