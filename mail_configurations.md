# Transactional Email Configuration

Use a transactional email provider with a verified sending domain in production.
Configure these variables in the deployment environment, never in source control:

```env
SMTP_HOST="smtp.your-provider.example"
SMTP_PORT="587"
SMTP_SECURE="false"
SMTP_USER="..."
SMTP_PASSWORD="..."
SMTP_FROM="Grocery <no-reply@your-domain.example>"
EMAIL_CONTACT="support@your-domain.example"
EMAIL_COMPANY_NAME="Grocery"
EMAIL_COMPANY_ADDRESS="Your business address"
NEXT_PUBLIC_APP_URL="https://your-domain.example"
```

For Gmail development only, `GMAIL_EMAIL` and `GMAIL_APP_PASSWORD` remain accepted as
fallback credentials. Do not use a personal Gmail address for production sending.