/**
 * DoCommerce Admin Scripts
 */
(function($) {
    'use strict';

    // Inizializzazione al caricamento del DOM
    $(document).ready(function() {
        // Generazione token API
        $('#generate_token').on('click', function() {
            var length = 32;
            var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var token = "";
            for (var i = 0; i < length; i++) {
                token += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            $("#api_token").val(token);
        });

        // Esportazione log attività
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

        // Conferma prima della cancellazione
        $('.docommerce-delete-confirm').on('click', function() {
            return confirm('Sei sicuro di voler procedere con questa azione?');
        });
    });

})(jQuery);