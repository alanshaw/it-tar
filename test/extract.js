const test = require('tape')
const Tar = require('../')
const Fixtures = require('./fixtures')
const Fs = require('fs')
const pipe = require('it-pipe')
const BufferList = require('bl/BufferList')

const clamp = (index, len, defaultValue) => {
  if (typeof index !== 'number') return defaultValue
  index = ~~index // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

const concat = async source => {
  const bufs = new BufferList()
  for await (const chunk of source) {
    bufs.append(chunk)
  }
  return bufs
}

test('one-file', async t => {
  t.plan(3)
  let noEntries = false

  await pipe(
    Fs.createReadStream(Fixtures.ONE_FILE_TAR),
    Tar.extract(),
    async source => {
      for await (const entry of source) {
        t.deepEqual(entry.header, {
          name: 'test.txt',
          mode: parseInt('644', 8),
          uid: 501,
          gid: 20,
          size: 12,
          mtime: new Date(1387580181000),
          type: 'file',
          linkname: null,
          uname: 'maf',
          gname: 'staff',
          devmajor: 0,
          devminor: 0
        })

        const data = await concat(entry.body)
        noEntries = true
        t.same(data.toString(), 'hello world\n')
      }
    }
  )

  t.ok(noEntries)
})

test('chunked-one-file', async t => {
  t.plan(3)
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
        t.deepEqual(entry.header, {
          name: 'test.txt',
          mode: parseInt('644', 8),
          uid: 501,
          gid: 20,
          size: 12,
          mtime: new Date(1387580181000),
          type: 'file',
          linkname: null,
          uname: 'maf',
          gname: 'staff',
          devmajor: 0,
          devminor: 0
        })

        const data = await concat(entry.body)
        noEntries = true
        t.same(data.toString(), 'hello world\n')
      }
    }
  )

  t.ok(noEntries)
})

test('multi-file', async t => {
  t.plan(5)

  let noEntries = false

  await pipe(
    Fs.createReadStream(Fixtures.MULTI_FILE_TAR),
    Tar.extract(),
    async source => {
      let i = 0
      for await (const entry of source) {
        if (i === 0) {
          t.deepEqual(entry.header, {
            name: 'file-1.txt',
            mode: parseInt('644', 8),
            uid: 501,
            gid: 20,
            size: 12,
            mtime: new Date(1387580181000),
            type: 'file',
            linkname: null,
            uname: 'maf',
            gname: 'staff',
            devmajor: 0,
            devminor: 0
          })

          const data = await concat(entry.body)
          t.same(data.toString(), 'i am file-1\n')
        } else if (i === 1) {
          t.deepEqual(entry.header, {
            name: 'file-2.txt',
            mode: parseInt('644', 8),
            uid: 501,
            gid: 20,
            size: 12,
            mtime: new Date(1387580181000),
            type: 'file',
            linkname: null,
            uname: 'maf',
            gname: 'staff',
            devmajor: 0,
            devminor: 0
          })

          const data = await concat(entry.body)
          t.same(data.toString(), 'i am file-2\n')
        } else {
          throw new Error('expected only 2 entries')
        }
        noEntries = true
        i++
      }
    }
  )

  t.ok(noEntries)
})

test('chunked-multi-file', async t => {
  t.plan(5)

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
          t.deepEqual(entry.header, {
            name: 'file-1.txt',
            mode: parseInt('644', 8),
            uid: 501,
            gid: 20,
            size: 12,
            mtime: new Date(1387580181000),
            type: 'file',
            linkname: null,
            uname: 'maf',
            gname: 'staff',
            devmajor: 0,
            devminor: 0
          })

          const data = await concat(entry.body)
          t.same(data.toString(), 'i am file-1\n')
        } else if (i === 1) {
          t.deepEqual(entry.header, {
            name: 'file-2.txt',
            mode: parseInt('644', 8),
            uid: 501,
            gid: 20,
            size: 12,
            mtime: new Date(1387580181000),
            type: 'file',
            linkname: null,
            uname: 'maf',
            gname: 'staff',
            devmajor: 0,
            devminor: 0
          })

          const data = await concat(entry.body)
          t.same(data.toString(), 'i am file-2\n')
        } else {
          throw new Error('expected only 2 entries')
        }
        noEntries = true
        i++
      }
    }
  )

  t.ok(noEntries)
})

test('pax', async t => {
  t.plan(3)
  let noEntries = false

  await pipe(
    Fs.createReadStream(Fixtures.PAX_TAR),
    Tar.extract(),
    async source => {
      for await (const entry of source) {
        t.deepEqual(entry.header, {
          name: 'pax.txt',
          mode: parseInt('644', 8),
          uid: 501,
          gid: 20,
          size: 12,
          mtime: new Date(1387580181000),
          type: 'file',
          linkname: null,
          uname: 'maf',
          gname: 'staff',
          devmajor: 0,
          devminor: 0,
          pax: { path: 'pax.txt', special: 'sauce' }
        })

        const data = await concat(entry.body)
        noEntries = true
        t.same(data.toString(), 'hello world\n')
      }
    }
  )

  t.ok(noEntries)
})

