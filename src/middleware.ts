import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Rewrite rute /admin-[slug] ke /admin secara internal
  const adminSlugMatch = path.match(/^\/admin-([^\/]+)(\/.*)?$/);
  if (adminSlugMatch) {
    const slug = adminSlugMatch[1];
    const rest = adminSlugMatch[2] || '';
    
    const adminSessionString = request.cookies.get('admin_session')?.value;
    if (!adminSessionString) {
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
    
    try {
      const session = JSON.parse(adminSessionString);
      // Validasi bahwa slug di URL cocok dengan slug di session (untuk admin biasa)
      if (session.role === 'admin' && session.slug !== slug) {
        return NextResponse.redirect(new URL('/admin-login', request.url));
      }
      
      // Rewrite URL sehingga Next.js App Router membaca dari folder /admin
      return NextResponse.rewrite(new URL(`/admin${rest}`, request.url));
    } catch {
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
  }

  // Proteksi rute admin biasa (superadmin access /admin)
  if (path.startsWith('/admin') && path !== '/admin-login') {
    const adminSessionString = request.cookies.get('admin_session')?.value;
    
    if (!adminSessionString) {
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
    
    try {
      const session = JSON.parse(adminSessionString);
      // Jika admin biasa mencoba akses /admin, arahkan ke /admin-[slug]
      if (session.role === 'admin' && session.slug) {
        if (path === '/admin') {
           return NextResponse.redirect(new URL(`/admin-${session.slug}`, request.url));
        } else if (path.startsWith('/admin/')) {
           return NextResponse.redirect(new URL(`/admin-${session.slug}${path.substring(6)}`, request.url));
        }
      }
    } catch {
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
  }

  // Proteksi rute bilik suara (/vote)
  if (path.startsWith('/vote')) {
    const voterSession = request.cookies.get('voter_session')?.value;
    
    if (!voterSession) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    try {
      JSON.parse(voterSession);
    } catch {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/admin-:path*', '/vote', '/vote/:path*'],
}
