import { useEffect, useRef, useState } from 'react'
import {
  Baby,
  Check,
  Clock,
  Envelope,
  FirstAid,
  Heart,
  List,
  MagnifyingGlass,
  MapPin,
  Phone,
  ShieldCheck,
  Smiley,
  Sparkle,
  Tooth,
  Trash,
  X,
} from '@phosphor-icons/react'
import { getInitialLang, locales, saveLang, type Dict, type Lang } from './i18n'

const ICONS: Record<string, typeof Heart> = {
  MagnifyingGlass,
  Sparkle,
  Smiley,
  Tooth,
  FirstAid,
  Baby,
  ShieldCheck,
  Heart,
  Clock,
}
const TIMES = ['10:00', '11:00', '12:00', '13:00', '16:00', '17:00', '18:00', '19:00', '20:00']

type Booking = { ref: string; name: string; service: string; date: string; time: string }

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12 },
    )
    el.querySelectorAll('.reveal').forEach((n) => io.observe(n))
    return () => io.disconnect()
  }, [])
  return ref
}

function Tagline({ text }: { text: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [on, setOn] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true)
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  const words = text.split(' ')
  return (
    <section aria-label="tagline" className="mx-auto max-w-6xl px-4 py-24 sm:px-8">
      <div ref={ref} className="mx-auto max-w-[680px]">
        <p className="heading-3 text-neutral-900 sm:text-5xl sm:leading-none">
          {words.map((w, i) => (
            <span key={i} className={`tagline-word ${on ? 'on' : ''}`} style={{ transitionDelay: on ? `${i * 60}ms` : '0ms' }}>
              {w}{' '}
            </span>
          ))}
        </p>
      </div>
    </section>
  )
}

function loadBookings(): Booking[] {
  try {
    const raw = localStorage.getItem('brightsmile-bookings')
    return raw ? (JSON.parse(raw) as Booking[]) : []
  } catch {
    return []
  }
}

const inputCls =
  'w-full rounded-xl border border-neutral-300 bg-white px-4 py-2 text-base text-neutral-900 outline-none transition-all duration-300 ease-base focus:border-teal-700 focus:ring-2 focus:ring-teal-700/30'
const errCls = 'border-red-500 focus:border-red-500 focus:ring-red-500/30'

