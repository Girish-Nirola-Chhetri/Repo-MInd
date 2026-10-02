import { NextRequest  } from "next/server";
import { authProxy } from "./features/auth/utils/auth-proxy";

export function proxy( req: NextRequest ) {
    return authProxy( req );
}

export const config = {
    matcher: ['/sign-in', '/dashboard', '/dashboaard/:path']
}