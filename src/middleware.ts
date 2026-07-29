import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Proteksi rute admin
  if (path.startsWith('/admin') && path !== '/admin-login') {
    const adminSession = request.cookies.get('admin_session')?.value;
    
    if (!adminSession || adminSession !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
  }

  // Proteksi rute bilik suara (/vote)
  if (path.startsWith('/vote')) {
    const voterSession = request.cookies.get('voter_session')?.value;
    
    if (!voterSession) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/vote', '/vote/:path*'],
}
