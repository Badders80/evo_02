// apps/web/src/lib/notice-email.ts
export interface NoticeDraft {
  subject: string;
  body: string;
  autoSend: false;
}

export function draftNoticeEmail(input: {
  kind: 'non_payment' | 'default_warning';
  firstName: string;
  horseName: string;
  floatMonthsHeld: number;
  amountOwedNzd: number;
  deadline: string;
}): NoticeDraft {
  const subject =
    input.kind === 'non_payment'
      ? `Payment required for ${input.horseName}`
      : `Final notice — ${input.horseName}`;
  const body = [
    `Hi ${input.firstName},`,
    '',
    `Your holding in ${input.horseName} is currently at ${input.floatMonthsHeld} months of float coverage.`,
    `An amount of $${input.amountOwedNzd} NZD is due. If not paid by ${input.deadline}, your holding will default and your deposit will be forfeited.`,
  ].join('\n');
  return { subject, body, autoSend: false };
}
