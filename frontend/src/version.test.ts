// frontend/src/version.test.ts
import { describe, it, expect } from 'vitest'
import { APP_VERSION } from './version'

describe('APP_VERSION', () => {
  it('是非空字串（來自 build 時注入的 git 版本資訊）', () => {
    expect(typeof APP_VERSION).toBe('string')
    expect(APP_VERSION.length).toBeGreaterThan(0)
  })
})
