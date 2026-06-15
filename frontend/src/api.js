import axios from 'axios'

const BASE_URL = 'http://localhost:8000'

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // sends httpOnly cookie with every request
})

// automatically attach access token to every request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// automatically try to refresh access token on 401
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // if 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            // if a refresh is already in progress, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject })
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`
                    return api(originalRequest)
                }).catch(err => Promise.reject(err))
            }

            originalRequest._retry = true
            isRefreshing = true

            try {
                // try to get a new access token using the refresh token cookie
                const res = await api.post('/auth/refresh')
                const newToken = res.data.access_token
                localStorage.setItem('token', newToken)
                api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
                processQueue(null, newToken)
                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return api(originalRequest)
            } catch (refreshError) {
                // refresh token also expired — boot to login
                processQueue(refreshError, null)
                localStorage.removeItem('token')
                window.location.href = '/login'
                return Promise.reject(refreshError)
            } finally {
                isRefreshing = false
            }
        }

        return Promise.reject(error)
    }
)

export const register = (email, password) =>
    api.post('/auth/register', { email, password })

export const login = (email, password) =>
    api.post('/auth/login', { email, password })

export const logout = () =>
    api.post('/auth/logout')

export const getLogs = () =>
    api.get('/logs/')

export const createLog = (data) =>
    api.post('/logs/', data)

export const updateLog = (id, data) =>
    api.put(`/logs/${id}`, data)

export const deleteLog = (id) =>
    api.delete(`/logs/${id}`)

export const getSummary = () =>
    api.get('/logs/summary')

export const getInsights = () =>
    api.get('/insights/')