import { exec } from "child_process";

export default async function unmountDirectory(directory: string) {
    try {
        let command: string = `fusermount -uz ${directory}`
        exec(command);   
        console.log(`${directory} is unmounted successfully...`);
    } catch (error) {
        console.error(error);  
    }   
}
