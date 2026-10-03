import { api, toQuery } from './client.js'

// Wraps the existing ProductController: GET /api/v1/products (paged).
export const productsApi = {
  list: (params = {}) => api.get(`/products${toQuery(params)}`),
  listAll: () => api.getAllPages('/products', { sort: 'id,asc' }),
}