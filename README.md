# CloudNest — Cloud Storage & File Management

**Your files. One secure workspace.**

CloudNest is a modern cloud storage and file management platform that gives users one organized workspace to upload, store, browse, preview, organize, and share their files. It combines a focused dashboard with dedicated views for different file types, folder management, sharing, and storage analytics.

> **Project status:** Completed portfolio project. The description below represents the intended completed feature set. Replace the screenshot paths, live-demo URL, and any environment-specific commands with the values from your repository before publishing.

<!-- Replace these paths with screenshots committed to your repository. -->
<p align="center">
  <img src="docs/screenshots/dashboard.png" alt="CloudNest dashboard" width="100%" />
</p>

<p align="center">
  <a href="#features">Features</a> ·
  <a href="#technology-stack">Tech Stack</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#getting-started">Getting Started</a> ·
  <a href="#security">Security</a>
</p>

---

## Overview

CloudNest is designed around a simple idea: file storage should be easy to understand and efficient to use. Instead of treating every file as an isolated upload, CloudNest brings files, folders, categories, shared resources, and storage usage together in one consistent workspace.

The application separates **file metadata** from **file contents**:

- **Neon PostgreSQL** stores structured application data such as file metadata, folder relationships, ownership, sharing permissions, and activity records.
- **Neon Object Storage** stores the actual file objects through its S3-compatible API.

This separation keeps relational data queryable while allowing binary files to live in object storage.

## Features

### Dashboard and workspace

- A centralized dashboard with a concise overview of the user's workspace.
- Quick access to frequently used folders and files.
- Recent files, starred resources, shared resources, and recent activity summaries.
- Direct navigation to each file category.
- Global search and common file actions from the workspace.

### File and folder management

- Upload and download files.
- Create, rename, move, and organize folders.
- Rename and move files.
- Grid and list views where appropriate.
- Multi-select and bulk actions.
- File details such as name, type, size, owner, and timestamps.
- Breadcrumb navigation for nested folders.

### Dedicated file libraries

CloudNest provides focused views for:

- **Images** — browse image files in a visual gallery and preview supported formats.
- **Videos** — organize video files and preview browser-supported media.
- **Audio** — browse audio files and use the audio playback interface.
- **Documents** — manage documents and preview supported formats such as PDF.
- **Archives** — organize compressed files such as ZIP and other supported archive formats.
- **Other files** — access file types that do not belong to the primary categories.

### Search and organization

- Search files and folders by name.
- Filter by file category or supported metadata.
- Sort by name, size, type, creation date, or modification date.
- Paginated file listing for larger collections.
- Star and unstar files or folders.
- Access recently opened, uploaded, or modified resources.

### Sharing and collaboration

- Share files and folders with other users.
- Distinguish between resources shared with the current user and resources shared by the current user.
- Support permission levels such as Viewer and Editor.
- Review and manage sharing access.
- Revoke access when the current user has the required ownership or permission.

### Trash and recovery

- Move items to Trash instead of immediately removing them.
- Restore deleted items when they are still recoverable.
- Permanently delete items and their corresponding stored objects.
- Handle folder deletion and nested resources consistently.

### Storage analytics

- Display total storage used and configured capacity.
- Show remaining storage and overall usage percentage.
- Break down storage consumption by file category.
- Display category-specific progress indicators.
- Summarize file and folder counts.
- Calculate usage from stored file metadata and reconcile it with object storage where required by the implementation.

### Account and experience

- User profile and account settings.
- Authentication-protected workspace access.
- Light, dark, and system appearance modes.
- Responsive layouts for desktop, tablet, and mobile screens.
- Loading, empty, success, and error states throughout the application.

---

## Technology Stack

| Area | Technology | Responsibility |
|---|---|---|
| Web application | Next.js | Application framework, routing, and server-side capabilities |
| UI | React | Component-based user interface |
| Language | TypeScript | Static typing and maintainable application code |
| Relational database | Neon PostgreSQL | Users, metadata, folders, sharing, and application records |
| Object storage | Neon Object Storage | Binary file storage through an S3-compatible API |
| Theme management | next-themes | Light, dark, and system appearance preferences |

