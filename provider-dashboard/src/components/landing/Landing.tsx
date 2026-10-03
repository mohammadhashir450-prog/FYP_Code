'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useProgress } from '@react-three/drei';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { story } from '@/lib/explodeState';
import { CAR_ISSUES, APPLIANCES, LOCAL_CARS } from '@/lib/profile';
import { Droplets, Minus, Plus, Power, Snowflake, Wind } from 'lucide-react';
import Navbar from './Navbar';
import IntroSplash from './IntroSplash';

const CarScene = dynamic(() => import('./CarScene'), { ssr: false });

const SERVICES = [
  { t: 'Engine, Tuning & CNG', d: 'Misfire, high fuel use, injector cleaning and CNG/LPG kit tuning for Mehran, Cultus, Corolla and more.' },
  { t: 'Suspension for rough roads', d: "Shock absorbers, bushes and ball joints — built for Pakistan's broken roads and speed breakers." },
  { t: 'Car AC & Battery', d: 'Gas refill, compressor, dead battery, self-starter and alternator at your doorstep.' },
  { t: 'Home AC & Refrigerator', d: 'Split/window AC, fridge and deep-freezer cooling, gas leaks and compressor faults.' },
  { t: 'Geyser, UPS & Water Pump', d: 'Gas geyser pilot issues, UPS/inverter batteries, pump motors and stabilisers.' },
  { t: 'Electrician & Appliances', d: 'Wiring, breaker tripping, fans, washing machines, microwaves and LED TVs.' },
];

const PARTS = [
  ['Doors', 'Four'],
  ['Hood & Roof', 'Two'],
  ['Wheels', 'Four'],
  ['Engine bay', 'One'],
];


const MODES = [
  { id: 'cool', label: 'Cool', icon: Snowflake },
  { id: 'dry', label: 'Dry', icon: Droplets },
  { id: 'fan', label: 'Fan', icon: Wind },
] as const;

