'use client'

import { useMemo, useState } from 'react'
import { Footer } from '@/components/Footer'
import { ThemeToggle } from '@/components/ThemeToggle'

type ScenarioKey = 'ambition' | 'balanced' | 'moderate'

type Scenario = {
  key: ScenarioKey
  name: string
  description: string
  principal: number
  annualReturnPct: number
  yearsHeld: number
  inflationPct: number
  marginalTaxPct: number
  assessmentLabel: string
  assessmentTone: 'success' | 'warning' | 'danger'
  assessmentReason: string
  sources: Array<{
    label: string
    href: string
    quote: string
  }>
}

const SCENARIOS: Scenario[] = [
  {
    key: 'ambition',
    name: 'Ambitious long hold',
    description: '$10k, 15% p.a., 50 years, 47% marginal tax, 2.5% inflation.',
    principal: 10000,
    annualReturnPct: 15,
    yearsHeld: 50,
    inflationPct: 2.5,
    marginalTaxPct: 47,
    assessmentLabel: 'Exaggerated',
    assessmentTone: 'danger',
    assessmentReason: 'The 15% annual return assumption is far above the official retail-investor baseline commonly cited in Australian guidance.',
    sources: [
      {
        label: 'ASIC Moneysmart',
        href: 'https://moneysmart.gov.au/investment-warnings/investment-seminars',
        quote: '“Shares have return around 7% a year”',
      },
      {
        label: 'RBA inflation target',
        href: 'https://www.rba.gov.au/education/resources/explainers/australias-inflation-target.html',
        quote: '“between 2 to 3 per cent”',
      },
    ],
  },
  {
    key: 'balanced',
    name: 'Balanced wealth builder',
    description: '$25k, 9% p.a., 30 years, 39% marginal tax, 2.8% inflation.',
    principal: 25000,
    annualReturnPct: 9,
    yearsHeld: 30,
    inflationPct: 2.8,
    marginalTaxPct: 39,
    assessmentLabel: 'Optimistic',
    assessmentTone: 'warning',
    assessmentReason: 'The 9% return assumption is plausible for strong long-run growth assets, but it sits above the usual public-policy baseline.',
    sources: [
      {
        label: 'Future Fund FY23',
        href: 'https://yearinreviewfy23.futurefund.gov.au/fy23-performance-results.html',
        quote: '“10-year return of 8.8% per annum”',
      },
      {
        label: 'RBA inflation target',
        href: 'https://www.rba.gov.au/education/resources/explainers/australias-inflation-target.html',
        quote: '“between 2 to 3 per cent”',
      },
    ],
  },
  {
    key: 'moderate',
    name: 'Moderate compounding path',
    description: '$15k, 7% p.a., 20 years, 32% marginal tax, 3.0% inflation.',
    principal: 15000,
    annualReturnPct: 7,
    yearsHeld: 20,
    inflationPct: 3,
    marginalTaxPct: 32,
    assessmentLabel: 'Realistic',
    assessmentTone: 'success',
    assessmentReason: 'The 7% return and 3% inflation assumptions are closest to the mainstream Australian long-run reference points.',
    sources: [
      {
        label: 'ASIC Moneysmart',
        href: 'https://moneysmart.gov.au/investment-warnings/investment-seminars',
        quote: '“Shares have return around 7% a year”',
      },
      {
        label: 'RBA inflation target',
        href: 'https://www.rba.gov.au/education/resources/explainers/australias-inflation-target.html',
        quote: '“between 2 to 3 per cent”',
      },
    ],
  },
]

