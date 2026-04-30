/**
 * Deduplicate and clean API keys from a raw text block.
 */
export function deduplicateAndCleanKeys(text: string): string[] {
  return Array.from(
    new Set(
      text
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean),
    ),
  );
}

/**
 * Parse raw text into an array of non-empty lines.
 */
export function parseApiKeysText(text: string): string[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
}

/**
 * Mask a key for display: show first 4 + last 3 chars, fill middle with *.
 */
export function maskKey(k: string): string {
  if (k.length <= 8) return k;
  return `${k.slice(0, 4)}${'*'.repeat(10)}${k.slice(-3)}`;
}

/**
 * Count keys grouped by status.
 */
export function countKeysByStatus(
  results: { status: string }[],
): { total: number; valid: number; invalid: number; rateLimited: number } {
  return {
    total: results.length,
    valid: results.filter((r) => r.status === 'valid' || r.status === 'paid').length,
    invalid: results.filter((r) => r.status === 'invalid').length,
    rateLimited: results.filter((r) => r.status === 'rate-limited').length,
  };
}

/**
 * Extract API keys from file text content using common patterns.
 */
export function extractApiKeys(text: string): string[] {
  const patterns = [
    /sk-[a-zA-Z0-9_-]{20,}/g,
    /sk-ant-[a-zA-Z0-9_-]{20,}/g,
    /AIzaSy[a-zA-Z0-9_-]{20,}/g,
    /[a-zA-Z0-9_-]{30,}/g,
  ];

  const keys = new Set<string>();
  for (const pattern of patterns) {
    const matches = text.matchAll(pattern);
    for (const m of matches) {
      keys.add(m[0].trim());
    }
  }
  return Array.from(keys);
}
