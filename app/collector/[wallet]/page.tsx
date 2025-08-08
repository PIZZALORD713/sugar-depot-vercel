"use client";
import { useEffect, useMemo, useState } from "react";
import { useOras } from "../../../hooks/useOras";
import { ProfileHeader } from "../../../components/ProfileHeader";
import { FiltersBar, type FilterState } from "../../../components/FiltersBar";
import { OraCard } from "../../../components/OraCard";
import { GridSkeleton } from "../../../components/Skeletons";
import { useProfile } from "../../../store/useProfile";

type Props = { params: { wallet: string } };

export default function CollectorPage({ params }: Props) {
  const wallet = decodeURIComponent(params.wallet);
  const { data, isLoading, error, fetchMore, cursor, refetch } = useOras(wallet);
  const { isFavorite } = useProfile();
  const [filters, setFilters] = useState<FilterState>({ q: "", onlyFavorites: false, traits: {} });

  useEffect(() => { refetch(); }, [wallet, refetch]);

  const allTraits = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const ora of data) {
      for (const [k, v] of Object.entries(ora.traits)) {
        if (!map[k]) map[k] = new Set();
        map[k].add(v);
      }
    }
    return Object.fromEntries(Object.entries(map).map(([k, set]) => [k, Array.from(set).sort()]));
  }, [data]);

  const filtered = useMemo(() => {
    const q = filters.q?.toLowerCase() ?? "";
    return data.filter((o) => {
      const idNum = Number(o.tokenId);
      if (filters.tokenMin !== undefined && idNum < filters.tokenMin) return false;
      if (filters.tokenMax !== undefined && idNum > filters.tokenMax) return false;
      if (filters.onlyFavorites && !isFavorite(o.id)) return false;
      if (q) {
        const hay = `${o.name} ${o.tokenId} ${Object.values(o.traits).join(" ")}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      for (const [k, set] of Object.entries(filters.traits)) {
        if (set.size > 0 && !set.has(o.traits[k])) return false;
      }
      return true;
    });
  }, [data, filters, isFavorite]);

  return (
    <div className="p-6">
      <ProfileHeader address={wallet} count={filtered.length} />
      <FiltersBar
        allTraits={allTraits}
        onChange={setFilters}
        onReset={() => setFilters({ q: "", onlyFavorites: false, traits: {}, tokenMin: undefined, tokenMax: undefined })}
      />

      {isLoading && data.length === 0 ? (
        <div className="mt-6"><GridSkeleton /></div>
      ) : error ? (
        <div className="p-4 text-red-500">Error fetching Oras for <code>{wallet}</code>: {error}</div>
      ) : filtered.length === 0 ? (
        <div className="p-6 text-sm text-muted-foreground">No Oras match your filters.</div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((o) => <OraCard key={o.id} ora={o} />)}
          </div>
          {cursor and (
            <div className="flex justify-center py-8">
              <button className="px-4 py-2 rounded-md border hover:bg-muted" onClick={() => fetchMore?.()}>
                Load more
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
