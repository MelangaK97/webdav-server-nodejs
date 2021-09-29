const getCurrentTimeStamp = (): string => {
    return new Date().toISOString();
};

const info = (namespace: string, message: string, object?: any) => {
    if (object) {
        console.log(`[${getCurrentTimeStamp()}] [INFO] [${namespace}] ${message}`, object);
    } else {
        console.log(`[${getCurrentTimeStamp()}] [INFO] [${namespace}] ${message}`);
    }
};

const debug = (namespace: string, message: string, object?: any) => {
    if (object) {
        console.log(`[${getCurrentTimeStamp()}] [DEBUG] [${namespace}] ${message}`, object);
    } else {
        console.log(`[${getCurrentTimeStamp()}] [DEBUG] [${namespace}] ${message}`);
    }
};

const warn = (namespace: string, message: string, object?: any) => {
    if (object) {
        console.log(`[${getCurrentTimeStamp()}] [WARN] [${namespace}] ${message}`, object);
    } else {
        console.log(`[${getCurrentTimeStamp()}] [WARN] [${namespace}] ${message}`);
    }
};

const error = (namespace: string, message: string, object?: any) => {
    if (object) {
        console.log(`[${getCurrentTimeStamp()}] [ERROR] [${namespace}] ${message}`, object);
    } else {
        console.log(`[${getCurrentTimeStamp()}] [ERROR] [${namespace}] ${message}`);
    }
};

export default { info, warn, error, debug };
