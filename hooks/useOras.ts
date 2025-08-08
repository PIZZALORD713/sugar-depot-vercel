import { toOra, type Ora } from "../lib/normalize";
import { useState, useCallback } from "react";

export function useOras(address: string) {
  const [data, setData] = useState<Ora[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const fetchPage = useCallback(async (cur?: string) => {
    if (!address) return;
    setLoading(true);
    setError(undefined);
    try {
      const qs = new URLSearchParams();
      qs.set("address", address);
      if (cur) qs.set("cursor", cur);
      qs.set("limit", "50");
      const res = await fetch(`/api/oras?${qs.toString()}`, { method: "GET" });
      if (!res.ok) throw new Error(await res.text());
      const json = await res.json();
      const normalized = (json.result ?? [])
        .map(toOra)
        .filter(Boolean) as Ora[];
      setData((prev) => (cur ? [...prev, ...normalized] : normalized));
      setCursor(json.cursor ?? undefined);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [address]);

  const fetchMore = useCallback(() => {
    if (cursor) return fetchPage(cursor);
  }, [cursor, fetchPage]);

  return { data, isLoading: loading, error, cursor, fetchMore, refetch: () => fetchPage() };
}
