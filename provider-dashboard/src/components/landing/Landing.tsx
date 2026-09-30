'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useProgress } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight, BadgeCheck, Cog, Disc3, DoorOpen, Gauge, MapPin, Paintbrush, ShieldCheck, Snowflake, UserPlus, Wrench, Zap, CircleDot, ThermometerSnowflake, Wind, Fan,
} from 'lucide-react';
import { story } from '@/lib/explodeState';
import Navbar from './Navbar';
import IntroSplash from './IntroSplash';

const CarScene = dynamic(() => import('./CarScene'), { ssr: false });

const SERVICES = [
  { icon: Cog, t: 'Engine & Diagnostics', d: 'Computer diagnostics and full engine service at your door.' },
  { icon: Paintbrush, t: 'Body & Paint', d: 'Panels, dents and finish restored to showroom standard.' },
  { icon: Disc3, t: 'Tyres & Wheels', d: 'Balancing, alignment and replacement — mobile or in-shop.' },
  { icon: Zap, t: 'Electrical & ECU', d: 'Wiring, sensors and control-unit repair by specialists.' },
  { icon: Snowflake, t: 'Climate Control', d: 'AC servicing, gas refills and cabin comfort systems.' },
  { icon: Gauge, t: 'Suspension & Brakes', d: 'Safety-critical work, inspected and guaranteed.' },
];

const PARTS = [
  { icon: DoorOpen, n: 'Four', name: 'Doors' },
  { icon: Wind, n: 'Two', name: 'Hood & Roof' },
  { icon: CircleDot, n: 'Four', name: 'Wheels' },
  { icon: Fan, n: 'One', name: 'Engine bay' },
];

const STEPS = [
  { icon: UserPlus, t: 'Apply', d: 'Create your provider account and describe your workshop in three quick steps.' },
  { icon: ShieldCheck, t: 'Get verified', d: 'Our team reviews your ID and trade documents and awards the verified badge.' },
  { icon: Wrench, t: 'Accept jobs', d: 'Go online, receive matching customer requests and grow your reputation.' },
];

const MARQUEE = ['Engine diagnostics', 'Body & paint', 'Tyres & wheels', 'Electrical & ECU', 'Climate control', 'Suspension & brakes', 'Doorstep service', 'Verified providers'];

/** Card with a mouse-following spotlight. */
function Spot({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <div onMouseMove={onMove} className={`spot group relative overflow-hidden rounded-2xl border border-steel/50 bg-navy/70 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-brand/50 ${className}`}>
      <span aria-hidden className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ background: 'radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgba(255,214,10,.14), transparent 65%)' }} />
      <div className="relative">{children}</div>
    </div>
  );
}

const Eyebrow = ({ n, children }: { n: string; children: React.ReactNode }) => (
  <div className="mb-4 flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-brand">
    <span className="h-px w-8 bg-gradient-to-r from-brand to-transparent" />{n} — {children}
  </div>
);

