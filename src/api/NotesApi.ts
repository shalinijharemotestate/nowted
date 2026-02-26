import axios from 'axios'

const api = axios.create({
  baseURL: 'https://nowted-server.remotestate.com'
})

export default api