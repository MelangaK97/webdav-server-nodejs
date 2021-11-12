// TypeScript
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import mountSeadrive from './seafile_utils/mountSeadrive';
import createConfig from './seafile_utils/createConfig';
import getToken from './seafile_utils/getToken';
import path from 'path';
import fs from 'fs';
import * as crypto from 'crypto';
import bcrypt from 'bcrypt';
import cron from 'node-cron';
import unmountDirectory from './system_utils/unmountDirectory';
import { saveUser, getAllUsers, getUser, deleteUser } from './system_utils/redis';
import deleteDirectory from './system_utils/deleteDirectory';

declare module 'express-session' {
    export interface SessionData {
        user: { [key: string]: any };
    }
}

const host = 'http://localhost:7080';
const data_directory = '/home/melangakasun/.seadrive/data';
const base_directory = '/home/melangakasun/Desktop/FYP/test';
const realm = 'Seadrive';
const server_port = 1901;

const app = express();
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(session({
    name: 'username',
    cookie: {
        maxAge: 60 * 60
    },
    secret: 'asecret',
    resave: true,
    saveUninitialized: true
}));

app.post('/register', (req, res) => {
    let username: string = req.body.username;
    let password: string = req.body.password;
    console.log(`Register request... Username: ${username}`);

    // token will generate if the user is registered with server
    getToken(host, username, password, (error: any, stdout: any, stderr: any) => {
        if (error) {
            console.error(error);
            res.status(500).send({ error });
        }
        if (stdout) {
            let opt: any = JSON.parse(stdout);
            if (opt.non_field_errors) {
                console.error(opt.non_field_errors);
                res.status(401).send({ error: opt.non_field_errors });
            } else if (opt.token) {
                console.log(`Successfully logged in... Username: ${username}, Token: ${opt.token}`);
                let user_directory: string = `${base_directory}/${username}/data`;
                try {
                    if (!fs.existsSync(user_directory)) {
                        // creating a directory for the new/deleted user
                        console.log(`Creating directory... ${user_directory}`);
                        fs.mkdirSync(user_directory, { recursive: true });
                    }
                    if (!fs.existsSync(`${base_directory}/${username}/seadrive.conf`)) {
                        // creating the seadrive.conf file for the new user
                        console.log(`Creating the configuration file...`);
                        createConfig(`${base_directory}/${username}/seadrive.conf`, host, username, opt.token, username);
                    } else {
                        fs.readFile(`${base_directory}/${username}/seadrive.conf`, 'utf8', (error, data) => {
                            if (error) {
                                console.error(error);
                                res.status(500).send({ error: 'Unable to access the configuration file' });
                            } else if (data) {
                                try {
                                    var old_token: string = data.split('\n')[3].substring(8);
                                    if (old_token !== opt.token) {
                                        console.log(`Updating the configuration file...`);
                                        updateConfigurationFile(`${base_directory}/${username}/seadrive.conf`, data, old_token, opt.token);
                                    }
                                } catch (error) {
                                    console.error(error);
                                    res.status(500).send({ error });
                                }
                            }
                        });
                    }
                    // Mounting the directory
                    console.log(`Mounting with the Seadrive directory...`);
                    mountSeadrive(`${base_directory}/${username}/seadrive.conf`, data_directory, user_directory, () => {
                        // Creating a unique salt for a particular user 
                        let salt: string = crypto.randomBytes(16).toString('hex');
                        // Hashing user's salt and password with 1000 iterations, 
                        let hash: string = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
                    },
                        `${base_directory}/${username}/seadrive.log`, true);

                    // await jsonCache.set('users', users);
                    saveUserInRedis(username, password, user_directory);
                    console.log(`Successfully logged in...`);
                    req.session.user = { name: username, token: opt.token };
                    console.log(req.session.user);

                    res.status(200).send({ token: opt.token });
                } catch (error) {
                    console.error(error);
                    res.status(500).send({ error });
                }
            }
        }
        res.status(500).send();
    });
});

app.post('/login', async (req, res) => {
    let username: string = req.body.username;
    let password: string = req.body.password;
    console.log(`Login request... Username: ${username}`);

    // check if user already registered
    getToken(host, username, password, async (error: any, stdout: any, stderr: any) => {
        if (error) {
            console.error(error);
            res.status(500).send({ error });
        }
        if (stdout) {
            let opt: any = JSON.parse(stdout);
            if (opt.non_field_errors) {
                console.error(`An error occurred... Username: ${username}, Error: ${opt.non_field_errors}`);
                console.error(error);
                res.status(401).send({ error: opt.non_field_errors });
            } else if (opt.token) {
                console.log(`Successfully logged in... Username: ${username}, Token: ${opt.token}`);
                req.session.user = { name: username, token: opt.token };
                res.status(200).send({ token: opt.token });
            }
        }
        res.status(500).send();
    });
});

