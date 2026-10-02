const DEFAULT_CALLBACK_URL = '/dashboard'

// check is callbackurl is valid or not
export function getSafeCallbackurl ( callbackurl : string | null | undefined ) : string {
    if ( callbackurl?.startsWith('/') && !callbackurl.startsWith('//')) {
        return callbackurl
    }

    return DEFAULT_CALLBACK_URL

}