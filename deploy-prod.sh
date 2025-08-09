fly secrets set GOOGLE_SHEETS_ID="" --app tourrankings

cat tourrankings-google-service-account-key.json  | tr -d '\n' > temp.json
fly secrets set GOOGLE_SERVICE_ACCOUNT_CREDENTIALS="$(cat temp.json)" -a tourrankings
rm temp.json

fly secrets list --app tourrankings

flyctl config validate --strict -c fly.prod.toml

fly deploy --config fly.prod.toml

fly logs -a tourrankings
