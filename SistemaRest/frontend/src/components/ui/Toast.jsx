import { useEffect } from 'react';
import { toast, Toaster } from 'react-hot-toast';

export const ToastContainer = () => (
  <Toaster
    position="top-right"
    toastOptions={{
      duration: 4000,
      style: {
        background: '#363636',
        color: '#fff',
      },
    }}
  />
);

export const showToast = (message, type = 'success') => {
  if (type === 'success') {
    toast.success(message);
  } else if (type === 'error') {
    toast.error(message);
  } else {
    toast(message);
  }
};