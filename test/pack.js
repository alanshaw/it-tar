const test = require('tape')
const Tar = require('../')
const fixtures = require('./fixtures')
const Fs = require('fs')
const pipe = require('it-pipe')
const concat = require('it-concat')

test('one-file', async t => {
  t.plan(2)

  const entries = [{
    header: {
      name: 'test.txt',
      mtime: new Date(1387580181000),
      mode: parseInt('644', 8),
      uname: 'maf',
      gname: 'staff',
      uid: 501,
      gid: 20
    },
    body: 'hello world\n'
  }]

  const data = await pipe(
    entries,
    Tar.pack(),
    concat
  )

  t.same(data.length & 511, 0)
  t.deepEqual(data.slice(), Fs.readFileSync(fixtures.ONE_FILE_TAR))
})

test('multi-file', async t => {
  t.plan(2)

  const entries = [{
    header: {
      name: 'file-1.txt',
      mtime: new Date(1387580181000),
      mode: parseInt('644', 8),
      uname: 'maf',
      gname: 'staff',
      uid: 501,
      gid: 20
    },
    body: 'i am file-1\n'
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
    body: 'i am file-2\n'
  }]

  const data = await pipe(
    entries,
    Tar.pack(),
    concat
  )

  t.same(data.length & 511, 0)
  t.deepEqual(data.slice(), Fs.readFileSync(fixtures.MULTI_FILE_TAR))
})

test('pax', async t => {
  t.plan(2)

  const entries = [{
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
    body: 'hello world\n'
  }]

  const data = await pipe(
    entries,
    Tar.pack(),
    concat
  )

  t.same(data.length & 511, 0)
  t.deepEqual(data.slice(), Fs.readFileSync(fixtures.PAX_TAR))
})

test('types', async t => {
  t.plan(2)

  const entries = [{
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
    concat
  )

  t.same(data.length & 511, 0)
  t.deepEqual(data.slice(), Fs.readFileSync(fixtures.TYPES_TAR))
})

test('long-name', async t => {
  t.plan(2)

  const entries = [{
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
    body: 'hello long name\n'
  }]

  const data = await pipe(
    entries,
    Tar.pack(),
    concat
  )

  t.same(data.length & 511, 0)
  t.deepEqual(data.slice(), Fs.readFileSync(fixtures.LONG_NAME_TAR))
})

test('large-uid-gid', async t => {
  t.plan(2)

  const entries = [{
    header: {
      name: 'test.txt',
      mtime: new Date(1387580181000),
      mode: parseInt('644', 8),
      uname: 'maf',
      gname: 'staff',
      uid: 1000000001,
      gid: 1000000002
    },
    body: 'hello world\n'
  }]

  const data = await pipe(
    entries,
    Tar.pack(),
    concat
  )

  t.same(data.length & 511, 0)
  t.deepEqual(data.slice(), Fs.readFileSync(fixtures.LARGE_UID_GID))
})

test('unicode', async t => {
  t.plan(2)

  const entries = [{
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
    body: 'høllø\n'
  }]

  const data = await pipe(
    entries,
    Tar.pack(),
    concat
  )

  t.same(data.length & 511, 0)
  t.deepEqual(data.slice(), Fs.readFileSync(fixtures.UNICODE_TAR))
})
