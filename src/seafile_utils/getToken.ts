import {exec} from 'child_process'

export default async function getToken(host: string, username: string, password: string, loginSuccess: Function, loginFail: Function) {
    let command: string = `curl -d "username=${username}" -d "password=${password}" ${host}/api2/auth-token/`;
    exec(command, ((error: any, stdout: string, stderr: string) => {
        if (error) {
            console.error(error);
        }
        if (stdout) {
            let opt = JSON.parse(stdout);
            if (opt.non_field_errors) {
                loginFail(opt.non_field_errors, username);
            } else if (opt.token) {
                loginSuccess(opt.token, username);
            }
        }
    }));
}
