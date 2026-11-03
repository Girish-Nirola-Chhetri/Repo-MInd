
import { CodeWorkspace } from "@/features/index/components/code-workspace";
import { getRepositories } from "@/features/index/services/repositories";

export default async function CodeWorkspacePage() {
    const repositories = await getRepositories()

    return <CodeWorkspace repositories={repositories} />

}
