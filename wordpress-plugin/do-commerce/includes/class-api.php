<?php
/**
 * Classe per gestire le API REST di DoCommerce
 *
 * @package DoCommerce
 */

// Se questo file viene chiamato direttamente, interrompi l'esecuzione
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Classe per la gestione delle API REST
 */
class DoCommerce_API {
    
    /**
     * Namespace per le API REST
     *
     * @var string
     */
    private $namespace = 'docommerce/v1';
    
    /**
     * Endpoint base per le API
     *
     * @var string
     */
    private $rest_base = '';
    
    /**
     * Manager dei prodotti
     *
     * @var DoCommerce_Product_Manager
     */
    private $product_manager;

    /**
     * Oggetto delle impostazioni
     *
     * @var DoCommerce_Settings
     */
    private $settings;
    
    /**
     * Costruttore
     */
    public function __construct() {
        $this->product_manager = new DoCommerce_Product_Manager();
        $this->settings = new DoCommerce_Settings();
        
        // Registrazione degli endpoint REST
        add_action('rest_api_init', array($this, 'register_routes'));
    }
    
    /**
     * Registra le rotte REST API
     */
    public function register_routes() {
        // Endpoint per l'aggiunta di un singolo prodotto
        register_rest_route($this->namespace, '/product', array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => array($this, 'create_product'),
            'permission_callback' => array($this, 'check_permissions'),
            'args'                => $this->get_product_args(),
        ));
        
        // Endpoint per l'aggiunta in blocco di prodotti
        register_rest_route($this->namespace, '/products/bulk', array(
            'methods'             => WP_REST_Server::CREATABLE,
            'callback'            => array($this, 'bulk_create_products'),
            'permission_callback' => array($this, 'check_permissions'),
            'args'                => $this->get_bulk_args(),
        ));
        
