import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ConnectionTest = () => {
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await axios.get('/api/connection-test');
        setTestResult(response.data);
        setError(null);
      } catch (err) {
        setError({
          message: err.response?.data?.message || err.message,
          details: err.response?.data
        });
        setTestResult(null);
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  if (loading) {
    return <div>Testing connection to backend...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Connection Test</h2>
      
      {error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 p-4 rounded mb-4">
          <h3 className="font-bold text-lg">Connection Failed</h3>
          <p>{error.message}</p>
          {error.details && (
            <pre className="mt-2 bg-gray-800 text-white p-3 rounded overflow-auto text-sm">
              {JSON.stringify(error.details, null, 2)}
            </pre>
          )}
        </div>
      ) : null}
      
      {testResult && (
        <div className="bg-green-100 border border-green-400 text-green-700 p-4 rounded mb-4">
          <h3 className="font-bold text-lg">Connection Successful!</h3>
          <div className="mt-3">
            <p><strong>Message:</strong> {testResult.message}</p>
            <p><strong>Client Origin:</strong> {testResult.clientOrigin}</p>
            <p><strong>Origin Allowed:</strong> 
              <span className={`font-bold ${testResult.originAllowed ? 'text-green-600' : 'text-red-600'}`}>
                {testResult.originAllowed ? ' YES' : ' NO'}
              </span>
            </p>
            <p><strong>Timestamp:</strong> {testResult.timestamp}</p>
          </div>
          
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Request Headers:</h4>
            <pre className="bg-gray-800 text-white p-3 rounded overflow-auto text-sm">
              {JSON.stringify(testResult.headers, null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Troubleshooting Tips:</h3>
        <ul className="list-disc pl-6 space-y-1">
          <li>Ensure backend is running on port {process.env.VITE_API_PORT || 5000}</li>
          <li>Check your .env files in both frontend and backend</li>
          <li>Verify CORS settings in the backend</li>
          <li>Inspect browser console for errors (F12)</li>
          <li>Check network tab for failed requests</li>
        </ul>
      </div>
    </div>
  );
};

export default ConnectionTest;