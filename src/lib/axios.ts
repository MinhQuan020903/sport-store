import axios from 'axios';

const config = {
  baseURL: process.env.NEXT_PUBLIC_SITE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
};

const axiosClient = axios.create(config);

axiosClient.interceptors.response.use(
  (res: any) => Promise.resolve(res.data),
  async (err: any) => {
    return Promise.reject(((err || {}).response || {}).data);
  }
);

export default axiosClient;
