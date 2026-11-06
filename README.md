# Repo Mind

Repo Mind is a repository-aware AI workspace built with Next.js. It connects a user's GitHub account through a GitHub App, allows repositories to be added, indexes eligible source files into Pinecone, and provides a repository-specific chat interface for asking questions about code.

This README is a development handover document. It records what is present in the GitHub `main` branch inspected for this update, how the main flows work, and what remains to be done.

Repository: https://github.com/Girish-Nirola-Chhetri/Repo-MInd

> **Branch-state warning:** The GitHub `main` branch currently contains the earlier single-turn RAG implementation. Some newer conversation-history and query-rewriting changes discussed during development are not present in the files inspected from `main`. Those changes may exist in your local working tree; check and commit them before treating them as part of the repository baseline.

---

## Contents

- [Product overview](#product-overview)
- [Technology stack](#technology-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Authentication and GitHub integration](#authentication-and-github-integration)
- [Repository import and indexing](#repository-import-and-indexing)
- [Chunking implementation](#chunking-implementation)
- [Pinecone storage and retrieval](#pinecone-storage-and-retrieval)
- [Chat workspace](#chat-workspace)
- [Current RAG implementation](#current-rag-implementation)
- [Database schema](#database-schema)
- [Local setup](#local-setup)
- [Environment configuration](#environment-configuration)
- [Running locally](#running-locally)
- [Implementation status](#implementation-status)
- [Known issues and investigation notes](#known-issues-and-investigation-notes)
- [Next tasks](#next-tasks)
- [Important files reference](#important-files-reference)

---

## Product overview

The intended user workflow is:

1. Sign in using GitHub OAuth.
2. Install the Repo Mind GitHub App to grant repository access.
3. Add a GitHub repository.
4. Fetch repository metadata and schedule indexing through Inngest.
5. Fetch eligible source files, parse and chunk them with Tree-sitter, then upsert chunks into Pinecone.
6. Open Code Workspace, select an indexed repository, and enter its chat workspace.
7. Ask questions about the repository. The RAG pipeline retrieves relevant code chunks and sends them to an LLM to generate an answer.

The project also has an Inngest foundation and a planned/ongoing pull-request review direction. The currently inspected `main` branch confirms the repository indexing function, but a complete PR review workflow was not verified in this inspection.

---

## Technology stack

| Area | Technology |
|---|---|
| Framework | Next.js 16.3.6, App Router |
| UI | React 19, Tailwind CSS 4, shadcn/ui / Base UI |
| Language | TypeScript |
| Authentication | Better Auth 1.7.6 |
| Login provider | GitHub OAuth |
| Repository access | GitHub App, Octokit |
| Database | PostgreSQL (Neon is the intended hosted database) |
| ORM / migrations | Drizzle ORM 1.0.0-rc.4, Drizzle Kit |
| Background jobs | Inngest 4 |
| Parsing / chunking | `@xberg-io/tree-sitter-language-pack-wasm` |
| Vector database | Pinecone 9 |
| LLM orchestration | Vercel AI SDK 7 |
| Model provider | Google AI SDK; configured model: `gemini-3.6-flash` |
| Package manager | pnpm 11.3.0 |

The exact versions are defined in `package.json` and `pnpm-lock.yaml`.

---

## Architecture

```text
Browser
  |
  v
Next.js App Router
  |
  +--> Better Auth --> PostgreSQL
  |
  +--> Dashboard / GitHub integration
  |       |
  |       v
  |   GitHub App / Octokit
  |       |
  |       v
  |   Repository metadata --> PostgreSQL
  |       |
  |       v
  |   Inngest: repository/index-repository
  |       |
  |       +--> Fetch recursive Git tree
  |       +--> Filter files
  |       +--> Fetch Git blobs
  |       +--> Tree-sitter chunking
  |       +--> Pinecone document upsert
  |
  +--> Repository Chat
          |
          v
      Chat server action / service
          |
          v
      RAG orchestration
          |
          +--> Pinecone retrieval
          |
          +--> Prompt construction
          |
          v
      Google Gemini via AI SDK
          |
          v
      Save messages --> PostgreSQL
```

---

## Project structure

This is the useful application-level structure from the inspected tree. Generated dependency and build folders are omitted.

```text
Repo-MInd/
├── app/
│   ├── (auth)/sign-in/
│   ├── (protected)/
│   │   ├── (chat)/
│   │   │   └── repositories/[repoId]/chat/
│   │   └── dashboard/
│   │       ├── github-app/
│   │       ├── index/
│   │       └── repositories/
│   ├── api/
│   │   ├── auth/[...all]/
│   │   ├── github/callback/
│   │   ├── github/repos/
│   │   └── inngest/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── home/
│   ├── layout/
│   ├── providers/
│   ├── repos/
│   ├── ui/
│   └── utility/
│
├── db/
│   ├── index.ts
│   └── schema/
│       ├── auth-schema.ts
│       ├── chat.ts
│       ├── gihub-installation.ts
│       └── repo-schema.ts
│
├── drizzle/                 # Generated migrations and snapshots
│
├── features/
│   ├── auth/
│   ├── chat/
│   ├── dashboard/
│   ├── github/
│   ├── index/
│   ├── inngest/
│   ├── repo/
│   └── retrival/
│
├── lib/
│   ├── auth.ts
│   ├── github-app.ts
│   ├── github-install-url.ts
│   ├── inngest/
│   ├── llm.ts
│   ├── pinecone/
│   ├── routes.ts
│   └── utils.ts
│
├── public/
├── drizzle.config.ts
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── proxy.ts
└── tsconfig.json
```

### What the main directories do

- `app/`: Next.js pages, layouts, route handlers, and API endpoints.
- `components/`: shared visual components, navigation/layout, theme provider, UI primitives.
- `db/`: Drizzle database connection and schema.
- `drizzle/`: generated SQL migrations and snapshots.
- `features/`: feature-level actions, components, services, and types.
- `lib/`: shared clients and configuration for auth, GitHub, Inngest, Pinecone, and the LLM.
- `public/`: static assets such as the logo.

### Route groups

Parenthesized folder names are Next.js route groups and do not appear in URLs.

- `app/(auth)/sign-in/page.tsx` maps to `/sign-in`.
- `app/(protected)/dashboard/...` maps to dashboard URLs.
- `app/(protected)/(chat)/repositories/[repoId]/chat/page.tsx` maps to `/repositories/:repoId/chat`.

The chat route has its own layout, separate from the dashboard layout, so it can use the full viewport without the dashboard sidebar.

---

## Authentication and GitHub integration

There are two separate GitHub integrations. They have different responsibilities.

### GitHub OAuth — identify the user

- `lib/auth.ts`: initializes Better Auth with the Drizzle adapter and GitHub social provider.
- `app/api/auth/[...all]/route.ts`: Better Auth API handler.
- `features/auth/actions/index.ts`: sign-in, current-session lookup, auth guards, and sign-out.
- `features/auth/components/github-signin-form.tsx`: sign-in form.
- `features/auth/utils/auth-proxy.ts`: redirects users based on session state.
- `proxy.ts`: app proxy entry point.

The inspected config enables GitHub OAuth. Email/password configuration is currently commented out.

### GitHub App — access repositories

- `lib/github-app.ts`: constructs and caches the Octokit GitHub App instance.
- `lib/github-install-url.ts`: creates the GitHub App installation URL and sets the user ID as the `state` query parameter.
- `features/github/server/github-connection.ts`: connect URL and uninstall/disconnect logic.
- `features/github/server/index.ts`: installation status, lookup, and persistence helpers.
- `features/github/components/githubconnect-card.tsx`: install/uninstall UI.
- `app/(protected)/dashboard/github-app/page.tsx`: GitHub integration page.
- `app/api/github/callback/route.ts`: receives the installation callback and saves the installation.
- `db/schema/gihub-installation.ts`: installation table schema.

The current GitHub App implementation reads its private key from `github-app-private-key.pem` at the project root. Keep the key outside source control. The app ID environment variable is spelled `GITHUB_App_ID` in the code.

**Security follow-up:** The installation callback currently reads the session and `installation_id`, but does not validate the returned `state` parameter. Before production use, replace the raw user ID state with a secure, expiring, one-time state value and validate it in the callback.

---

## Repository import and indexing

### Repository import

The checked-in API handler is `app/api/github/repos/route.ts`. Its current GET handler:

1. Checks the user's session.
2. Looks up the user's GitHub App installation.
3. Reads a `url` query parameter.
4. Calls `fetchRepo()` to validate the URL and retrieve GitHub repository metadata.
5. Saves the metadata with `saveRepoMetadata()`.
6. Sends the `repository/index-repository` event to Inngest.
7. Returns the saved repository.

Relevant services:

- `features/repo/services/fetch-repo-metadata.ts`: validates a GitHub URL and fetches repository metadata using the installation's Octokit client.
- `features/repo/db/save-repo-metadata.ts`: inserts or updates repository metadata. The conflict target is the pair `userId + repoId`.

### Important add-repository mismatch

The checked-in UI at `app/(protected)/dashboard/repositories/page.tsx` currently sends a **POST** request with JSON to `/api/repositories`. The checked-in API route is `/api/github/repos` and implements **GET** with the URL in query parameters.

These paths and HTTP methods do not match. Check your local working tree for a newer route or form implementation. If neither has changed locally, this flow needs to be reconciled before assuming repository import works end-to-end.

### Indexing pipeline

The Inngest function is defined in `features/inngest/functions.ts` and exposed by `app/api/inngest/route.ts`.

Event name:

```text
repository/index-repository
```

The function:

1. Updates the repository status to `processing`.
2. Fetches the selected branch and its recursive Git tree.
3. Filters files by extension, ignored paths, and size.
4. Processes eligible files in batches of 50.
5. Fetches each file's Git blob content.
6. Passes source content to `chunkCode()`.
7. Collects chunks from all files.
8. Upserts chunks to Pinecone in batches.
9. Updates the database with `completed`, indexing time, and commit SHA.
10. On failure, records `failed` and the error message, then rethrows.

Repository index status values are:

- `pending`
- `processing`
- `completed`
- `failed`

---

## Chunking implementation

Chunking is implemented in `features/repo/services/chunk-code.ts` using:

`@xberg-io/tree-sitter-language-pack-wasm`

Current behavior:

1. Detect language using the file path.
2. Return no chunks if the language cannot be detected.
3. Create the library's default WASM process configuration.
4. Set the detected language.
5. Set `chunkMaxSize` to `4000` by default (the local parameter is named `maxChunkBytes`).
6. Enable structural parsing, imports, exports, and docstrings.
7. Call `process(content, config)`.
8. Convert returned chunks into the application's `CodeChunk` shape.
9. Add one to parser start/end line values, producing 1-based line numbers.
10. Preserve `nodeTypes` and `symbolsDefined` metadata from the parser.

Current chunk shape:

```ts
type CodeChunk = {
    id: string
    path: string
    language: string
    startLine: number
    endLine: number
    content: string
    nodeTypes: string[]
    symbolsDefined: string[]
}
```

### File filtering

`features/repo/services/filter-repo-files.ts` excludes common generated or dependency folders such as `node_modules`, `.git`, `.next`, `dist`, `build`, `coverage`, and others.

It also excludes lockfiles and selected credential/config files, excludes `.env` and its variants, and allows a defined list of source, config, documentation, and markup extensions. Files that are empty or larger than 500,000 bytes are rejected.

### What still needs validation

The presence of Tree-sitter does not by itself prove that the generated chunks are useful. The actual output has not yet been measured systematically.

Inspect representative files and record:

- Total files in the Git tree.
- Number of files after filtering.
- Number of successfully fetched files.
- Number of files with language detection success/failure.
- Number of chunks generated per file.
- Chunk byte-size distribution (minimum, median, p95, maximum).
- Chunk start/end line alignment with the original file.
- Whether important functions/classes are split sensibly.
- Parser-provided node types and symbols.
- Whether relevant files are being omitted by the filter.

Verify the Tree-sitter library's exact unit and meaning for `chunkMaxSize`; do not assume 4000 means 4000 tokens or characters.

---

## Pinecone storage and retrieval

### Upsert

Implemented in `features/repo/services/vectors.ts`.

Each chunk is stored as a Pinecone document with:

- `_id`: SHA-256 hash based on repository ID, file path, start/end line, and content.
- `chunk_text`: source text.
- `repository_id`: internal repository ID, used for filtering.
- `repo_fullname`: owner/repository name.
- `file_path`
- `language`
- `start_line`
- `end_line`
- `branch`
- `commit_sha`

The upsert batch size is 50.

The Pinecone client is in `lib/pinecone/client.ts` and reads `PINECONE_API_KEY` and `PINECONE_INDEX_NAME` (default: `repo-chat`).

### Retrieval

Implemented in `features/retrival/services/retrieve.ts`.

- Searches the `chunk_text` field using Pinecone's embedding search.
- Filters matches by `repository_id`.
- Defaults to `topK = 5`.
- Returns content, file path, line range, language, and similarity score.

The returned score is not currently used to filter or rerank results. The top five matches are passed onward regardless of whether they are meaningfully relevant.

A successful search returning five matches does not guarantee five relevant chunks.

---

## Chat workspace

### Route and page

The repository chat route is:

`app/(protected)/(chat)/repositories/[repoId]/chat/page.tsx`

It checks the session, reads `repoId`, verifies that the user owns the repository, loads the repository's conversations, and renders `ChatWorkspace`.

It initializes with no active conversation. The page does not create a conversation on every load; the first sent message creates the conversation. This avoids duplicate empty chats on refresh.

### UI components

In `features/chat/components/`:

- `chat-workspace.tsx`: client state and orchestration for active conversation, message list, conversation list, selection, sending, and errors.
- `chat-sidebar.tsx`: conversation history list, new conversation action, collapse and resize behavior.
- `chat-messages.tsx`: message list and loading state.
- `chat-message.tsx`: individual message presentation.
- `chat-input.tsx`: input composer and send action.
- `chat-header.tsx`: chat header.

The repository list and selection UI live in `features/index/components/`. Selecting a completed repository navigates to `/repositories/<internal-repository-id>/chat`.

### Actions and services

- `features/chat/actions/chat.ts`: server actions for listing/creating conversations, loading messages, ownership verification, and sending messages.
- `features/chat/services/conversations.ts`: conversation DB queries and creation.
- `features/chat/services/messages.ts`: fetches messages in ascending creation order and saves user/assistant messages.
- `features/chat/services/chat.ts`: chat orchestration, title generation, message persistence, and call to `ChatRepo()`.
- `features/chat/services/verify-repo-ownership.ts`: checks repository ownership.
- `features/chat/types/chat.ts`: frontend message and conversation types.

### Conversation titles

The initial conversation title is `New Chat`. The service creates a title from the first user message by trimming whitespace and truncating it to approximately 40 characters.

**Checked-in title bug:** The current service reads the title before updating it and later returns the previously selected title. The DB can be updated while the action still returns `New Chat`. Return the updated value from `updateConversationTitle()` when the first message is processed.

---

## Current RAG implementation

The checked-in orchestration is `features/retrival/services/chat.ts`.

```text
ChatRepo(repoId, query)
       |
       v
retrieveCode(repoId, query)
       |
       v
buildPrompt(query, codeChunks)
       |
       v
generateResponse(systemMessage, userMessage)
       |
       v
Text response
```

### Prompt construction

`features/retrival/services/build-prompt.ts` creates a system instruction for a repository-aware software engineering assistant and a user prompt containing the latest question plus retrieved code chunks.

The current checked-in prompt encourages file path and line-range references when possible and requests grounded explanations.

### Response generation

`features/retrival/services/generate-response.ts` calls Vercel AI SDK's `generateText()` using the model from `lib/llm.ts`, a system prompt, and a single user prompt.

`lib/llm.ts` currently configures:

```ts
google("gemini-3.6-flash")
```

### Conversation-history improvements discussed but not present on main

The following changes were discussed in the development conversation. They must be checked in the local working tree before treating them as committed:

- Fetch prior messages before saving the current user message.
- Keep recent history bounded (for example, the latest 12 messages) and chronological.
- Rewrite contextual follow-up questions into standalone retrieval queries.
- Keep the original user question separate from the rewritten Pinecone query.
- Pass previous turns to `generateText()` as role-based `messages`.
- Use conversation history, current user question, and retrieved chunks as separate inputs.
- Improve the system prompt to produce direct, natural explanations rather than report-style answers.
- Bypass Pinecone for greetings and simple pleasantries.

At the time of inspection, `ChatRepo` on GitHub main still accepts only `repoId` and `query`; no query-rewrite service was found in the checked-in retrieval service directory.

---

## Database schema

Database connection: `db/index.ts`

Drizzle config: `drizzle.config.ts`

### Authentication — `db/schema/auth-schema.ts`

Contains Better Auth's user, session, account, and verification schema.

### GitHub installation — `db/schema/gihub-installation.ts`

The `github_installation` table stores user ID, unique GitHub installation ID, account login, account type, and timestamps. The user ID is unique and references the auth user.

### Repository — `db/schema/repo-schema.ts`

The `repositorys` table stores the internal ID, user ID, GitHub repository ID, repository name/full name, owner, description, URL, default branch, visibility, stars, primary language, indexing status, last index time, indexed commit SHA, indexing error, and timestamps.

A composite unique index on `userId + repoId` prevents duplicate repository rows for the same user.

### Chat — `db/schema/chat.ts`

`chat_conversation_table` stores conversation ID, user ID, internal repository ID, title, and timestamps.

`chat_message_table` stores message ID, conversation ID, role, nullable content, and creation time.

Messages are queried in ascending creation order (oldest to newest). Therefore `history.slice(-12)` returns the latest 12 messages while preserving chronological order.

**Schema note:** The message role column is plain text in the inspected schema, not a PostgreSQL enum. Application code assumes only `user` and `assistant`, but the database itself does not currently enforce those values.

---

## Local setup

### Prerequisites

- Node.js compatible with the installed Next.js version.
- pnpm 11.3.0 (declared in `package.json`).
- PostgreSQL database (Neon can be used).
- GitHub OAuth App credentials.
- GitHub App ID and private key.
- Pinecone project and index.
- Google AI API key.
- Inngest account or the local Inngest dev server.

### Install dependencies

```bash
pnpm install
```

### Database migrations

Generate a migration:

```bash
pnpm db:generate
```

Apply migrations:

```bash
pnpm db:migrate
```

Open Drizzle Studio:

```bash
pnpm db:studio
```

### GitHub callbacks

The current repository README notes this OAuth callback for local configuration:

```text
http://localhost:3000/api/auth/callback/github
```

Verify the exact callback against the Better Auth version/configuration before deployment.

The GitHub App callback route in the code is:

```text
/api/github/callback
```

The install URL helper currently uses the GitHub App slug `repomind-github-app`. Configure the GitHub App's setup/callback URL accordingly.

---

## Environment configuration

Environment variable names directly referenced by the inspected source:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret |
| `GITHUB_App_ID` | GitHub App ID (exact capitalization used in code) |
| `PINECONE_API_KEY` | Pinecone API key |
| `PINECONE_INDEX_NAME` | Pinecone index name; defaults to `repo-chat` |

The GitHub App private key is currently read from a root-level file:

```text
github-app-private-key.pem
```

The Google AI SDK normally obtains its key from its standard provider environment configuration. The key name was not explicitly referenced in the inspected source; verify that `GOOGLE_GENERATIVE_AI_API_KEY` is set in local/deployment environments.

The inspected Inngest client only declares an app ID. Check deployment requirements for Inngest signing/event keys.

Do not commit `.env` files, private keys, database URLs, or provider tokens.

---

## Running locally

Start Next.js:

```bash
pnpm dev
```

Start Inngest in a second terminal:

```bash
pnpm dlx inngest-cli@latest dev
```

Open the application:

```text
http://localhost:3000
```

Useful scripts:

| Command | Purpose |
|---|---|
| `pnpm dev` | Start Next.js development server |
| `pnpm build` | Build the application |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:studio` | Open Drizzle Studio |

---

## Implementation status

This status is deliberately split between what was verified in GitHub main and what was discussed as local/in-progress work.

### Verified in inspected GitHub main

- [x] Next.js App Router structure and theme provider.
- [x] Better Auth configured with GitHub OAuth.
- [x] Session lookup, sign-in, sign-out, and route protection helpers.
- [x] GitHub App client, install URL, callback, persistence, and uninstall helpers.
- [x] Repository metadata fetch and DB upsert.
- [x] Duplicate repository protection through a composite unique index.
- [x] Inngest repository indexing function.
- [x] Recursive repository Git tree fetch.
- [x] File filtering by directories, extension, and size.
- [x] Git blob content fetch.
- [x] Tree-sitter WASM chunk generation.
- [x] Pinecone batch upsert with chunk metadata.
- [x] Repository indexing status and error persistence.
- [x] Code Workspace and repository cards.
- [x] Repository-specific chat route.
- [x] Chat UI (sidebar, messages, input, workspace).
- [x] Conversation and message DB persistence.
- [x] Single-turn RAG retrieval and response generation.

### Discussed in development; not verified in GitHub main

- [ ] History-aware chat orchestration.
- [ ] Query rewriting for contextual follow-up questions.
- [ ] Role-based conversation messages passed to the AI SDK.
- [ ] Updated natural/conversational system prompt.
- [ ] Greeting/pleasantry routing that skips Pinecone.
- [ ] Fix returning the updated conversation title to the client.

### Not verified or still needs work

- [ ] Reconcile add-repository UI and API route/method mismatch.
- [ ] Validate actual chunking output and semantic quality.
- [ ] Diagnose retrieval relevance and score distribution.
- [ ] Re-index cleanup for obsolete Pinecone chunks.
- [ ] Confirm full PR review backend and UI; it was not verified in the inspected tree.
- [ ] Dashboard overview and settings completeness.
- [ ] Production environment/deployment validation.
- [ ] Automated tests and CI coverage.

---

## Known issues and investigation notes

### 1. Add repository UI/API mismatch

The checked-in add-repository page sends JSON with POST to `/api/repositories`. The checked-in server handler is `/api/github/repos` and accepts GET with a query parameter. Confirm whether your local tree has an updated route. If not, update the form and API together.

### 2. Chat history is not part of the checked-in RAG request

The main-branch chat service calls `ChatRepo({ repoId, query })` without loading history. The RAG service searches using the latest raw query only. This makes follow-up questions difficult to resolve.

### 3. Conversation title can be stale in the action response

The DB title is fetched before the first-message update and that old selected value is returned. Return the title generated by `updateConversationTitle()` instead.

### 4. Retrieval has no relevance threshold

The retrieval implementation returns up to five results but does not reject weak matches. A low-quality result can be passed to the model even if it is unrelated.

### 5. Re-indexing can leave stale Pinecone documents

Chunk IDs include content and line range. When a file changes, its new chunk gets a new ID. The current indexing function upserts new chunks but does not visibly delete old chunks for that repository. Old code may remain searchable after re-indexing. Design a repository-scoped cleanup or versioning strategy.

### 6. GitHub App state is not validated

The installation URL puts the user ID directly in state, but the callback does not verify it. Use a secure, expiring, one-time state mechanism before production.

### 7. Root metadata remains scaffold text

The inspected `app/layout.tsx` still sets title to `Create Next App` and description to `Generated by create next app`. Update these before deployment.

---

## Next tasks

Resume with these tasks in order. The first two are the immediate continuation point.

### Task 1 — Finish conversational query handling

Goal: make chat feel like an ongoing engineering conversation.

1. Compare the local working tree with GitHub main; confirm which conversation-history changes are already implemented.
2. Fetch existing message history **before** saving the current user message, so the latest query is not duplicated in history.
3. Keep history chronological (oldest to newest) and bounded to a recent window initially.
4. Rewrite contextual follow-up questions into standalone retrieval queries.
5. Keep the original query separate from the rewritten retrieval query.
6. Pass history to the LLM through role-based `messages`, not by concatenating the history into one text prompt.
7. Add a lightweight path for greetings/thanks that bypasses Pinecone while preserving chat history.
8. Ensure technical follow-ups continue through query rewriting and retrieval.

Files involved:

- `features/chat/services/chat.ts`
- `features/chat/services/messages.ts`
- `features/retrival/services/chat.ts`
- `features/retrival/services/rewrite-query.ts` (not found in inspected main)
- `features/retrival/services/build-prompt.ts`
- `features/retrival/services/generate-response.ts`

Avoid a separate LLM intent-classification call unless testing proves a simple routing approach insufficient.

### Task 2 — Analyze chunking

Start with:

- `features/repo/services/chunk-code.ts`
- `features/repo/services/filter-repo-files.ts`
- `features/inngest/functions.ts`

Run the chunker against representative files from the project itself. Log chunk counts, sizes, line ranges, language detection, and parser metadata. Verify that important files are included and that functions/classes are grouped sensibly. Do not change the chunking algorithm until the output has been inspected.

### Task 3 — Analyze retrieval quality

Start with:

- `features/repo/services/vectors.ts`
- `features/retrival/services/retrieve.ts`
- `features/retrival/services/rewrite-query.ts` (once committed)

For each test question log:

- Original query.
- Rewritten retrieval query.
- Retrieved file paths.
- Scores.
- Start/end lines.
- Short content previews.

Then identify whether the issue is chunk generation, indexing, embedding configuration, query formulation, filtering, or ranking. Do not assume chunking is at fault before seeing the data.

### Task 4 — Fix and test repository import

Reconcile the form endpoint/method with the API route. Test valid URLs, invalid URLs, an uninstalled GitHub App, a private repository, duplicate repository import, and indexing failure.

### Task 5 — Implement safe re-index lifecycle

Plan how old Pinecone records should be removed or superseded when a repository is re-indexed. Ensure the UI/database does not report a complete index while only part of the index is available.

### Task 6 — Continue product work

Review the dashboard overview, settings, and PR review UI/backend against the current local tree. Do not assume the PR review workflow is complete just because Inngest is integrated.

---

## Important files reference

| Concern | File |
|---|---|
| Root layout and theme | `app/layout.tsx` |
| Auth configuration | `lib/auth.ts` |
| Auth server actions | `features/auth/actions/index.ts` |
| Auth proxy | `features/auth/utils/auth-proxy.ts`, `proxy.ts` |
| GitHub App client | `lib/github-app.ts` |
| GitHub installation URL | `lib/github-install-url.ts` |
| GitHub App callback | `app/api/github/callback/route.ts` |
| GitHub connection services | `features/github/server/` |
| Repository import API | `app/api/github/repos/route.ts` |
| Fetch repository metadata | `features/repo/services/fetch-repo-metadata.ts` |
| Save repository metadata | `features/repo/db/save-repo-metadata.ts` |
| Fetch Git tree | `features/repo/services/fetch-repo-tree.ts` |
| Filter repository files | `features/repo/services/filter-repo-files.ts` |
| Fetch file blobs | `features/repo/services/fetch-file-contents.ts` |
| Chunk source code | `features/repo/services/chunk-code.ts` |
| Pinecone upsert | `features/repo/services/vectors.ts` |
| Inngest indexing function | `features/inngest/functions.ts` |
| Inngest API route | `app/api/inngest/route.ts` |
| Pinecone client | `lib/pinecone/client.ts` |
| LLM model | `lib/llm.ts` |
| Pinecone retrieval | `features/retrival/services/retrieve.ts` |
| RAG orchestration | `features/retrival/services/chat.ts` |
| Prompt builder | `features/retrival/services/build-prompt.ts` |
| LLM response generation | `features/retrival/services/generate-response.ts` |
| Chat page | `app/(protected)/(chat)/repositories/[repoId]/chat/page.tsx` |
| Chat workspace state | `features/chat/components/chat-workspace.tsx` |
| Chat sidebar | `features/chat/components/chat-sidebar.tsx` |
| Chat input | `features/chat/components/chat-input.tsx` |
| Chat server actions | `features/chat/actions/chat.ts` |
| Chat orchestration/title | `features/chat/services/chat.ts` |
| Conversation DB operations | `features/chat/services/conversations.ts` |
| Message DB operations | `features/chat/services/messages.ts` |
| Repository ownership check | `features/chat/services/verify-repo-ownership.ts` |
| Database connection | `db/index.ts` |
| Database schemas | `db/schema/` |
| Drizzle configuration | `drizzle.config.ts` |

---

## When returning to the project

1. Pull the latest `main` branch.
2. Check whether your uncommitted conversational-query work is still in the local working tree.
3. Read **Implementation status**, **Known issues**, and **Next tasks**.
4. Test the chat pipeline before changing retrieval or chunking.
5. Inspect actual Tree-sitter output and Pinecone matches before deciding what to rewrite.
6. Update this README whenever a feature or architecture changes.

**Most important reminder:** Do not assume chunking is broken until you inspect the generated chunks, the indexed documents, the rewritten retrieval query, and Pinecone's returned scores. The failure could be in chunk construction, filtering, embeddings, query rewriting, or ranking.
