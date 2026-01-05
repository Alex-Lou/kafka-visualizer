# 🎬 Kafka Visualizer - Guide de Démonstration

## 📝 Vue d'ensemble

Ce guide vous permet de lancer une démonstration complète et automatisée de Kafka Visualizer avec un cas d'usage réaliste : une plateforme e-commerce.

## 🎯 Objectif de la Démo

Montrer toutes les capacités de l'application :
- ✅ Monitoring temps réel de Kafka
- ✅ Visualisation de flux de messages
- ✅ Gestion de pics de charge (Black Friday)
- ✅ Détection et gestion d'incidents
- ✅ Système de notifications
- ✅ Interface moderne et intuitive

## 🛠️ Prérequis

### Obligatoires
- **Docker Desktop** (pour Kafka) - [Télécharger](https://www.docker.com/products/docker-desktop)
- **Java 21** (pour le backend) - [Télécharger](https://adoptium.net/)
- **Node.js 18+** (pour le frontend) - [Télécharger](https://nodejs.org/)
- **Maven 3.8+** (pour le build backend)

### Vérification
```bash
docker --version    # Docker version 20.10+
java -version       # Java 21
node --version      # Node v18+
mvn --version       # Maven 3.8+
```

## 🚀 Lancement Rapide

### Option 1 : Script Automatique (Recommandé)

#### Windows
```bash
# Depuis la racine du projet
.\scripts\run-demo.bat
```

#### Linux/Mac
```bash
# Depuis la racine du projet
chmod +x scripts/run-demo.sh
./scripts/run-demo.sh
```

Le script va :
1. ✅ Vérifier les prérequis
2. ✅ Démarrer Kafka (Docker)
3. ✅ Installer les dépendances de la démo
4. ✅ Démarrer le backend (Spring Boot)
5. ✅ Démarrer le frontend (React + Vite)
6. ✅ Lancer le scénario de démonstration

### Option 2 : Lancement Manuel

#### Étape 1 : Démarrer Kafka
```bash
# Terminal 1
docker-compose -f docker-compose.demo.yml up -d

# Attendre 30 secondes que Kafka soit prêt
```

#### Étape 2 : Démarrer le Backend
```bash
# Terminal 2
cd backend
mvn spring-boot:run
```

#### Étape 3 : Démarrer le Frontend
```bash
# Terminal 3
cd frontend
npm install  # première fois seulement
npm run dev
```

#### Étape 4 : Installer les Dépendances de la Démo
```bash
# Terminal 4
cd demo
npm install  # première fois seulement
```

#### Étape 5 : Lancer la Démo
```bash
# Dans le même terminal 4
npm start
```

## 📊 Que se Passe-t-il Pendant la Démo ?

### Phase 1 : Activité Normale (90 secondes)
- 🛒 Création de commandes e-commerce
- 📦 Mises à jour d'inventaire
- 💳 Transactions de paiement
- 📧 Notifications clients
- 🚚 Événements de livraison
- ✅ Finalisation de commandes

**Messages générés :** ~45 messages
**Fréquence :** 1 commande toutes les 2 secondes

### Phase 2 : Black Friday (60 secondes)
- 🔥 Simulation de pic de charge
- ⚡ 10 commandes par seconde
- 📈 Augmentation visible du throughput
- 🎯 Test de la scalabilité

**Messages générés :** ~600 messages
**Fréquence :** 10 commandes/seconde

### Phase 3 : Incidents (30 secondes)
- ❌ **Erreurs de paiement** : Timeouts gateway bancaire
- ⚠️ **Ruptures de stock** : Alertes inventaire
- 🚫 **Retards de livraison** : Problèmes transporteur

**Messages générés :** ~15 messages d'erreur
**Objectif :** Montrer la gestion d'incidents

### Phase 4 : Résolution (30 secondes)
- ✅ Retour à la normale
- 🔧 Traitement des commandes en attente
- 📊 Génération des statistiques finales

**Messages générés :** ~50 messages
**Fréquence :** Retour progressif à la normale

## 📈 Métriques à Observer

### Dashboard Page
Ouvrir : `http://localhost:5173/`

**Graphiques temps réel :**
- 📊 Total de messages (~710 messages au final)
- 🔌 Connexions actives (1 connexion)
- 📁 Topics créés (6 topics)
- ⚡ Throughput messages/seconde (pic à 10 msg/s)

### Connections Page
Ouvrir : `http://localhost:5173/connections`

**Voir :**
- ✅ Connexion "Kafka Demo" en statut CONNECTED
- 🧪 Tester la connexion (bouton Play)
- 📋 Voir les 6 topics associés

### Topics Page
Ouvrir : `http://localhost:5173/topics`

**6 Topics créés :**
1. `orders.created` - Commandes créées
2. `orders.completed` - Commandes finalisées
3. `inventory.updates` - Mises à jour stock
4. `customer.notifications` - Notifications clients
5. `payment.transactions` - Transactions paiement
6. `shipping.events` - Événements livraison

### Messages Page
Ouvrir : `http://localhost:5173/messages`

**Fonctionnalités :**
- 🔍 Rechercher par orderId, customerId, productId
- 🗂️ Filtrer par topic
- 📄 Voir le contenu JSON détaillé
- ⏱️ Timestamps et latence

### Flow View Page
Ouvrir : `http://localhost:5173/flow`

**Visualisation :**
- 🔄 Flux de données entre topics
- 🎯 Dépendances visuelles
- 📊 Parcours complet d'une commande

### Settings Page
Ouvrir : `http://localhost:5173/settings`

**Configurer :**
- 🌙 Dark mode / Light mode
- 🔔 Notifications (Message alerts, Connection status)
- 💾 Rétention des données

## 🔔 Système de Notifications

Pendant la démo, vous verrez des notifications :

### Succès (Vert)
- ✅ "Connection Test - Successfully connected to Kafka Demo"
- ✅ "Order ORD-1234 fully processed"

### Erreurs (Rouge)
- ❌ "Payment Failed - Card declined"
- ❌ "Connection Test Failed"

### Warnings (Orange)
- ⚠️ "Stock Alert - Product out of stock"

### Info (Bleu)
- ℹ️ "Shipping Delayed - Weather conditions"

**Interactions :**
- Cliquer sur la cloche 🔔 en haut à droite pour voir l'historique
- Les toasts disparaissent automatiquement après 5 secondes
- Configurer les notifications dans Settings

## 📋 Structure des Messages

### Exemple : Order Created
```json
{
  "orderId": "ORD-1001",
  "customerId": "CUST-0042",
  "items": [
    {
      "productId": "PROD-003",
      "quantity": 2,
      "price": "129.99"
    }
  ],
  "totalAmount": 259.98,
  "currency": "EUR",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "channel": "WEB"
}
```

### Exemple : Payment Transaction
```json
{
  "transactionId": "TXN-5042",
  "orderId": "ORD-1001",
  "customerId": "CUST-0042",
  "amount": 259.98,
  "currency": "EUR",
  "method": "CREDIT_CARD",
  "status": "SUCCESS",
  "processedAt": "2024-01-15T10:30:46.456Z"
}
```

### Exemple : Inventory Update
```json
{
  "productId": "PROD-003",
  "quantity": -2,
  "warehouse": "WH-PARIS",
  "operation": "DECREMENT",
  "reason": "ORDER_PLACED",
  "relatedOrderId": "ORD-1001",
  "timestamp": "2024-01-15T10:30:46.789Z"
}
```

## 🎓 Scénarios d'Utilisation

### Scénario 1 : Tracer une Commande
1. Aller sur **Messages Page**
2. Rechercher `ORD-1001` dans la barre de recherche
3. Voir tous les événements liés :
   - ✅ Order Created
   - 💳 Payment Transaction
   - 📦 Inventory Update
   - 📧 Customer Notification
   - 🚚 Shipping Event
   - ✅ Order Completed

### Scénario 2 : Analyser les Erreurs
1. Aller sur **Messages Page**
2. Filtrer par topic : `payment.transactions`
3. Rechercher `"status": "ERROR"`
4. Identifier les causes :
   - Card declined
   - Insufficient funds
   - Gateway timeout

### Scénario 3 : Visualiser le Flux
1. Aller sur **Flow View**
2. Observer le parcours :
   ```
   orders.created → payment.transactions → customer.notifications
                                        ↓
                                   orders.completed
   ```

### Scénario 4 : Monitoring en Temps Réel
1. Garder le **Dashboard** ouvert
2. Observer pendant Phase 2 (Black Friday)
3. Voir le graphique de throughput monter à 10 msg/s
4. Voir le compteur de messages augmenter rapidement

## 🛑 Arrêter la Démo

### Avec le Script Automatique
Appuyer sur une touche quand demandé, le script arrête tout proprement.

### Manuellement
```bash
# Arrêter Kafka
docker-compose -f docker-compose.demo.yml down

# Arrêter Backend : Ctrl+C dans le terminal
# Arrêter Frontend : Ctrl+C dans le terminal
# Arrêter Demo : Ctrl+C dans le terminal
```

## 🐛 Dépannage

### Kafka ne démarre pas
```bash
# Vérifier que Docker est lancé
docker info

# Vérifier que les ports ne sont pas utilisés
netstat -an | findstr "9092"  # Windows
lsof -i :9092                  # Linux/Mac

# Nettoyer et redémarrer
docker-compose -f docker-compose.demo.yml down
docker-compose -f docker-compose.demo.yml up -d
```

### Backend ne démarre pas
```bash
# Vérifier Java
java -version  # Doit être 21

# Vérifier le port 8080
netstat -an | findstr "8080"  # Windows
lsof -i :8080                  # Linux/Mac

# Killer le processus si nécessaire
taskkill /F /IM java.exe       # Windows
pkill -f spring-boot:run       # Linux/Mac
```

### Frontend ne démarre pas
```bash
# Réinstaller les dépendances
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Script de démo ne trouve pas Kafka
```bash
# Attendre plus longtemps (jusqu'à 60s)
# Vérifier que Kafka est accessible
docker logs kafka-demo-broker

# Tester manuellement
cd demo
npm install
node demo-producer.js
```

## 📚 Documentation Complémentaire

- **README.md** - Guide complet pour utilisateurs non-techniques
- **NOTIFICATIONS.md** - Documentation du système de notifications
- **demo/use-case-scenario.md** - Détails du scénario e-commerce

## 💡 Conseils pour la Présentation

1. **Avant la démo** : Tester une fois seul pour se familiariser
2. **Pendant la démo** :
   - Commencer par expliquer le cas d'usage e-commerce
   - Montrer le Dashboard en premier
   - Mettre en évidence les phases (normale, Black Friday, incidents)
   - Cliquer sur les notifications quand elles apparaissent
3. **Questions fréquentes** :
   - "C'est du vrai Kafka ?" → Oui, Kafka 7.5.0 dans Docker
   - "Ça scale ?" → Oui, démo montre 10 msg/s mais Kafka fait bien plus
   - "On peut connecter notre Kafka ?" → Oui, via Connections page

## 🎯 Points Clés à Retenir

✅ **Monitoring temps réel** - Voir les messages en live
✅ **Interface intuitive** - Navigation fluide, dark mode
✅ **Debugging puissant** - Recherche et filtres avancés
✅ **Visualisation claire** - Graphiques et flow view
✅ **Notifications intelligentes** - Alertes configurables
✅ **Scalable** - Gère les pics de charge
✅ **Production-ready** - Gestion d'erreurs robuste

## 🚀 Prochaines Étapes

Après la démo, vous pouvez :
1. Connecter votre propre cluster Kafka
2. Explorer vos vrais topics
3. Configurer des alertes personnalisées
4. Exporter les données pour analyse
5. Intégrer avec vos outils de monitoring

## 📞 Support

- **Issues** : [GitHub Issues](https://github.com/your-repo/kafka-visualizer/issues)
- **Documentation** : Voir README.md
- **Démo** : Ce fichier

---

**Bonne démonstration ! 🎉**
