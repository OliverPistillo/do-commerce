<div class="wrap">
    <h1><?php _e('DoCommerce - Log Attività', 'do-commerce'); ?></h1>
    
    <div class="docommerce-log-actions">
        <form method="post">
            <?php wp_nonce_field('docommerce_clear_log'); ?>
            <button type="submit" name="clear_log" class="button button-secondary" onclick="return confirm('<?php esc_attr_e('Sei sicuro di voler cancellare il log delle attività?', 'do-commerce'); ?>');">
                <?php _e('Cancella Log', 'do-commerce'); ?>
            </button>
            
            <button type="button" id="download_log" class="button button-secondary">
                <?php _e('Esporta CSV', 'do-commerce'); ?>
            </button>
        </form>
    </div>
    
    <div class="docommerce-log-container">
        <?php if (empty($log)) : ?>
            <div class="docommerce-empty-log">
                <p><?php _e('Nessuna attività registrata.', 'do-commerce'); ?></p>
            </div>
        <?php else : ?>
            <table class="wp-list-table widefat fixed striped docommerce-log-table">
                <thead>
                    <tr>
                        <th><?php _e('Data/Ora', 'do-commerce'); ?></th>
                        <th><?php _e('Utente', 'do-commerce'); ?></th>
                        <th><?php _e('Azione', 'do-commerce'); ?></th>
                        <th><?php _e('Prodotto ID', 'do-commerce'); ?></th>
                        <th><?php _e('IP', 'do-commerce'); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($log as $entry) : ?>
                        <tr>
                            <td><?php echo isset($entry['timestamp']) ? esc_html($entry['timestamp']) : ''; ?></td>
                            <td><?php echo isset($entry['user_email']) ? esc_html($entry['user_email']) : ''; ?></td>
                            <td>
                                <?php
                                $action = isset($entry['action']) ? $entry['action'] : '';
                                switch ($action) {
                                    case 'create_product':
                                        echo '<span class="log-action log-action-create">' . __('Creazione Prodotto', 'do-commerce') . '</span>';
                                        break;
                                    case 'bulk_create_product':
                                        echo '<span class="log-action log-action-bulk">' . __('Creazione Massiva', 'do-commerce') . '</span>';
                                        break;
                                    default:
                                        echo esc_html($action);
                                }
                                ?>
                            </td>
                            <td>
                                <?php
                                $product_id = isset($entry['product_id']) ? $entry['product_id'] : '';
                                if ($product_id) {
                                    $edit_link = get_edit_post_link($product_id);
                                    if ($edit_link) {
                                        echo '<a href="' . esc_url($edit_link) . '" target="_blank">' . esc_html($product_id) . '</a>';
                                    } else {
                                        echo esc_html($product_id);
                                    }
                                }
                                ?>
                            </td>
                            <td><?php echo isset($entry['ip']) ? esc_html($entry['ip']) : ''; ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
    </div>
</div>

<script>
    jQuery(document).ready(function($) {
        // Funzione per esportare il log in formato CSV
        $('#download_log').on('click', function() {
            // Intestazioni CSV
            var csvContent = "Data/Ora,Utente,Azione,Prodotto ID,IP\n";
            
            // Dati dalla tabella
            $('.docommerce-log-table tbody tr').each(function() {
                var row = [];
                $(this).find('td').each(function() {
                    // Estrarre il testo senza HTML per il CSV
                    var cellText = $(this).text().trim();
                    // Escape delle virgole e virgolette
                    cellText = cellText.replace(/"/g, '""');
                    if (cellText.indexOf(',') !== -1) {
                        cellText = '"' + cellText + '"';
                    }
                    row.push(cellText);
                });
                csvContent += row.join(',') + "\n";
            });
            
            // Crea un blob e scarica il file
            var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            var link = document.createElement("a");
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "docommerce-activity-log.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    });
</script>

<style>
    .docommerce-log-actions {
        margin: 15px 0;
        padding: 10px 0;
        border-bottom: 1px solid #ccc;
    }
    
    .docommerce-log-container {
        margin-top: 20px;
        background: #fff;
        padding: 15px;
        border: 1px solid #ccd0d4;
        border-radius: 4px;
    }
    
    .docommerce-empty-log {
        padding: 20px;
        text-align: center;
        color: #777;
    }
    
    .docommerce-log-table {
        width: 100%;
        border-collapse: collapse;
    }
    
    .log-action {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 3px;
        font-size: 12px;
    }
    
    .log-action-create {
        background-color: #d4edda;
        color: #155724;
    }
    
    .log-action-bulk {
        background-color: #cce5ff;
        color: #004085;
    }
</style>