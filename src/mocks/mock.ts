import { worker } from './browser'

export async function enableMocking() {
  if (import.meta.env.VITE_MOCK_API === 'true') {
      console.log('[MSW] Mocking enabled.')
    await worker.start()
  }
}
