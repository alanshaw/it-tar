import type { Source } from 'it-stream-types'

export { extract } from './extract.js'
export { pack } from './pack.js'

export type EntryType = 'file' | 'link' | 'symlink' | 'character-device' | 'block-device' | 'directory' | 'fifo' | 'contiguous-file' | 'pax-header' | 'pax-global-header' | 'gnu-long-link-path' | 'gnu-long-path'

export interface TarEntryHeader {
  name: string
  uid: number
  gid: number
  size: number
  mode: number
  mtime: Date
  type?: EntryType
  typeflag?: number
  linkname?: string
  uname?: string
  gname?: string
  devmajor?: number
  devminor?: number
  pax?: Record<string, string>
}

export interface TarEntry {
  header: TarEntryHeader
  body: AsyncIterable<Uint8Array>
}

export interface TarImportCandidate {
  header: Partial<TarEntryHeader> & { name: string }
  body?: Source<Uint8Array> | Uint8Array
}

export interface ExtractOptions {
  highWaterMark: number
  filenameEncoding: string
}
