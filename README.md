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
├── .env                       # Setup B: JWT secret for Docker Compose (git-ignored, you create it)
├── .env.docker                # Setup B: frontend env for Docker (git-ignored, you create it)
├── .env.local                 # Setup A: frontend env without Docker (git-ignored, you create it)
├── .gitignore
├── compose.yaml               # Setup B: MySQL, WordPress, WP-CLI, frontend
├── Dockerfile                 # Setup B: production image for the frontend
├── eslint.config.mjs
├── next.config.ts             # Next.js config (image hosts, standalone output for Docker)
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.js
└── tsconfig.json
```

## Getting Started

There are two separate ways to run this project on your machine. Pick one, and run only one at a time.

| | Setup A: Local (without Docker) | Setup B: Docker |
| --- | --- | --- |
| WordPress | Your own site, for example Local by Flywheel | A container at http://wp.localhost:8090 |
| Frontend | `npm` on your machine | Containers |
| Frontend URL | http://localhost:3000 | http://localhost:3000 (dev) and http://localhost:3002 (production image) |
| Env files | `.env.local` | `.env` and `.env.docker` |
| You install | Node.js and a WordPress site | Docker Desktop only |
| Demo content | Whatever is in your WordPress | Imported automatically |
| Good for | Daily work against your own WordPress | A complete, repeatable stack and testing the production image |

### Run one setup at a time

Both setups serve the frontend on port 3000, and each one talks to a different WordPress.

- **Before Setup A**, stop Docker:

  ```bash
  docker compose --profile prod stop
  ```

- **Before Setup B**, stop the local server: press Ctrl+C in the terminal running `npm run dev` or `npm start`.
- **After switching**, log out and log in again in the frontend. A login from one WordPress is not valid on the other.

### Which command belongs to which setup

| Command | Setup | Reads | Talks to |
| --- | --- | --- | --- |
| `npm run dev` | A | `.env.local` | Your own WordPress |
| `npm run build`, `npm start` | A | `.env.local` | Your own WordPress |
| `docker compose up -d` | B | `.env`, `.env.docker` | Docker WordPress |
| `docker compose --profile prod up -d frontend-prod` | B | `.env`, `.env.docker` | Docker WordPress |

### Environment files

All three files are git-ignored. Create only the ones your setup needs.

| File | Read by | Setup | Holds |
| --- | --- | --- | --- |
| `.env.local` | Next.js on your machine | A | Addresses of your own WordPress |
| `.env` | Docker Compose | B | `JWT_AUTH_SECRET_KEY` for the WordPress container |
| `.env.docker` | The frontend containers | B | Addresses of the Docker WordPress |

- `npm` commands on your machine never read `.env.docker`.
- Keep only `JWT_AUTH_SECRET_KEY` in `.env`. Next.js also reads `.env`, so frontend variables placed there would leak into Setup A.
- Inside the Docker dev container, values from `.env.docker` always win over `.env.local`.

The frontend variables are the same in `.env.local` and `.env.docker`; only the addresses differ.

| Variable | What it is |
| --- | --- |
| `SITE_DOMAIN` | WordPress hostname without `http://`. Images are allowed from this host. |
| `NEXT_PUBLIC_API_SITE_URL` | WordPress base URL |
| `NEXT_PUBLIC_API_URL` | REST API base, ending in `/wp-json/wp/v2` |
| `NEXT_PUBLIC_API_URL_JWT` | REST API root, ending in `/wp-json` |
| `NEXT_PUBLIC_API_FOR_JWT_TOKEN` | JWT login endpoint, ending in `/wp-json/jwt-auth/v1/token` |
| `NEXT_PUBLIC_POSTS_PER_PAGE` | Posts per page |
| `ALLOW_LOCAL_IMAGE_IP` | `true` lets production mode optimize images from a WordPress on a private address. Local use only. |

## Setup A: Local development (without Docker)

### What you need

