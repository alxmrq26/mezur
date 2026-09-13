/* ============================================================
   MEZUR — Connexion à Supabase

   À REMPLIR pour que les réservations arrivent au restaurant.

   1. Créer un projet sur supabase.com
   2. Exécuter sql/schema.sql dans l'éditeur SQL du projet
   3. Copier ci-dessous : Project Settings → API → Project URL
      et la clé « anon public »

   Ces deux valeurs sont publiques par nature : elles se lisent dans
   le code de n'importe quelle page. Ce qui protège les données, ce
   sont les règles RLS posées par schema.sql, qui interdisent à cette
   clé de LIRE quoi que ce soit. Elle ne sait qu'enregistrer une
   demande.

   NE JAMAIS METTRE ICI LA CLÉ « service_role » : elle contourne
   toutes les règles de la base. Elle se configure dans les variables
   d'environnement Vercel, où api/reservations.js va la chercher pour
   afficher les réservations dans le back office. Voir docs/SECURITE.md.

   Tant que ces champs restent vides, le site fonctionne : le
   formulaire bascule sur l'appel téléphonique et un courriel
   pré-rempli, sans jamais afficher une confirmation mensongère.
   ============================================================ */

'use strict';

window.MEZUR_SUPABASE = {
  url: '',
  anonKey: ''
};

window.MEZUR_SUPABASE_READY = function () {
  const c = window.MEZUR_SUPABASE;
  return Boolean(c && c.url && c.anonKey);
};
