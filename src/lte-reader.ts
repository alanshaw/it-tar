import { reader } from 'it-reader'
import { isUint8ArrayList, Uint8ArrayList } from 'uint8arraylist'
import type { Source } from 'it-stream-types'

export interface LteReader extends AsyncIterator<Uint8ArrayList, void, number | undefined> {
  nextLte(bytes: number): Promise<IteratorResult<Uint8ArrayList>>
  return(): Promise<IteratorResult<Uint8ArrayList>>
}

export function lteReader (source: Source<Uint8Array>): LteReader {
  const input = reader(source)
  let overflow: Uint8ArrayList | null
  const lteReader = {
    [Symbol.asyncIterator]: () => lteReader,
    async next (bytes?: number): Promise<IteratorResult<Uint8ArrayList>> {
      if (overflow != null) {
        let value
        if (bytes == null || overflow.length === bytes) {
          value = overflow
          overflow = null
        } else if (overflow.length > bytes) {
          value = overflow.sublist(0, bytes)
          overflow = overflow.sublist(bytes)
        } else if (overflow.length < bytes) {
          const { value: nextValue, done } = await input.next(bytes - overflow.length)
          if (done === true) {
            throw Object.assign(
              new Error(`stream ended before ${bytes - overflow.length} bytes became available`),
              { code: 'ERR_UNDER_READ' }
            )
          }
          value = new Uint8ArrayList(overflow, nextValue)
          overflow = null
        }

        if (value == null) {
          const result: IteratorResult<Uint8ArrayList> = { done: true, value: undefined }

          return result
        }

        const result: IteratorResult<Uint8ArrayList> = { done: false, value }

        return result
      }

      return input.next(bytes)
    },
    async nextLte (bytes: number): Promise<IteratorResult<Uint8ArrayList>> {
      const { done, value } = await lteReader.next()

      if (done === true) {
        return {
          done: true,
          value: undefined
        }
      }

      if (value.length <= bytes) {
        return { done: false, value }
      }

      const list = isUint8ArrayList(value) ? value : new Uint8ArrayList(value)

      if (overflow != null) {
        overflow.append(list.sublist(bytes))
      } else {
        overflow = list.sublist(bytes)
      }

      return { done: false, value: list.sublist(0, bytes) }
    },
    async return () {
      return input.return()
    }
  }

  return lteReader
}
