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

// Add auth token to requests only if it exists
// This allows public routes (rides, game) to work without authentication
api.interceptors.request.use((config) => {
 const token = localStorage.getItem('token');
 // Only add Authorization header if we have a valid token
 // This fixes 401 errors on public game routes
 if (token && token !== 'null' && token !== 'undefined' && token.trim() !== '') {
 config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
});

// Ride APIs
export const rideApi = {
 getAll: (locationId?: string) =>
 api.get<Ride[]>('/rides', { params: { location: locationId } }),
 getBySlug: (slug: string) => api.get<Ride>(`/rides/${slug}`),
 // Admin only
 create: (data: Partial<Ride>) => api.post<Ride>('/rides', data),
 update: (id: string, data: Partial<Ride>) => api.put<Ride>(`/rides/${id}`, data),
 delete: (id: string) => api.delete(`/rides/${id}`)
};

// Location APIs
export const locationApi = {
 getAll: () => api.get<Location[]>('/locations'),
 getById: (id: string) => api.get<Location>(`/locations/${id}`)
};

// Game APIs
export const gameApi = {
 getConfig: (rideId: string) => api.get(`/game/config/${rideId}`),
 generateGuests: (count: number, maxGroupSize: number) =>
 api.post('/game/generate-guests', { count, maxGroupSize })
};

// Admin APIs (require authentication)
export const adminApi = {
 // Rides
 getRides: () => api.get('/rides'),
 createRide: (data: any) => api.post('/rides', data),
 updateRide: (id: string, data: any) => api.put(`/rides/${id}`, data),
 deleteRide: (id: string) => api.delete(`/rides/${id}`),
 // Locations
 getLocations: () => api.get('/locations'),
 createLocation: (data: any) => api.post('/locations', data),
 updateLocation: (id: string, data: any) => api.put(`/locations/${id}`, data),
 deleteLocation: (id: string) => api.delete(`/locations/${id}`),
 // Analytics
 getStats: () => api.get('/admin/stats')
};

export default api;
