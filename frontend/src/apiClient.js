const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

// JWT for /auth, /api-keys (stored after login)
function getAuthToken() {
  return localStorage.getItem("jsontree_token") || null;
}

// X-API-Key for /trees, /forests (we'll set later)
function getApiKey() {
  return localStorage.getItem("jsontree_api_key") || null;
}

// Generic request with JWT (Authorization: Bearer)
export async function apiRequest(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const err = new Error(data?.error || "Request failed");
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

// Request that uses X-API-Key instead of JWT
export async function apiRequestWithKey(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const apiKey = getApiKey();
  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const err = new Error(data?.error || "Request failed");
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}
