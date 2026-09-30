'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useProgress } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { story } from '@/lib/explodeState';
import Navbar from './Navbar';
import IntroSplash from './IntroSplash';

const CarScene = dynamic(() => import('./CarScene'), { ssr: false });

const SERVICES = [
  { t: 'Engine & Diagnostics', d: 'Computer diagnostics and full engine service at your door.' },
  { t: 'Body & Paint', d: 'Panels, dents and finish restored to showroom standard.' },
  { t: 'Tyres & Wheels', d: 'Balancing, alignment and replacement — mobile or in-shop.' },
  { t: 'Electrical & ECU', d: 'Wiring, sensors and control-unit repair by specialists.' },
  { t: 'Climate Control', d: 'AC servicing, gas refills and cabin comfort systems.' },
  { t: 'Suspension & Brakes', d: 'Safety-critical work, inspected and guaranteed.' },
];

const PARTS = [
  ['Doors', 'Four'],
  ['Hood & Roof', 'Two'],
  ['Wheels', 'Four'],
  ['Engine bay', 'One'],
];

export default function Landing() {
  const storyRef = useRef<HTMLDivElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const climateRef = useRef<HTMLDivElement>(null);
  const { progress, active } = useProgress();
  const [ready, setReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    if (progress >= 100 && !active) {
      const t = setTimeout(() => { setReady(true); ScrollTrigger.refresh(); }, 300);
      return () => clearTimeout(t);
    }
  }, [progress, active]);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const desktop = window.matchMedia('(min-width: 768px)').matches;
    const heroX = desktop ? 3.2 : 0; // car sits right of the hero copy on desktop
    story.explode = 0; story.rotY = -0.55; story.camZ = 12.5; story.x = heroX;

    const ctx = gsap.context(() => {
      // Whole-page tracker: drives the car's background travel + a velocity lean while scrolling.
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => { story.drift = self.progress; story.vel = self.getVelocity(); },
      });

      // One master timeline, scrubbed by page scroll (total length = 1 → the first 4 screens).
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: zoneRef.current, start: 'top top', end: 'bottom bottom', scrub: 1.2 },
      });
      tl.to(story, { explode: 1, rotY: 0.5, camZ: 17.5, x: desktop ? -1.3 : 0, duration: 0.32, ease: 'power2.inOut' }, 0.1) // Phase 1 — disassemble
        .to(story, { rotY: 1.0, duration: 0.28 }, 0.42) // exploded hold: slow orbit
        .to(story, { explode: 0, rotY: -0.35, camZ: 12.5, x: desktop ? 2.4 : 0, duration: 0.28, ease: 'power3.inOut' }, 0.7) // Phase 2 — reassemble
        .set({}, {}, 1); // pad to a total length of 1

      // Climate hand-over: the car drives off, the air-conditioner floats in, then the car returns for Services.
      gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: climateRef.current, start: 'top 85%', end: 'bottom 75%', scrub: 1.2 },
      })
        .to(story, { carOut: 1, ac: 1, duration: 0.2, ease: 'power2.inOut' }, 0)
        .to(story, { carOut: 0, ac: 0, duration: 0.28, ease: 'power2.inOut' }, 0.5)
        .set({}, {}, 1);

      gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
        gsap.fromTo(el, { y: 44, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
        });
      });
    }, storyRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative bg-transparent text-white">
      {!introDone && <IntroSplash progress={ready ? 100 : progress} onDone={() => setIntroDone(true)} />}

      {/* Ambient depth layers behind the 3D canvas */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -left-40 top-1/4 h-[520px] w-[520px] rounded-full bg-steel/25 blur-[130px]" />
        <div className="absolute -right-32 bottom-0 h-[460px] w-[460px] rounded-full bg-brand/[0.07] blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(2,10,24,.75)_100%)]" />
      </div>

      <CarScene />

      <Navbar />

      <div ref={storyRef} className="relative z-10">
        <div ref={zoneRef}>
        {/* 1 — Hero */}
        <section className="flex h-screen items-end justify-center px-6 pb-16 md:items-center md:justify-start md:pb-0 md:pl-[8vw]">
          <div className="max-w-xl">
            <div className="mb-5 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-brand">Land Cruiser 300 · Precision service</div>
            <h1 className="font-display text-5xl font-semibold leading-[1.05] md:text-7xl">
              Every part.<br /><em className="bg-gradient-to-r from-brand-light to-brand bg-clip-text text-transparent">Perfectly</em> in place.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-mist">
              RepairEase connects you with verified mechanics and specialists who take your vehicle apart — and put it back better than new.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/login" className="no-underline rounded-xl bg-gradient-to-br from-brand-light to-brand px-7 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-navy shadow-[0_8px_30px_rgba(255,214,10,.3)] transition hover:-translate-y-0.5">Join as a provider</Link>
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-mist-dim">Scroll ↓</span>
            </div>
          </div>
        </section>

        {/* 2 — Disassemble */}
        <section id="process" className="flex h-screen items-end px-6 pb-14 md:justify-end md:pb-16 md:pr-[8vw]">
          <div className="reveal max-w-md md:text-right">
            <div className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-brand">01 — Disassembly</div>
            <h2 className="font-display text-4xl font-semibold leading-tight md:text-5xl">Laid bare, <em className="text-brand">piece by piece.</em></h2>
            <p className="mt-5 leading-relaxed text-mist">Doors, hood, roof and wheels drift apart so every component can be inspected, serviced or replaced with total clarity.</p>
          </div>
        </section>

        {/* 3 — Exploded callouts */}
        <section className="flex h-screen items-end justify-center px-6 pb-14 md:pb-16">
          <div className="reveal grid w-full max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
            <div className="col-span-2 mb-1 md:col-span-4 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-brand">02 — Anatomy</div>
            {PARTS.map(([name, n]) => (
              <div key={name} className="rounded-2xl border border-steel/50 bg-navy/60 p-5 backdrop-blur-md">
                <div className="font-display text-2xl font-semibold text-brand">{n}</div>
                <div className="mt-1 text-sm text-mist">{name}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 4 — Reassemble */}
        <section className="flex h-screen items-end px-6 pb-14 md:justify-start md:pb-16 md:pl-[8vw]">
          <div className="reveal max-w-md">
            <div className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-brand">03 — Reassembly</div>
            <h2 className="font-display text-4xl font-semibold leading-tight md:text-5xl">Snapped back <em className="text-brand">to perfection.</em></h2>
            <p className="mt-5 leading-relaxed text-mist">Every part returns to its exact position. Verified workmanship, transparent pricing, zero guesswork.</p>
          </div>
        </section>

        </div>

        <div ref={climateRef}>
        {/* 5 — Climate (air-conditioner model) */}
        <section id="climate" className="flex h-screen items-end px-6 pb-14 md:items-center md:pb-0 md:pl-[8vw]">
          <div className="reveal max-w-lg">
            <div className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-brand">04 — Climate Control</div>
            <h2 className="font-display text-4xl font-semibold leading-tight md:text-6xl">Cool comfort, <em className="text-brand">engineered.</em></h2>
            <p className="mt-5 max-w-md leading-relaxed text-mist">From car AC gas refills to home split-unit servicing, our specialists restore perfect airflow and temperature — fast, clean and guaranteed.</p>
            <ul className="mt-7 grid max-w-md list-none gap-3 text-sm text-ink">
              {['Gas refill & leak detection', 'Compressor & coil service', 'Filter, duct and vent cleaning'].map((t) => (
                <li key={t} className="flex items-center gap-3"><span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_10px_rgba(255,214,10,.8)]" />{t}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* 6 — Details */}
        <section id="services" className="flex min-h-screen items-center px-6 py-24 md:pl-[8vw]">
          <div className="w-full md:max-w-[46%]">
            <div className="reveal mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-brand">04 — What we service</div>
            <h2 className="reveal font-display text-4xl font-semibold leading-tight md:text-5xl">Complete care for <em className="text-brand">every system.</em></h2>
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {SERVICES.map((s) => (
                <div key={s.t} className="reveal rounded-2xl border border-steel/50 bg-navy/70 p-5 backdrop-blur-md transition hover:border-brand/40">
                  <div className="font-display text-lg font-semibold">{s.t}</div>
                  <p className="mt-2 text-sm leading-relaxed text-mist-dim">{s.d}</p>
                </div>
              ))}
            </div>
            <div className="reveal mt-10 flex flex-wrap gap-4">
              <Link href="/login" className="no-underline rounded-xl bg-gradient-to-br from-brand-light to-brand px-7 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-navy shadow-[0_8px_30px_rgba(255,214,10,.3)] transition hover:-translate-y-0.5">Open provider portal</Link>
              <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="rounded-xl border border-steel/60 px-7 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-ink transition hover:border-brand hover:text-brand">Replay animation</a>
            </div>
          </div>
        </section>
        </div>
      </div>

      <footer className="relative z-10 border-t border-steel/50 bg-navy/80 px-6 py-6 text-center font-mono text-[11px] tracking-widest text-mist-dim backdrop-blur">
        © {new Date().getFullYear()} REPAIREASE · SERVICE PROVIDER PLATFORM
      </footer>
    </div>
  );
}
