// app/api/oras/route.ts
import { NextResponse } from "next/server";
import { getNFTsForAddress } from "../../../lib/moralis";
import { createPublicClient, http } from "viem";
import { isAddress, getAddress } from "viem";
import { mainnet } from "viem/chains";

export const revalidate = 30;

// Default allowlist: Sugartown Oras (ETH mainnet).
// You can also override by passing ?token=0x...&token=0x... in the query.
const DEFAULT_ORA_CONTRACTS = ["0xd564c25b760cb278a55bdd98831f4ff4b6c97b38"];

const client = createPublicClient({
  chain: mainnet,
  transport: http(), // optionally set your RPC via env
});

function safeJson<T = any>(text: unknown): T | null {
  if (typeof text !== "string") return (text as any) ?? null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // Accept both ?address= and legacy ?wallet=
  const raw = searchParams.get("address") ?? searchParams.get("wallet");
  const cursor = searchParams.get("cursor") ?? undefined;
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? Math.max(1, Math.min(100, Number(limitParam))) : 50;

  // Optional: allow callers to pass explicit contracts (?token=0x...&token=0x...)
  const tokenParams = searchParams.getAll("token").map((t) => t.toLowerCase());
  const tokenAddresses =
    tokenParams.length > 0 ? tokenParams : DEFAULT_ORA_CONTRACTS.map((t) => t.toLowerCase());

  if (!raw) {
    return NextResponse.json({ error: "Missing 'address' query param" }, { status: 400 });
  }

  // Resolve ENS if needed, then checksum
  let resolvedFrom = "Wallet";
  let owner = raw.trim();

  try {
    if (!isAddress(owner)) {
      // Treat as ENS
      const ensResolved = await client.getEnsAddress({ name: owner.toLowerCase() });
      if (!ensResolved) {
        return NextResponse.json({ error: `ENS not found: ${owner}` }, { status: 400 });
      }
      resolvedFrom = owner;
      owner = ensResolved;
    }
    owner = getAddress(owner); // checksum
  } catch {
    return NextResponse.json({ error: `Invalid address or ENS: ${raw}` }, { status: 400 });
  }

  try {
    // Fetch ONLY the allowlisted contracts from Moralis
    const data = await getNFTsForAddress(owner, {
      cursor,
      limit,
      tokenAddresses, // <-- critical filter
      chain: "eth",
      normalize: true,
      excludeSpam: true,
    });

    const result = Array.isArray((data as any)?.result) ? (data as any).result : [];

    const oras = result
      // Safety net — keep only allowlisted contracts
      .filter((it: any) =>
        tokenAddresses.includes((it?.token_address ?? "").toLowerCase()),
      )
      // Keep only ERC721 (Oras are ERC-721)
      .filter((it: any) => (it?.contract_type ?? it?.token_standard) === "ERC721")
      .map((item: any) => {
        const tokenId = `${item?.token_id ?? ""}`;
        const meta =
          (item?.normalized_metadata as any) ??
          safeJson(item?.metadata) ??
          {};

        const attributes = Array.isArray(meta?.attributes) ? meta.attributes : [];
        const traits: Record<string, string> = {};
        for (const a of attributes) {
          const k = a?.trait_type ?? a?.type;
          const v = `${a?.value ?? ""}`;
          if (k && v) traits[k] = v;
        }

        const image =
          meta?.image ||
          meta?.image_url ||
          meta?.imageURI ||
          "/placeholder.svg?height=400&width=400";

        const name = meta?.name || `Sugartown Ora #${tokenId}`;

        return {
          name,
          oraNumber: tokenId,
          image,
          traits,
          openseaUrl: `https://opensea.io/assets/ethereum/${item?.token_address}/${tokenId}`,
        };
      });

    return NextResponse.json(
      {
        oras,
        resolvedFrom,
        resolvedAddress: owner,
        pagination: {
          cursor: (data as any)?.cursor ?? null,
          page: (data as any)?.page ?? null,
          pageSize: (data as any)?.page_size ?? limit,
          total: (data as any)?.total ?? null,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=300",
        },
      },
    );
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
