"use client";

import { useRouter } from "next/navigation";
import UniversalScanner from "@/components/universal-scanner";

export default function InventoryScanPage() {
  const router = useRouter();
  return <UniversalScanner fullPage onClose={() => router.back()} />;
}
