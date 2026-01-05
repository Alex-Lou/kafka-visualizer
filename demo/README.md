# 🎬 Kafka Visualizer - Demo Producer

Ce dossier contient le script de démonstration qui génère des messages Kafka simulant une plateforme e-commerce.

## 📁 Fichiers

- **demo-producer.js** - Script principal de génération de messages
- **package.json** - Dépendances Node.js
- **use-case-scenario.md** - Description détaillée du scénario

## 🚀 Installation

```bash
npm install
```

## ▶️ Lancement

```bash
npm start
```

## 🎯 Ce Que Le Script Fait

### Connexion à Kafka
- Se connecte à `localhost:9092`
- Crée 6 topics si ils n'existent pas
- Initialise un producer KafkaJS

### Phases de la Démonstration

#### Phase 1 : Activité Normale (90s)
```javascript
DEMO_CONFIG.normalFlowInterval = 2000ms
```
- 1 commande toutes les 2 secondes
- ~45 messages générés
- Flux complet : order → inventory → payment → notification → shipping → completion

#### Phase 2 : Black Friday (60s)
```javascript
DEMO_CONFIG.blackFridayInterval = 100ms
```
- 10 commandes par seconde
- ~600 messages générés
- Démontre la capacité à gérer des pics de charge

#### Phase 3 : Incidents (30s)
```javascript
DEMO_CONFIG.errorProbability = 1.0  // Force errors
```
- Erreurs de paiement (5 erreurs)
- Ruptures de stock (3 alertes)
- Retards de livraison (3 incidents)
- ~15 messages d'erreur

#### Phase 4 : Résolution (30s)
- Retour à la normale
- Traitement des commandes en attente
- ~50 messages
- Flux complet pour chaque commande

## 📊 Topics Créés

### 1. orders.created
**Partitions :** 3
**Contenu :** Commandes clients
```json
{
  "orderId": "ORD-1001",
  "customerId": "CUST-0042",
  "items": [...],
  "totalAmount": 259.98,
  "currency": "EUR",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

### 2. orders.completed
**Partitions :** 3
**Contenu :** Commandes finalisées
```json
{
  "orderId": "ORD-1001",
  "status": "COMPLETED",
  "completedAt": "2024-01-15T10:31:15.789Z"
}
```

### 3. inventory.updates
**Partitions :** 4
**Contenu :** Mises à jour d'inventaire
```json
{
  "productId": "PROD-003",
  "quantity": -2,
  "warehouse": "WH-PARIS",
  "operation": "DECREMENT",
  "relatedOrderId": "ORD-1001"
}
```

### 4. customer.notifications
**Partitions :** 2
**Contenu :** Notifications clients
```json
{
  "customerId": "CUST-0042",
  "notificationType": "ORDER_CONFIRMATION",
  "channel": "EMAIL",
  "message": "Your order ORD-1001 has been confirmed"
}
```

### 5. payment.transactions
**Partitions :** 3
**Contenu :** Transactions de paiement
```json
{
  "transactionId": "TXN-5042",
  "orderId": "ORD-1001",
  "amount": 259.98,
  "method": "CREDIT_CARD",
  "status": "SUCCESS"
}
```

### 6. shipping.events
**Partitions :** 2
**Contenu :** Événements de livraison
```json
{
  "shipmentId": "SHIP-3001",
  "orderId": "ORD-1001",
  "status": "IN_TRANSIT",
  "carrier": "DHL",
  "estimatedDelivery": "2024-01-18T18:00:00Z"
}
```

## 🎲 Génération de Données

### Données Sample
```javascript
customerIds: 50 clients (CUST-0001 à CUST-0050)
productIds: 10 produits (PROD-001 à PROD-010)
warehouses: ['WH-PARIS', 'WH-LYON', 'WH-MARSEILLE', 'WH-TOULOUSE']
paymentMethods: ['CREDIT_CARD', 'PAYPAL', 'BANK_TRANSFER', 'CRYPTO']
```

### Algorithme de Génération

1. **Générer une commande**
   - Sélectionner un client aléatoire
   - Générer 1-5 items avec produits et quantités aléatoires
   - Calculer le montant total

2. **Générer les événements liés**
   - Inventory update pour chaque item
   - Payment transaction
   - Customer notification
   - Shipping event
   - Order completion

3. **Injecter des erreurs aléatoirement**
   - 5% de chance d'erreur de paiement en Phase 1
   - 100% d'erreurs en Phase 3

## 🛠️ Configuration

Modifier les constantes dans `demo-producer.js` :

```javascript
const DEMO_CONFIG = {
  normalFlowInterval: 2000,      // Intervalle messages normaux (ms)
  blackFridayInterval: 100,      // Intervalle Black Friday (ms)
  blackFridayDuration: 60000,    // Durée Black Friday (ms)
  errorProbability: 0.05,        // Probabilité d'erreur (5%)
};
```

## 📦 Dépendances

### kafkajs
Client Kafka pour Node.js
- Connexion à Kafka
- Production de messages
- Admin (création de topics)

### chalk
Coloration du terminal
- Messages en couleur
- Meilleure lisibilité des logs

## 🔧 Personnalisation

### Ajouter un Nouveau Topic

```javascript
// Dans createTopics()
const topics = [
  ...
  { topic: 'mon.nouveau.topic', numPartitions: 2, replicationFactor: 1 }
];

