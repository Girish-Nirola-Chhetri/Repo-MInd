import { NextRequest, NextResponse } from "next/server"
import { getCurrentSession } from "../actions";
import { getSafeCallbackurl } from "../utils/index";

const SIGN_IN_PATH = "/sign-in"


function getPostAuthRedirectPath (req: NextRequest ): string {
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl")
    return getSafeCallbackurl( callbackUrl );
}


function redirectToSIgnIn( req: NextRequest, pathname: string ) {
    const signInUrl = new URL( SIGN_IN_PATH, req.url )
    
    signInUrl.searchParams.set("calllbackUrl", `${pathname}${req.nextUrl.search}`);

    return NextResponse.redirect( signInUrl )
}


export async function authProxy ( req: NextRequest ) {

    const pathname = req.nextUrl.pathname;
    if( pathname == '/' ) 
        return NextResponse.next();

    const session = await getCurrentSession();

    if( pathname == SIGN_IN_PATH ) {
        if( session ) {
            const redirectPath = getPostAuthRedirectPath( req );
            return NextResponse.redirect( new URL( redirectPath, req.url ))
        }

        // if no session just continue
        return NextResponse.next();
    }

    if( !session ) 
        return redirectToSIgnIn( req, pathname );

    return NextResponse.next();

}