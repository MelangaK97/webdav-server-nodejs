import { exec } from "child_process";

export default async function mountSeadrive(config: string, dataDir: string, virtualDriveDir: string, logFile?: string, isForeground?: boolean, callback?: Function) {
    let command: string = `seadrive -c ${config} ${isForeground ? '-f' : ''} -d ${dataDir} ${logFile ? `-l ${logFile}` : ''} ${virtualDriveDir}`;
    exec(command, (error, stdout, stderr) => callback && callback(error, stdout, stderr));
}
