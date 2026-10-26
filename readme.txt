=== Masum FlipFlop PDF Reader ===
Contributors: mas7890
Tags: pdf, flipbook, swiper, slider, document
Requires at least: 6.5
Tested up to: 7.1
Requires PHP: 8.0
Stable tag: 0.2.6
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Display the pages of one PDF as a flipbook, slide, fade, cards, or other Swiper page effect.

== Description ==

Upload a PDF, choose how its pages move, preview, and publish. Choose Flipbook, Slide, Fade, Cards, Cube, Coverflow, Flip, or Creative. All effects render the actual PDF pages.

Shared controls include page navigation, thumbnails, text search, zoom, fullscreen, PDF bookmarks, and inline/lightbox display. Swiper modes add playback, pagination, responsive layout, and advanced settings.

Publish with the Masum FlipFlop PDF Reader Gutenberg block or [wp_flipflop id="123"]. All libraries are bundled locally.

= Editing workflow =

Created by Masum Alam, this reader focuses on trying eight page effects on the same PDF in one editor. The preview keeps the document loaded, reuses a bounded cache of rendered pages, and preserves the reading position when effects change. Shared navigation, text search, and bookmarks work across the effects. Additional Swiper settings use validated data-only JSON; the editor does not accept executable code.

= Privacy and external connections =

The plugin does not collect analytics, send telemetry, require an account, or contact a licensing service. PDFs and viewer settings remain on your WordPress installation. Visitors' browsers request the PDF and plugin assets from your site. If you configure another plugin or your hosting to offload Media Library files, the browser requests those files from your configured media host. No public attribution links are added.

= Source code and build instructions =

Editable plugin source is included in src/ and includes/. The ZIP includes scripts/build.mjs, scripts/package.mjs, package.json, and package-lock.json. To rebuild with Node.js 22.13 or later, run npm ci followed by npm run build. To create the distributable ZIP, run npm run package. Build tools are not needed to install or use the plugin.

Bundled libraries and their upstream source:

* [Swiper](https://github.com/nolimits4web/swiper), version 14.3.0, MIT.
* [StPageFlip](https://github.com/Nodlik/StPageFlip), version 2.0.7, MIT.
* [PDF.js](https://github.com/mozilla/pdf.js), version 6.4.299, Apache-2.0; [distribution source](https://github.com/mozilla/pdfjs-dist).

PDF.js includes font, character-map, image-decoder, and color-profile resources. Their license files are preserved beside the resources. See THIRD-PARTY-NOTICES.txt for the source locations and complete library notices. Plugin code is GPLv2 or later; Apache-2.0 components are compatible with GPLv3, a later version permitted by the plugin license.

There are no paid unlocks, trials, document quotas, or license keys. Rendering and search performance depend on the PDF and the visitor's browser.

== Installation ==

1. Upload the plugin ZIP through Plugins > Add New.
2. Activate Masum FlipFlop PDF Reader.
3. Create a PDF viewer and select a PDF from the Media Library.
4. Choose its page effect and publish.
5. Insert the block or shortcode into a page.

Upgrading from wp-flipflop 0.2.4 or earlier, or FlipFlop PDF Reader 0.2.5: deactivate the old plugin before installing and activating Masum FlipFlop PDF Reader. The directory name has changed; do not run both copies together. Saved viewers, settings, PDFs, existing blocks, and [wp_flipflop] shortcodes are retained. You can delete the inactive old copy after checking the new plugin.

== Frequently Asked Questions ==

= Does Cards or Fade require separate page images? =
No. The plugin renders the uploaded PDF pages directly inside the chosen Swiper effect.

= Does changing the effect require another upload? =
No. Each effect uses the same selected PDF.

= Can I search scanned PDFs? =
Search requires an existing PDF text layer. OCR is not included.

= Does hiding Download protect my PDF? =
No. Public file access remains unchanged.

= What happens when I deactivate or delete the plugin? =
Saved viewers, appearance settings, and Media Library files are retained so reinstalling the plugin restores your work. Delete unwanted viewers in the plugin's All Items screen and unwanted PDFs in the Media Library before removing the plugin.

= Are scanned or password-protected PDFs supported? =
Scanned pages can be displayed, but search needs a text layer. OCR, password entry, interactive PDF forms, and PDF annotation overlays are not included. Use the original PDF link if a document cannot be rendered.

== Changelog ==

= 0.2.6 =
* Add the author's name to the plugin name and align the directory and text domain.
* Remove fixed starting-page cutoffs and silent truncation of legacy saved slides.
* Explain the PDF editing workflow and data-only advanced settings.

= 0.2.5 =
* Prepare WordPress.org author metadata, source references, privacy documentation, and release packaging.
* Remove fixed document-page and search-result caps.
* Preserve bundled dependency licenses and document reproducible builds.

= 0.2.4 =
* Reuse the loaded PDF and a bounded rendered-page cache while editing.
* Keep the preview mounted when switching settings tabs or preview widths.
* Keep the current reading page across option changes.

= 0.2.3 =
* Add explicit slider-button and pagination-dot visibility controls.
* Hide first/last buttons together with previous/next when navigation is disabled.

= 0.2.2 =
* Match the PDF builder to WordPress admin buttons, fields, tabs, and panels.

= 0.2.1 =
* Fix PDF loading on hosts that serve .mjs files as text/plain.
* Ship the PDF engine and module worker as .js files with versioned URLs.

= 0.2.0 =
* Unified PDF-first builder.
* Render the same PDF through Flipbook or seven Swiper page effects.
* Shared PDF navigation, search, thumbnails, zoom, and lightbox.
* Preserve original page numbers and render a bounded window of canvases.

= 0.1.0 =
* Initial plugin foundation.
