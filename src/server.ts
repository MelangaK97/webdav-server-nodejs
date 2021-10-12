// TypeScript
import { v2 as webdav } from 'webdav-server';
import express from 'express';
import mountSeadrive from './seafile_utils/mountSeadrive';
import createConfig from './seafile_utils/createConfig';

// User manager (tells who are the users)
const userManager = new webdav.SimpleUserManager();
 
// Privilege manager (tells which users can access which files/folders)
const privilegeManager = new webdav.SimplePathPrivilegeManager();
 
const app = express();

const server = new webdav.WebDAVServer({
    // HTTP Digest authentication with the realm 'Default realm'
    httpAuthentication: new webdav.HTTPDigestAuthentication(userManager, 'Default realm'),
    privilegeManager: privilegeManager,
    // port: 1900, // Load the server on the port 2000 (if not specified, default is 1900)
    autoSave: { // Will automatically save the changes in the 'data.json' file
        treeFilePath: 'data.json'
    }
});

const user = userManager.addUser('username', 'password', false);
privilegeManager.setRights(user, '/', [ 'all' ]);

// createConfig('/home/udara/sample.conf', 'http://localhost:8080', 'me@example.com', '1234')

mountSeadrive('~/seadrive.conf', '~/Documents/FYP/Seadrive', '~/Seadrive', '~/Documents/FYP/log.txt', true)

// // server.setFileSystemSync('/Downloads', new webdav.PhysicalFileSystem('/home/udara/Downloads'))
server.setFileSystemSync('/', new webdav.PhysicalFileSystem('/home/udara/Seadrive'))
// // server.setFileSystem('/', new webdav.PhysicalFileSystem('/home/udara/Downloads'), (success) => {
// //     server.start(() => console.log('READY'));
// // });

// app.get('/login', function (req, res) {
//     res.send('hello world')
// })
app.use(webdav.extensions.express('/', server))

app.listen(1901)