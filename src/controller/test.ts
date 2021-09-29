import { NextFunction, Request, Response } from 'express';
import { createClient } from 'webdav';
import logging from '../config/logging';
import { IFile } from '../model/file';

const NAMESPACE = 'Test Controller';

const client = createClient('http://localhost:8085/seafdav/', {
    username: 'me@exampl.com',
    password: 'asecret'
});

// const directoryItems = await client.getDirectoryContents('/');

const serverHealthCheck = async (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, 'Test health check route is created');
    await client
        .getDirectoryContents('/', { deep: true })
        .then((contents) => {
            logging.info(NAMESPACE, 'Loaded files successfully');
            const data = JSON.parse(JSON.stringify(contents, undefined, 4));
            for (let i = 0; i < data.length; i++) {
                const file: IFile = {
                    filename: data[i].filename,
                    basename: data[i].basename,
                    lastmod: data[i].lastmod,
                    size: data[i].size,
                    type: data[i].type,
                    etag: data[i].etag,
                    mime: data[i].mime
                };
                // fileDAO.insert(file, (err: Error, id: number) => {
                //     if (err) {
                //         logging.error(NAMESPACE, err.message, err);
                //     } else {
                //         logging.info(NAMESPACE, 'Inserted file to database successfully', data);
                //     }
                // });
            }
            return res.status(200).json({ files: data });
        })
        .catch((err) => {
            logging.error(NAMESPACE, err.message, err);
            return res.status(500).json({ message: err.message });
        });
};

const serverHealthCheck1 = async (req: Request, res: Response, next: NextFunction) => {
    logging.info(NAMESPACE, 'Test health check route is created');
    await client
        .getFileContents('/Photos/Steps.jpg')
        .then((contents) => {
            logging.info(NAMESPACE, 'Loaded files successfully', contents);
            // const data = JSON.parse(JSON.stringify(contents, undefined, 4));
            // for (let i = 0; i < data.length; i++) {
            //     const file: IFile = {
            //         filename: data[i].filename,
            //         basename: data[i].basename,
            //         lastmod: data[i].lastmod,
            //         size: data[i].size,
            //         type: data[i].type,
            //         etag: data[i].etag,
            //         mime: data[i].mime
            //     };
            //     fileDAO.insert(file, (err: Error, id: number) => {
            //         if (err) {
            //             logging.error(NAMESPACE, err.message, err);
            //         } else {
            //             logging.info(NAMESPACE, 'Inserted file to database successfully', data);
            //         }
            //     });
            // }
            return res.status(200).json({ file: contents });
        })
        .catch((err) => {
            logging.error(NAMESPACE, err.message, err);
            return res.status(500).json({ message: err.message });
        });
};

export default { serverHealthCheck, serverHealthCheck1 };
