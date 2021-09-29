import { NextFunction, Request, Response } from 'express';
import * as fileDAO from './fileDAO';
import logging from '../config/logging';

const NAMESPACE = 'WebDAV-File-Controller';

export const getDirectoryContents = async (req: Request, res: Response) => {
    await fileDAO
        .getDirectoryContents()
        .then((result) => {
            logging.info(NAMESPACE, `Loaded directory contents successfully`, result);
            return res.status(200).json(JSON.parse(JSON.stringify(result, undefined, 4)));
        })
        .catch((err) => {
            return res.status(500).json({ errorMessage: err.message });
        });
};

export const getFileContents = async (req: Request, res: Response) => {
    console.log(req.query.filePath);
    
    await fileDAO
        .getFileContents(req.query.filepath)
        .then((result) => {
            console.log(result);
            
            logging.info(NAMESPACE, `Loaded file contents of file: ${req.query.filepath} successfully`, result);
            return res.status(200).json({ content: result });
        })
        .catch((err) => {
            return res.status(500).json({ errorMessage: err.message });
        });
};
