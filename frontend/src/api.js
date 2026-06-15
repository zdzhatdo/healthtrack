import axios from 'axios'

const BASE_URL = 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: BASE_URL,
})

// automatically attach token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// automatically redirect to login if token is expired or invalid
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export const register = (email, password) =>
  api.post('/auth/register', { email, password })

export const login = (email, password) =>
  api.post('/auth/login', { email, password })

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