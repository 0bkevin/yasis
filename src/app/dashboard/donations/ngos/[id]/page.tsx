"use client";

import { NgoDetailPage } from "@/components/dashboard/NgoDetailPage";

export default function NgoDetailRoute({ params }: { params: { id: string } }) {
  return <NgoDetailPage ngoId={params.id} />;
}
