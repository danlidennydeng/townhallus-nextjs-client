# Access-denied review and Next.js migration

## Reviewed source

- `hoohootowns/client/src/pages/AccessDenied.jsx`
- `hoohootowns/client/src/App.jsx`
- `hoohootowns/client/src/components/LocationGuard.jsx`
- `hoohootowns/api/controllers/location.controller.js`
- `hoohootowns/api/routes/location.route.js`
- The proxy/CORS/routing setup in `hoohootowns/api/index.js`

## Original page and routing

`AccessDenied.jsx` is a stateless presentational component. It displays a red
"Access Denied" heading and the sentence "This website is only available to users
in the United States." It performs no location lookup, authentication check,
redirect, or HTTP status handling. There are no recovery actions or custom
metadata. The shared header and footer come from `App.jsx`.

`App.jsx` places `LocationGuard` directly inside `BrowserRouter`, above the shared
header and the routes. `/access-denied` is a public route outside the login,
poster, and admin route guards. Country eligibility is separate from account
authorization; checking the country does not validate citizenship or voter status.

The guard calls `GET /api/location/check` from the browser. A falsy `data.isUS`
navigates to `/access-denied`. The guard returns null and does not hold back page
content while checking, so the original content may already be visible. It does
not inspect HTTP status, validate the response, set a timeout, or cancel stale
requests. Network/JSON exceptions only log an error and leave the page accessible.
This browser redirect does not prevent direct API access or work without
JavaScript. It also does not explicitly exempt the access-denied route from its
location check.

## Existing Express location controller

The endpoint is mounted as `/api/location/check`. It takes the first
`X-Forwarded-For` entry, or falls back to `req.socket.remoteAddress`, then queries
IPinfo's legacy JSON endpoint using the server-side `IPINFO_TOKEN`. The country
comparison is exactly `data.country === "US"`.

The current controller has these limitations:

- It trusts the leftmost forwarded IP directly, independently of the existing
  Express `trust proxy: 1` setting. A client-supplied address can therefore be
  mistaken for the visitor unless the upstream infrastructure sanitizes it.
- Loopback, IPv4-mapped loopback, and `192.168.*` addresses are unconditionally
  allowed, including in production. This is incomplete private-address handling
  and is unsafe if a spoofed forwarded address reaches the controller.
- IP values are not trimmed or validated. IPv4-mapped non-loopback addresses are
  not normalized.
- Results, including denials, are cached for 30 days in a process-local Map.
  There is no size bound, expired-entry cleanup, or concurrent-request deduplication.
  Entries are lost on restart and are not shared across server instances.
- IPinfo HTTP status and error payloads are not checked. A rate limit or other
  response without `country` becomes a denial and may be cached for 30 days.
- There is no fetch timeout. A failed lookup returns HTTP 200 with
  `{ isUS: false }`, making outages indistinguishable from an actual foreign IP.
- Responses expose the raw provider data and IP even though the frontend only
  needs a country decision. The controller does not set response cache headers.
- This is a decision endpoint, not an enforcement middleware. Other Express
  endpoints do not automatically call it.

