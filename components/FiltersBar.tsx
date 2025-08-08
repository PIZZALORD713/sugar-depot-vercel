"use client";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Search, Filter, RotateCcw, Heart } from "lucide-react";
import { useMemo, useState } from "react";

export type FilterState = {
  q: string;
  onlyFavorites: boolean;
  tokenMin?: number;
  tokenMax?: number;
  traits: Record<string, Set<string>>;
};

export function FiltersBar({
  allTraits,
  onChange,
  onReset,
}: {
  allTraits: Record<string, string[]>;
  onChange: (f: FilterState) => void;
  onReset: () => void;
}) {
  const [state, setState] = useState<FilterState>({
    q: "",
    onlyFavorites: false,
    traits: {},
  });

  const traitKeys = useMemo(() => Object.keys(allTraits).sort(), [allTraits]);

  function toggleTrait(key: string, val: string) {
    setState((s) => {
      const set = new Set(s.traits[key] ?? []);
      set.has(val) ? set.delete(val) : set.add(val);
      const next = { ...s, traits: { ...s.traits, [key]: set } };
      onChange(next);
      return next;
    });
  }

  return (
    <Card className="border rounded-2xl glass-dark">
      <CardContent className="p-4 flex flex-wrap gap-3 items-center">
        <div className="relative max-w-sm flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search name / trait / #id"
            className="pl-8"
            value={state.q}
            onChange={(e) => {
              const next = { ...state, q: e.target.value };
              setState(next);
              onChange(next);
            }}
          />
        </div>

        {/* Token ID range */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className=" className='text-xs text-muted-foreground'">ID min</span>
            <Input
              inputMode="numeric"
              className="w-24"
              value={state.tokenMin ?? ""}
              onChange={(e) => {
                const num = e.target.value === "" ? undefined : Number(e.target.value.replace(/\D+/g, ""));
                const next = { ...state, tokenMin: num };
                setState(next); onChange(next);
              }}
            />
          </div>
          <div className="flex items-center gap-1">
            <span className=" className='text-xs text-muted-foreground'">ID max</span>
            <Input
              inputMode="numeric"
              className="w-24"
              value={state.tokenMax ?? ""}
              onChange={(e) => {
                const num = e.target.value === "" ? undefined : Number(e.target.value.replace(/\D+/g, ""));
                const next = { ...state, tokenMax: num };
                setState(next); onChange(next);
              }}
            />
          </div>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" /> Traits
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px]">
            <div className="grid grid-cols-1 gap-3 max-h-[320px] overflow-auto">
              {traitKeys.map((k) => (
                <div key={k}>
                  <div className="mb-1 text-xs uppercase text-muted-foreground">{k}</div>
                  <div className="flex flex-wrap gap-2">
                    {allTraits[k].map((v) => {
                      const selected = state.traits[k]?.has(v);
                      return (
                        <Badge
                          key={v}
                          variant={selected ? "default" : "secondary"}
                          className="cursor-pointer"
                          onClick={() => toggleTrait(k, v)}
                        >
                          {v}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant={state.onlyFavorites ? "default" : "outline"}
          className="gap-2"
          onClick={() => { const next = { ...state, onlyFavorites: !state.onlyFavorites }; setState(next); onChange(next); }}
        >
          <Heart className="h-4 w-4" /> Favorites
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" className="gap-2"
            onClick={() => { onReset(); setState({ q: "", onlyFavorites: false, traits: {}, tokenMin: undefined, tokenMax: undefined }); }}>
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