- Node.js 20.9 or newer, with npm
- A WordPress site your machine can reach (Local by Flywheel, MAMP, a staging site) with:
  - permalinks set to "Post name" (Settings → Permalinks)
  - [JWT Authentication for WP REST API](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/) installed and active
  - these two lines in `wp-config.php`:

    ```php
    define( 'JWT_AUTH_SECRET_KEY', 'a-long-random-string' );
    define( 'JWT_AUTH_CORS_ENABLE', true );
    ```

  - a few published posts with featured images. [wp-cli-post-importer](https://github.com/anamwp/wp-cli-post-importer) can create them with `wp start import-posts`.

On Apache, the `Authorization` header also has to reach PHP. The JWT plugin's installation notes show the `.htaccess` line for that.

### 1. Install

```bash
git clone https://github.com/anamwp/headless-simple-blog.git
cd headless-simple-blog
npm install
```

### 2. Create `.env.local`

Replace `your-site.local` with the address of your WordPress, and `http` with `https` if your site uses it.

```bash
SITE_DOMAIN=your-site.local
NEXT_PUBLIC_API_SITE_URL=http://your-site.local
NEXT_PUBLIC_API_URL=http://your-site.local/wp-json/wp/v2
NEXT_PUBLIC_API_URL_JWT=http://your-site.local/wp-json
NEXT_PUBLIC_API_FOR_JWT_TOKEN=http://your-site.local/wp-json/jwt-auth/v1/token
NEXT_PUBLIC_POSTS_PER_PAGE=9
```

`.env` and `.env.docker` are not used in this setup.

### 3. Run

Start your WordPress site, then:

```bash
docker compose --profile prod stop   # only if the Docker setup is running
npm run dev
```

Open http://localhost:3000.

### Production mode on your machine (optional)

```bash
npm run build
npm start
```

WordPress must be running during the build, because pages are generated from the REST API.

Production mode optimizes images on the server. That adds two requirements when WordPress runs on your own machine:

- Add `ALLOW_LOCAL_IMAGE_IP=true` to `.env.local` and build again. Without it, Next.js refuses image hosts on a private address.
- If WordPress uses a self-signed HTTPS certificate (Local by Flywheel does), tell Node to trust it when you start the server. Local by Flywheel usually keeps the certificate here:

  ```bash
  NODE_EXTRA_CA_CERTS="$HOME/Library/Application Support/Local/run/router/nginx/certs/your-site.local.crt" npm start
  ```

Neither is needed for `npm run dev`, because dev mode does not optimize images.

## Setup B: Docker

Run the whole stack with one tool: MySQL, WordPress (with demo posts), and the Next.js frontend. No local PHP, MySQL, or Node install is needed.

| Service | Image | URL | Purpose |
| --- | --- | --- | --- |
| `db` | `mysql:8.4` | internal only | WordPress database |
| `wordpress` | `wordpress:php8.3-apache` | http://wp.localhost:8090 | Headless CMS and REST API |
| `wpcli` | `wordpress:cli` | – | One-off WP-CLI commands (profile `tools`) |
| `frontend` | `node:22-alpine` | http://localhost:3000 | `next dev` with hot reload |
| `frontend-prod` | built from `Dockerfile` | http://localhost:3002 | Production image (profile `prod`) |

### What you need

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) with Compose v2
- Git

Developed and tested with Docker Desktop on macOS (Apple Silicon).

Stop any `npm run dev` or `npm start` running on your machine first. It holds port 3000, which the Docker frontend needs.

### 1. Clone

```bash
git clone https://github.com/anamwp/headless-simple-blog.git
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

`.env.local` is not needed for this setup.

### 3. Start WordPress and load demo content

```bash
docker compose up -d db wordpress
docker compose run --rm wpcli sh /setup.sh
```

`setup.sh` is safe to run again. It:

- installs WordPress at `http://wp.localhost:8090` (login `admin` / `admin`)
- enables pretty permalinks so `/wp-json/` works
- installs and activates [JWT Authentication for WP REST API](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/)
- downloads the latest [wp-cli-post-importer](https://github.com/anamwp/wp-cli-post-importer) from GitHub (re-run `setup.sh` any time to update it)
- makes Apache pass the `Authorization` header to PHP
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

### Guest comments (optional)

WordPress only accepts REST comments from logged-in users by default. To let guests comment, create `docker/wordpress/mu-plugins/allow-guest-comments.php`:

```php
<?php
add_filter( 'rest_allow_anonymous_comments', '__return_true' );
```

The folder is mounted into WordPress, so the file is active right away.

### Production image

`Dockerfile` is a three-stage build (`deps` → `build` → `runtime`) that runs as the non-root `node` user. It sets `BUILD_STANDALONE=true`, which switches `next.config.ts` to Next.js standalone output. Outside Docker that variable is unset, so `npm run build` and hosted builds are unaffected.

WordPress must be running during the build, because static pages are generated from the REST API.

```bash
docker compose up -d db wordpress
docker compose --profile prod build frontend-prod
docker compose --profile prod up -d frontend-prod
```

Open http://localhost:3002. It can run next to the dev container on port 3000.

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

- `ALLOW_LOCAL_IMAGE_IP=true` lets the Next.js image optimizer fetch images from WordPress on a private address. It is only for local use. Leave it unset on real deployments.

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
| `port is already allocated` / `address already in use` | Another process uses 3000, 3002 or 8090, most often a local `npm run dev` from Setup A. Stop it, or change the left side of the port mapping in `compose.yaml`. |
| Dashboard returns 403 | The browser holds a login from the other setup or an old secret. Log out (or delete the `user_data` cookie) and log in again. |
| `npm run build` fails while building `frontend-prod` | WordPress was not running during the build. Run `docker compose up -d db wordpress` first, then build again. |
| Images missing on port 3002 only | Check `ALLOW_LOCAL_IMAGE_IP=true` is in `.env.docker`, then rebuild with `--no-cache`. |
| `jwt_auth_bad_config` on login | `JWT_AUTH_SECRET_KEY` is missing from `.env`. Add it, then `docker compose up -d --force-recreate wordpress`. |
| `Error: 'start' is not a registered wp command` | The importer plugin did not download. Check your internet connection and run `setup.sh` again. |
| Frontend shows no posts | Check WordPress answers: `curl http://wp.localhost:8090/wp-json/wp/v2/posts?per_page=1`. |
| `frontend-prod` still running after `docker compose stop` | Add the profile: `docker compose --profile prod stop`. |

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
3. Add the frontend variables from the [Environment files](#environment-files) table in the Vercel project settings, pointing at a WordPress that is reachable from the internet. Do not set `ALLOW_LOCAL_IMAGE_IP` or `BUILD_STANDALONE` there.
4. Deploy

For other hosting options, check the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
