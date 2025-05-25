import { rest } from 'msw'

let rooms = [
  { id: 1, name: "Căn hộ tại Văn Giang", price: "₫1.130.739", nights: 2, rating: 5.0, image: "https://picsum.photos/300/200?random=1", isFavorite: false },
  { id: 2, name: "Căn hộ tại Văn Giang", price: "₫1.261.022", nights: 2, rating: 5.0, image: "https://picsum.photos/300/200?random=2", isFavorite: false },
  { id: 3, name: "Căn hộ tại tt. Văn Giang", price: "₫1.531.460", nights: 2, rating: 5.0, image: "https://picsum.photos/300/200?random=3", isFavorite: false },
  { id: 4, name: "Căn hộ chung cư cao cấp tại Văn Giang", price: "₫1.300.600", nights: 2, rating: 4.88, image: "https://picsum.photos/300/200?random=4", isFavorite: false },
  { id: 5, name: "Căn hộ tại Xuân Quan", price: "₫1.478.493", nights: 2, rating: 5.0, image: "https://picsum.photos/300/200?random=5", isFavorite: false },
  { id: 6, name: "Căn hộ tại Văn Giang", price: "₫1.261.644", nights: 2, rating: 4.94, image: "https://picsum.photos/300/200?random=6", isFavorite: false },
  { id: 7, name: "Phòng tại Văn Giang", price: "₫1.474.401", nights: 2, rating: 5.0, image: "https://picsum.photos/300/200?random=7", isFavorite: false },
]

export const roomHandlers = [
  rest.get('/', (req, res, ctx) => {
    return res(ctx.status(200));
  }),

  rest.get('/rooms', (req, res, ctx) => {
    console.log('Mock GET /rooms called')
    return res(
      ctx.status(200),
      ctx.json(rooms)
    )
  }),

  rest.post('/rooms', async (req, res, ctx) => {
    const body = await req.json()
    const newRoom = { id: Date.now(), ...body }
    rooms.push(newRoom)
    return res(ctx.status(201), ctx.json(newRoom))
  }),

  rest.put('/rooms/:id', async (req, res, ctx) => {
    const { id } = req.params
    const body = await req.json()
    rooms = rooms.map(r => (r.id === Number(id) ? { ...r, ...body } : r))
    return res(ctx.status(200), ctx.json({ ...body, id }))
  }),

  rest.delete('/rooms/:id', (req, res, ctx) => {
    const { id } = req.params
    rooms = rooms.filter(r => r.id !== Number(id))
    return res(ctx.status(204))
  }),
]