export interface IFile {
    filename: string;
    basename: string;
    lastmod: string;
    size: number;
    type: string;
    etag: string;
    mime: string;
}

// export class File implements IFile {
//     constructor(filename: string, basename: string, lastmod: string, size: number, type: string, etag: string, mime: string) {
//         this.filename = filename;
//         this.basename = basename;
//         this.lastmod = lastmod;
//         this.size = size;
//         this.type = type;
//         this.etag = etag;
//         this.mime = mime;
//     }
// }
