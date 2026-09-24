# URL Shortener Web

A React frontend for the Go/Fiber URL Shortener API. Create and copy short links with an optional custom code and expiration time. No account is required.

## Repositories

- **Backend (Go / Fiber / Redis):** [url-shortener-api](https://github.com/Izenberk/url-shortener-api)
- **Frontend (React / Vite):** [url-shortener-web](https://github.com/Izenberk/url-shortener-web)

## Features

- Destination URL, custom code, and expiry inputs with client-side validation.
- API error messages, network error handling, and a 15-second request timeout.
- Clear the old result when a new submission starts.
- Show copying success only after the Clipboard API succeeds.
- Display the link lifetime returned by the API.
- Responsive form layout, labels, hints, keyboard focus styles, and status messages.

The API independently validates all input and enforces code uniqueness.

## Technology and requirements

React 19, Vite 8, JavaScript/JSX, CSS, and ESLint. Exact dependency versions are recorded in `package.json` and `package-lock.json`.

- Node.js matching the installed Vite requirement: `^20.19.0 || >=22.12.0`.
- npm.
- Backend available at `http://localhost:3000`, with its Redis service running.

Commands below use Git Bash from the `url-shortener-web` directory unless otherwise stated.

## Run locally

First, from the **backend** directory, configure `.env` as described in its README and run:

```bash
docker compose up -d --build
```

Then open a separate terminal in the **frontend** directory:

```bash
npm ci
npm run dev
```

Open the URL printed by Vite, normally `http://localhost:5173`. Vite may select another port if it is occupied. Stop the development server with `Ctrl+C`.

The API endpoint is currently hardcoded in `src/App.jsx` as `http://localhost:3000/api/v1`. There is no implemented `VITE_API_URL` setting or Vite proxy. If the API moves, update this endpoint and the backend `DOMAIN` used for generated links.

## Form rules

| Input | Rules |
| --- | --- |
| Destination URL | Required complete HTTP/HTTPS URL with a hostname. |
| Custom code | Optional; 3–32 ASCII letters, digits, hyphens, or underscores. Case-sensitive. Blank means automatic generation. |
| Expiry | Whole hours from 1–720. Blank or `0` means 24 hours. Initial value: 24. |

Enter a URL, optionally configure the other fields, and select **Create short link**. Copy or open the resulting link. The displayed lifetime is the duration from creation, not a live countdown.

## API integration

The frontend sends `POST http://localhost:3000/api/v1` with `Content-Type: application/json`:

```json
{
  "url": "https://example.com/article",
  "short": "my-link",
  "expiry": 24
}
```

An empty custom code is sent as `""`. Expiry is converted to a number; a blank input is sent as `0`.

The UI reads `short` and `expiry` from successful responses and `error` from unsuccessful responses, including `400` validation failures and `409` conflicts. Quota fields returned by the API are not displayed yet.

Short links use a normal anchor for browser navigation. The frontend does not fetch the destination page.

## Build and checks

```bash
npm run lint
npm run build
```

Build output is written to `dist/`. Preview it locally with:

```bash
npm run preview
```

The preview still needs the backend and is not a production deployment setup.

### Windows config-loader fallback

If Vite fails loading its config with `spawn EPERM`, the native loader worked in this project's development environment:

```bash
npm run dev -- --configLoader native
npm run build -- --configLoader native
```

This is an environment-specific fallback, not a fix for every permission issue. Package scripts are unchanged.

## Manual acceptance checklist

There is no automated frontend test suite or `npm test` script yet. Lint and build checks do not verify browser behavior. Complete these checks with the backend running:

- [ ] Create a link without a custom code; verify a generated code and a 24-hour lifetime.
- [ ] Create a unique code with one-hour expiry; verify the returned code and lifetime.
- [ ] Reuse the code with another destination; verify an error and no stale success result.
- [ ] Try an invalid code, unsupported scheme, negative expiry, and expiry over 720; verify rejection.
- [ ] Try blank expiry and `0`; verify both use 24 hours.
- [ ] Copy the result and verify the pasted text.
- [ ] Open the short link and verify its destination.
- [ ] Temporarily stop the development API; verify a useful error and an enabled submit button afterward. Restart it after the check.
- [ ] Check mobile/desktop layouts and keyboard navigation.

Backend unit, handler, and Redis integration tests are documented in the backend README. They do not replace this checklist.

## Code organization

| Path | Responsibility |
| --- | --- |
| `src/App.jsx` | Form state, validation, API requests, results, and copying. |
| `src/App.css` | Component and responsive styles. |
| `src/index.css` | Global layout and base styles. |
| `src/main.jsx` | React entry point. |
| `vite.config.js` | Vite and React plugin configuration. |

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Cannot reach the API | Confirm API/Redis are running; inspect browser Console and Network. Network errors can also reflect CORS or mixed-content blocking. |
| POST returns `404` | Ensure the request uses `/api/v1`. |
| POST returns `400` | Check the response message and JSON field rules. |
| Code already in use | Choose another code or leave it blank. |
| Request timed out | The browser aborts after 15 seconds. The server might still have created the link, so retrying a custom code can return a conflict. |
| Copy failed | Use HTTPS or localhost where available, or select and copy the link manually. |
| Link fails on another device | Localhost refers to that device. Sharing requires a reachable API URL and matching backend `DOMAIN`. |

## Current scope

This is a local learning project. Accounts, link history, edit/delete controls, analytics, API URL configuration, automated browser tests, and deployment are not included.

The backend currently uses `301` redirects; browser caching can affect reopening expired links. See the backend README for redirect, persistence, and quota limitations.

## Details to complete before submission

- Author/student ID and course: [fill in]
- Screenshots and manual-test results: [fill in]
- Demo URL if deployed: [fill in]
- Design decisions and lessons learned: [fill in]
- Learning sources and assistance used, including AI assistance where applicable: [describe accurately according to course rules]
