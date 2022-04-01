import { expect } from 'aegir/utils/chai.js'
import * as Tar from '../src/index.js'
import * as Fixtures from './fixtures/index.js'
import Fs from 'fs'
import { pipe } from 'it-pipe'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'
import toBuffer from 'it-to-buffer'

const clamp = (index: any, len: number, defaultValue: number): number => {
  if (typeof index !== 'number') {
    return defaultValue
  }

  let num = ~~index // Coerce to integer.

  if (num >= len) {
    return len
  }

  if (num >= 0) {
    return num
  }

  num += len

  if (num >= 0) {
    return num
  }

  return 0
}

describe('extract', () => {
  it('one-file', async () => {
    let noEntries = false

    await pipe(
      Fs.createReadStream(Fixtures.ONE_FILE_TAR),
      Tar.extract(),
      async source => {
        for await (const entry of source) {
          expect(entry.header).to.deep.equal({
            name: 'test.txt',
            mode: parseInt('644', 8),
            uid: 501,
            gid: 20,
            size: 12,
            mtime: new Date(1387580181000),
            type: 'file',
            linkname: undefined,
            uname: 'maf',
            gname: 'staff',
            devmajor: 0,
            devminor: 0
          })

          const data = await toBuffer(entry.body)
          noEntries = true
          expect(uint8ArrayToString(data)).to.equal('hello world\n')
        }
      }
    )

    expect(noEntries).to.be.true()
  })

  it('chunked-one-file', async () => {
    let noEntries = false

    await pipe(
      (async function * () {
        const b = Fs.readFileSync(Fixtures.ONE_FILE_TAR)

        for (let i = 0; i < b.length; i += 321) {
          yield b.slice(i, clamp(i + 321, b.length, b.length))
        }
      })(),
      Tar.extract(),
      async source => {
        for await (const entry of source) {
          expect(entry.header).to.deep.equal({
            name: 'test.txt',
            mode: parseInt('644', 8),
            uid: 501,
            gid: 20,
            size: 12,
            mtime: new Date(1387580181000),
            type: 'file',
            linkname: undefined,
            uname: 'maf',
            gname: 'staff',
            devmajor: 0,
            devminor: 0
          })

          const data = await toBuffer(entry.body)
          noEntries = true
          expect(uint8ArrayToString(data)).to.equal('hello world\n')
        }
      }
    )

    expect(noEntries).to.be.true()
  })

  it('multi-file', async () => {
    let noEntries = false

    await pipe(
      Fs.createReadStream(Fixtures.MULTI_FILE_TAR),
      Tar.extract(),
      async source => {
        let i = 0
        for await (const entry of source) {
          if (i === 0) {
            expect(entry.header).to.deep.equal({
              name: 'file-1.txt',
              mode: parseInt('644', 8),
              uid: 501,
              gid: 20,
              size: 12,
              mtime: new Date(1387580181000),
              type: 'file',
              linkname: undefined,
              uname: 'maf',
              gname: 'staff',
              devmajor: 0,
              devminor: 0
            })

            const data = await toBuffer(entry.body)
            expect(uint8ArrayToString(data)).to.equal('i am file-1\n')
          } else if (i === 1) {
            expect(entry.header).to.deep.equal({
              name: 'file-2.txt',
              mode: parseInt('644', 8),
              uid: 501,
              gid: 20,
              size: 12,
              mtime: new Date(1387580181000),
              type: 'file',
              linkname: undefined,
              uname: 'maf',
              gname: 'staff',
              devmajor: 0,
              devminor: 0
            })

            const data = await toBuffer(entry.body)
            expect(uint8ArrayToString(data)).to.equal('i am file-2\n')
          } else {
            throw new Error('expected only 2 entries')
          }
          noEntries = true
          i++
        }
      }
    )

    expect(noEntries).to.be.true()
  })

  it('chunked-multi-file', async () => {
    let noEntries = false

    await pipe(
      (async function * () {
        const b = Fs.readFileSync(Fixtures.MULTI_FILE_TAR)

        for (let i = 0; i < b.length; i += 321) {
          yield b.slice(i, clamp(i + 321, b.length, b.length))
        }
      })(),
      Tar.extract(),
      async source => {
        let i = 0
        for await (const entry of source) {
          if (i === 0) {
            expect(entry.header).to.deep.equal({
              name: 'file-1.txt',
              mode: parseInt('644', 8),
              uid: 501,
              gid: 20,
              size: 12,
              mtime: new Date(1387580181000),
              type: 'file',
              linkname: undefined,
              uname: 'maf',
              gname: 'staff',
              devmajor: 0,
              devminor: 0
            })

            const data = await toBuffer(entry.body)
            expect(uint8ArrayToString(data)).to.equal('i am file-1\n')
          } else if (i === 1) {
            expect(entry.header).to.deep.equal({
              name: 'file-2.txt',
              mode: parseInt('644', 8),
              uid: 501,
              gid: 20,
              size: 12,
              mtime: new Date(1387580181000),
              type: 'file',
              linkname: undefined,
              uname: 'maf',
              gname: 'staff',
              devmajor: 0,
              devminor: 0
            })

            const data = await toBuffer(entry.body)
            expect(uint8ArrayToString(data)).to.equal('i am file-2\n')
          } else {
            throw new Error('expected only 2 entries')
          }
          noEntries = true
          i++
        }
      }
    )

    expect(noEntries).to.be.true()
  })

  it('pax', async () => {
    let noEntries = false

    await pipe(
      Fs.createReadStream(Fixtures.PAX_TAR),
      Tar.extract(),
      async source => {
        for await (const entry of source) {
          expect(entry.header).to.deep.equal({
            name: 'pax.txt',
            mode: parseInt('644', 8),
            uid: 501,
            gid: 20,
            size: 12,
            mtime: new Date(1387580181000),
            type: 'file',
            linkname: undefined,
            uname: 'maf',
            gname: 'staff',
            devmajor: 0,
            devminor: 0,
            pax: { path: 'pax.txt', special: 'sauce' }
          })

          const data = await toBuffer(entry.body)
          noEntries = true
          expect(uint8ArrayToString(data)).to.equal('hello world\n')
        }
      }
    )

    expect(noEntries).to.be.true()
  })

  it('types', async () => {
    let noEntries = false

    await pipe(
      Fs.createReadStream(Fixtures.TYPES_TAR),
      Tar.extract(),
      async source => {
        let i = 0
        for await (const entry of source) {
          if (i === 0) {
            expect(entry.header).to.deep.equal({
              name: 'directory',
              mode: parseInt('755', 8),
              uid: 501,
              gid: 20,
              size: 0,
              mtime: new Date(1387580181000),
              type: 'directory',
              linkname: undefined,
              uname: 'maf',
              gname: 'staff',
              devmajor: 0,
              devminor: 0
            })

            for await (const _ of entry.body) { // eslint-disable-line no-unused-vars,@typescript-eslint/no-unused-vars
              expect.fail()
            }
          } else if (i === 1) {
            expect(entry.header).to.deep.equal({
              name: 'directory-link',
              mode: parseInt('755', 8),
              uid: 501,
              gid: 20,
              size: 0,
              mtime: new Date(1387580181000),
              type: 'symlink',
              linkname: 'directory',
              uname: 'maf',
              gname: 'staff',
              devmajor: 0,
              devminor: 0
            })

            for await (const _ of entry.body) { // eslint-disable-line no-unused-vars,@typescript-eslint/no-unused-vars
              expect.fail()
            }
          } else {
            throw new Error('expected only 2 entries')
          }
          noEntries = true
          i++
        }
      }
    )

    expect(noEntries).to.be.true()
  })

  it('long-name', async () => {
    let noEntries = false

    await pipe(
      Fs.createReadStream(Fixtures.LONG_NAME_TAR),
      Tar.extract(),
      async source => {
        for await (const entry of source) {
          expect(entry.header).to.deep.equal({
            name: 'my/file/is/longer/than/100/characters/and/should/use/the/prefix/header/foobarbaz/foobarbaz/foobarbaz/foobarbaz/foobarbaz/foobarbaz/filename.txt',
            mode: parseInt('644', 8),
            uid: 501,
            gid: 20,
            size: 16,
            mtime: new Date(1387580181000),
            type: 'file',
            linkname: undefined,
            uname: 'maf',
            gname: 'staff',
            devmajor: 0,
            devminor: 0
          })

          const data = await toBuffer(entry.body)
          noEntries = true
          expect(uint8ArrayToString(data)).to.equal('hello long name\n')
        }
      }
    )

    expect(noEntries).to.be.true()
  })

  it('unicode-bsd', async () => {
    let noEntries = false

    await pipe(
      Fs.createReadStream(Fixtures.UNICODE_BSD_TAR),
      Tar.extract(),
      async source => {
        for await (const entry of source) {
          expect(entry.header).to.deep.equal({
            name: 'høllø.txt',
            mode: parseInt('644', 8),
            uid: 501,
            gid: 20,
            size: 4,
            mtime: new Date(1387588646000),
            pax: { 'SCHILY.dev': '16777217', 'SCHILY.ino': '3599143', 'SCHILY.nlink': '1', atime: '1387589077', ctime: '1387588646', path: 'høllø.txt' },
            type: 'file',
            linkname: undefined,
            uname: 'maf',
            gname: 'staff',
            devmajor: 0,
            devminor: 0
          })

          const data = await toBuffer(entry.body)
          noEntries = true
          expect(uint8ArrayToString(data)).to.equal('hej\n')
        }
      }
    )

    expect(noEntries).to.be.true()
  })

  it('unicode', async () => {
    let noEntries = false

    await pipe(
      Fs.createReadStream(Fixtures.UNICODE_TAR),
      Tar.extract(),
      async source => {
        for await (const entry of source) {
          expect(entry.header).to.deep.equal({
            name: 'høstål.txt',
            mode: parseInt('644', 8),
            uid: 501,
            gid: 20,
            size: 8,
            mtime: new Date(1387580181000),
            pax: { path: 'høstål.txt' },
            type: 'file',
            linkname: undefined,
            uname: 'maf',
            gname: 'staff',
            devmajor: 0,
            devminor: 0
          })

          const data = await toBuffer(entry.body)
          noEntries = true
          expect(uint8ArrayToString(data)).to.equal('høllø\n')
        }
      }
    )

    expect(noEntries).to.be.true()
  })

  it('name-is-100', async () => {
    let noEntries = false

    await pipe(
      Fs.createReadStream(Fixtures.NAME_IS_100_TAR),
      Tar.extract(),
      async source => {
        for await (const entry of source) {
          expect(entry.header.name.length).to.equal(100)

          const data = await toBuffer(entry.body)
          noEntries = true
          expect(uint8ArrayToString(data)).to.equal('hello\n')
        }
      }
    )

    expect(noEntries).to.be.true()
  })

  it('invalid-file', async () => {
    try {
      await pipe(
        Fs.createReadStream(Fixtures.INVALID_TGZ),
        Tar.extract(),
        async source => {
          for await (const _ of source) { // eslint-disable-line no-unused-vars,@typescript-eslint/no-unused-vars
            expect.fail()
          }
        }
      )
    } catch (err) {
      return expect(err).to.be.ok()
    }

    expect.fail()
  })

  it('space prefixed', async () => {
    await pipe(
      Fs.createReadStream(Fixtures.SPACE_TAR_GZ),
      Tar.extract(),
      async source => {
        for await (const _ of source) { // eslint-disable-line no-unused-vars,@typescript-eslint/no-unused-vars
          expect(true).to.be.ok()
        }
      }
    )

    expect(true).to.be.ok()
  })

  it('gnu long path', async () => {
    await pipe(
      Fs.createReadStream(Fixtures.GNU_LONG_PATH),
      Tar.extract(),
      async source => {
        for await (const entry of source) {
          expect(entry.header.name.length).to.be.greaterThan(100)
        }
      }
    )

    expect(true).to.be.ok()
  })

  it('base 256 uid and gid', async () => {
    await pipe(
      Fs.createReadStream(Fixtures.BASE_256_UID_GID),
      Tar.extract(),
      async source => {
        for await (const entry of source) {
          expect(entry.header.uid).to.equal(116435139)
          expect(entry.header.gid).to.equal(1876110778)
        }
      }
    )

    expect(true).to.be.ok()
  })

  it('base 256 size', async () => {
    await pipe(
      Fs.createReadStream(Fixtures.BASE_256_SIZE),
      Tar.extract(),
      async source => {
        for await (const entry of source) {
          expect(entry.header).to.deep.equal({
            name: 'test.txt',
            mode: parseInt('644', 8),
            uid: 501,
            gid: 20,
            size: 12,
            mtime: new Date(1387580181000),
            type: 'file',
            linkname: undefined,
            uname: 'maf',
            gname: 'staff',
            devmajor: 0,
            devminor: 0
          })
          await toBuffer(entry.body)
        }
      }
    )

    expect(true).to.be.ok()
  })

  it('latin-1', async () => { // can unpack filenames encoded in latin-1
    let noEntries = false

    await pipe(
      Fs.createReadStream(Fixtures.LATIN1_TAR),
      // This is the older name for the "latin1" encoding in Node
      Tar.extract({ filenameEncoding: 'binary' }),
      async source => {
        for await (const entry of source) {
          expect(entry.header).to.deep.equal({
            name: 'En français, s\'il vous plaît?.txt',
            mode: parseInt('644', 8),
            uid: 0,
            gid: 0,
            size: 14,
            mtime: new Date(1495941034000),
            type: 'file',
            linkname: undefined,
            uname: 'root',
            gname: 'root',
            devmajor: 0,
            devminor: 0
          })

          const data = await toBuffer(entry.body)
          noEntries = true
          expect(uint8ArrayToString(data)).to.equal('Hello, world!\n')
        }
      }
    )

    expect(noEntries).to.be.true()
  })

  it('incomplete', async () => {
    try {
      await pipe(
        Fs.createReadStream(Fixtures.INCOMPLETE_TAR),
        Tar.extract(),
        async source => {
          for await (const _ of source) {} // eslint-disable-line no-unused-vars,no-empty,@typescript-eslint/no-unused-vars
        }
      )
    } catch (err) {
      return expect(err).to.have.property('code', 'ERR_UNDER_READ')
    }

    expect.fail()
  })

  it('gnu', async () => { // can correctly unpack gnu-tar format
    let noEntries = false

    await pipe(
      Fs.createReadStream(Fixtures.GNU_TAR),
      Tar.extract(),
      async source => {
        for await (const entry of source) {
          expect(entry.header).to.deep.equal({
            name: 'test.txt',
            mode: parseInt('644', 8),
            uid: 12345,
            gid: 67890,
            size: 14,
            mtime: new Date(1559239869000),
            type: 'file',
            linkname: undefined,
            uname: 'myuser',
            gname: 'mygroup',
            devmajor: 0,
            devminor: 0
          })

          const data = await toBuffer(entry.body)
          noEntries = true
          expect(uint8ArrayToString(data)).to.equal('Hello, world!\n')
        }
      }
    )

    expect(noEntries).to.be.true()
  })

  it('gnu-incremental', async () => {
    // can correctly unpack gnu-tar incremental format. In this situation,
    // the tarball will have additional ctime and atime values in the header,
    // and without awareness of the 'gnu' tar format, the atime (offset 345) is mistaken
    // for a directory prefix (also offset 345).
    let noEntries = false

    await pipe(
      Fs.createReadStream(Fixtures.GNU_INCREMENTAL_TAR),
      Tar.extract(),
      async source => {
        for await (const entry of source) {
          expect(entry.header).to.deep.equal({
            name: 'test.txt',
            mode: parseInt('644', 8),
            uid: 12345,
            gid: 67890,
            size: 14,
            mtime: new Date(1559239869000),
            type: 'file',
            linkname: undefined,
            uname: 'myuser',
            gname: 'mygroup',
            devmajor: 0,
            devminor: 0
          })

          const data = await toBuffer(entry.body)
          noEntries = true
          expect(uint8ArrayToString(data)).to.equal('Hello, world!\n')
        }
      }
    )

    expect(noEntries).to.be.true()
  })

  it('v7 unsupported', async () => { // correctly fails to parse v7 tarballs
    try {
      await pipe(
        Fs.createReadStream(Fixtures.V7_TAR),
        Tar.extract(),
        async source => {
          for await (const _ of source) { // eslint-disable-line no-unused-vars,@typescript-eslint/no-unused-vars
            expect.fail()
          }
        }
      )
    } catch (err) {
      return expect(err).to.be.ok()
    }

    expect.fail()
  })
})
