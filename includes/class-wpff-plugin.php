<?php
defined( 'ABSPATH' ) || exit;

final class WPFF_Plugin {
    public static function init(): void {
        add_action( 'init', array( __CLASS__, 'register' ) );
        add_action( 'add_meta_boxes', array( __CLASS__, 'boxes' ) );
        add_action( 'save_post_wpff_item', array( __CLASS__, 'save' ) );
        add_action( 'admin_enqueue_scripts', array( __CLASS__, 'admin_assets' ) );
        add_action( 'wp_enqueue_scripts', array( __CLASS__, 'register_assets' ) );
        add_action( 'admin_notices', array( __CLASS__, 'notices' ) );
        add_action( 'admin_menu', array( __CLASS__, 'menus' ) );
        add_action( 'admin_init', array( __CLASS__, 'settings_register' ) );
        add_filter( 'manage_wpff_item_posts_columns', array( __CLASS__, 'columns' ) );
        add_action( 'manage_wpff_item_posts_custom_column', array( __CLASS__, 'column' ), 10, 2 );
        add_filter( 'post_row_actions', array( __CLASS__, 'row_actions' ), 10, 2 );
        add_action( 'admin_action_wpff_duplicate', array( __CLASS__, 'duplicate' ) );
        add_shortcode( 'wp_flipflop', array( __CLASS__, 'shortcode' ) );
    }

    public static function register(): void {
        register_post_type( 'wpff_item', array(
            'labels' => array(
                'name' => __( 'Masum FlipFlop PDF Reader', 'masum-flipflop-pdf-reader' ), 'singular_name' => __( 'PDF Viewer', 'masum-flipflop-pdf-reader' ),
                'add_new_item' => __( 'Create PDF viewer', 'masum-flipflop-pdf-reader' ),
                'edit_item' => __( 'Edit PDF viewer', 'masum-flipflop-pdf-reader' ),
                'all_items' => __( 'All Items', 'masum-flipflop-pdf-reader' ),
                'not_found' => __( 'Upload a PDF and choose how its pages turn.', 'masum-flipflop-pdf-reader' ),
            ),
            'public' => false, 'show_ui' => true, 'show_in_rest' => true,
            'menu_icon' => 'dashicons-book-alt', 'supports' => array( 'title' ),
            'capability_type' => 'post', 'map_meta_cap' => true,
        ) );
        wp_register_script( 'wpff-block', WPFF_URL . 'assets/block.js', array( 'wp-blocks', 'wp-element', 'wp-components', 'wp-api-fetch', 'wp-block-editor', 'wp-i18n' ), WPFF_VERSION, true );
        register_block_type( 'wp-flipflop/viewer', array(
            'api_version' => 3, 'editor_script' => 'wpff-block',
            'attributes' => array( 'itemId' => array( 'type' => 'number', 'default' => 0 ) ),
            'render_callback' => static function( $attributes ) { return self::shortcode( array( 'id' => $attributes['itemId'] ?? 0 ) ); },
        ) );
    }

    public static function register_assets(): void {
        wp_register_style( 'wpff-runtime', WPFF_URL . 'assets/runtime.css', array(), WPFF_VERSION );
        wp_register_script( 'wpff-runtime', WPFF_URL . 'assets/runtime.js', array(), WPFF_VERSION, true );
    }

    private static function enqueue_runtime(): void {
        self::register_assets();
        wp_enqueue_style( 'wpff-runtime' );
        wp_enqueue_script( 'wpff-runtime' );
        static $localized = false;
        if ( ! $localized ) {
            wp_localize_script( 'wpff-runtime', 'wpffRuntime', array( 'baseUrl' => WPFF_URL . 'assets/', 'version' => WPFF_VERSION ) );
            $localized = true;
        }
    }

