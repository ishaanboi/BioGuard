import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url');

    if (!url) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    try {
        // Security check: Only allow fetching from our Firebase Storage
        if (!url.includes('firebasestorage.googleapis.com')) {
            return new NextResponse('Invalid URL origin', { status: 403 });
        }

        const response = await fetch(url);

        if (!response.ok) {
            return new NextResponse(`Failed to fetch file: ${response.statusText}`, { status: response.status });
        }

        const blob = await response.blob();

        // Forward the Content-Type
        const headers = new Headers();
        headers.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream');
        headers.set('Access-Control-Allow-Origin', '*');

        return new NextResponse(blob, { headers });
    } catch (error) {
        console.error('Proxy Error:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
