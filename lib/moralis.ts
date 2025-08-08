// lib/moralis.ts
import { debug } from "../lib/debug";

export type MoralisOpts = {
  chain?: "eth";
  limit?: number;
  cursor?: string;
  normalize?: boolean;
  tokenAddresses?: string[];   // NEW: allow filtering to specific contracts
  excludeSpam?: boolean;       // NEW: optional spam filter
};

type MoralisNFT = {
  token_address: string;
  token_id: string;
  name?: string;
  normalized_metadata?: Record<string, any> | null;
  metadata?: string | null;
};

type MoralisResponse = {
  result: MoralisNFT[];
  cursor?: string | null;
  page?: number;
  page_size?: number;
  total?: number;
};

const BASE = "https://deep-index.moralis.io/api/v2.2";

export async function getNFTsForAddress(address: string, opts: MoralisOpts = {}) {
  const key = process.env.MORALIS_API_KEY;
  if (!key) throw new Error("Missing MORALIS_API_KEY");

  const {
    chain = "eth",
    limit = 50,
    cursor,
    normalize = true,
    tokenAddresses = [],      // NEW
    excludeSpam = true,       // NEW
  } = opts;

  const params = new URLSearchParams({
    chain,
    format: "decimal",
    normalizeMetadata: normalize ? "true" : "false",
    mediaItems: "false",
    includePrices: "false",
    limit: String(limit),
    excludeSpam: excludeSpam ? "true" : "false", // NEW
  });

  if (cursor) params.set("cursor", cursor);

  // Moralis accepts repeated token_addresses params
  for (const t of tokenAddresses) {
    if (t) params.append("token_addresses", t.toLowerCase());
  }

  const url = `${BASE}/${encodeURIComponent(address)}/nft?${params.toString()}`;

  const t0 = Date.now();
  const res = await fetch(url, {
    headers: { "X-API-Key": key },
    next: { revalidate: 15 },
  });

  const elapsed = Date.now() - t0;
  debug("perf:fetch", { url, status: res.status, elapsedMs: elapsed });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Moralis error ${res.status}: ${text}`);
  }

  const data = (await res.json()) as MoralisResponse;
  debug("data:moralis", {
    count: data.result?.length ?? 0,
    cursor: data.cursor,
    page_size: data.page_size,
  });
  return data;
}
