import { readData } from '~/server/utils/data'

export default defineEventHandler(async () => {
  const data = await readData<{ trends: any[] }>('trends.json')

  // トレンドスコアでソート（tweetCount の降順）
  return {
    trends: [...data.trends].sort((a, b) => b.tweetCount - a.tweetCount),
  }
})
