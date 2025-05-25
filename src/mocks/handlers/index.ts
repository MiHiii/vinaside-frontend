// src/mocks/handlers/index.ts
import { authHandlers } from './authHandlers'
import { userHandlers } from './userHandlers'
import { roomHandlers } from './roomHandlers'

export const handlers = [
  ...authHandlers,
  ...userHandlers,
  ...roomHandlers,
]
