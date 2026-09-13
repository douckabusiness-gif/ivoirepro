import { HomeApp } from '@/components/HomeApp';
import { getHomeInitialData } from '@/lib/publicData';

// La home est rendue côté serveur avec les vraies données (paramètres, produits,
// catégories) : premier affichage immédiat, contenu indexable par Google, et
// aucune donnée de démonstration envoyée au visiteur.
export const dynamic = 'force-dynamic';

export default async function Page() {
  const initialData = await getHomeInitialData();
  return <HomeApp initialData={initialData} />;
}
