import { useState, useEffect } from 'react';
import api from '../api';

export const useFetch = (url, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = async () => {
    try {
      setLoading(true);
      const { data: res } = await api.get(url);
      setData(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, deps);

  return { data, loading, error, refetch: fetch };
};
