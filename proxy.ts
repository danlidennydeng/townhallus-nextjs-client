import { NextResponse, type NextRequest } from "next/server";

const restrictedMessage = "This website is only available to users in the United States.";
const unavailableMessage = "The location check is temporarily unavailable. Please try again.";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/access-denied" || pathname === "/access-denied/") {
    return NextResponse.next();
  }

  // Vercel supplies this from the visitor's public IP. Do not substitute the
  // browser's locale, account state, cookies, or a server-to-server IP lookup.
  const rawCountry = request.headers.get("x-vercel-ip-country");
  const country = rawCountry?.trim().toUpperCase();

  // Local dev and localhost production previews have no Vercel country header.
  // Keep Vercel deployments protected, and still check explicitly supplied
  // country headers so local country tests continue to work.
  // Next can construct request.url with an internal localhost origin, so prefer
  // the actual Host header when deciding whether this is a loopback request.
  const host = request.headers.get("host") ?? new URL(request.url).host;
  const loopbackHost = /^(?:localhost|127\.0\.0\.1|\[::1\])(?::\d{1,5})?$/i.test(host);
  const vercelDeployment = process.env.VERCEL === "1" ||
    process.env.VERCEL_ENV === "production" || process.env.VERCEL_ENV === "preview";
  if (!vercelDeployment && rawCountry === null &&
    (process.env.NODE_ENV === "development" || loopbackHost)) {
    return NextResponse.next();
  }
  if (country === "US") return NextResponse.next();

  const unavailable = !country || !/^[A-Z]{2}$/.test(country);
  let response: NextResponse;

  if (pathname === "/api" || pathname.startsWith("/api/")) {
    // Data requests receive JSON rather than following a redirect to HTML.
    response = NextResponse.json({
      success: false,
      code: unavailable ? "LOCATION_UNAVAILABLE" : "COUNTRY_RESTRICTED",
      message: unavailable ? unavailableMessage : restrictedMessage,
    }, { status: unavailable ? 503 : 403 });
  } else {
    const destination = new URL("/access-denied", request.url);
    if (unavailable) destination.searchParams.set("reason", "unavailable");
    response = NextResponse.redirect(destination, 307);
  }

  // Never reuse one visitor's denial/unknown-location response for another.
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("Vary", "X-Vercel-IP-Country");
  return response;
}

export const config = {
  matcher: [
    // Keep the notice, its assets, and public generated avatars available.
    // Do not exempt arbitrary file extensions: dynamic post paths can contain
    // dots, and data/API requests must remain covered by the country check.
    "/((?!access-denied(?:/|$)|_next/static(?:/|$)|_next/image(?:/|$)|avatar(?:/|$)|flags(?:/|$)|logo\\.svg$|congress-woman768x432-c\\.png$|favicon\\.ico$|robots\\.txt$|sitemap\\.xml$).*)",
  ],
};
