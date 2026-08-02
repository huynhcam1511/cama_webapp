import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname === '/login' || pathname.startsWith('/403');
  const isDashboardRoute = pathname.startsWith('/dashboard');

  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  
  const redirectUrl = (path: string) => {
    if (forwardedHost) {
      return NextResponse.redirect(`${forwardedProto}://${forwardedHost}${path}`);
    }
    return NextResponse.redirect(new URL(path, request.url));
  };

  if (isDashboardRoute) {
    if (!user) {
      return redirectUrl('/login')
    }

    // Check user status in database
    const { data: dbUser } = await supabase
      .from('users')
      .select('is_active, is_working, employment_status')
      .eq('id', user.id)
      .single()

    if (!dbUser) {
      return redirectUrl('/403?reason=not_found')
    }

    if (!dbUser.is_active) {
      return redirectUrl('/403?reason=disabled')
    }

    if (!dbUser.is_working || dbUser.employment_status === 'resigned' || dbUser.employment_status === 'terminated') {
      return redirectUrl('/403?reason=resigned')
    }
  }

  if (pathname === '/login' && user) {
    return redirectUrl('/dashboard')
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
