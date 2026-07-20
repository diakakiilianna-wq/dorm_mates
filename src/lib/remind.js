// Sends "finish the quiz" reminder emails via the dorm-mates-proxy Worker,
// which holds the Resend API key server-side.

import { WORKER_BASE } from './github.js';

const REMIND_URL = `${WORKER_BASE}/api/remind`;

// `recipients` is [{ name, email }]. Returns [{ email, ok, error? }] — a
// per-recipient result, since some sends can fail while others succeed.
export async function sendReminders(recipients, { subject, message } = {}) {
  const res = await fetch(REMIND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recipients, subject, message }),
  });
  if (!res.ok) throw new Error(`Failed to send reminders: ${res.status} ${await res.text()}`);
  const { results } = await res.json();
  return results;
}
