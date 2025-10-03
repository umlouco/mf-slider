<?php

/**
 * Plugin Name: MF Image Slider
 * Description: Image slider with light box 
 * Version: 1.0.0
 * Author: Mario Flores
 * License: GPL-2.0+
 * Text Domain: mf-block-slider
 */

if (! defined('ABSPATH')) exit;

define('WPLS_VER', '1.0.0');
define('WPLS_URL', plugin_dir_url(__FILE__));
define('WPLS_PATH', plugin_dir_path(__FILE__));

class MF_Block_Slider
{
    public function __construct()
    {
        add_action('init', [$this, 'register_block_editor_assets']);
        add_action('init', [$this, 'register_block']);
        add_action('wp_enqueue_scripts', [$this, 'register_frontend_assets']);
        add_action('vc_before_init', [$this, 'register_vc_element']);
        add_shortcode('light_slider', [$this, 'shortcode']);
    }

    /** Register block (dynamic render to reuse PHP) */
    public function register_block()
    {
        $block_meta = json_decode(file_get_contents(WPLS_PATH . 'block/block.json'), true);
        register_block_type(WPLS_PATH . 'block', [
            'render_callback' => [$this, 'render_block'],
            'attributes'      => isset($block_meta['attributes']) ? $block_meta['attributes'] : []
        ]);
    }

    public function register_vc_element()
    {
        if (! function_exists('vc_map')) {
            return;
        }

        vc_map([
            'name'                    => __('MF Slider', 'mf-block-slider'),
            'description'             => __('LightSlider gallery with thumbnails.', 'mf-block-slider'),
            'base'                    => 'light_slider',
            'category'                => __('Content', 'js_composer'),
            'icon'                    => 'icon-wpb-images-stack',
            'show_settings_on_create' => true,
            'params'                  => [
                [
                    'type'        => 'attach_images',
                    'heading'     => __('Images', 'mf-block-slider'),
                    'param_name'  => 'ids',
                    'description' => __('Select images for the slider.', 'mf-block-slider'),
                ],
                [
                    'type'       => 'dropdown',
                    'heading'    => __('Full image size', 'mf-block-slider'),
                    'param_name' => 'size',
                    'value'      => ['thumbnail', 'medium', 'medium_large', 'large', 'full'],
                    'std'        => 'large',
                ],
                [
                    'type'       => 'dropdown',
                    'heading'    => __('Thumbnail size', 'mf-block-slider'),
                    'param_name' => 'thumb_size',
                    'value'      => ['thumbnail', 'medium', 'medium_large', 'large', 'full'],
                    'std'        => 'thumbnail',
                ],
                [
                    'type'        => 'checkbox',
                    'heading'     => __('Show captions', 'mf-block-slider'),
                    'param_name'  => 'captions',
                    'value'       => [__('Enable', 'mf-block-slider') => 'true'],
                    'std'         => 'true',
                    'description' => __('Uses the image caption/description fields.', 'mf-block-slider'),
                ],
            ],
        ]);
    }

    /** Front-end styles/scripts (LightSlider + our assets) */
    public function register_frontend_assets()
    {
        // LightSlider (from CDN, matches your demo). Uses jQuery bundled with WP.
        wp_register_style(
            'wpls-lightslider',
            'https://cdnjs.cloudflare.com/ajax/libs/lightslider/1.1.6/css/lightslider.css',
            [],
            '1.1.6'
        );

        wp_register_script(
            'wpls-lightslider',
            'https://cdnjs.cloudflare.com/ajax/libs/lightslider/1.1.6/js/lightslider.min.js',
            ['jquery'],
            '1.1.6',
            true
        );

        // Our CSS/JS
        wp_register_style(
            'wpls-style',
            WPLS_URL . 'assets/slider.css',
            ['wpls-lightslider'],
            WPLS_VER
        );

        wp_register_script(
            'wpls-script',
            WPLS_URL . 'assets/slider.js',
            ['jquery', 'wpls-lightslider'],
            WPLS_VER,
            true
        );
    }

