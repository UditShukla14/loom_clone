import { auth } from "@/lib/auth";
import { createMiddleware, detectBot, shield } from "@arcjet/next";
import { NextResponse, NextRequest } from "next/server";
import aj from "@/lib/arcjet";
import { headers } from "next/headers";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return NextResponse.next();
}

const validate = aj.withRule(shield({mode:"LIVE"})).withRule(detectBot({mode:"LIVE",allow:['CATEGORY:SEARCH_ENGINE','GOOGLE_CRAWLER']}))


export default createMiddleware(validate);

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sign-in|assets).*)"],
};