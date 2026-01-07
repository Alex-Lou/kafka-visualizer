# ⚛️ Kafka Visualizer - Frontend

> This is the user interface for the Kafka Visualizer application. It's a modern web app built with React that connects to the backend server to display Kafka data in real-time.

---

## 🎯 For Everyone: What Does This App Do?

Imagine Kafka is a super-fast, invisible postal service inside a company. This application is a **magic window** that lets you see all the letters (messages) as they fly by.

You can:
*   **Watch in Real-Time:** See messages appear the instant they are sent.
*   **Organize Everything:** Group your "postal routes" (Kafka topics) by different connections.
*   **Find Anything:** Quickly search for a specific message, like finding a needle in a haystack.
*   **Look Back in Time:** Access old messages that have been stored in an archive (like a library of old letters).
*   **Configure the Rules:** Decide how long to keep new mail before it's archived or thrown away.

### ✨ Key Pages

*   **Dashboard:** Your main overview. See at a glance how many messages are flowing and if there are any problems.
*   **Connections:** Manage your connections to different Kafka "post offices".
*   **Topics:** See all your "postal routes" and how many messages are in each.
*   **Messages:** The heart of the app! View, filter, and search for messages in real-time or from the archive.
*   **Settings:** Configure the app's appearance and, most importantly, set up the rules for archiving old messages.
*   **Analytics:** See charts and graphs about your message flows.

---

## 👩‍💻 For Developers: Technical Guide

This is a [Vite](https://vitejs.dev/) + [React](https://reactjs.org/) project, styled with [Tailwind CSS](https://tailwindcss.com/) and using [Zustand](https://github.com/pmndrs/zustand) for state management.

### ✅ Prerequisites

*   [Node.js](https://nodejs.org/) (version 18.x or higher)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js)
*   A running instance of the [Kafka Visualizer Backend](../backend).

### 🚀 Getting Started

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    This will download all the necessary libraries.
    ```bash
    npm install
    ```

3.  **Run the development server:**
    This starts the app on `http://localhost:3000` and connects to the backend (assumed to be on `http://localhost:8080`). The app will automatically reload when you make changes to the code.
    ```bash
    npm run dev
    ```

### 📂 Project Structure

The `src` folder is organized to be modular and scalable:

```
src/
├── components/   # Reusable UI components (Buttons, Cards, etc.)
│   └── common/   # General-purpose components
├── constants/    # Global constants (styles, enums, etc.)
├── context/      # Global state management (Zustand stores)
│   └── store.js  # Main application store
├── pages/        # Top-level page components for each route
├── services/     # API calls and WebSocket logic
│   ├── api.js    # Axios instance and REST API functions
│   └── websocket.js # STOMP/WebSocket service
├── App.jsx       # Main application component with routing
└── main.jsx      # Entry point of the application
```

### 🛠️ Key Technologies

*   **Framework:** [React 18](https://reactjs.org/)
*   **Build Tool:** [Vite](https://vitejs.dev/) - For a super-fast development experience.
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/) - For utility-first CSS.
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand) - A small, fast, and scalable state-management solution.
*   **Routing:** [React Router](https://reactrouter.com/) - For handling navigation between pages.
*   **Real-Time Communication:** [SockJS](https://github.com/sockjs/sockjs-client) & [STOMP.js](https://stomp-js.github.io/) - For WebSocket communication with the Spring Boot backend.
*   **Icons:** [Lucide React](https://lucide.dev/) - Beautiful and consistent icons.

### 📜 Available Scripts

*   `npm run dev`: Starts the development server.
*   `npm run build`: Creates a production-ready build of the app in the `dist` folder.
*   `npm run preview`: Serves the production build locally to test it.
```