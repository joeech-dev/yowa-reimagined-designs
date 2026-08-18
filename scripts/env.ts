/**
 * Resolves the public backend URL + publishable key for build-time scripts.
 *
 * Order of resolution:
 *   1. process.env (works locally and in CI where vars are injected)
 *   2. the project-root .env file (tsx does not auto-load it like Vite does)
 *   3. hardcoded public fallbacks (project URL + anon key are public by design,
 *      RLS protects the data) so a publish build can never fail on missing env
 */

import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

// Public values — safe to ship in the browser bundle, protected by RLS.
const FALLBACK_URL = "https://opekwztldtrylagmupoo.supabase.co";
const FALLBACK_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wZWt3enRsZHRyeWxhZ211cG9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2MTkwMzksImV4cCI6MjA3ODE5NTAzOX0.uIeQlVHiyMYqDLZEVrphz3dTMLzvkPkG3F4XvIwM1Yw";

function readDotEnv(): Record<string, string> {
  const path = resolve(process.cwd(), ".env");
  if (!existsSync(path)) return {};

  const out: Record<string, string> = {};
  for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) out[key] = value;
  }
  return out;
}

const fileEnv = readDotEnv();

function pick(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key] || fileEnv[key];
    if (value) return value;
  }
  return undefined;
}

export const SUPABASE_URL =
  pick("VITE_SUPABASE_URL", "SUPABASE_URL") || FALLBACK_URL;

export const SUPABASE_KEY =
  pick(
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
    "VITE_SUPABASE_ANON_KEY",
    "SUPABASE_ANON_KEY",
  ) || FALLBACK_KEY;
