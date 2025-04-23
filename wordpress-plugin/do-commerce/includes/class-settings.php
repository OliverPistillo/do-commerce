<?php
/**
 * Classe per gestire le impostazioni del plugin
 *
 * @package DoCommerce
 */

// Se questo file viene chiamato direttamente, interrompi l'esecuzione
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Classe per gestire le impostazioni del plugin
 */
class DoCommerce_Settings {
    
    /**
     * Nome gruppo opzioni
     *
     * @var string
     */
    private $option_group = 'docommerce_options';
    
    /**
     * Nome pagina impostazioni
     *
     * @var string
     */
    private $page_name = 'docommerce-settings';
    
    /**
     * Impostazioni predefinite
     *
     * @var array
     */
    private $defaults = array(
        'api_token'        => '',
        'authorized_emails' => '',
        'enable_logging'   => 'yes',
        'max_upload_size'  => '5',
        'allowed_file_types' => 'jpg,jpeg,png',
    );
    
    /**
     * Costruttore
     */
    public function __construct() {
        // Aggiungi il menu delle impostazioni
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Registra le impostazioni
        add_action('admin_init', array($this, 'register_settings'));
        
        // Aggiungi sezione per il log attività
        add_action('admin_menu', array($this, 'add_activity_log_page'));
    }
    
    /**
     * Aggiunge la voce di menu per le impostazioni
     */
    public function add_admin_menu() {
        add_menu_page(
            __('DoCommerce', 'do-commerce'),
            __('DoCommerce', 'do-commerce'),
            'manage_options',
            $this->page_name,
            array($this, 'render_settings_page'),
            'dashicons-cart',
            25
        );
        
        add_submenu_page(
            $this->page_name,
            __('Impostazioni', 'do-commerce'),
            __('Impostazioni', 'do-commerce'),
            'manage_options',
            $this->page_name,
            array($this, 'render_settings_page')
        );
    }
    
    /**
     * Aggiunge la pagina per il log delle attività
     */
    public function add_activity_log_page() {
        add_submenu_page(
            $this->page_name,
            __('Log Attività', 'do-commerce'),
            __('Log Attività', 'do-commerce'),
            'manage_options',
            'docommerce-activity-log',
            array($this, 'render_activity_log_page')
        );
    }
    
    /**
     * Registra le impostazioni
     */
    public function register_settings() {
        register_setting(
            $this->option_group,
            'docommerce_settings',
            array($this, 'sanitize_settings')
        );
        
        // Sezione generale
        add_settings_section(
            'docommerce_general',
            __('Impostazioni Generali', 'do-commerce'),
            array($this, 'general_section_callback'),
            $this->page_name
        );
        
        // Campo token API
        add_settings_field(
            'api_token',
            __('Token API', 'do-commerce'),
            array($this, 'api_token_callback'),
            $this->page_name,
            'docommerce_general'
        );
        
        // Campo email autorizzate
        add_settings_field(
            'authorized_emails',
            __('Email Autorizzate', 'do-commerce'),
            array($this, 'authorized_emails_callback'),
            $this->page_name,
            'docommerce_general'
        );
        
        // Campo abilitazione log
        add_settings_field(
            'enable_logging',
            __('Abilita Logging', 'do-commerce'),
            array($this, 'enable_logging_callback'),
            $this->page_name,
            'docommerce_general'
        );
        
        // Sezione upload
        add_settings_section(
            'docommerce_upload',
            __('Impostazioni Upload', 'do-commerce'),
            array($this, 'upload_section_callback'),
            $this->page_name
        );
        
        // Campo dimensione massima upload
        add_settings_field(
            'max_upload_size',
            __('Dimensione Massima Upload (MB)', 'do-commerce'),
            array($this, 'max_upload_size_callback'),
            $this->page_name,
            'docommerce_upload'
        );
        
        // Campo tipi di file consentiti
        add_settings_field(
            'allowed_file_types',
            __('Tipi di File Consentiti', 'do-commerce'),
            array($this, 'allowed_file_types_callback'),
            $this->page_name,
            'docommerce_upload'
        );
    }
    
    /**
     * Callback per la sezione generale
     */
    public function general_section_callback() {
        echo '<p>' . __('Configura le impostazioni generali del plugin DoCommerce.', 'do-commerce') . '</p>';
    }
    
