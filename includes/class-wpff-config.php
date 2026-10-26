<?php
defined( 'ABSPATH' ) || exit;

final class WPFF_Config {
    public static function defaults(): array {
        return array(
            'type' => 'flipbook', 'pdfEffect' => 'book', 'preset' => 'hero', 'slides' => array(), 'pdfId' => 0,
            'height' => 480, 'background' => '#f1f0eb', 'accent' => '#e36a3b',
            'effect' => 'slide', 'direction' => 'horizontal', 'slidesPerView' => 1,
            'tabletSlides' => 1, 'mobileSlides' => 1, 'spaceBetween' => 24, 'slidesPerGroup' => 1,
            'gridRows' => 1, 'speed' => 600, 'loop' => false, 'rewind' => false,
            'centeredSlides' => false, 'autoHeight' => false, 'navigation' => true,
            'pagination' => 'bullets', 'dynamicBullets' => false, 'scrollbar' => false,
            'autoplay' => false, 'delay' => 4500, 'pauseOnHover' => true,
            'keyboard' => true, 'mousewheel' => false, 'allowTouchMove' => true,
            'freeMode' => false, 'zoom' => false, 'thumbs' => false, 'rtl' => false,
            'cssMode' => false, 'parallax' => false, 'hashNavigation' => false,
            'bookLayout' => 'auto', 'showCover' => true, 'shadows' => true,
            'startPage' => 1, 'bookSpeed' => 700, 'download' => true,
            'fullscreen' => true, 'thumbnails' => true, 'search' => true,
            'display' => 'inline', 'advanced' => new stdClass(),
        );
    }

    public static function sanitize( $input ) {
        if ( ! is_array( $input ) ) return new WP_Error( 'config', __( 'Invalid configuration.', 'masum-flipflop-pdf-reader' ) );
        $out = self::defaults();
        $enums = array(
            'type' => array( 'slider', 'flipbook' ),
            'preset' => array( 'hero', 'carousel', 'cards', 'gallery', 'book', 'custom' ),
            'pdfEffect' => array( 'book', 'slide', 'fade', 'cards', 'cube', 'coverflow', 'flip', 'creative' ),
            'effect' => array( 'slide', 'fade', 'cube', 'coverflow', 'flip', 'cards', 'creative' ),
            'direction' => array( 'horizontal', 'vertical' ),
            'pagination' => array( 'none', 'bullets', 'fraction', 'progressbar' ),
            'bookLayout' => array( 'auto', 'single', 'spread' ),
            'display' => array( 'inline', 'lightbox' ),
        );
        foreach ( $enums as $key => $values ) {
            if ( isset( $input[$key] ) && in_array( $input[$key], $values, true ) ) $out[$key] = $input[$key];
        }
        foreach ( self::defaults() as $key => $value ) {
            if ( is_bool( $value ) && isset( $input[$key] ) ) $out[$key] = filter_var( $input[$key], FILTER_VALIDATE_BOOLEAN );
        }
        $ranges = array(
            'height' => array( 200, 1600 ), 'slidesPerView' => array( 1, 12 ),
            'tabletSlides' => array( 1, 12 ), 'mobileSlides' => array( 1, 12 ),
            'spaceBetween' => array( 0, 200 ), 'slidesPerGroup' => array( 1, 12 ), 'gridRows' => array( 1, 6 ),
            'speed' => array( 0, 5000 ), 'delay' => array( 500, 60000 ),
            'bookSpeed' => array( 100, 3000 ),
        );
        foreach ( $ranges as $key => $range ) {
            if ( isset( $input[$key] ) && is_numeric( $input[$key] ) ) $out[$key] = max( $range[0], min( $range[1], (int) $input[$key] ) );
        }
        // The reader clamps this to the selected document's actual page count.
        if ( isset( $input['startPage'] ) && is_numeric( $input['startPage'] ) ) $out['startPage'] = max( 1, (int) $input['startPage'] );
        foreach ( array( 'background', 'accent' ) as $key ) {
            if ( isset( $input[$key] ) && is_string( $input[$key] ) ) $out[$key] = sanitize_hex_color( $input[$key] ) ?: $out[$key];
        }
        $out['pdfId'] = absint( $input['pdfId'] ?? 0 );
        if ( $out['pdfId'] && 'application/pdf' !== get_post_mime_type( $out['pdfId'] ) ) {
            return new WP_Error( 'pdf', __( 'Please select a PDF from the Media Library.', 'masum-flipflop-pdf-reader' ) );
        }
        if ( isset( $input['slides'] ) && is_array( $input['slides'] ) ) {
            foreach ( $input['slides'] as $slide ) {
                if ( ! is_array( $slide ) ) continue;
                $id = absint( $slide['id'] ?? 0 );
                $mime = $id ? get_post_mime_type( $id ) : '';
                if ( $id && ( ! is_string( $mime ) || ! preg_match( '#^(image|video)/#', $mime ) ) ) continue;
                $out['slides'][] = array(
                    'id' => $id,
                    'title' => sanitize_text_field( is_scalar( $slide['title'] ?? '' ) ? $slide['title'] ?? '' : '' ),
                    'text' => sanitize_textarea_field( is_scalar( $slide['text'] ?? '' ) ? $slide['text'] ?? '' : '' ),
                    'alt' => sanitize_text_field( is_scalar( $slide['alt'] ?? '' ) ? $slide['alt'] ?? '' : '' ),
                    'link' => esc_url_raw( is_string( $slide['link'] ?? '' ) ? $slide['link'] ?? '' : '', array( 'http', 'https' ) ),
                    'button' => sanitize_text_field( is_scalar( $slide['button'] ?? '' ) ? $slide['button'] ?? '' : '' ),
                );
            }
        }
        $advanced = $input['advanced'] ?? array();
        if ( is_string( $advanced ) ) {
            if ( ! str_starts_with( ltrim( $advanced ), '{' ) ) return new WP_Error( 'advanced', __( 'Advanced options must be a JSON object.', 'masum-flipflop-pdf-reader' ) );
            if ( strlen( $advanced ) > 32000 ) return new WP_Error( 'advanced', __( 'Advanced options exceed 32 KB.', 'masum-flipflop-pdf-reader' ) );
            $advanced = json_decode( $advanced, true );
            if ( JSON_ERROR_NONE !== json_last_error() ) return new WP_Error( 'advanced', __( 'Advanced options must be valid JSON.', 'masum-flipflop-pdf-reader' ) );
        }
        if ( is_object( $advanced ) ) $advanced = (array) $advanced;
        if ( ! is_array( $advanced ) || ( $advanced && array_keys( $advanced ) === range( 0, count( $advanced ) - 1 ) ) ) return new WP_Error( 'advanced', __( 'Advanced options must be a JSON object.', 'masum-flipflop-pdf-reader' ) );
        if ( strlen( wp_json_encode( $advanced ) ) > 32000 || ! self::safe_tree( $advanced ) ) {
            return new WP_Error( 'advanced', __( 'Advanced options contain unsupported or unsafe properties.', 'masum-flipflop-pdf-reader' ) );
        }
        $out['advanced'] = $advanced ? $advanced : new stdClass();
        return $out;
    }

