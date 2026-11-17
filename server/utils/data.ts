import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const DATA_DIR = join(process.cwd(), 'data')

export async function readData<T>(file: string): Promise<T> {
  const content = await readFile(join(DATA_DIR, file), 'utf-8')
  return JSON.parse(content)
}

export async function writeData<T>(file: string, data: T): Promise<void> {
  await writeFile(join(DATA_DIR, file), JSON.stringify(data, null, 2), 'utf-8')
}

export type { User, Post, AuthResponse, FollowStatus } from '~/types'
