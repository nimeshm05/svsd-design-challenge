"use client";
import dynamic from "next/dynamic";

const Bedside = dynamic(() => import("@/components/Bedside").then((m) => m.Bedside), { ssr: false });

export default function BedsidePage() {
  return <Bedside />;
}
