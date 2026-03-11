import axios from 'axios';
import { Ride, Location } from '../types';

const API_URL = '/api';

// Axios instance
const api = axios.create({
 baseURL: API_URL,
 headers: {
 'Content-Type': 'application/json'
 }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
 const token = localStorage.getItem('token');
 if (token) {
 config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
});

export const rideApi = {
 getAll: (locationId?: string) => 
 api.get<Ride[]>('/rides', { params: { location: locationId } }),
 getBySlug: (slug: string) => api.get<Ride>(`/rides/${slug}`),
 // Admin only
 create: (data: Partial<Ride>) => api.post<Ride>('/rides', data),
 update: (id: string, data: Partial<Ride>) => api.put<Ride>(`/rides/${id}`, data),
 delete: (id: string) => api.delete(`/rides/${id}`)
};

export const locationApi = {
 getAll: () => api.get<Location[]>('/locations'),
 getById: (id: string) => api.get<Location>(`/locations/${id}`)
};

export const gameApi = {
 getConfig: (rideId: string) => api.get(`/game/config/${rideId}`),
 generateGuests: (count: number, maxGroupSize: number) => 
 api.post('/game/generate-guests', { count, maxGroupSize })
};

export default api;
