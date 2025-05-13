// fetch wrappers for /api/*
export async function health() {
  return fetch('/api/health');
}
