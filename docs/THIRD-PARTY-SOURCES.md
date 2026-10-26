# Third-party notices

Bundled locally; no CDN is used at runtime.

Plugin source is GPL-2.0-or-later. PDF.js is Apache-2.0, compatible with GPLv3 (a later version permitted by the plugin license), not GPLv2-only. Each third-party component retains its own license.

## Source and reproducible builds

The editable plugin source is in src/ and includes/. Use Node.js 22.13 or later, npm ci, then npm run build. package-lock.json pins the dependency archives and integrity hashes. scripts/build.mjs bundles/minifies the JavaScript and CSS and copies the PDF worker and resources; no upstream functionality is patched.

- Swiper source: https://github.com/nolimits4web/swiper (MIT).
- StPageFlip source: https://github.com/Nodlik/StPageFlip (MIT).
- PDF.js source and build instructions: https://github.com/mozilla/pdf.js (Apache-2.0). Distribution: https://github.com/mozilla/pdfjs-dist . Use the versions listed below. PDF.js external/ contains resource sources, notices, and build instructions for its bundled components.
- PDF.js character maps: assets/cmaps/LICENSE.
- Foxit fonts: assets/standard_fonts/LICENSE_FOXIT. Liberation fonts: assets/standard_fonts/LICENSE_LIBERATION (GPLv2 with font exception); source: https://github.com/liberationfonts/liberation-fonts and PDF.js external/standard_fonts/.
- OpenJPEG, JBIG2/PDFium, and QCMS decoders: assets/wasm/LICENSE_*; sources and build integration: PDF.js external/, https://github.com/uclouvain/openjpeg , https://pdfium.googlesource.com/pdfium/ , and https://github.com/FirefoxGraphics/qcms .
- Color profile: assets/iccs/LICENSE (CC0); source: PDF.js external/ and https://github.com/saucecontrol/Compact-ICC-Profiles .

