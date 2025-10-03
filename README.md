# MF Block Slider

MF Block Slider is a WordPress plugin that outputs a responsive LightSlider carousel with thumbnail navigation. It ships with a Gutenberg block, a `[light_slider]` shortcode, and a WPBakery element, all sharing the same renderer so the front end stays in sync. Clicking any featured image opens a lightbox that reproduces the carousel in a modal overlay, keeping captions and navigation intact.

## Features
- LightSlider-driven gallery with thumbnail strip, looped slides, and drag support.
- Lightbox view that mirrors the current carousel for full-screen browsing.
- Dynamic block render so markup always reflects the latest media settings.
- Reusable `[light_slider]` shortcode with size and caption options.
- WPBakery (Visual Composer) element for page builder workflows.

## Requirements
- WordPress 6.0 or newer.
- jQuery (bundled with WordPress).
- WPBakery Page Builder is optional, only needed for the VC element.

## Installation
1. Copy the plugin directory into `wp-content/plugins/mf-block-slider`.
2. Activate **MF Block Slider** from the WordPress Plugins screen.
3. No additional build steps are required; assets are pre-bundled.

## Usage

### Gutenberg Block
1. Add the **MF Slider** block from the “Media” category.
2. Select or upload gallery images.
3. Adjust the full image size, thumbnail size, and caption toggle in the block inspector.
4. Update the post/page and view the slider on the front end.

### Shortcode
```
[light_slider ids="12,34,56" size="large" thumb_size="thumbnail" captions="true"]
```
- `ids`: Comma-separated attachment IDs (required).
- `size`: Image size slug used for the main slide (`large` by default).
- `thumb_size`: Image size slug for thumbnails (`thumbnail` by default).
- `captions`: `true`/`false` to display the image caption/description (`true` by default).

### WPBakery
If WPBakery Page Builder is active, the **MF Slider** element appears under **Content**.
1. Insert the element, pick images, and configure the sizing options.
2. Save the page; the shortcode renderer is reused automatically.

## Lightbox Behaviour
- Clicking any primary slide opens a modal overlay.
- The modal slider clones the original markup, keeping the active image in view.
- Body scrolling is locked while the modal is open; press the close button, click the backdrop, or hit `Esc` to exit.

## Development
- Front-end logic lives in `assets/slider.js`; styles in `assets/slider.css`.
- The block and shortcode share `MF_Block_Slider::render_slider()` in `mf-block-slider.php`.
- Custom events: trigger `document.dispatchEvent(new CustomEvent('wpls:init', { detail: { selector: '.wpls-lightSlider' } }))` to initialize sliders added via AJAX.

## Support
This plugin is provided as-is. Issues and improvements are welcome via pull requests if you maintain a fork.
