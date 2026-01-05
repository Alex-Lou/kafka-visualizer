# Cas d'Usage de Démonstration - E-Commerce Platform

## 📋 Scénario

Vous êtes l'équipe DevOps d'une plateforme e-commerce qui utilise Kafka pour gérer tous les événements métier en temps réel.

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│   Orders    │────▶│    Kafka    │────▶│  Analytics   │
│   Service   │     │   Cluster   │     │   Service    │
└─────────────┘     └─────────────┘     └──────────────┘
                           │
                           ├─────────────▶ Inventory Service
                           │
                           ├─────────────▶ Notification Service
                           │
                           └─────────────▶ Shipping Service
```

## 📊 Topics Kafka

### 1. **orders.created**
- Événements de création de commandes
- Contient : orderId, customerId, items, totalAmount, timestamp
- Partition par : customerId

### 2. **orders.completed**
- Événements de finalisation de commandes
- Contient : orderId, status, completedAt
- Partition par : orderId

### 3. **inventory.updates**
- Mises à jour du stock
- Contient : productId, quantity, warehouse, timestamp
- Partition par : productId

### 4. **customer.notifications**
- Notifications envoyées aux clients
- Contient : customerId, notificationType, channel, message
- Partition par : customerId

### 5. **payment.transactions**
- Transactions de paiement
- Contient : transactionId, orderId, amount, status, method
- Partition par : orderId

### 6. **shipping.events**
- Événements de livraison
- Contient : shipmentId, orderId, status, location, estimatedDelivery
- Partition par : shipmentId

## 🎬 Flux de la Démo

### Phase 1 : Configuration (0-30s)
1. Kafka démarre via Docker Compose
2. Backend se connecte à Kafka
3. Les 6 topics sont créés automatiquement

### Phase 2 : Activité Normale (30s-2min)
1. **10 nouvelles commandes** créées sur `orders.created`
2. **Mises à jour d'inventaire** correspondantes sur `inventory.updates`
3. **Transactions de paiement** sur `payment.transactions`
4. **Notifications clients** sur `customer.notifications`

### Phase 3 : Pic de Charge (2min-3min)
1. Simulation de Black Friday
2. **50 commandes/seconde** sur `orders.created`
3. Les dashboards montrent la montée en charge
4. Les métriques de throughput augmentent

### Phase 4 : Incidents (3min-4min)
1. **Erreur de paiement** - messages sur `payment.transactions` avec status ERROR
2. **Stock épuisé** - messages d'alerte sur `inventory.updates`
3. **Retard de livraison** - messages sur `shipping.events` avec delays
4. Les notifications d'erreur s'affichent

### Phase 5 : Résolution et Fin (4min-5min)
1. Les problèmes sont résolus
2. Les commandes en attente sont traitées
3. Retour à la normale
4. Statistiques finales affichées

## 📈 Métriques à Observer

### Dans le Dashboard
- **Total Messages**: Devrait atteindre ~500+ messages
- **Active Connections**: 1 (Kafka Demo)
- **Topics**: 6 topics actifs
- **Throughput**: Pic à ~50 msg/s pendant Phase 3

### Dans Topics View
- Distribution des messages par topic
- Partitions utilisées
- Offset progression en temps réel

### Dans Messages View
- Contenu JSON des messages
- Timestamps et latence
- Filtering par type d'événement

### Dans Flow View
- Visualisation du flux `orders.created` → `payment.transactions` → `orders.completed`
- Dépendances entre topics
- Flow complet de la commande

## 🎯 Points de Démonstration

### 1. Monitoring en Temps Réel
- Voir les messages arriver en live
- Dashboard qui se met à jour automatiquement
- Graphiques de throughput

### 2. Debugging
- Chercher une commande spécifique
- Tracer le parcours d'une transaction
- Identifier les erreurs de paiement

### 3. Analyse
- Statistiques par topic
- Distribution des messages
- Performance metrics

### 4. Notifications
- Alertes lors des erreurs
- Confirmation des opérations
- Status de connexion

## 💡 Cas d'Usage Réels

### Scénario 1 : "Où est ma commande ?"
1. Client appelle le support pour la commande #12345
2. Opérateur va sur Messages view
3. Recherche `"orderId": "12345"`
4. Voit tout l'historique : created → payment → shipping
5. Peut donner une réponse précise au client

### Scénario 2 : "Pic de trafic Black Friday"
1. Le matin du Black Friday
2. Dashboard montre une augmentation du throughput
3. Topics view montre la distribution équilibrée
4. Flow view montre que tous les services suivent
5. Aucun message perdu

### Scénario 3 : "Problème de paiement"
1. Alerte : augmentation d'erreurs sur payment.transactions
2. Messages view filtrée sur status: ERROR
3. Identification du problème : timeout API bancaire
4. Équipe technique alertée
5. Monitoring de la résolution

### Scénario 4 : "Audit de conformité"
1. Besoin de prouver le traitement de toutes les commandes
2. Export des données du topic orders.completed
3. Vérification des timestamps
4. Génération de rapport

## 🚀 Commandes pour Lancer la Démo

```bash
# 1. Démarrer Kafka
npm run demo:kafka

# 2. Démarrer le backend (terminal 2)
npm run demo:backend

# 3. Démarrer le frontend (terminal 3)
npm run demo:frontend

# 4. Lancer le script de démonstration (terminal 4)
npm run demo:scenario
```

## ⏱️ Timeline Détaillée

| Temps | Action | Visible dans l'App |
|-------|--------|-------------------|
| 0:00 | Démarrage Kafka | Connection status → Connected |
| 0:10 | Création topics | Topics count → 6 |
| 0:15 | Premières commandes | Messages count augmente |
| 0:30 | Flux régulier | Dashboard graphs actifs |
| 1:00 | Notification client | Notification toast apparaît |
| 2:00 | Début Black Friday | Throughput graph spike |
| 2:30 | Pic de charge | 50 msg/s dans metrics |
| 3:00 | Erreur paiement | Error notification rouge |
| 3:15 | Stock épuisé | Warning notification orange |
| 3:30 | Retard livraison | Info notification bleue |
| 4:00 | Résolution | Success notifications |
| 4:30 | Retour normal | Metrics stabilisées |
| 5:00 | Fin de démo | Statistiques finales |

## 📝 Notes pour le Présentateur

1. **Commencer par le Dashboard** pour voir l'overview
2. **Expliquer chaque topic** et son rôle métier
3. **Montrer le Flow View** pour la compréhension visuelle
4. **Utiliser Messages View** pour le debugging détaillé
5. **Démontrer les Settings** et les notifications
6. **Finir avec les statistiques** pour montrer la valeur métier

## 🎓 Ce que la démo montre

✅ Monitoring temps réel de Kafka
✅ Debugging de messages individuels
✅ Analyse de performance
✅ Gestion d'incidents
✅ Traçabilité complète
✅ UI moderne et intuitive
✅ Dark mode professionnel
✅ Notifications intelligentes
✅ Visualisation de flux
✅ Scalabilité (pic de charge)
