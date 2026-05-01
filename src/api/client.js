const API_URL = "https://suits-webapp-backend.onrender.com/api/v1";

export const apiRequest = async (endpoint, method = "GET", data = null) => {
  const token = localStorage.getItem("accessToken");
  const tenant = localStorage.getItem("tenantCode");

  const response = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",

      // REQUIRED for backend middleware
      "X-Tenant-Code": tenant || "",

      // Auth (JWT)
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: data ? JSON.stringify(data) : null
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.detail || "API request failed");
  }

  return result;
};