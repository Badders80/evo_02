'use client';

import { useState } from 'react';

export default function OperatorLoginPage() {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'busy' | 'error' | 'ok'>('idle');
  const [message, setMessage] = useState('');

  const submit = async () => {
    setStatus('busy');
    setMessage('');
    try {
      const res = await fetch('/api/operator/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        setStatus('ok');
        setMessage('Signed in. Return to the workspace and publish again.');
      } else {
        setStatus('error');
        setMessage(res.status === 401 ? 'Invalid operator token.' : `Sign-in failed (${res.status}).`);
      }
    } catch {
      setStatus('error');
      setMessage('Sign-in request failed.');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-sm space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
        <div>
          <h1 className="text-sm font-semibold text-zinc-100">Operator Sign-In</h1>
          <p className="mt-1 text-[11px] text-zinc-500">
            Mission Control operator access. Uses OPERATOR_API_TOKEN.
          </p>
        </div>
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && token && status !== 'busy') void submit();
          }}
          placeholder="operator token"
          className="h-9 w-full rounded border border-zinc-700 bg-zinc-950 px-3 font-mono text-xs text-zinc-100 focus:border-[#d4a964] focus:outline-none"
        />
        <button
          disabled={!token || status === 'busy'}
          onClick={() => void submit()}
          className="h-9 w-full rounded bg-[#d4a964] text-xs font-semibold text-black hover:bg-[#c39853] transition-colors disabled:opacity-50"
        >
          {status === 'busy' ? 'Signing in…' : 'Sign In'}
        </button>
        {message && (
          <p className={`text-[11px] ${status === 'ok' ? 'text-emerald-400' : 'text-red-400'}`}>{message}</p>
        )}
      </div>
    </main>
  );
}
