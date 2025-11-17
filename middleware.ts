import { NextResponse, type NextRequest } from "next/server";
import { getToken, JWT } from "next-auth/jwt";
import { UserRole } from "@prisma/client";
import {
  isAdmin,
  isLessor,
  isManager,
  isStaff,
} from "./app/[locale]/utils/auth/helpers";
import { CurrencyCode, LanguageCode } from "./app/[locale]/types/locale";
import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n";

interface ExtendedToken extends JWT {
  id: string;
  role: UserRole;
  email: string;
}

// Cookie helper
function getCookieValue(cookies: string, name: string): string | null {
  try {
    if (!cookies || typeof cookies !== "string") return null;
    const match = cookies.match(
      new RegExp("(^|;)\\s*" + name + "\\s*=\\s*([^;]+)"),
    );
    return match ? decodeURIComponent(match[2]) : null;
  } catch (error) {
    console.error(`Error parsing cookie ${name}:`, error);
    return null;
  }
}

// next-intl middleware wrapper
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
});

function safeIntlMiddleware(req: NextRequest): NextResponse {
  try {
    return intlMiddleware(req);
  } catch (error) {
    console.error("Intl middleware error:", error);
    return NextResponse.next();
  }
}

// Auth page detector (locale-safe; includes verify-email)
function isAuthPage(pathname: string): boolean {
  try {
    if (!pathname || typeof pathname !== "string") return false;
    // Remove locale prefix ( /en-US or /fr-FR)
    const cleanPath = pathname
      .replace(/^\/[a-z]{2}-[A-Z]{2}/, "")
      .replace(/^\/[a-z]{2}/, "");
    
    // Check if path matches auth routes
    return /^\/(login|register|verify-email)(\?|\/|$)/.test(cleanPath);
  } catch {
    return false;
  }
}

// Prevent nested callbackUrl loops (& strip modal)
function preventUrlLoop(url: string, maxDepth: number = 3): string {
  try {
    if (!url || typeof url !== "string") return "/";
    const urlObj = new URL(url);
    let callbackUrl = urlObj.searchParams.get("callbackUrl");
    let depth = 0;

    while (callbackUrl && depth < maxDepth) {
      try {
        const decodedCallback = decodeURIComponent(callbackUrl);
        const callbackUrlObj = new URL(decodedCallback);
        if (isAuthPage(callbackUrlObj.pathname)) {
          urlObj.searchParams.delete("callbackUrl");
          break;
        }
        const nestedCallback = callbackUrlObj.searchParams.get("callbackUrl");
        if (nestedCallback) {
          callbackUrl = nestedCallback;
          depth++;
        } else {
          break;
        }
      } catch {
        urlObj.searchParams.delete("callbackUrl");
        break;
      }
    }

    if (depth >= maxDepth) {
      urlObj.searchParams.delete("callbackUrl");
    }

    urlObj.searchParams.delete("modal");
    return urlObj.toString();
  } catch {
    return "/";
  }
}

// Build a clean callback URL from current request URL

function getCleanCallbackUrl(originalUrl: string): string {
  try {
    if (!originalUrl || typeof originalUrl !== "string") return "";
    const url = new URL(originalUrl);
    url.searchParams.delete("modal");

    const localeMatch = url.pathname?.match(
      /^\/([a-z]{2}-[A-Z]{2}|[a-z]{2})\//,
    );
    const locale = localeMatch
      ? (localeMatch[1] as LanguageCode)
      : defaultLocale;

    let pathWithoutLocale = url.pathname || "/";
    if (localeMatch) {
      pathWithoutLocale =
        url.pathname.substring(localeMatch[0].length - 1) || "/";
    }
    if (!pathWithoutLocale.startsWith("/"))
      pathWithoutLocale = "/" + pathWithoutLocale;

    if (isAuthPage(pathWithoutLocale) || pathWithoutLocale === "/") {
      return "";
    }

    // Used the correct public domain 
    const publicOrigin =
      process.env.NEXTAUTH_URL ||
      process.env.NEXT_PUBLIC_APP_URL ||
      "https://bandyscars.com";
    const cleanUrl = new URL(`/${locale}${pathWithoutLocale}`, publicOrigin);

    url.searchParams.forEach((value, key) => {
      if (key !== "modal" && key !== "callbackUrl") {
        cleanUrl.searchParams.set(key, value);
      }
    });

    return cleanUrl.toString();
  } catch {
    return "";
  }
}

