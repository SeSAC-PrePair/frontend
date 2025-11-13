import { useState } from 'react'
import './index.css'

const heroStats = [
  {
    label: 'Offer conversion lift',
    value: '3.1×',
    detail: 'after 5 Gemini-guided sessions',
  },
  {
    label: 'Answer clarity score',
    value: '92 / 100',
    detail: 'averaged across enterprise cohorts',
  },
  {
    label: 'Time to confident pitch',
    value: '18 min',
    detail: 'from prompt to polished delivery',
  },
]

const featurePanels = [
  {
    title: 'Adaptive Interview Flow',
    caption: 'Gemini senses context to keep every answer in orbit.',
    description:
      'Surface laser-focused follow-ups, tighten STAR storytelling, and auto-generate recruiter-ready notes while you speak. Gemini listens for intent, confidence, and impact — adjusting the path in real time.',
    points: [
      'Detects hesitation, filler words, and tone within 120ms.',
      'Suggests sharper phrasing and metrics that land with hiring managers.',
      'Exports polished, shareable transcripts instantly after each session.',
    ],
    metrics: [
      { label: 'Confidence lift', value: '+18%', detail: 'in 3 guided sessions' },
      { label: 'Filler words drop', value: '-42%', detail: 'avg. reduction' },
      { label: 'Prep time saved', value: '6×', detail: 'faster debrief' },
    ],
    preview: {
      headline: 'Gemini recalibrates on the fly',
      highlight: '“Let’s anchor your answer with the customer impact to close the loop.”',
      checklist: [
        'Branches into role-specific follow ups as soon as it hears you pivot.',
        'Synthesizes STAR summaries you can drop straight into feedback docs.',
        'Flags leadership signals and empathy markers recruiters track.',
      ],
      footer: 'Auto-syncs the best take to your hiring panel workspace.',
      pills: ['Behavioral intelligence', 'Scenario rewriting', 'Realtime transcript'],
    },
    accent: '#6366f1',
    accentSoft: 'rgba(99, 102, 241, 0.2)',
  },
  {
    title: 'Tone Mirror & Delivery Coach',
    caption: 'See how your delivery lands before the interviewer reacts.',
    description:
      'Gemini mirrors your tone, pace, and presence with live telemetry. It spots over-explaining, amplifies confident moments, and nudges you into a calm, intentional cadence that resonates.',
    points: [
      'Live pulse indicators reveal when energy and empathy align.',
      'Micro-prompts help you tighten long answers without sounding rehearsed.',
      'Opt-in clips replay your strongest segments for instant reinforcement.',
    ],
    metrics: [
      { label: 'Speaking pace', value: '137 wpm', detail: 'ideal range marked' },
      { label: 'Tone balance', value: '79%', detail: 'calm ↔ assertive spectrum' },
      { label: 'Confidence spikes', value: '12', detail: 'highlighted moments' },
    ],
    preview: {
      headline: 'Precision feedback without the awkward pause',
      highlight: '“Hold that pause — now land the metric with eye contact and intention.”',
      checklist: [
        'Calibrates vocal energy, articulation, and empathy in real time.',
        'Generates polarity charts so you can see when storytelling peaks.',
        'Recommends micro-adjustments grounded in top 1% performer cadences.',
      ],
      footer: 'Pair with auto-generated warmup drills before your next loop.',
      pills: ['Tone telemetry', 'Confidence radar', 'Delivery drills'],
    },
    accent: '#22d3ee',
    accentSoft: 'rgba(34, 211, 238, 0.22)',
  },
  {
    title: 'Career Blueprint Library',
    caption: 'Translate experience into outcomes recruiters can trust.',
    description:
      'Tap into Gemini’s blueprint of successful offers. It converts raw projects into quantified narratives, benchmarks against target roles, and maps authentic stories you can deliver on cue.',
    points: [
      'Ingests your resume, portfolio, and achievements in seconds.',
      'Aligns each story to leadership principles or product competencies.',
      'Publishes a living playbook synced to your interview calendar.',
    ],
    metrics: [
      { label: 'Stories unlocked', value: '27', detail: 'curated talking points' },
      { label: 'Benchmark fit', value: '94%', detail: 'role alignment score' },
      { label: 'Reviewer saves', value: '4 hrs', detail: 'per hiring panel' },
    ],
    preview: {
      headline: 'Blueprints that evolve with every conversation',
      highlight: '“This launch narrative pairs with the Gemini PM loop — want the teardown version?”',
      checklist: [
        'Runs vector search across millions of interview transcripts.',
        'Maps your impact to company-specific leadership principles.',
        'Bundles recruiter-ready follow-ups the moment you wrap.',
      ],
      footer: 'Send the summary deck to mentors or peers with one share link.',
      pills: ['Outcome quantifier', 'Leadership mapping', 'One-click share'],
    },
    accent: '#f97316',
    accentSoft: 'rgba(249, 115, 22, 0.22)',
  },
]

