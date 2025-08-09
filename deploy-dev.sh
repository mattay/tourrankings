fly secrets set GOOGLE_SHEETS_ID="" --app tourrankings-dev

cat tourrankings-google-service-account-key.json  | tr -d '\n' > temp.json
fly secrets set GOOGLE_SERVICE_ACCOUNT_CREDENTIALS="$(cat temp.json)" -a tourrankings-dev
rm temp.json

fly secrets list --app tourrankings-dev

flyctl config validate --strict -c fly.dev.toml

fly deploy --config fly.dev.toml

fly logs -a tourrankings-dev
