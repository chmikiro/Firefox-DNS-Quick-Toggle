# DNS Quick Toggle — Firefox Edition

A lightweight Firefox/Mullvad Browser extension to manage and switch between DNS-over-HTTPS (DoH) providers instantly from the toolbar.

<img width="417" height="661" alt="image" src="https://github.com/user-attachments/assets/9ecb4f72-15ad-4390-8b49-5045d15bd8a6" />

## Features

- **One-click switching** between saved DoH providers
- **Clipboard auto-copy** — activating a provider copies its URL automatically
- **Toolbar badge** showing the active provider's initials (e.g. `MU` for Mullvad)
- **Add/remove custom providers**
- **8 providers pre-loaded** (Mullvad, Cloudflare, NextDNS, Quad9, AdGuard, Control D)
- **Disable DoH** button to revert to browser default
- Tested on **Firefox 90+** and **Mullvad Browser**

## Installation

### Temporary (development)

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select the `manifest.json` file from the extension folder

> Note: Temporary add-ons are removed when Firefox closes. For persistent install, use `web-ext`.

### Permanent (via web-ext)

```bash
npm install -g web-ext
cd dns-toggle-firefox/
web-ext build
# Outputs a .xpi file in web-ext-artifacts/
```

Then install the `.xpi` via `about:addons` → gear icon → **Install Add-on From File**.

## Usage

1. Click the **DNS Quick Toggle** icon in the toolbar
2. Click any provider to:
   - Mark it as active (green dot + badge update)
   - Auto-copy its DoH URL to clipboard
3. Open `about:preferences#privacy` → scroll to **DNS over HTTPS**
4. Paste the copied URL into the custom resolver field
5. Done — your DoH is set

To disable DoH entirely, click **⊘ Disable DoH**.

## Pre-loaded Providers

| Provider | URL | Tag |
|---|---|---|
| Mullvad | `https://doh.mullvad.net/dns-query` | no-log |
| Mullvad (adblock) | `https://adblock.doh.mullvad.net/dns-query` | adblock |
| Mullvad (extended) | `https://extended.doh.mullvad.net/dns-query` | adblock+ |
| Cloudflare | `https://cloudflare-dns.com/dns-query` | — |
| Cloudflare (security) | `https://security.cloudflare-dns.com/dns-query` | malware |
| NextDNS | `https://dns.nextdns.io` | — |
| Quad9 | `https://dns.quad9.net/dns-query` | malware |
| AdGuard | `https://dns.adguard-dns.com/dns-query` | adblock |
| Control D | `https://freedns.controld.com/p0` | — |

## Adding a Custom Provider

1. Enter a **name** (e.g. `My NextDNS`)
2. Enter the **DoH URL** (must start with `https://`)
3. Click **Add**

Custom providers are saved in extension storage and persist across sessions.

## Why Not Automatic Switching?

Firefox's `browserSettings.customEngineURL` API — which would allow programmatic DNS changes — is intentionally disabled in **Mullvad Browser** for privacy hardening reasons. As a result, this extension manages your provider list and clipboard; you apply the change once in browser settings.

The one-time paste workflow is intentional: it avoids requiring elevated browser permissions and keeps the extension's footprint minimal.

## File Structure

```
dns-toggle-firefox/
├── manifest.json       # MV2 extension manifest
├── background.js       # Badge management (no DNS API calls)
├── popup.html          # Extension popup UI
├── popup.js            # All logic — no background messaging
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Permissions

| Permission | Reason |
|---|---|
| `storage` | Save provider list and active selection |
| `tabs` | Open `about:preferences#privacy` on click |
| `browserSettings` | Badge color (gracefully ignored if unavailable) |
| `dns` | Reserved for future use |
