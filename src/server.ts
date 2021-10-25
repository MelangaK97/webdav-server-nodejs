// TypeScript
import express from 'express';
import bodyParser from 'body-parser';
import mountSeadrive from './seafile_utils/mountSeadrive';
import createConfig from './seafile_utils/createConfig';
import getToken from './seafile_utils/getToken';
import fs from 'fs';
import redis from 'redis';
import * as crypto from 'crypto';
import { exec } from 'child_process';

const host = 'http://localhost:7080';
const data_directory = '/home/melangakasun/.seadrive/data';
const base_directory = '/home/melangakasun/Desktop/FYP/test';
const realm = 'Seadrive';
const server_port = 1901;
const redis_port = 6379;
 
const app = express();
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

const redis_client = redis.createClient(redis_port);

app.post('/login', async function (req, res) {
    let username: string = req.body.username;
    let password: string = req.body.password;
    console.log(`Login request... Username: ${username}, Password: ${password}`);
    let response: any;
    
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
                response = opt.non_field_errors;
                res.statusCode = 401;
            } else if (opt.token) {
                console.log(`Successfully logged in... Username: ${username}, Token: ${opt.token}`);
                let user_directory: string = `${base_directory}/${username}/data`;
                try {
                    if (!fs.existsSync(user_directory)) {
                        // creating a directory for the user
                        console.log(`Creating directory... ${user_directory}`);
                        fs.mkdirSync(user_directory, { recursive: true });
                    }
                    if (!fs.existsSync(`${base_directory}/${username}/seadrive.conf`)) {
                        // creating the seadrive.conf file
                        console.log(`Creating the configuration file...`);
                        createConfig(`${base_directory}/${username}/seadrive.conf`, host, username, opt.token, username);
                    } else {
                        fs.readFile(`${base_directory}/${username}/seadrive.conf`, 'utf8', (error, data) => {
                            if (error) {
                                console.error(error);                                
                            } else if (data) {
                                try {
                                    var old_token: string = data.split('\n')[3].substring(8);   
                                    if (old_token !== opt.token) {
                                        console.log(`Updating the configuration file...`);
                                        updateConfigurationFile(`${base_directory}/${username}/seadrive.conf`, data, old_token, opt.token);
                                    }
                                } catch (error) {
                                    console.error(error);
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
                    res.statusCode = 200;
                    
                } catch(error) {
                    console.error(`An error occurred... ${error}`);
                    response = error;
                    res.statusCode = 500;
                }
            }
        }
        res.send(response);
    });
});

app.listen(server_port, () => mountDirectoriesForSavedUsers());

function mountDirectoriesForSavedUsers(): void {
    redis_client.hgetall('users', async (error, data) => {
        if (error) {
            console.error(error);            
        } else if (data) {
            for (let [key, value] of Object.entries(data)) {
                try {
                    let user_data = JSON.parse(value);
                    await unmountDirectory(user_data.Scope);
                    mountSeadrive(`${base_directory}/${key}/seadrive.conf`, data_directory, user_data.Scope, () => {
                        console.log(`Mounted directory for ${key} successfully...`);                        
                    },
                    `${base_directory}/${key}/seadrive.log`, true);
                } catch (error) {
                    console.error(error);                    
                }
            }          
        }
    });
}

function saveUserInRedis(username: string, password: string, directory: string): void {
    console.log(`Adding User: ${username} to the database...`);
    let new_user = {"Username": username, "Password": password, "Scope": directory};
    redis_client.hset('users', username, JSON.stringify(new_user), (error, reply) => {
        if (error) {
            console.error(error);                                    
        }
    });
}

async function unmountDirectory(directory: string) {
    try {
        let command: string = `fusermount -uz ${directory}`
        exec(command);   
        console.log(`${directory} is unmounted successfully...`);
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
