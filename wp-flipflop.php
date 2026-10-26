<?php
/**
 * Plugin Name: Masum FlipFlop PDF Reader
 * Description: Render PDF pages as a flipbook or with Swiper slide, fade, cards, and other effects.
 * Version: 0.2.6
 * Author: Masum Alam
 * Author URI: https://profiles.wordpress.org/mas7890/
 * Requires at least: 6.5
 * Requires PHP: 8.0
 * License: GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: masum-flipflop-pdf-reader
 */
defined( 'ABSPATH' ) || exit;
define( 'WPFF_VERSION', '0.2.6' );
define( 'WPFF_PATH', plugin_dir_path( __FILE__ ) );
define( 'WPFF_URL', plugin_dir_url( __FILE__ ) );
require_once WPFF_PATH . 'includes/class-wpff-config.php';
require_once WPFF_PATH . 'includes/class-wpff-plugin.php';
WPFF_Plugin::init();
