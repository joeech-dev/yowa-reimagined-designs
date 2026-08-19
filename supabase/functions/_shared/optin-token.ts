// HMAC-signed opt-in tokens for the re-permission campaign.
// The token proves the recipient clicked a link we mailed to their address,
// so consent can be recorded without any login.

function secret(): string {
  const key = Deno.env.get("RESEND_WEBHOOK_SECRET") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!key) throw new Error("No signing secret configured for opt-in tokens");
  return key;
}

export async function signOptIn(leadId: string, email: string): Promise<string> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(`${leadId}:${email.toLowerCase()}`),
  );
  return Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function verifyOptIn(leadId: string, email: string, token: string): Promise<boolean> {
  const expected = await signOptIn(leadId, email);
  if (expected.length !== token.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  return diff === 0;
}
