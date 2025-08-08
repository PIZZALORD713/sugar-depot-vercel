"use client";
import { useAccount } from "wagmi";
import { redirect } from "next/navigation";

export default function Me() {
  const { address } = useAccount();
  if (!address) redirect("/");
  redirect(`/collector/${address}`);
}
