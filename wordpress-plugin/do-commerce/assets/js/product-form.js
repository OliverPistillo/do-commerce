/**
 * DoCommerce Product Form Scripts
 */
(function($) {
    'use strict';

    // Inizializzazione al caricamento del DOM
    $(document).ready(function() {
        // Anteprima immagine
        $('#product_image').on('change', function() {
            var file = this.files[0];
            if (file) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    $('#image_preview').attr('src', e.target.result).show();
                }
                reader.readAsDataURL(file);
            }
        });

        // Validazione form
        $('#docommerce_product_form').on('submit', function(e) {
            var title = $('#product_title').val();
            var price = $('#product_price').val();
            
            if (!title || !price) {
                e.preventDefault();
                alert('Titolo e prezzo sono campi obbligatori.');
                return false;
            }
            
            return true;
        });

        // Gestione attributi dinamici
        $('#add_attribute').on('click', function() {
            var attributeFields = $('.attribute-group').first().clone();
            attributeFields.find('input, select').val('');
            attributeFields.appendTo('#attributes_container');
        });

        // Rimozione attributi
        $(document).on('click', '.remove_attribute', function() {
            if ($('.attribute-group').length > 1) {
                $(this).closest('.attribute-group').remove();
            } else {
                $('.attribute-group').find('input, select').val('');
            }
        });
    });

})(jQuery);