app.get('/data', async (req, res) => {
    const username = req.query?.username;
    const location = req.query?.location;

    if (username) {
        let user_directory: string = `${base_directory}/${username}/data`;
        if (location) {
            user_directory += `/${location}`;
        }
        fs.readdir(user_directory, (error, results) => {
            if (error) {
                res.status(500).send({ error });
            } else if (results) {
                const directories: any = [];
                const files: any = [];
                results.forEach(result => {
                    let name = path.join(user_directory, result);
                    let size = convertBytes(fs.statSync(name).size);
                    if (fs.lstatSync(name).isDirectory()) {
                        directories.push({ name: result, size });
                    } else {
                        files.push({ name: result, size });
                    }
                });
                res.status(200).send({ data: { directories, files } });
            }
        });
    } else {
        res.status(500).send({ error: 'Username is not provided' });
    }
});

app.get('/download', async (req, res) => {
    const username = req.query?.username;
    const filename = req.query?.filename;

    if (username && filename) {
        let file: string = `${base_directory}/${username}/data${filename}`;
        console.log(file);

        if (fs.existsSync(file)) {
            console.log(`Downloading file: ${filename}`);
            fs.readFile(file, 'utf8', (error, data) => {
                if (error) {
                    console.error(error);
                    res.status(500).send({ error });
                } else if (data) {
                    console.log(`Successfully downloaded file: ${filename}`);
                    res.status(200).send({ download: true });
                }
            });
        } else {
            res.status(404).send({ error: 'File not exists' });
        }
    } else {
        res.status(500).send({ error: 'Username/Filename is not provided' });
    }
});

app.get('/schedule', async (req, res) => {
    const username = req.query?.username;
    const filename = req.query?.filename;
    const day = req.query?.day;
    const time = req.query?.time;

    if (username && filename && day && time) {
        try {
            let file: string = `${base_directory}/${username}/data${filename}`;
            const [hour, minute] = JSON.stringify(time).slice(1, -1).split(':');
            const date = new Date(JSON.stringify(day));
            if (fs.existsSync(file)) {
                cron.schedule(`${minute} ${hour} ${date.getDate()} ${date.getMonth() + 1} ${date.getDay()}`, () => {
                    console.log(`Downloading file: ${filename}`);
                    fs.readFile(file, 'utf8', (error, data) => {
                        if (error) {
                            console.error(error);
                            res.status(500).send({ error });
                        } else if (data) {
                            console.log(`Successfully downloaded file: ${filename}`);
                            res.status(200).send({ download: true });
                        }
                    });
                });
            } else {
                res.status(404).send({ error: 'File not exists' });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send(error);
        }
    } else {
        res.status(500).send({ error: 'Username/Filename/Start Time is not provided' });
    }
});

const convertBytes = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    if (bytes == 0) {
        return "n/a";
    }

    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    if (i == 0) {
        return bytes + " " + sizes[i];
    }
    return (bytes / Math.pow(1024, i)).toFixed(1) + " " + sizes[i];
}

app.delete('/remove', async (req, res) => {
    let username: string = req.body.username;
    console.log(`Logout request... Username: ${username}`);
    let response: any;

    // check if user already registered
    getUser(username, (error: Error | null, user_data: string) => {
        if (error) {
            console.error(error);
            response = error;
            res.statusCode = 500;
        } else if (user_data) {
            let user: any = JSON.parse(user_data);
            deleteUser(username, (error: Error | null, reply: string) => {
                if (error) {
                    console.error(error);
                    response = error;
                    res.statusCode = 500;
                } else {
                    unmountDirectory(user.Scope);
                    deleteDirectory(user.Scope);
                    console.log(`Successfully removed the user... Username: ${username}`);
                    response = 'Successfully removed the user';
                    res.statusCode = 200;
                }
            });
        } else {
            console.error(`User: ${username} is not available...`);
            response = 'User not found';
            res.statusCode = 404;
        }
    });
    res.send(response);
});

app.listen(server_port, () => mountDirectoriesForSavedUsers());

async function mountDirectoriesForSavedUsers(): Promise<void> {
    try {
        getAllUsers(async (user_list: { [s: string]: string }) => {
            for (let [username, user_data] of Object.entries(user_list)) {
                try {
                    let user = JSON.parse(user_data);
                    await unmountDirectory(user.Scope);
                    mountSeadrive(`${base_directory}/${username}/seadrive.conf`, data_directory, user.Scope, () => {
                        console.log(`Mounted directory for ${username} successfully...`);
                    },
                        `${base_directory}/${username}/seadrive.log`, true);
                } catch (error) {
                    console.error(error);
                }
            }
        });
    } catch (error) {
        console.error(error);
    }
}

function updateConfigurationFile(file_name: string, content: string, old_token: string, new_token: string) {
    var result = content.replace(old_token, new_token);
    fs.writeFile(file_name, result, 'utf8', function (error) {
        if (error) {
            console.error(error);
        }
    });
}

function saveUserInRedis(username: string, password: string, directory: string) {
    console.log(`Adding User: ${username} to the database...`);
    bcrypt.hash(password, 10, function (err: any, hash: string) {
        if (err) {
            console.error(err);
        } else if (hash) {
            let new_user = { "Username": username, "Password": `{bcrypt}${hash}`, "Scope": directory };
            saveUser(username, JSON.stringify(new_user));
        }
    });
}
