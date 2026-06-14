# MEZUR — Benchmark & Direction Artistique
## Document de référence pour la refonte du site web
> Brasserie gastronomique · 4 Rue de l'Université, 26000 Valence
> Site actuel : mezurvalence.com · Instagram : @maison_mezur

---

## Table des matières

1. [Contexte & Objectifs](#1-contexte--objectifs)
2. [Benchmark — Sites de référence](#2-benchmark--sites-de-référence)
3. [Direction Artistique](#3-direction-artistique)
4. [Architecture du site](#4-architecture-du-site)
5. [Animations & Interactions](#5-animations--interactions)
6. [Typographie — Spécifications techniques](#6-typographie--spécifications-techniques)
7. [Palette de couleurs](#7-palette-de-couleurs)
8. [Photographie & Vidéo](#8-photographie--vidéo)
9. [Composants UI — Spécifications](#9-composants-ui--spécifications)
10. [Stack technique recommandée](#10-stack-technique-recommandée)
11. [Ton éditorial & Copywriting](#11-ton-éditorial--copywriting)

---

## 1. Contexte & Objectifs

### Qui est MEZUR

MEZUR est une brasserie gastronomique ouverte en 2026 à Valence (Drôme), fondée par Pierre Souptez (chef, né 2004) et Thomas Souptez (caviste, vins). Le nom est un jeu de mots intentionnel sur "mesure" : précision technique, expérience sur mesure, rien en excès.

**Positionnement** : entre la brasserie chaleureuse et le restaurant gastronomique — accessible sans être banal, raffiné sans être intimidant.

**Note Google** : 4,9/5 (15 avis) — établissement récent à fort potentiel de réputation.

### Objectif de la refonte

Créer un site qui dépasse visuellement la concurrence locale et s'impose comme référence de qualité dans l'écosystème digital restaurant en France. Le site doit :

- Générer un **"effet wow" immédiat** à l'ouverture
- **Convertir** (réservation en 2 clics maximum)
- **Raconter** l'histoire de MEZUR sans verbosité
- Être perçu comme un établissement **premium** avant même que le visiteur ait lu un mot
- Fonctionner parfaitement **mobile-first**

### Ce qui ne doit PAS changer (print existant)

Les couleurs suivantes sont déjà imprimées sur des supports physiques (cartes, menus, packaging) — elles doivent rester cohérentes :

- Navy principal : `#0B1F4B`
- Aubergine secondaire : `#2A1B3A`
- Blanc : `#FFFFFF`

---

## 2. Benchmark — Sites de référence

### 2.1 Septime Paris — `septime-charonne.fr`
**Catégorie** : Référence typographique & minimalisme assumé

**Ce qui est remarquable :**
- Titre de page intentionnellement subversif : `. x X Septime X x .` — la personnalité de marque s'exprime jusque dans la balise `<title>`
- Interface réduite à l'essentiel : menu saison, prix, réservation. Zéro superflu.
- Aucune image en hero — le texte suffit parce que la réputation précède
- Liste des vignerons en footer = storytelling de la cave par l'accumulation poétique

**Leçons pour MEZUR :**
- Ne pas avoir peur du blanc et du vide
- Laisser la typographie faire tout le travail émotionnel
- La personnalité de marque peut s'infiltrer dans les micro-détails (title tag, footer, 404)

---

### 2.2 Fuga Paris — `fuga-website.webflow.io`
**Catégorie** : Narrative design · Webflow · Branding fort

**Ce qui est remarquable :**
- Hero copy : "Escape the ordinary with Fuga" — accroche simple, promesse forte
- Structure narrative linéaire : concept → restaurants → expériences → réservation
- Webflow utilisé pour obtenir des transitions fluides sans développement custom lourd
- Intégration Instagram + newsletter en footer pour continuer l'histoire hors-site
- Lauréat Prix Versailles d'Architecture — le site reflète cet ADN de lieu d'exception

**Leçons pour MEZUR :**
- Construire une promesse de marque en **3 mots max** pour le hero
- Le scroll doit être une narration — chaque section révèle une couche supplémentaire
- Webflow est la stack idéale pour ce niveau de qualité sans dev backend

---

### 2.3 Gucci Osteria — `gucciosteria.com`
**Catégorie** : Luxury design · Dynamic image loading · Mode sombre

**Ce qui est remarquable :**
- Navigation par ville (Florence / Tokyo / Séoul) — le lieu comme identité première
- Animation de chargement dynamique des images : révélation progressive au scroll
- Fond sombre dominant — les photos de plats et d'ambiance ressortent avec une intensité maximale
- Typographie haute gamme en serif fin sur noir : lisibilité et élégance simultanées
- Sobriété extrême du copy : le nom de la ville, un CTA. Rien d'autre.

**Leçons pour MEZUR :**
- Le fond **navy sombre** (#0B1F4B) peut dominer sans écraser si la photo est de qualité
- Les animations de reveal d'image (clip-path ou fade) créent un sentiment de découverte
- Moins de texte = plus d'impact. Chaque mot doit justifier sa présence.

---

### 2.4 Noma — `noma.dk`
**Catégorie** : Minimalisme absolu · Scandinavie · Réservation comme expérience

**Ce qui est remarquable :**
- Interface épurée à l'extrême : une seule police, des espaces blancs généreux, aucune décoration
- La réservation devient un rituel — pas un formulaire, une expérience
- Les photos sont rares mais choisies avec une précision chirurgicale
- Pas de vidéo, pas d'animation complexe — le silence visuel EST le message
- Reflète la philosophie culinaire directement dans l'UX

**Leçons pour MEZUR :**
- La **discipline visuelle** (ce qu'on enlève) est aussi importante que ce qu'on ajoute
- Chaque section du site peut être un "plat" : une chose à la fois, présentée parfaitement
- Le processus de réservation doit être traité comme un moment à part entière

---

### 2.5 Flaner (France) — référence française
**Catégorie** : Animations élégantes · Interface moderne · UX fluide

**Ce qui est remarquable :**
- Animations au scroll fluides et non intrusives : les éléments glissent, ne s'imposent pas
- Interface qui incite à "flâner" — le nom du restaurant se retrouve dans l'UX
- Intégration de la terrasse et de l'ambiance dès la première section

**Leçons pour MEZUR :**
- Les animations doivent traduire la **philosophie du lieu** — pour MEZUR : la mesure, la précision
- Éviter les animations spectaculaires pour leur propre bien ; préférer l'élégance fonctionnelle

---

### 2.6 Sunday in Brooklyn — `sundayinbrooklyn.com`
**Catégorie** : Storytelling chaud · Typographie éditoriale · Ambiance

**Ce qui est remarquable :**
- Esthétique douce et chaude — la saisonnalité visible dans les tons (beige, crème, vert)
- Typographie éditoriale mélangée (serif + sans-serif) avec hiérarchie forte
- Le site raconte un moment, pas seulement un restaurant
- Photos in situ, authentiques, pas en studio

**Leçons pour MEZUR :**
- La chaleur humaine (frères, convivialité, partage) peut être traduite dans la palette et la photo
- Mélanger ambiance + plats + équipe dans les visuels — ne pas séparer les sujets

---

### 2.7 Eleven Madison Park — `elevenmadisonpark.com`
**Catégorie** : Haut de gamme · Valeurs · Clarté

**Ce qui est remarquable :**
- Clarté radicale : une seule proposition de valeur en hero
- Les valeurs du restaurant (durabilité, végétal) s'expriment visuellement avant d'être lues
- Navigation linéaire, aucun menu hamburger — assurance d'un établissement qui n'a pas besoin de cacher

**Leçons pour MEZUR :**
- Mettre les valeurs (mesure, authenticité, terroir) en premier — pas les services
- La confiance se communique par la **simplicité** de la navigation

---

### 2.8 Quay Restaurant Sydney — Awwwards SOTD
**Catégorie** : Full-screen photography · Minimalisme australien

**Ce qui est remarquable :**
- Chaque plat est une image plein écran — le design s'efface au profit de la photographie
- Transitions entre sections : fondu lent, jamais de coupe brutale
- Le footer contient l'essence : adresse, téléphone, réservation

**Leçons pour MEZUR :**
- Si la photographie est de qualité, laisser l'image **respirer** sur toute la largeur
- Les transitions douces (800-1200ms ease-out) créent une sensation de luxe

---

### Tableau récapitulatif du benchmark

| Site | Fond | Animation | Vidéo | Score wow | Leçon principale |
|------|------|-----------|-------|-----------|-----------------|
| Septime | Blanc | Aucune | Non | 7/10 | Typographie = identité |
| Fuga Paris | Blanc/couleur | Scroll reveal | Non | 8/10 | Narration par sections |
| Gucci Osteria | Noir/sombre | Image reveal | Oui | 9/10 | Fond dark + photo = premium |
| Noma | Blanc | Aucune | Non | 8/10 | Le vide est un message |
| Flaner | Blanc | Glisse fluide | Non | 7/10 | Animation = personnalité |
| Sunday in Brooklyn | Crème | Fade | Non | 7/10 | Chaleur éditoriale |
| Eleven Madison | Blanc | Fade | Oui | 8/10 | Valeurs en premier |
| Quay Restaurant | Noir | Fondu | Non | 8/10 | Photo plein écran |

---

## 3. Direction Artistique

### 3.1 Concept directeur

> **"La mesure comme esthétique"**

L'identité visuelle de MEZUR repose sur un principe unique : **rien n'est en excès, tout est à sa place**. Le site doit être l'équivalent d'une assiette de Pierre Souptez : épuré, précis, lisible, profondément satisfaisant.

L'effet "wow" ne vient pas de la surcharge visuelle mais de la **justesse** — la photo parfaite au bon moment, l'animation qui ne dure pas une seconde de trop, le texte qui dit exactement ce qu'il faut et rien d'autre.

### 3.2 Mood général

- **Fond dominant** : Navy profond `#0B1F4B` en hero et sections clés, blanc pour le contenu
- **Ambiance** : Sombre, chaud, sensuel — comme la salle un soir de service
- **Rythme** : Lent et délibéré — chaque scroll révèle quelque chose
- **Matières évoquées** : Ardoise, lin, bois sombre, laiton, encre
- **Contraste** : Fort entre zones sombres et blanches — jamais de gris intermédiaire mou

### 3.3 Ce que le site doit faire ressentir en 3 secondes

1. Ce restaurant est **sérieux** (pas un bar à burgers)
2. Ce restaurant est **accessible** (pas intimidant comme une table étoilée)
3. J'ai **envie d'y aller** ce soir

---

## 4. Architecture du site

### Pages

```
/               — Home (page principale)
/le-menu        — Menu complet
/a-propos       — Histoire de Pierre & Thomas
/reservations   — Formulaire de réservation
/contact        — Infos pratiques
```

### Structure de la Home (scroll narrative)

```
┌─────────────────────────────────────────┐
│  HERO — Fullscreen video/photo          │
│  Logo + accroche + CTA "Réserver"       │
│  Scroll indicator animé                 │
├─────────────────────────────────────────┤
│  SECTION 1 — Le concept (3 mots)        │
│  Fond blanc — entrée douce après dark   │
│  "La Mesure / L'Authenticité / Le Goût" │
├─────────────────────────────────────────┤
│  SECTION 2 — Les plats signature        │
│  Fond crème — 2 plats en grand format   │
│  Horizontal scroll ou carousel épuré    │
├─────────────────────────────────────────┤
│  SECTION 3 — La maison (Pierre & Thomas)│
│  Fond navy — Photo + texte              │
│  "MEZUR est né d'une obsession : faire  │
│   juste."                               │
├─────────────────────────────────────────┤
│  SECTION 4 — Le menu en aperçu          │
│  Fond blanc — 3-4 plats avec prix       │
│  CTA "Voir le menu complet"             │
├─────────────────────────────────────────┤
│  SECTION 5 — Preuve sociale             │
│  Note 4,9 ★ + 2-3 verbatims            │
│  Fond crème légèrement texturé          │
├─────────────────────────────────────────┤
│  SECTION 6 — Instagram feed             │
│  Grille 3×2 @maison_mezur              │
│  Fond blanc                             │
├─────────────────────────────────────────┤
│  SECTION 7 — CTA réservation            │
│  Fond navy — "Votre table vous attend"  │
│  Bouton or principal                    │
├─────────────────────────────────────────┤
│  FOOTER                                 │
│  Fond navy foncé — Adresse, horaires,   │
│  téléphone, réseaux sociaux             │
└─────────────────────────────────────────┘
```

---

## 5. Animations & Interactions

### 5.1 Philosophie d'animation

**Règle fondamentale** : chaque animation doit être au service du contenu, jamais pour elle-même. Une animation réussie est celle qu'on perçoit sans la remarquer.

**Durées de référence :**
- Micro-interactions (hover, focus) : `200-300ms`
- Révélations de contenu au scroll : `600-900ms`
- Transitions de page : `500-700ms`
- Hero video fade-in : `1200-1500ms`

**Easing de référence :**
- Entrées : `cubic-bezier(0.16, 1, 0.3, 1)` — rapide puis s'arrête doucement
- Sorties : `cubic-bezier(0.7, 0, 0.84, 0)` — commence doucement, part vite
- Équilibré : `cubic-bezier(0.25, 0.46, 0.45, 0.94)` — ease-out classique premium

---

### 5.2 Hero Section

**Comportement :**
```
1. Loading screen (1s) : fond navy, logo MEZUR en Cormorant Garamond
   → Logo fade-in (opacity 0→1, 800ms, delay 200ms)
   → Logo scale subtil (scale 0.95→1, 1000ms)
   → Disparition loading screen (fade-out 600ms)

2. Hero apparition :
   → Vidéo/photo fond : fade-in (opacity 0→1, 1200ms)
   → Overlay navy : opacity 0.5 (fixe, pour lisibilité du texte)
   → Eyebrow "Brasserie Gastronomique · Valence" : slide-up + fade (400ms delay)
   → Titre "MEZUR" : révélation lettre par lettre (SplitText GSAP, stagger 80ms)
   → Tagline italic : fade-in (200ms delay après titre)
   → CTA "Réserver une table" : slide-up + fade (100ms delay après tagline)
   → Scroll indicator : pulse infini (1.5s loop)

3. Au scroll (parallax) :
   → Vidéo/photo : translateY(+30%) sur toute la hauteur du hero
   → Texte : translateY(+15%) — moins rapide que le fond
   → Overlay : opacity augmente légèrement (0.5→0.65)
```

**Vidéo hero :**
- Format : MP4 + WebM (fallback)
- Durée : 15-30 secondes, loop seamless
- Contenu idéal : ambiance salle en service, mains du chef au travail, plat dressé
- Autoplay silencieux, muted, playsinline
- Fallback image si vidéo non supportée

---

### 5.3 Navigation

**Comportement sticky :**
```
État initial (hero visible) :
  → Position : absolute, fond transparent
  → Logo : blanc, petit (24px letter-spacing large)
  → Liens nav : blanc, opacity 0.8
  → Bouton "Réserver" : border blanc, fond transparent

État scroll (après hero) :
  → Transition : backdrop-blur + fond navy/95% (300ms)
  → Logo : blanc (inchangé)
  → Liens nav : blanc opacity 1
  → Bouton "Réserver" : fond or #C9A96E, texte blanc

Hover liens :
  → Underline slide de gauche à droite (transform: scaleX 0→1, 250ms)
  → Couleur : or #C9A96E
```

---

### 5.4 Révélations au scroll (ScrollTrigger GSAP)

**Pattern 1 — Text reveal (sections titres) :**
```js
// Chaque titre H2 découpé en lignes (SplitText)
// Chaque ligne : translateY(100%) → 0, opacity 0→1
// Trigger : "top 80%" — commence tôt pour être naturel
// Stagger : 120ms entre les lignes
// Duration : 800ms, ease: "power3.out"

gsap.from(splitTitle.lines, {
  y: "100%",
  opacity: 0,
  duration: 0.8,
  stagger: 0.12,
  ease: "power3.out",
  scrollTrigger: {
    trigger: element,
    start: "top 80%",
  }
})
```

**Pattern 2 — Image reveal (clip-path) :**
```js
// Révélation image par clip-path
// "inset(100% 0 0 0)" → "inset(0% 0 0 0)"
// Avec une image interne qui scale légèrement (1.1→1)
// Duration : 900ms, ease: "power4.inOut"

gsap.timeline({ scrollTrigger: { trigger: img, start: "top 85%" } })
  .from(imgContainer, {
    clipPath: "inset(100% 0 0 0)",
    duration: 0.9,
    ease: "power4.inOut"
  })
  .from(imgInner, {
    scale: 1.15,
    duration: 0.9,
    ease: "power4.inOut"
  }, "<")
```

**Pattern 3 — Fade + slide (cartes, elements secondaires) :**
```js
// translateY(40px) + opacity 0 → position normale + opacity 1
// Duration : 600ms, ease: "power2.out"
// Stagger si multiples éléments : 80-120ms

gsap.from(cards, {
  y: 40,
  opacity: 0,
  duration: 0.6,
  stagger: 0.1,
  ease: "power2.out",
  scrollTrigger: { trigger: section, start: "top 75%" }
})
```

**Pattern 4 — Chiffres animés (note Google, stats) :**
```js
// Count-up : 0 → 4.9 au moment où la section entre dans le viewport
// Duration : 1500ms avec ease-out
// Utiliser GSAP ticker ou CountUp.js

gsap.to(counter, {
  innerHTML: 4.9,
  duration: 1.5,
  ease: "power2.out",
  snap: { innerHTML: 0.1 },
  scrollTrigger: { trigger: counter, start: "top 80%" }
})
```

---

### 5.5 Cursor personnalisé

```
Cursor par défaut :
  → Cercle 12px, fond or #C9A96E opacity 0.8
  → Transition de position : 80ms lag (effet magnétique doux)

Hover sur images :
  → Scale 3x (36px), fond transparent, border or
  → Texte "Voir" au centre (Jost 10px uppercase)

Hover sur CTAs :
  → Scale 0.8 (le cursor "s'écrase" sur le bouton)
  → Couleur : blanc

Hover sur liens texte :
  → Scale 1.5, forme ellipse

Implémentation :
  → CSS custom cursor (pointer-events: none)
  → JS : mousemove + requestAnimationFrame pour le lag
  → Masqué sur mobile/tactile
```

---

### 5.6 Transitions de page

```
Sortie de page :
  → Overlay navy monte de bas (translateY 100%→0, 500ms, ease power3.in)
  → Logo MEZUR apparaît au centre de l'overlay (fade-in, 200ms delay)

Entrée de page :
  → Overlay monte encore (translateY 0→-100%, 500ms, ease power3.out)
  → Contenu nouveau : fade-in sections au scroll
```

---

### 5.7 Section Menu — Horizontal Scroll

```
Comportement :
  → Titre "Le menu" pin en haut pendant le scroll horizontal
  → 3-4 cartes plats défilent horizontalement
  → Indicateur de progression en bas (ligne fine qui s'étire)
  → Sur mobile : swipe horizontal natif, pas de hijack

Implémentation GSAP :
  → ScrollTrigger pin de la section
  → Translation X de la galerie synchronisée au scroll Y
  → start: "top top", end: "+=300%"
```

---

### 5.8 Micro-interactions

**Boutons :**
```css
.btn-primary {
  transition: transform 200ms, box-shadow 200ms;
}
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(201, 169, 110, 0.35);
}
.btn-primary:active {
  transform: translateY(0px);
}
```

**Images de plats (hover) :**
```css
.dish-image {
  overflow: hidden;
}
.dish-image img {
  transition: transform 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.dish-image:hover img {
  transform: scale(1.06);
}
```

**Liens de navigation :**
```css
/* Underline qui se déroule de gauche à droite */
.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 1px;
  background: #C9A96E;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 250ms ease;
}
.nav-link:hover::after {
  transform: scaleX(1);
}
```

---

## 6. Typographie — Spécifications techniques

### Polices

```
Titre / Display : Cormorant Garamond
  Source : Google Fonts (gratuit)
  Import : @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&display=swap')
  Déjà présent sur mezurvalence.com — conserver.

Corps / Interface : Jost
  Source : Google Fonts (gratuit, remplace Brandon Grotesque sous licence)
  Import : @import url('https://fonts.googleapis.com/css2?family=Jost:wght@200;300;400;500&display=swap')
```

### Variables CSS

```css
:root {
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body: 'Jost', -apple-system, sans-serif;

  /* Display */
  --text-hero: clamp(72px, 12vw, 140px);
  --text-display: clamp(48px, 7vw, 96px);
  --text-h1: clamp(40px, 5vw, 64px);
  --text-h2: clamp(32px, 4vw, 52px);
  --text-h3: clamp(24px, 3vw, 36px);

  /* Corps */
  --text-body-lg: 17px;
  --text-body: 15px;
  --text-body-sm: 13px;
  --text-caption: 11px;

  /* Spacing */
  --tracking-hero: 0.25em;
  --tracking-h2: 0.08em;
  --tracking-label: 0.35em;
  --tracking-nav: 0.2em;

  /* Line heights */
  --leading-display: 0.95;
  --leading-h: 1.1;
  --leading-body: 1.75;
}
```

### Hiérarchie typographique

| Élément | Police | Taille | Weight | Style | Tracking |
|---------|--------|--------|--------|-------|---------|
| Hero title | Cormorant | `--text-hero` | 300 | normal | 0.25em |
| Hero subtitle | Cormorant | clamp(20px, 2.5vw, 28px) | 300 | italic | 0 |
| Section H2 | Cormorant | `--text-h2` | 400 | normal | 0.05em |
| Card title | Cormorant | `--text-h3` | 400 | normal | 0 |
| Citation | Cormorant | clamp(22px, 3vw, 32px) | 300 | italic | 0 |
| Eyebrow label | Jost | 10-11px | 400 | normal | 0.4em, uppercase |
| Navigation | Jost | 12px | 400 | normal | 0.2em, uppercase |
| Corps | Jost | 15-16px | 300 | normal | 0 |
| Prix | Jost | 13px | 400 | normal | 0.05em |
| Caption | Jost | 11px | 400 | normal | 0.15em |

---

## 7. Palette de couleurs

### Variables CSS

```css
:root {
  /* Couleurs principales — INCHANGEABLES (cohérence print) */
  --navy: #0B1F4B;          /* Couleur principale — fond hero, nav, footer */
  --aubergine: #2A1B3A;     /* Nuance sombre — dégradés, superpositions */
  --white: #FFFFFF;         /* Fond principal contenu */

  /* Nouvelles couleurs — digital uniquement */
  --or: #C9A96E;            /* Accent premium — CTA principal, séparateurs, highlights */
  --or-light: #E8D5A3;      /* Variante claire or — hovers, transparences */
  --creme: #F5F0E8;         /* Fond secondaire chaud — sections alternées */
  --slate: #3D3D3D;         /* Texte corps — plus doux que noir pur */
  --stone: #9B9B9B;         /* Texte secondaire — captions, métadonnées */
  --pearl: #F7F7F7;         /* Fond neutre — cartes, formulaires */

  /* Transparences */
  --navy-90: rgba(11, 31, 75, 0.9);
  --navy-70: rgba(11, 31, 75, 0.7);
  --navy-50: rgba(11, 31, 75, 0.5);
  --navy-20: rgba(11, 31, 75, 0.2);

  /* Ombres */
  --shadow-sm: 0 2px 8px rgba(11, 31, 75, 0.08);
  --shadow-md: 0 8px 24px rgba(11, 31, 75, 0.12);
  --shadow-lg: 0 24px 48px rgba(11, 31, 75, 0.18);
  --shadow-or: 0 8px 24px rgba(201, 169, 110, 0.3);
}
```

### Règles d'usage impératives

- `--navy` domine en hero, navigation, footer
- `--or` est un accent **rare** — CTA principal, séparateurs, détails actifs
- `--creme` alterne avec `--white` pour rythmer les sections sans rupture brutale
- Ne jamais utiliser de couleurs vives (rouge, vert, bleu vif)
- Fond dark → text blanc ou crème, jamais gris moyen
- Fond clair → text slate `#3D3D3D`, jamais noir pur

---

## 8. Photographie & Vidéo

### 8.1 Vidéo hero (priorité absolue)

Pour l'effet wow maximum, la vidéo hero est l'investissement le plus rentable.

**Contenu idéal (ordre de priorité) :**
1. Plan serré sur mains du chef dressant une assiette (macro, lent, cinématographique)
2. Vue de la salle un soir de service — lumière chaude, mouvement léger
3. Verre de vin versé en plan macro — reflets, couleur, mouvement
4. Plat final posé sur table — vapeur légère, lumière rasante

**Specs techniques :**
```
Format       : MP4 (H.264) + WebM (VP9) pour compatibilité
Résolution   : 1920×1080 minimum (1440p pour Retina)
Durée        : 15-25 secondes, loop sans coupure visible
FPS          : 24fps (aspect cinéma) ou 30fps
Audio        : AUCUN — muted absolu
Bitrate      : 4-8 Mbps (compression équilibrée)
Taille cible : < 8MB pour le MP4 principale
Fallback     : Image JPG haute qualité si vidéo non supportée
```

### 8.2 Direction photographie plats

```
Éclairage    : Naturel latéral (fenêtre) ou studio qui l'imite
Fond         : Ardoise sombre, bois naturel, lin beige — jamais fond blanc
Cadrage      : 2/3 plongée douce (40-50°) ou vue de dessus pure
Profondeur   : DOF réduit — fond flou, sujet net
Post-prod    : Tons chauds dans hautes lumières, tons navy/bleus dans ombres
               (cohérence avec palette #0B1F4B dans les ombres)
Formats web  : WebP prioritaire, JPG fallback — srcset pour responsive
```

### 8.3 Direction photographie ambiance

```
Scènes       : Table dressée avant service, salle en fin d'après-midi,
               détails (couverts, verres, carte menu)
Personnes    : Pierre en action en cuisine (pas posé), Thomas en salle
Lumière      : Dorée (heure dorée ou tungstène — jamais lumière froide LED)
Ratio        : 16:9 pour hero, 3:4 pour portraits, 1:1 pour Instagram
```

---

## 9. Composants UI — Spécifications

### 9.1 Navigation (Header)

```html
<!-- Structure -->
<header class="site-header" data-scroll-state="transparent">
  <div class="header-inner">
    <a class="logo" href="/">MEZUR</a>
    <nav class="main-nav">
      <a href="/le-menu">Menu</a>
      <a href="/a-propos">Maison</a>
      <a href="/contact">Contact</a>
    </nav>
    <a href="/reservations" class="btn-reserve">Réserver</a>
  </div>
</header>
```

```css
.site-header {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 100;
  padding: 24px 48px;
  transition: background 300ms, backdrop-filter 300ms;
}

.site-header[data-scroll-state="transparent"] {
  background: transparent;
}

.site-header[data-scroll-state="solid"] {
  background: rgba(11, 31, 75, 0.95);
  backdrop-filter: blur(12px);
}

.logo {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 300;
  letter-spacing: 0.35em;
  color: #FFFFFF;
  text-decoration: none;
  text-transform: uppercase;
}

.main-nav a {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  position: relative;
  transition: color 200ms;
}

.btn-reserve {
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #FFFFFF;
  background: var(--or);
  padding: 12px 28px;
  text-decoration: none;
  transition: background 200ms, transform 200ms;
}

.btn-reserve:hover {
  background: var(--or-light);
  transform: translateY(-1px);
}
```

---

### 9.2 Hero Section

```html
<section class="hero">
  <div class="hero-media">
    <video autoplay muted loop playsinline poster="/assets/hero-poster.jpg">
      <source src="/assets/hero.webm" type="video/webm">
      <source src="/assets/hero.mp4" type="video/mp4">
    </video>
    <div class="hero-overlay"></div>
  </div>

  <div class="hero-content">
    <span class="hero-eyebrow">Brasserie Gastronomique · Valence</span>
    <h1 class="hero-title">MEZUR</h1>
    <p class="hero-tagline">La précision au service du plaisir</p>
    <a href="/reservations" class="btn btn-hero">Réserver une table</a>
  </div>

  <div class="scroll-indicator" aria-hidden="true">
    <span class="scroll-line"></span>
  </div>
</section>
```

```css
.hero {
  position: relative;
  height: 100svh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.hero-media {
  position: absolute;
  inset: 0;
}

.hero-media video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(11, 31, 75, 0.55) 0%,
    rgba(11, 31, 75, 0.4) 50%,
    rgba(11, 31, 75, 0.65) 100%
  );
}

.hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: #FFFFFF;
  max-width: 900px;
  padding: 0 24px;
}

.hero-eyebrow {
  display: block;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 400;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: var(--or);
  margin-bottom: 28px;
  opacity: 0; /* Animé par GSAP */
}

.hero-title {
  font-family: var(--font-display);
  font-size: var(--text-hero);
  font-weight: 300;
  letter-spacing: 0.25em;
  line-height: 0.95;
  margin-bottom: 20px;
  /* Chaque lettre animée par GSAP SplitText */
}

.hero-tagline {
  font-family: var(--font-display);
  font-size: clamp(18px, 2.5vw, 26px);
  font-style: italic;
  font-weight: 300;
  opacity: 0.8;
  margin-bottom: 48px;
  opacity: 0; /* Animé par GSAP */
}

.scroll-indicator {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.scroll-line {
  width: 1px;
  height: 48px;
  background: linear-gradient(to bottom, var(--or), transparent);
  animation: scrollPulse 2s ease-in-out infinite;
}

@keyframes scrollPulse {
  0% { transform: scaleY(0); transform-origin: top; opacity: 1; }
  50% { transform: scaleY(1); transform-origin: top; }
  100% { transform: scaleY(1); transform-origin: bottom; opacity: 0; }
}
```

---

### 9.3 Carte plat

```html
<article class="dish-card">
  <div class="dish-image">
    <img src="..." alt="Nom du plat" loading="lazy" />
  </div>
  <div class="dish-info">
    <span class="dish-category">Entrées</span>
    <h3 class="dish-name">Tomates, Burrata</h3>
    <p class="dish-desc">Tomates anciennes du marché, burrata crémeuse, basilic frais</p>
  </div>
</article>
```

```css
.dish-card {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.dish-image {
  aspect-ratio: 4/5;
  overflow: hidden;
}

.dish-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 700ms cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.dish-card:hover .dish-image img {
  transform: scale(1.06);
}

.dish-info {
  padding: 20px 0 0;
}

.dish-category {
  display: block;
  font-family: var(--font-body);
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.35em;
  text-transform: uppercase;
  color: var(--or);
  margin-bottom: 8px;
}

.dish-name {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 400;
  color: var(--navy);
  margin-bottom: 8px;
}

.dish-desc {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 300;
  font-style: italic;
  color: var(--stone);
  line-height: 1.6;
  margin: 0;
}
```

---

### 9.4 Section Preuve Sociale

```html
<section class="social-proof">
  <div class="rating">
    <span class="rating-stars">★★★★★</span>
    <span class="rating-score">4.9</span>
    <span class="rating-source">sur Google</span>
  </div>
  <div class="testimonials">
    <blockquote class="testimonial">
      <p>"Une adresse qui monte vite et qui le mérite. Pierre signe des assiettes précises et généreuses à la fois."</p>
      <cite>Marie L. — Google Review</cite>
    </blockquote>
    <!-- ... -->
  </div>
</section>
```

---

### 9.5 Footer

```html
<footer class="site-footer">
  <div class="footer-inner">
    <div class="footer-brand">
      <span class="footer-logo">MEZUR</span>
      <p class="footer-tagline">Brasserie Gastronomique</p>
    </div>
    <div class="footer-info">
      <div class="footer-col">
        <h4>Adresse</h4>
        <address>4 Rue de l'Université<br>26000 Valence</address>
      </div>
      <div class="footer-col">
        <h4>Horaires</h4>
        <p>Lun–Ven : 11h30–14h30 / 19h–21h30<br>Sam : 10h–22h</p>
      </div>
      <div class="footer-col">
        <h4>Contact</h4>
        <a href="tel:+33475412286">04 75 41 22 86</a>
        <a href="https://www.instagram.com/maison_mezur/">@maison_mezur</a>
      </div>
      <div class="footer-col">
        <a href="/reservations" class="btn btn-or">Réserver une table</a>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2026 MEZUR · Tous droits réservés</span>
  </div>
</footer>
```

---

## 10. Stack technique recommandée

### Option A — Framer (recommandée pour rapidité)

```
Avantages :
  - Animations natives de très haute qualité sans code
  - Framer Motion intégré (React)
  - Export de code React propre
  - CMS intégré pour le menu (mis à jour sans dev)
  - Performance Lighthouse > 90 out of the box
  - Domaine custom simple

Inconvénients :
  - Moins de contrôle sur le code custom
  - Abonnement mensuel ($15-25/mois)

Pour MEZUR : idéal si on veut livrer vite avec un résultat premium
```

### Option B — Webflow

```
Avantages :
  - Contrôle total du design sans code
  - Interactions et animations puissantes (GSAP natif en 2026)
  - CMS intégré
  - Très utilisé par les agences premium (Fuga, Lucky Folks...)
  - Export HTML/CSS possible

Inconvénients :
  - Courbe d'apprentissage
  - Plus cher ($23-39/mois pour les features avancées)

Pour MEZUR : meilleure option si l'animation GSAP custom est prioritaire
```

### Option C — Next.js + GSAP (pour Claude Code)

```
Avantages :
  - Contrôle absolu sur chaque animation
  - Performance maximale
  - SEO optimal (SSG/SSR)
  - Stack modern : React, Tailwind, GSAP, Lenis

Inconvénients :
  - Nécessite un développeur pour les mises à jour
  - Hébergement à gérer (Vercel recommandé)

Pour MEZUR : recommandé si l'objectif est le site le plus premium possible

Stack complète :
  - Next.js 14+ (App Router)
  - Tailwind CSS (utilitaires)
  - GSAP 3 + ScrollTrigger + SplitText
  - Lenis (smooth scroll)
  - Framer Motion (composants React)
  - Sanity.io ou Notion API (CMS menu)
  - Vercel (hébergement)
```

### Dépendances npm (Option C)

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "tailwindcss": "^3.4.0",
    "gsap": "^3.12.0",
    "framer-motion": "^11.0.0",
    "@studio-freight/lenis": "^1.0.0"
  }
}
```

### Librairies d'animation à connaître

| Librairie | Usage | Doc |
|-----------|-------|-----|
| GSAP + ScrollTrigger | Animations au scroll, SplitText, timelines | gsap.com |
| Lenis | Smooth scroll premium | github.com/studio-freight/lenis |
| Framer Motion | Transitions de page, micro-interactions React | framer.com/motion |
| Embla Carousel | Carousel/swipe mobile natif | embla-carousel.com |

---

## 11. Ton éditorial & Copywriting

### Voix de MEZUR

- **Sobre** : pas d'adjectifs superflus ("savoureux", "délicieux", "exceptionnel" — bannis)
- **Confiante** : affirmative, sans justification ni sur-explication
- **Sensuelle** : les mots doivent évoquer le goût, la texture, la chaleur
- **Personnelle** : Pierre et Thomas sont des personnages, pas "l'équipe"

### Formulations clés

| Contexte | À éviter | Recommandé |
|---------|---------|------------|
| Hero accroche | "Découvrez notre cuisine raffinée" | "La précision au service du plaisir." |
| Concept | "Nous proposons une cuisine gastronomique de qualité" | "MEZUR est né d'une obsession : faire juste." |
| À propos | "Notre équipe passionnée vous accueille" | "Pierre cuisine. Thomas sélectionne les vins. Ensemble, ils créent les conditions du plaisir." |
| CTA réservation | "Réservez votre table en ligne" | "Votre table vous attend." |
| Menu section | "Découvrez notre menu de saison" | "Ce que Pierre propose ce mois-ci." |

### Utiliser le jeu de mots "mesure"

Le nom MEZUR est une opportunité éditoriale à exploiter dans tous les supports :

- "Une expérience à votre mesure"
- "Sur mesure, pour chaque convive"
- "Nos plats sont des études en mesure"
- "La mesure du bon goût"
- "Rien de superflu. Tout à sa mesure."

---

## Ressources

### Sites de référence à visiter

| Site | URL | Points clés |
|------|-----|-------------|
| Septime Paris | septime-charonne.fr | Typographie, minimalisme |
| Fuga Paris | fuga-website.webflow.io | Narration, Webflow |
| Gucci Osteria | gucciosteria.com | Fond dark, image reveal |
| Noma | noma.dk | Vide, discipline |
| Eleven Madison | elevenmadisonpark.com | Valeurs, clarté |
| Quay Sydney | quay.com.au | Plein écran |

### Outils d'animation

| Outil | URL | Usage |
|-------|-----|-------|
| GSAP | gsap.com | Animations principales |
| GSAP ScrollTrigger | gsap.com/scrolltrigger | Scroll animations |
| Lenis | lenis.dev | Smooth scroll |
| Framer Motion | framer.com/motion | React transitions |

### Polices Google Fonts

```
Cormorant Garamond : fonts.google.com/specimen/Cormorant+Garamond
Jost               : fonts.google.com/specimen/Jost
```

---

*Document créé le 14 juin 2026 — Mezur, Valence.*
*Ce fichier est la référence principale pour le développement du site. Toute décision technique ou visuelle doit y être confrontée.*
