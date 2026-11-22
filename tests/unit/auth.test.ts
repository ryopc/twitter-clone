import { describe, it, expect } from 'vitest'
import bcrypt from 'bcryptjs'

describe('password hashing (bcryptjs)', () => {
  it('平文パスワードはハッシュ化されて保存される', () => {
    const hash = bcrypt.hashSync('password123', 10)
    expect(hash).not.toBe('password123')
    expect(hash.startsWith('$2')).toBe(true)
  })

  it('正しいパスワードで compareSync は true を返す', () => {
    const hash = bcrypt.hashSync('password123', 10)
    expect(bcrypt.compareSync('password123', hash)).toBe(true)
  })

  it('間違ったパスワードで compareSync は false を返す', () => {
    const hash = bcrypt.hashSync('password123', 10)
    expect(bcrypt.compareSync('wrong-password', hash)).toBe(false)
  })
})
