# Manuel Administrateur — OngolaDrive

> Version 1.0 — Mars 2026
> Plateforme de drive en ligne pour les marchés de Yaoundé

---

## Table des matières

1. [Architecture et rôles administratifs](#1-architecture-et-rôles-administratifs)
2. [Super Admin — Gestion des marchés](#2-super-admin--gestion-des-marchés)
3. [Admin de marché — Tableau de bord](#3-admin-de-marché--tableau-de-bord)
4. [Gestion des boutiques](#4-gestion-des-boutiques)
5. [Gestion des livreurs](#5-gestion-des-livreurs)
6. [Flux de validation d'une boutique](#6-flux-de-validation-dune-boutique)
7. [Paiements et commandes](#7-paiements-et-commandes)
8. [Notifications système](#8-notifications-système)
9. [Variables d'environnement](#9-variables-denvironnement)
10. [Architecture technique](#10-architecture-technique)
11. [Base de données Supabase](#11-base-de-données-supabase)
12. [Déploiement](#12-déploiement)

---

## 1. Architecture et rôles administratifs

OngolaDrive est une plateforme **multi-marchés** : chaque marché est un tenant indépendant avec ses boutiques, livreurs et administrateur.

### Hiérarchie des rôles

```
super_admin
    └── market_admin  (un par marché)
            ├── vendor       (un par boutique)
            ├── delivery_agent
            └── customer
```

| Rôle | Accès | Route principale |
|---|---|---|
| `super_admin` | Tous les marchés, création/suppression | `/admin/markets` |
| `market_admin` | Son marché uniquement | `/admin/dashboard` |
| `vendor` | Sa boutique et ses commandes | `/vendor/dashboard` |
| `delivery_agent` | Ses livraisons assignées | `/driver/deliveries` |
| `customer` | Ses propres commandes | `/dashboard` |

### Attribution des rôles

Les rôles sont stockés dans la table `profiles.role`. Ils sont attribués :
- À la création de compte via l'interface d'inscription (rôle `customer` par défaut)
- Manuellement via Supabase Dashboard ou migration SQL pour les rôles `super_admin` et `market_admin`
- Automatiquement lors de la création d'une boutique approuvée (rôle `vendor`)

---

## 2. Super Admin — Gestion des marchés

> Accessible depuis `/admin/markets` — réservé au rôle `super_admin`.

### Créer un marché (`/admin/markets/new`)

1. Accédez à **Marchés → Nouveau marché**.
2. Renseignez les informations :

| Champ | Description | Obligatoire |
|---|---|---|
| Nom | Nom du marché (ex : « Marché Central ») | Oui |
| Slug | Identifiant URL (ex : `marche-central`) — généré automatiquement | Oui |
| Ville | Ville du marché | Oui |
| Adresse | Adresse complète | Oui |
| Latitude / Longitude | Coordonnées GPS pour la carte | Recommandé |
| Description | Présentation du marché | Non |
| Image | Photo de couverture | Non |

3. Appuyez sur **« Créer le marché »**.

> Le marché est créé avec le statut **Inactif** par défaut. Il doit être activé manuellement pour être visible des clients.

### Modifier un marché (`/admin/markets/[slug]/edit`)

1. Dans la liste des marchés, appuyez sur **« Modifier »** à côté du marché.
2. Modifiez les champs souhaités et enregistrez.

### Activer / Désactiver un marché

Depuis la liste des marchés, utilisez le bouton bascule de statut (`MarketToggleStatus`) :
- **Actif** → visible par les clients dans le tableau de bord
- **Inactif** → masqué des clients, toutes les boutiques inaccessibles

### Supprimer un marché

La suppression d'un marché est irréversible et entraîne la suppression en cascade de toutes ses boutiques, produits, commandes et livreurs associés.

> Effectuez cette opération directement via le **Supabase Dashboard** après archivage des données.

---

## 3. Admin de marché — Tableau de bord

> Accessible depuis `/admin/dashboard` — réservé au rôle `market_admin`.

L'admin de marché voit uniquement les données de son marché. Le tableau de bord affiche :

- **Boutiques** : nombre total, en attente de validation, actives
- **Commandes** : commandes du jour, chiffre d'affaires du jour
- **Livreurs** : nombre actifs / total
- Liens rapides vers chaque section de gestion

---

## 4. Gestion des boutiques

> Accessible depuis `/admin/shops`.

### Liste des boutiques

Affiche toutes les boutiques du marché avec :
- Nom du vendeur et nom de la boutique
- Statut : `pending` (en attente), `approved` (approuvée), `rejected` (refusée), `suspended` (suspendue)
- Indicateur ouvert/fermé
- Actions disponibles selon le statut

### Statuts d'une boutique

```
pending → approved → (active dans le marché)
        ↘ rejected
approved → suspended → approved
```

| Statut | Visibilité client | Action possible |
|---|---|---|
| `pending` | Non | Approuver / Refuser |
| `approved` | Oui (si boutique ouverte) | Suspendre |
| `rejected` | Non | — |
| `suspended` | Non | Réactiver |

### Approuver une boutique

1. Dans la liste, repérez les boutiques avec le badge **« En attente »**.
2. Appuyez sur **« Approuver »**.
3. La boutique devient visible ; le compte du propriétaire reçoit automatiquement le rôle `vendor`.

### Refuser une boutique

1. Appuyez sur **« Refuser »**.
2. Saisissez un motif de refus (optionnel, communiqué au vendeur).

### Suspendre / Réactiver

- **Suspendre** une boutique approuvée la masque immédiatement des clients sans suppression.
- **Réactiver** la remet en ligne.

---

## 5. Gestion des livreurs

> Accessible depuis `/admin/drivers`.

### Liste des livreurs

Affiche tous les livreurs inscrits sur le marché avec :
- Nom, téléphone, type de véhicule
- Statut actif / inactif
- Nombre de livraisons effectuées

### Activer / Désactiver un livreur (`DriverToggleActive`)

- Un livreur **inactif** n'apparaît pas dans les assignations automatiques et ne peut pas voir ses livraisons.
- Un livreur **actif** peut recevoir et effectuer des livraisons.

### Assignation des livraisons

L'assignation est actuellement **manuelle** : l'admin attribue une livraison à un livreur disponible depuis le Supabase Dashboard (table `deliveries`, champ `driver_id`).

> Une future évolution pourra automatiser l'assignation selon la disponibilité et la proximité GPS.

---

## 6. Flux de validation d'une boutique

Voici le parcours complet depuis l'inscription d'un vendeur :

```
1. Le futur vendeur crée un compte (rôle customer par défaut)
2. Il soumet sa demande d'ouverture de boutique (nom, description, catégorie, photo)
3. La boutique est créée avec status = 'pending'
4. L'admin du marché reçoit une alerte (tableau de bord)
5. L'admin examine la demande et choisit : Approuver ou Refuser
   → Approuver : status = 'approved', profile.role = 'vendor'
   → Refuser   : status = 'rejected'
6. Le vendeur peut désormais gérer sa boutique et ses produits
```

---

## 7. Paiements et commandes

### Vue d'ensemble des paiements

Les paiements sont traités par **CinetPay** (Mobile Money + carte bancaire). L'état d'un paiement est stocké dans la table `payments`.

| Statut paiement | Description |
|---|---|
| `pending` | Paiement initié, en attente de confirmation CinetPay |
| `completed` | Paiement accepté par CinetPay |
| `failed` | Paiement refusé par CinetPay |

### Webhook CinetPay

Le webhook (`POST /api/webhooks/cinetpay`) est appelé automatiquement par CinetPay après chaque transaction. Il :
1. Vérifie l'authenticité via `CINETPAY_SITE_ID`
2. Appelle l'API CinetPay pour confirmer le statut réel
3. Met à jour `payments.status` et `orders.status`
4. Envoie une notification au client

> **URL à configurer dans le back-office CinetPay :**
> `https://votre-domaine.com/api/webhooks/cinetpay`

### Statuts d'une commande

| Statut | Déclencheur |
|---|---|
| `pending` | Commande créée |
| `confirmed` | Paiement accepté (ou cash sélectionné) |
| `preparing` | Mis à jour manuellement par le vendeur |
| `ready` | Vendeur : tous les articles prêts (retrait) |
| `delivering` | Livreur confirme la collecte |
| `delivered` | Livreur confirme la livraison |
| `cancelled` | Paiement refusé ou annulation manuelle |

### Remboursements

Les remboursements ne sont pas gérés automatiquement. En cas de litige, traitez-les manuellement via votre interface CinetPay et mettez à jour le statut de la commande dans Supabase.

---

## 8. Notifications système

### API interne (`POST /api/notifications/send`)

Protégée par le header `Authorization: Bearer INTERNAL_API_SECRET`. Utilisable uniquement depuis du code serveur.

**Corps de la requête :**
```json
{
  "userId": "uuid-du-destinataire",
  "title": "Titre de la notification",
  "body": "Corps du message",
  "type": "order_update | order_ready | system",
  "data": { "order_id": "uuid" }
}
```

### Helper serveur (`src/lib/notifications.ts`)

Pour appeler depuis un route handler ou server action :
```typescript
import { sendNotification } from '@/lib/notifications'

await sendNotification({
  userId: '...',
  title: 'Titre',
  body: 'Message',
  type: 'order_update',
  data: { order_id: '...' },
})
```

### Notifications automatiques déclenchées

| Événement | Destinataire | Type |
|---|---|---|
| Paiement accepté | Client | `order_update` |
| Paiement refusé | Client | `order_update` |
| Livreur collecte | Client | `order_update` |
| Livraison effectuée | Client | `order_ready` |

---

## 9. Variables d'environnement

Fichier `.env.local` (développement) — à configurer dans les variables d'environnement Vercel en production.

| Variable | Description | Exposée au client |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase | Oui |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase | Oui |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service Supabase (bypass RLS) | **Non** |
| `CINETPAY_API_KEY` | Clé API CinetPay | **Non** |
| `CINETPAY_SITE_ID` | Identifiant site CinetPay | **Non** |
| `NEXT_PUBLIC_CINETPAY_BASE_URL` | URL de base CinetPay v2 | Oui |
| `NEXT_PUBLIC_APP_URL` | URL publique de l'application | Oui |
| `INTERNAL_API_SECRET` | Secret pour l'API de notifications interne | **Non** |

> **Sécurité :** Les variables sans `NEXT_PUBLIC_` ne sont jamais exposées au navigateur. Ne commitez jamais `.env.local` dans git.

---

## 10. Architecture technique

### Stack

| Couche | Technologie |
|---|---|
| Framework | Next.js 16.2.1 (App Router, TypeScript) |
| Style | Tailwind CSS v4 |
| Base de données | Supabase (PostgreSQL + PostGIS) |
| Auth | Supabase Auth (email/password + OTP SMS) |
| Temps réel | Supabase Realtime (`postgres_changes`) |
| Stockage fichiers | Supabase Storage |
| Paiement | CinetPay v2 |
| State client | Zustand (panier persisté en localStorage) |
| PWA | next-pwa (service worker, manifest) |

### Structure des dossiers

```
src/
├── app/
│   ├── (auth)/          # Login, register, OTP
│   ├── (client)/        # Dashboard, marchés, boutiques, commandes, checkout
│   ├── (vendor)/        # Tableau de bord vendeur
│   ├── (driver)/        # Tableau de bord livreur
│   ├── (admin)/         # Back-office admin
│   ├── actions/         # Server Actions Next.js
│   └── api/
│       ├── payments/initiate/
│       ├── webhooks/cinetpay/
│       └── notifications/send/
├── components/
│   ├── admin/
│   ├── vendor/
│   ├── driver/
│   └── client/
├── hooks/               # useNotifications, useRealtimeOrder, useRealtimeVendorOrders
├── lib/                 # supabase, cinetpay, notifications, utils
├── store/               # Zustand cart
└── types/               # database.ts (types TypeScript DB)
```

### Sécurité

- **Row Level Security (RLS)** activée sur toutes les tables Supabase
- Le `service_role` n'est utilisé que côté serveur (webhooks, server actions, helper `sendNotification`)
- L'API `/api/notifications/send` est protégée par `INTERNAL_API_SECRET`
- Le webhook CinetPay vérifie `CINETPAY_SITE_ID` avant tout traitement
- La route guard (`src/proxy.ts`) redirige les utilisateurs non authentifiés

### Realtime Supabase

Trois canaux actifs en cours d'utilisation :

| Canal | Table | Filtre | Utilisé par |
|---|---|---|---|
| `notifications:{userId}` | `notifications` | `user_id=eq.{userId}` | `useNotifications` (client) |
| `order:{orderId}` | `orders` | `id=eq.{orderId}` | `useRealtimeOrder` (client) |
| `vendor-orders:{shopId}` | `order_items` | `shop_id=eq.{shopId}` | `useRealtimeVendorOrders` (vendeur) |

---

## 11. Base de données Supabase

### Tables principales

| Table | Description |
|---|---|
| `profiles` | Données utilisateur, rôle, avatar |
| `markets` | Marchés (nom, ville, coordonnées GPS, statut) |
| `shops` | Boutiques (owner_id, market_id, statut, is_open) |
| `products` | Produits (shop_id, prix, disponibilité) |
| `orders` | Commandes (customer_id, market_id, statut, montant total) |
| `order_items` | Lignes de commande (order_id, shop_id, product_id, quantité, prix) |
| `payments` | Paiements (order_id, méthode, statut, transaction_id CinetPay) |
| `deliveries` | Livraisons (order_id, driver_id, statut, position GPS) |
| `notifications` | Notifications in-app (user_id, title, body, type, is_read) |

### Extensions PostgreSQL requises

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Colonnes GPS

- `markets.location` → `GEOGRAPHY(POINT, 4326)`
- `shops.location` → `GEOGRAPHY(POINT, 4326)`
- `deliveries.location` → `GEOGRAPHY(POINT, 4326)` — mis à jour en temps réel par le livreur

### Pattern de typage TypeScript

En raison d'une incompatibilité de types entre `@supabase/ssr` 0.9.0 et `@supabase/supabase-js` 2.100.1, toutes les mutations Supabase utilisent un cast explicite :

```typescript
// Lecture
const { data } = await supabase
  .from('orders')
  .select('...')
  .single() as { data: OrderType | null; error: unknown }

// Écriture
await (supabase.from('orders') as any)
  .update({ status: 'confirmed' })
  .eq('id', orderId)
```

---

## 12. Déploiement

### Pré-requis

- Compte [Vercel](https://vercel.com)
- Projet Supabase avec les tables et extensions créées
- Compte CinetPay avec `API_KEY` et `SITE_ID` de production
- Domaine personnalisé (recommandé)

### Étapes de déploiement sur Vercel

1. **Connecter le dépôt Git** à Vercel (GitHub / GitLab / Bitbucket).

2. **Configurer les variables d'environnement** dans *Settings → Environment Variables* :

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CINETPAY_API_KEY=
CINETPAY_SITE_ID=
NEXT_PUBLIC_CINETPAY_BASE_URL=https://api-checkout.cinetpay.com/v2
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
INTERNAL_API_SECRET=<générer une chaîne aléatoire longue>
```

3. **Déployer** : Vercel détecte automatiquement Next.js et lance le build.

4. **Configurer le webhook CinetPay** dans votre espace CinetPay :
   - URL de notification : `https://votre-domaine.com/api/webhooks/cinetpay`

5. **Configurer les URL de redirection Supabase** dans *Authentication → URL Configuration* :
   - Site URL : `https://votre-domaine.com`
   - Redirect URLs : `https://votre-domaine.com/**`

### Vérifications post-déploiement

- [ ] Connexion e-mail et OTP SMS fonctionnels
- [ ] Tunnel Supabase Realtime opérationnel (vérifier les logs Supabase)
- [ ] Paiement CinetPay en mode production (effectuer un test réel)
- [ ] Webhook CinetPay reçu et traité (vérifier les logs Vercel)
- [ ] PWA installable sur mobile (HTTPS requis)
- [ ] Notifications en temps réel (cloche client, toast vendeur)

### Commandes utiles

```bash
# Build local
npm run build

# Vérifier les types TypeScript
npx tsc --noEmit

# Lancer en production locale
npm start
```

---

*Pour toute question technique, consultez la documentation [Supabase](https://supabase.com/docs) et [Next.js](https://nextjs.org/docs).*
