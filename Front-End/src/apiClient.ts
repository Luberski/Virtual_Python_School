import ky from 'ky-universal';

const BASE_URL = `http://localhost:3000/api`;

export default ky.extend({
  prefixUrl: BASE_URL,
});
