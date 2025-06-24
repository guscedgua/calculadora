import { useState, useCallback, useEffect } from 'react';

const useApi = (apiFunction, { immediate = true, params = {} } = {}) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [status, setStatus] = useState('idle');

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setStatus('pending');
      const result = await apiFunction(...args);
      setData(result.data);
      setError(null);
      setStatus('success');
      return result;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error desconocido');
      setStatus('error');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    if (immediate) {
      execute(params);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    error,
    loading,
    status,
    execute,
    setData,
    reset: () => {
      setData(null);
      setError(null);
      setLoading(false);
      setStatus('idle');
    }
  };
};

export default useApi;