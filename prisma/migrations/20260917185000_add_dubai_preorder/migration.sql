-- AlterTable
ALTER TABLE \ Product\ ADD COLUMN IF NOT EXISTS \isDubaiPreorder\ BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE \Product\ ADD COLUMN IF NOT EXISTS \dubaiDeliveryDays\ TEXT DEFAULT '7 à 10 jours ouvrés';
ALTER TABLE \Product\ ADD COLUMN IF NOT EXISTS \dubaiBatchDate\ TEXT;

-- AlterTable
ALTER TABLE \StoreSettings\ ADD COLUMN IF NOT EXISTS \dubaiPageEnabled\ BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE \StoreSettings\ ADD COLUMN IF NOT EXISTS \dubaiPageTitle\ TEXT NOT NULL DEFAULT 'Espace Dubaï VIP • Précommandes & Arrivages Directs ??';
ALTER TABLE \StoreSettings\ ADD COLUMN IF NOT EXISTS \dubaiPageSubtitle\ TEXT NOT NULL DEFAULT 'Commandez vos articles authentiques importés de Dubaï avec paiement sécurisé et livraison garantie à Abidjan.';
ALTER TABLE \StoreSettings\ ADD COLUMN IF NOT EXISTS \dubaiNextFlightDate\ TEXT NOT NULL DEFAULT 'Vol Cargo chaque mardi & vendredi';