function safeToString(value: any): string {
  try {
    if (value === null || value === undefined) return "false";
    return String(Boolean(value));
  } catch {
    return "false";
  }
}

// (path only; caller adds locale prefix if needed)
function getRoleDashboardPath(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/admin-dashboard";
    case "MANAGER":
      return "/manager-dashboard";
    case "STAFF":
      return "/staff-dashboard";
    case "LESSOR":
      return "/lessor-dashboard";
    case "USER":
    default:
      return "/user-dashboard";
  }
}

// Middleware
export default async function middleware(req: NextRequest) {
  try {
    const pathname = req.nextUrl?.pathname;
    if (!pathname || typeof pathname !== "string") {
      console.error("Invalid pathname:", pathname);
      return NextResponse.next();
    }

    // Static / asset bypass
    if (
      pathname.startsWith("/_next") ||
      pathname.startsWith("/favicon.ico") ||
      pathname.startsWith("/robots.txt") ||
      pathname.startsWith("/sitemap.xml") ||
      pathname.includes("/images/") ||
      pathname.includes("/assets/") ||
      pathname.includes("/.well-known/") ||
      pathname.endsWith(".ts") ||
      pathname.endsWith(".js") ||
      pathname.endsWith(".css")
    ) {
      return NextResponse.next();
    }

    // Strip malicious nested callback loops early
    if (req.nextUrl?.searchParams?.get("callbackUrl")) {
      const cleanUrl = preventUrlLoop(req.url);
      if (cleanUrl !== req.url) {
        return NextResponse.redirect(new URL(cleanUrl));
      }
    }

    // Auth token for both API and page routes
    let token: ExtendedToken | null = null;
    const isApiRoute = pathname.startsWith("/api");
    const isAuthApi = pathname.startsWith("/api/auth");
    
    // Only get token if needed (skip for public assets and auth API)
    if (isApiRoute && !isAuthApi) {
      try {
        token = (await getToken({
          req,
          secret: process.env.NEXTAUTH_SECRET,
        })) as ExtendedToken | null;
      } catch (error) {
        console.error("Token error:", error);
      }
    }

    // API routes
    if (isApiRoute) {
      if (isAuthApi) {
        return NextResponse.next();
      }

      const requestHeaders = new Headers(req.headers);

      const publicApiRoutes = [
        "/api/location",
        "/api/reviews",
        "/api/careers/upload-cv",
        "/api/fleet",
        "/api/cars",
        "/api/support/tickets",
        "/api/cron",
        "/api/test-email",
        "/api/webhooks/stripe",
        "/api/webhooks",
        "/api/vehicles/pricing",
        "/api/chat",
        "/api/get-signed-url",
        "/api/stripe-payment",
        "/api/test-booking",
        "/api/verify-email",
        "/api/set-password",
        "/api/enterprise/contact"
      ];

      const isPublicApiRoute = publicApiRoutes.some(
        (route) => pathname === route || pathname.startsWith(`${route}/`),
      );

      if (!token && !isPublicApiRoute) {
        return NextResponse.json(
          { error: "Unauthorized", message: "Authentication required" },
          { status: 401 },
        );
      }

      if (token?.role) {
        try {
          if (
            pathname.startsWith("/api/admin") &&
            !isAdmin(token.role) &&
            !isManager(token.role)
          ) {
            return NextResponse.json(
              { error: "Insufficient permissions" },
              { status: 403 },
            );
          }
          if (pathname.startsWith("/api/staff") && !isStaff(token.role)) {
            return NextResponse.json(
              { error: "Insufficient permissions" },
              { status: 403 },
            );
          }
          if (pathname.startsWith("/api/manager") && !isManager(token.role)) {
            return NextResponse.json(
              { error: "Insufficient permissions" },
              { status: 403 },
            );
          }
          if (pathname.startsWith("/api/lessor") && !isLessor(token.role)) {
            return NextResponse.json(
              { error: "Insufficient permissions" },
              { status: 403 },
            );
          }

          if (token.id) requestHeaders.set("x-user-id", token.id);
          if (token.role) requestHeaders.set("x-user-role", token.role);
          if (token.email) requestHeaders.set("x-user-email", token.email);
        } catch (error) {
          console.error("Auth header error:", error);
        }
      }

      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    // Locale extraction
    const localeMatch = pathname.match(/^\/([a-z]{2}-[A-Z]{2}|[a-z]{2})(\/|$)/);
    const pathnameHasLocale = Boolean(localeMatch);

    let pathnameWithoutLocale: string;
    if (pathnameHasLocale && localeMatch) {
      const localeWithSlash = localeMatch[0];
      pathnameWithoutLocale = pathname.substring(localeWithSlash.length);
      if (!pathnameWithoutLocale || pathnameWithoutLocale === "") {
        pathnameWithoutLocale = "/";
      } else if (!pathnameWithoutLocale.startsWith("/")) {
        pathnameWithoutLocale = "/" + pathnameWithoutLocale;
      }
    } else {
      pathnameWithoutLocale = pathname;
    }

    // Public paths
    const publicPaths = [
      "/",
      "/login",
      "/register",
      "/verify-email",
      "/verify-email-pending",
      "/set-password",
      "/reset-password",
      "/support",
      "/cars/fleet",
      "/cars",
      "/about",
      "/legal",
      "/forgot-password",
      "/privacy-policy",
      "/terms-of-service",
      "/sitemap",
      "/faqs",
      "/press",
      "/careers",
      "/bandyscars-guide",
      "/partnership",
      "/bandys-for-enterprise",
      "/our-offices",
      "/cancellation-policy",
      "/community-guidelines",
      "/nondiscrimination-policy",
      "/how-bandys-works",
      "/location-agadir",
      "/location-casablanca",
      "/location-fes",
      "/location-marrakech",
      "/location-rabat",
      "/location-tanger",
      "/robots.txt",
      "/sitemap.xml",
      "/api/chat",
    ];

    const isPublicPath = publicPaths.some(
      (path) =>
        pathnameWithoutLocale === path ||
        pathnameWithoutLocale.startsWith(`${path}/`) ||
        pathnameWithoutLocale.startsWith("/cars/") ||
        pathnameWithoutLocale.startsWith("/location-"),
    );

    // Auth token for page routes (reuse if already fetched)
    if (!token && !isPublicPath) {
      try {
        token = (await getToken({
          req,
          secret: process.env.NEXTAUTH_SECRET,
        })) as ExtendedToken | null;
      } catch (error) {
        console.error("Auth token error:", error);
      }
    }

    // Cookie prefs
    const cookieHeader = req.headers.get("cookie") || "";
    const storedLanguage = getCookieValue(
      cookieHeader,
      "preferred-language",
    ) as LanguageCode | null;
    const storedCurrency = getCookieValue(
      cookieHeader,
      "preferred-currency",
    ) as CurrencyCode | null;

    const hasLanguagePreference = Boolean(
      storedLanguage && locales.includes(storedLanguage),
    );
    const hasCurrencyPreference = Boolean(
      storedCurrency &&
        ["USD", "EUR", "GBP", "CAD", "MAD"].includes(storedCurrency),
    );

    // Language preference redirect
    if (hasLanguagePreference && localeMatch) {
      const currentLocale = localeMatch[1] as LanguageCode;
      if (currentLocale !== storedLanguage) {
        const newUrl = new URL(req.url);
        newUrl.pathname = pathname.replace(
          `/${currentLocale}`,
          `/${storedLanguage}`,
        );
        return NextResponse.redirect(newUrl);
      }
    }

    // Authenticated on auth page: redirect to callback or dashboard
    if (token && isAuthPage(pathnameWithoutLocale)) {
      const locale = (
        localeMatch
          ? (localeMatch[1] as LanguageCode)
          : hasLanguagePreference
            ? storedLanguage
            : defaultLocale
      ) as LanguageCode;

      // Check for callbackUrl in query params
      const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
      
      if (callbackUrl) {
        try {
          // Decode if needed (might be URL encoded)
          const decodedCallback = decodeURIComponent(callbackUrl);
          const callbackUrlObj = decodedCallback.startsWith("http")
            ? new URL(decodedCallback)
            : new URL(decodedCallback, req.nextUrl.origin);

          // Make sure callback is not an auth page (prevent loops)
          const callbackPath = callbackUrlObj.pathname.replace(/^\/[a-z]{2}(?:-[A-Z]{2})?/, '');
          
          if (!isAuthPage(callbackPath)) {
            // Clean up modal param
            callbackUrlObj.searchParams.delete('modal');
            console.log('[Middleware] Authenticated user, redirecting to callback:', callbackUrlObj.toString());
            return NextResponse.redirect(callbackUrlObj);
          }
        } catch (err) {
          console.error("[Middleware] Invalid callbackUrl:", err);
        }
      }

      // No valid callback, redirect to role-based dashboard
      const dashPath = `/${locale}${getRoleDashboardPath(token.role)}`;
      console.log('[Middleware] Authenticated user, redirecting to dashboard:', dashPath);
      return NextResponse.redirect(new URL(dashPath, req.url));
    }

 
    if (!token && !isPublicPath) {
      // Check if this is a guest checkout request
      const isGuestCheckout = req.nextUrl?.searchParams?.get("guest") === "true";
      
      // Also allow booking/stripe confirmation pages with guest parameter
      const isGuestConfirmationPage = (
        pathnameWithoutLocale === "/booking-confirmation" || 
        pathnameWithoutLocale === "/stripe-booking-confirmation" ||
        pathnameWithoutLocale.startsWith("/booking-success")
      ) && isGuestCheckout;
      
      // Allow guest checkout to proceed without authentication
      if (isGuestCheckout || isGuestConfirmationPage) {
        console.log('[Middleware] Allowing guest checkout:', req.nextUrl.pathname);
        return safeIntlMiddleware(req);
      }
      
      const isModal = req.nextUrl?.searchParams?.get("modal") === "true";
      const hasCallbackUrl = req.nextUrl?.searchParams?.has("callbackUrl");

      // Allow modal auth flows
      if (isModal || (hasCallbackUrl && isAuthPage(pathnameWithoutLocale))) {
        return safeIntlMiddleware(req);
      }

      const locale = (
        localeMatch
          ? (localeMatch[1] as LanguageCode)
          : hasLanguagePreference
            ? storedLanguage
            : defaultLocale
      ) as LanguageCode;
      
      const loginUrl = new URL(`/${locale}/login`, req.url);
      loginUrl.searchParams.set("modal", "true");

      // Build callback URL 
      const cleanCallbackUrl = getCleanCallbackUrl(req.url);
      if (cleanCallbackUrl) {
        loginUrl.searchParams.set("callbackUrl", cleanCallbackUrl);
        console.log('[Middleware] Redirecting to login with callback:', cleanCallbackUrl);
      }

      return NextResponse.redirect(loginUrl);
    }

    // Apply next-intl & continue
    const response = safeIntlMiddleware(req);

    let finalCurrency = storedCurrency || "USD";

  // Only list truly gated areas here so public catalog routes remain indexable.
  const privateRoutes = [
      '/admin', '/manage-', '/staff', '/handle-', '/lessor',
      '/booking-confirmation', '/booking-success', '/favorites', '/loyalty-program',
      '/mybookings', '/mydocuments', '/user-dashboard', '/stripe-booking-confirmation',
  '/after-login', '/booking/', '/vehicles/', '/accounting/', '/contracts/',
      '/calendar-overview', '/document-verification', '/email-tracking', '/vehicle-tracking'
    ];
    const isPrivateRoute = privateRoutes.some(route => pathnameWithoutLocale.startsWith(route));

    // Response headers 
    try {
      response.headers.set("x-currency", finalCurrency || "USD");
      response.headers.set(
        "x-has-currency-preference",
        safeToString(hasCurrencyPreference),
      );
      response.headers.set(
        "x-has-language-preference",
        safeToString(hasLanguagePreference),
      );

      if (token?.id) response.headers.set("x-user-id", token.id);
      if (token?.role) response.headers.set("x-user-role", token.role);
      if (token?.email) response.headers.set("x-user-email", token.email);
      
      // Prevent search engines from indexing private routes
      if (isPrivateRoute) {
        response.headers.set("X-Robots-Tag", "noindex, nofollow");
      }
    } catch (error) {
      console.error("Header setting error:", error);
    }

    return response;
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.next();
  }
} 

// Matcher
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