export default function Landing() {
  const storyRef = useRef<HTMLDivElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const climateRef = useRef<HTMLDivElement>(null);
  const cueRef = useRef<HTMLDivElement>(null);
  const { progress, active } = useProgress();
  const [ready, setReady] = useState(false);
  const [introDone, setIntroDone] = useState(false);

  // Safety net: never trap the user behind the intro if an asset is slow or fails.
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 20000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (progress >= 100 && !active) {
      const t = setTimeout(() => { setReady(true); ScrollTrigger.refresh(); }, 300);
      return () => clearTimeout(t);
    }
  }, [progress, active]);

  // Intro: the car drops from above, bursts into parts on impact, then reassembles.
  useEffect(() => {
    if (!introDone || story.drop === 0) return;
    document.body.style.overflow = 'hidden';
    const tl = gsap.timeline({ onComplete: () => { document.body.style.overflow = ''; } });
    tl.to(story, { drop: 0, duration: 1.3, ease: 'power2.in' })
      .to(story, { burst: 1, impact: 1, shake: 1, duration: 0.55, ease: 'power3.out' })
      .to(story, { shake: 0, duration: 0.8, ease: 'power2.out' }, '<')
      .to({}, { duration: 0.4 })
      .to(story, { burst: 0, duration: 1.7, ease: 'power2.inOut' })
      .to(story, { impact: 0, duration: 1.4, ease: 'power2.out' }, '<');
    return () => { tl.kill(); document.body.style.overflow = ''; };
  }, [introDone]);

  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const desktop = window.matchMedia('(min-width: 768px)').matches;
    const heroX = desktop ? 3.2 : 0; // car sits right of the hero copy on desktop
    story.explode = 0; story.rotY = -0.55; story.camZ = 12.5; story.x = heroX;
    story.drop = window.scrollY < 200 ? 1 : 0; story.burst = 0; story.shake = 0; story.impact = 0;

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

      // Final section: the car drives away so the sign-up content has the stage to itself.
      gsap.to(story, {
        carOut: 1, ease: 'power2.inOut', immediateRender: false,
        scrollTrigger: { trigger: '#join', start: 'top 90%', end: 'top 40%', scrub: 1.2 },
      });

      gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
        gsap.fromTo(el, { y: 44, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
        });
      });

      // Scroll cue fades away once the user starts scrolling
      if (cueRef.current) gsap.to(cueRef.current, { opacity: 0, y: 12, scrollTrigger: { start: 40, end: 220, scrub: true } });
    }, storyRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="relative bg-transparent text-white">
      <style>{`
        @keyframes lp-marquee { to { transform: translateX(-50%); } }
        @keyframes lp-cue { 0% { transform: translateY(0); opacity: 1; } 70% { transform: translateY(10px); opacity: 0; } 100% { opacity: 0; } }
        @keyframes lp-shimmer { to { background-position: 200% 0; } }
        .lp-shimmer { background: linear-gradient(100deg, #ffd60a 20%, #fff3a0 40%, #ffd60a 60%); background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: lp-shimmer 5s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .lp-shimmer { animation: none; } }
      `}</style>

      {!introDone && <IntroSplash progress={ready ? 100 : progress} onDone={() => setIntroDone(true)} />}

      {/* Ambient depth layers behind the 3D canvas */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -left-40 top-1/4 h-[520px] w-[520px] rounded-full bg-steel/25 blur-[130px]" />
        <div className="absolute -right-32 bottom-0 h-[460px] w-[460px] rounded-full bg-brand/[0.07] blur-[140px]" />
        <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(95,163,234,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(95,163,234,.6)_1px,transparent_1px)] [background-size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(2,10,24,.78)_100%)]" />
      </div>

      <CarScene />
      <Navbar />

      <div ref={storyRef} className="relative z-10">
        <div ref={zoneRef}>
          {/* 1 — Hero */}
          <section className="relative flex h-screen items-end justify-center px-6 pb-28 md:items-center md:justify-start md:pb-0 md:pl-[8vw]">
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-brand/35 bg-navy/60 py-1.5 pl-2 pr-4 backdrop-blur">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/20"><span className="h-2 w-2 animate-pulse rounded-full bg-brand shadow-[0_0_10px_#ffd60a]" /></span>
                <span className="font-mono text-[10.5px] font-bold uppercase tracking-[0.26em] text-brand">Verified providers · Doorstep service</span>
              </div>
              <h1 className="font-display text-5xl font-semibold leading-[1.02] md:text-[5.4rem]">
                Every part.<br /><em className="lp-shimmer pr-2">Perfectly</em><br className="hidden md:block" /> in place.
              </h1>
              <p className="mt-7 max-w-md text-[17px] leading-relaxed text-mist">
                RepairEase connects you with verified mechanics and specialists who take your vehicle apart — and put it back better than new.
              </p>
              <div className="mt-9 flex flex-wrap items-center gap-4">
                <Link href="/login" className="group flex items-center gap-2 rounded-xl bg-gradient-to-br from-brand-light via-brand to-[#e6bf00] px-7 py-4 text-xs font-bold uppercase tracking-[0.16em] text-navy no-underline shadow-[0_10px_40px_rgba(255,214,10,.35)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_50px_rgba(255,214,10,.5)]">
                  Join as a provider <ArrowRight size={16} strokeWidth={2.6} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <a href="#process" onClick={(e) => { e.preventDefault(); document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' }); }} className="rounded-xl border border-steel bg-navy/40 px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-ink no-underline backdrop-blur transition hover:border-brand hover:text-brand">
                  See the teardown
                </a>
              </div>
              <ul className="mt-10 hidden list-none flex-wrap gap-x-7 gap-y-3 text-[13px] text-mist md:flex">
                {[[BadgeCheck, 'ID-verified experts'], [MapPin, 'We come to you'], [ShieldCheck, 'Guaranteed workmanship']].map(([Icon, t]) => {
                  const I = Icon as typeof BadgeCheck;
                  return <li key={t as string} className="flex items-center gap-2"><I size={16} className="text-brand" />{t as string}</li>;
                })}
              </ul>
            </div>

            {/* scroll cue */}
            <div ref={cueRef} className="absolute bottom-24 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
              <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-mist-dim">Scroll</span>
              <span className="flex h-9 w-[22px] justify-center rounded-full border border-mist-dim/60 pt-1.5"><span className="h-2 w-[3px] rounded-full bg-brand [animation:lp-cue_1.8s_ease-in-out_infinite]" /></span>
            </div>

            {/* marquee */}
            <div aria-hidden className="absolute inset-x-0 bottom-0 overflow-hidden border-y border-steel/40 bg-navy/50 py-3 backdrop-blur-md [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
              <div className="flex w-max gap-10 whitespace-nowrap [animation:lp-marquee_38s_linear_infinite]">
                {[...MARQUEE, ...MARQUEE].map((m, i) => (
                  <span key={i} className="flex items-center gap-10 font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-mist-dim">{m}<span className="h-1 w-1 rounded-full bg-brand" /></span>
                ))}
              </div>
            </div>
          </section>

          {/* 2 — Disassemble */}
          <section id="process" className="flex h-screen items-end px-6 pb-14 md:justify-end md:pb-16 md:pr-[8vw]">
            <div className="reveal max-w-md md:text-right">
              <div className="mb-4 flex items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-brand md:justify-end">01 — Disassembly<span className="hidden h-px w-8 bg-gradient-to-l from-brand to-transparent md:block" /></div>
              <h2 className="font-display text-4xl font-semibold leading-tight md:text-5xl">Laid bare, <em className="text-brand">piece by piece.</em></h2>
              <p className="mt-5 leading-relaxed text-mist">Doors, hood, roof and wheels drift apart so every component can be inspected, serviced or replaced with total clarity.</p>
            </div>
          </section>

          {/* 3 — Exploded callouts */}
          <section className="flex h-screen items-end justify-center px-6 pb-14 md:pb-16">
            <div className="reveal grid w-full max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
              <div className="col-span-2 mb-1 md:col-span-4"><Eyebrow n="02">Anatomy</Eyebrow></div>
              {PARTS.map(({ icon: Icon, n, name }) => (
                <Spot key={name} className="p-5">
                  <Icon size={20} className="mb-3 text-brand" strokeWidth={1.8} />
                  <div className="font-display text-2xl font-semibold text-white">{n}</div>
                  <div className="mt-1 text-sm text-mist">{name}</div>
                </Spot>
              ))}
            </div>
          </section>

          {/* 4 — Reassemble */}
          <section className="flex h-screen items-end px-6 pb-14 md:justify-start md:pb-16 md:pl-[8vw]">
            <div className="reveal max-w-md">
              <Eyebrow n="03">Reassembly</Eyebrow>
              <h2 className="font-display text-4xl font-semibold leading-tight md:text-5xl">Snapped back <em className="text-brand">to perfection.</em></h2>
              <p className="mt-5 leading-relaxed text-mist">Every part returns to its exact position. Verified workmanship, transparent pricing, zero guesswork.</p>
            </div>
          </section>
        </div>

        <div ref={climateRef}>
          {/* 5 — Climate (air-conditioner model) */}
          <section id="climate" className="flex h-screen items-end px-6 pb-14 md:items-center md:pb-0 md:pl-[8vw]">
            <div className="reveal max-w-lg">
              <Eyebrow n="04">Climate Control</Eyebrow>
              <h2 className="font-display text-4xl font-semibold leading-[1.05] md:text-6xl">Cool comfort,<br /><em className="text-brand">engineered.</em></h2>
              <p className="mt-5 max-w-md leading-relaxed text-mist">From car AC gas refills to home split-unit servicing, our specialists restore perfect airflow and temperature — fast, clean and guaranteed.</p>
              <div className="mt-8 grid max-w-md gap-3 sm:grid-cols-3">
                {[[ThermometerSnowflake, 'Gas refill & leak detection'], [Fan, 'Compressor & coil service'], [Wind, 'Filter, duct & vent cleaning']].map(([Icon, t]) => {
                  const I = Icon as typeof Fan;
                  return (
                    <Spot key={t as string} className="p-4">
                      <I size={20} className="mb-3 text-brand" strokeWidth={1.8} />
                      <div className="text-[12.5px] leading-snug text-ink">{t as string}</div>
                    </Spot>
                  );
                })}
              </div>
            </div>
          </section>

          {/* 6 — Services */}
          <section id="services" className="flex min-h-screen items-center px-6 py-24 md:pl-[8vw]">
            <div className="w-full md:max-w-[50%]">
              <div className="reveal"><Eyebrow n="05">What we service</Eyebrow></div>
              <h2 className="reveal font-display text-4xl font-semibold leading-tight md:text-5xl">Complete care for <em className="text-brand">every system.</em></h2>
              <div className="mt-10 grid gap-3 sm:grid-cols-2">
                {SERVICES.map((s, i) => (
                  <div key={s.t} className="reveal">
                    <Spot className="h-full p-5">
                      <div className="flex items-start justify-between">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-brand/25 bg-brand/10 text-brand transition group-hover:bg-brand group-hover:text-navy"><s.icon size={20} strokeWidth={1.8} /></span>
                        <span className="font-mono text-[10px] tracking-[0.25em] text-mist-dim">0{i + 1}</span>
                      </div>
                      <div className="mt-4 font-display text-lg font-semibold">{s.t}</div>
                      <p className="mt-2 text-sm leading-relaxed text-mist-dim">{s.d}</p>
                    </Spot>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* 7 — How it works */}
        <section id="join" className="relative px-6 py-28 md:px-[8vw]">
          <div className="mx-auto max-w-5xl">
            <div className="reveal text-center">
              <div className="flex justify-center"><Eyebrow n="06">Become a provider</Eyebrow></div>
              <h2 className="font-display text-4xl font-semibold leading-tight md:text-5xl">Three steps to <em className="text-brand">your first job.</em></h2>
            </div>
            <div className="relative mt-14 grid gap-5 md:grid-cols-3">
              <span aria-hidden className="absolute left-[16%] right-[16%] top-[46px] hidden h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent md:block" />
              {STEPS.map((s, i) => (
                <div key={s.t} className="reveal">
                  <Spot className="h-full p-7 text-center">
                    <span className="relative mx-auto mb-5 flex h-[60px] w-[60px] items-center justify-center rounded-2xl border border-brand/40 bg-gradient-to-br from-brand/20 to-transparent text-brand shadow-[0_0_30px_rgba(255,214,10,.15)]">
                      <s.icon size={26} strokeWidth={1.7} />
                      <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-brand font-mono text-[11px] font-bold text-navy">{i + 1}</span>
                    </span>
                    <div className="font-display text-xl font-semibold">{s.t}</div>
                    <p className="mt-2 text-sm leading-relaxed text-mist-dim">{s.d}</p>
                  </Spot>
                </div>
              ))}
            </div>

            {/* CTA banner */}
            <div className="reveal mt-16 overflow-hidden rounded-3xl border border-brand/30 bg-gradient-to-br from-steel/50 via-navy/80 to-navy/90 p-8 shadow-[0_30px_100px_rgba(0,0,0,.5)] backdrop-blur-xl md:p-12">
              <div className="flex flex-col items-center gap-8 text-center md:flex-row md:text-left">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="RepairEase" className="h-24 w-24 shrink-0 rounded-3xl bg-white p-1 shadow-[0_0_60px_rgba(255,214,10,.3)] md:h-28 md:w-28" />
                <div className="flex-1">
                  <h3 className="font-display text-3xl font-semibold md:text-4xl">Ready to grow your <em className="text-brand">workshop?</em></h3>
                  <p className="mt-3 max-w-xl text-mist">Join RepairEase and get matched with customers who need exactly what you do best.</p>
                </div>
                <Link href="/login" className="group flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-br from-brand-light via-brand to-[#e6bf00] px-8 py-4 text-xs font-bold uppercase tracking-[0.16em] text-navy no-underline shadow-[0_10px_40px_rgba(255,214,10,.35)] transition hover:-translate-y-0.5">
                  Open provider portal <ArrowRight size={16} strokeWidth={2.6} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="relative z-10 border-t border-steel/50 bg-[#020a18]/90 px-6 py-12 backdrop-blur-xl md:px-[8vw]">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="" className="h-11 w-11 rounded-xl bg-white p-0.5" />
            <div>
              <div className="font-display text-lg font-bold tracking-[0.22em] text-brand">REPAIREASE</div>
              <div className="mt-1 font-mono text-[9px] uppercase tracking-[0.3em] text-mist-dim">Provider Platform</div>
            </div>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap justify-center gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.2em]">
            {[['Sign in', '/login'], ['Dashboard', '/dashboard'], ['Profile', '/profile'], ['Job requests', '/jobs']].map(([l, h]) => (
              <Link key={h} href={h} className="text-mist no-underline transition hover:text-brand">{l}</Link>
            ))}
          </nav>
        </div>
        <div className="mx-auto mt-10 max-w-5xl border-t border-steel/30 pt-6 text-center font-mono text-[10.5px] tracking-widest text-mist-dim">
          © {new Date().getFullYear()} REPAIREASE · SERVICE PROVIDER PLATFORM
        </div>
      </footer>
    </div>
  );
}
