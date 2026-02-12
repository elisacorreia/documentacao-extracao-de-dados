import axios from 'axios';

// Configuração do Axios
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.error) {
      return Promise.reject(new Error(error.response.data.error));
    }
    return Promise.reject(error);
  }
);

export default api;
