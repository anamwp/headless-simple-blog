# Headless Simple Blog

A modern headless blog built with [Next.js](https://nextjs.org) 16, [React](https://react.dev) 19, and [TailwindCSS](https://tailwindcss.com). This application decouples the frontend from the backend, allowing you to manage content via a headless CMS while displaying it through a fast, responsive Next.js interface.

## Features

- **Headless Architecture**: Separates content management from presentation
- **Server-Side Rendering**: Fast page loads with Next.js SSR capabilities
- **Responsive Design**: Built with TailwindCSS for mobile-first styling
- **User Authentication**: Login and user management support
- **Comments System**: Interactive comment functionality
- **Category & Tag Support**: Organize posts by categories and tags
- **Dynamic Routing**: URL-based post, category, and tag pages

## Project Structure

```
headless-simple-blog/
├── components/                # Reusable React components
│   ├── ArchiveTemplate.js     # Shared layout for category and tag archives
│   ├── CommentForm.js
│   ├── CommentThread.js
│   ├── CurrentUser.js         # Fetches the logged-in WordPress user
│   ├── DashboardLayout.js
│   ├── Footer.js
│   ├── Header.js
│   ├── Layout.js
│   └── WPMenu.js              # WordPress menu
├── docker/
│   └── wordpress/
│       ├── mu-plugins/        # Optional must-use plugins, mounted into WordPress
│       ├── plugins/           # Mounted as wp-content/plugins, filled by setup.sh (git-ignored)
│       └── setup.sh           # Installs WordPress, plugins and demo content
├── lib/                       # Data fetching and helpers
│   ├── api.js                 # WordPress REST API calls
│   ├── content.js             # Table of contents from post headings
│   ├── engagement.js          # Saved posts and comment upvotes (browser storage)
│   ├── format.js              # Dates, reading time, text helpers
│   ├── httpClient.js          # HTTP client with retries
│   ├── sanitize.js            # Sanitizes WordPress HTML
│   ├── useAuth.js             # Reads the login cookie
│   ├── useCurrentUser.js      # Login cookie plus the full user record
│   └── wp.js                  # Helpers for embedded REST data
├── pages/                     # Routes (Next.js Pages Router)
│   ├── category/              # Category index and archive
│   ├── dashboard/             # Logged-in area: overview, posts, comments, saved, profile
│   ├── posts/[slug].js        # Single post with comments
│   ├── tag/                   # Tag index and archive
│   ├── _app.js
│   ├── 404.js
│   ├── index.js               # Home: latest posts
│   ├── login.js               # JWT login
│   └── search.js              # Search
├── public/                    # Static assets
├── styles/
│   ├── blog.css
│   ├── globals.css
│   └── modernist.css
├── .dockerignore              # Keeps env files and build output out of the image
├── .env                       # JWT secret for Docker Compose (git-ignored, you create it)
├── .env.docker                # Frontend env for Docker (git-ignored, you create it)
├── .gitignore
├── compose.yaml               # Local stack: MySQL, WordPress, WP-CLI, frontend
├── Dockerfile                 # Production image for the frontend
├── eslint.config.mjs
├── next.config.ts             # Next.js config (standalone output, image hosts)
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your blog.

### Build & Production

Build for production:

```bash
npm run build
npm start
```

## Docker

Run the whole stack locally with one tool: MySQL, WordPress (with demo posts), and the Next.js frontend. No local PHP, MySQL, or Node install is needed.

| Service | Image | URL | Purpose |
| --- | --- | --- | --- |
| `db` | `mysql:8.4` | internal only | WordPress database |
| `wordpress` | `wordpress:php8.3-apache` | http://wp.localhost:8090 | Headless CMS and REST API |
| `wpcli` | `wordpress:cli` | – | One-off WP-CLI commands (profile `tools`) |
| `frontend` | `node:22-alpine` | http://localhost:3000 | `next dev` with hot reload |
| `frontend-prod` | built from `Dockerfile` | http://localhost:3002 | Production image (profile `prod`) |

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) with Compose v2
- Git

Developed and tested with Docker Desktop on macOS (Apple Silicon).

### 1. Clone

```bash
git clone -b docker https://github.com/anamwp/headless-simple-blog.git
cd headless-simple-blog
```

### 2. Create the env files

Both files are git-ignored and never copied into an image.

`.env` is read by Docker Compose and holds the JWT signing key for WordPress:

```bash
echo "JWT_AUTH_SECRET_KEY=$(openssl rand -hex 32)" > .env
```

`.env.docker` is read by the frontend containers:

```bash
cat > .env.docker <<'EOF'
SITE_DOMAIN=wp.localhost
NEXT_PUBLIC_API_SITE_URL=http://wp.localhost:8090
NEXT_PUBLIC_API_URL=http://wp.localhost:8090/wp-json/wp/v2
NEXT_PUBLIC_API_URL_JWT=http://wp.localhost:8090/wp-json
NEXT_PUBLIC_API_FOR_JWT_TOKEN=http://wp.localhost:8090/wp-json/jwt-auth/v1/token
NEXT_PUBLIC_POSTS_PER_PAGE=9
ALLOW_LOCAL_IMAGE_IP=true
EOF
```

### 3. Start WordPress and load demo content

```bash
docker compose up -d db wordpress
docker compose run --rm wpcli sh /setup.sh
```

`setup.sh` is safe to run again. It:

- installs WordPress at `http://wp.localhost:8090` (login `admin` / `admin`)
- enables pretty permalinks so `/wp-json/` works
- installs and activates [JWT Authentication for WP REST API](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/)
- makes Apache pass the `Authorization` header to PHP
- downloads the latest [wp-cli-post-importer](https://github.com/anamwp/wp-cli-post-importer) from GitHub (re-run `setup.sh` any time to update it)
- imports demo posts with featured images (skipped when 5 or more posts exist)
- flushes permalinks, the same as saving Settings → Permalinks in wp-admin

### 4. Start the frontend

```bash
docker compose up -d frontend
docker compose logs -f frontend   # first start runs npm ci, wait for "Ready"
```

Open http://localhost:3000. WordPress admin is at http://wp.localhost:8090/wp-admin.

### Daily commands

```bash
docker compose up -d        # start db, wordpress, frontend
docker compose stop         # stop, keep all data
docker compose down         # remove containers, keep data
docker compose down -v      # remove everything, including the database
```

After editing `.env.docker`, recreate the frontend so it reads the new values:

```bash
docker compose up -d --force-recreate frontend
```

### Demo content

```bash
docker compose run --rm wpcli wp start import-posts       # first batch
docker compose run --rm wpcli wp start import-all-posts   # everything
docker compose run --rm wpcli wp start delete-posts       # remove the first batch
docker compose run --rm wpcli wp start delete-all-posts   # remove everything imported
```

Any other WP-CLI command works the same way, for example `docker compose run --rm wpcli wp plugin list`.

### Production image

`Dockerfile` is a three-stage build (`deps` → `build` → `runtime`) that uses Next.js `output: 'standalone'` and runs as the non-root `node` user. WordPress must be running during the build because static pages are generated from the REST API.

```bash
docker compose up -d db wordpress
docker compose --profile prod build frontend-prod
docker compose --profile prod up -d frontend-prod
```

Open http://localhost:3002. It can run next to the dev server on port 3000.

`frontend-prod` is in the `prod` profile, so plain `docker compose stop` and `docker compose down` skip it. Include the profile to stop everything:

```bash
docker compose --profile prod stop
docker compose --profile prod down
```

Things to know:

- `.env.docker` reaches the build as a BuildKit secret, so its values are not stored in any image layer.
- `NEXT_PUBLIC_*` values are baked in at build time. Docker does not detect changes inside a secret, so after editing `.env.docker` rebuild with `--no-cache`:

  ```bash
  docker compose --profile prod build --no-cache frontend-prod
  docker compose --profile prod up -d frontend-prod
  ```

- `ALLOW_LOCAL_IMAGE_IP=true` lets the Next.js image optimizer fetch images from WordPress on a private address. It is only for this local setup. Leave it unset on real deployments.

### How the networking works

The browser and the Next.js server both call WordPress at `http://wp.localhost:8090`:

- In the browser, `*.localhost` resolves to your machine (Chrome and Firefox do this automatically).
- Inside the frontend containers, `extra_hosts` maps `wp.localhost` to the Docker host.

Safari does not resolve `*.localhost`. Add it once:

```bash
echo "127.0.0.1 wp.localhost" | sudo tee -a /etc/hosts
```

### Troubleshooting

| Symptom | Fix |
| --- | --- |
| `Error: 'start' is not a registered wp command` | The importer plugin did not download. Check your internet connection and run `setup.sh` again. |
| `jwt_auth_bad_config` on login | `JWT_AUTH_SECRET_KEY` is missing from `.env`. Add it, then `docker compose up -d --force-recreate wordpress`. |
| Dashboard returns 403 | The browser holds a login token from another WordPress or an old secret. Log out (or delete the `user_data` cookie) and log in again. |
| Images missing on port 3002 only | Check `ALLOW_LOCAL_IMAGE_IP=true` is in `.env.docker`, then rebuild with `--no-cache`. |
| `port is already allocated` / `address already in use` | Another process uses 3000, 3002 or 8090. Stop it, or change the left side of the port mapping in `compose.yaml`. |
| Frontend shows no posts | Check WordPress answers: `curl http://wp.localhost:8090/wp-json/wp/v2/posts?per_page=1`. |

## Technologies

- **Framework**: [Next.js 16](https://nextjs.org)
- **UI Library**: [React 19](https://react.dev)
- **Styling**: [TailwindCSS 4](https://tailwindcss.com)
- **HTTP Client**: [Axios](https://axios-http.com)
- **Linting**: [ESLint 10](https://eslint.org)
- **Language**: [TypeScript 5](https://www.typescriptlang.org)

## Configuration

- **TypeScript Config**: `tsconfig.json`
- **Next.js Config**: `next.config.ts`
- **TailwindCSS Config**: `tailwind.config.js`
- **PostCSS Config**: `postcss.config.js`

## Deployment

Deploy on [Vercel](https://vercel.com) for the best experience with Next.js:

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Deploy with a single click

For other hosting options, check the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
