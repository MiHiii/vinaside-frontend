import { rest } from 'msw'

export const userHandlers = [
  rest.get('/users/me', async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        id: 1,
        name: 'Fake User',
        email: 'fake@example.com',
        role: 'admin',
      })
    )
  }),

  rest.put('/users/me', async (req, res, ctx) => {
    const body = await req.json()
    return res(
      ctx.status(200),
      ctx.json({
        ...body,
        updatedAt: new Date().toISOString(),
      })
    )
  }),
]