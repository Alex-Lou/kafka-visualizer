# 🚀 Kafka Visualizer

> **Visualisez et surveillez vos flux de messages Kafka en temps réel**

Une application web moderne qui vous permet de **voir en direct** les messages qui transitent dans vos topics Kafka, sans avoir besoin d'être un expert technique.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Java](https://img.shields.io/badge/Java-21-orange.svg)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![Kafka](https://img.shields.io/badge/Kafka-3.x-black.svg)

---

## 📖 Table des matières

- [Qu'est-ce que c'est ?](#quest-ce-que-cest-)
- [Pourquoi utiliser Kafka Visualizer ?](#pourquoi-utiliser-kafka-visualizer-)
- [Fonctionnalités principales](#fonctionnalités-principales)
- [Architecture](#architecture)
- [Installation rapide](#installation-rapide)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [Demo](#demo)
- [Technologies utilisées](#technologies-utilisées)

---

## 🤔 Qu'est-ce que c'est ?

Imaginez que vous avez un **système de messagerie** dans votre entreprise où différentes applications s'échangent des informations (commandes, paiements, notifications, etc.). Ce système s'appelle **Apache Kafka**.

**Le problème** : Normalement, ces messages sont invisibles. Vous ne pouvez pas facilement voir ce qui se passe en temps réel.

**La solution** : **Kafka Visualizer** est comme une **fenêtre** qui vous permet de voir tous ces messages en direct, de les organiser, de les filtrer et de comprendre ce qui se passe dans votre système.

---

## 💡 Pourquoi utiliser Kafka Visualizer ?

### Sans Kafka Visualizer :
- ❌ Vous devez utiliser des lignes de commande complexes
- ❌ Impossible de voir les messages en temps réel
- ❌ Difficile de déboguer les problèmes
- ❌ Pas de vue d'ensemble de vos flux de données

### Avec Kafka Visualizer :
- ✅ **Interface graphique intuitive** - Pas besoin de terminal
- ✅ **Temps réel** - Voyez les messages arriver instantanément
- ✅ **Organisation claire** - Topics regroupés par connexion
- ✅ **Recherche et filtres** - Trouvez rapidement ce que vous cherchez
- ✅ **Monitoring automatique** - Surveillez plusieurs topics en même temps
- ✅ **Historique** - Consultez les messages passés

---

## ✨ Fonctionnalités principales

### 🔌 Gestion des connexions Kafka
- Connectez-vous à plusieurs clusters Kafka différents
- Testez vos connexions en un clic
- Support de l'authentification SASL (si nécessaire)
- Auto-découverte des topics disponibles

### 📊 Visualisation des Topics
- **Interface en accordéon** : Topics organisés par connexion
- **Compteurs en temps réel** : Nombre de messages mis à jour automatiquement
- **Badges de statut** : Voyez d'un coup d'œil l'état de vos topics
- **Monitoring sélectif** : Choisissez quels topics surveiller

### 💬 Messages en temps réel
- **WebSocket** : Les messages apparaissent instantanément
- **Pas de rafraîchissement** : L'interface se met à jour toute seule
- **Filtres avancés** : Par clé, contenu, date
- **Pagination** : Naviguez facilement dans l'historique

### 🎯 Demo intégrée
- Script de démo inclus
- Simule un système e-commerce complet
- Génère des commandes, paiements, annulations, livraisons
- Parfait pour tester l'application

---

## 🏗️ Architecture

\`\`\`
┌─────────────────┐
│   React Frontend│  (Interface utilisateur)
│   Port: 3000    │
└────────┬────────┘
         │ HTTP + WebSocket
         ↓
┌─────────────────┐
│  Spring Backend │  (Serveur API)
│   Port: 8080    │
└────────┬────────┘
         │ Kafka Protocol
         ↓
┌─────────────────┐
│  Apache Kafka   │  (Broker de messages)
│   Port: 9092    │
└─────────────────┘
\`\`\`

**Comment ça fonctionne :**

1. 📱 Vous utilisez l'**interface web** (React) dans votre navigateur
2. 🔄 Le **serveur** (Spring Boot) se connecte à Kafka et écoute les messages
3. ⚡ Quand un message arrive, il est envoyé **instantanément** à votre navigateur via WebSocket
4. ✅ Vous voyez le message **sans rien faire** !

---

## 🚀 Installation rapide

### Prérequis

- **Java 21** ou supérieur
- **Node.js 18** ou supérieur
- **Apache Kafka** (ou utiliser Docker)
- **MySQL** (ou utiliser Docker)

### Installation manuelle

#### 1️⃣ Base de données MySQL

\`\`\`bash
# Créez la base de données
mysql -u root -p
CREATE DATABASE kafka_visualizer;
\`\`\`

#### 2️⃣ Backend (Spring Boot)

\`\`\`bash
cd backend

# Configurez application.yml avec vos credentials MySQL
# Compilez et lancez
mvn clean package -DskipTests
java -jar target/kafka-visualizer-1.0.0-SNAPSHOT.jar
\`\`\`

Le backend démarre sur **http://localhost:8080**

#### 3️⃣ Frontend (React)

\`\`\`bash
cd frontend

# Installez les dépendances
npm install

# Lancez en mode développement
npm run dev
\`\`\`

Le frontend démarre sur **http://localhost:3000**

---

## ⚙️ Configuration

### Configuration du Backend

Éditez \`backend/src/main/resources/application.yml\` :

\`\`\`yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/kafka_visualizer
    username: root
    password: votre_mot_de_passe

  kafka:
    bootstrap-servers: localhost:9092
\`\`\`

### Configuration du Frontend

Le frontend se connecte automatiquement au backend sur \`http://localhost:8080\`.

---

## 📚 Utilisation

### 1. Créer une connexion Kafka

1. Allez dans **Connections** (menu latéral)
2. Cliquez sur **+ New Connection**
3. Remplissez :
   - **Nom** : Un nom pour identifier cette connexion
   - **Bootstrap Servers** : Adresse de votre Kafka (ex: \`localhost:9092\`)
   - **Description** : (optionnel)
4. Cliquez sur **Create**
5. Cliquez sur le bouton **▶️ Test** pour vérifier la connexion

### 2. Découvrir les topics

Une fois la connexion testée avec succès :
- Les topics sont **automatiquement synchronisés**
- Ils apparaissent dans **Topics** (menu latéral)
- Organisés par connexion avec des accordéons

### 3. Surveiller des topics

1. Allez dans **Topics**
2. Trouvez le topic qui vous intéresse
3. Cliquez sur l'icône **👁️** (œil) pour activer le monitoring
4. Les messages commencent à être capturés automatiquement

### 4. Voir les messages en temps réel

1. Un badge **"Live"** vert indique que le WebSocket est connecté
2. Les compteurs de messages s'incrémentent automatiquement
3. Pas besoin de rafraîchir la page !

---

## 🎭 Demo

Une démo e-commerce est incluse pour tester l'application !

### Lancer la démo

**Windows :**
\`\`\`cmd
cd demo
startdemo.cmd
\`\`\`

### Que fait la démo ?

La démo simule un système e-commerce pendant **5 minutes** avec :

- **Phase 1** (2 min) : Activité normale
- **Phase 2** (1.5 min) : Black Friday !
- **Phase 3** (30 sec) : Incidents
- **Phase 4** (1 min) : Résolution

### Topics créés par la démo

- \`orders.created\` - Nouvelles commandes
- \`orders.completed\` - Commandes terminées
- \`orders.cancelled\` - Commandes annulées
- \`inventory.updates\` - Mises à jour du stock
- \`payment.transactions\` - Transactions
- \`shipping.events\` - Événements de livraison
- \`customer.notifications\` - Notifications

**Regardez les compteurs s'incrémenter en temps réel ! 🔥**

---

## 🛠️ Technologies utilisées

### Backend
- **Spring Boot 3.2** - Framework Java
- **Spring WebSocket** - Communication temps réel
- **Spring Data JPA** - Accès base de données
- **Apache Kafka Clients** - Client Kafka
- **MySQL** - Base de données relationnelle

### Frontend
- **React 18** - Framework UI
- **Vite** - Build tool rapide
- **Zustand** - State management
- **SockJS + STOMP** - Client WebSocket
- **Lucide React** - Icônes modernes

---

**Fait avec ❤️ par l'équipe Kafka Visualizer**

🎉 **Profitez de votre visualisation Kafka en temps réel !**
