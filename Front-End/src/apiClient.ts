import axios, { AxiosRequestConfig } from "axios";

const BASE_URL = `http://localhost:5000/api`;

const client = (endpoint: string, config?: AxiosRequestConfig) => {
  return axios({
    ...config,
    ...{
      url: `${BASE_URL}/${endpoint}`,
      headers: {
        "Content-Type": "application/json",
      },
    },
  });
};

export default client;