    public function register_block_editor_assets()
    {
        wp_register_script(
            'wpls-block-editor-js',
            WPLS_URL . 'block/editor.js',
            ['wp-blocks', 'wp-element', 'wp-components', 'wp-editor', 'wp-block-editor', 'wp-data', 'wp-server-side-render'],
            WPLS_VER,
            true
        );
        wp_register_style(
            'wpls-block-editor-css',
            WPLS_URL . 'block/editor.css',
            [],
            WPLS_VER
        );
    }

    /** Shared renderer used by both shortcode + block */
    private function render_slider($ids, $size, $thumb_size, $show_captions, $slider_id = null)
    {
        if (empty($ids)) return '';

        $ids = array_filter(array_map('absint', (array) $ids));
        if (empty($ids)) return '';

        // Unique DOM id for each instance
        if (! $slider_id) {
            $slider_id = 'wpls_' . wp_generate_uuid4();
        }

        // Enqueue assets once the markup will appear
        wp_enqueue_style('wpls-style');
        wp_enqueue_script('wpls-script');

        ob_start();
?>
        <div class="wpls-demo" data-wpls-instance="<?php echo esc_attr($slider_id); ?>">
            <ul id="<?php echo esc_attr($slider_id); ?>" class="wpls-lightSlider" data-wpls-total="<?php echo esc_attr(count($ids)); ?>">
                <?php foreach ($ids as $index => $i): ?>
                    <?php
                    $full_src   = wp_get_attachment_image_src($i, $size);
                    $thumb_src  = wp_get_attachment_image_src($i, $thumb_size);
                    if (! $full_src) continue;

                    $alt        = get_post_meta($i, '_wp_attachment_image_alt', true);
                    $caption    = get_post($i)->post_excerpt; // media "Caption" field
                    $desc       = get_post($i)->post_content; // media "Description" (fallback)
                    $caption_to_show = $show_captions ? ($caption ?: $desc ?: $alt) : '';
                    ?>
                    <li data-thumb="<?php echo esc_url($thumb_src ? $thumb_src[0] : $full_src[0]); ?>" data-wpls-index="<?php echo esc_attr($index); ?>">
                        <img src="<?php echo esc_url($full_src[0]); ?>" alt="<?php echo esc_attr($alt); ?>" />
                        <?php if ($show_captions && $caption_to_show): ?>
                            <p class="wpls-caption"><?php echo esc_html($caption_to_show); ?></p>
                        <?php endif; ?>
                    </li>
                <?php endforeach; ?>
            </ul>
        </div>
<?php
        return ob_get_clean();
    }

    /** Shortcode: [light_slider ids="1,2,3" size="large" thumb_size="thumbnail" captions="true"] */
    public function shortcode($atts)
    {
        $atts = shortcode_atts([
            'ids'        => '',
            'size'       => 'large',
            'thumb_size' => 'thumbnail',
            'captions'   => 'true',
        ], $atts, 'light_slider');

        $ids = array_map('trim', explode(',', $atts['ids']));
        $show_captions = filter_var($atts['captions'], FILTER_VALIDATE_BOOLEAN);

        return $this->render_slider($ids, $atts['size'], $atts['thumb_size'], $show_captions);
    }

    /** Block renderer */
    public function render_block($attributes, $content)
    {
        $ids         = isset($attributes['ids']) ? array_map('absint', (array) $attributes['ids']) : [];
        $size        = isset($attributes['size']) ? $attributes['size'] : 'large';
        $thumb_size  = isset($attributes['thumbSize']) ? $attributes['thumbSize'] : 'thumbnail';
        $captions    = isset($attributes['captions']) ? (bool) $attributes['captions'] : true;

        return $this->render_slider($ids, $size, $thumb_size, $captions);
    }
}

new MF_Block_Slider();
