import { redirect } from 'next/navigation';
import { getPublicSettings } from '@/lib/publicData';
import { PartnerClientView } from '@/components/PartnerClientView';

export const dynamic = 'force-dynamic';

export default async function PartnerPage() {
  const settings = await getPublicSettings();

  // Si le système partenaire est désactivé par l'administrateur, la page est immédiatement bloquée et redirigée vers la boutique
  if (settings?.partnerProgramEnabled === false) {
    redirect('/');
  }

  return <PartnerClientView />;
}
