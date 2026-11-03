import { notFound, redirect } from "next/navigation";

import { getCurrentSession } from "@/features/auth/actions";

import { getConversations } from "@/features/chat/services/conversations";
import type { ChatMessageType } from '@/features/chat/types/chat'
import { ChatWorkspace } from "@/features/chat/components/chat-workspace";
import { verifyRepositoryOwnership } from "@/features/chat/services/verify-repo-ownership";


type ChatPageProps = {
    params: Promise<{
        repoId: string
    }>
}

export default async function RepositoryChatPage(
    { params }: ChatPageProps
) {

    // 1: get user session
    const session = await getCurrentSession()
    if( !session ) redirect( '/sign-in')


    // 2: get repo id from params
    const { repoId } = await params
    if( !repoId.trim() ) notFound()


    // 3: fetch repo for the user
    const repo = await verifyRepositoryOwnership(repoId, session.user.id )

    // 4: fetch repo conversations and create a new conversation
    const conversations = await getConversations({ repositoryId: repo.id, userId: session.user.id})

    const messages: ChatMessageType[] = [];

    
    return (
        <div className="h-[calc(100dvh-4rem)]">
            <ChatWorkspace
            repoId = { repo.id }
                repoName = { repo.repoName }
                conversations={conversations}
                messages={ messages }
                activeConversationId={ null }
            />
        </div>
    )
}