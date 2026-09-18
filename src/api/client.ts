import axios, { type AxiosInstance } from 'axios';

const client = axios.create({
  baseURL: new URL('/api/v1', globalThis.location?.origin ?? 'http://localhost').href,
  timeout: 10000,
});
export const getClient = (): AxiosInstance => client;
