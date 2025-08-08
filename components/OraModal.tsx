"use client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { type Ora } from "../lib/normalize";
import { useState } from "react";

export function OraModal({ open, onOpenChange, ora }: { open: boolean; onOpenChange: (v:boolean)=>void; ora: Ora; }) {
  const [nickname, setNickname] = useState("");
  const [tagline, setTagline] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>#{ora.tokenId} — {nickname || ora.name}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="traits">
          <TabsList>
            <TabsTrigger value="traits">Traits</TabsTrigger>
            <TabsTrigger value="cmp">CMP</TabsTrigger>
            <TabsTrigger value="activity" disabled>Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="traits" className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(ora.traits).map(([k,v]) => (
                <div key={k} className="flex items-center justify-between border rounded-md px-2 py-1">
                  <span className="text-xs text-muted-foreground">{k}</span>
                  <Badge variant="secondary">{v}</Badge>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="cmp" className="space-y-3">
            <Input placeholder="Nickname" value={nickname} onChange={(e)=>setNickname(e.target.value)} />
            <Textarea placeholder="Tagline / one-liner" value={tagline} onChange={(e)=>setTagline(e.target.value)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
