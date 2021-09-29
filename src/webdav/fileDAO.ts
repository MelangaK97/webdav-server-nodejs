import { createClient } from 'webdav';

const NAMESPACE = 'File DAO';

const client = createClient('http://localhost:8085/seafdav/', {
    username: 'me@example.com',
    password: 'asecret'
});

export const getDirectoryContents = async () => await client.getDirectoryContents('/', { deep: true });

export const getFileContents = async (filePath: any) => await client.getFileContents(filePath);

export const getFileDownloadLink = async (filePath: any) => await client.getFileDownloadLink(filePath);
