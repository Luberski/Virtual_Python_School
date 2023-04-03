import ky from 'ky-universal';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

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
