// frontend/src/utils/auth.js

const ACCESS_TOKEN_KEY = 'authToken'; // La clave que estamos esperando

export const getToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const setTokens = (accessToken) => {
  console.log('>>> setTokens: Intentando guardar accessToken:', accessToken); // Añade este console.log
  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    console.log('>>> setTokens: accessToken guardado exitosamente en localStorage.'); // Añade este console.log
  } else {
    console.warn('>>> setTokens: accessToken es nulo o indefinido. No se guardará.'); // Añade este console.log
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};

export const clearTokens = () => {
  console.log('>>> clearTokens: Limpiando tokens.'); // Añade este console.log
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem('user');
};

export const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000;
    return Date.now() >= expirationTime;
  } catch (e) {
    console.error("Error decoding token:", e);
    return true;
  }
};
