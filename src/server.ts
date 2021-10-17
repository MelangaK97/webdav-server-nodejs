// TypeScript
import express from 'express';
import bodyParser from 'body-parser';
import mountSeadrive from './seafile_utils/mountSeadrive';
import createConfig from './seafile_utils/createConfig';
import getToken from './seafile_utils/getToken';
import fs from 'fs';
import * as crypto from 'crypto'

const host = 'http://localhost:7080';
const baseDir = '/home/melangakasun/Desktop/FYP/test';
const realm = 'Seadrive';

// database
const users =  new Set<{username: string, password: string}>();
 
const app = express();
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

// getToken(callback, host, username, password);

// getToken(callback, host, 'test2@email.com', '12345');

function seafileLoginSuccess(token: string, username: string) {
    console.log(`Successfully logged in... Username: ${username}, Token: ${token}`);

    // since there is not any folder structure in the first login
    let userDir: string = `${baseDir}/${username}/data`;
    if (!fs.existsSync(userDir)){
        fs.mkdirSync(userDir, { recursive: true });
        createConfig(`${baseDir}/${username}/seadrive.conf`, host, username, token, username);
        mountSeadrive(`${baseDir}/${username}/seadrive.conf`, '/home/melangakasun/.seadrive/data', `${baseDir}/${username}/data`, `${baseDir}/${username}/seadrive.log`, true);
    }
}

function seafileLoginFail(error: string, username: string) {
    console.error(`An error occurred... Username: ${username}, Error: ${error}`);
    // create seafile account
}

// createConfig('/home/udara/sample.conf', 'http://localhost:8080', 'me@example.com', '1234')

// mountSeadrive('~/Desktop/FYP/test/test1/seadrive.conf', '~/.seadrive/data1', '~/Desktop/FYP/test/test1/data', '~/Desktop/FYP/test/test1/seadrive.log', true);
// mountSeadrive('~/Desktop/FYP/test/test2/seadrive.conf', '~/.seadrive/data2', '~/Desktop/FYP/test/test2/data', '~/Desktop/FYP/test/test2/seadrive.log', true);

// server.setFileSystemSync('/drive', new webdav.PhysicalFileSystem('/home/udara/Seadrive'))

app.post('/login', function (req, res) {
    let username = req.body.username;
    let password = req.body.password;
    console.log(`Login request... Username: ${username}, Password: ${password}`);
    
    // check if user already registered

    // if folder structure is not created
    getToken(host, username, password, seafileLoginSuccess, seafileLoginFail);
    // createConfig('/home/udara/sample.conf', host, username, token, username);
    // add to database
    // const passwordHash = bcrypt.hashSync(password, 10);
    // users.add({username, password: passwordHash});
    res.sendStatus(400);
});

app.listen(1901);
