// TypeScript
import express from 'express';
import mountSeadrive from './seafile_utils/mountSeadrive';
import createConfig from './seafile_utils/createConfig';
import getToken from './seafile_utils/getToken';
import * as crypto from 'crypto'

const host = 'http://localhost:8080';
const realm = 'Seadrive';

// database
const users =  new Set<{username: string, password: string}>();
 
const app = express();




// createConfig('/home/udara/sample.conf', 'http://localhost:8080', 'me@example.com', '1234')

// mountSeadrive('~/seadrive.conf', '~/Documents/FYP/Seadrive', '~/Seadrive2', '~/Documents/FYP/log.txt', true)

// server.setFileSystemSync('/drive', new webdav.PhysicalFileSystem('/home/udara/Seadrive'))

// app.post('/login', function (req, res) {
//     let username = req.body.username;
//     let password = req.body.password;
//     // check if user already registered
//     const token  = getToken(username, password);
//     createConfig('/home/udara/sample.conf', host, username, token, username);
//     // add to database
//     const passwordHash = bcrypt.hashSync(password, 10);
//     users.add({username, password: passwordHash});
//     res.sendStatus(400);
// })

app.listen(1901)