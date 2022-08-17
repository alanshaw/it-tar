import { expect } from 'aegir/chai'
import * as Tar from '../src/index.js'
import * as Fixtures from './fixtures/index.js'
import Zlib from 'zlib'
import Fs from 'fs'
// @ts-expect-error no types
import toIterable from 'stream-to-it'
import { pipe } from 'it-pipe'

describe('huge', function () {
  this.timeout(120 * 1000)

  it('should handle huge files', async () => {
    let noEntries = false
    const hugeFileSize = 8804630528 // ~8.2GB
    let dataLength = 0

    await pipe(
      Fs.createReadStream(Fixtures.HUGE),
      toIterable.transform(Zlib.createGunzip()),
      Tar.extract(),
      async source => {
        for await (const entry of source) {
          expect(entry.header).to.deep.equal({
            devmajor: 0,
            devminor: 0,
            gid: 20,
            gname: 'staff',
            linkname: undefined,
            mode: 420,
            mtime: new Date(1521214967000),
            name: 'huge.txt',
            pax: {
              'LIBARCHIVE.creationtime': '1521214954',
              'SCHILY.dev': '16777218',
              'SCHILY.ino': '91584182',
              'SCHILY.nlink': '1',
              atime: '1521214969',
              ctime: '1521214967',
              size: hugeFileSize.toString()
            },
            size: hugeFileSize,
            type: 'file',
            uid: 502,
            uname: 'apd4n'
          })

          for await (const chunk of entry.body) {
            dataLength += chunk.length
          }

          noEntries = true
        }
      }
    )

    expect(noEntries).to.be.true()
    expect(dataLength).to.equal(hugeFileSize)
  })
})
