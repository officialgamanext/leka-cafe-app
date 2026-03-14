import { APIEndpoints } from '@/constants/apiEndpoint';
import { AUTH_STATE_KEY, SecureStoreGet, SecureStoreSave } from '@/context/AuthContext';
import { AuthState } from '@/types';
import axios from 'axios';
import { router } from 'expo-router';

const apiClient = axios.create({
  baseURL: APIEndpoints.baseURL,
  timeout: 30000, // 30 seconds timeout
});

const RETRY_KEY = 'auth_retry';
const MAX_RETRY_ALLOWED = 5;

const navigateToErrorPage = (buttonLabel: 'Try Again' | 'Retry') => {
  router.replace({
    pathname: '/error',
    params: {
      buttonLabel,
    },
  });
};

const HandleUnauthorize = async () => {
  const getAuthRetry = await SecureStoreGet(RETRY_KEY) || '0';
  if (parseInt(getAuthRetry) < MAX_RETRY_ALLOWED) {
    await SecureStoreSave(RETRY_KEY, (getAuthRetry+1))
    return;
  }

  // If More than allowed Retry then route to Login Page
  if (parseInt(getAuthRetry) > MAX_RETRY_ALLOWED) {
    await SecureStoreSave(RETRY_KEY, '0')
    router.navigate('/auth/login');
    return;
  }
}

// REQUEST Interceptor: Add Token
apiClient.interceptors.request.use(
  async (config) => {
    const authState = await SecureStoreGet(AUTH_STATE_KEY) || ''
    if (authState && authState.length > 0){
      const jsonParse = JSON.parse(authState) as AuthState
      if (authState && jsonParse.isAuthenticated && jsonParse.token) {
        config.headers.Authorization = `Bearer ${jsonParse.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE Interceptor: Handle 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log('API Response Failed', apiClient.getUri())
    if (error.response?.status === 503) {
      navigateToErrorPage('Try Again');
      return Promise.reject(error);
    }

    if (error.response?.status === 500) {
      console.error('Internal Server Error:', error);
      navigateToErrorPage('Retry');
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      // Logic for Logout or Token Refresh
      console.log('Unauthorized - redirecting to login...');
      
      await HandleUnauthorize();
    }
    return Promise.reject(error);
  }
);

export default apiClient;