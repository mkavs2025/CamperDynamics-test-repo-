# Camper Dynamics — Adventure Platform (V12)

An integrated customer and team website: Home, 3D Build, Book, Game and Profile.

## Run the full website

Requires Node.js 24 LTS and npm. From this folder:

```sh
npm ci
npm run prepare:studio
npm run build
```

Apply the schema to the local development database once (not on each request):

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_watery_puck.sql
npm run dev
```

Open the URL printed by the development server. The browser on localhost uses a clearly marked device preview so customers can review every screen without impersonating an authenticated account. Device preview actions do not send enquiries or create real offers. Production uses the authenticated API, D1 database and private R2 files. Node 24 is required for the SQLite API integration test. The included `START_WINDOWS.bat` launches the full site. `python start.py` remains an isolated offline studio; it does not provide the account platform.

## Implemented journey

| Area | Working functionality |
| --- | --- |
| Landing | Scroll-driven live 3D camper chapters, Travel/Camp/Cutaway showcase, reduced-motion support, configurable additional FAQ. No static exterior-photo mode. |
| Guided setup | Travel style, travellers, cooking, comfort and palette; explained recommendations and editable starting build. |
| Build | Hilux-reference vehicle; Basecamp and Backpack; compatible priced equipment; 360° exterior, interior viewpoints, cutaway, day/night, roof and storage inspection. First 170W panel and mounting included. |
| Interior | 29 removable/re-addable furnishings; per-item colours; Beige/Red/Black/Green themes; material finishes; bed/table/curtain/cupboard styles; shared interior/cutaway geometry. |
| Floor plan | Five movable furniture groups; drag/snap or position fields; overlap/bounds checking; enable/remove furnishings; shared placement in 3D. Provisional dimensions only. |
| Workspace | Named builds, account autosave, undo/redo, 20 saved revisions, up to three comparisons with differences-only mode. Device rendering preferences. |
| Proposals | Immutable configuration and server-calculated estimate; two available rendered snapshots; catalogue/revision metadata; print/Save PDF; JSON export and exact configuration reopening. |
| Collaboration | Signed-in, expiring 30-day private links; revoke links; component-specific comments; specialist edits captured in build history and audit. Site access is still required. |
| Booking | Consultation/showroom/fitment requests, live slot exclusion, configuration attached, private uploads, references, rescheduling/cancellation and calendar download. Team confirms requests. |
| Projects | Team-created customer projects, manual stage updates, private project files and customer design approval. No fabricated production progress. |
| Admin | Customer builds/enquiries, appointment confirmation, customer projects, editable price/compatibility drafts with preview/publish, availability/blocked dates, FAQ, approved promotion settings, audit history and CSV export. |
| Trail | Non-looping winding road; first-person exploration, clicking front/rear doors, jump, sprint, vehicle driving/assist, fullscreen/fallback, eight ordered gates, account completion badge. Approved limited offers issued by the server, once per account/campaign; code redemption is single-use. |

## Production configuration

`.openai/hosting.json` declares `DB` (D1) and `BUCKET` (R2). Publish the SQL migrations with the supported Sites workflow; the hosting build integration includes migration metadata. Authentication uses platform-provided `oai-authenticated-user-*` headers. They must come from the trusted hosting gateway, never from an untrusted client. Do not deploy the API behind a proxy that forwards arbitrary user-supplied identity headers.

Set `ADMIN_EMAILS` as a **server secret** to a comma-separated allowlist of approved team accounts. No admin key/password appears in client code. A local `.dev.vars` may be used for development; it is ignored and excluded from this archive. Changing the client preview role does not grant server permissions. All account operations and file reads check identity and ownership. Website sharing remains owner-private until the owner explicitly changes its audience.

Production private attachments accept JPG/PNG/WebP/PDF up to 4 MB; local preview allows 1 MB each. Metadata and byte-signature checks run on the server. Project uploads belong to their customer's account. Bookings atomically reserve a slot; cancelling releases it. Proposal writes recalculate prices server-side and frozen proposal edits are rejected. Updates use optimistic versions to prevent silently overwriting another revision.

## Deliberate production limits

- All present prices/tax, procedural meshes and floor-plan dimensions are illustrative. Certified fitment, payload, vehicle CAD, equipment specs, approved pricing and final client assets are still required. The four themes and editable furniture are concept designs.
- No payment gateway, financial instalment calculation, real inventory feed, CRM, email/SMS delivery or automatic installation promise is connected. Notifications/status are in-app. Booking confirmation does not send an email.
- No promotion is active by default. Approved expiry, terms and total issuance limit are required. The server checks checkpoint order, proximity and minimum elapsed time, but a browser-based game is not tamper-proof physics attestation; high-value incentives should require manual order verification.
- Share links do not override the site's audience. Recipients must have site access and sign in; device-preview links only work in the same browser storage.
- Workspace lists load the most recent 250 records/200 appointments. Additional pagination, malware scanning and operational retention policies should precede a large-scale public rollout.
- Browser Print / Save PDF uses the visitor's PDF printer. It does not depend on an external PDF service.
- Existing V10 device builds can seed the current draft; old Python SQLite enquiries are not automatically uploaded to the new cloud database.

## Checks

```sh
node --test tests/*.test.mjs
npx tsc --noEmit
npm run build
```

The platform test bundles the actual API handler and executes its SQL against an isolated in-memory SQLite database with D1-shaped methods and an in-memory private file bucket. It covers unauthenticated/admin denials, cross-account isolation, server pricing, immutable proposals, optimistic revisions, double-booking, private files, project ownership, revoked links, timed/ordered gates, duplicate reward issuance, single redemption and audit. Existing tests cover all accessories, interior edits, collisions, jumps/sprint, trail geometry and thousands of price combinations. This is not an authenticated live-account end-to-end test.

## Source map

- `public/portal/` — landing, account/booking/team UI and explicitly labelled local preview repository.
- `studio/` — original live 3D studio, procedural models, shared accessories/interior and game.
- `scripts/prepare-studio.mjs` — copies studio source to generated public assets; run before building after edits.
- `lib/server.ts`, `lib/platform-core.mjs` — authenticated API and pure validation/pricing logic.
- `db/schema.ts`, `drizzle/` — persistent schema and versioned migration.
- `app/`, `worker/`, `scripts/`, `vendor/` — framework/runtime and portable build integration.

Three.js licence is retained in `studio/THREE-LICENSE.txt`. The Hilux-reference model is original procedural geometry, not official Toyota CAD. Replace it through the documented geometry interfaces with approved/licensed client models. No secrets, customer database or runtime state is included in the source ZIP.

### V12 quality pass

Confirmed appointments can be rescheduled by their customer and require confirmation again. Exact minute slots are enforced, preventing fractional-second duplicate reservations; closed appointments cannot be reopened. Floor-plan visibility and overlap checks respect Backpack kitchen compatibility; saved positions remain within the room after snapping and invalid numeric inputs are rejected. Design approval requests freeze the linked build version and estimate, show the complete interior specification, and track approval against that exact design revision. A revised design requires fresh approval. Autosave writes are serialised to avoid overlapping version writes. Device preview uses its own catalogue and the same booking rules without requiring a local database.

The studio now acknowledges a loaded configuration before sending edits back to the account workspace, preventing startup defaults from replacing guided or reopened builds. Browser QA confirmed a guided Backpack remains Backpack after the 3D studio loads, the kitchen stays excluded until its module is selected, and moving the table into that unused area preserves both entered coordinates.

### V13 scroll story and usability update
The landing page uses one world-space camper and one camera throughout an interpolated scroll path. Exterior accessories scale into place individually, an exterior orbit leads to solar and an overhead roof reveal, furniture assembles inside the same model, and a room orbit returns outside into dusk lighting. Scroll positions are reversible; there are no renderer/scene swaps. Contact enquiries are stored as account enquiries, with no email delivery implied. Secondary configurator tools are grouped in a Build tools menu; all existing features remain available. In-scene doors open on the first tap and enter on the second, retaining a stable hit target while the door leaf moves. Driving instructions are hidden while accessible control labels remain.
Browser checks covered the exterior reveal, interior stage, finale, contact enquiry, and both two-tap doors. Automated platform and geometry tests pass. The cloud QA browser disables WebGL and therefore exercises the software fallback; full GPU animation smoothness needs review on a WebGL-capable device. Current procedural assets remain illustrative. Basecamp-compatible accessories are demonstrated; Backpack-only accessories remain available in its configurator.

### V14 premium storyboard implementation

Added a reversible exploded assembly with a full orbit, staggered shell separation, roof elevation and alignment guides; this is a design illustration, not an approved manufacturing procedure. Sand, Forest and Midnight finishes update the story and flow into the builder and enquiry. Midnight is an illustrative priced finish; existing catalogue revisions retain their prices while new base finish IDs remain discoverable. A personalised contact card captures the visitor's configured scene.

Awning fabric extends before supports lower; shower fabric deploys downwards; a storage flap and stocked drawer open and retract. Solar lifts above its mounts, the roof elevates before fading, and provisional dimension/grid overlays and an alternate arrangement appear overhead. Interior pieces have a staged assembly order, cushion settling, curtain motion and moving light. The return view introduces a stylised landscape, warm late-day sun, then interior and exterior lighting in sequence. Optional procedural sound is off by default and only starts after a click; no external audio files or tracking are used.

Six chapter jumps, a permanent skip-to-build link, shorter mobile scroll distance and reduced-motion composed camera views are included. Tests cover timeline continuity/reversal, the full assembly orbit, catalogue compatibility and finish persistence. Browser QA confirms the assembly/reassembly states, finish/card changes, sound toggle and Forest finish handoff to the configurator. The QA browser disables WebGL: mesh interaction and software fallback are verified; final GPU reflections, shadow fidelity and frame rate need review on a WebGL-capable device. The current procedural models are still illustrative pending client assets.

### V15 landing refinements

Removed the exploded-view guide lines and the soft-wall insulation accessory from the catalogue, recommender, fitted geometry and saved-catalogue API responses. Historical build inputs normalize against the current catalogue. The bed throw remains an interior option. Shower fabric now has overlapping corner panels, fixed fabric edges and a continuous rear lining.

Hero copy retains its left anchor; a camera projection offset gives the camper more space on the right. The interior camera holds its position while furniture assembles, then completes its orbit. Furniture scales around each component’s centre so ceiling battens cannot cross the room during their reveal.

Drag or keyboard arrows add a temporary 360-degree view at any hero stage. Wheel, touch scrolling, page keys or chapter navigation first damp that offset to the story camera, then release scroll progression. Reset view and replay also clear the offset.

The night camper drives away before the origin story and contact form. The origin text is paraphrased from https://camperdynamics.com/ (reviewed 18 November 2026); no founder name or biography is invented. After the form, a separate lazily initialized scene shows approach, first impact, recoil, second impact and a return pose matching the opening. Decorative SVG cracks do not intercept inputs. The last scroll returns the existing page to the opening without clearing the form or selected finish. A skip button allows access to the footer. Reduced-motion mode disables screen impacts and automatic replay.

Added geometry coverage for the shower rear, withdrawn-option normalization, continuous finale beats, and a full manual orbit plus smooth camera handback. Run `node --test tests/*.test.mjs`. Browser QA uses the software fallback because the cloud browser has WebGL disabled; GPU lighting/shadows and touch-device gesture feel still need a real-device pass.

### V16 continuous, timed night sequence

The landing page now reuses one scene, renderer, camera and camper for the entire ending. At the end of the scroll story, the scene pins itself. After 2.6 seconds the camper/window lights, headlights, fog lamps, tail lamps and exterior lighting ramp on. The awning legs lift and the canopy retracts, the shower packs upward, and the pop-up roof closes before travel begins. The camper follows a curved route into a grove and remains partly visible behind foreground trees.

Founder/origin copy overlays this same parked view. The next gesture replaces it with an unrolling paper contact sheet; the actual enquiry form, its values, consent and selected configuration are retained. Scrolling within the sheet remains normal. A downward gesture past it starts a fully automatic turn and approach, then a small crack and damped impact shake. It rests there until a fresh gesture triggers reversing, a harder approach, stronger shake, full cracks and a timed blend into the exact opening camera. Restarting changes the page scroll without rebuilding the form or clearing the selected finish.

`NightSequence` isolates timed shots from scroll requests; `NightGesture` prevents momentum from queuing the next shot. Keyboard and touch equivalents are supported. Skip scene exposes the origin and contact sections in normal document flow. Reduced-motion visitors get those static sections without impacts or automatic replay. Visibility changes pause playback while the tab is hidden. Optional device vibration is best-effort; the visual shake works independently.

Night materials are also darker in the software fallback, with emissive lamps and warm camper windows. Browser QA still cannot verify GPU spotlights/shadows or physical device vibration. Run `node --test tests/*.test.mjs`; the finale checks include timed playback without scroll, two distinct gated impacts, packing-before-driving, form readiness and trackpad momentum.
