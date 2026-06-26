import axios from 'axios'

const BASE_URL = 'https://healthtrack-production-8d0e.up.railway.app'
// const BASE_URL = 'http://localhost:8000'

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
// using a single shared promise instead of a boolean + queue array, so every
// request that hits a 401 while a refresh is in flight awaits the exact same
// promise and gets the exact same resolved token, with no ordering ambiguity
let refreshPromise = null

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // if 401 and we haven't already tried to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            if (!refreshPromise) {
                refreshPromise = api.post('/auth/refresh')
                    .then(res => {
                        const newToken = res.data.access_token
                        localStorage.setItem('token', newToken)
                        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
                        return newToken
                    })
                    .catch(refreshError => {
                        // refresh token also expired — clear the stale token
                        // but let whoever called this (e.g. PrivateRoute)
                        // decide what to do next via React Router, rather
                        // than forcing a hard redirect from inside a shared
                        // utility file
                        localStorage.removeItem('token')
                        throw refreshError
                    })
                    .finally(() => {
                        refreshPromise = null
                    })
            }

            try {
                const newToken = await refreshPromise
                originalRequest.headers.Authorization = `Bearer ${newToken}`
                return api(originalRequest)
            } catch (refreshError) {
                return Promise.reject(refreshError)
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

export const verifyEmail = (token) =>
    api.get(`/auth/verify?token=${token}`)