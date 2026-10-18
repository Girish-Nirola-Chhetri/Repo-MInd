"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getSafeCallbackurl } from "../utils";
import { redirect } from "next/navigation";


const SIGNIN_PATH = '/sign-in'
const DEFAULT_CALLBACK_URL = '/dashboard'


export async function signInWithGithub ( formData: FormData ) {
    
    const callbackUrl = formData.get("callbackUrl")

    const redirecturl = getSafeCallbackurl( typeof callbackUrl == 'string' ? callbackUrl : null )

    // authenticate user on the servr side
    const result = await auth.api.signInSocial({          // will give teh github login url and redirectio  true or flase
        body: {
            provider: "github",
            callbackURL:  redirecturl           // when login is successful github will redirect to this url
        },
        headers: await headers()
    })

    // redirect to guthub login page
    if( result.url ) {
        redirect( result.url )
    }

}


// get current logged in user
export async function getCurrentSession() {
    const session = await auth.api.getSession({
        headers: await headers()
    })

    return session;
}


// if logges in then allow else reidrect ( required auth to go to these routes )
// proetcts protected routes

export async function requireAuth( redirectTo = SIGNIN_PATH ) {
    const session = await getCurrentSession();

    if( !session ) {
        redirect( redirectTo )
    }

    return session
}


// if logged in redirect to dashoatd
// if user visits sigin after login see if session exists redirect to dashbiard ( proyects the punlic routes )
export async function requireUnAuth( redirectTo = DEFAULT_CALLBACK_URL ) {
    const session = await getCurrentSession()

    if( session ) redirect( redirectTo )

    return session;
}


export async function signOut( redirectTo = SIGNIN_PATH ) {
    await auth.api.signOut({
        headers: await headers()
    })

    redirect( redirectTo )
}