// Créer un générateur
const generateMonMessage = () => ({
  field1: 'value1',
  timestamp: new Date().toISOString()
});

// Envoyer le message
await sendMessage('mon.nouveau.topic', generateMonMessage());
```

### Modifier la Durée des Phases

```javascript
// Dans runDemo()
await runNormalActivity(120000);  // 2 minutes au lieu de 90s
await runBlackFriday(90000);      // 90s au lieu de 60s
await runIncidents();             // Durée fixe ~30s
await runResolution(45000);       // 45s au lieu de 30s
```

### Changer la Fréquence des Messages

```javascript
const DEMO_CONFIG = {
  normalFlowInterval: 1000,      // 1 message/seconde
  blackFridayInterval: 50,       // 20 messages/seconde
  // ...
};
```

## 📝 Logs du Script

Le script affiche des logs détaillés avec couleurs :

- 🔵 **Bleu** - Actions système (connexion, création topics)
- 🟢 **Vert** - Succès (commande créée, topics créés)
- 🔴 **Rouge** - Erreurs (paiement échoué)
- 🟡 **Jaune** - Warnings et infos (attente, Black Friday)
- 🟣 **Magenta** - Incidents spécifiques (retards livraison)
- 🔷 **Cyan** - Statistiques (fin de phase)

## 🐛 Dépannage

### Erreur : "Connection refused"
```bash
# Vérifier que Kafka est lancé
docker ps | grep kafka

# Démarrer Kafka
docker-compose -f ../docker-compose.demo.yml up -d

# Attendre 30 secondes
```

### Erreur : "Topic already exists"
C'est normal si vous relancez le script. Les topics existent déjà.

### Erreur : "Cannot find module 'kafkajs'"
```bash
npm install
```

### Le script se termine immédiatement
Vérifier les logs pour voir l'erreur exacte. Souvent :
- Kafka n'est pas accessible
- Port 9092 non disponible

## 📊 Statistiques Attendues

À la fin du script, vous devriez voir :

```
📊 Total messages sent: ~710
⏱️  Total duration: ~3.5 minutes
🎯 Topics used: 6
📦 Orders processed: ~100-120
💳 Transactions: ~100-120
🚚 Shipments: ~80-100
```

## 🔄 Relancer la Démo

Le script peut être relancé autant de fois que nécessaire. Les messages s'accumulent dans Kafka selon la configuration de rétention (24h par défaut).

Pour repartir de zéro :
```bash
# Supprimer tous les topics et données
docker-compose -f ../docker-compose.demo.yml down -v
docker-compose -f ../docker-compose.demo.yml up -d

# Attendre 30s puis relancer
npm start
```

## 📚 Ressources

- **KafkaJS Documentation** : https://kafka.js.org/
- **Kafka Documentation** : https://kafka.apache.org/documentation/
- **Chalk Documentation** : https://github.com/chalk/chalk

## 🎓 Concepts Kafka Démontrés

✅ **Topics** - Organisation des données
✅ **Partitions** - Parallélisme et scalabilité
✅ **Producer** - Écriture de messages
✅ **Message Keys** - Partitionnement par clé
✅ **Timestamps** - Ordre des événements
✅ **Admin API** - Création de topics
✅ **Error Handling** - Gestion des échecs

---

**Happy Coding! 🚀**
