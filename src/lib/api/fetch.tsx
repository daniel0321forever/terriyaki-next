export const API_BASE = process.env.API_BASE_URL;

export async function apiFetch(path: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {})
    },
    cache: "no-store", // usually what you want for dynamic API data
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}