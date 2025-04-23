<?php
/**
 * Plugin Name: DoCommerce
 * Description: Una soluzione per gestire più store WooCommerce da un'unica interfaccia centralizzata.
 * Version: 1.0.0
 * Author: DoCommerce Team
 * Author URI: https://docommerce.example.com
 * Text Domain: do-commerce
 * Domain Path: /languages
 * WC requires at least: 5.0.0
 * WC tested up to: 8.0.0
 */

// Se questo file viene chiamato direttamente, interrompi l'esecuzione
if (!defined('ABSPATH')) {
    exit;
}

// Definizione costanti
define('DOCOMMERCE_VERSION', '1.0.0');
define('DOCOMMERCE_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('DOCOMMERCE_PLUGIN_URL', plugin_dir_url(__FILE__));
define('DOCOMMERCE_PLUGIN_BASENAME', plugin_basename(__FILE__));

// Controllo presenza di WooCommerce
function docommerce_check_woocommerce_active() {
    if (!in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
        add_action('admin_notices', 'docommerce_woocommerce_missing_notice');
        return false;
    }
    return true;
}

// Messaggio di errore se WooCommerce non è attivo
function docommerce_woocommerce_missing_notice() {
    ?>
    <div class="error">
        <p><?php _e('DoCommerce richiede WooCommerce per funzionare. Per favore, attiva WooCommerce prima di utilizzare DoCommerce.', 'do-commerce'); ?></p>
    </div>
    <?php
}

// Inizializzazione del plugin
function docommerce_init() {
    // Controlla se WooCommerce è attivo
    if (!docommerce_check_woocommerce_active()) {
        return;
    }

    // Carica file di traduzione
    load_plugin_textdomain('do-commerce', false, dirname(plugin_basename(__FILE__)) . '/languages');

    // Includi le classi principali
    require_once DOCOMMERCE_PLUGIN_DIR . 'includes/class-settings.php';
    require_once DOCOMMERCE_PLUGIN_DIR . 'includes/class-product-manager.php';
    require_once DOCOMMERCE_PLUGIN_DIR . 'includes/class-api.php';

    // Inizializza le classi
    $settings = new DoCommerce_Settings();
    $product_manager = new DoCommerce_Product_Manager();
    $api = new DoCommerce_API();
}
add_action('plugins_loaded', 'docommerce_init');

// Attivazione del plugin
function docommerce_activate() {
    // Crea tabelle personalizzate se necessario
    // Inizializza impostazioni predefinite
    update_option('docommerce_version', DOCOMMERCE_VERSION);
    
    // Imposta flag per eseguire operazioni alla prossima richiesta
    set_transient('docommerce_activation_redirect', true, 30);
}
register_activation_hook(__FILE__, 'docommerce_activate');

// Disattivazione del plugin
function docommerce_deactivate() {
    // Pulizia durante la disattivazione
}
register_deactivation_hook(__FILE__, 'docommerce_deactivate');

// Redirect dopo l'attivazione per configurare il plugin
function docommerce_activation_redirect() {
    if (get_transient('docommerce_activation_redirect')) {
        delete_transient('docommerce_activation_redirect');
        if (!isset($_GET['activate-multi'])) {
            wp_redirect(admin_url('admin.php?page=docommerce-settings'));
            exit;
        }
    }
}
add_action('admin_init', 'docommerce_activation_redirect');

// Aggiunge link alle impostazioni nella pagina dei plugin
function docommerce_plugin_action_links($links) {
    $plugin_links = array(
        '<a href="' . admin_url('admin.php?page=docommerce-settings') . '">' . __('Impostazioni', 'do-commerce') . '</a>',
    );
    return array_merge($plugin_links, $links);
}
add_filter('plugin_action_links_' . DOCOMMERCE_PLUGIN_BASENAME, 'docommerce_plugin_action_links');

// Funzione per il debug
function docommerce_debug_log($message) {
    if (WP_DEBUG === true) {
        if (is_array($message) || is_object($message)) {
            error_log(print_r($message, true));
        } else {
            error_log($message);
        }
    }
}