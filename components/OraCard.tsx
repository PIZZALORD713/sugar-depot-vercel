"use client";
import Image from "next/image";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Star, ExternalLink, Pencil } from "lucide-react";
import { useProfile } from "../store/useProfile";
import { type Ora } from "../lib/normalize";
import { useState } from "react";
import { OraModal } from "./OraModal";

export function OraCard({ ora }: { ora: Ora }) {
  const { toggleFavorite, isFavorite } = useProfile();
  const [open, setOpen] = useState(false);
  const fav = isFavorite(ora.id);

  return (
    <>
      <Card className="group relative overflow-hidden rounded-2xl border glass-dark">
        <div className="relative w-full aspect-square">
          {!!ora.image && (
            <Image
              src={ora.image}
              alt={ora.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 33vw"
              priority={false}
            />
          )}
        </div>

        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="text-sm font-medium">#{ora.tokenId}</div>
            <div className="hidden md:flex gap-1 flex-wrap">
              {Object.entries(ora.traits).slice(0, 2).map(([k,v]) => (
                <Badge key={k} variant="secondary" className="text-[10px]">{v}</Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="icon" variant={fav ? "default" : "outline"} onClick={() => toggleFavorite(ora.id)}>
              <Star className={`h-4 w-4 ${fav ? "fill-current" : ""}`} />
            </Button>
            <Button size="icon" variant="outline" asChild>
              <a href={ora.permalink} target="_blank" rel="noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button size="icon" variant="outline" onClick={() => setOpen(true)}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
      <OraModal open={open} onOpenChange={setOpen} ora={ora} />
    </>
  );
}
