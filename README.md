# it-tar

[![codecov](https://img.shields.io/codecov/c/github/alanshaw/it-tar.svg?style=flat-square)](https://codecov.io/gh/alanshaw/it-tar)
[![CI](https://img.shields.io/github/actions/workflow/status/alanshaw/it-tar/js-test-and-release.yml?branch=master\&style=flat-square)](https://github.com/alanshaw/it-tar/actions/workflows/js-test-and-release.yml?query=branch%3Amaster)

> it-tar is a streaming tar parser and generator. It operates purely using async iterables which means you can easily extract/parse tarballs without ever hitting the file system.

# About

<!--

!IMPORTANT!

Everything in this README between "# About" and "# Install" is automatically
generated and will be overwritten the next time the doc generator is run.

To make changes to this section, please update the @packageDocumentation section
of src/index.js or src/index.ts

To experiment with formatting, please run "npm run docs" from the root of this
repo and examine the changes made.

-->

`it-tar` [packs](#packing) and [extracts](#extracts) tarballs.

It implements USTAR with additional support for pax extended headers. It should be compatible with all popular tar distributions out there (gnutar, bsdtar etc)

## Example - Packing

To create a pack stream use `tar.pack()` and pipe entries to it.

```TypeScript
import fs from 'node:fs'
import Tar from 'it-tar'
import { pipe } from 'it-pipe'
// @ts-expect-error no types
import { sink } from 'stream-to-it'

await pipe(
  [
    // add a file called my-test.txt with the content "Hello World!"
    {
      header: { name: 'my-test.txt' },
      body: 'Hello World!'
    },
    // add a file called my-stream-test.txt from a stream
    {
      header: { name: 'my-stream-test.txt', size: 11 },
      body: fs.createReadStream('./my-stream-test.txt')
    }
  ],
  Tar.pack(),
  // pipe the pack stream somewhere
  sink(process.stdout)
)
```

## Example - Extracting

To extract a stream use `tar.extract()` and pipe a [source iterable](https://gist.github.com/alanshaw/591dc7dd54e4f99338a347ef568d6ee9#source-it) to it.

```TypeScript
import Tar from 'it-tar'
import { pipe } from 'it-pipe'

await pipe(
  [Uint8Array.from([0, 1, 2, 3, 4])], // An async iterable (for example a Node.js readable stream)
  Tar.extract(),
  async source => {
    for await (const entry of source) {
      // entry.header is the tar header (see below)
      // entry.body is the content body (might be an empty async iterable)
      for await (const data of entry.body) {
        // do something with the data
      }
    }
    // all entries read
  }
)
```

The tar archive is streamed sequentially, meaning you **must** drain each entry's body as you get them or else the main extract stream will receive backpressure and stop reading.

Note that the body stream yields [`Uint8ArrayList`](https://npm.im/uint8arraylist) objects **not** `Uint8Arrays`s.

## Example - Modifying existing tarballs

Using tar-stream it is easy to rewrite paths / change modes etc in an existing tarball.

```TypeScript
import Tar from 'it-tar'
import { pipe } from 'it-pipe'
// @ts-expect-error no types
import { sink } from 'stream-to-it'
import fs from 'node:fs'
import path from 'node:path'

await pipe(
  fs.createReadStream('./old-tarball.tar'),
  Tar.extract(),
  async function * (source) {
    for await (const entry of source) {
      // let's prefix all names with 'tmp'
      entry.header.name = path.join('tmp', entry.header.name)
      // write the new entry to the pack stream
      yield entry
    }
  },
  Tar.pack(),
  sink(fs.createWriteStream('./new-tarball.tar'))
)
```

#### Headers

The header object using in `entry` should contain the following properties.
Most of these values can be found by stat'ing a file.

```js
{
  name: 'path/to/this/entry.txt',
  size: 1314,        // entry size. defaults to 0
  mode: 0644,        // entry mode. defaults to to 0755 for dirs and 0644 otherwise
  mtime: new Date(), // last modified date for entry. defaults to now.
  type: 'file',      // type of entry. defaults to file. can be:
                     // file | link | symlink | directory | block-device
                     // character-device | fifo | contiguous-file
  linkname: 'path',  // linked file name
  uid: 0,            // uid of entry owner. defaults to 0
  gid: 0,            // gid of entry owner. defaults to 0
  uname: 'maf',      // uname of entry owner. defaults to null
  gname: 'staff',    // gname of entry owner. defaults to null
  devmajor: 0,       // device major version. defaults to 0
  devminor: 0        // device minor version. defaults to 0
}
```

## Related

- [`it-pipe`](https://www.npmjs.com/package/it-pipe) Utility to "pipe" async iterables together
- [`it-reader`](https://www.npmjs.com/package/it-reader) Read an exact number of bytes from a binary (async) iterable
- [`stream-to-it`](https://www.npmjs.com/package/stream-to-it) Convert Node.js streams to streaming iterables

# Install

```console
$ npm i it-tar
```

# API Docs

- <https://alanshaw.github.io/it-tar>

# License

Licensed under either of

- Apache 2.0, ([LICENSE-APACHE](LICENSE-APACHE) / <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT ([LICENSE-MIT](LICENSE-MIT) / <http://opensource.org/licenses/MIT>)

# Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the work by you, as defined in the Apache-2.0 license, shall be dual licensed as above, without any additional terms or conditions.
