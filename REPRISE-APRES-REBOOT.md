# 🔄 REPRISE APRÈS REDÉMARRAGE

## 📍 Où tu en es :

✅ Application Kafka Visualizer créée et prête
✅ Système de notifications implémenté
✅ Démo e-commerce créée avec script automatique
❌ Docker Desktop pas encore installé (tu vas le faire maintenant)

## 🎯 CE QU'IL FAUT FAIRE APRÈS LE REDÉMARRAGE

### Étape 1 : Vérifie que Docker est lancé ✅

Après le redémarrage :
1. Ouvre **Docker Desktop** depuis le menu Démarrer
2. Attends que ça dise **"Docker Desktop is running"** (2-3 minutes)
3. Tu verras l'icône Docker 🐳 dans la barre des tâches

### Étape 2 : Ouvre 4 Terminaux CMD

**Très important** : Utilise **CMD** (pas PowerShell) !

---

## 🚀 LANCEMENT DE LA DÉMO - 4 TERMINAUX

### 📟 Terminal 1 : KAFKA

```bash
cd C:\Users\34643\Desktop\Brol\KafkaMonitor\kafka-visualizer
docker compose -f docker-compose.demo.yml up -d
```

**Note :** Si `docker compose` ne marche pas, essaie `docker-compose` (avec un tiret)

**Attends 30 secondes** ⏳ que Kafka démarre

---

### 📟 Terminal 2 : BACKEND (Nouveau terminal CMD)

```bash
cd C:\Users\34643\Desktop\Brol\KafkaMonitor\kafka-visualizer\backend
mvn spring-boot:run
```

**Attends de voir :** `Started KafkaVisualizerApplication` (~30 secondes)

---

### 📟 Terminal 3 : FRONTEND (Nouveau terminal CMD)

```bash
cd C:\Users\34643\Desktop\Brol\KafkaMonitor\kafka-visualizer\frontend
npm run dev
```

**Attends de voir :** `Local: http://localhost:5173/` (~10 secondes)

---

### 📟 Terminal 4 : DÉMO (Nouveau terminal CMD)

```bash
cd C:\Users\34643\Desktop\Brol\KafkaMonitor\kafka-visualizer\demo
npm install
npm start
```

Tu verras des messages colorés ! 🎨

---

## 🌐 Ouvre Ton Navigateur

Va sur : **http://localhost:5173**

Profite de la démo pendant ~4 minutes ! 🎉

---

## 🐛 Si tu as des Problèmes

### "docker compose command not found"

Essaie avec un tiret :
```bash
docker-compose -f docker-compose.demo.yml up -d
```

### "Port 8080 already in use"

```bash
netstat -ano | findstr :8080
taskkill /PID [le_numero_du_PID] /F
```

### "Port 9092 already in use"

```bash
netstat -ano | findstr :9092
taskkill /PID [le_numero_du_PID] /F
```

### Docker ne démarre pas

1. Redémarre Docker Desktop
2. Attends 2-3 minutes
3. Vérifie dans les paramètres Docker que WSL 2 est activé

---

## 📚 Documentation Disponible

Si tu veux plus d'infos :

- **QUICKSTART.md** - Guide ultra-rapide
- **DEMO.md** - Guide complet de la démo
- **README.md** - Documentation utilisateur complète
- **NOTIFICATIONS.md** - Système de notifications

---

## 🎯 Objectif de la Démo

Tu vas voir :
- 🛒 Plateforme e-commerce simulée
- 📊 ~710 messages Kafka en temps réel
- 🔥 Simulation Black Friday (pic de charge)
- ❌ Incidents et résolutions
- 🔔 Notifications en temps réel
- 📈 Graphiques de throughput

**Durée :** ~4 minutes de démo automatique

---

## 💡 Conseil

Ouvre ce fichier après le redémarrage :

```
C:\Users\34643\Desktop\Brol\KafkaMonitor\kafka-visualizer\REPRISE-APRES-REBOOT.md
```

**Bon redémarrage ! 🚀**

---

## 📞 Si tu es Bloqué

Relis les sections "🐛 Si tu as des Problèmes" ci-dessus.

Si vraiment bloqué, ouvre un nouveau chat Claude Code et montre-lui ce fichier, il saura où tu en es ! 😊
