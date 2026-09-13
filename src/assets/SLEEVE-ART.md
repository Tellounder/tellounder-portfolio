# Vintage sleeve artwork

Only project logos are used, not site screenshots or photographs. The sleeve
uses single-ink vector derivatives in `sleeve-logos/`, generated from the original
assets in `project-labels/` by `node scripts/generate-sleeve-logos.mjs` (Sharp and
ImageTracerJS, development dependencies only). SVGs contain real traced paths,
no embedded raster, no white background, no gradients. These simplified print
derivatives do not replace the original brand masters or the vinyl labels.

Logos are large, low-opacity, absolutely positioned behind the title and content.
The jacket keeps a fixed 1:1 aspect ratio, including on mobile. Longer track titles
are limited to two lines on the sleeve; full text, notes, evidence and stack open
in a native modal dialog in the top layer. Its body scrolls independently. Escape,
the close button or backdrop dismiss it and return focus to the trigger. Reduced
motion disables transitions. Static cardboard fibers and scuffs sit over the print
but below the selectable HTML text. There are no blurred halos or logo cards.

The original static paths in `vinyl-sleeve.svg` and `sleeve-scuffs.svg` draw
exposed cardboard, rubbed corners and scratches. A separate square SVG keeps
the record wear circular; neither texture nor jacket grows when notes open.

Visual research: https://freesvg.org/grunge-01 and
https://svgsilh.com/image/2147059.html (listed as CC0/public domain). Downloads
were unavailable; no third-party vector was incorporated. Wear is isolated from
the live HTML descriptions and official technology icons. No animated noise,
canvas loops, extra wheel handlers or pointer interception are added.
