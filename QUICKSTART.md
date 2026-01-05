# ⚡ Quick Start - Kafka Visualizer

## 🎯 Lancer la Démo en 2 Minutes

### Windows
```bash
.\scripts\run-demo.bat
```

### Linux/Mac
```bash
chmod +x scripts/run-demo.sh
./scripts/run-demo.sh
```

### Ensuite
1. ⏳ Attendre que tout démarre (~1 minute)
2. 🌐 Ouvrir http://localhost:5173
3. 👀 Observer la magie opérer !

---

## 📋 Ce Qui Va Se Passer

### 1️⃣ Kafka Démarre (Docker)
- ✅ Zookeeper sur port 2181
- ✅ Kafka sur port 9092

### 2️⃣ Backend Démarre (Spring Boot)
- ✅ API REST sur port 8080
- ✅ Connexion automatique à Kafka

### 3️⃣ Frontend Démarre (React)
- ✅ Interface sur port 5173
- ✅ Dark mode activé par défaut

### 4️⃣ Démo Lance (Scénario E-Commerce)
- 🛒 Création de commandes
- 💳 Transactions de paiement
- 📦 Mises à jour stock
- 🚚 Événements de livraison
- 🔥 Simulation Black Friday
- ❌ Incidents et résolutions

---

## 👁️ Que Regarder

### Dashboard (Page d'accueil)
- **Total Messages** → Compteur qui monte jusqu'à ~710
- **Throughput Graph** → Pic à 10 msg/s pendant Black Friday
- **Active Connections** → 1 connexion Kafka

### Notifications (Cloche en haut à droite 🔔)
- ✅ Notifications de succès (vert)
- ❌ Erreurs (rouge)
- ⚠️ Alertes (orange)
- ℹ️ Infos (bleu)

### Topics Page
- 6 topics créés automatiquement
- Distribution des messages
- Métriques par topic

### Messages Page
- 🔍 Rechercher une commande : `ORD-1001`
- 🗂️ Filtrer par topic
- 📄 Voir le contenu JSON

### Flow View
- 🔄 Visualisation du flux de données
- 📊 Dépendances entre topics

---

## ⏱️ Timeline de la Démo

| Temps | Ce Qui Se Passe |
|-------|-----------------|
| 0:00 | 🚀 Démarrage |
| 0:30 | ✅ Services prêts |
| 0:30-2:00 | 🛒 Activité normale |
| 2:00-3:00 | 🔥 Black Friday (pic de charge) |
| 3:00-3:30 | ❌ Incidents (erreurs paiement, stock) |
| 3:30-4:00 | ✅ Résolution |
| 4:00 | 🎉 Fin - Statistiques finales |

**Durée totale : ~4 minutes**

---

## 🛑 Arrêter la Démo

Le script le fera automatiquement, ou manuellement :

```bash
# Arrêter Kafka
docker-compose -f docker-compose.demo.yml down

# Ctrl+C dans les autres terminaux
```

---

## 🐛 Problèmes ?

### "Port 9092 already in use"
```bash
# Windows
netstat -ano | findstr :9092
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:9092 | xargs kill -9
```

### "Port 8080 already in use"
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

### Docker ne démarre pas
- Vérifier que Docker Desktop est lancé
- Redémarrer Docker Desktop

---

## 📚 Plus d'Infos

- **DEMO.md** - Guide complet de la démonstration
- **README.md** - Documentation utilisateur complète
- **NOTIFICATIONS.md** - Système de notifications

---

## 🎓 Ce Que Vous Allez Apprendre

En 4 minutes, vous verrez :
- ✅ Monitoring temps réel de Kafka
- ✅ Gestion de pics de charge
- ✅ Détection et résolution d'incidents
- ✅ Interface moderne et intuitive
- ✅ Système de notifications intelligent
- ✅ Visualisation de flux de données

---

**C'est parti ! 🚀**

```bash
.\scripts\run-demo.bat  # Windows
./scripts/run-demo.sh   # Linux/Mac
```