        // Endpoint per la verifica dell'autorizzazione
        register_rest_route($this->namespace, '/verify', array(
            'methods'             => WP_REST_Server::READABLE,
            'callback'            => array($this, 'verify_auth'),
            'permission_callback' => array($this, 'check_permissions'),
        ));
    }
    
    /**
     * Verifica i permessi per le chiamate API
     *
     * @param WP_REST_Request $request Richiesta REST
     * @return bool|WP_Error
     */
    public function check_permissions($request) {
        // Ottieni i parametri
        $params = $request->get_params();
        
        // Verifica token in header
        $token = $request->get_header('X-DoCommerce-Token');
        $stored_token = $this->settings->get_option('api_token');
        
        if ($token && $stored_token && $token === $stored_token) {
            return true;
        }
        
        // Verifica email utente
        if (isset($params['user_email']) && $this->settings->is_email_authorized($params['user_email'])) {
            return true;
        }
        
        return new WP_Error(
            'rest_forbidden',
            __('Accesso non autorizzato.', 'do-commerce'),
            array('status' => 403)
        );
    }
    
    /**
     * Verifica l'autorizzazione
     *
     * @param WP_REST_Request $request Richiesta REST
     * @return WP_REST_Response
     */
    public function verify_auth($request) {
        return rest_ensure_response(array(
            'success' => true,
            'message' => __('Autorizzazione verificata.', 'do-commerce'),
        ));
    }
    
    /**
     * Crea un singolo prodotto
     *
     * @param WP_REST_Request $request Richiesta REST
     * @return WP_REST_Response|WP_Error
     */
    public function create_product($request) {
        $params = $request->get_params();
        $files = $request->get_file_params();
        
        // Validazione campi obbligatori
        if (empty($params['title']) || empty($params['price'])) {
            return new WP_Error(
                'missing_fields',
                __('Campi obbligatori mancanti: titolo e prezzo sono richiesti.', 'do-commerce'),
                array('status' => 400)
            );
        }
        
        try {
            // Creazione prodotto tramite il product manager
            $product_id = $this->product_manager->create_product($params, $files);
            
            // Prepara la risposta di successo
            $response = array(
                'success'    => true,
                'product_id' => $product_id,
                'message'    => __('Prodotto creato con successo.', 'do-commerce'),
                'permalink'  => get_permalink($product_id),
            );
            
            // Registra l'attività
            $this->log_activity($params['user_email'] ?? 'api', 'create_product', $product_id);
            
            return rest_ensure_response($response);
            
        } catch (Exception $e) {
            return new WP_Error(
                'product_creation_failed',
                $e->getMessage(),
                array('status' => 500)
            );
        }
    }
    
    /**
     * Crea più prodotti in blocco
     *
     * @param WP_REST_Request $request Richiesta REST
     * @return WP_REST_Response|WP_Error
     */
    public function bulk_create_products($request) {
        $params = $request->get_params();
        
        // Verifica che ci siano prodotti nel payload
        if (empty($params['products']) || !is_array($params['products'])) {
            return new WP_Error(
                'missing_products',
                __('Nessun prodotto fornito per il caricamento in blocco.', 'do-commerce'),
                array('status' => 400)
            );
        }
        
        $results = array(
            'success'    => true,
            'total'      => count($params['products']),
            'successful' => 0,
            'failed'     => 0,
            'failures'   => array(),
        );
        
        // Processa ogni prodotto
        foreach ($params['products'] as $index => $product_data) {
            try {
                // Validazione campi obbligatori
                if (empty($product_data['title']) || empty($product_data['price'])) {
                    throw new Exception(__('Campi obbligatori mancanti: titolo e prezzo sono richiesti.', 'do-commerce'));
                }
                
                // Creazione prodotto
                $product_id = $this->product_manager->create_product($product_data);
                $results['successful']++;
                
                // Registra l'attività
                $this->log_activity($params['user_email'] ?? 'api', 'bulk_create_product', $product_id);
                
            } catch (Exception $e) {
                $results['failed']++;
                $results['failures'][] = array(
                    'index'        => $index,
                    'error'        => $e->getMessage(),
                    'product_data' => $product_data
                );
            }
        }
        
        // Aggiorna il flag di successo se ci sono stati errori
        if ($results['failed'] > 0) {
            $results['success'] = false;
        }
        
        return rest_ensure_response($results);
    }
    
    /**
     * Ottiene gli argomenti per l'endpoint prodotto singolo
     *
     * @return array
     */
    private function get_product_args() {
        return array(
            'title' => array(
                'required'          => true,
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'description'       => __('Titolo del prodotto', 'do-commerce'),
            ),
            'price' => array(
                'required'          => true,
                'type'              => 'number',
                'sanitize_callback' => 'floatval',
                'description'       => __('Prezzo del prodotto', 'do-commerce'),
            ),
            'description' => array(
                'type'              => 'string',
                'sanitize_callback' => 'wp_kses_post',
                'description'       => __('Descrizione del prodotto', 'do-commerce'),
            ),
            'stock' => array(
                'type'              => 'integer',
                'sanitize_callback' => 'absint',
                'description'       => __('Quantità disponibile', 'do-commerce'),
            ),
            'category' => array(
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'description'       => __('Categoria del prodotto', 'do-commerce'),
            ),
            'user_email' => array(
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_email',
                'description'       => __('Email dell\'utente che effettua la richiesta', 'do-commerce'),
            ),
        );
    }
    
    /**
     * Ottiene gli argomenti per l'endpoint bulk
     *
     * @return array
     */
    private function get_bulk_args() {
        return array(
            'products' => array(
                'required'    => true,
                'type'        => 'array',
                'description' => __('Array di prodotti da creare', 'do-commerce'),
            ),
            'user_email' => array(
                'type'              => 'string',
                'sanitize_callback' => 'sanitize_email',
                'description'       => __('Email dell\'utente che effettua la richiesta', 'do-commerce'),
            ),
        );
    }
    
    /**
     * Registra un'attività nel log
     *
     * @param string $user_email Email dell'utente
     * @param string $action Azione effettuata
     * @param int $product_id ID del prodotto
     * @return void
     */
    private function log_activity($user_email, $action, $product_id) {
        // Registra l'attività se il logging è abilitato
        if ($this->settings->get_option('enable_logging', 'yes') === 'yes') {
            $log_entry = array(
                'user_email' => $user_email,
                'action'     => $action,
                'product_id' => $product_id,
                'timestamp'  => current_time('mysql'),
                'ip'         => $_SERVER['REMOTE_ADDR'],
            );
            
            // Ottieni il log corrente
            $log = get_option('docommerce_activity_log', array());
            
            // Aggiungi la nuova voce
            array_unshift($log, $log_entry);
            
            // Limita il log alle ultime 1000 voci
            if (count($log) > 1000) {
                $log = array_slice($log, 0, 1000);
            }
            
            // Salva il log aggiornato
            update_option('docommerce_activity_log', $log);
        }
    }
}