const insightCards = [
  {
    title: 'Signal telemetry heatmaps',
    description:
      'Visualize tone, focus, and empathy markers across every answer. Gemini highlights the exact moments where stories resonate — or stall.',
  },
  {
    title: 'Gemini-grade transcripts',
    description:
      'Receive polished transcripts with recruiter-ready STAR breakdowns, tagged risks, and suggested follow-ups in under 30 seconds.',
  },
  {
    title: 'Shared workspaces',
    description:
      'Collaborate with mentors or hiring partners in a private Gemini room. Leave inline comments, attach clips, and stay aligned on next steps.',
  },
]

const workflow = [
  {
    stage: 'Prime',
    headline: 'Set your intent in minutes',
    detail:
      'Choose target roles, upload highlights, and let Gemini map a readiness path grounded in successful offer data.',
  },
  {
    stage: 'Coach',
    headline: 'Stay in flow with realtime orbiting feedback',
    detail:
      'Gemini listens, mirrors, and adjusts follow-ups — so you can rehearse how you respond under pressure without memorizing scripts.',
  },
  {
    stage: 'Amplify',
    headline: 'Ship shareable proof of excellence',
    detail:
      'Export clips, insights, and action plans directly to recruiters or teammates. Gemini keeps the prep cycle tight until you sign.',
  },
]

