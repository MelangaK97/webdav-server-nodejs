import express, { Request, Response } from 'express';
import { IFile } from '../model/file';
import controller from '../controller/test';
import * as fileController from '../webdav/fileController';

const router = express.Router();

// router.get('/ping', controller.serverHealthCheck);
router.get('/', fileController.getDirectoryContents);
router.get('/download', fileController.getFileContents);
// router.get('/', async (req: Request, res: Response) => {
//     orderModel.findAll((err: Error, orders: IFile[]) => {
//         if (err) {
//             return res.status(500).json({ errorMessage: err.message });
//         }
//         res.status(200).json({ data: orders });
//     });
// });

export = router;