The project uses the existing dependencies and conventions defined in its package manifest. Refer to `package.json` for the exact versions and any additional libraries used by the implementation.

## Architecture

CloudNest keeps application metadata and binary file content in separate storage systems.

```text
                       CloudNest
                           |
              +------------+------------+
              |                         |
          Web Client              Next.js Server
              |                         |
              |                Authentication & Authorization
              |                         |
              |                  Application Services
              |                    /          \
              |                   /            \
              |          Neon PostgreSQL   Neon Object Storage
              |          (metadata/data)    (file contents)
              |                   \            /
              +--------------------\----------/
                                   |
                            Response to client
```

### Data responsibilities

**Neon PostgreSQL** is responsible for relational and searchable application data, for example:

- File records and metadata.
- Folder records and parent-child relationships.
- Ownership and user references.
- Sharing records and permissions.
- Favorites and activity records.
- Storage quota and accounting metadata, where configured.

**Neon Object Storage** is responsible for the actual objects, for example:

- Images, videos, audio, documents, archives, and other uploaded files.
- Object keys referenced by file metadata in PostgreSQL.

The database stores an object key or storage reference rather than the file's binary contents.

### Example object-key organization

A logical key convention can group objects by owner and category:

```text
storage/
└── users/
    └── <user-id>/
        ├── images/
        ├── videos/
        ├── audio/
        ├── documents/
        ├── archives/
        └── other/
```

This is an example naming convention. The actual object key format is determined by the application's storage service.

### Typical upload lifecycle

1. The user selects a file in the application.
2. The server authenticates the user and validates the requested operation.
3. The application validates file metadata and configured size/type restrictions.
4. The file content is transferred to Neon Object Storage using a server-controlled S3-compatible flow.
5. The application records the file metadata and object key in Neon PostgreSQL.
6. The UI refreshes the relevant file list and storage summary.
7. Failed or incomplete operations are handled so that database records and stored objects do not silently become inconsistent.

### Typical download lifecycle

1. The user requests a file.
2. The server checks ownership or a valid sharing permission.
3. The application obtains the file's object key from PostgreSQL.
4. The file is returned through an authorized server-side or time-limited access flow.

The browser must never receive long-lived storage credentials.

---

## Getting Started

### Prerequisites

Before running CloudNest locally, make sure you have:

- Node.js supported by the Next.js version used in this repository.
- npm, pnpm, yarn, or the package manager selected by the repository.
- A Neon project with a PostgreSQL database.
- Neon Object Storage enabled for the intended project branch.
- The required database and storage credentials.

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/cloudnest-cloud-storage.git
cd cloudnest-cloud-storage
```

### 2. Install dependencies

Use the package manager matching the lockfile in the repository. For npm:

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root. Add the variables required by the current implementation.

A typical Neon setup uses the following names:

```env
# Neon PostgreSQL
DATABASE_URL="your_neon_postgresql_connection_string"

