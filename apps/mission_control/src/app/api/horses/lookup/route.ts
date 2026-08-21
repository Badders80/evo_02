import { NextRequest, NextResponse } from 'next/server';
import { lookupHorse, extractLoveRacingId, extractMicrochip } from '@/lib/horse-lookup';

export async function POST(req: NextRequest) {
 let body: Record<string, unknown>;
 try {
 body = await req.json();
 } catch {
 return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
 }

 const rawQuery = body.query ?? body.url ?? body.microchip;
 if (!rawQuery || typeof rawQuery !== 'string' && typeof rawQuery !== 'number') {
 return NextResponse.json({ error: 'Query, URL, or microchip parameter must be a non-empty string' }, { status: 400 });
 }

 const query = String(rawQuery).trim();
 if (!query) {
 return NextResponse.json({ error: 'Query, URL, or microchip is required' }, { status: 400 });
 }

 try {
 const horse = lookupHorse(query);
 if (!horse) {
 return NextResponse.json(
 {
 error: 'Horse not found in NZTR Stud Book catalog',
 parsed: {
 microchip: extractMicrochip(query),
 loveracingId: extractLoveRacingId(query),
 },
 },
 { status: 404 }
 );
 }

 return NextResponse.json({ horse, success: true });
 } catch (err: unknown) {
 return NextResponse.json(
 { error: err instanceof Error ? err.message : 'Lookup failed' },
 { status: 500 }
 );
 }
}
