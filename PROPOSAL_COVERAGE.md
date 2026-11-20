# Proposal Coverage — Configurator V3

| Requirement | Implemented | Remaining |
| --- | --- | --- |
| Reference design | Dark charcoal studio, amber highlights, accessory cards, central vehicle, right build summary | Final brand assets and content approval |
| Pilot pickup | Detailed original Hilux-reference geometry | Licensed photorealistic Hilux asset and approved model-year/trim |
| Conversion selection | Backpack and Basecamp with listed standard features | Engineering-approved fitment; detailed Odyssey specifications |
| Full add-on catalogue | 11 priced entries with correct model eligibility | Approved SKUs, real prices, stock and dependencies |
| Standard equipment | First 170W panel and mounting/fixing included | Final signed-off specification |
| Exterior viewing | 360 orbit, zoom, reset, auto rotation, evening mode | Full device/GPU testing |
| Interior viewing | Cutaway and separate 360 scene, three viewpoints and hotspots | Accurate model-specific interior assets and free walking if required |
| Materials | Four camper colours, two finish concepts, two upholstery options | Approved colour/material catalogue |
| Roof | Open and closed geometry | Continuous rigged animations |
| Accessory visualization | Modular exterior geometry and selected interior equipment | Exact product models/dimensions |
| Pricing | Live itemization, sample tax and totals; local API recalculates | Official prices, tax policy, delivery and quote validity |
| Save/share/download | Device storage, shareable URL, text summary, local server build records | Hosted durable build service and price history |
| Comparison | Saved versus current options, price delta | Account-based multi-build storage |
| Enquiry | Form validation, explicit storage acknowledgement, local SQLite register, downloads and email draft | Authorized CRM/email delivery and production privacy controls |
| Other products | Rooftop tent, awning, shower tent, portable kitchen and Odyssey cards | Product-specific fitment and approved quotation |
| Admin | Local enquiry export; editable JSON catalogue | Authenticated administration dashboard |
| Performance/accessibility | Keyboard controls, responsive layout, GPU-disabled fallback | Full mobile hardware/assistive technology/load QA |
| AR and AI recommendation | Not implemented | Future phases from the proposal |

All displayed prices are illustrative. The downloadable application includes a local Python/SQLite backend. The hosted private preview is static and uses local device storage, not the SQLite backend. No automatic sales delivery or payment processing occurs.

## V4 visual presentation
The reference-led scenic Exterior is a labelled lifestyle illustration. Live 360/cutaway/interior views remain available and open automatically when a build selection changes. Generated product visuals do not establish exact SKU appearance or fitment. Four navigation stages now combine vehicle/conversion selection under Vehicle. Gallery arrows and five thumbnails operate real photo/model presets. Build comparison, download and reset remain available below Save Build.

## V5 campsite addition
- Walkable campsite with desktop WASD/arrow keys, drag look and touch direction controls.
- Guided viewpoints and proximity-gated entry/storage interactions.
- Hinged rear door, cabin aisle walking, exit, roof, awning deployment, drawer and lighting.
- Compatible selected add-ons and existing pricing retained.
- Original procedural scene; no game assets, driving or multiplayer.

## V6 rendering and driving
- Alpine panorama, gravel texture, WebGL environment reflections and shadows; enhanced software fallback.
- Driver door interaction, chase-camera trail, acceleration/reverse/steering/braking, spinning wheels, eight gates, minimap, recovery and driving assist.
- Ordered completion unlocks a persistent copyable demo promo code. No actual discount/redemption backend.
- Remaining realism work: approved high-detail vehicle/camper assets, photogrammetry environment and GPU quality review.

## V7 requested revisions
- Matching stylized terrain, trees, hills and soil/grass; no photographic play background.
- Smooth non-looping road and a separate finish.
- Space jump with bonnet/roof landing and gravity; Shift sprint.
- Clickable driver/rear doors and proximity-aware scene targets.
- Visible fullscreen control within the game; removed gameplay instruction paragraphs.

## V9 accessory consistency
- Rebuilt all 11 optional accessory meshes with component-specific details.
- Catalogue and info-dialog previews render the same mesh definitions as the fitted camper.
- New shower/mesh components also replace the dedicated interior scene versions.
- Camera focuses newly selected accessories, retaining the existing prices and compatibility rules.

## V10 interior editing
- 29 independently removable/re-addable furnishings and fittings with item colours and parent dependencies.
- Four themes, eleven surface finishes, bed/table/curtain/cupboard variants.
- Shared cabin/cutaway component definitions, and automatic interior editor when entering Interior mode.
- Interior data retained in save/load/share/compare/download and local server records.
- Theme/layout edits keep base pricing; paid optional modules remain individually priced.
