import {exec} from "child_process";

export default async function mountSeadrive(config: string, dataDir: string, virtualDriveDir: string, callback: Function, logFile?: string, isForeground?: boolean) {
    let command: string = `seadrive -c ${config} ${isForeground ? '-f' : ''} -d ${dataDir} ${logFile ? `-l ${logFile}` : ''} ${virtualDriveDir}`;
    exec(command, (error, stdout, stderr) => {
        callback(error, stdout, stderr);
    });
}
