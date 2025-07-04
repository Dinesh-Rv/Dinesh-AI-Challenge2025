import axios, { AxiosResponse } from 'axios';
import { IGetProductsResponse } from 'models';

const isProduction = process.env.NODE_ENV === 'production';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // ms

const retryAxios = async (fn: () => Promise<AxiosResponse>, retries = MAX_RETRIES): Promise<AxiosResponse> => {
  let lastError;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      if (attempt < retries - 1) {
        await new Promise(res => setTimeout(res, RETRY_DELAY));
      }
    }
  }
  throw new Error(`Network request failed after ${retries} attempts: ${lastError?.message || lastError}`);
};

export const getProducts = async (setLoading?: (loading: boolean) => void) => {
  if (setLoading) setLoading(true);
  try {
    let response: AxiosResponse<IGetProductsResponse>;
    if (isProduction) {
      response = await retryAxios(() => axios.get(process.env.REACT_APP_PRODUCTS_API_URL as string));
      if (response.status < 200 || response.status >= 300) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
    } else {
      // Simulate async for local require
      response = { data: require('static/json/products.json'), status: 200, statusText: 'OK', headers: {}, config: {} };
    }
    const products = response.data?.data?.products || [];
    return products;
  } catch (error: any) {
    throw new Error(`Failed to fetch products. ${error.message || error}`);
  } finally {
    if (setLoading) setLoading(false);
  }
}; 