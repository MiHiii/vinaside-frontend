import { http, HttpResponse } from 'msw'

// Interface định nghĩa dữ liệu
interface User {
  id: string
  email: string
  name: string
  password?: string // Chỉ dùng trong mock, không trả về
}

interface AuthResponse {
  accessToken: string
  user: User
}

interface RefreshResponse {
  accessToken: string
}

interface RegisterPayload {
  email: string
  name: string
  password: string
}

interface LoginPayload {
  email: string
  password: string
}

// Mock data lưu user
const mockUsers: User[] = [
  { id: '1', email: 'mock@user.com', name: 'Mock User', password:'123456' },
]

export const authHandlers = [
  // Đăng nhập
  http.post('/auth/login', async ({ request }) => {
    const data = (await request.json()) as LoginPayload
    // Tìm user mock
    const user = mockUsers.find(u => u.email === data.email)
    if (!user) {
      return HttpResponse.json({ message: 'User not found' }, { status: 404 })
    }
    // Trả token giả
    const response: AuthResponse = { accessToken: 'mock-token', user }
    return HttpResponse.json(response)
  }),

  // Đăng ký
  http.post('/auth/register', async ({ request }) => {
    const data = (await request.json()) as RegisterPayload
       if (mockUsers.find(u => u.email === data.email)) {
      return HttpResponse.json(
        { message: 'Email này đã được đăng ký' },
        { status: 400 }
      )
    }
    // Tạo user mới
    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
    }
    mockUsers.push(newUser)
    // Trả token và thông tin user
    const response: AuthResponse = { accessToken: 'mock-token', user: newUser }
    return HttpResponse.json(response, { status: 201 })
  }),

  // Làm mới token
  http.post('/auth/refresh-token', () => {
    const response: RefreshResponse = { accessToken: 'new-mock-token' }
    return HttpResponse.json(response)
  }),
]
