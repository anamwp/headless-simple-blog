#!/bin/sh
set -e

if ! wp core is-installed 2>/dev/null; then
  wp core install \
    --url="$WP_URL" --title="Headless Simple Blog" \
    --admin_user=admin --admin_password=admin \
    --admin_email=admin@example.com --skip-email
fi

wp option update siteurl "$WP_URL"
wp option update home "$WP_URL"
wp rewrite structure '/%postname%/'      # pretty permalinks, so /wp-json/ works
wp plugin is-installed jwt-authentication-for-wp-rest-api \
  || wp plugin install jwt-authentication-for-wp-rest-api

# Latest demo-content plugin straight from GitHub
wp plugin install https://github.com/anamwp/wp-cli-post-importer/archive/refs/heads/master.zip --force \
  || wp plugin is-installed wp-cli-post-importer

# 4. Make Apache pass the Authorization header to PHP (JWT token validation needs it)
if ! grep -q HTTP_AUTHORIZATION /var/www/html/.htaccess 2>/dev/null; then
  { printf 'SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1\n'; cat /var/www/html/.htaccess 2>/dev/null; } > /tmp/htaccess
  cat /tmp/htaccess > /var/www/html/.htaccess
fi

wp plugin activate --all
wp option update blog_public 0
# Demo content from wp-cli-post-importer (skipped if posts already exist)
if [ "$(wp post list --post_type=post --post_status=publish --format=count)" -lt 5 ]; then
  wp post delete 1 --force 2>/dev/null || true      # remove "Hello world!"
  wp start "${DEMO_IMPORT:-import-posts}"
fi

# Same as Settings → Permalinks → Save Changes: rebuild rewrite rules and .htaccess
printf 'apache_modules:\n  - mod_rewrite\n' > /tmp/wp-cli.yml
WP_CLI_CONFIG_PATH=/tmp/wp-cli.yml wp rewrite flush --hard

echo "WordPress ready at $WP_URL"