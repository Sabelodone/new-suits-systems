// src/services/clientsService.js
//
// Clients Service — API calls for client management.
// All calls go through the central api instance (auto auth + tenant headers).

import api from './api';

/** List all clients belonging to the attorney's law firm */
export const fetchClients = async () => {
  const response = await api.get('/clients/');
  return response.data;
};

/**
 * Create a new client.
 * Required: { first_name, last_name }
 * Optional: { email, phone }
 *
 * The backend automatically assigns the client to the logged-in
 * attorney's law firm — you don't need to send law_firm.
 */
export const createClient = async (clientData) => {
  const response = await api.post('/clients/', clientData);
  return response.data;
};

/** Update a client's details */
export const updateClient = async (id, clientData) => {
  const response = await api.patch(`/clients/${id}/`, clientData);
  return response.data;
};

/** Delete a client record */
export const deleteClient = async (id) => {
  await api.delete(`/clients/${id}/`);
};