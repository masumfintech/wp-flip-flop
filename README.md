# Masum FlipFlop PDF Reader

**Render the pages of one PDF as a flipbook, sliding pages, fading pages, or a stack of cards.**

Version 0.2.6 uses the PDF as the source for every viewing mode. Swiper animates the actual PDF page canvases; there is no need to upload page images or create separate media slides.

## WordPress admin interface

Version 0.2.2 uses WordPress buttons, native checkboxes and fields, admin tabs, and neutral panels. The PDF document, preview, and settings remain together, and the layout stacks on smaller screens.

## Updating from an earlier version

If upgrading from **wp-flipflop 0.2.4 or earlier** or **FlipFlop PDF Reader 0.2.5**, deactivate the old plugin first, then install and activate **Masum FlipFlop PDF Reader**. The directory name changed to include the author's name for submission. Do not activate both copies together. Saved viewers, settings, PDFs, `[wp_flipflop]` shortcodes, and existing blocks remain compatible. After verifying the new plugin, you can delete the inactive old copy.

For later updates within Masum FlipFlop PDF Reader, upload the ZIP through Plugins → Add New → Upload Plugin and choose **Replace current with uploaded**. Purge WordPress and hosting/CDN caches afterward.

## Create a PDF viewer

1. Install **dist/masum-flipflop-pdf-reader.zip** through WordPress **Plugins → Add New → Upload Plugin**.
2. Open **Masum FlipFlop PDF Reader → Create PDF viewer**.
3. Select or upload a PDF from the Media Library.
4. Choose its page effect: **Flipbook, Slide, Fade, Cards, Cube, Coverflow, Flip, or Creative**.
5. Customize the controls and preview desktop, tablet, and mobile widths.
6. Publish the item and add the **Masum FlipFlop PDF Reader** block to a page, or use:

```text
[wp_flipflop id="123"]
```

Changing the effect keeps the same PDF. The selected mode is saved with the item and used by both preview and published embeds.

## PDF page effects

| Effect | What happens to the PDF pages |
| --- | --- |
| Flipbook | Realistic page turning, with single-page or two-page layouts |
| Slide | Horizontal or vertical page slides; optional multiple pages per view |
| Fade | Crossfade between individual pages |
| Cards | PDF pages arranged as a swipable card stack |
| Cube | Rotate the PDF pages around a cube |
| Coverflow | Display PDF pages in a carousel with perspective |
| Flip | Flip one PDF page at a time |
| Creative | Use layered page transitions |

Fade, Cards, Cube, Flip, and Creative use one page per view. Slide and Coverflow also support responsive multi-page layouts.

## Faster admin preview

The editor keeps the selected PDF document loaded while settings change and reuses recently rendered pages. Switching settings tabs or preview widths keeps the live viewer mounted. Effect changes rebuild the animation around cached PDF pages and preserve the current reading page. Selecting a different PDF releases the old document. The cache is in memory only, limited to 12 rendered pages / 48 MiB of completed rasters; it is cleared when leaving the editor. First-time PDF loading and uncached pages still require processing.

## Show or hide slider controls

Select a Swiper page effect, then open **Controls**. Toggle **Show slider buttons** to show or hide Previous, Next, First, and Last buttons. Toggle **Show pagination dots** to enable dots or hide pagination. **Pagination style** also offers fraction and progress-bar displays. Publish or Update to apply the settings to the website.

## Reader options

Shared across the PDF modes:
- Starting page, page input, previous/next, first/last.
- Zoom, fullscreen, page thumbnails, text search, document bookmarks.
- Inline or lightbox display, optional download button.
- Viewer height, background, and accent color.
- Gutenberg block and shortcode.

Swiper PDF modes also include:
- Direction, responsive page counts, spacing, speed, centered pages.
- Pagination, scrollbar, touch/drag, mousewheel, free scrolling.
- Autoplay, pause on hover, loop, rewind, and a playback control.
- Advanced JSON for additional data-only Swiper options.