const SOURCE_CARDS = [
  {
    label: 'PBO concentration',
    stat: '82%',
    caption: 'Share of CGT discount benefit accruing to the top 10% of taxable income earners in 2025–26.',
    href: 'https://www.pbo.gov.au/sites/default/files/2026-02/PBO%20-%20Operation%20of%20the%20CGT%20discount.pdf',
    note: 'PBO, Table A5',
  },
  {
    label: 'PBO top 1%',
    stat: '≈60%',
    caption: 'Share of benefit accruing to the top 1% of taxable income earners in 2025–26.',
    href: 'https://www.pbo.gov.au/sites/default/files/2026-02/PBO%20-%20Operation%20of%20the%20CGT%20discount.pdf',
    note: 'PBO summary + Table A5',
  },
  {
    label: 'Treasury under 35',
    stat: '4%',
    caption: 'Combined share of CGT discount tax savings flowing to ages 18 to 24, 25 to 29, and 30 to 34.',
    href: 'https://treasury.gov.au/sites/default/files/2025-12/p2025-721342-chart-data.xlsx',
    note: 'Treasury TEIS, Chart 2.8 data',
  },
  {
    label: 'Treasury age 60+',
    stat: '52%',
    caption: 'Combined share of CGT discount tax savings flowing to ages 60 to 64, 65 to 69, 70 to 74, and 75+.',
    href: 'https://treasury.gov.au/sites/default/files/2025-12/p2025-721342-chart-data.xlsx',
    note: 'Treasury TEIS, Chart 2.8 data',
  },
  {
    label: 'ABS business entries',
    stat: '437,150',
    caption: 'Business entries in 2024–25 across the Australian economy.',
    href: 'https://www.abs.gov.au/statistics/economy/business-indicators/counts-australian-businesses-including-entries-and-exits/latest-release',
    note: 'ABS latest release',
  },
  {
    label: 'ABS business exits',
    stat: '370,500',
    caption: 'Business exits in 2024–25 across the Australian economy.',
    href: 'https://www.abs.gov.au/statistics/economy/business-indicators/counts-australian-businesses-including-entries-and-exits/latest-release',
    note: 'ABS latest release',
  },
]

