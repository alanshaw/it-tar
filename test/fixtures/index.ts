import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const ONE_FILE_TAR = path.join(dirname, 'one-file.tar')
export const MULTI_FILE_TAR = path.join(dirname, 'multi-file.tar')
export const PAX_TAR = path.join(dirname, 'pax.tar')
export const TYPES_TAR = path.join(dirname, 'types.tar')
export const LONG_NAME_TAR = path.join(dirname, 'long-name.tar')
export const UNICODE_BSD_TAR = path.join(dirname, 'unicode-bsd.tar')
export const UNICODE_TAR = path.join(dirname, 'unicode.tar')
export const NAME_IS_100_TAR = path.join(dirname, 'name-is-100.tar')
export const INVALID_TGZ = path.join(dirname, 'invalid.tgz')
export const SPACE_TAR_GZ = path.join(dirname, 'space.tar')
export const GNU_LONG_PATH = path.join(dirname, 'gnu-long-path.tar')
export const BASE_256_UID_GID = path.join(dirname, 'base-256-uid-gid.tar')
export const LARGE_UID_GID = path.join(dirname, 'large-uid-gid.tar')
export const BASE_256_SIZE = path.join(dirname, 'base-256-size.tar')
export const HUGE = path.join(dirname, 'huge.tar.gz')
export const LATIN1_TAR = path.join(dirname, 'latin1.tar')
export const INCOMPLETE_TAR = path.join(dirname, 'incomplete.tar')
// Created using gnu tar: tar cf gnu-incremental.tar --format gnu --owner=myuser:12345 --group=mygroup:67890 test.txt
export const GNU_TAR = path.join(dirname, 'gnu.tar')
// Created using gnu tar: tar cf gnu-incremental.tar -G --format gnu --owner=myuser:12345 --group=mygroup:67890 test.txt
export const GNU_INCREMENTAL_TAR = path.join(dirname, 'gnu-incremental.tar')
// Created using gnu tar: tar cf v7.tar --format v7 test.txt
export const V7_TAR = path.join(dirname, 'v7.tar')