# Neon Object Storage — S3-compatible connection
AWS_ENDPOINT_URL_S3="your_branch_storage_endpoint"
AWS_ACCESS_KEY_ID="your_storage_access_key_id"
AWS_SECRET_ACCESS_KEY="your_storage_secret_access_key"
AWS_REGION="your_storage_region"
```

Use the exact values and branch-specific endpoint provided by Neon for your project. Do not commit `.env.local` or expose any secret through a `NEXT_PUBLIC_` variable.

If the application uses additional environment variables for authentication, public application URLs, or bucket names, copy their exact names from the project's environment example or configuration. Do not invent variable names that are not used by the code.

### 4. Start the development server

For npm-based projects:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production build

```bash
npm run build
npm run start
```

Run the linting and type-checking scripts defined in `package.json` before deployment. Script names can differ between repositories.

---

## Neon Object Storage Configuration

CloudNest uses Neon Object Storage as its object store. Neon exposes an S3-compatible API, so an S3-compatible client can communicate with it using the branch endpoint and credentials created for the intended Neon branch.

Important implementation notes:

- Keep storage credentials on the server.
- Use credentials with only the required storage scopes.
- Keep user-uploaded content in private buckets unless public access is an intentional product requirement.
- Generate authorized, short-lived access URLs on the server when direct browser transfer is needed.
- For the AWS SDK for JavaScript with a custom Neon S3 endpoint, configure path-style addressing as required by Neon documentation.
- Use the endpoint and region associated with the correct Neon branch.

Official references:

- [Neon Object Storage — Get started](https://neon.com/docs/storage/get-started)
- [Neon Object Storage — Authentication](https://neon.com/docs/storage/authentication)
- [Neon Object Storage — Buckets](https://neon.com/docs/storage/buckets)

---

## Security

CloudNest is designed around server-side authorization and private file access.

Key security considerations include:

- Authenticate users before accessing private workspace resources.
- Verify file ownership or sharing permissions on every protected operation.
- Derive the acting user identity from the trusted server-side session, not from an untrusted client-supplied user ID.
- Validate file names, file sizes, and accepted content types.
- Treat client-provided MIME types and extensions as untrusted input.
- Keep Neon and Object Storage secrets out of browser bundles and source control.
- Use private buckets for private user content.
- Use short-lived signed access where appropriate.
- Avoid rendering untrusted HTML or other active content as trusted application content.
- Handle partial failures between object storage and database operations.
- Log operational errors without recording passwords, secret keys, or sensitive tokens.

Security settings and supported file restrictions should be aligned with the actual deployment configuration.

---

## Project Structure

The exact folder structure may evolve. The application should keep responsibilities separated by feature and layer. A conceptual organization is:

```text
cloudnest-cloud-storage/
├── app/ or src/app/          # Routes and application pages
├── components/               # Shared UI components
├── features/                 # Feature-oriented modules
│   ├── auth/
│   ├── files/
│   ├── folders/
│   ├── uploads/
│   ├── sharing/
│   ├── storage-analytics/
│   └── account/
├── lib/                      # Shared clients and utilities
│   ├── database/
│   ├── storage/
│   ├── auth/
│   └── validation/
├── services/                 # Application business logic, if organized separately
├── types/                    # Shared TypeScript types
├── public/                   # Static assets
├── docs/                     # Screenshots and project documentation
├── .env.example              # Environment variable names only
└── README.md
```

This is a conceptual guide, not a claim that every folder exists with these exact names in the repository. Follow the implementation's actual structure.

---

## Screenshots

Add screenshots of the real, completed application to the repository and update the paths below.

| Screen | Screenshot |
|---|---|
| Dashboard | `docs/screenshots/dashboard.png` |
| Images library | `docs/screenshots/images.png` |
| File management | `docs/screenshots/files.png` |
| Storage analytics | `docs/screenshots/storage-analytics.png` |
| Authentication | `docs/screenshots/authentication.png` |

<!-- Example:
<p align="center">
  <img src="docs/screenshots/images.png" alt="CloudNest image library" width="80%" />
</p>
-->

---

## Development Principles

CloudNest is organized around maintainable software engineering practices:

- Modular, feature-oriented code organization.
- Separation of presentation, application logic, and data access.
- Reusable components and services.
- Type-safe interfaces and validation.
- Server-side authorization for protected operations.
- Consistent error and loading-state handling.
- Explicit handling of storage/database consistency.
- Avoidance of duplicated business logic and unnecessary abstractions.

---

## Future Improvements

Possible areas for further development include:

- File version history.
- Resumable uploads for large files, where supported by the storage provider.
- Advanced collaborative workflows.
- Additional media preview formats.
- More detailed audit and activity history.
- Advanced storage lifecycle and retention policies.

---

## Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make focused changes with clear commit messages.
4. Run the available checks and tests.
5. Open a pull request describing the change.

For substantial changes, open an issue first to discuss the proposed approach.

---

## License

Choose and add a license before distributing this project. If no license file is present, all rights remain with the copyright holder by default.

---

## Author

**Your Name**

- GitHub: [@your-username](https://github.com/your-username)
- Portfolio: [your-portfolio-url](https://example.com)

---

<p align="center">
  <strong>CloudNest</strong><br />
  Your files. One secure workspace.
</p>