/** Interactive smart remote: drives the 3D AC (display, airflow, colour) through the shared `story` state. */
function AcRemote() {
  const [temp, setTemp] = useState(24);
  const [fan, setFan] = useState(2);
  const [mode, setMode] = useState<'cool' | 'dry' | 'fan'>('cool');
  const [power, setPower] = useState(true);

  useEffect(() => {
    story.acTemp = temp; story.acFan = fan; story.acMode = mode; story.acPower = power ? 1 : 0;
  }, [temp, fan, mode, power]);

  const R = 54, CIRC = 2 * Math.PI * R;
  const frac = (temp - 16) / 14;
  const step = (d: number) => setTemp((t) => Math.min(30, Math.max(16, t + d)));
  const btn = 'flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/5 text-ink transition hover:border-brand hover:text-brand disabled:opacity-40';

  return (
    <div className="reveal mt-5 w-full max-w-md rounded-3xl border border-steel/50 bg-navy/80 p-4 sm:p-5 md:mt-8 shadow-[0_24px_70px_rgba(0,0,0,.45)] backdrop-blur-xl">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-brand">
          <span className={`h-2 w-2 rounded-full ${power ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-mist-dim'}`} /> Smart remote
        </div>
        <button onClick={() => setPower((p) => !p)} aria-pressed={power} aria-label="Power" className={`flex h-9 items-center gap-2 rounded-full border px-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] transition ${power ? 'border-brand bg-brand text-navy' : 'border-white/15 bg-transparent text-mist hover:text-white'}`}>
          <Power size={14} strokeWidth={2.6} />{power ? 'On' : 'Off'}
        </button>
      </div>

      <div className={`flex items-center gap-3 sm:gap-5 transition-opacity ${power ? 'opacity-100' : 'opacity-40'}`}>
        <div className="relative h-[104px] w-[104px] shrink-0 sm:h-[132px] sm:w-[132px]">
          <svg viewBox="0 0 132 132" className="h-full w-full -rotate-90">
            <defs><linearGradient id="acg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5fa3ea" /><stop offset="1" stopColor="#ffd60a" /></linearGradient></defs>
            <circle cx="66" cy="66" r={R} fill="none" stroke="rgba(255,255,255,.1)" strokeWidth="8" />
            <circle cx="66" cy="66" r={R} fill="none" stroke="url(#acg)" strokeWidth="8" strokeLinecap="round" strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - frac)} style={{ transition: 'stroke-dashoffset .4s ease' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-[30px] font-semibold leading-none text-white sm:text-[40px]">{temp}<span className="text-lg text-brand">°C</span></span>
            <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.28em] text-mist-dim">Target</span>
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <button className={btn} onClick={() => step(-1)} disabled={!power || temp <= 16} aria-label="Lower temperature"><Minus size={16} /></button>
            <span className="flex-1 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-mist-dim">16° — 30°</span>
            <button className={btn} onClick={() => step(1)} disabled={!power || temp >= 30} aria-label="Raise temperature"><Plus size={16} /></button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {MODES.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setMode(id)} disabled={!power} className={`flex flex-col items-center gap-1 rounded-xl border bg-transparent py-2 font-mono text-[9px] font-bold uppercase tracking-[0.14em] transition disabled:opacity-40 ${mode === id ? 'border-brand bg-brand/15 text-brand' : 'border-white/10 text-mist hover:text-white'}`}>
                <Icon size={15} />{label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-mist-dim">Fan</span>
            {[1, 2, 3].map((n) => (
              <button key={n} onClick={() => setFan(n)} disabled={!power} aria-label={`Fan speed ${n}`} className={`h-6 flex-1 rounded-md border-0 transition disabled:opacity-40 ${n <= fan ? 'bg-brand' : 'bg-white/10 hover:bg-white/20'}`} style={{ height: 8 + n * 5 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const [issueTab, setIssueTab] = useState<'car' | 'home'>('car');
  const storyRef = useRef<HTMLDivElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const climateRef = useRef<HTMLDivElement>(null);
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
          <div className="max-w-2xl">
            <div className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-brand sm:text-[11px]">Land Cruiser 300 · Precision service</div>
            <h1 className="font-display text-4xl font-semibold leading-[1.1] sm:text-5xl md:text-6xl">
              Ustad Jee, <em className="whitespace-nowrap bg-gradient-to-r from-brand-light to-brand bg-clip-text not-italic text-transparent">kam py gya jy.</em>
              <span className="mt-3 block text-2xl font-medium text-ink sm:text-3xl md:text-4xl">Hukam kro Pyary Bhaii, ki Hoya?</span>
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-mist sm:text-base md:mt-6">
              RepairEase connects you with verified mechanics, electricians and appliance specialists. Tell us the problem, and the right ustad is at your door.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4 md:mt-8">
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
            <p className="mt-5 leading-relaxed text-mist">Har part wapas apni jagah. Verified workmanship, transparent pricing, aur koi guesswork nahi.</p>
          </div>
        </section>

        </div>

        <div ref={climateRef}>
        {/* 5 — Climate (air-conditioner model) */}
        <section id="climate" className="flex min-h-screen items-end px-5 pb-10 pt-[40vh] md:h-screen md:items-center md:px-6 md:pb-0 md:pl-[8vw] md:pt-0">
          <div className="reveal max-w-lg">
            <div className="mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-brand">04 — Climate Control</div>
            <h2 className="font-display text-3xl font-semibold leading-tight sm:text-4xl md:text-6xl">Cool comfort, <em className="text-brand">engineered.</em></h2>
            <p className="mt-3 hidden max-w-md text-sm leading-relaxed text-mist sm:block md:mt-4 md:text-base">From car AC gas refills to home split-unit servicing, our specialists restore perfect airflow and temperature — fast, clean and guaranteed.</p>
            <ul className="mt-4 hidden max-w-md sm:flex md:mt-6 list-none flex-wrap gap-2 text-[12px] text-ink">
              {['Gas refill & leak detection', 'Compressor & coil service', 'Filter, duct & vent cleaning'].map((t) => (
                <li key={t} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5"><span className="h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_10px_rgba(255,214,10,.8)]" />{t}</li>
              ))}
            </ul>
            <AcRemote />
          </div>
        </section>

        {/* 6 — Details */}
        <section id="services" className="flex min-h-screen items-center px-6 py-24 md:pl-[8vw]">
          <div className="w-full md:max-w-[46%]">
            <div className="reveal mb-4 font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-brand">05 — What we service</div>
            <h2 className="reveal font-display text-4xl font-semibold leading-tight md:text-5xl">Complete care for <em className="text-brand">every system.</em></h2>
            <div className="mt-10 grid gap-3 sm:grid-cols-2">
              {SERVICES.map((s) => (
                <div key={s.t} className="reveal rounded-2xl border border-steel/50 bg-navy/70 p-5 backdrop-blur-md transition hover:border-brand/40">
                  <div className="font-display text-lg font-semibold">{s.t}</div>
                  <p className="mt-2 text-sm leading-relaxed text-mist-dim">{s.d}</p>
                </div>
              ))}
            </div>
            {/* common problems */}
            <div className="reveal mt-8 rounded-2xl border border-steel/50 bg-navy/70 p-5 backdrop-blur-md">
              <div className="mb-4 flex gap-2">
                {([['car', 'Car problems'], ['home', 'Home appliances']] as const).map(([id, label]) => (
                  <button key={id} onClick={() => setIssueTab(id)} className={`rounded-full border bg-transparent px-4 py-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] transition ${issueTab === id ? 'border-brand bg-brand/15 text-brand' : 'border-white/10 text-mist hover:text-white'}`}>{label}</button>
                ))}
              </div>
              {issueTab === 'car' ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    {CAR_ISSUES.map((c) => <span key={c.title} title={c.desc} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[12px] text-ink">{c.title}</span>)}
                  </div>
                  <p className="mt-4 text-[11.5px] leading-relaxed text-mist-dim">Popular: {LOCAL_CARS.join(' · ')}</p>
                </>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {APPLIANCES.map((a) => (
                    <div key={a.name}>
                      <div className="text-[12.5px] font-semibold text-brand">{a.name}</div>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">{a.issues.slice(0, 4).map((i) => <span key={i} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-mist">{i}</span>)}</div>
                    </div>
                  ))}
                </div>
              )}
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
