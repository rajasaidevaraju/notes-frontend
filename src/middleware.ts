import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    let ip = request.headers.get('x-forwarded-for') || (request as any).ip || '';

    if (ip.includes(',')) {
        ip = ip.split(',')[0].trim();
    }

    const requestHeaders = new Headers(request.headers);

    requestHeaders.set('x-forwarded-for', ip);

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

export const config = {
    matcher: '/:path*',
};
