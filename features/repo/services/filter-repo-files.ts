
import type { RepoFIle } from "./fetch-repo-tree";

const IGNORED_DIRECTORIES = new Set([
    "node_modules",
    ".git",
    ".next",
    ".build",
    "dist",
    "build",
    "coverage",
    "venv",
    ".venv",
    "__pycache__",
    "target",
    ".turbo",
    ".vercel",
]);

const IGNORED_FILES = new Set([
    "package-lock.json",
    "pnpm-lock.yaml",
    "pnpm-lock.yml",
    "bun.lockb",
    "bun.lock",
    "cargo.lock",
    "poetry.lock",
    "uv.lock",
    ".npmrc",
    ".pypirc",
    ".netrc",
    "credentials.json",
    ".env",
]);

const ALLOWED_EXTENSIONS = new Set([
    ".ts", ".tsx", ".js", ".jsx",
    ".mjs", ".cjs",
    ".py", ".java", ".c", ".h", ".cpp", ".hpp",
    ".go", ".rs", ".php", ".rb",
    ".cs", ".swift", ".kt", ".kts",
    ".vue", ".svelte",
    ".html", ".css", ".scss",
    ".json", ".yaml", ".yml", ".toml",
    ".md", ".mdx", ".sql",
    ".sh", ".bash", ".ps1",
    ".prisma", ".graphql", ".gql",
    ".xml", ".tf", ".dockerfile",
]);

// Maximum file size: 500 KB, measured in bytes.
const MAX_FILE_SIZE = 500_000;

function normalizePath(path: string): string {
    return path.replace(/\\/g, "/");
}

function getExtension(path: string): string {
    const fileName = path.split("/").pop()?.toLowerCase() ?? "";

    if (
        fileName === "dockerfile" ||
        fileName.startsWith("dockerfile.")
    ) {
        return ".dockerfile";
    }

    const index = fileName.lastIndexOf(".");

    if (index > 0) {
        return fileName.slice(index);
    }

    return "";
}

function isIgnoredPath(path: string): boolean {
    const parts = normalizePath(path)
        .split("/")
        .filter(Boolean)
        .map((part) => part.toLowerCase());

    if (parts.length === 0) {
        return true;
    }

    if (
        parts.some((part) => IGNORED_DIRECTORIES.has(part))
    ) {
        return true;
    }

    const fileName = parts[parts.length - 1];

    if (IGNORED_FILES.has(fileName)) {
        return true;
    }

    // Exclude environment files such as .env.local and .env.production.
    if (/^\.env(?:\.|$)/i.test(fileName)) {
        return true;
    }

    return false;
}

function isValidPath(file: RepoFIle): boolean {
    if (!file.path || !file.path.trim()) {
        return false;
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
        return false;
    }

    if (isIgnoredPath(file.path)) {
        return false;
    }

    return ALLOWED_EXTENSIONS.has(getExtension(file.path));
}

export function filteredRepoFiles(
    files: RepoFIle[]
): RepoFIle[] {
    return files.filter(isValidPath);
}
