import {exec} from "child_process";

export default async function mountSeadrive(config: string, dataDir: string, virtualDriveDir: string, logFile?: string, isForeground?: boolean) {
    let command: string = `seadrive -c ${config} ${isForeground ? '-f' : ''} -d ${dataDir} ${logFile ? `-l ${logFile}` : ''} ${virtualDriveDir}`;
    exec(command, ((error: any, stdout: any, stderr: string) => {
        if (error) {
            console.error(error);            
        }
        if (stderr) {
            console.error(stderr);            
        }
    }));
}
