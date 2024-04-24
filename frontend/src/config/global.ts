declare global {
    interface Window {
        _app: { backendID: string, appPath: string, baseServerPath: string, curUserID: string }
    }
}

export const curUserID = window?._app?.curUserID || '1105387902724063510';
export const backendID = window?._app?.backendID || '7359542920423285798';
export const baseServerPath = window?._app?.baseServerPath || 'http://localhost';
export const BACKEND_URL = `${baseServerPath}/custom_web_template.html?object_id=${backendID}`;