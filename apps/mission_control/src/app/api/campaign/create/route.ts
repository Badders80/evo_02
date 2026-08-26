import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createCampaignFromIntake } from '@/lib/campaign-pipeline';
import type { CampaignIntakePayload } from '@/lib/campaign-pipeline';

function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

export async function POST(request: Request) {
  // Fail-closed auth: checked BEFORE any payload parsing or try-block.
  const expected = process.env.OPERATOR_API_TOKEN;
  if (!expected) return unauthorized();

  const header = request.headers.get('authorization') ?? '';
  const match = /^Bearer\s+(.+)$/i.exec(header);
  if (!match) return unauthorized();

  try {
    const provided = Buffer.from(match[1]);
    const expectedBuf = Buffer.from(expected);
    if (provided.length !== expectedBuf.length) return unauthorized();
    if (!timingSafeEqual(provided, expectedBuf)) return unauthorized();
  } catch {
    return unauthorized();
  }

  try {
    const body = (await request.json()) as CampaignIntakePayload;
    const result = await createCampaignFromIntake(body);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown campaign creation error';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
