const API_BASE_URL = 'http://localhost:8080/api/v1'

export const api = {
  async get(path) {
   const token = localStorage.getItem('buyerToken')
    const response = await fetch(`${API_BASE_URL}${path}`,{
    headers: {
    Authorization: `Bearer ${token}`,
    },
    })

    if (!response.ok) {
      throw new Error(`GET ${path} failed: ${response.status}`)
    }

    return response.json()
  },
  async post(path, body) {
      const token = localStorage.getItem('buyerToken')

      const response = await fetch(`${API_BASE_URL}${path}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const message = await response.text()
        throw new Error(`POST ${path} failed: ${response.status} ${message}`)
      }

      return response.json()
    },
}


