import axios from 'axios';
import { useState } from 'react';
import { API_URL } from '../constants/urls';
import { getToken } from '../utils/auth-storage.util';
import { UseRequestProps } from './interfaces/use-request.interface';

const useRequest = <T>({ url, method, body, onSuccess }: UseRequestProps) => {
  const [errors, setErrors] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const doRequest = async (props: Record<string, any> = {}, throwOnError = false) => {
    const fullUrl = process.env.NODE_ENV === 'production' ? `/api${url}` : `${API_URL}${url}`;
    const token = getToken();
    const headers: Record<string, string> = {
      ...(props.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      setLoading(true);
      setErrors(null);

      let response;

      if (method === 'get') {
        response = await axios.get(fullUrl, {
          ...props,
          headers,
        });
      } else {
        response = await axios[method](fullUrl, body, {
          ...props,
          headers,
        });
      }

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data as T;
    } catch (err: any) {
      setErrors(err?.response?.data?.error?.message || 'Something went wrong');

      if (throwOnError) {
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    doRequest,
    errors,
    loading,
  };
};

export default useRequest;