    /**
     * Callback per la sezione upload
     */
    public function upload_section_callback() {
        echo '<p>' . __('Configura le impostazioni per l\'upload dei file.', 'do-commerce') . '</p>';
    }
    
    /**
     * Callback per il campo token API
     */
    public function api_token_callback() {
        $settings = $this->get_all_options();
        $value = $settings['api_token'];
        
        $html = '<input type="text" id="api_token" name="docommerce_settings[api_token]" value="' . esc_attr($value) . '" class="regular-text" />';
        $html .= '<p class="description">' . __('Token utilizzato per autenticare le richieste API.', 'do-commerce') . '</p>';
        
        if (empty($value)) {
            $html .= '<button type="button" id="generate_token" class="button button-secondary">' . __('Genera Token', 'do-commerce') . '</button>';
            $html .= '<script>
                jQuery(document).ready(function($) {
                    $("#generate_token").on("click", function() {
                        var length = 32;
                        var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
                        var token = "";
                        for (var i = 0; i < length; i++) {
                            token += chars.charAt(Math.floor(Math.random() * chars.length));
                        }
                        $("#api_token").val(token);
                    });
                });
            </script>';
        }
        
        echo $html;
    }
    
    /**
     * Callback per il campo email autorizzate
     */
    public function authorized_emails_callback() {
        $settings = $this->get_all_options();
        $value = $settings['authorized_emails'];
        
        $html = '<textarea id="authorized_emails" name="docommerce_settings[authorized_emails]" rows="5" cols="50" class="large-text">' . esc_textarea($value) . '</textarea>';
        $html .= '<p class="description">' . __('Elenco di email autorizzate ad utilizzare le API, separate da virgola.', 'do-commerce') . '</p>';
        
        echo $html;
    }
    
    /**
     * Callback per il campo abilitazione log
     */
    public function enable_logging_callback() {
        $settings = $this->get_all_options();
        $value = $settings['enable_logging'];
        
        $html = '<label><input type="checkbox" id="enable_logging" name="docommerce_settings[enable_logging]" value="yes" ' . checked('yes', $value, false) . ' /> ';
        $html .= __('Abilita il logging delle attività', 'do-commerce') . '</label>';
        $html .= '<p class="description">' . __('Registra tutte le attività API nel log.', 'do-commerce') . '</p>';
        
        echo $html;
    }
    
    /**
     * Callback per il campo dimensione massima upload
     */
    public function max_upload_size_callback() {
        $settings = $this->get_all_options();
        $value = $settings['max_upload_size'];
        
        $html = '<input type="number" id="max_upload_size" name="docommerce_settings[max_upload_size]" value="' . esc_attr($value) . '" class="small-text" min="1" max="100" /> MB';
        $html .= '<p class="description">' . __('Dimensione massima consentita per gli upload (in MB).', 'do-commerce') . '</p>';
        
        // Aggiungi informazioni sul limite del server
        $server_limit = $this->get_server_upload_limit();
        $html .= '<p class="description">' . sprintf(__('Il limite configurato sul server è di %s MB.', 'do-commerce'), $server_limit) . '</p>';
        
        echo $html;
    }
    
    /**
     * Callback per il campo tipi di file consentiti
     */
    public function allowed_file_types_callback() {
        $settings = $this->get_all_options();
        $value = $settings['allowed_file_types'];
        
        $html = '<input type="text" id="allowed_file_types" name="docommerce_settings[allowed_file_types]" value="' . esc_attr($value) . '" class="regular-text" />';
        $html .= '<p class="description">' . __('Estensioni dei file consentiti per l\'upload, separate da virgole (es. jpg,jpeg,png).', 'do-commerce') . '</p>';
        
        echo $html;
    }
    
    /**
     * Visualizza la pagina delle impostazioni
     */
    public function render_settings_page() {
        // Controlla i permessi
        if (!current_user_can('manage_options')) {
            return;
        }
        
        // Includi il template
        include(DOCOMMERCE_PLUGIN_DIR . 'templates/settings-page.php');
    }
    
