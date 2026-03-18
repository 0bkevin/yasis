"use client";

import { AquiferDetailPage } from "@/components/dashboard/AquiferDetailPage";

export default function AquiferDetailRoute({ params }: { params: { id: string } }) {
  return <AquiferDetailPage aquiferId={params.id} />;
}
