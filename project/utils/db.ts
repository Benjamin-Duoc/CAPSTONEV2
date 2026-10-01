import * as initialData from '../data/mockData';
import type { User, HeroHeading, SiteStat, PartnerLogo, AppConfig } from '../types';
import { ENV, getApiUrl } from '../src/config/env';
export { getApiUrl };

// Use environment-specific API URL
// In development, Vite proxy forwards /api requests to localhost:5000
// In production, uses the configured API URL
export const API_BASE = ENV.isDevelopment ? '/api' : ENV.apiUrl;

// --- Case Conversion Helpers ---

const toCamel = (s: string) => {
  return s.replace(/([-_][a-z])/ig, ($1) => {
    return $1.toUpperCase()
      .replace('-', '')
      .replace('_', '');
  });
};

export const keysToCamel = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToCamel(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [toCamel(key)]: keysToCamel(obj[key]),
      }),
      {},
    );
  }
  return obj;
};

const toSnake = (s: string) => {
  return s.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

export const keysToSnake = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToSnake(v));
  } else if (obj !== null && obj.constructor === Object) {
    return Object.keys(obj).reduce(
      (result, key) => ({
        ...result,
        [toSnake(key)]: keysToSnake(obj[key]),
      }),
      {},
    );
  }
  return obj;
};

// --- Generic Fetch Helpers ---

export const uploadImage = async (file: File, folder: string = 'images'): Promise<{ success: boolean; url?: string; message?: string }> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!res.ok) throw new Error('Upload failed');
    return await res.json();
  } catch (err) {
    console.error('Upload error:', err);
    return { success: false, message: 'Error al subir la imagen' };
  }
};

const fetchList = async <T>(endpoint: string, fallback: T[] = []): Promise<T[]> => {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`Failed to fetch ${endpoint}`);
    const data = await res.json();
    return keysToCamel(data);
  } catch (err) {
    console.error(`Error fetching ${endpoint}:`, err);
    return fallback;
  }
};

const createItem = async <T>(endpoint: string, item: any): Promise<T> => {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(keysToSnake(item)),
    credentials: 'include'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `Failed to create item in ${endpoint}`);
  }
  const data = await res.json();
  return keysToCamel(data);
};

const updateItem = async <T>(endpoint: string, item: any): Promise<T> => {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(keysToSnake(item)),
    credentials: 'include'
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `Failed to update item in ${endpoint}`);
  }
  const data = await res.json();
  return keysToCamel(data);
};

const deleteItem = async (endpoint: string, id: number | string): Promise<void> => {
  const res = await fetch(`${API_BASE}${endpoint}/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!res.ok) throw new Error(`Failed to delete item in ${endpoint}`);
};

export const transformList = (data: any[]) => keysToCamel(data);

// --- Database Initialization ---

export const initDatabase = async (): Promise<void> => {
  try {
    const res = await fetch(`${API_BASE}/verify`, { credentials: 'include' });
    if (res.ok) {
      console.log('✅ Conexión con backend verificada.');
    }
  } catch (error) {
    console.warn('Backend no disponible, usando datos mock iniciales.');
  }
};

// --- User Functions (Sprint 1 - Authentication & RBAC) ---

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await fetch(`${API_BASE}/users`, { credentials: 'include' });
    if (!response.ok) throw new Error('Failed to fetch users');
    const data = await response.json();
    return keysToCamel(data);
  } catch (error) {
    console.error('API Error getting users:', error);
    return [];
  }
};

export const registerUser = async (data: Partial<User>): Promise<{ success: boolean; message: string; userId?: number }> => {
  try {
    const response = await fetch(`${API_BASE}/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keysToSnake(data)),
      credentials: 'include'
    });
    const result = await response.json();
    return keysToCamel(result);
  } catch (error) {
    console.error('API Error register:', error);
    return { success: false, message: 'Error de conexión con el servidor.' };
  }
};

export const loginUser = async (email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const response = await fetch(`${API_BASE}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include'
    });
    const result = await response.json();
    return keysToCamel(result);
  } catch (error) {
    console.error('API Error login:', error);
    return { success: false, message: 'Error de conexión con el servidor.' };
  }
};

export const updateUser = async (user: User): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const response = await fetch(`${API_BASE}/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(keysToSnake(user)),
      credentials: 'include'
    });
    const result = await response.json();
    return keysToCamel(result);
  } catch (error) {
    console.error('API Error updating user:', error);
    return { success: false, message: 'Error al actualizar usuario.' };
  }
};

export const deleteUser = async (id: number): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return await response.json();
  } catch (error) {
    console.error('API Error deleting user:', error);
    return { success: false, message: 'Error de conexión con el servidor.' };
  }
};

// --- Hero Heading ---

export const getHeroHeading = async (): Promise<HeroHeading | null> => {
  const res = await fetchList<HeroHeading>('/hero-headings', [initialData.heroHeading]);
  return res && res.length > 0 ? res[0] : initialData.heroHeading;
};

export const saveHeroHeading = async (data: HeroHeading): Promise<any> => {
  const payload = { ...data, id: data.id || 1 };
  const res = await fetch(`${API_BASE}/hero-headings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(keysToSnake(payload))
  });
  if (!res.ok) throw new Error('Failed to save HeroHeading');
  return await res.json();
};

// --- Site Stats ---

export const getStats = async (): Promise<SiteStat[]> => {
  return fetchList<SiteStat>('/site-stats', initialData.siteStats);
};

export const updateStat = async (item: SiteStat): Promise<SiteStat> => {
  return updateItem<SiteStat>('/site-stats', item);
};

// --- Partner Logos ---

export const getPartnerLogos = async (): Promise<PartnerLogo[]> => {
  return fetchList<PartnerLogo>('/partner-logos', initialData.partnerLogos);
};

export const createPartnerLogo = async (item: Omit<PartnerLogo, 'id'>): Promise<PartnerLogo> => {
  return createItem<PartnerLogo>('/partner-logos', item);
};

export const updatePartnerLogo = async (item: PartnerLogo): Promise<PartnerLogo> => {
  return updateItem<PartnerLogo>('/partner-logos', item);
};

export const deletePartnerLogo = async (id: number): Promise<void> => {
  return deleteItem('/partner-logos', id);
};

// --- Rotation Interval (App Config) ---

export const getRotationInterval = async (): Promise<number> => {
  try {
    const data = await fetchList<AppConfig>('/app-configs');
    const config = data.find((c: any) => c.key === 'rotationInterval');
    return config ? parseInt(config.value) : 1;
  } catch {
    return 1;
  }
};

export const saveRotationInterval = async (interval: number): Promise<void> => {
  await createItem('/app-configs', { key: 'rotationInterval', value: String(interval) });
};
