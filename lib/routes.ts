import GithubIcon from "@/components/utility/github-icon";
import { Code2, FolderGit2, LayoutDashboard, Settings2 } from "lucide-react";

export const DASHBOARD_ROUTES = {
    overview: "/dashboard",
    addRepository: "/dashboard/repositories",
    githubIntegration: "/dashboard/github-app",
    codeWorkspace: "/dashboard/index",
    settings: "/dashboard/settings",
} as const;


export const DASHBOARD_NAV_ITEMS = [
    {
        title: "Overview",
        href: DASHBOARD_ROUTES.overview,
        icon: LayoutDashboard
    },
    {
        title: "Add Repo",
        href: DASHBOARD_ROUTES.addRepository,
        icon: FolderGit2
    },
    {
        title: "Github App",
        href: DASHBOARD_ROUTES.githubIntegration,
        icon: GithubIcon
    },
    {
        title: "Code Workspace",
        href: DASHBOARD_ROUTES.codeWorkspace,
        icon: Code2
    },
    {
        title: "Settings",
        href: DASHBOARD_ROUTES.settings,
        icon: Settings2
    }
] as const;