test('types', async t => {
  t.plan(3)

  let noEntries = false

  await pipe(
    Fs.createReadStream(Fixtures.TYPES_TAR),
    Tar.extract(),
    async source => {
      let i = 0
      for await (const entry of source) {
        if (i === 0) {
          t.deepEqual(entry.header, {
            name: 'directory',
            mode: parseInt('755', 8),
            uid: 501,
            gid: 20,
            size: 0,
            mtime: new Date(1387580181000),
            type: 'directory',
            linkname: null,
            uname: 'maf',
            gname: 'staff',
            devmajor: 0,
            devminor: 0
          })

          for await (const _ of entry.body) { // eslint-disable-line no-unused-vars
            t.ok(false)
          }
        } else if (i === 1) {
          t.deepEqual(entry.header, {
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

          for await (const _ of entry.body) { // eslint-disable-line no-unused-vars
            t.ok(false)
          }
        } else {
          throw new Error('expected only 2 entries')
        }
        noEntries = true
        i++
      }
    }
  )

  t.ok(noEntries)
})

test('long-name', async t => {
  t.plan(3)
  let noEntries = false

  await pipe(
    Fs.createReadStream(Fixtures.LONG_NAME_TAR),
    Tar.extract(),
    async source => {
      for await (const entry of source) {
        t.deepEqual(entry.header, {
          name: 'my/file/is/longer/than/100/characters/and/should/use/the/prefix/header/foobarbaz/foobarbaz/foobarbaz/foobarbaz/foobarbaz/foobarbaz/filename.txt',
          mode: parseInt('644', 8),
          uid: 501,
          gid: 20,
          size: 16,
          mtime: new Date(1387580181000),
          type: 'file',
          linkname: null,
          uname: 'maf',
          gname: 'staff',
          devmajor: 0,
          devminor: 0
        })

        const data = await concat(entry.body)
        noEntries = true
        t.same(data.toString(), 'hello long name\n')
      }
    }
  )

  t.ok(noEntries)
})

test('unicode-bsd', async t => {
  t.plan(3)
  let noEntries = false

  await pipe(
    Fs.createReadStream(Fixtures.UNICODE_BSD_TAR),
    Tar.extract(),
    async source => {
      for await (const entry of source) {
        t.deepEqual(entry.header, {
          name: 'høllø.txt',
          mode: parseInt('644', 8),
          uid: 501,
          gid: 20,
          size: 4,
          mtime: new Date(1387588646000),
          pax: { 'SCHILY.dev': '16777217', 'SCHILY.ino': '3599143', 'SCHILY.nlink': '1', atime: '1387589077', ctime: '1387588646', path: 'høllø.txt' },
          type: 'file',
          linkname: null,
          uname: 'maf',
          gname: 'staff',
          devmajor: 0,
          devminor: 0
        })

        const data = await concat(entry.body)
        noEntries = true
        t.same(data.toString(), 'hej\n')
      }
    }
  )

  t.ok(noEntries)
})

test('unicode', async t => {
  t.plan(3)
  let noEntries = false

  await pipe(
    Fs.createReadStream(Fixtures.UNICODE_TAR),
    Tar.extract(),
    async source => {
      for await (const entry of source) {
        t.deepEqual(entry.header, {
          name: 'høstål.txt',
          mode: parseInt('644', 8),
          uid: 501,
          gid: 20,
          size: 8,
          mtime: new Date(1387580181000),
          pax: { path: 'høstål.txt' },
          type: 'file',
          linkname: null,
          uname: 'maf',
          gname: 'staff',
          devmajor: 0,
          devminor: 0
        })

        const data = await concat(entry.body)
        noEntries = true
        t.same(data.toString(), 'høllø\n')
      }
    }
  )

  t.ok(noEntries)
})

test('name-is-100', async t => {
  t.plan(3)
  let noEntries = false

  await pipe(
    Fs.createReadStream(Fixtures.NAME_IS_100_TAR),
    Tar.extract(),
    async source => {
      for await (const entry of source) {
        t.same(entry.header.name.length, 100)

        const data = await concat(entry.body)
        noEntries = true
        t.same(data.toString(), 'hello\n')
      }
    }
  )

  t.ok(noEntries)
})

test('invalid-file', async t => {
  t.plan(1)

  try {
    await pipe(
      Fs.createReadStream(Fixtures.INVALID_TGZ),
      Tar.extract(),
      async source => {
        for await (const _ of source) { // eslint-disable-line no-unused-vars
          t.ok(false)
        }
      }
    )
  } catch (err) {
    return t.ok(!!err)
  }

  t.ok(false)
})

test('space prefixed', async t => {
  t.plan(5)

  await pipe(
    Fs.createReadStream(Fixtures.SPACE_TAR_GZ),
    Tar.extract(),
    async source => {
      for await (const _ of source) { // eslint-disable-line no-unused-vars
        t.ok(true)
      }
    }
  )

  t.ok(true)
})

test('gnu long path', async t => {
  t.plan(2)

  await pipe(
    Fs.createReadStream(Fixtures.GNU_LONG_PATH),
    Tar.extract(),
    async source => {
      for await (const entry of source) {
        t.ok(entry.header.name.length > 100)
      }
    }
  )

  t.ok(true)
})

test('base 256 uid and gid', async t => {
  t.plan(3)

  await pipe(
    Fs.createReadStream(Fixtures.BASE_256_UID_GID),
    Tar.extract(),
    async source => {
      for await (const entry of source) {
        t.ok(entry.header.uid === 116435139)
        t.ok(entry.header.gid === 1876110778)
      }
    }
  )

  t.ok(true)
})

test('base 256 size', async t => {
  t.plan(2)

  await pipe(
    Fs.createReadStream(Fixtures.BASE_256_SIZE),
    Tar.extract(),
    async source => {
      for await (const entry of source) {
        t.deepEqual(entry.header, {
          name: 'test.txt',
          mode: parseInt('644', 8),
          uid: 501,
          gid: 20,
          size: 12,
          mtime: new Date(1387580181000),
          type: 'file',
          linkname: null,
          uname: 'maf',
          gname: 'staff',
          devmajor: 0,
          devminor: 0
        })
        await concat(entry.body)
      }
    }
  )

  t.ok(true)
})

test('latin-1', async t => { // can unpack filenames encoded in latin-1
  t.plan(3)
  let noEntries = false

  await pipe(
    Fs.createReadStream(Fixtures.LATIN1_TAR),
    // This is the older name for the "latin1" encoding in Node
    Tar.extract({ filenameEncoding: 'binary' }),
    async source => {
      for await (const entry of source) {
        t.deepEqual(entry.header, {
          name: 'En français, s\'il vous plaît?.txt',
          mode: parseInt('644', 8),
          uid: 0,
          gid: 0,
          size: 14,
          mtime: new Date(1495941034000),
          type: 'file',
          linkname: null,
          uname: 'root',
          gname: 'root',
          devmajor: 0,
          devminor: 0
        })

        const data = await concat(entry.body)
        noEntries = true
        t.same(data.toString(), 'Hello, world!\n')
      }
    }
  )

  t.ok(noEntries)
})

test('incomplete', async t => {
  t.plan(1)

  try {
    await pipe(
      Fs.createReadStream(Fixtures.INCOMPLETE_TAR),
      Tar.extract(),
      async source => {
        for await (const _ of source) {} // eslint-disable-line no-unused-vars
      }
    )
  } catch (err) {
    return t.equal(err.code, 'ERR_UNDER_READ')
  }

  t.ok(false)
})

test('gnu', async t => { // can correctly unpack gnu-tar format
  t.plan(3)
  let noEntries = false

  await pipe(
    Fs.createReadStream(Fixtures.GNU_TAR),
    Tar.extract(),
    async source => {
      for await (const entry of source) {
        t.deepEqual(entry.header, {
          name: 'test.txt',
          mode: parseInt('644', 8),
          uid: 12345,
          gid: 67890,
          size: 14,
          mtime: new Date(1559239869000),
          type: 'file',
          linkname: null,
          uname: 'myuser',
          gname: 'mygroup',
          devmajor: 0,
          devminor: 0
        })

        const data = await concat(entry.body)
        noEntries = true
        t.same(data.toString(), 'Hello, world!\n')
      }
    }
  )

  t.ok(noEntries)
})

test('gnu-incremental', async t => {
  // can correctly unpack gnu-tar incremental format. In this situation,
  // the tarball will have additional ctime and atime values in the header,
  // and without awareness of the 'gnu' tar format, the atime (offset 345) is mistaken
  // for a directory prefix (also offset 345).
  t.plan(3)
  let noEntries = false

  await pipe(
    Fs.createReadStream(Fixtures.GNU_INCREMENTAL_TAR),
    Tar.extract(),
    async source => {
      for await (const entry of source) {
        t.deepEqual(entry.header, {
          name: 'test.txt',
          mode: parseInt('644', 8),
          uid: 12345,
          gid: 67890,
          size: 14,
          mtime: new Date(1559239869000),
          type: 'file',
          linkname: null,
          uname: 'myuser',
          gname: 'mygroup',
          devmajor: 0,
          devminor: 0
        })

        const data = await concat(entry.body)
        noEntries = true
        t.same(data.toString(), 'Hello, world!\n')
      }
    }
  )

  t.ok(noEntries)
})

test('v7 unsupported', async t => { // correctly fails to parse v7 tarballs
  t.plan(1)

  try {
    await pipe(
      Fs.createReadStream(Fixtures.V7_TAR),
      Tar.extract(),
      async source => {
        for await (const _ of source) { // eslint-disable-line no-unused-vars
          t.ok(false)
        }
      }
    )
  } catch (err) {
    return t.ok(!!err)
  }

  t.ok(false)
})
