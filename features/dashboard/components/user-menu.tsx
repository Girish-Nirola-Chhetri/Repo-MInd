import { redirect } from "next/navigation";
import { getCurrentSession } from "@/features/auth/actions"
import { UserMenuClient } from "@/components/utility/user-menu-client"

export async function UserMenu( ) {
    const session = await getCurrentSession();
    if( !session )
        redirect( '/sign-in')

    return <UserMenuClient user={ session.user } />
}

