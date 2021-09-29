import dotenv from 'dotenv';

dotenv.config();

const HOSTNAME = process.env.HOSTNAME || 'localhost';
const PORT = process.env.PORT || 3000;
const SERVER = { hostname: HOSTNAME, port: PORT };
const config = { server: SERVER };

export default config;
