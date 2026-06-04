import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });
  const { pathname } = req.nextUrl;

  // All routes are portal routes — pass through
  // Auth is handled within each portal page/layout
  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = "/portal/internal";
    return NextResponse.redirect(url);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)).*)"],
};