function App() {
  const [lang, setLang] = useState<Lang>(() => getInitialLang())
  const dict: Dict = locales[lang]
  const [menuOpen, setMenuOpen] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [service, setService] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState<Booking | null>(null)
  const [bookings, setBookings] = useState<Booking[]>(loadBookings)
  const rootRef = useReveal()

  const changeLang = (l: Lang) => {
    setLang(l)
    saveLang(l)
  }

  const today = new Date().toISOString().slice(0, 10)

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    if (name.trim().length < 2) e.name = dict.form.nameError
    if (phone.replace(/\D/g, '').length < 9) e.phone = dict.form.phoneError
    if (!service) e.service = dict.form.service
    if (!date || date < today) e.date = dict.form.dateError
    if (!time) e.time = dict.form.time
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    const booking: Booking = {
      ref: `BR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: name.trim(),
      service,
      date,
      time,
    }
    const next = [booking, ...bookings]
    setBookings(next)
    try {
      localStorage.setItem('brightsmile-bookings', JSON.stringify(next))
    } catch {
      /* storage unavailable */
    }
    setSubmitted(booking)
  }

  const cancelBooking = (ref: string) => {
    const next = bookings.filter((b) => b.ref !== ref)
    setBookings(next)
    try {
      localStorage.setItem('brightsmile-bookings', JSON.stringify(next))
    } catch {
      /* storage unavailable */
    }
  }

  const resetForm = () => {
    setName('')
    setPhone('')
    setService('')
    setDate('')
    setTime('')
    setNotes('')
    setErrors({})
    setSubmitted(null)
  }

  const navLinks = [
    { href: '#services', label: dict.nav.links[0] },
    { href: '#doctors', label: dict.nav.links[1] },
    { href: '#book', label: dict.nav.links[2] },
    { href: '#faq', label: dict.nav.links[3] },
  ]

  return (
    <div ref={rootRef} className="min-h-screen bg-white text-neutral-900">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:rounded-lg focus:bg-teal-700 focus:px-4 focus:py-2 focus:text-white">
        {lang === 'ar' ? 'تخطَّ إلى المحتوى' : 'Skip to content'}
      </a>

      <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
        <nav aria-label="main" className="flex w-full max-w-5xl items-center justify-between rounded-2xl border border-neutral-200 bg-white/90 px-4 py-2 shadow-sm backdrop-blur-md">
          <a href="#top" className="flex items-center gap-2" aria-current="page">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white">
              <Tooth size={20} weight="bold" />
            </span>
            <span className="title-1 font-semibold">{dict.nav.brand}</span>
          </a>
          <ul className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="body-5 text-neutral-600 transition-colors duration-300 ease-base hover:text-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-full border border-neutral-200 p-1" role="group" aria-label={dict.nav.langLabel}>
              <button type="button" onClick={() => changeLang('en')} aria-pressed={lang === 'en'} className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-300 ease-base ${lang === 'en' ? 'bg-teal-600 text-white' : 'text-neutral-600 hover:text-teal-700'}`}>
                EN
              </button>
              <button type="button" onClick={() => changeLang('ar')} aria-pressed={lang === 'ar'} className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors duration-300 ease-base ${lang === 'ar' ? 'bg-teal-600 text-white' : 'text-neutral-600 hover:text-teal-700'}`}>
                عربي
              </button>
            </div>
            <a href="#book" className="button-sm hidden rounded-xl bg-teal-600 px-3 py-2 text-white transition-all duration-300 ease-base hover:bg-teal-700 active:scale-[0.98] sm:inline-block">
              {dict.nav.cta}
            </a>
            <button type="button" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label="menu" className="rounded-lg p-2 text-neutral-700 hover:bg-neutral-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 md:hidden">
              {menuOpen ? <X size={22} /> : <List size={22} />}
            </button>
          </div>
        </nav>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 pt-24 backdrop-blur-md md:hidden">
          <ul className="flex flex-col gap-2 px-8">
            {navLinks.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={() => setMenuOpen(false)} className="title-1 block rounded-xl px-4 py-3 hover:bg-teal-50">
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a href="#book" onClick={() => setMenuOpen(false)} className="button-md mt-4 block rounded-xl bg-teal-600 px-4 py-2 text-center text-white">
                {dict.nav.cta}
              </a>
            </li>
          </ul>
        </div>
      )}

      <main id="main">
        <section id="top" className="bg-[#f0faf8] px-4 pb-16 pt-32 sm:px-8 sm:pt-40">
          <div className="mx-auto max-w-6xl">
            <div className="reveal mx-auto max-w-[680px] text-center">
              <p className="caption-4 inline-block rounded-full border border-teal-600/30 bg-teal-50 px-3 py-1 text-teal-800">{dict.hero.eyebrow}</p>
              <h1 className="hero-gradient-text heading-1 mt-6 text-4xl sm:text-6xl">{dict.hero.title}</h1>
              <p className="body-3 mx-auto mt-6 max-w-[680px] text-neutral-600">{dict.hero.subtitle}</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a href="#book" className="button-md inline-flex items-center gap-2 rounded-xl bg-teal-600 px-3 py-2 text-white transition-all duration-300 ease-base hover:bg-teal-700 active:scale-[0.98]">
                  {dict.hero.ctaPrimary} <Tooth size={18} />
                </a>
                <a href="#services" className="button-md rounded-xl border border-neutral-300 bg-white px-3 py-2 text-neutral-800 transition-all duration-300 ease-base hover:border-teal-600 hover:text-teal-700 active:scale-[0.98]">
                  {dict.hero.ctaSecondary}
                </a>
              </div>
              <p className="caption-2 mt-8 text-neutral-500">{dict.hero.proofText}</p>
            </div>

            <div className="reveal mx-auto mt-16 max-w-3xl rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="caption-4 text-neutral-500">{dict.contact.eyebrow}</p>
                  <p className="title-1 mt-1 font-semibold">{dict.contact.title}</p>
                </div>
                <a href={`tel:${dict.contact.phoneValue.replace(/\s/g, '')}`} className="button-sm rounded-xl bg-teal-600 px-3 py-2 text-white transition-all duration-300 ease-base hover:bg-teal-700 active:scale-[0.98]">
                  {dict.contact.cta}
                </a>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                {[
                  { icon: MapPin, label: dict.contact.addressLabel, value: dict.contact.addressValue },
                  { icon: Phone, label: dict.contact.phoneLabel, value: dict.contact.phoneValue },
                  { icon: Clock, label: dict.contact.hoursLabel, value: dict.contact.hoursValue },
                ].map((c) => (
                  <div key={c.label} className="rounded-xl border border-neutral-200 bg-[#f0faf8] p-4">
                    <c.icon size={22} className="text-teal-600" />
                    <p className="caption-4 mt-2 text-neutral-500">{c.label}</p>
                    <p className="title-3 mt-1 font-semibold">{c.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="services" className="mx-auto max-w-6xl px-4 py-24 sm:px-8">
          <div className="reveal max-w-[680px]">
            <p className="caption-4 text-teal-700">{dict.services.eyebrow}</p>
            <h2 className="heading-2 mt-4 text-4xl sm:text-5xl">{dict.services.title}</h2>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {dict.services.items.map((s) => {
              const Icon = ICONS[s.icon] ?? Tooth
              return (
                <article key={s.name} className="reveal rounded-2xl border border-neutral-200 bg-white p-8 transition-all duration-300 ease-base hover:border-teal-600/40 hover:shadow-sm">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <Icon size={24} />
                  </span>
                  <h3 className="heading-6 mt-6">{s.name}</h3>
                  <p className="body-3 mt-2 text-neutral-600">{s.desc}</p>
                  <p className="title-2 mt-4 font-semibold text-teal-700">{s.price}</p>
                  <a href="#book" onClick={() => setService(s.name)} className="button-sm mt-4 inline-block rounded-xl border border-neutral-300 px-3 py-2 text-neutral-800 transition-all duration-300 ease-base hover:border-teal-600 hover:text-teal-700 active:scale-[0.98]">
                    {dict.form.submit}
                  </a>
                </article>
              )
            })}
          </div>
          <p className="caption-2 mt-8 text-neutral-500">{dict.services.note}</p>
        </section>

        <section className="bg-[#f0faf8] px-4 py-24 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="reveal max-w-[680px]">
              <p className="caption-4 text-teal-700">{dict.benefits.eyebrow}</p>
              <h2 className="heading-2 mt-4 text-4xl sm:text-5xl">{dict.benefits.title}</h2>
            </div>
            <div className="mt-12 grid gap-8 sm:grid-cols-2">
              {dict.benefits.items.map((b) => {
                const Icon = ICONS[b.icon] ?? Tooth
                return (
                  <article key={b.title} className="reveal rounded-2xl border border-neutral-200 bg-white p-8">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                      <Icon size={24} />
                    </span>
                    <h3 className="heading-6 mt-6">{b.title}</h3>
                    <p className="body-3 mt-2 text-neutral-600">{b.text}</p>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <Tagline text={dict.tagline} />

        <section id="how" className="mx-auto max-w-6xl px-4 py-24 sm:px-8">
          <div className="reveal max-w-[680px]">
            <p className="caption-4 text-teal-700">{dict.how.eyebrow}</p>
            <h2 className="heading-2 mt-4 text-4xl sm:text-5xl">{dict.how.title}</h2>
          </div>
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {dict.how.steps.map((s, i) => (
              <li key={s.title} className="reveal rounded-2xl border border-neutral-200 bg-white p-8">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-600 text-base font-semibold text-white">{i + 1}</span>
                <h3 className="heading-6 mt-6">{s.title}</h3>
                <p className="body-3 mt-2 text-neutral-600">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="doctors" className="bg-[#f0faf8] px-4 py-24 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="reveal max-w-[680px]">
              <p className="caption-4 text-teal-700">{dict.doctors.eyebrow}</p>
              <h2 className="heading-2 mt-4 text-4xl sm:text-5xl">{dict.doctors.title}</h2>
              <p className="body-3 mt-4 text-neutral-600">{dict.doctors.subtitle}</p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {dict.doctors.items.map((d) => (
                <article key={d.name} className="reveal rounded-2xl border border-neutral-200 bg-white p-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                    <Tooth size={24} />
                  </span>
                  <h3 className="heading-6 mt-4">{d.name}</h3>
                  <p className="title-3 mt-1 font-semibold text-teal-700">{d.role}</p>
                  <p className="caption-2 mt-2 text-neutral-500">{d.exp} · {d.days}</p>
                </article>
              ))}
            </div>
            <p className="caption-2 mt-8 text-neutral-500">{dict.doctors.note}</p>
          </div>
        </section>

        <section id="book" className="mx-auto max-w-6xl px-4 py-24 sm:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="reveal text-center">
              <h2 className="heading-2 text-4xl sm:text-5xl">{dict.form.title}</h2>
              <p className="body-3 mt-4 text-neutral-600">{dict.form.subtitle}</p>
            </div>
            <div className="reveal mt-12 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
              {submitted ? (
                <div className="py-4 text-center">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                    <Check size={28} weight="bold" />
                  </span>
                  <h3 className="heading-4 mt-6">{dict.form.successTitle}</h3>
                  <p className="body-3 mt-2 text-neutral-600">{dict.form.successText}</p>
                  <div className="mx-auto mt-6 max-w-md rounded-xl bg-neutral-50 p-4 text-start">
                    <p className="body-2"><span className="font-semibold">{submitted.ref}</span></p>
                    <p className="body-3 mt-1 text-neutral-600">{submitted.name}</p>
                    <p className="body-3 text-neutral-600">{submitted.service}</p>
                    <p className="body-3 text-neutral-600">{submitted.date} · {submitted.time}</p>
                  </div>
                  <button type="button" onClick={resetForm} className="button-md mt-8 rounded-xl bg-teal-600 px-3 py-2 text-white transition-all duration-300 ease-base hover:bg-teal-700 active:scale-[0.98]">
                    {lang === 'ar' ? 'احجز زيارة أخرى' : 'Book another visit'}
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} noValidate>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="d-name" className="title-3 mb-2 block font-semibold">{dict.form.name}</label>
                      <input id="d-name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={dict.form.namePlaceholder} aria-invalid={Boolean(errors.name)} className={`${inputCls} ${errors.name ? errCls : ''}`} />
                      {errors.name && <p className="caption-2 mt-2 text-red-600">{errors.name}</p>}
                    </div>
                    <div>
                      <label htmlFor="d-phone" className="title-3 mb-2 block font-semibold">{dict.form.phone}</label>
                      <input id="d-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={dict.form.phonePlaceholder} aria-invalid={Boolean(errors.phone)} className={`${inputCls} ${errors.phone ? errCls : ''}`} />
                      {errors.phone && <p className="caption-2 mt-2 text-red-600">{errors.phone}</p>}
                    </div>
                    <div>
                      <label htmlFor="d-service" className="title-3 mb-2 block font-semibold">{dict.form.service}</label>
                      <select id="d-service" value={service} onChange={(e) => setService(e.target.value)} aria-invalid={Boolean(errors.service)} className={`${inputCls} ${errors.service ? errCls : ''}`}>
                        <option value="">{dict.form.service}</option>
                        {dict.services.items.map((s) => (
                          <option key={s.name} value={s.name}>{s.name}</option>
                        ))}
                      </select>
                      {errors.service && <p className="caption-2 mt-2 text-red-600">{dict.form.service}</p>}
                    </div>
                    <div>
                      <label htmlFor="d-time" className="title-3 mb-2 block font-semibold">{dict.form.time}</label>
                      <select id="d-time" value={time} onChange={(e) => setTime(e.target.value)} aria-invalid={Boolean(errors.time)} className={`${inputCls} ${errors.time ? errCls : ''}`}>
                        <option value="">{dict.form.time}</option>
                        {TIMES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="d-date" className="title-3 mb-2 block font-semibold">{dict.form.date}</label>
                      <input id="d-date" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} aria-invalid={Boolean(errors.date)} className={`${inputCls} ${errors.date ? errCls : ''}`} />
                      {errors.date && <p className="caption-2 mt-2 text-red-600">{errors.date}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="d-notes" className="title-3 mb-2 block font-semibold">{dict.form.notes}</label>
                      <textarea id="d-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={dict.form.notesPlaceholder} rows={3} className={inputCls} />
                    </div>
                  </div>
                  <button type="submit" className="button-md mt-8 w-full rounded-xl bg-teal-600 px-3 py-2 text-white transition-all duration-300 ease-base hover:bg-teal-700 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700">
                    {dict.form.submit}
                  </button>
                </form>
              )}
            </div>

            {bookings.length > 0 && (
              <div className="reveal mt-8 rounded-2xl border border-neutral-200 bg-white p-6">
                <h3 className="heading-6">{lang === 'ar' ? 'حجوزاتي المحفوظة' : 'My saved bookings'}</h3>
                <ul className="mt-4 space-y-2">
                  {bookings.map((b) => (
                    <li key={b.ref} className="flex items-center justify-between gap-4 rounded-xl border border-neutral-200 px-4 py-2">
                      <span>
                        <span className="title-3 block font-semibold">{b.ref} · {b.service}</span>
                        <span className="caption-2 block text-neutral-500">{b.date} · {b.time}</span>
                      </span>
                      <button type="button" onClick={() => cancelBooking(b.ref)} aria-label={lang === 'ar' ? 'إلغاء الحجز' : 'Cancel booking'} className="rounded-lg p-2 text-red-600 hover:bg-red-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
                        <Trash size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

        <section className="bg-[#f0faf8] px-4 py-24 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="reveal max-w-[680px]">
              <p className="caption-4 text-teal-700">{dict.contact.eyebrow}</p>
              <h2 className="heading-2 mt-4 text-4xl sm:text-5xl">{dict.contact.title}</h2>
              <p className="body-3 mt-4 text-neutral-600">{dict.contact.subtitle}</p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { icon: MapPin, label: dict.contact.addressLabel, value: dict.contact.addressValue },
                { icon: Phone, label: dict.contact.phoneLabel, value: dict.contact.phoneValue },
                { icon: Envelope, label: dict.contact.emailLabel, value: dict.contact.emailValue },
                { icon: Clock, label: dict.contact.hoursLabel, value: dict.contact.hoursValue },
              ].map((c) => (
                <div key={c.label} className="reveal rounded-2xl border border-neutral-200 bg-white p-6">
                  <c.icon size={22} className="text-teal-600" />
                  <p className="caption-4 mt-2 text-neutral-500">{c.label}</p>
                  <p className="title-3 mt-1 font-semibold">{c.value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-24 sm:px-8">
          <div className="reveal max-w-[680px]">
            <p className="caption-4 text-teal-700">{dict.testimonials.eyebrow}</p>
            <h2 className="heading-2 mt-4 text-4xl sm:text-5xl">{dict.testimonials.title}</h2>
            <p className="caption-2 mt-4 rounded-lg bg-amber-50 px-3 py-2 text-amber-800">{dict.testimonials.note}</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {dict.testimonials.items.map((t) => (
              <figure key={t.name} className="reveal rounded-2xl border border-neutral-200 bg-white p-8">
                <blockquote className="body-3 mt-4 text-neutral-700">{t.quote}</blockquote>
                <figcaption className="mt-6">
                  <p className="title-3 font-semibold">{t.name}</p>
                  <p className="caption-2 text-neutral-500">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-4xl px-4 py-24 sm:px-8">
          <div className="reveal max-w-[680px]">
            <p className="caption-4 text-teal-700">{dict.faq.eyebrow}</p>
            <h2 className="heading-2 mt-4 text-4xl sm:text-5xl">{dict.faq.title}</h2>
          </div>
          <div className="mt-12 space-y-4">
            {dict.faq.items.map((f, i) => (
              <div key={f.q} className="reveal rounded-2xl border border-neutral-200 bg-white">
                <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i} className="flex w-full items-center justify-between gap-4 px-6 py-4 text-start focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 rounded-2xl">
                  <span className="title-3 font-semibold">{f.q}</span>
                  <span className="text-teal-700 transition-transform duration-500 ease-base" style={{ transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
                </button>
                {openFaq === i && <p className="body-3 px-6 pb-6 text-neutral-600">{f.a}</p>}
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-8">
          <div className="reveal rounded-2xl bg-[#181818] px-8 py-16 text-center text-white">
            <h2 className="heading-2 mx-auto max-w-[680px] text-4xl sm:text-5xl">{dict.finalCta.title}</h2>
            <p className="body-3 mx-auto mt-4 max-w-[680px] text-neutral-300">{dict.finalCta.text}</p>
            <a href="#book" className="button-md mt-8 inline-block rounded-xl bg-teal-600 px-3 py-2 text-white transition-all duration-300 ease-base hover:bg-teal-500 active:scale-[0.98]">
              {dict.finalCta.cta}
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-white px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-12 md:grid-cols-4">
            <div>
              <p className="title-1 flex items-center gap-2 font-semibold">
                <Tooth size={20} className="text-teal-600" /> {dict.nav.brand}
              </p>
              <p className="body-3 mt-4 text-neutral-600">{dict.footer.brandText}</p>
            </div>
            {dict.footer.columns.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <p className="title-3 font-semibold">{c.title}</p>
                <ul className="mt-4 space-y-2">
                  {c.links.map((l) => (
                    <li key={l}>
                      <a href="#top" className="body-5 text-neutral-600 transition-colors duration-300 ease-base hover:text-teal-700">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
          <div className="mt-12 flex flex-col gap-2 border-t border-neutral-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="caption-2 text-neutral-500">© 2026 {dict.nav.brand}. {dict.footer.copyright}</p>
            <p className="caption-2 text-neutral-500">{dict.footer.madeWith}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
