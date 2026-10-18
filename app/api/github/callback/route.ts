import { NextRequest, NextResponse } from "next/server"
import {getCurrentSession} from "@/features/auth/actions/index"
import { saveInstallation } from "@/features/github/server/index"


// when user intalls the github app it will redirect to this route with installation id and state
export async function GET (req: NextRequest ) {
    const { searchParams } = new URL( req.url )

    const installationId = searchParams.get("installation_id")
    
    const session = await getCurrentSession();
    if( !session ) {
        // later creaet a calllback url with installation id and redirect tonsign in
        return new Response("unauthorized", { status: 404})
    }

    // save the installation id 
    if ( installationId ) {
        await saveInstallation( session.user.id, Number( installationId ) )
    }
    
    return NextResponse.redirect(
        new URL("/dashboard/repositories", req.url)
    );
}