export default function App() {
  const [activeFeature, setActiveFeature] = useState(0)
  const currentFeature = featurePanels[activeFeature]
  const featureAccent = {
    '--feature-accent': currentFeature.accent,
    '--feature-accent-soft': currentFeature.accentSoft,
  }

  return (
    <div className="app">
      <div className="celestial-grid" aria-hidden="true">
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="orb orb-three" />
      </div>

      <header className="app-header">
        <div className="brand">
          <span className="brand-mark">◎</span>
          <span className="brand-name">Gemini Prep Studio</span>
        </div>
        <nav className="main-nav" aria-label="Primary">
          <a href="#platform">Platform</a>
          <a href="#insights">Insights</a>
          <a href="#workflow">Workflow</a>
          <a href="#pricing">Pricing</a>
        </nav>
        <div className="header-actions">
          <button className="ghost-button" type="button">
            Sign in
          </button>
          <button className="primary-button" type="button">
            Launch free orbit
          </button>
        </div>
      </header>

      <main className="app-main">
        <section className="hero" id="platform">
          <span className="eyebrow">Interview intelligence, powered by Gemini</span>
          <h1>
            Grow interview confidence with a studio that thinks, listens, and speaks in Gemini style.
          </h1>
          <p className="hero-lede">
            Orchestrate mock interviews that feel real. Gemini blends search, context, and tone telemetry
            so every answer you give carries weight where it counts.
          </p>

          <div className="hero-actions">
            <button className="primary-button" type="button">
              Start a guided session
            </button>
            <button className="ghost-button ghost-button--inverted" type="button">
              Watch 2 min demo
            </button>
          </div>

          <div className="hero-grid">
            {heroStats.map((stat) => (
              <article className="hero-card" key={stat.label}>
                <span className="hero-card__value">{stat.value}</span>
                <span className="hero-card__label">{stat.label}</span>
                <p className="hero-card__detail">{stat.detail}</p>
              </article>
            ))}
            <article className="hero-card hero-card--spotlight">
              <div className="hero-card__badge">Live Gemini feedback</div>
              <h3>“Shift into customer impact before you close.”</h3>
              <p>
                Gemini transcribes, scores, and reframes simultaneously — so you polish delivery without breaking flow.
              </p>
              <div className="hero-card__foot">
                <span className="hero-dot" />
                <span>Latency &lt; 180ms</span>
              </div>
            </article>
          </div>
        </section>

        <section className="feature-section" aria-labelledby="feature-heading">
          <div className="feature-heading">
            <div>
              <span className="eyebrow">Gemini-grade coaching</span>
              <h2 id="feature-heading">A refined stack built for modern interview prep</h2>
            </div>
            <p>
              Swap fragmented tools for a single studio. Gemini choreographs prompts, follow-ups, delivery cues,
              and shareable outcomes — all in one sleek space.
            </p>
          </div>

          <div className="feature-panels" style={featureAccent}>
            <aside className="feature-tabs">
              {featurePanels.map((feature, index) => (
                <button
                  key={feature.title}
                  className={`feature-tab ${activeFeature === index ? 'is-active' : ''}`}
                  type="button"
                  onClick={() => setActiveFeature(index)}
                  onMouseEnter={() => setActiveFeature(index)}
                  onFocus={() => setActiveFeature(index)}
                >
                  <span className="feature-tab__title">{feature.title}</span>
                  <span className="feature-tab__caption">{feature.caption}</span>
                </button>
              ))}
            </aside>

            <article className="feature-preview">
              <header className="feature-preview__header">
                <span className="feature-badge">Why it matters</span>
                <p>{currentFeature.description}</p>
              </header>

              <ul className="feature-points">
                {currentFeature.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>

              <div className="feature-preview__quote">
                <span className="quote-mark">❝</span>
                <p>{currentFeature.preview.highlight}</p>
              </div>

              <ul className="feature-checklist">
                {currentFeature.preview.checklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>

              <div className="feature-preview__metrics">
                {currentFeature.metrics.map((metric) => (
                  <div className="metric-card" key={metric.label}>
                    <span className="metric-value">{metric.value}</span>
                    <span className="metric-label">{metric.label}</span>
                    <p>{metric.detail}</p>
                  </div>
                ))}
              </div>

              <footer className="feature-footer">
                <span className="feature-footer__title">{currentFeature.preview.footer}</span>
                <div className="feature-footer__pills">
                  {currentFeature.preview.pills.map((pill) => (
                    <span className="feature-pill" key={pill}>
                      {pill}
                    </span>
                  ))}
                </div>
              </footer>
            </article>
          </div>
        </section>

        <section className="insights-section" id="insights" aria-labelledby="insights-heading">
          <div className="section-heading">
            <span className="eyebrow">Intelligence layers</span>
            <h2 id="insights-heading">See every signal that matters</h2>
            <p>
              Gemini styles your preparation with clarity. Every session unfolds into visuals, transcripts,
              and actionable recommendations the moment you wrap.
            </p>
          </div>
          <div className="insight-grid">
            {insightCards.map((card) => (
              <article className="insight-card" key={card.title}>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="workflow-section" id="workflow" aria-labelledby="workflow-heading">
          <div className="section-heading">
            <span className="eyebrow">Orbit-ready workflow</span>
            <h2 id="workflow-heading">From first prompt to offer-ready</h2>
          </div>
          <div className="workflow-grid">
            {workflow.map((step) => (
              <article className="workflow-card" key={step.stage}>
                <span className="workflow-stage">{step.stage}</span>
                <h3>{step.headline}</h3>
                <p>{step.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-section" id="pricing">
          <div className="cta-card">
            <div className="cta-content">
              <span className="eyebrow">Ready to launch?</span>
              <h2>Experience the Gemini standard for interview prep</h2>
              <p>
                Start with 3 complimentary guided sessions. Invite mentors, export transcripts, and feel your narrative click into place.
              </p>
              <div className="cta-actions">
                <button className="primary-button" type="button">
                  Unlock my free sessions
                </button>
                <button className="ghost-button ghost-button--tonal" type="button">
                  Talk with a coach
                </button>
              </div>
            </div>
            <ul className="cta-list">
              <li>Unlimited smart transcripts</li>
              <li>Role-specific blueprint libraries</li>
              <li>Insight sharing with mentors</li>
            </ul>
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <div className="brand brand--footer">
          <span className="brand-mark">◎</span>
          <span className="brand-name">Gemini Prep Studio</span>
        </div>
        <p>Designed for teams that expect brilliance from every conversation.</p>
        <small>© {new Date().getFullYear()} Gemini Prep Studio. All rights reserved.</small>
      </footer>
    </div>
  )
}
