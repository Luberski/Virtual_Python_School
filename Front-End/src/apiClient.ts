import ky from 'ky-universal';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';

export default ky.extend({
  prefixUrl: BASE_URL,
  headers: {
    'Access-Control-Allow-Private-Network': '*',
    'Access-Control-Allow-Origin': '*',
  },
  hooks: {
    beforeError: [
      async (error) => {
        const { response } = error;
        if (response && response.body) {
          const data = await response.json();
          if (data.error) {
            error.message = `${data.error}`;
          }
        }
        return error;
      },
    ],
  },
});