Forwarded-IP trust must match the actual reverse-proxy topology. See
[Express behind proxies](https://expressjs.com/en/guide/behind-proxies/).
IPinfo's [developer documentation](https://ipinfo.io/developers) also describes
its current endpoints, authentication, country fields, and rate-limit responses.
The current code uses the legacy `country` code field, rather than the newer
Lite response's `country_code` field.

## Selected Next.js/Vercel design

The user selected a server check and confirmed that Next.js is hosted on Vercel.
`proxy.ts` therefore reads Vercel's `x-vercel-ip-country` header before serving
covered routes. This checks the visitor's IP-derived country without a separate
IPinfo fetch, token, browser-location permission, or client-side decision cache.
The Express location endpoint is not part of the new Next.js decision path.

- `US`, including lowercase/whitespace variants, continues to the existing route.
- Other two-letter country codes receive a temporary 307 redirect to
  `/access-denied` before the original page is served.
- Missing or malformed country data redirects to
  `/access-denied?reason=unavailable`. That page explains a verification problem
  instead of asserting that the visitor is outside the United States.
- API requests through Next.js receive JSON with 403 for a non-US country, or
  503 when country verification is unavailable. They are not redirected to HTML.
- Denial responses are private and non-cacheable, and vary by the country header.
- `/access-denied`, Next's static/image assets, the existing public image paths,
  generated avatars, and standard metadata files are exempt so the notice can
  load without a redirect loop. Arbitrary file extensions and Next data routes
  are not exempt. Update the explicit asset allowlist when adding asset paths.
- Local `next dev` works without a Vercel country header. Local production
  previews also allow `localhost`, `127.0.0.1`, and IPv6 loopback (`[::1]`) without
  that header. This exception is disabled on Vercel deployments. An explicitly
  supplied country header is still checked, including in local development.
  Public production requests never default an unknown country to US.

The access-denied interface is CSR, using a Client Component with `ssr: false`
and a static loading shell. Its metadata includes `noindex`. It follows the
About/FAQ Material-style surfaces, purple accents, responsive cards, shared
header/footer, and keyboard focus patterns. The retry link makes a full request
to Home so the location check reruns rather than opening a cached client page.

Page rendering configurations are preserved: Proxy checks access separately from
whether a route uses CSR, SSG, or SSR. Existing login cookies and Express
authorization checks are not replaced or modified.

References: [Next.js Proxy](../node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md),
[Vercel country header](https://vercel.com/docs/headers/request-headers#x-vercel-ip-country).

## Deployment and scope

This implementation assumes requests reach Next.js through Vercel's normal
ingress, which supplies the geolocation header. Do not trust arbitrary copies of
this header on a separately hosted origin. If another CDN/proxy is placed ahead
of Vercel, verify which public IP Vercel sees; this can otherwise be the proxy's
IP instead of the visitor's.

In a local production preview (`next start`), Vercel does not add the header;
loopback-host requests without it are allowed. Non-local production URLs still
require a country header. Test country cases with explicit request headers, use
`next dev` for ordinary local development, and verify real geolocation behavior
on a Vercel preview deployment. The server-side `VERCEL` and `VERCEL_ENV`
[system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables)
disable the local exception on Vercel.

The separate Express deployment remains directly reachable under its existing
rules. Next.js Proxy protects requests arriving through Next.js, including its
API rewrites; it does not country-restrict direct requests to the Express host.
The legacy React client and Express controller were analyzed but not rewritten.
No database collections, auth behavior, or infrastructure settings are changed.

## Validation

- `npm run lint`, `npx tsc --noEmit --incremental false`, and `npm run build`
  passed. The build prerenders the access-denied loading shell; its interface is
  loaded only in the browser.
- Proxy checks using Next's actual matcher verified page/API/data coverage,
  asset exclusions, US normalization, foreign-country redirects, missing/invalid
  header handling, development behavior, and unchanged cookies.
- Loopback regression checks verified ordinary production-preview access through
  `localhost`, `127.0.0.1`, and `[::1]`. Public Host headers and simulated Vercel
  deployments remain restricted, including when the server's internal URL uses
  localhost. Explicit foreign-country headers still produce denial responses.
- HTTP checks against a local production preview verified 307 page redirects,
  403/503 API JSON, US page/session access, the CSR loading shell and noindex
  metadata, and access to required assets. Denied Home and API requests did not
  reach an in-memory upstream fixture.
- Headless Chrome verified the hydrated notice, shared header/footer, recovery
  links, a retry with the simulated country changed to US, the unavailable
  variant, mobile navigation, and widths of 320, 390, 768, and 1440 pixels with
  no horizontal overflow. The server redirect also worked with JavaScript
  disabled. There were no uncaught browser exceptions or unexpected console
  errors.

These checks used simulated Vercel headers and an in-memory Home feed, without
calling the live Express API or MongoDB. A real overseas-to-Vercel request is
still needed to confirm deployment-level visitor-country detection.
