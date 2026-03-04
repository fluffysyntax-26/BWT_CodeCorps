import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'bwtcodecorps-production.up.railway.app',
});

let tokenGetter = null;

export const setTokenGetter = (getterFn) => {
    tokenGetter = getterFn;
};

api.interceptors.request.use(async (config) => {
    if (!tokenGetter) {
        console.warn('[API] No token getter set yet');
        return config;
    }
    
    try {
        const token = await tokenGetter();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('[API] Token set in headers:', token.substring(0, 20) + '...');
        } else {
            console.warn('[API] Token is null/undefined');
        }
    } catch (error) {
        console.error('[API] Error getting token:', error);
    }
    return config;
});

api.interceptors.response.use(
    response => {
        console.log('[API] Response:', response.config.url, response.status);
        return response;
    },
    error => {
        console.error('[API] Error response:', error.config?.url, error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

export const useApi = (getToken) => {
    if (getToken) {
        setTokenGetter(getToken);
    }

    return {
        getProfile: () => api.get('/api/profile'),
        updateProfile: (data) => api.post('/api/profile', data),
        resetProfile: () => api.delete('/api/profile'),
        getExpenses: () => api.get('/api/expenses'),
        addExpense: (data) => api.post('/api/expenses', data),
        deleteExpense: (id) => api.delete(`/api/expenses/${id}`),
        evaluateDecision: (decisionData) => api.post('/api/decisions/evaluate-decision', decisionData),
        sendMessage: (message) => api.post('/api/chat', { message }),
        scanReceipt: (formData) => api.post('/api/receipt/scan', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),
    };
};

export default api;
