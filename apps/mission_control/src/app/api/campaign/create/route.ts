import { NextResponse } from 'next/server';
import { createCampaignFromIntake } from '@/lib/campaign-pipeline';
import type { CampaignIntakePayload } from '@/lib/campaign-pipeline';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CampaignIntakePayload;
    const result = await createCampaignFromIntake(body);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown campaign creation error';
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
