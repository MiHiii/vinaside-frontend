import { rest } from 'msw'

export const authHandlers = [
  rest.post('/auth/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        accessToken: 'fake_access_token',
        user: { id: 1, name: 'Fake User', email: 'fake@example.com' , password : 'fake_password'},
      })
    )
  }),


  rest.post('/auth/refresh-token', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        accessToken: 'new_fake_access_token',
      })
    )
  }),
]