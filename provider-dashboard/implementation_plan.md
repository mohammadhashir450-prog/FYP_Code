# Implementation Plan — Scroll-Triggered Exploded View (Land Cruiser 300)

Route: `/` (landing page). Stack: Next.js 16 (App Router), React Three Fiber, drei, GSAP + ScrollTrigger, Tailwind CSS v4.

## 1. Model preparation

`public/2022_toyota_land_cruiser_300_vx.r.glb` (17 MB, 300 nodes, no skins/animations) is already organised as
`Sketchfab_model > FINAL_MODEL > RootNode > <one node per body part>`. Node names encode the part:

| Node name pattern | Part key |
|---|---|
| `T:SK_Door_FL_101_…` | `Door_FL` (also FR, BL, BR) |
| `T:SK_Hood_101_…`, `T:SM_Roof_101_…`, `T:SK_Trunk_101_…` | `Hood`, `Roof`, `Trunk` |
| `T:SK_Tyre_101_…` → children `W1..W4` | `W1..W4` (each wheel is separate) |
| `Bumper_F/B`, `Fender_F/B`, `Light_F/B`, `SideMirror_L/R`, `SideSkirts`, `Diffuser_B`, `Engine`, `Exhaust`, `Suspension` | same key |
| `Body`, `Body_Bones` | chassis / cabin — stays put |

**Decision on `gltfjsx`:** it would emit a ~300-node JSX file (every mesh as its own element) that we would then
have to group by hand. Instead `buildRig()` performs the same separation at load time by parsing those names, which
gives us one *part* per key with all its meshes. No generated code to maintain.

## 2. Component architecture

```
app/page.tsx                    → renders <Landing/> (client)
components/landing/Landing.tsx  → Tailwind HTML overlay + GSAP timeline + loader
components/landing/CarScene.tsx → fixed <Canvas>, <ExplodedCar/>, Environment, ContactShadows, camera rig
lib/explodeState.ts             → mutable `story` object (the single bridge between GSAP and R3F)
```

* **Landing** owns the scroll. A tall `#story` wrapper (500vh) contains five 100vh text sections.
* **CarScene** is `position: fixed; inset: 0; z-index: 0; pointer-events: none` so HTML scrolls above it.
* GSAP never touches Three objects. It only tweens numbers on `story`; R3F reads them every frame.
  This avoids React re-renders on scroll.

### `story` (shared state)
`{ explode: 0..1, rotY, camZ, x }`

### ExplodedCar (per-frame logic)
1. **buildRig** (memo): normalise size (car length → 6.4 units), find each part's world-space centre and bounding box,
   compute an outward explode vector per part (roof ↑, hood ↑ + forward, doors sideways, wheels sideways,
   bumpers front/back, mirrors sideways + up, …) as fractions of car width/height/length, and convert it to each node's
   parent-local space (the FBX root has a 0.01 scale and a −90° rotation).
2. **useFrame**: damp `story` values → `e`. For every part: `position = base + dir·ease(e, stagger) + idleWobble·e`.
   Idle wobble = per-part sin/cos with random phase, scaled by `e` so it only appears while exploded.
3. Group rotation (`rotY`), lift (`0.6·e`), x-offset and camera distance are also driven from `story`.
4. Glass materials: `transmission` → simple transparency (avoids the extra transmission render pass with 17 MB of geometry).

## 3. GSAP timeline (one scrubbed timeline, `scrub: 1.2`, `#story` top→bottom, total = 1)

| Range | Screen | Tween | Visual |
|---|---|---|---|
| 0.00 – 0.20 | 1 Hero | hold | fully assembled, 3/4 view |
| 0.20 – 0.45 | 2 Disassemble | `explode 0→1`, `rotY −0.55→0.5`, `camZ 11→15` (power2.inOut) | parts float outward |
| 0.45 – 0.62 | 3 Exploded | `rotY →1.0` | slow orbit, idle floating visible |
| 0.62 – 0.82 | 4 Reassemble | `explode 1→0`, `rotY →−0.35`, `camZ →11.5`, `x →2.1` (power3.inOut) | parts snap back to `[0,0,0]` |
| 0.82 – 1.00 | 5 Details | `rotY →−0.3` | complete car on the right, service cards on the left |

Text blocks use separate `ScrollTrigger` reveals (`.reveal` fade/translate).

## 4. Lighting & depth
* `<Environment files="/hdr/city.hdr" />` — the exact drei **city** HDRI, stored locally so it works offline.
* `<ContactShadows>` under the car; `dpr={[1, 1.5]}`; ACES tone mapping.

## 5. UI (Tailwind)
Tailwind v4 is loaded **without preflight** (`theme` + `utilities` only, layered) so the existing dashboard CSS is not reset.
Brand palette (navy / steel-blue / yellow from the logo) is exposed as theme colours.
Sections: Hero → Disassemble → Exploded callouts → Reassemble → Services + CTA (`/login`).
Loader overlay (drei `useProgress`) covers the 17 MB model download. Mobile: smaller car, no x-offset, centred text.

## 6. Verification
`tsc`, `eslint`, `next build`, then run `next dev` on localhost and check the page loads without console/runtime errors.
