import { expect } from 'aegir/chai'
import { lteReader } from '../src/lte-reader.js'

describe('lte-reader', () => {
  it('should read', async () => {
    const reader = lteReader([
      Uint8Array.from([0, 1, 2, 3, 4]),
      Uint8Array.from([5, 6, 7, 8, 9])
    ])

    const { value } = await reader.next(6)

    if (value == null) {
      throw new Error('No value received')
    }

    expect(value.subarray()).to.equalBytes(Uint8Array.from([0, 1, 2, 3, 4, 5]))
  })

  it('should reject on under-read', async () => {
    const reader = lteReader([
      Uint8Array.from([0, 1, 2, 3, 4]),
      Uint8Array.from([5, 6, 7, 8, 9])
    ])

    await expect(reader.next(100)).to.eventually.be.rejected
      .with.property('code', 'ERR_UNDER_READ')
  })
})
