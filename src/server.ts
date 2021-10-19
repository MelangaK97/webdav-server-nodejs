// TypeScript
import express from 'express';
import bodyParser from 'body-parser';
import mountSeadrive from './seafile_utils/mountSeadrive';
import createConfig from './seafile_utils/createConfig';
import getToken from './seafile_utils/getToken';
import fs from 'fs';
import Redis from 'ioredis';
import JSONCache from 'redis-json';
import * as crypto from 'crypto';
import {User} from './user';

const host = 'http://localhost:7080';
const baseDir = '/home/melangakasun/Desktop/FYP/test';
const realm = 'Seadrive';

// database
const users =  new Set<User>();
 
const app = express();
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

const redis1 = new Redis();
const jsonCache = new JSONCache(redis1);

app.post('/login', async function (req, res) {
    let username = req.body.username;
    let password = req.body.password;
    console.log(`Login request... Username: ${username}, Password: ${password}`);
    
    // check if user already registered
    getToken(host, username, password, async (error: any, stdout: any, stderr: any) => {
        if (error) {
            console.error(`An error occurred... Username: ${username}, ${error}`);
            res.statusCode = 500;
        }
        if (stdout) {
            let opt: any = JSON.parse(stdout);
            if (opt.non_field_errors) {
                console.error(`An error occurred... Username: ${username}, Error: ${opt.non_field_errors}`);
                res.statusCode = 401;
            } else if (opt.token) {
                console.log(`Successfully logged in... Username: ${username}, Token: ${opt.token}`);
                let userDir: string = `${baseDir}/${username}/data`;
                try {
                    if (!fs.existsSync(userDir)) {
                        // creating a directory for the user
                        console.log(`Creating directory... ${userDir}`);
                        fs.mkdirSync(userDir, { recursive: true });
                    }
                    if (!fs.existsSync(`${baseDir}/${username}/seadrive.conf`)) {
                        // creating the seadrive.conf file
                        console.log(`Creating the configuration file...`);
                        createConfig(`${baseDir}/${username}/seadrive.conf`, host, username, opt.token, username);
                    }
                    // Mounting the directory
                    console.log(`Mounting with the Seadrive directory...`);
                    mountSeadrive(`${baseDir}/${username}/seadrive.conf`, '/home/melangakasun/.seadrive/data', userDir, 
                        async () => {
                            // Creating a unique salt for a particular user 
                            let salt: string = crypto.randomBytes(16).toString('hex'); 
                            // Hashing user's salt and password with 1000 iterations, 
                            let hash: string = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');

                            // Saving user data in Redis
                            console.log(`Adding User: ${username} to the database...`);
                            let user: User = new User(username, salt, hash, '', true);
                            users.add(user);
                            await jsonCache.set('users', users);
                            console.log(`Successfully logged in...`);
                            res.statusCode = 200;
                        }, 
                        `${baseDir}/${username}/seadrive.log`, true);
                } catch(error) {
                    console.error(`An error occurred... ${error}`);
                    res.statusCode = 500;
                }
            }
        }
        res.send();
    });
});

app.listen(1902);
