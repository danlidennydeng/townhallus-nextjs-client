# Cookie warning review and migration

## Original behavior

The source is `hoohootowns/client/src/components/CookieWarning.jsx`, rather than
`client/src/pages`. `Home.jsx` mounts it at the bottom of the page. There is no
standalone cookie-warning route in the React app.

The component starts with `cookieConsent = null`, displays a fixed bottom banner,
and reads `localStorage.cookieConsent` in an effect. Accept stores the string
`"true"`; reject stores `"false"`. Either choice hides the notice. The existing
`"false"` string correctly counts as a saved rejection. No preference expiration,
server request, authentication change, or actual cookie manipulation occurs.

The banner uses global `.cookie-*` CSS: a dark background, blue buttons, yellow
policy link, fixed positioning, and a high stacking order. This differs from the
new site's gray surfaces, purple accents, restrained shadows, and focus styling.

## Problems found

- A saved choice is read after the first render, allowing a brief unwanted flash.
- Any nonempty storage value other than `"true"` is treated as rejection, even if
  the value is corrupt or unrelated.
- Reading or writing local storage can throw, with no recovery in the component.
- Other tabs do not update the banner after a preference changes.
- There is no way to revisit the controls after making a choice.
- `Learn More` links to `/cookie-policy`, which is not registered in the React or
  Next.js application. The existing policy page is `/privacy`.
- The fixed banner can obscure the bottom of the page and has no height/scroll
  handling for short screens.
- The notice has no named landmark or feedback explaining persistence failures.
- Most importantly, the accept/reject handlers only store a flag. They do not
  load, block, remove, or configure analytics, advertising scripts, or cookies.

## Next.js implementation

- `components/cookie-warning.tsx` provides the Home-only browser-rendered notice.
  It waits for browser storage before rendering, reserves room to scroll the
  footer above it, and scrolls internally when the viewport is short.
- `/cookie-warning` is a CSR settings page using the same `ssr: false` boundary
  pattern as Search and NotFound. Only its loading shell and metadata are built
  into the initial HTML. Home retains its existing server rendering.
- Both interfaces use the same Material-style controls and local preference
  store, with explicit labels, keyboard focus, touch-sized buttons, and feedback.
- Existing `cookieConsent` strings are retained for compatibility on the same
  origin. Only `"true"` and `"false"` are valid saved choices. Other values prompt
  the visitor to choose again.
- Storage events synchronize tabs; a custom event synchronizes components in the
  same tab. If storage is inaccessible or a write fails, an in-memory choice is
  honored for the current visit. The settings page explains that it was not saved
  for future visits. Preferences are browser-specific and have no added expiry.
- Cookie settings is reachable from the shared menu and footer. Policy links use
  `/privacy`. No login, logout, Express endpoint, or database collection changes
  are needed.

## Tracking scope and existing policy differences

No first-party analytics or advertising loader was found in the inspected
Next.js `app`, `components`, `lib`, or `public` sources. The Home JSON-LD script
is structured metadata, not a tracking loader. This review does not inspect CDN
injection or services outside the repository.

The migration provides `areOptionalCookiesAllowed()` and `useCookieConsent()` for
optional analytics/advertising integrations. Permission defaults to false when
missing, invalid, or inaccessible. Any added tracker must actually consult the
preference and respond to withdrawal; displaying the notice alone is not a
tracking-blocking mechanism. Existing third-party media embeds are outside this
change and are not automatically blocked by this preference.

The Express code sets an HTTP-only `access_token` with a JWT lifetime of `30d`;
it does not set an explicit cookie `maxAge` or `expires`. The existing Privacy
page instead refers to `access_cookie` and up to three months. Those existing
policy statements were not rewritten in this UI migration. The new settings
page avoids repeating the mismatched name or duration.

Local storage is scoped to an origin. A choice made on a different hostname or
port does not automatically migrate to the Next.js origin.
