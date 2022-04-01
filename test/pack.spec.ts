import { expect } from 'aegir/utils/chai.js'
import * as Tar from '../src/index.js'
import * as Fixtures from './fixtures/index.js'
import Fs from 'fs'
import { pipe } from 'it-pipe'
import toBuffer from 'it-to-buffer'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'

describe('pack', () => {
  it('one-file', async () => {
    const entries: Tar.TarImportCandidate[] = [{
      header: {
        name: 'test.txt',
        mtime: new Date(1387580181000),
        mode: parseInt('644', 8),
        uname: 'maf',
        gname: 'staff',
        uid: 501,
        gid: 20
      },
      body: uint8ArrayFromString('hello world\n')
    }]

    const data = await pipe(
      entries,
      Tar.pack(),
      async (source) => await toBuffer(source)
    )

    expect(data.length & 511).to.equal(0)
    expect(data).to.equalBytes(Fs.readFileSync(Fixtures.ONE_FILE_TAR))
  })

  it('multi-file', async () => {
    const entries: Tar.TarImportCandidate[] = [{
      header: {
        name: 'file-1.txt',
        mtime: new Date(1387580181000),
        mode: parseInt('644', 8),
        uname: 'maf',
        gname: 'staff',
        uid: 501,
        gid: 20
      },
      body: uint8ArrayFromString('i am file-1\n')
    }, {
      header: {
        name: 'file-2.txt',
        mtime: new Date(1387580181000),
        mode: parseInt('644', 8),
        size: 12,
        uname: 'maf',
        gname: 'staff',
        uid: 501,
        gid: 20
      },
      body: uint8ArrayFromString('i am file-2\n')
    }]

    const data = await pipe(
      entries,
      Tar.pack(),
      async (source) => await toBuffer(source)
    )

    expect(data.length & 511).to.equal(0)
    expect(data).to.equalBytes(Fs.readFileSync(Fixtures.MULTI_FILE_TAR))
  })

  it('pax', async () => {
    const entries: Tar.TarImportCandidate[] = [{
      header: {
        name: 'pax.txt',
        mtime: new Date(1387580181000),
        mode: parseInt('644', 8),
        uname: 'maf',
        gname: 'staff',
        uid: 501,
        gid: 20,
        pax: { special: 'sauce' }
      },
      body: uint8ArrayFromString('hello world\n')
    }]

    const data = await pipe(
      entries,
      Tar.pack(),
      async (source) => await toBuffer(source)
    )

    expect(data.length & 511).to.equal(0)
    expect(data).to.equalBytes(Fs.readFileSync(Fixtures.PAX_TAR))
  })

  it('types', async () => {
    const entries: Tar.TarImportCandidate[] = [{
      header: {
        name: 'directory',
        mtime: new Date(1387580181000),
        type: 'directory',
        mode: parseInt('755', 8),
        uname: 'maf',
        gname: 'staff',
        uid: 501,
        gid: 20
      }
    }, {
      header: {
        name: 'directory-link',
        mtime: new Date(1387580181000),
        type: 'symlink',
        linkname: 'directory',
        mode: parseInt('755', 8),
        uname: 'maf',
        gname: 'staff',
        uid: 501,
        gid: 20,
        size: 9 // Should convert to zero
      }
    }]

    const data = await pipe(
      entries,
      Tar.pack(),
      async (source) => await toBuffer(source)
    )

    expect(data.length & 511).to.equal(0)
    expect(data).to.equalBytes(Fs.readFileSync(Fixtures.TYPES_TAR))
  })

  it('long-name', async () => {
    const entries: Tar.TarImportCandidate[] = [{
      header: {
        name: 'my/file/is/longer/than/100/characters/and/should/use/the/prefix/header/foobarbaz/foobarbaz/foobarbaz/foobarbaz/foobarbaz/foobarbaz/filename.txt',
        mtime: new Date(1387580181000),
        type: 'file',
        mode: parseInt('644', 8),
        uname: 'maf',
        gname: 'staff',
        uid: 501,
        gid: 20
      },
      body: uint8ArrayFromString('hello long name\n')
    }]

    const data = await pipe(
      entries,
      Tar.pack(),
      async (source) => await toBuffer(source)
    )

    expect(data.length & 511).to.equal(0)
    expect(data).to.equalBytes(Fs.readFileSync(Fixtures.LONG_NAME_TAR))
  })

  it('large-uid-gid', async () => {
    const entries: Tar.TarImportCandidate[] = [{
      header: {
        name: 'test.txt',
        mtime: new Date(1387580181000),
        mode: parseInt('644', 8),
        uname: 'maf',
        gname: 'staff',
        uid: 1000000001,
        gid: 1000000002
      },
      body: uint8ArrayFromString('hello world\n')
    }]

    const data = await pipe(
      entries,
      Tar.pack(),
      async (source) => await toBuffer(source)
    )

    expect(data.length & 511).to.equal(0)
    expect(data).to.equalBytes(Fs.readFileSync(Fixtures.LARGE_UID_GID))
  })

  it('unicode', async () => {
    const entries: Tar.TarImportCandidate[] = [{
      header: {
        name: 'høstål.txt',
        mtime: new Date(1387580181000),
        type: 'file',
        mode: parseInt('644', 8),
        uname: 'maf',
        gname: 'staff',
        uid: 501,
        gid: 20
      },
      body: uint8ArrayFromString('høllø\n')
    }]

    const data = await pipe(
      entries,
      Tar.pack(),
      async (source) => await toBuffer(source)
    )

    expect(data.length & 511).to.equal(0)
    expect(data).to.equalBytes(Fs.readFileSync(Fixtures.UNICODE_TAR))
  })
})