    /**
     * Visualizza la pagina del log attività
     */
    public function render_activity_log_page() {
        // Controlla i permessi
        if (!current_user_can('manage_options')) {
            return;
        }
        
        // Ottieni il log attività
        $log = get_option('docommerce_activity_log', array());
        
        // Azioni per la gestione del log
        if (isset($_POST['clear_log']) && check_admin_referer('docommerce_clear_log')) {
            update_option('docommerce_activity_log', array());
            $log = array();
            add_settings_error(
                'docommerce_activity_log',
                'log_cleared',
                __('Log attività cancellato con successo.', 'do-commerce'),
                'success'
            );
        }
        
        // Visualizza i messaggi
        settings_errors('docommerce_activity_log');
        
        // Includi il template
        include(DOCOMMERCE_PLUGIN_DIR . 'templates/activity-log-page.php');
    }
    
    /**
     * Sanitizza le impostazioni
     *
     * @param array $input Input non sanitizzato
     * @return array Input sanitizzato
     */
    public function sanitize_settings($input) {
        $sanitized = array();
        
        // Token API
        if (isset($input['api_token'])) {
            $sanitized['api_token'] = sanitize_text_field($input['api_token']);
        }
        
        // Email autorizzate
        if (isset($input['authorized_emails'])) {
            $emails = explode(',', $input['authorized_emails']);
            $sanitized_emails = array();
            
            foreach ($emails as $email) {
                $email = trim($email);
                if (!empty($email) && is_email($email)) {
                    $sanitized_emails[] = sanitize_email($email);
                }
            }
            
            $sanitized['authorized_emails'] = implode(', ', $sanitized_emails);
        }
        
        // Abilitazione log
        $sanitized['enable_logging'] = isset($input['enable_logging']) ? 'yes' : 'no';
        
        // Dimensione massima upload
        $sanitized['max_upload_size'] = isset($input['max_upload_size']) ? 
            min(100, max(1, intval($input['max_upload_size']))) : $this->defaults['max_upload_size'];
        
        // Tipi di file consentiti
        if (isset($input['allowed_file_types'])) {
            $types = explode(',', $input['allowed_file_types']);
            $sanitized_types = array();
            
            foreach ($types as $type) {
                $type = trim($type);
                if (!empty($type)) {
                    $sanitized_types[] = sanitize_text_field($type);
                }
            }
            
            $sanitized['allowed_file_types'] = implode(',', $sanitized_types);
        }
        
        return $sanitized;
    }
    
    /**
     * Ottiene il valore di un'opzione
     *
     * @param string $key Chiave dell'opzione
     * @param mixed $default Valore predefinito
     * @return mixed Valore dell'opzione
     */
    public function get_option($key, $default = '') {
        $options = $this->get_all_options();
        
        if (isset($options[$key])) {
            return $options[$key];
        }
        
        if (isset($this->defaults[$key])) {
            return $this->defaults[$key];
        }
        
        return $default;
    }
    
    /**
     * Ottiene tutte le opzioni
     *
     * @return array Tutte le opzioni
     */
    public function get_all_options() {
        $options = get_option('docommerce_settings', array());
        return wp_parse_args($options, $this->defaults);
    }
    
    /**
     * Verifica se un'email è autorizzata
     *
     * @param string $email Email da verificare
     * @return bool True se l'email è autorizzata
     */
    public function is_email_authorized($email) {
        $authorized_emails = $this->get_option('authorized_emails');
        
        if (empty($authorized_emails)) {
            return false;
        }
        
        $emails = explode(',', $authorized_emails);
        $emails = array_map('trim', $emails);
        
        return in_array($email, $emails);
    }
    
    /**
     * Ottiene il limite di upload configurato sul server
     *
     * @return float Limite in MB
     */
    private function get_server_upload_limit() {
        $post_max_size = $this->parse_size(ini_get('post_max_size'));
        $upload_max_filesize = $this->parse_size(ini_get('upload_max_filesize'));
        
        return min($post_max_size, $upload_max_filesize) / (1024 * 1024);
    }
    
    /**
     * Converte una stringa di dimensione (come '8M') in byte
     *
     * @param string $size Dimensione
     * @return int Dimensione in byte
     */
    private function parse_size($size) {
        $unit = preg_replace('/[^a-zA-Z]/', '', $size);
        $size = preg_replace('/[^0-9.]/', '', $size);
        
        if ($unit) {
            switch (strtoupper($unit)) {
                case 'G':
                    $size *= 1024 * 1024 * 1024;
                    break;
                case 'M':
                    $size *= 1024 * 1024;
                    break;
                case 'K':
                    $size *= 1024;
                    break;
            }
        }
        
        return $size;
    }
}