    public static function boxes(): void {
        add_meta_box( 'wpff-builder', __( 'Build your experience', 'masum-flipflop-pdf-reader' ), array( __CLASS__, 'editor' ), 'wpff_item', 'normal', 'high' );
        add_meta_box( 'wpff-publish', __( 'Use on your website', 'masum-flipflop-pdf-reader' ), array( __CLASS__, 'embed_box' ), 'wpff_item', 'side' );
    }

    public static function editor( $post ): void {
        wp_nonce_field( 'wpff_save', 'wpff_nonce' );
        echo '<input type="hidden" name="wpff_config" id="wpff-config" value="" />';
        echo '<div id="wpff-admin"><p>' . esc_html__( 'Loading builder…', 'masum-flipflop-pdf-reader' ) . '</p></div>';
    }

    public static function embed_box( $post ): void {
        echo '<p>' . esc_html__( 'Publish this item, then add the Masum FlipFlop PDF Reader block to a page or copy this shortcode.', 'masum-flipflop-pdf-reader' ) . '</p>';
        echo '<input readonly class="widefat" aria-label="' . esc_attr__( 'Shortcode', 'masum-flipflop-pdf-reader' ) . '" value="' . esc_attr( '[wp_flipflop id="' . $post->ID . '"]' ) . '" onclick="this.select()" />';
    }

    public static function admin_assets(): void {
        $screen = get_current_screen();
        if ( ! $screen || 'wpff_item' !== $screen->post_type || 'post' !== $screen->base ) return;
        global $post;
        wp_enqueue_media();
        self::enqueue_runtime();
        wp_enqueue_style( 'wpff-admin', WPFF_URL . 'assets/admin.css', array( 'wpff-runtime' ), WPFF_VERSION );
        wp_enqueue_script( 'wpff-admin', WPFF_URL . 'assets/admin.js', array( 'wpff-runtime', 'media-editor', 'wp-i18n' ), WPFF_VERSION, true );
        $config = get_post_meta( $post->ID, '_wpff_config', true );
        if ( ! is_array( $config ) ) $config = array_merge( WPFF_Config::defaults(), (array) get_option( 'wpff_defaults', array() ) );
        wp_localize_script( 'wpff-admin', 'wpffAdmin', array(
            'config' => WPFF_Config::hydrate( is_array( $config ) ? $config : WPFF_Config::defaults() ),
            'defaults' => WPFF_Config::defaults(), 'id' => $post->ID,
        ) );
    }

