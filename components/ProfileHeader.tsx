"use client";
import { Card } from "./ui/card";

export function ProfileHeader({ address, count }: { address: string; count: number }) {
  return (
    <div className="relative mb-6">
      <div className="muted-gradient absolute inset-0 -z-10" />
      <Card className="glass-dark border rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight">
              Collector Profile
            </h1>
            <p className="text-sm text-muted-foreground break-all">{address}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{count}</div>
            <div className="text-xs text-muted-foreground">Oras found</div>
          </div>
        </div>
      </Card>
    </div>
  );
}
