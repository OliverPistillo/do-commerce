<!-- ITALIANO -->

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/Frontend-React-blue?logo=react" />
  <img alt="TailwindCSS" src="https://img.shields.io/badge/UI-TailwindCSS-38b2ac?logo=tailwindcss" />
  <img alt="Firebase" src="https://img.shields.io/badge/Auth%20%26%20DB-Firebase-orange?logo=firebase" />
  <img alt="WooCommerce" src="https://img.shields.io/badge/Backend-WooCommerce-purple?logo=woocommerce" />
  <img alt="Docker" src="https://img.shields.io/badge/Deploy-Docker-2496ed?logo=docker" />
</p>

# 🇮🇹 do-commerce // Multi-Client Tool

**do-commerce** è una web app in React progettata per semplificare l’inserimento di prodotti all’interno di uno store WooCommerce da parte di utenti non esperti.  
È pensato per sviluppatori, agenzie e aziende che gestiscono più eCommerce per conto di clienti.

<details>
<summary><strong>Leggi tutto in italiano</strong></summary>

## 🚀 Obiettivi del progetto

- Fornire ai clienti un’interfaccia semplice per caricare prodotti senza passare dal backend WordPress
- Centralizzare la gestione degli utenti e dei siti tramite Firebase
- Evitare errori o accessi sbagliati (ogni utente può agire solo sul sito assegnato)
- Offrire uno strumento multi-tenant, scalabile e brandizzabile

## ✅ Funzionalità implementate

### 👤 Autenticazione
- Login via **email/password** (con Firebase Auth)
- Gestione centralizzata degli account (niente Google Login)

### 🌐 Collegamento sito → utente
- Ogni utente ha assegnato uno o più siti WooCommerce via Firestore (`userSites`)
- L’app recupera l’URL corretto all’accesso e lo usa per tutte le richieste

### 🧾 Inserimento prodotti
- Form per **inserimento singolo** con:
  - Titolo, descrizione, prezzo, stock
  - Categorie, varianti (taglia, colore)
  - Upload immagine con preview
- Supporto **upload da CSV** (via PapaParse)

### 📡 Integrazione con WooCommerce
- Comunicazione via **REST API custom plugin**
- Plugin WordPress incluso: accetta POST e crea prodotti via `wp_insert_post()`

## 🧩 Architettura tecnica

| Componente       | Stack/Tool                |
|------------------|---------------------------|
| Web App          | React + Vite + TailwindCSS|
| Autenticazione   | Firebase Auth             |
| Database mapping | Firebase Firestore        |
| File upload      | FormData + Axios          |
| CSV              | PapaParse                 |
| Backend Woo      | WordPress REST API + Plugin custom |
| Admin Tool       | Firebase Admin SDK (WIP)  |

</details>

---

<!-- ENGLISH -->

# 🇬🇧 do-commerce // Multi-Client Tool

**do-commerce** is a React-based web app designed to simplify the product upload process for non-technical users managing WooCommerce stores.  
It's built for developers, agencies, and businesses handling multiple eCommerce websites for clients.

<details open>
<summary><strong>Read full English version</strong></summary>

## 🚀 Project Goals

- Provide clients with a simple interface to add products without accessing WordPress backend
- Centralize user and site management via Firebase
- Prevent misconfiguration or unauthorized access (users can only manage assigned stores)
- Deliver a scalable, multi-tenant and brandable tool

## ✅ Features Implemented

### 👤 Authentication
- Email/password login (via Firebase Auth)
- Centralized account control (no Google login)

### 🌐 Site-User Association
- Each user is assigned one or more WooCommerce sites via Firestore (`userSites`)
- The app fetches the correct URL upon login for API interaction

### 🧾 Product Insertion
- Single product upload form:
  - Title, description, price, stock
  - Categories, variants (size, color)
  - Image upload with preview
- CSV upload supported (via PapaParse)

### 📡 WooCommerce Integration
- Communication via custom REST API
- WordPress plugin included: accepts POST requests and creates products using `wp_insert_post()`

## 🧩 Tech Architecture

| Component        | Stack/Tool                     |
|------------------|--------------------------------|
| Web App          | React + Vite + TailwindCSS     |
| Authentication   | Firebase Auth                  |
| DB Mapping       | Firebase Firestore             |
| File Upload      | FormData + Axios               |
| CSV Import       | PapaParse                      |
| Woo Backend      | WordPress REST API + custom plugin |
| Admin Tool       | Firebase Admin SDK (WIP)       |

</details>

---

## 🔧 Project Structure

```plaintext
DO-COMMERCE-MAIN/
├── client/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── CsvUploader.jsx
│   │   │   ├── LoginForm.jsx
│   │   │   ├── ProductForm.jsx
│   │   │   ├── ProductTranslator.jsx
│   │   │   └── ui/
│   │   │       └── LoadingSpinner.jsx
│   │   ├── services/
│   │   │   ├── emailNotificationService.js
│   │   │   ├── firestoreService.js
│   │   │   └── translationService.js
│   │   ├── App.jsx
│   │   ├── firebase.js
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── .env.example
│   ├── .eslintrc.js
│   ├── .prettierrc
│   ├── index.html
│   ├── jsconfig.json
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── Dockerfile
├── wordpress-plugin/
│   └── do-commerce/
│       ├── assets/
│       │   ├── css/
│       │   │   ├── admin-style.css
│       │   │   └── docommerce-style.css
│       │   ├── js/
│       │   │   ├── admin-script.js
│       │   │   └── product-form.js
│       │   └── img/
│       │       ├── logo.png
│       │       └── placeholder.svg
│       ├── includes/
│       │   ├── class-api.php
│       │   ├── class-product-manager.php
│       │   └── class-settings.php
│       ├── templates/
│       │   ├── settings-page.php
│       │   └── activity-log-page.php
│       ├── composer.json
│       ├── vendor/
│       ├── do-commerce.php
│       └── readme.txt
├── .vscode/
│   └── settings.json
├── firebase/
│   ├── functions/
│   │   ├── index.js
│   │   └── package.json
│   ├── Dockerfile
│   ├── firebaserc.json
│   ├── firebase.json
│   ├── firestore.indexes.json
│   └── firestore.rules
├── nginx/
│   └── nginx.conf
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```