Flipbook mode provides cover, shadow, page-spread, and page-turn-speed controls.

PDF.js renders nearby document pages; the selected engine animates them. Navigation, search, and thumbnails refer to original PDF page numbers. Nearby canvases are discarded as readers move through the file.

## Requirements and storage

WordPress 6.5+, PHP 8.0+, and a modern browser supporting PDF.js and ES modules.

The PDF stays in your Media Library. Swiper, PDF.js, its worker/font assets, and StPageFlip are bundled locally. No external account or CDN is required. The PDF engine and module worker use .js filenames for compatibility with shared hosting. Offloaded PDF media needs suitable CORS headers.

Global appearance defaults are under **Masum FlipFlop PDF Reader → Settings**. Existing items keep their saved appearance.

Previously created 0.1.0 media sliders keep rendering for compatibility. Selecting a PDF in their editor explicitly converts the item to a PDF viewer. Existing flipbooks default to the Flipbook effect.

## Advanced Swiper settings

Example for PDF Coverflow mode:

```json
{
  "coverflowEffect": { "rotate": 25, "depth": 120 },
  "breakpoints": {
    "640": { "slidesPerView": 2, "spaceBetween": 16 },
    "1024": { "slidesPerView": 3, "spaceBetween": 24 }
  }
}
```

The selected PDF effect, page identity, one-row layout, page grouping, fixed-height canvas container, zoom, and focus-based keyboard control belong to the PDF reader. Advanced JSON cannot override those. Navigation and pagination elements stay scoped to their viewer.

Functions, external element selectors, HTML slide strings, virtual slides, and prototype-related keys are not accepted as stored JSON. Extra parameters may require suitable markup or trusted integrations. Not every combination of Swiper settings is compatible.

See [Swiper's API](https://swiperjs.com/swiper-api) and [the bundled parameter inventory](docs/SWIPER-OPTIONS.md). Premium third-party effects linked from Swiper's site are not bundled.

### Developer hooks

```js
document.addEventListener('wpff:before-slider', event => {
  const { options, element, source } = event.detail;
  if (source === 'pdf') {
    // Trusted integration code can customize the PDF Swiper instance.
  }
});

document.addEventListener('wpff:ready', event => {
  const { source, mode, pageCount, instance } = event.detail;
  // PDF modes report source: "pdf", their selected mode, and page count.
});
```

Use `WPFlipFlop.init(container)` after dynamically inserting server-rendered embeds. Custom integrations can use `WPFlipFlop.mount(element, config)` and `WPFlipFlop.unmount(element)`.

## Limits

Search needs the PDF's existing text layer; OCR is not included. Bookmarks appear when the PDF has an outline. The first page sets the flipbook's proportions; pages fit without cropping.

There is no fixed document-page or search-result quota. Thumbnails show a nearby range, refreshed when reopened. Document parsing and search still use resources proportional to PDF complexity. Zoom magnifies rendered pages.

PDF form fields, annotations, selectable text overlays, PDF-link overlays, printing controls, password entry, RTL book binding, and WebGL books are not included. An original-PDF link is shown when rendering fails.

Hiding Download only hides the control; it does not protect a public PDF URL. File access restrictions are separate.

## Development

```sh
npm ci
npm run build
npm run package
```

- PDF and shared renderer: `src/runtime.js`
- PDF option mapping/cache window: `src/pdf-options.js`
- PDF builder: `src/admin.js`
- Server configuration and publishing: `includes/`
- Run the development checkout tests with npm test and php tests/security.php. Test harnesses and local validation screenshots are excluded from the installable ZIP.

The ZIP contains built assets, editable source, dependency versions, documentation, and licenses. It excludes node_modules and the local test site. Deactivation preserves saved items and media.

Plugin code: GPL-2.0-or-later. See THIRD-PARTY-NOTICES.txt for bundled dependency licenses.
