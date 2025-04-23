<?php
/**
 * Classe per gestire i prodotti WooCommerce
 *
 * @package DoCommerce
 */

// Se questo file viene chiamato direttamente, interrompi l'esecuzione
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Classe per la gestione dei prodotti WooCommerce
 */
class DoCommerce_Product_Manager {
    
    /**
     * Costruttore
     */
    public function __construct() {
        // Verifica che WooCommerce sia attivo
        if (!class_exists('WC_Product')) {
            docommerce_debug_log('WooCommerce non è attivo. DoCommerce_Product_Manager non può essere inizializzato.');
            return;
        }
    }
    
    /**
     * Crea un nuovo prodotto WooCommerce
     *
     * @param array $data Dati del prodotto
     * @param array $files File caricati (opzionale)
     * @return int ID del prodotto creato
     * @throws Exception Se la creazione fallisce
     */
    public function create_product($data, $files = array()) {
        try {
            // Verifica campi obbligatori
            if (empty($data['title']) || !isset($data['price'])) {
                throw new Exception(__('Titolo e prezzo sono obbligatori', 'do-commerce'));
            }
            
            // Prepara i dati del post
            $post_data = array(
                'post_title'   => sanitize_text_field($data['title']),
                'post_content' => isset($data['description']) ? wp_kses_post($data['description']) : '',
                'post_excerpt' => isset($data['short_description']) ? wp_kses_post($data['short_description']) : '',
                'post_status'  => 'publish',
                'post_type'    => 'product',
            );
            
            // Inserisci il post e ottieni l'ID
            $product_id = wp_insert_post($post_data, true);
            
            if (is_wp_error($product_id)) {
                throw new Exception($product_id->get_error_message());
            }
            
            // Imposta il prodotto come semplice per default
            wp_set_object_terms($product_id, 'simple', 'product_type');
            
            // Imposta il prezzo
            $this->set_product_price($product_id, $data);
            
            // Imposta lo stock
            $this->set_product_stock($product_id, $data);
            
            // Imposta categorie e attributi
            $this->set_product_taxonomies($product_id, $data);
            
            // Gestisci l'immagine del prodotto
            $this->handle_product_image($product_id, $data, $files);
            
            // Imposta meta personalizzati
            $this->set_custom_meta($product_id, $data);
            
            // Aggiorna cache e indici prodotto
            wc_delete_product_transients($product_id);
            
            return $product_id;
            
        } catch (Exception $e) {
            docommerce_debug_log('Errore nella creazione del prodotto: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Imposta il prezzo del prodotto
     *
     * @param int $product_id ID del prodotto
     * @param array $data Dati del prodotto
     * @return void
     */
    private function set_product_price($product_id, $data) {
        // Prezzo regolare
        if (isset($data['price'])) {
            update_post_meta($product_id, '_regular_price', wc_format_decimal($data['price']));
            update_post_meta($product_id, '_price', wc_format_decimal($data['price']));
        }
        
        // Prezzo scontato (se presente)
        if (isset($data['sale_price']) && !empty($data['sale_price'])) {
            update_post_meta($product_id, '_sale_price', wc_format_decimal($data['sale_price']));
            update_post_meta($product_id, '_price', wc_format_decimal($data['sale_price']));
        }
    }
    
    /**
     * Imposta lo stock del prodotto
     *
     * @param int $product_id ID del prodotto
     * @param array $data Dati del prodotto
     * @return void
     */
    private function set_product_stock($product_id, $data) {
        // Gestione stock
        if (isset($data['stock']) && is_numeric($data['stock'])) {
            // Abilita la gestione dello stock
            update_post_meta($product_id, '_manage_stock', 'yes');
            update_post_meta($product_id, '_stock', absint($data['stock']));
            
            // Imposta lo stato dello stock in base alla quantità
            $stock_status = absint($data['stock']) > 0 ? 'instock' : 'outofstock';
            update_post_meta($product_id, '_stock_status', $stock_status);
        } else {
            // Gestione stock disabilitata
            update_post_meta($product_id, '_manage_stock', 'no');
            update_post_meta($product_id, '_stock_status', 'instock');
        }
        
        // Backorders
        if (isset($data['backorders'])) {
            update_post_meta($product_id, '_backorders', sanitize_text_field($data['backorders']));
        } else {
            update_post_meta($product_id, '_backorders', 'no');
        }
    }
    
    /**
     * Imposta le tassonomie del prodotto (categorie, tag, attributi)
     *
     * @param int $product_id ID del prodotto
     * @param array $data Dati del prodotto
     * @return void
     */
    private function set_product_taxonomies($product_id, $data) {
        // Imposta categoria
        if (isset($data['category']) && !empty($data['category'])) {
            $category_term = term_exists($data['category'], 'product_cat');
            
            // Se la categoria non esiste, creala
            if (!$category_term) {
                $category_term = wp_insert_term($data['category'], 'product_cat');
            }
            
            if (!is_wp_error($category_term)) {
                wp_set_object_terms($product_id, intval($category_term['term_id']), 'product_cat');
            }
        }
        
        // Tag prodotto
        if (isset($data['tags']) && !empty($data['tags'])) {
            $tags = is_array($data['tags']) ? $data['tags'] : explode(',', $data['tags']);
            wp_set_object_terms($product_id, $tags, 'product_tag');
        }
        
        // Attributi prodotto (taglia, colore, ecc.)
        $product_attributes = array();
        
        // Taglia
        if (isset($data['size']) && !empty($data['size'])) {
            $this->add_product_attribute($product_id, 'size', $data['size'], 'Taglia', $product_attributes);
        }
        
        // Colore
        if (isset($data['color']) && !empty($data['color'])) {
            $this->add_product_attribute($product_id, 'color', $data['color'], 'Colore', $product_attributes);
        }
        
        // Altri attributi personalizzati
        if (isset($data['attributes']) && is_array($data['attributes'])) {
            foreach ($data['attributes'] as $attribute) {
                if (isset($attribute['name']) && isset($attribute['value'])) {
                    $this->add_product_attribute(
                        $product_id,
                        sanitize_title($attribute['name']),
                        $attribute['value'],
                        $attribute['name'],
                        $product_attributes
                    );
                }
            }
        }
        
        // Salva gli attributi
        if (!empty($product_attributes)) {
            update_post_meta($product_id, '_product_attributes', $product_attributes);
        }
    }
    
    /**
     * Aggiunge un attributo al prodotto
     *
     * @param int $product_id ID del prodotto
     * @param string $key Chiave attributo
     * @param string|array $value Valore attributo
     * @param string $name Nome attributo
     * @param array &$product_attributes Array degli attributi prodotto
     * @return void
     */
    private function add_product_attribute($product_id, $key, $value, $name, &$product_attributes) {
        $taxonomy = 'pa_' . $key;
        $values = is_array($value) ? $value : array($value);
        
        // Assicurati che la tassonomia esista
        if (!taxonomy_exists($taxonomy)) {
            register_taxonomy(
                $taxonomy,
                'product',
                array(
                    'hierarchical' => false,
                    'label'        => $name,
                    'query_var'    => true,
                    'rewrite'      => array('slug' => $key),
                )
            );
        }
        
        // Aggiungi termini
        $term_ids = array();
        foreach ($values as $term_value) {
            $term = term_exists($term_value, $taxonomy);
            
            if (!$term) {
                $term = wp_insert_term($term_value, $taxonomy);
            }
            
            if (!is_wp_error($term)) {
                $term_ids[] = $term['term_id'];
            }
        }
        
        // Imposta i termini per il prodotto
        if (!empty($term_ids)) {
            wp_set_object_terms($product_id, $term_ids, $taxonomy);
        }
        
        // Aggiungi attributo all'array degli attributi
        $product_attributes[$taxonomy] = array(
            'name'         => $taxonomy,
            'value'        => '',
            'position'     => 0,
            'is_visible'   => 1,
            'is_variation' => 0,
            'is_taxonomy'  => 1
        );
    }
    
    /**
     * Gestisce l'immagine del prodotto
     *
     * @param int $product_id ID del prodotto
     * @param array $data Dati del prodotto
     * @param array $files File caricati
     * @return void
     */
    private function handle_product_image($product_id, $data, $files) {
        // Immagine tramite upload file
        if (!empty($files['image'])) {
            // Includi le funzioni necessarie
            if (!function_exists('media_handle_upload')) {
                require_once(ABSPATH . 'wp-admin/includes/image.php');
                require_once(ABSPATH . 'wp-admin/includes/file.php');
                require_once(ABSPATH . 'wp-admin/includes/media.php');
            }
            
            // Prepara l'array $_FILES
            $_FILES['product_image'] = $files['image'];
            
            // Carica l'immagine e associala al prodotto
            $attachment_id = media_handle_upload('product_image', $product_id);
            
            if (!is_wp_error($attachment_id)) {
                // Imposta l'immagine in evidenza
                set_post_thumbnail($product_id, $attachment_id);
            } else {
                docommerce_debug_log('Errore nel caricamento dell\'immagine: ' . $attachment_id->get_error_message());
            }
        }
        // Immagine da URL
        elseif (isset($data['image_url']) && !empty($data['image_url'])) {
            // Includi le funzioni necessarie
            if (!function_exists('media_sideload_image')) {
                require_once(ABSPATH . 'wp-admin/includes/media.php');
                require_once(ABSPATH . 'wp-admin/includes/file.php');
                require_once(ABSPATH . 'wp-admin/includes/image.php');
            }
            
            // Verifica che l'URL sia valido
            if (filter_var($data['image_url'], FILTER_VALIDATE_URL)) {
                $attachment_id = media_sideload_image($data['image_url'], $product_id, '', 'id');
                
                if (!is_wp_error($attachment_id)) {
                    set_post_thumbnail($product_id, $attachment_id);
                } else {
                    docommerce_debug_log('Errore nel caricamento dell\'immagine da URL: ' . $attachment_id->get_error_message());
                }
            }
        }
    }
    
    /**
     * Imposta meta personalizzati
     *
     * @param int $product_id ID del prodotto
     * @param array $data Dati del prodotto
     * @return void
     */
    private function set_custom_meta($product_id, $data) {
        // SKU
        if (isset($data['sku']) && !empty($data['sku'])) {
            update_post_meta($product_id, '_sku', sanitize_text_field($data['sku']));
        }
        
        // Dimensioni prodotto
        if (isset($data['weight']) && !empty($data['weight'])) {
            update_post_meta($product_id, '_weight', wc_format_decimal($data['weight']));
        }
        
        if (isset($data['length']) && !empty($data['length'])) {
            update_post_meta($product_id, '_length', wc_format_decimal($data['length']));
        }
        
        if (isset($data['width']) && !empty($data['width'])) {
            update_post_meta($product_id, '_width', wc_format_decimal($data['width']));
        }
        
        if (isset($data['height']) && !empty($data['height'])) {
            update_post_meta($product_id, '_height', wc_format_decimal($data['height']));
        }
        
        // Prodotto virtuale
        if (isset($data['virtual']) && $data['virtual'] === true) {
            update_post_meta($product_id, '_virtual', 'yes');
        } else {
            update_post_meta($product_id, '_virtual', 'no');
        }
        
        // Prodotto scaricabile
        if (isset($data['downloadable']) && $data['downloadable'] === true) {
            update_post_meta($product_id, '_downloadable', 'yes');
        } else {
            update_post_meta($product_id, '_downloadable', 'no');
        }
        
        // Classe di spedizione
        if (isset($data['shipping_class']) && !empty($data['shipping_class'])) {
            $term = term_exists($data['shipping_class'], 'product_shipping_class');
            
            if (!$term) {
                $term = wp_insert_term($data['shipping_class'], 'product_shipping_class');
            }
            
            if (!is_wp_error($term)) {
                wp_set_object_terms($product_id, intval($term['term_id']), 'product_shipping_class');
            }
        }
        
        // Meta docommerce personalizzati
        update_post_meta($product_id, '_docommerce_created', 'yes');
        update_post_meta($product_id, '_docommerce_created_at', current_time('mysql'));
        
        if (isset($data['user_email'])) {
            update_post_meta($product_id, '_docommerce_creator', sanitize_email($data['user_email']));
        }
    }

    /**
     * Ottiene un prodotto per ID
     *
     * @param int $product_id ID del prodotto
     * @return WC_Product|false Oggetto prodotto o false se non trovato
     */
    public function get_product($product_id) {
        return wc_get_product($product_id);
    }
    
    /**
     * Aggiorna un prodotto esistente
     * 
     * @param int $product_id ID del prodotto
     * @param array $data Dati del prodotto
     * @param array $files File caricati (opzionale)
     * @return int ID del prodotto aggiornato
     * @throws Exception Se l'aggiornamento fallisce
     */
    public function update_product($product_id, $data, $files = array()) {
        // Verifica che il prodotto esista
        $product = $this->get_product($product_id);
        
        if (!$product) {
            throw new Exception(__('Prodotto non trovato', 'do-commerce'));
        }
        
        try {
            // Prepara i dati del post
            $post_data = array(
                'ID' => $product_id
            );
            
            // Aggiorna il titolo se fornito
            if (isset($data['title']) && !empty($data['title'])) {
                $post_data['post_title'] = sanitize_text_field($data['title']);
            }
            
            // Aggiorna la descrizione se fornita
            if (isset($data['description'])) {
                $post_data['post_content'] = wp_kses_post($data['description']);
            }
            
            // Aggiorna la short description se fornita
            if (isset($data['short_description'])) {
                $post_data['post_excerpt'] = wp_kses_post($data['short_description']);
            }
            
            // Aggiorna il post
            if (count($post_data) > 1) {
                wp_update_post($post_data);
            }
            
            // Aggiorna il prezzo
            $this->set_product_price($product_id, $data);
            
            // Aggiorna lo stock
            $this->set_product_stock($product_id, $data);
            
            // Aggiorna categorie e attributi
            $this->set_product_taxonomies($product_id, $data);
            
            // Gestisci l'immagine del prodotto
            $this->handle_product_image($product_id, $data, $files);
            
            // Aggiorna meta personalizzati
            $this->set_custom_meta($product_id, $data);
            
            // Aggiorna cache e indici prodotto
            wc_delete_product_transients($product_id);
            
            return $product_id;
            
        } catch (Exception $e) {
            docommerce_debug_log('Errore nell\'aggiornamento del prodotto: ' . $e->getMessage());
            throw $e;
        }
    }
    
    /**
     * Elimina un prodotto
     *
     * @param int $product_id ID del prodotto
     * @param bool $force Eliminazione definitiva o spostamento nel cestino
     * @return bool True se eliminato, false altrimenti
     */
    public function delete_product($product_id, $force = false) {
        $result = wp_delete_post($product_id, $force);
        return $result !== false;
    }
}