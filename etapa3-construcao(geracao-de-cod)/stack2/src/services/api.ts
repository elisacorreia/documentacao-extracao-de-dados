import axios from 'axios';

// Configuração base da API
export const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Erro retornado pelo servidor
      const message = error.response.data?.message || 'Erro ao processar requisição';
      console.error('Erro da API:', message);
      throw new Error(message);
    } else if (error.request) {
      // Requisição foi feita mas não houve resposta
      console.error('Servidor não respondeu');
      throw new Error('Servidor não está respondendo. Verifique se o backend está rodando.');
    } else {
      // Erro na configuração da requisição
      console.error('Erro:', error.message);
      throw error;
    }
  }
);
