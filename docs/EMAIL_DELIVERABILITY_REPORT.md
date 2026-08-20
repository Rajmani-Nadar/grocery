# Email Deliverability Report

## Findings

- Welcome mail was sent through Gmail SMTP using the personal `GMAIL_EMAIL` identity. This does not authenticate the Grocery storefront domain and is a weak production sender identity.
- The mailer sent HTML only, with a promotional welcome offer, emoji-heavy subject/content, placeholder `grocery.com` links, and a `List-Unsubscribe` header on a transactional message.
- TLS certificate verification was disabled with `rejectUnauthorized: false`.
- Sender, reply-to, envelope sender, and domain identity were not explicitly separated or configurable.
- SPF, DKIM, DMARC, domain verification, return-path, reputation, and sandbox status cannot be verified from this repository. They must be checked in DNS and the provider dashboard.

## Code changes

- SMTP configuration now supports a verified provider through `SMTP_*` variables, while retaining Gmail variables only as a development fallback.
- Strict TLS verification is enabled.
- Welcome and password-reset messages include both HTML and plain-text alternatives.
- From, Reply-To, envelope sender, Message-ID, and transactional headers are explicit.
- The welcome message is informational, uses a restrained subject, removes the offer, and uses configured application/contact URLs.
- The exposed app-password note was removed from `mail_configurations.md`.

## Required provider and DNS setup

1. Verify the sending domain in the transactional provider dashboard.
2. Publish the provider's exact SPF record. Keep one SPF TXT record for the domain; merge mechanisms if another service already publishes SPF.
3. Publish the provider's DKIM TXT or CNAME records exactly as supplied.
4. Publish DMARC, initially in monitoring mode, for example `v=DMARC1; p=none; rua=mailto:dmarc@your-domain.example`; tighten to quarantine/reject after validating reports.
5. Configure a custom return-path/bounce domain if the provider supports it and verify its DNS records.
6. Set `SMTP_FROM` and `EMAIL_CONTACT` to addresses on the verified domain. Ensure the provider's envelope sender and DKIM signing domain align with that domain.
7. Confirm production mode, domain verification, bounce handling, and suppression-list status in the provider dashboard.
8. Rotate any SMTP or Gmail app password that was previously exposed outside the environment.

## Validation

Send a test message to Gmail and Outlook, inspect `Authentication-Results` for `spf=pass`, `dkim=pass`, and `dmarc=pass`, and use Google Postmaster Tools or the provider's deliverability test for reputation. Code changes cannot guarantee inbox placement until these DNS and provider checks pass.