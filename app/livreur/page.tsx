import React from 'react';
import { StoreProvider } from '@/lib/storeContext';
import { DeliveryPortal } from '@/components/DeliveryPortal';
import { hasAdminRole, verifyAdminSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function LivreurPage() {
  const session = await verifyAdminSession();
  if (!session || !hasAdminRole(session, ['admin', 'gestionnaire_livraison'])) {
    redirect('/admin');
  }

  return (
    <StoreProvider initialView="livreur">
      <DeliveryPortal />
    </StoreProvider>
  );
}
