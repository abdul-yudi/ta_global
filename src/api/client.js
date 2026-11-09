const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5277/api';
const TOKEN_KEY = 'taglobal.auth.token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = token => token ? localStorage.setItem(TOKEN_KEY, token) : localStorage.removeItem(TOKEN_KEY);

export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new Error(`Backend tidak dapat dihubungi (${API_BASE}). Pastikan API .NET sedang berjalan.`);
  }
  const text = await response.text();
  let data = null;
  if (text) { try { data = JSON.parse(text); } catch { data = text; } }
  if (!response.ok) {
    if (response.status === 401 && auth) {
      setToken(null);
      window.dispatchEvent(new Event('taglobal:unauthorized'));
    }
    throw new Error(data?.detail || data?.title || data?.message || `Permintaan API gagal (${response.status}).`);
  }
  return data;
}

export const apiBaseUrl = API_BASE;
