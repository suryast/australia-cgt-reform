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

type AdvancedScenario = {
  key: string
  name: string
  description: string
  principal: number
  annualReturnPct: number
  yearsHeld: number
  inflationPct: number
  marginalTaxPct: number
  grandfatheredGainPct: number
  applyFifteenYearExemption: boolean
  applyActiveAssetReduction: boolean
  retirementExemptionAmount: number
  annualNegativeGearingLoss: number
  negativeGearingRemovedUnderReform: boolean
  assessmentLabel: string
  assessmentTone: 'success' | 'warning' | 'danger'
}

type TaxRatePresetKey = 'lower' | 'middle' | 'upper' | 'top' | 'custom'

const TAX_RATE_PRESETS: Array<{
  key: TaxRatePresetKey
  label: string
  value: number
}> = [
  { key: 'lower', label: 'Lower bracket', value: 19 },
  { key: 'middle', label: 'Middle bracket', value: 32 },
  { key: 'upper', label: 'Upper bracket', value: 39 },
  { key: 'top', label: 'Top + Medicare', value: 47 },
  { key: 'custom', label: 'Custom', value: 0 },
]

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

const ADVANCED_SCENARIOS: AdvancedScenario[] = [
  {
    key: 'founder-retirement',
    name: 'Founder with 152 relief',
    description: '$1m base, 12% p.a., 10 years, top rate, active asset reduction + $500k retirement exemption.',
    principal: 1000000,
    annualReturnPct: 12,
    yearsHeld: 10,
    inflationPct: 2.5,
    marginalTaxPct: 47,
    grandfatheredGainPct: 0,
    applyFifteenYearExemption: false,
    applyActiveAssetReduction: true,
    retirementExemptionAmount: 500000,
    annualNegativeGearingLoss: 0,
    negativeGearingRemovedUnderReform: true,
    assessmentLabel: 'Founder case',
    assessmentTone: 'success',
  },
  {
    key: 'partial-grandfathering',
    name: 'Part-grandfathered investor',
    description: '$100k base, 9% p.a., 15 years, 39% rate, 60% of gain grandfathered.',
    principal: 100000,
    annualReturnPct: 9,
    yearsHeld: 15,
    inflationPct: 2.8,
    marginalTaxPct: 39,
    grandfatheredGainPct: 60,
    applyFifteenYearExemption: false,
    applyActiveAssetReduction: false,
    retirementExemptionAmount: 0,
    annualNegativeGearingLoss: 0,
    negativeGearingRemovedUnderReform: true,
    assessmentLabel: 'Transition case',
    assessmentTone: 'warning',
  },
  {
    key: 'property-negative-gearing',
    name: 'Property with NG offset',
    description: '$150k equity, 7% p.a., 12 years, top rate, $18k annual rental loss offset removed under reform.',
    principal: 150000,
    annualReturnPct: 7,
    yearsHeld: 12,
    inflationPct: 3,
    marginalTaxPct: 47,
    grandfatheredGainPct: 30,
    applyFifteenYearExemption: false,
    applyActiveAssetReduction: false,
    retirementExemptionAmount: 0,
    annualNegativeGearingLoss: 18000,
    negativeGearingRemovedUnderReform: true,
    assessmentLabel: 'Property case',
    assessmentTone: 'danger',
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

const CLAIM_CHECKS = [
  {
    title: 'Founder exit claim',
    verdict: 'Upper-bound example, not the representative founder case',
    tone: 'warning' as const,
    body:
      'A “$225k worse off on a $1m business sale” result broadly matches a founder on the top marginal rate with no Subdivision 152 relief. But Division 152 can materially change the result for eligible active business assets.',
    bullets: [
      'The calculator currently does not model the 50% active asset reduction, the retirement exemption, the 15-year exemption, or the rollover.',
      'For an eligible active asset, the general 50% discount can interact with the small-business concessions, so a founder may be nowhere near the simple $235k extra-tax path.',
      'That means founder examples should be framed as “without Division 152 concessions” unless the scenario explicitly proves they do not apply.',
    ],
    sources: [
      {
        label: 'ATO small business CGT concessions',
        href: 'https://www.ato.gov.au/law/view/view.htm?docid=SAV/CGTCONCESSIONS/00001',
      },
      {
        label: 'AustLII Subdivision 152-D',
        href: 'https://classic.austlii.edu.au/au/legis/cth/consol_act/itaa1997240/s152.300.html',
      },
    ],
  },
  {
    title: 'ETF and property headline losses',
    verdict: 'Mechanically possible, but highly assumption-sensitive',
    tone: 'warning' as const,
    body:
      'Large “after-tax wealth lost” numbers depend on marginal rate, holding period, inflation, and transition design. They should not be presented as generic investor outcomes without those assumptions sitting in the same sentence.',
    bullets: [
      'At the current top marginal rate, no-grandfathering and no offset assumptions produce the largest deltas. More typical rates compress the headline sharply.',
      'Reported budget design is still unsettled. ABC reported full grandfathering for negative gearing and reported that accrued gains on existing assets may retain the old CGT treatment up to a cutoff date.',
      'The calculator also does not model carried capital losses, loss quarantining, or any property-specific offset settings.',
    ],
    sources: [
      {
        label: 'ABC budget reporting',
        href: 'https://www.abc.net.au/news/2026-05-05/labor-to-change-cgt-negative-gearing-and-trusts-in-budget/106640096',
      },
      {
        label: 'PBO operation of the CGT discount',
        href: 'https://www.pbo.gov.au/publications-and-data/publications/costings/operation-CGT-discount',
      },
    ],
  },
  {
    title: '“Money goes to housing instead”',
    verdict: 'Too strong if CGT and negative gearing move together',
    tone: 'danger' as const,
    body:
      'If the reported package pares back both the CGT discount and negative gearing, the simple story that capital will just rush into leveraged housing is weaker than the post suggests.',
    bullets: [
      'A joint package changes both sides of the housing-investor tax advantage, so the substitution story depends on detailed design rather than slogan logic.',
      'The stronger official-data point is narrower: owner-occupied housing still sits beside a very large tax preference compared with taxable investments.',
      'That makes “housing remains favoured” easier to defend than “this package pushes money into housing” in the absence of behavioural evidence.',
    ],
    sources: [
      {
        label: 'ABC on linked CGT and negative gearing changes',
        href: 'https://www.abc.net.au/news/2026-05-05/labor-to-change-cgt-negative-gearing-and-trusts-in-budget/106640096',
      },
      {
        label: 'Treasury TEIS publication',
        href: 'https://treasury.gov.au/publication/p2025-721342',
      },
    ],
  },
  {
    title: '“This hits anyone trying to build wealth”',
    verdict: 'Conflicts with the strongest published distribution data',
    tone: 'success' as const,
    body:
      'The broad “anyone building long-term wealth” framing sits awkwardly with the official distribution tables. The clearest public evidence says the current discount is concentrated among higher-income and older Australians.',
    bullets: [
      'The PBO says the top 10% receive 82% of the benefit and the top 1% receive about 59%.',
      'Treasury chart data shows ages 18 to 34 receive about 4% of the CGT discount tax savings, while ages 60+ receive about 52%.',
      'That does not mean younger or middle-income investors never use the discount. It means the current concession is not mainly flowing to them.',
    ],
    sources: [
      {
        label: 'PBO distribution tables',
        href: 'https://www.pbo.gov.au/sites/default/files/2026-02/PBO%20-%20Operation%20of%20the%20CGT%20discount.pdf',
      },
      {
        label: 'Treasury TEIS chart workbook',
        href: 'https://treasury.gov.au/sites/default/files/2025-12/p2025-721342-chart-data.xlsx',
      },
    ],
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

function applyAdvancedScenario(setters: {
  setPrincipal: (v: number) => void
  setAnnualReturnPct: (v: number) => void
  setYearsHeld: (v: number) => void
  setInflationPct: (v: number) => void
  setMarginalTaxPct: (v: number) => void
  setGrandfatheredGainPct: (v: number) => void
  setApplyFifteenYearExemption: (v: boolean) => void
  setApplyActiveAssetReduction: (v: boolean) => void
  setRetirementExemptionAmount: (v: number) => void
  setAnnualNegativeGearingLoss: (v: number) => void
  setNegativeGearingRemovedUnderReform: (v: boolean) => void
  setAdvancedMode: (v: boolean) => void
}, scenario: AdvancedScenario) {
  setters.setAdvancedMode(true)
  setters.setPrincipal(scenario.principal)
  setters.setAnnualReturnPct(scenario.annualReturnPct)
  setters.setYearsHeld(scenario.yearsHeld)
  setters.setInflationPct(scenario.inflationPct)
  setters.setMarginalTaxPct(scenario.marginalTaxPct)
  setters.setGrandfatheredGainPct(scenario.grandfatheredGainPct)
  setters.setApplyFifteenYearExemption(scenario.applyFifteenYearExemption)
  setters.setApplyActiveAssetReduction(scenario.applyActiveAssetReduction)
  setters.setRetirementExemptionAmount(scenario.retirementExemptionAmount)
  setters.setAnnualNegativeGearingLoss(scenario.annualNegativeGearingLoss)
  setters.setNegativeGearingRemovedUnderReform(scenario.negativeGearingRemovedUnderReform)
}

export default function HomePageClient() {
  const [principal, setPrincipal] = useState(SCENARIOS[0].principal)
  const [annualReturnPct, setAnnualReturnPct] = useState(SCENARIOS[0].annualReturnPct)
  const [yearsHeld, setYearsHeld] = useState(SCENARIOS[0].yearsHeld)
  const [inflationPct, setInflationPct] = useState(SCENARIOS[0].inflationPct)
  const [marginalTaxPct, setMarginalTaxPct] = useState(SCENARIOS[0].marginalTaxPct)
  const [taxRatePreset, setTaxRatePreset] = useState<TaxRatePresetKey>('top')
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>('ambition')
  const [advancedMode, setAdvancedMode] = useState(false)
  const [grandfatheredGainPct, setGrandfatheredGainPct] = useState(0)
  const [applyFifteenYearExemption, setApplyFifteenYearExemption] = useState(false)
  const [applyActiveAssetReduction, setApplyActiveAssetReduction] = useState(false)
  const [retirementExemptionAmount, setRetirementExemptionAmount] = useState(0)
  const [annualNegativeGearingLoss, setAnnualNegativeGearingLoss] = useState(0)
  const [negativeGearingRemovedUnderReform, setNegativeGearingRemovedUnderReform] = useState(true)

  const derived = useMemo(() => {
    const annualReturn = annualReturnPct / 100
    const inflation = inflationPct / 100
    const marginalTaxRate = marginalTaxPct / 100

    const futureValue = principal * Math.pow(1 + annualReturn, yearsHeld)
    const nominalGain = Math.max(futureValue - principal, 0)
    const indexedCostBase = principal * Math.pow(1 + inflation, yearsHeld)
    const indexedGain = Math.max(futureValue - indexedCostBase, 0)

    const grandfatheredShare = advancedMode ? grandfatheredGainPct / 100 : 0
    const grandfatheredNominalGain = nominalGain * grandfatheredShare
    const reformNominalGain = nominalGain - grandfatheredNominalGain
    const reformIndexedGain = indexedGain * (1 - grandfatheredShare)

    const currentDiscountedGain = nominalGain * 0.5
    const indexedScenarioGain = grandfatheredNominalGain * 0.5 + reformIndexedGain
    const noDiscountScenarioGain = grandfatheredNominalGain * 0.5 + reformNominalGain

    const applySubdivision152Concessions = (grossGain: number) => {
      if (!advancedMode) return grossGain
      if (applyFifteenYearExemption) return 0

      let adjustedGain = grossGain
      if (applyActiveAssetReduction) {
        adjustedGain *= 0.5
      }

      adjustedGain = Math.max(adjustedGain - retirementExemptionAmount, 0)
      return adjustedGain
    }

    const taxableCurrentGain = applySubdivision152Concessions(currentDiscountedGain)
    const taxableIndexedGain = applySubdivision152Concessions(indexedScenarioGain)
    const taxableNoDiscountGain = applySubdivision152Concessions(noDiscountScenarioGain)

    const discountedTax = taxableCurrentGain * marginalTaxRate
    const indexedTax = taxableIndexedGain * marginalTaxRate
    const noDiscountTax = taxableNoDiscountGain * marginalTaxRate

    const negativeGearingTaxBenefit = advancedMode
      ? annualNegativeGearingLoss * yearsHeld * marginalTaxRate
      : 0
    const reformNegativeGearingBenefit = negativeGearingRemovedUnderReform ? 0 : negativeGearingTaxBenefit

    const afterTaxCurrent = futureValue - discountedTax + negativeGearingTaxBenefit
    const afterTaxIndexed = futureValue - indexedTax + reformNegativeGearingBenefit
    const afterTaxNoDiscount = futureValue - noDiscountTax + reformNegativeGearingBenefit

    const extraTaxVsCurrent = indexedTax - discountedTax + (negativeGearingTaxBenefit - reformNegativeGearingBenefit)
    const extraTaxPct = discountedTax > 0 ? (extraTaxVsCurrent / discountedTax) * 100 : 0
    const ratioVsCurrent = discountedTax > 0 ? indexedTax / discountedTax : 0
    const chartMax = Math.max(
      discountedTax,
      indexedTax,
      noDiscountTax,
      afterTaxCurrent,
      afterTaxIndexed,
      afterTaxNoDiscount,
      futureValue,
      1
    )

    return {
      futureValue,
      nominalGain,
      indexedCostBase,
      indexedGain,
      taxableCurrentGain,
      taxableIndexedGain,
      taxableNoDiscountGain,
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
      grandfatheredNominalGain,
      reformIndexedGain,
      negativeGearingTaxBenefit,
      reformNegativeGearingBenefit,
    }
  }, [
    advancedMode,
    annualNegativeGearingLoss,
    annualReturnPct,
    applyActiveAssetReduction,
    applyFifteenYearExemption,
    grandfatheredGainPct,
    inflationPct,
    marginalTaxPct,
    negativeGearingRemovedUnderReform,
    principal,
    retirementExemptionAmount,
    yearsHeld,
  ])

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

        <section className="mb-6">
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
                      setTaxRatePreset('custom')
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

            <div className="mt-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-base sm:text-xl font-black uppercase tracking-wide">
                    Advanced Scenario Cards
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-foreground-muted">
                    Use these when you want the calculator to prefill founder relief, transition, or property-style assumptions.
                  </p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {ADVANCED_SCENARIOS.map((scenario) => (
                  <div key={scenario.key} className="card-brutal card-bg-alt p-4">
                    <button
                      onClick={() => {
                        applyAdvancedScenario(
                          {
                            setPrincipal,
                            setAnnualReturnPct,
                            setYearsHeld,
                            setInflationPct,
                            setMarginalTaxPct,
                            setGrandfatheredGainPct,
                            setApplyFifteenYearExemption,
                            setApplyActiveAssetReduction,
                            setRetirementExemptionAmount,
                            setAnnualNegativeGearingLoss,
                            setNegativeGearingRemovedUnderReform,
                            setAdvancedMode,
                          },
                          scenario
                        )
                        setTaxRatePreset('custom')
                        setActiveScenario('moderate')
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
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 card-brutal card-purple p-4 sm:p-6">
              <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wide text-black">
                Outcome Snapshot
              </h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Portfolio value" value={formatCurrency(derived.futureValue)} tone="main" />
                <MetricCard label="Nominal capital gain" value={formatCurrency(derived.nominalGain)} tone="success" />
                <MetricCard label="Indexed cost base" value={formatCurrency(derived.indexedCostBase)} tone="warning" />
                <MetricCard
                  label={advancedMode ? 'Combined drag vs current' : 'Extra tax vs current'}
                  value={formatCurrency(derived.extraTaxVsCurrent)}
                  tone="danger"
                />
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <InputCard label="Initial investment" value={principal} setValue={setPrincipal} min={1000} max={500000} step={1000} format={formatCurrency} />
              <InputCard label="Annual return" value={annualReturnPct} setValue={setAnnualReturnPct} min={1} max={25} step={0.5} format={formatPercent} />
              <InputCard label="Holding period" value={yearsHeld} setValue={setYearsHeld} min={1} max={60} step={1} format={(v) => `${v.toFixed(0)} years`} />
              <InputCard label="Inflation assumption" value={inflationPct} setValue={setInflationPct} min={0} max={10} step={0.1} format={formatPercent} />
              <SelectCard
                label="Tax rate preset"
                value={taxRatePreset}
                options={TAX_RATE_PRESETS.map((preset) => ({
                  value: preset.key,
                  label: preset.label,
                }))}
                onChange={(nextValue) => {
                  const nextPreset = nextValue as TaxRatePresetKey
                  setTaxRatePreset(nextPreset)
                  const preset = TAX_RATE_PRESETS.find((entry) => entry.key === nextPreset)
                  if (preset && nextPreset !== 'custom') {
                    setMarginalTaxPct(preset.value)
                  }
                }}
              />
              <InputCard
                label="Marginal tax rate"
                value={marginalTaxPct}
                setValue={(value) => {
                  setTaxRatePreset('custom')
                  setMarginalTaxPct(value)
                }}
                min={0}
                max={60}
                step={0.5}
                format={formatPercent}
                wide
                disabled={taxRatePreset !== 'custom'}
              />
            </div>

            <div className="mt-5 card-brutal bg-bg-alt p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm sm:text-base font-black uppercase tracking-wide">
                    Advanced Assumptions
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-foreground-muted">
                    Turn this on for founder / property-style scenarios with grandfathering, Subdiv 152, and
                    negative gearing assumptions.
                  </p>
                </div>
                <label className="inline-flex items-center gap-2 text-xs sm:text-sm font-black">
                  <input
                    type="checkbox"
                    checked={advancedMode}
                    onChange={(event) => setAdvancedMode(event.target.checked)}
                    className="h-4 w-4 accent-black"
                  />
                  Enable advanced mode
                </label>
              </div>

              {advancedMode ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <InputCard
                    label="Grandfathered gain share"
                    value={grandfatheredGainPct}
                    setValue={setGrandfatheredGainPct}
                    min={0}
                    max={100}
                    step={5}
                    format={formatPercent}
                  />
                  <InputCard
                    label="Retirement exemption used"
                    value={retirementExemptionAmount}
                    setValue={setRetirementExemptionAmount}
                    min={0}
                    max={500000}
                    step={10000}
                    format={formatCurrency}
                  />
                  <InputCard
                    label="Annual negative gearing loss"
                    value={annualNegativeGearingLoss}
                    setValue={setAnnualNegativeGearingLoss}
                    min={0}
                    max={100000}
                    step={1000}
                    format={formatCurrency}
                  />
                  <ToggleCard
                    label="15-year exemption"
                    description="If eligible, zeroes the taxable gain under both current and reform scenarios."
                    checked={applyFifteenYearExemption}
                    setChecked={setApplyFifteenYearExemption}
                  />
                  <ToggleCard
                    label="50% active asset reduction"
                    description="Applies the Subdiv 152 active asset reduction after any general discount."
                    checked={applyActiveAssetReduction}
                    setChecked={setApplyActiveAssetReduction}
                  />
                  <ToggleCard
                    label="Negative gearing removed under reform"
                    description="If on, the reform scenario loses the annual tax offset benefit from deductible rental losses."
                    checked={negativeGearingRemovedUnderReform}
                    setChecked={setNegativeGearingRemovedUnderReform}
                  />
                </div>
              ) : null}
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
              <MetricCard
                label={advancedMode ? 'Combined increase vs current' : 'Increase vs current'}
                value={formatPercent(derived.extraTaxPct)}
                tone="warning"
              />
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

            {advancedMode ? (
              <div className="mt-4 card-brutal bg-white p-4">
                <p className="text-[11px] sm:text-xs font-black uppercase tracking-wide text-foreground-muted">
                  Advanced readout
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <MetricCard label="Grandfathered gain" value={formatCompactCurrency(derived.grandfatheredNominalGain)} tone="main" />
                  <MetricCard label="Reform-period indexed gain" value={formatCompactCurrency(derived.reformIndexedGain)} tone="warning" />
                  <MetricCard label="Current NG tax benefit" value={formatCompactCurrency(derived.negativeGearingTaxBenefit)} tone="success" />
                  <MetricCard label="Reform NG tax benefit" value={formatCompactCurrency(derived.reformNegativeGearingBenefit)} tone="danger" />
                </div>
              </div>
            ) : null}

            <div className="mt-4 card-brutal bg-white p-4">
              <p className="text-[11px] sm:text-xs font-black uppercase tracking-wide text-foreground-muted">
                Modelling boundary
              </p>
              <p className="mt-2 text-xs sm:text-sm text-foreground-muted">
                This page is a sensitivity tool, not a tax ruling. It does not by itself prove any live policy
                package, age-cohort incidence, capital flight, or business response.
              </p>
              <p className="mt-3 text-xs sm:text-sm text-foreground-muted">
                The advanced mode is an approximation layer, not a full tax engine. It applies a simplified
                sequence: grandfathered gain share, then general discount where applicable, then optional
                Subdiv 152 settings, then an optional negative gearing offset delta across the holding period.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="card-brutal p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wide">
              Pressure-Test The Public Claims
            </h2>
            <p className="mt-1 max-w-4xl text-xs sm:text-sm text-foreground-muted">
              These are the main places where a dramatic anti-reform example can outrun what the current model
              or the published public evidence actually establishes.
            </p>

            <div className="mt-5 grid gap-4 xl:grid-cols-2">
              {CLAIM_CHECKS.map((claim) => (
                <div key={claim.title} className="card-brutal bg-white p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm sm:text-base font-black">{claim.title}</p>
                    <span className={`badge-brutal text-[10px] sm:text-xs ${
                      claim.tone === 'success'
                        ? 'badge-success'
                        : claim.tone === 'warning'
                          ? 'badge-warning'
                          : 'badge-danger'
                    }`}>
                      {claim.verdict}
                    </span>
                  </div>
                  <p className="mt-3 text-xs sm:text-sm text-foreground-muted">{claim.body}</p>
                  <ul className="mt-4 space-y-2 text-xs sm:text-sm">
                    {claim.bullets.map((bullet) => (
                      <li key={bullet}>• {bullet}</li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {claim.sources.map((source) => (
                      <a
                        key={`${claim.title}-${source.label}`}
                        href={source.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="badge-brutal bg-bg-alt text-[10px] sm:text-xs brutal-hover"
                      >
                        {source.label}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
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
  disabled = false,
}: {
  label: string
  value: number
  setValue: (value: number) => void
  min: number
  max: number
  step: number
  format: (value: number) => string
  wide?: boolean
  disabled?: boolean
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
        disabled={disabled}
        className="mt-4 w-full accent-black"
      />
      <div className="mt-2 flex justify-between text-[10px] sm:text-xs text-foreground-faint">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  )
}

function SelectCard({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}) {
  return (
    <div className="card-brutal bg-white p-4">
      <label className="text-xs sm:text-sm font-black uppercase tracking-wide">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-4 w-full rounded-[5px] border-2 border-black bg-bg px-3 py-2 text-sm font-medium"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function ToggleCard({
  label,
  description,
  checked,
  setChecked,
}: {
  label: string
  description: string
  checked: boolean
  setChecked: (value: boolean) => void
}) {
  return (
    <label className="card-brutal bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs sm:text-sm font-black uppercase tracking-wide">{label}</p>
          <p className="mt-2 text-xs sm:text-sm text-foreground-muted">{description}</p>
        </div>
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
          className="mt-1 h-4 w-4 accent-black"
        />
      </div>
    </label>
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
