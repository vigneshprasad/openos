import { getToken } from 'next-auth/jwt';
import { type NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const session = await getToken({req: req, secret: process.env.NEXTAUTH_SECRET, raw: true})

  if (!session) return NextResponse.redirect(new URL('/auth/signin', req.url))

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/reports/:path*'],
}