    private static function safe_tree( $value, int $depth = 0 ): bool {
        if ( $depth > 8 ) return false;
        if ( is_array( $value ) ) {
            foreach ( $value as $key => $child ) {
                if ( in_array( (string) $key, array( '__proto__', 'prototype', 'constructor', 'on', 'onAny', 'el', 'nextEl', 'prevEl', 'control', 'swiper', 'slides', 'renderExternal', 'renderSlide', 'renderBullet', 'renderCustom', 'renderFraction', 'renderProgressbar', 'injectStyles', 'injectStylesUrls', 'url', 'modules', 'createElements', 'init' ), true ) ) return false;
                if ( ! self::safe_tree( $child, $depth + 1 ) ) return false;
            }
            return true;
        }
        return is_bool( $value ) || is_int( $value ) || is_float( $value ) || is_null( $value ) || ( is_string( $value ) && strlen( $value ) <= 2000 && false === strpos( $value, '<' ) );
    }

    public static function hydrate( array $config ): array {
        $config = array_merge( self::defaults(), $config );
        foreach ( $config['slides'] as &$slide ) {
            $slide['url'] = $slide['id'] ? wp_get_attachment_url( $slide['id'] ) : '';
            $slide['kind'] = str_starts_with( (string) get_post_mime_type( $slide['id'] ), 'video/' ) ? 'video' : 'image';
            $slide['alt'] = $slide['alt'] ?: get_post_meta( $slide['id'], '_wp_attachment_image_alt', true );
        }
        unset( $slide );
        $config['pdfUrl'] = $config['pdfId'] ? wp_get_attachment_url( $config['pdfId'] ) : '';
        $config['pdfName'] = $config['pdfId'] ? get_the_title( $config['pdfId'] ) : '';
        return $config;
    }
}
