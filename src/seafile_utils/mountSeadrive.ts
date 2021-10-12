import {exec} from "child_process";

export default async function mountSeadrive(config: string, dataDir: string, virtualDriveDir: string, logFile?: string, isForeground?: boolean) {
    try {
        exec(`seadrive -c ${config} ${isForeground ? '-f' : ''} -d ${dataDir} ${virtualDriveDir} ${logFile ? `-l ${logFile}` : ''}`);
        // console.log('stdout:', stdout);
        // console.log('stderr:', stderr);
    } catch (error) {
        console.error(error);
    }
}