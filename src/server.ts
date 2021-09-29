import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';
import logging from './config/logging';
import config from './config/config';
import routes from './route/test';

const NAMESPACE = 'Server';
const router = express();

// Logging the request
router.use((req, res, next) => {
    logging.info(NAMESPACE, `[METHOD]: ${req.method} [URL]: ${req.url} [IP]: ${req.socket.remoteAddress}`);
    res.on('finish', () => {
        logging.info(NAMESPACE, `[METHOD]: ${req.method} [URL]: ${req.url} [IP]: ${req.socket.remoteAddress} [STATUS]: ${req.statusCode}`);
    });

    next();
});

// Parse the request
router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());

// Rules of the API
router.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method == 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }

    next();
});

// Routes
router.use('/webdav', routes);

// Error handling
router.use((req, res, next) => {
    const error = new Error('Not found');

    res.status(404).json({
        message: error.message
    });
});

const httpServer = http.createServer(router);
httpServer.listen(config.server.port, () => logging.info(NAMESPACE, `Server is running on ${config.server.hostname}:${config.server.port}`));
