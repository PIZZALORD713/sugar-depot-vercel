import { SUGARTOWN_ORAS_CONTRACT } from "../config/collections";
import { debug } from "../lib/debug";

export type Ora = {
  id: string;
  tokenId: string;
  contract: string;
  name: string;
  image: string;
  traits: Record<string, string>;
  permalink: string;
};

export function toOra(nft: any): Ora | null {
  const contract = (nft.token_address ?? "").toLowerCase();
  const tokenId = String(nft.token_id ?? "");
  const normalized = nft.normalized_metadata ?? tryParseJSON(nft.metadata) ?? {};

  const name = nft.name ?? normalized?.name ?? `Sugartown Ora #${tokenId}`;
  const image = normalized?.image ?? "";
  const attrs: any[] = normalized?.attributes ?? [];
  const traits = Array.isArray(attrs)
    ? attrs.reduce<Record<string, string>>((acc, a) => {
        const k = a?.trait_type ?? a?.type;
        const v = a?.value ?? a?.traitValue;
        if (k && v) acc[String(k)] = String(v);
        return acc;
      }, {})
    : {};

  if (!contract || contract !== SUGARTOWN_ORAS_CONTRACT.toLowerCase()) {
    return null;
  }

  const permalink = `https://opensea.io/assets/ethereum/${contract}/${tokenId}`;
  const id = `${contract}:${tokenId}`;

  const ora: Ora = { id, tokenId, contract, name, image, traits, permalink };
  debug("ui:cards", "normalized Ora", { id, hasImage: !!image, traits: Object.keys(traits).length });
  return ora;
}

function tryParseJSON(s: any) {
  if (typeof s !== "string") return null;
  try { return JSON.parse(s); } catch { return null; }
}