const REFERENCE_LINKS = [
  {
    title: 'PBO: Operation of the CGT discount',
    href: 'https://www.pbo.gov.au/publications-and-data/publications/costings/operation-CGT-discount',
    detail: 'Distribution by income percentile and asset class; official baseline for who benefits now.',
  },
  {
    title: 'Treasury: 2025–26 Tax Expenditures and Insights Statement',
    href: 'https://treasury.gov.au/publication/p2025-721342',
    detail: 'Use for E15 CGT discount and E7 main residence exemption benchmark comparisons.',
  },
  {
    title: 'Treasury: TEIS chart data workbook',
    href: 'https://treasury.gov.au/sites/default/files/2025-12/p2025-721342-chart-data.xlsx',
    detail: 'Includes the age-by-benefit split behind the 18–34 and 60+ comparisons used on this page.',
  },
  {
    title: 'ATO: Capital gains tax statistics 2022–23',
    href: 'https://www.ato.gov.au/about-ato/research-and-statistics/in-detail/taxation-statistics/taxation-statistics-2022-23/statistics/capital-gains-tax-statistics',
    detail: 'Entity-type CGT statistics and estimated tax on net capital gains.',
  },
  {
    title: 'ABS: Household Income and Wealth',
    href: 'https://www.abs.gov.au/statistics/economy/finance/household-income-and-wealth-australia',
    detail: 'Use for age-by-wealth composition and household asset mix.',
  },
  {
    title: 'ABS: Housing Occupancy and Costs',
    href: 'https://www.abs.gov.au/statistics/people/housing/housing-occupancy-and-costs',
    detail: 'Use for home ownership, mortgage and renting profiles by age.',
  },
  {
    title: 'RBA: Household Sector Chart Pack',
    href: 'https://www.rba.gov.au/chart-pack/household-sector.html',
    detail: 'Macro context for household wealth, liabilities and housing concentration.',
  },
]

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(value)
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`
}

function applyScenario(setters: {
  setPrincipal: (v: number) => void
  setAnnualReturnPct: (v: number) => void
  setYearsHeld: (v: number) => void
  setInflationPct: (v: number) => void
  setMarginalTaxPct: (v: number) => void
}, scenario: Scenario) {
  setters.setPrincipal(scenario.principal)
  setters.setAnnualReturnPct(scenario.annualReturnPct)
  setters.setYearsHeld(scenario.yearsHeld)
  setters.setInflationPct(scenario.inflationPct)
  setters.setMarginalTaxPct(scenario.marginalTaxPct)
}

export default function HomePageClient() {
  const [principal, setPrincipal] = useState(SCENARIOS[0].principal)
  const [annualReturnPct, setAnnualReturnPct] = useState(SCENARIOS[0].annualReturnPct)
  const [yearsHeld, setYearsHeld] = useState(SCENARIOS[0].yearsHeld)
  const [inflationPct, setInflationPct] = useState(SCENARIOS[0].inflationPct)
  const [marginalTaxPct, setMarginalTaxPct] = useState(SCENARIOS[0].marginalTaxPct)
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('ambition')

  const derived = useMemo(() => {
    const annualReturn = annualReturnPct / 100
    const inflation = inflationPct / 100
    const marginalTaxRate = marginalTaxPct / 100

    const futureValue = principal * Math.pow(1 + annualReturn, yearsHeld)
    const nominalGain = Math.max(futureValue - principal, 0)
    const indexedCostBase = principal * Math.pow(1 + inflation, yearsHeld)
    const indexedGain = Math.max(futureValue - indexedCostBase, 0)

    const discountedTax = nominalGain * 0.5 * marginalTaxRate
    const indexedTax = indexedGain * marginalTaxRate
    const noDiscountTax = nominalGain * marginalTaxRate

    const afterTaxCurrent = futureValue - discountedTax
    const afterTaxIndexed = futureValue - indexedTax
    const afterTaxNoDiscount = futureValue - noDiscountTax

    const extraTaxVsCurrent = indexedTax - discountedTax
    const extraTaxPct = discountedTax > 0 ? (extraTaxVsCurrent / discountedTax) * 100 : 0
    const ratioVsCurrent = discountedTax > 0 ? indexedTax / discountedTax : 0
    const chartMax = Math.max(discountedTax, indexedTax, noDiscountTax, futureValue, 1)

    return {
      futureValue,
      nominalGain,
      indexedCostBase,
      indexedGain,
      discountedTax,
      indexedTax,
      noDiscountTax,
      afterTaxCurrent,
      afterTaxIndexed,
      afterTaxNoDiscount,
      extraTaxVsCurrent,
      extraTaxPct,
      ratioVsCurrent,
      chartMax,
    }
  }, [annualReturnPct, inflationPct, marginalTaxPct, principal, yearsHeld])

  return (
    <main className="min-h-screen bg-bg">
      <div className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        <header className="mb-6 card-brutal card-main p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-black">
                CGT COMPOUNDING
                <br />
                STRESS TEST
              </h1>
              <p className="mt-3 max-w-4xl text-sm sm:text-lg font-medium text-black">
                A one-page calculator for testing long-horizon Australian capital gains outcomes under the
                current 50% discount, an illustrative inflation-indexed cost-base scenario, and a no-discount
                reference case. Sources are Australian government publications only.
              </p>
            </div>
            <ThemeToggle />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="badge-brutal bg-white text-[10px] sm:text-xs">Australian sources only</span>
            <span className="badge-brutal bg-white text-[10px] sm:text-xs">Interactive scenarios</span>
            <span className="badge-brutal bg-white text-[10px] sm:text-xs">Neutral framing</span>
            <span className="badge-brutal bg-white text-[10px] sm:text-xs">Cloudflare deployable</span>
          </div>
        </header>

        <section className="mb-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card-brutal p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wide">
                  Scenarios
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-foreground-muted">
                  Use the presets, then drag the sliders to see how quickly the headline shifts once you
                  change returns, inflation, holding periods or tax rate.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {SCENARIOS.map((scenario) => (
                <div
                  key={scenario.key}
                  className={`card-brutal p-4 ${
                    activeScenario === scenario.key ? 'bg-main' : 'bg-white'
                  }`}
                >
                  <button
                    onClick={() => {
                      setActiveScenario(scenario.key)
                      applyScenario(
                        {
                          setPrincipal,
                          setAnnualReturnPct,
                          setYearsHeld,
                          setInflationPct,
                          setMarginalTaxPct,
                        },
                        scenario
                      )
                    }}
                    className="w-full text-left brutal-hover"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm font-black">{scenario.name}</p>
                      <span className={`badge-brutal text-[10px] sm:text-xs ${
                        scenario.assessmentTone === 'success'
                          ? 'badge-success'
                          : scenario.assessmentTone === 'warning'
                            ? 'badge-warning'
                            : 'badge-danger'
                      }`}>
                        {scenario.assessmentLabel}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-foreground-muted">{scenario.description}</p>
                    <p className="mt-3 text-[11px] sm:text-xs font-medium text-foreground-muted">
                      {scenario.assessmentReason}
                    </p>
                  </button>

                  <div className="mt-3 border-t-2 border-black/15 pt-3">
                    <p className="text-[10px] sm:text-xs font-black uppercase tracking-wide text-foreground-muted">
                      Source basis
                    </p>
                    <div className="mt-2 space-y-2">
                      {scenario.sources.map((source) => (
                        <a
                          key={`${scenario.key}-${source.label}`}
                          href={source.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-[11px] sm:text-xs brutal-hover"
                        >
                          <span className="font-black link-brutal">{source.label}</span>
                          <span className="text-foreground-muted"> — {source.quote}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <InputCard label="Initial investment" value={principal} setValue={setPrincipal} min={1000} max={500000} step={1000} format={formatCurrency} />
              <InputCard label="Annual return" value={annualReturnPct} setValue={setAnnualReturnPct} min={1} max={25} step={0.5} format={formatPercent} />
              <InputCard label="Holding period" value={yearsHeld} setValue={setYearsHeld} min={1} max={60} step={1} format={(v) => `${v.toFixed(0)} years`} />
              <InputCard label="Inflation assumption" value={inflationPct} setValue={setInflationPct} min={0} max={10} step={0.1} format={formatPercent} />
              <InputCard label="Marginal tax rate" value={marginalTaxPct} setValue={setMarginalTaxPct} min={0} max={60} step={0.5} format={formatPercent} wide />
            </div>
          </div>

          <div className="card-brutal card-purple p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wide text-black">
              Outcome Snapshot
            </h2>
            <div className="mt-4 grid gap-3">
              <MetricCard label="Portfolio value" value={formatCurrency(derived.futureValue)} tone="main" />
              <MetricCard label="Nominal capital gain" value={formatCurrency(derived.nominalGain)} tone="success" />
              <MetricCard label="Indexed cost base" value={formatCurrency(derived.indexedCostBase)} tone="warning" />
              <MetricCard label="Extra tax vs current" value={formatCurrency(derived.extraTaxVsCurrent)} tone="danger" />
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
          <div className="card-brutal p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wide">
              Tax Comparison Graph
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-foreground-muted">
              The graph below compares tax paid and after-tax wealth across the three treatments for the current
              scenario. It assumes a single realization event and a single marginal tax rate.
            </p>

            <div className="mt-5 space-y-4">
              <ScenarioBar
                label="Current 50% discount"
                tax={derived.discountedTax}
                afterTax={derived.afterTaxCurrent}
                taxPct={(derived.discountedTax / derived.chartMax) * 100}
                wealthPct={(derived.afterTaxCurrent / derived.chartMax) * 100}
                tone="success"
              />
              <ScenarioBar
                label="Illustrative indexation"
                tax={derived.indexedTax}
                afterTax={derived.afterTaxIndexed}
                taxPct={(derived.indexedTax / derived.chartMax) * 100}
                wealthPct={(derived.afterTaxIndexed / derived.chartMax) * 100}
                tone="danger"
              />
              <ScenarioBar
                label="No discount, no indexation"
                tax={derived.noDiscountTax}
                afterTax={derived.afterTaxNoDiscount}
                taxPct={(derived.noDiscountTax / derived.chartMax) * 100}
                wealthPct={(derived.afterTaxNoDiscount / derived.chartMax) * 100}
                tone="warning"
              />
            </div>
          </div>

          <div className="card-brutal card-bg-alt p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wide">
              Headline Readout
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <MetricCard label="Tax under current law" value={formatCompactCurrency(derived.discountedTax)} tone="success" />
              <MetricCard label="Tax under indexation" value={formatCompactCurrency(derived.indexedTax)} tone="danger" />
              <MetricCard label="Increase vs current" value={formatPercent(derived.extraTaxPct)} tone="warning" />
              <MetricCard label="Multiple of current tax" value={derived.ratioVsCurrent > 0 ? `${derived.ratioVsCurrent.toFixed(2)}x` : 'n/a'} tone="main" />
            </div>

            <div className="mt-5 card-brutal bg-white p-4">
              <p className="text-sm sm:text-base font-bold">
                In this scenario, current-law tax is{' '}
                <span className="text-green-700">{formatCurrency(derived.discountedTax)}</span>,
                versus{' '}
                <span className="text-red-700">{formatCurrency(derived.indexedTax)}</span>
                {' '}under the illustrative indexation treatment.
              </p>
              <p className="mt-3 text-xs sm:text-sm text-foreground-muted">
                That is an additional <strong>{formatCurrency(derived.extraTaxVsCurrent)}</strong> and
                {' '}roughly <strong>{derived.ratioVsCurrent.toFixed(2)}x</strong> the tax take.
              </p>
            </div>

            <div className="mt-4 card-brutal bg-white p-4">
              <p className="text-[11px] sm:text-xs font-black uppercase tracking-wide text-foreground-muted">
                Important limitation
              </p>
              <p className="mt-2 text-xs sm:text-sm text-foreground-muted">
                This page is a sensitivity tool, not a tax ruling. It does not by itself prove any live policy
                package, age-cohort incidence, capital flight, or business response.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="card-brutal card-main p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wide text-black">
              What The Official Data Says
            </h2>
            <p className="mt-1 max-w-4xl text-xs sm:text-sm text-black/80">
              If the claim is that the 50% CGT discount mainly protects young Australians building wealth,
              the published age and income splits do not support it.
            </p>

            <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="card-brutal bg-white p-4 sm:p-5">
                <p className="text-[11px] sm:text-xs font-black uppercase tracking-wide text-foreground-muted">
                  Official distributional facts
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <MetricCard label="Top 10% of income earners" value="82% of CGT discount tax savings" tone="success" />
                  <MetricCard label="Top 1% of income earners" value="59% of CGT discount tax savings" tone="danger" />
                  <MetricCard label="Ages 18 to 34 combined" value="4% of CGT discount tax savings" tone="warning" />
                  <MetricCard label="Ages 60 and over combined" value="52% of CGT discount tax savings" tone="main" />
                </div>
                <p className="mt-4 text-xs sm:text-sm text-foreground-muted">
                  Income concentration comes from the PBO&apos;s 2025–26 distribution tables. The age split comes from
                  Treasury&apos;s TEIS chart data for the CGT discount.
                </p>
              </div>

              <div className="card-brutal bg-white p-4 sm:p-5">
                <p className="text-[11px] sm:text-xs font-black uppercase tracking-wide text-foreground-muted">
                  Interpretation
                </p>
                <p className="mt-3 text-sm sm:text-base font-bold">
                  On the published government data, the current discount is overwhelmingly an older and
                  higher-income tax concession, not a concession mainly used by young Australians.
                </p>
                <p className="mt-3 text-xs sm:text-sm text-foreground-muted">
                  That makes the “this is protecting young Australians trying to get ahead” framing hard to
                  sustain on the official distributional evidence alone.
                </p>
                <p className="mt-3 text-xs sm:text-sm text-foreground-muted">
                  The harder debate is elsewhere: founder exits, small business treatment, transition design,
                  compliance complexity, and how any replacement regime should distinguish productive
                  long-term investment from pure windfall gains.
                </p>
                <div className="mt-4">
                  <span className="badge-brutal badge-warning text-[10px] sm:text-xs">
                    Strong argument about who benefits now; weaker argument about every future behavioural effect
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="card-brutal card-purple p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wide text-black">
              Which Claims Matter Most?
            </h2>
            <div className="mt-3 card-brutal card-warning p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge-brutal badge-danger text-[10px] sm:text-xs">Claim-check lens</span>
              </div>
              <p className="mt-3 text-xs sm:text-sm font-medium text-black">
                This matrix separates the claims that are already well supported by official data from the ones
                that are important but still need stronger evidence.
              </p>
            </div>

            <div className="mt-5 overflow-x-auto">
              <div className="min-w-[760px]">
                <div className="mb-2 grid grid-cols-[140px_1fr_1fr] gap-3">
                  <div />
                  <div className="card-brutal card-danger p-2 text-center text-[11px] sm:text-xs font-black uppercase tracking-wide">
                    Weak Evidence
                  </div>
                  <div className="card-brutal card-success p-2 text-center text-[11px] sm:text-xs font-black uppercase tracking-wide">
                    Strong Evidence
                  </div>
                </div>

                <div className="grid grid-cols-[140px_1fr_1fr] gap-3">
                  <div className="flex items-center justify-center card-brutal card-success p-3 text-center text-[11px] sm:text-xs font-black uppercase tracking-wide">
                    High Policy Importance
                  </div>

                  <div className="card-brutal card-warning p-4">
                    <p className="text-sm font-black">Important but unresolved</p>
                    <ul className="mt-3 space-y-2 text-xs sm:text-sm">
                      <li>Founder exits and startup treatment under any replacement regime.</li>
                      <li>Small business and farm transition design.</li>
                      <li>Whether capital would shift offshore or into low-productivity assets.</li>
                    </ul>
                  </div>

                  <div className="card-brutal card-success p-4">
                    <p className="text-sm font-black">Act on this evidence</p>
                    <ul className="mt-3 space-y-2 text-xs sm:text-sm">
                      <li>Top `10%` of income earners receive `82%` of the CGT discount benefit.</li>
                      <li>Top `1%` alone receives `59%`.</li>
                      <li>Ages `18–34` receive `4%`, while ages `60+` receive `52%`.</li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-center card-brutal card-danger p-3 text-center text-[11px] sm:text-xs font-black uppercase tracking-wide">
                    Lower Policy Importance
                  </div>

                  <div className="card-brutal card-danger p-4">
                    <p className="text-sm font-black">Rhetorical overreach</p>
                    <ul className="mt-3 space-y-2 text-xs sm:text-sm">
                      <li>Sweeping claims that young Australians are the main direct beneficiaries of the current discount.</li>
                      <li>Confident predictions about investor behaviour without behavioural evidence.</li>
                    </ul>
                  </div>

                  <div className="card-brutal card-main p-4">
                    <p className="text-sm font-black">Interesting, but secondary</p>
                    <ul className="mt-3 space-y-2 text-xs sm:text-sm">
                      <li>Asset-class splits across property, shares, trusts and other assets.</li>
                      <li>Recipient counts by narrow age bucket.</li>
                      <li>Average effect per recipient, where distributional concentration already tells the main story.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="card-brutal p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wide">
              Government Stats Panel
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-foreground-muted">
              These are the strongest source-backed anchor stats for a first public version of the page.
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {SOURCE_CARDS.map((card) => (
                <a
                  key={card.label}
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-brutal bg-white p-4 brutal-hover"
                >
                  <p className="text-[11px] sm:text-xs font-black uppercase tracking-wide text-foreground-muted">
                    {card.label}
                  </p>
                  <p className="mt-2 text-2xl sm:text-3xl font-extrabold">{card.stat}</p>
                  <p className="mt-2 text-xs sm:text-sm text-foreground-muted">{card.caption}</p>
                  <span className="mt-3 inline-flex badge-brutal text-[10px] sm:text-xs">{card.note}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="card-brutal p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wide">
              Which Arguments Are Strongest?
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-foreground-muted">
              Read this as a confidence ladder. The first row is well supported by official data. The last row
              is where the rhetoric outruns what public government datasets can currently prove.
            </p>
            <div className="mt-4 space-y-3">
              <EvidenceRow
                title="Well supported by official data"
                tone="success"
                text="The clearest case is about who benefits from the current CGT discount now: the gains are heavily concentrated at the top of the income distribution, and the policy sits beside a much larger tax preference for owner-occupied housing."
              />
              <EvidenceRow
                title="Plausible, but not proven here"
                tone="warning"
                text="It is reasonable to argue that weaker CGT incentives could push some capital toward housing, deposits, or other lower-risk parking spots. But the public data on this page frames that risk; it does not prove investors would respond that way."
              />
              <EvidenceRow
                title="Big claim, weak evidence base"
                tone="danger"
                text="Claims about intergenerational betrayal, startup damage, farm and small-business harm, or capital fleeing offshore are much harder to substantiate from public tables alone. Those claims need linked datasets, behavioural evidence, or custom official tabulations."
              />
            </div>
          </div>

          <div className="card-brutal card-main p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wide text-black">
              References
            </h2>
            <div className="mt-4 space-y-3">
              {REFERENCE_LINKS.map((ref) => (
                <a
                  key={ref.title}
                  href={ref.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card-brutal block bg-white p-4 brutal-hover"
                >
                  <p className="text-sm sm:text-base font-black">{ref.title}</p>
                  <p className="mt-2 text-xs sm:text-sm text-foreground-muted">{ref.detail}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </main>
  )
}

function InputCard({
  label,
  value,
  setValue,
  min,
  max,
  step,
  format,
  wide = false,
}: {
  label: string
  value: number
  setValue: (value: number) => void
  min: number
  max: number
  step: number
  format: (value: number) => string
  wide?: boolean
}) {
  return (
    <div className={`card-brutal bg-white p-4 ${wide ? 'sm:col-span-2' : ''}`}>
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs sm:text-sm font-black uppercase tracking-wide">{label}</label>
        <span className="badge-brutal badge-main text-[10px] sm:text-xs">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => setValue(Number(event.target.value))}
        className="mt-4 w-full accent-black"
      />
      <div className="mt-2 flex justify-between text-[10px] sm:text-xs text-foreground-faint">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'main' | 'success' | 'warning' | 'danger'
}) {
  return (
    <div className="card-brutal bg-white p-4">
      <p className="text-[11px] sm:text-xs font-black uppercase tracking-wide text-foreground-muted">{label}</p>
      <p className="mt-2 text-xl sm:text-2xl font-extrabold">{value}</p>
    </div>
  )
}

function ScenarioBar({
  label,
  tax,
  afterTax,
  taxPct,
  wealthPct,
  tone,
}: {
  label: string
  tax: number
  afterTax: number
  taxPct: number
  wealthPct: number
  tone: 'success' | 'warning' | 'danger'
}) {
  const toneMap = {
    success: 'var(--success)',
    warning: 'var(--warning)',
    danger: 'var(--danger)',
  }[tone]

  return (
    <div className="card-brutal bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-sm sm:text-base font-black">{label}</p>
        <div className="flex gap-2">
          <span className="badge-brutal text-[10px] sm:text-xs">Tax {formatCompactCurrency(tax)}</span>
          <span className="badge-brutal badge-main text-[10px] sm:text-xs">Wealth {formatCompactCurrency(afterTax)}</span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <div className="mb-1 flex justify-between text-[10px] sm:text-xs font-bold">
            <span>Tax paid</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="h-5 w-full overflow-hidden rounded-[5px] border-2 border-black bg-bg">
            <div style={{ width: `${Math.min(taxPct, 100)}%`, backgroundColor: toneMap }} className="h-full border-r-2 border-black" />
          </div>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-[10px] sm:text-xs font-bold">
            <span>After-tax wealth</span>
            <span>{formatCurrency(afterTax)}</span>
          </div>
          <div className="h-5 w-full overflow-hidden rounded-[5px] border-2 border-black bg-bg">
            <div style={{ width: `${Math.min(wealthPct, 100)}%`, backgroundColor: 'var(--main)' }} className="h-full border-r-2 border-black" />
          </div>
        </div>
      </div>
    </div>
  )
}

function EvidenceRow({
  title,
  text,
  tone,
}: {
  title: string
  text: string
  tone: 'success' | 'warning' | 'danger'
}) {
  const badgeClass = {
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
  }[tone]

  return (
    <div className="card-brutal bg-white p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className={`badge-brutal ${badgeClass} text-[10px] sm:text-xs`}>{title}</span>
      </div>
      <p className="mt-3 text-xs sm:text-sm text-foreground-muted">{text}</p>
    </div>
  )
}
