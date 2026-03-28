# Manuel Utilisateur — OngolaDrive

> Version 1.0 — Mars 2026
> Plateforme de drive en ligne pour les marchés de Yaoundé

---

## Table des matières

1. [Présentation de l'application](#1-présentation-de-lapplication)
2. [Créer un compte](#2-créer-un-compte)
3. [Se connecter](#3-se-connecter)
4. [Parcourir les marchés et boutiques](#4-parcourir-les-marchés-et-boutiques)
5. [Ajouter des produits au panier](#5-ajouter-des-produits-au-panier)
6. [Passer une commande](#6-passer-une-commande)
7. [Payer sa commande](#7-payer-sa-commande)
8. [Suivre sa commande en temps réel](#8-suivre-sa-commande-en-temps-réel)
9. [Notifications](#9-notifications)
10. [Historique des commandes](#10-historique-des-commandes)
11. [Guide du vendeur](#11-guide-du-vendeur)
12. [Guide du livreur](#12-guide-du-livreur)

---

## 1. Présentation de l'application

OngolaDrive est une application web progressive (PWA) permettant de commander des produits auprès des boutiques des marchés de Yaoundé et de se les faire livrer à domicile ou de les récupérer sur place.

**Accès :** Ouvrez votre navigateur et rendez-vous sur l'URL de l'application. Vous pouvez également l'installer comme une application native depuis votre navigateur (bouton « Ajouter à l'écran d'accueil »).

**Rôles disponibles :**

| Rôle | Description |
|---|---|
| Client | Parcourir, commander et suivre des livraisons |
| Vendeur | Gérer sa boutique, ses produits et ses commandes |
| Livreur | Accepter et effectuer des livraisons |

---

## 2. Créer un compte

1. Depuis la page d'accueil, appuyez sur **« S'inscrire »**.
2. Renseignez :
   - Votre **nom complet**
   - Votre **adresse e-mail**
   - Un **mot de passe** (minimum 8 caractères)
3. Appuyez sur **« Créer mon compte »**.
4. Un e-mail de confirmation vous est envoyé. Cliquez sur le lien qu'il contient pour activer votre compte.

> **Connexion par OTP :** Vous pouvez également vous inscrire et vous connecter en entrant votre numéro de téléphone. Un code à 6 chiffres vous sera envoyé par SMS.

---

## 3. Se connecter

1. Depuis la page d'accueil, appuyez sur **« Se connecter »**.
2. Entrez votre **e-mail** et votre **mot de passe**, puis appuyez sur **« Connexion »**.

**Connexion par téléphone (OTP) :**
1. Appuyez sur **« Connexion par téléphone »**.
2. Entrez votre numéro au format international (ex : `+237 6XX XXX XXX`).
3. Saisissez le code à 6 chiffres reçu par SMS dans la page `/otp`.

> Après connexion, vous êtes redirigé automatiquement vers votre tableau de bord selon votre rôle.

---

## 4. Parcourir les marchés et boutiques

### Tableau de bord client (`/dashboard`)

Le tableau de bord affiche la liste des marchés disponibles. Chaque carte de marché indique :
- Le nom et la ville du marché
- Le nombre de boutiques actives
- L'adresse

Appuyez sur un marché pour accéder à la liste de ses boutiques.

### Page marché (`/markets/[slug]`)

Affiche toutes les boutiques actives du marché. Pour chaque boutique :
- Nom et description
- Indicateur **Ouvert / Fermé**
- Catégories de produits proposées

Appuyez sur une boutique pour voir ses produits.

### Page boutique (`/markets/[slug]/shops/[shopSlug]`)

Liste tous les produits disponibles de la boutique :
- Photo, nom, description, prix unitaire (en FCFA)
- Indicateur de disponibilité
- Bouton **« Ajouter au panier »**

> **Important :** Vous ne pouvez commander que dans un seul marché à la fois. Si vous ajoutez un produit d'un marché différent de celui de votre panier en cours, un message de confirmation vous demandera si vous souhaitez vider votre panier et commencer une nouvelle commande.

---

## 5. Ajouter des produits au panier

1. Sur la page d'une boutique, appuyez sur **« Ajouter au panier »** à côté du produit souhaité.
2. L'icône du panier dans l'en-tête se met à jour avec le nombre d'articles.
3. Vous pouvez ajouter des produits de **plusieurs boutiques** du même marché dans un seul panier.

### Modifier le panier (`/cart`)

Appuyez sur l'icône panier pour accéder à votre panier :
- Modifier la **quantité** de chaque article (boutons + et −)
- **Supprimer** un article
- Voir le **total** de la commande
- Appuyer sur **« Passer la commande »** pour continuer

---

## 6. Passer une commande

Depuis la page panier, appuyez sur **« Passer la commande »** pour accéder à la page de checkout (`/checkout`).

### Informations à renseigner

| Champ | Description |
|---|---|
| Mode de livraison | **Livraison à domicile** ou **Retrait sur place** |
| Adresse de livraison | Obligatoire si livraison (rue, quartier, indications) |
| Mode de paiement | Voir section suivante |
| Notes | Instructions spéciales pour le vendeur (optionnel) |

### Modes de livraison

- **Livraison à domicile :** Un livreur de la plateforme vient récupérer votre commande au marché et vous la livre. Frais de livraison applicables.
- **Retrait sur place :** Vous venez récupérer votre commande directement à la boutique. Pas de frais de livraison.

---

## 7. Payer sa commande

### Modes de paiement disponibles

| Mode | Conditions |
|---|---|
| MTN Mobile Money | Livraison ou retrait |
| Orange Money | Livraison ou retrait |
| Carte bancaire (CB/Visa) | Livraison ou retrait |
| Cash (espèces) | Retrait sur place uniquement |

### Paiement électronique (Mobile Money / CB)

1. Sélectionnez votre mode de paiement et appuyez sur **« Confirmer et payer »**.
2. Vous êtes redirigé vers la **page de paiement sécurisée CinetPay**.
3. Suivez les instructions à l'écran pour valider le paiement sur votre téléphone ou avec votre carte.
4. Une fois le paiement validé, vous êtes redirigé vers la page **« Paiement réussi »** et votre commande passe automatiquement en statut **Confirmée**.

> En cas d'échec du paiement, vous êtes redirigé vers la page **« Paiement échoué »**. Votre commande est annulée et aucun montant n'est débité.

### Paiement en espèces

1. Sélectionnez **« Cash »** et confirmez la commande.
2. Votre commande est enregistrée directement avec le statut **En attente**.
3. Le paiement s'effectue en main propre au moment du retrait.

---

## 8. Suivre sa commande en temps réel

Après confirmation, accédez à votre commande via **Mes commandes** ou le lien dans votre notification.

### Statuts d'une commande

```
En attente → Confirmée → En préparation → En livraison → Livrée
                                     ↘
                              Prête (retrait)
```

| Statut | Description |
|---|---|
| En attente | Commande enregistrée, paiement non encore confirmé |
| Confirmée | Paiement accepté, vendeur notifié |
| En préparation | Le(s) vendeur(s) prépare(nt) vos articles |
| En livraison | Un livreur a collecté votre commande et est en route |
| Prête | Votre commande est disponible au retrait |
| Livrée | Commande remise |
| Annulée | Commande annulée (paiement échoué ou autre raison) |

### Suivi en direct

La page de détail d'une commande (`/orders/[id]`) affiche :
- La **barre de progression animée** avec l'étape en cours
- Le **statut mis à jour en temps réel** (sans recharger la page)
- Les articles commandés par boutique
- Le récapitulatif du montant et du mode de paiement

---

## 9. Notifications

La cloche en haut à droite de l'écran affiche le nombre de notifications non lues.

### Types de notifications

| Type | Événement déclencheur |
|---|---|
| Commande confirmée | Paiement accepté |
| Commande en route | Le livreur a collecté votre commande |
| Commande livrée | Livraison confirmée par le livreur |
| Paiement refusé | Echec du paiement |

### Actions disponibles

- **Appuyer** sur une notification → marque comme lue et navigue vers la commande concernée
- **« Tout marquer lu »** → marque toutes les notifications comme lues
- La cloche disparaît automatiquement si vous cliquez en dehors du panneau

---

## 10. Historique des commandes

Accédez à toutes vos commandes via l'onglet **« Commandes »** dans la navigation bas de page (`/orders`).

La liste affiche pour chaque commande :
- Numéro de commande
- Date et montant total
- Statut actuel (badge coloré)
- Lien vers le détail

---

## 11. Guide du vendeur

> Accessible depuis `/vendor/dashboard` — réservé aux comptes avec le rôle **Vendeur**.

### Accéder au tableau de bord vendeur

Après connexion, si votre compte est configuré comme vendeur, vous êtes redirigé vers `/vendor/dashboard`.

### Tableau de bord (`/vendor/dashboard`)

Affiche un résumé de votre activité :
- Nombre de commandes du jour
- Chiffre d'affaires du jour
- Articles les plus vendus
- Commandes récentes

### Gérer sa boutique (`/vendor/shop`)

Modifiez les informations de votre boutique :
- Nom et description
- Photo de couverture
- Catégorie principale

**Ouvrir / Fermer la boutique :** Le bouton bascule dans la barre latérale permet d'indiquer si votre boutique est **ouverte** ou **fermée**. Une boutique fermée n'apparaît pas dans les recherches des clients.

> La boutique doit être **approuvée** par l'administrateur du marché avant d'être visible.

### Gérer ses produits (`/vendor/products`)

Liste tous vos produits avec leur disponibilité et leur prix.

**Ajouter un produit** (`/vendor/products/new`) :
1. Renseignez le nom, la description, le prix et la catégorie.
2. Téléchargez une photo du produit.
3. Appuyez sur **« Enregistrer »**.

**Modifier un produit** (`/vendor/products/[id]/edit`) :
1. Appuyez sur le produit dans la liste.
2. Modifiez les champs souhaités et enregistrez.

**Rendre un produit indisponible :** Utilisez le bouton bascule de disponibilité sans supprimer le produit. Les produits indisponibles ne s'affichent pas aux clients.

### Gérer les commandes (`/vendor/orders`)

Liste toutes les commandes contenant vos articles, triées de la plus récente à la plus ancienne.

Pour chaque ligne de commande, vous pouvez mettre à jour le statut de préparation de l'article (ex : « En préparation », « Prêt »).

### Alertes de nouvelles commandes (Temps réel)

Dès qu'un client commande un de vos produits, une **notification toast** apparaît en bas à droite de votre écran :
- Numéro de commande
- Article commandé et quantité
- Montant

Appuyez sur la croix pour fermer l'alerte.

---

## 12. Guide du livreur

> Accessible depuis `/driver/deliveries` — réservé aux comptes avec le rôle **Livreur**.

### Tableau de bord livreur

Affiche la liste de vos livraisons assignées, avec leur statut et l'adresse de destination.

### Détail d'une livraison (`/driver/deliveries/[id]`)

Affiche :
- Les articles à collecter et la boutique d'origine
- L'adresse de livraison du client
- Le statut actuel
- Les boutons d'action

### Déroulé d'une livraison

**Étape 1 — Collecte au marché**
1. Rendez-vous à la boutique indiquée.
2. Récupérez les articles de la commande.
3. Appuyez sur **« Confirmer la collecte »**.
4. Le statut passe à **En livraison** et le client est notifié automatiquement.

**Étape 2 — Livraison au client**
1. Rendez-vous à l'adresse indiquée.
2. Remettez les articles au client.
3. Appuyez sur **« Confirmer la livraison »**.
4. Le statut passe à **Livrée** et le client reçoit une notification.

### Partage de position (GPS)

Pendant une livraison active, l'application partage automatiquement votre position GPS toutes les 5 secondes. Cela permet au client de suivre votre déplacement sur la carte.

> Autorisez l'accès à la géolocalisation lorsque le navigateur vous le demande.

### Mon profil (`/driver/profile`)

Permet de renseigner ou mettre à jour :
- Votre numéro de téléphone
- Le type et la plaque de votre véhicule
- Votre photo de profil

---

*Pour toute question ou problème, contactez le support OngolaDrive.*
