// src/api/client.js

/*
|--------------------------------------------------------------------------
| CENTRAL API CLIENT
|--------------------------------------------------------------------------
|
| This file handles ALL communication with the Django backend.
|
| FIXES:
| 1. Centralized API requests
| 2. Automatically sends JWT token
| 3. Automatically sends tenant header
| 4. Works with deployed Render backend
| 5. Easy environment switching
|
*/

//
// ================================================================
// BACKEND URL
// ================================================================
//
// PRODUCTION (Render)
//
const API_URL =
  "https://suits-webapp-backend.onrender.com/api/v1";

/*
|--------------------------------------------------------------------------
| OPTIONAL FUTURE IMPROVEMENT
|--------------------------------------------------------------------------
|
| Later you can use:
|
| const API_URL = process.env.REACT_APP_API_URL;
|
| Then configure:
|
| .env
| REACT_APP_API_URL=https://suits-webapp-backend.onrender.com/api/v1
|
| Better for production environments
|
*/


/**
 * Generic API request handler
 */
export const apiRequest = async (
  endpoint,
  method = "GET",
  data = null
) => {

  // ============================================================
  // GET TOKEN + TENANT FROM LOCAL STORAGE
  // ============================================================

  const token = localStorage.getItem("access_token");

  // IMPORTANT:
  // Must match backend middleware
  const tenantCode =
    localStorage.getItem("tenant_code");

  try {

    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        method,

        headers: {
          "Content-Type": "application/json",

          // ======================================================
          // JWT AUTHORIZATION
          // ======================================================

          ...(token && {
            Authorization: `Bearer ${token}`,
          }),

          // ======================================================
          // MULTI-TENANT HEADER
          // ======================================================

          ...(tenantCode && {
            "X-Tenant-Code": tenantCode,
          }),
        },

        body: data
          ? JSON.stringify(data)
          : null,
      }
    );

    // ==========================================================
    // HANDLE UNAUTHORIZED
    // ==========================================================

    if (response.status === 401) {

      console.error("Unauthorized request");

      // Optional future improvement:
      // redirect to login page
    }

    // ==========================================================
    // HANDLE NON-JSON RESPONSES SAFELY
    // ==========================================================

    const contentType =
      response.headers.get("content-type");

    if (
      contentType &&
      contentType.includes("application/json")
    ) {
      return await response.json();
    }

    return await response.text();

  } catch (error) {

    console.error("API ERROR:", error);

    throw error;
  }
};