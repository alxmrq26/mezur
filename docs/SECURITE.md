# Sécurité & variables d'environnement

## Ce qui a changé

Avant, le mot de passe du back office (`/admin.html`) était écrit en clair dans
`js/admin.js`. N'importe quel visiteur pouvait l'afficher : ouvrir le fichier
depuis le navigateur suffisait. La page « mot de passe oublié » le pré-remplissait
même dans le champ de saisie.

Maintenant, le mot de passe vit uniquement dans une **variable d'environnement
Vercel**. Il est vérifié par une petite fonction serveur (`api/admin-auth.js`),
et le navigateur ne reçoit qu'un cookie de session signé, illisible et
non falsifiable (`HttpOnly`, `Secure`, `SameSite=Strict`, valable 8 heures).

## Variables à créer sur Vercel

**Vercel → le projet → Settings → Environment Variables**, pour les trois
environnements (Production, Preview, Development) :

| Variable | Obligatoire | Rôle |
|---|---|---|
| `ADMIN_PASSWORD` | oui | Mot de passe d'accès au back office |
| `ADMIN_PASSWORD_HASH` | non | Empreinte SHA-256 du mot de passe, si l'on préfère ne pas stocker de clair. Prioritaire sur `ADMIN_PASSWORD` |
| `ADMIN_SESSION_SECRET` | non | Clé de signature des sessions. Dérivée du mot de passe si absente |

Après toute modification d'une variable, il faut **relancer un déploiement**
(Deployments → ··· → Redeploy) : les variables sont lues au déploiement.

Générer une empreinte : `echo -n "mon-mot-de-passe" | shasum -a 256`
Générer une clé de session : `openssl rand -hex 32`

## Changer le mot de passe

Le panneau « Mot de passe » du back office ne modifie plus rien : il renvoie
vers Vercel. On change `ADMIN_PASSWORD` dans les variables d'environnement, on
redéploie, et les sessions ouvertes sont invalidées automatiquement.

## Développement local

Le site reste utilisable sans Vercel. Si la fonction `/api/admin-auth` est
injoignable **et** que l'on est sur `localhost` ou en `file://`, le back office
accepte le mot de passe `dev` et affiche un avertissement. Ce repli est
strictement limité au local : sur un vrai domaine, l'absence de réponse du
serveur bloque la connexion au lieu de l'autoriser.

Pour tester avec le vrai mécanisme : `npx vercel dev` après avoir copié
`.env.example` en `.env`.

## Limite à garder en tête

Le back office est encore une application « front-only » : contenus et
réservations sont stockés dans le `localStorage` du navigateur
(`js/content.js`), pas sur un serveur. La connexion protège donc **l'accès à
l'interface**, pas les données elles-mêmes — qui, de toute façon, ne quittent
jamais le poste du restaurateur. Le jour où les réservations seront stockées
côté serveur (base de données, envoi d'e-mails), il faudra protéger ces
endpoints avec le même cookie de session, vérifié côté serveur à chaque appel.

## Autres points

- `.env` et `.env.*` sont ignorés par git ; seul `.env.example` est versionné.
- `vercel.json` ajoute des en-têtes de sécurité (`nosniff`, `X-Frame-Options`,
  HSTS, `Referrer-Policy`) et met `/admin.html` en `noindex, nofollow` pour
  qu'il ne remonte pas dans Google.
- Il n'y a aucune autre clé d'API dans le projet : le formulaire de réservation
  n'appelle aucun service externe, et Google Maps est utilisé en simple iframe
  sans clé.