    public static function save( int $post_id ): void {
        if ( ! isset( $_POST['wpff_nonce'], $_POST['wpff_config'] ) || ! is_string( $_POST['wpff_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['wpff_nonce'] ) ), 'wpff_save' ) ) return;
        if ( ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) || wp_is_post_revision( $post_id ) || ! current_user_can( 'edit_post', $post_id ) ) return;
        if ( ! is_string( $_POST['wpff_config'] ) || '' === $_POST['wpff_config'] ) return;
        // JSON must remain intact until WPFF_Config::sanitize() validates each field below.
        // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Decoded structured data is sanitized by WPFF_Config::sanitize() before storage.
        $raw = wp_unslash( $_POST['wpff_config'] );
        $result = strlen( $raw ) > 512000 ? new WP_Error( 'size', __( 'The configuration is too large.', 'masum-flipflop-pdf-reader' ) ) : WPFF_Config::sanitize( json_decode( $raw, true ) );
        if ( is_wp_error( $result ) ) {
            set_transient( 'wpff_error_' . get_current_user_id(), $result->get_error_message(), 60 );
            return;
        }
        update_post_meta( $post_id, '_wpff_config', $result );
    }

    public static function notices(): void {
        $message = get_transient( 'wpff_error_' . get_current_user_id() );
        if ( $message ) {
            echo '<div class="notice notice-error"><p>' . esc_html( $message ) . ' ' . esc_html__( 'Your previous builder settings were preserved.', 'masum-flipflop-pdf-reader' ) . '</p></div>';
            delete_transient( 'wpff_error_' . get_current_user_id() );
        }
    }

    public static function shortcode( $attributes ): string {
        $attributes = shortcode_atts( array( 'id' => 0 ), $attributes, 'wp_flipflop' );
        $post = get_post( absint( $attributes['id'] ) );
        if ( ! $post || 'wpff_item' !== $post->post_type || 'publish' !== $post->post_status || post_password_required( $post ) ) return '';
        $config = get_post_meta( $post->ID, '_wpff_config', true );
        if ( ! is_array( $config ) ) return '';
        $config = WPFF_Config::hydrate( $config );
        self::enqueue_runtime();
        // Shortcodes can be rendered after wp_head. Print the registered stylesheet once if needed.
        ob_start();
        if ( ! wp_style_is( 'wpff-runtime', 'done' ) ) wp_print_styles( 'wpff-runtime' );
        $styles = ob_get_clean();
        $config['title'] = get_the_title( $post );
        $json = wp_json_encode( $config, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT );
        $fallback = $config['pdfUrl'] ? '<a href="' . esc_url( $config['pdfUrl'] ) . '">' . esc_html__( 'Open PDF', 'masum-flipflop-pdf-reader' ) . '</a>' : esc_html__( 'Enable JavaScript to view this slider.', 'masum-flipflop-pdf-reader' );
        return $styles . '<section class="wpff-root" aria-label="' . esc_attr( $config['title'] ) . '"><script type="application/json" class="wpff-data">' . $json . '</script><div class="wpff-mount"></div><noscript>' . $fallback . '</noscript></section>';
    }

    public static function columns( array $columns ): array {
        $columns['wpff_type'] = __( 'Type', 'masum-flipflop-pdf-reader' );
        $columns['wpff_shortcode'] = __( 'Shortcode', 'masum-flipflop-pdf-reader' );
        return $columns;
    }
    public static function column( string $column, int $id ): void {
        $config = get_post_meta( $id, '_wpff_config', true );
        if ( 'wpff_type' === $column ) echo esc_html( 'flipbook' === ( $config['type'] ?? '' ) ? ( 'book' === ( $config['pdfEffect'] ?? 'book' ) ? __( 'PDF · Flipbook', 'masum-flipflop-pdf-reader' ) : 'PDF · ' . ucfirst( $config['pdfEffect'] ) ) : __( 'Swiper Slider', 'masum-flipflop-pdf-reader' ) );
        if ( 'wpff_shortcode' === $column ) echo '<code>' . esc_html( '[wp_flipflop id="' . $id . '"]' ) . '</code>';
    }
    public static function row_actions( array $actions, $post ): array {
        if ( 'wpff_item' === $post->post_type && current_user_can( 'edit_post', $post->ID ) && current_user_can( 'edit_posts' ) ) {
            $url = wp_nonce_url( admin_url( 'admin.php?action=wpff_duplicate&post=' . $post->ID ), 'wpff_duplicate_' . $post->ID );
            $actions['wpff_duplicate'] = '<a href="' . esc_url( $url ) . '">' . esc_html__( 'Duplicate', 'masum-flipflop-pdf-reader' ) . '</a>';
        }
        return $actions;
    }
    public static function duplicate(): void {
        $id = absint( $_GET['post'] ?? 0 );
        check_admin_referer( 'wpff_duplicate_' . $id );
        if ( ! current_user_can( 'edit_post', $id ) || ! current_user_can( 'edit_posts' ) || 'wpff_item' !== get_post_type( $id ) ) wp_die( esc_html__( 'You cannot duplicate this item.', 'masum-flipflop-pdf-reader' ) );
        $new = wp_insert_post( array( 'post_type' => 'wpff_item', 'post_status' => 'draft', 'post_title' => get_the_title( $id ) . ' — ' . __( 'Copy', 'masum-flipflop-pdf-reader' ), 'post_author' => get_current_user_id() ), true );
        if ( is_wp_error( $new ) ) wp_die( esc_html( $new->get_error_message() ) );
        update_post_meta( $new, '_wpff_config', get_post_meta( $id, '_wpff_config', true ) );
        wp_safe_redirect( admin_url( 'post.php?post=' . $new . '&action=edit' ) );
        exit;
    }
    public static function settings_register(): void {
        register_setting( 'wpff_settings', 'wpff_defaults', array(
            'type' => 'array', 'sanitize_callback' => static function( $input ) {
                $clean = WPFF_Config::sanitize( is_array( $input ) ? $input : array() );
                if ( is_wp_error( $clean ) ) return array();
                return array_intersect_key( $clean, array_flip( array( 'height', 'background', 'accent' ) ) );
            }, 'default' => array(),
        ) );
    }
    public static function settings_page(): void {
        if ( ! current_user_can( 'manage_options' ) ) return;
        $values = array_merge( WPFF_Config::defaults(), (array) get_option( 'wpff_defaults', array() ) );
        echo '<div class="wrap"><h1>' . esc_html__( 'Masum FlipFlop PDF Reader Settings', 'masum-flipflop-pdf-reader' ) . '</h1><p>' . esc_html__( 'Default appearance for new items. Existing items keep their own settings.', 'masum-flipflop-pdf-reader' ) . '</p><form action="options.php" method="post">';
        settings_fields( 'wpff_settings' );
        echo '<table class="form-table">';
        foreach ( array( 'height' => 'Viewer height (px)', 'background' => 'Background color', 'accent' => 'Accent color' ) as $key => $label ) {
            echo '<tr><th><label for="wpff-' . esc_attr( $key ) . '">' . esc_html( $label ) . '</label></th><td><input id="wpff-' . esc_attr( $key ) . '" type="' . ( 'height' === $key ? 'number' : 'color' ) . '" name="wpff_defaults[' . esc_attr( $key ) . ']" value="' . esc_attr( $values[$key] ) . '"' . ( 'height' === $key ? ' min="200" max="1600"' : '' ) . ' /></td></tr>';
        }
        echo '</table>';
        submit_button();
        echo '</form></div>';
    }
    public static function menus(): void {
        add_submenu_page( 'edit.php?post_type=wpff_item', __( 'Settings', 'masum-flipflop-pdf-reader' ), __( 'Settings', 'masum-flipflop-pdf-reader' ), 'manage_options', 'wpff-settings', array( __CLASS__, 'settings_page' ) );
        add_submenu_page( 'edit.php?post_type=wpff_item', __( 'Help', 'masum-flipflop-pdf-reader' ), __( 'Help', 'masum-flipflop-pdf-reader' ), 'edit_posts', 'wpff-help', array( __CLASS__, 'help' ) );
    }
    public static function help(): void {
        echo '<div class="wrap"><h1>Masum FlipFlop PDF Reader</h1><p>' . esc_html__( 'Create → Add content → Customize → Preview → Publish → Embed', 'masum-flipflop-pdf-reader' ) . '</p><ol>';
        foreach ( array( 'Add a new item and give it a title.', 'Upload or select a PDF from your Media Library.', 'Choose Flipbook, Slide, Fade, Cards, or another PDF page effect.', 'Preview desktop, tablet, and mobile layouts.', 'Publish the item, then insert the Masum FlipFlop PDF Reader block or its shortcode into a page.' ) as $step ) echo '<li>' . esc_html( $step ) . '</li>';
        echo '</ol><p>' . esc_html__( 'PDFs stay in your Media Library. Search requires a PDF text layer. Hiding the download button does not restrict access to the PDF file.', 'masum-flipflop-pdf-reader' ) . '</p><p><a href="https://swiperjs.com/swiper-api" target="_blank" rel="noopener noreferrer">' . esc_html__( 'Swiper option reference', 'masum-flipflop-pdf-reader' ) . '</a></p></div>';
    }
}
