export class User {
    username: string;
    salt: string;
    password: string;
    scope: string;
    modify: boolean;
    
    constructor(username: string, salt: string, password: string, scope: string, modify: boolean) {
        this.username = username;
        this.salt = salt;
        this.password = password;
        this.scope = scope;
        this.modify = modify;
    }
}

class Rule {
    path: string;
    regex: boolean;
    allow: boolean;
    modify: boolean;

    constructor(path: string, regex: boolean, allow: boolean, modify: boolean) {
        this.path = path;
        this.regex = regex;
        this.allow = allow;
        this.modify = modify;
    }
}
