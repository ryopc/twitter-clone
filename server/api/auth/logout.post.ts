import { readData } from '~/server/utils/data'
import {
  getAuthUserId,
  persistData,
  removeSession,
} from '~/server/utils/session'

export default defineEventHandler(async (event) => {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return { success: true }
  }

  const token = authHeader.slice(7)
  const data = await readData<{ users: any[]; sessions: any[] }>('users.json')

  // セッションが無効でも正常応答を維持（現状通り）
  removeSession(data, token)
  await persistData('users.json', data)

  return { success: true }
})
