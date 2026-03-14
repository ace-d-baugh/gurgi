import axios from 'axios';
import { Ride, Location } from '../types';

const API_URL = '/api';

const api = axios.create({
 baseURL: API_URL,
 headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
 const token = localStorage.getItem('token');
 if (token) { config.headers.Authorization = `Bearer ${token}`; }
 return config;
});

export const adminRideApi = {
 getAll: async (includeInactive = true) => {
 const res = await api.get<Ride[]>('/rides', { params: { admin: includeInactive } });
 return res.data;
 },
 create: async (data: Partial<Ride>) => {
 const res = await api.post<Ride>('/rides', data);
 return res.data;
 },
 update: async (id: string, data: Partial<Ride>) => {
 const res = await api.put<Ride>(`/rides/${id}`, data);
 return res.data;
 },
 delete: async (id: string) => {
 await api.delete(`/rides/${id}`);
 return { success: true };
 }
};

export const adminLocationApi = {
 getAll: async (includeInactive = true) => {
 try {
 const res = await api.get<Location[]>('/locations');
 return res.data;
 } catch {
 return [] as Location[];
 }
 },
 create: async (data: Partial<Location>) => {
 const res = await api.post<Location>('/locations', data);
 return res.data;
 },
 update: async (id: string, data: Partial<Location>) => {
 const res = await api.put<Location>(`/locations/${id}`, data);
 return res.data;
 },
 delete: async (id: string) => {
 await api.delete(`/locations/${id}`);
 return { success: true };
 }
};

export default { adminRideApi, adminLocationApi };
