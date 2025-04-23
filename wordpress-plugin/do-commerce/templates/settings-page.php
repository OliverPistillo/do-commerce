<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
    
    <div class="docommerce-header">
        <div class="docommerce-logo">
            <img src="<?php echo DOCOMMERCE_PLUGIN_URL . 'assets/img/logo.png'; ?>" alt="DoCommerce Logo" />
        </div>
        <div class="docommerce-version">
            <span><?php echo sprintf(__('Versione %s', 'do-commerce'), DOCOMMERCE_VERSION); ?></span>
        </div>
    </div>
    
    <div class="docommerce-admin-content">
        <div class="docommerce-admin-main">
            <form method="post" action="options.php">
                <?php
                // Output security fields
                settings_fields($this->option_group);
                
                // Output setting sections and fields
                do_settings_sections($this->page_name);
                
                // Output save settings button
                submit_button(__('Salva Impostazioni', 'do-commerce'));
                ?>
            </form>
        </div>
        
        <div class="docommerce-admin-sidebar">
            <div class="docommerce-admin-box">
                <h3><?php _e('API Endpoint', 'do-commerce'); ?></h3>
                <p><?php _e('Gli endpoint API di DoCommerce sono disponibili in:', 'do-commerce'); ?></p>
                <code><?php echo rest_url('docommerce/v1/'); ?></code>
                
                <h4><?php _e('Endpoint Disponibili:', 'do-commerce'); ?></h4>
                <ul>
                    <li><code>POST /product</code> - <?php _e('Crea un nuovo prodotto', 'do-commerce'); ?></li>
                    <li><code>POST /products/bulk</code> - <?php _e('Carica più prodotti contemporaneamente', 'do-commerce'); ?></li>
                    <li><code>GET /verify</code> - <?php _e('Verifica l\'autorizzazione', 'do-commerce'); ?></li>
                </ul>
                
                <h4><?php _e('Autenticazione:', 'do-commerce'); ?></h4>
                <p><?php _e('Puoi autenticare le richieste API in due modi:', 'do-commerce'); ?></p>
                <ol>
                    <li><?php _e('Includi <code>user_email</code> nel corpo della richiesta', 'do-commerce'); ?></li>
                    <li><?php _e('Imposta l\'header HTTP <code>X-DoCommerce-Token</code> con il token API', 'do-commerce'); ?></li>
                </ol>
            </div>
            
            <div class="docommerce-admin-box">
                <h3><?php _e('Supporto', 'do-commerce'); ?></h3>
                <p><?php _e('Per assistenza o informazioni, contatta il supporto DoCommerce:', 'do-commerce'); ?></p>
                <a href="mailto:support@docommerce.example.com" class="button button-secondary">
                    <?php _e('Contatta Supporto', 'do-commerce'); ?>
                </a>
                
                <h4><?php _e('Documentazione', 'do-commerce'); ?></h4>
                <p><?php _e('Consulta la documentazione completa per maggiori informazioni:', 'do-commerce'); ?></p>
                <a href="https://docs.docommerce.example.com" target="_blank" class="button button-secondary">
                    <?php _e('Visualizza Documentazione', 'do-commerce'); ?>
                </a>
            </div>
        </div>
    </div>
</div>

<style>
    .docommerce-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding: 15px;
        background: #fff;
        border: 1px solid #ccd0d4;
        border-radius: 4px;
    }
    
    .docommerce-logo img {
        max-height: 50px;
    }
    
    .docommerce-version {
        color: #606a73;
        font-size: 14px;
    }
    
    .docommerce-admin-content {
        display: flex;
        gap: 20px;
        margin-top: 20px;
    }
    
    .docommerce-admin-main {
        flex: 2;
        background: #fff;
        padding: 20px;
        border: 1px solid #ccd0d4;
        border-radius: 4px;
    }
    
    .docommerce-admin-sidebar {
        flex: 1;
    }
    
    .docommerce-admin-box {
        background: #fff;
        padding: 20px;
        border: 1px solid #ccd0d4;
        border-radius: 4px;
        margin-bottom: 20px;
    }
    
    .docommerce-admin-box h3 {
        margin-top: 0;
        border-bottom: 1px solid #eee;
        padding-bottom: 10px;
    }
    
    .docommerce-admin-box h4 {
        margin-top: 20px;
        margin-bottom: 10px;
    }
    
    .docommerce-admin-box ul, 
    .docommerce-admin-box ol {
        margin-left: 20px;
    }
    
    .docommerce-admin-box code {
        background: #f6f7f7;
        padding: 2px 6px;
        border-radius: 3px;
    }
    
    /* Responsive layout */
    @media screen and (max-width: 782px) {
        .docommerce-admin-content {
            flex-direction: column;
        }
        
        .docommerce-admin-sidebar {
            margin-top: 20px;
        }
    }
</style>