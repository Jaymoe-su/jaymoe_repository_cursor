// app/api/undercity/sessions/route.ts

import { NextResponse } from 'next/server';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import type { SessionState } from '@/app/prototypes/undercity-monitor/lib/types';
import { MOCK_SESSIONS } from '@/app/prototypes/undercity-monitor/lib/mockState';

const SESSIONS_DIR = join(homedir(), '.claude', 'undercity', 'sessions');

export async function GET() {
  try {
    const files = await readdir(SESSIONS_DIR);
    const jsonFiles = files.filter(f => f.endsWith('.json'));

    if (jsonFiles.length === 0) {
      // No live sessions — return mock data for development
      return NextResponse.json(MOCK_SESSIONS);
    }

    const sessions: SessionState[] = await Promise.all(
      jsonFiles.map(async (file) => {
        const content = await readFile(join(SESSIONS_DIR, file), 'utf-8');
        return JSON.parse(content) as SessionState;
      })
    );

    return NextResponse.json(sessions);
  } catch {
    // Directory doesn't exist yet — return mock data
    return NextResponse.json(MOCK_SESSIONS);
  }
}
