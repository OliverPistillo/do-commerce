# DoCommerce - Plugin WordPress

Plugin WordPress per integrare il tuo eCommerce con l'applicazione DoCommerce, un sistema per gestire più store WooCommerce da un'unica interfaccia centralizzata.

## Descrizione

DoCommerce è un plugin che semplifica l'inserimento di prodotti all'interno di uno store WooCommerce da parte di utenti non esperti. È pensato per sviluppatori, agenzie e aziende che gestiscono più eCommerce per conto di clienti.

Consente agli utenti di caricare prodotti nel tuo negozio WooCommerce senza accedere al backend di WordPress, attraverso un'interfaccia React dedicata che comunica con WordPress tramite API REST sicure.

## Caratteristiche Principali

- **API REST per WooCommerce**: Espone endpoint API dedicati per l'integrazione con l'app DoCommerce
- **Sicurezza Avanzata**: Sistema di autenticazione basato su token e email autorizzate
- **Supporto Upload Singolo e Bulk**: Gestisce sia caricamenti di prodotti singoli che upload CSV massivi
- **Gestione Attributi**: Supporta categorie, tag, attributi (taglia, colore) e immagini
- **Logging Attività**: Monitoraggio completo di tutte le operazioni effettuate
- **Dashboard Admin**: Interfaccia di amministrazione integrata in WordPress

## Requisiti

- WordPress 5.6+
- WooCommerce 5.0+
- PHP 7.4+

## Installazione

1. Scarica o clona questo repository nella directory `/wp-content/plugins/` del tuo WordPress
2. Rinomina la cartella in `do-commerce` (se necessario)
3. Attiva il plugin dalla pagina "Plugin" in WordPress
4. Vai alla pagina "DoCommerce > Impostazioni" per configurare il plugin

## Configurazione

Dopo l'installazione, bisogna:

1. Impostare le email autorizzate o generare un token API
2. Configurare le impostazioni di upload se necessario

## Endpoint API

Il plugin espone i seguenti endpoint REST:

| Endpoint | Metodo | Descrizione |
|----------|--------|-------------|
| `/wp-json/docommerce/v1/product` | POST | Crea un singolo prodotto |
| `/wp-json/docommerce/v1/products/bulk` | POST | Carica più prodotti contemporaneamente |
| `/wp-json/docommerce/v1/verify` | GET | Verifica l'autorizzazione |

### Autenticazione

Le API supportano due metodi di autenticazione:

1. **Email utente**: Includi `user_email` nel corpo della richiesta
2. **Token API**: Imposta l'header HTTP `X-DoCommerce-Token`

## Struttura del Plugin

```
do-commerce/
├── assets/                # JS, CSS per il backend
├── includes/              # File PHP core
│   ├── class-api.php      # Gestione API REST
│   ├── class-product-manager.php # Gestione prodotti
│   └── class-settings.php # Impostazioni plugin
├── templates/             # Template per l'admin
│   ├── activity-log-page.php
│   └── settings-page.php
├── do-commerce.php        # File principale
└── readme.txt             # Documentazione WordPress
```

## Integrazione Frontend

Per integrare questo plugin con l'app React DoCommerce, configura l'URL dell'API nell'applicazione frontend puntando a:

```
https://tuo-sito.com/wp-json/docommerce/v1
```

## Sviluppo

### Prerequisiti

- [Node.js](https://nodejs.org/) per compilare gli asset
- [Composer](https://getcomposer.org/) per gestire dipendenze PHP

### Setup Ambiente di Sviluppo

1. Clona questo repository
2. Installa le dipendenze: `composer install`
3. Per sviluppare gli asset: `cd assets && npm install`

## Licenza

GPL v2 o successiva