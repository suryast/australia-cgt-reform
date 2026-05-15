'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Footer } from '@/components/Footer'
import { ThemeToggle } from '@/components/ThemeToggle'
import scenarioManifest from '../../shared/factual-au-scenario-manifest.json'

type ScenarioKey = 'ambition' | 'balanced' | 'moderate'
type PropertyType = 'established' | 'new' | 'non-residential'

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
  acquisitionDate: string
  disposalDate: string
  subDiv152Active: boolean
  subDiv152ActiveAsset: boolean
  subDiv152RetirementExemption: boolean
  annualNegativeGearingLoss: number
  userAge: number
  assessmentLabel: string
  assessmentTone: 'success' | 'warning' | 'danger'
}

type TaxRatePresetKey = 'lower' | 'middle' | 'upper' | 'top' | 'custom'

const CUTOFF_DATE = new Date('2027-07-01T00:00:00.000Z')
const NG_CUTOFF_DATE = new Date('2026-05-12T09:30:00.000Z') // 7:30pm AEST = UTC+10
const PRE_CGT_DATE = new Date('1985-09-20T00:00:00.000Z')

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

// CPI data: ABS 6401.0, all-groups Australia, base 2011-12=100
const CPI_ANNUAL: Record<number, number> = {
  1985: 34.5, 1986: 37.3, 1987: 40.3, 1988: 42.5, 1989: 45.5,
  1990: 49.3, 1991: 51.8, 1992: 52.1, 1993: 52.5, 1994: 53.2,
  1995: 55.1, 1996: 57.2, 1997: 57.8, 1998: 58.0, 1999: 59.0,
  2000: 63.1, 2001: 67.0, 2002: 69.5, 2003: 71.7, 2004: 73.6,
  2005: 76.0, 2006: 79.2, 2007: 81.6, 2008: 85.9, 2009: 88.4,
  2010: 91.6, 2011: 95.3, 2012: 98.6, 2013: 102.0, 2014: 105.3,
  2015: 107.4, 2016: 109.3, 2017: 111.6, 2018: 114.0, 2019: 115.8,
  2020: 115.1, 2021: 118.8, 2022: 130.4, 2023: 140.7, 2024: 143.7,
  2025: 147.0, 2026: 150.0, 2027: 153.0, 2028: 156.1, 2029: 159.2,
  2030: 162.4, 2031: 165.7, 2032: 169.0, 2033: 172.4, 2034: 175.8,
  2035: 179.3, 2040: 197.0, 2045: 216.8, 2050: 238.3, 2060: 288.0,
  2076: 380.0,
}

function getCPI(date: Date): number {
  const year = date.getFullYear()
  const frac = date.getMonth() / 12
  const keys = Object.keys(CPI_ANNUAL).map(Number).sort((a, b) => a - b)
  const lo = keys.filter(k => k <= year).at(-1) ?? keys[0]
  const hi = keys.find(k => k > year) ?? lo
  const loVal = CPI_ANNUAL[lo]
  const hiVal = CPI_ANNUAL[hi]
  if (lo === hi) return loVal + (loVal * 0.025 * frac)
  const yearFrac = (year - lo) / (hi - lo)
  const annual = loVal + (hiVal - loVal) * yearFrac
  const nextYearFrac = Math.min((year + 1 - lo) / (hi - lo), 1)
  const nextAnnual = loVal + (hiVal - loVal) * nextYearFrac
  return annual + (nextAnnual - annual) * frac
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
    assessmentLabel: 'High-return assumption',
    assessmentTone: 'danger',
    assessmentReason: 'This is the 15% / 50-year scenario modelled under the legislated From 1 July 2027 regime. The 15% annual return assumption is far above the official retail-investor baseline commonly cited in Australian guidance.',
    sources: [
      {
        label: 'ASIC Moneysmart',
        href: 'https://moneysmart.gov.au/investment-warnings/investment-seminars',
        quote: '"Shares have return around 7% a year"',
      },
      {
        label: 'RBA inflation target',
        href: 'https://www.rba.gov.au/education/resources/explainers/australias-inflation-target.html',
        quote: '"between 2 to 3 per cent"',
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
    assessmentReason: 'The 9% return assumption is plausible for strong long-run growth assets, but it sits above the usual public-policy baseline. Modelled under the legislated From 1 July 2027 regime.',
    sources: [
      {
        label: 'Future Fund FY23',
        href: 'https://yearinreviewfy23.futurefund.gov.au/fy23-performance-results.html',
        quote: '"10-year return of 8.8% per annum"',
      },
      {
        label: 'RBA inflation target',
        href: 'https://www.rba.gov.au/education/resources/explainers/australias-inflation-target.html',
        quote: '"between 2 to 3 per cent"',
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
    assessmentReason: 'The 7% return and 3% inflation assumptions are closest to the mainstream Australian long-run reference points. Modelled under the legislated From 1 July 2027 regime.',
    sources: [
      {
        label: 'ASIC Moneysmart',
        href: 'https://moneysmart.gov.au/investment-warnings/investment-seminars',
        quote: '"Shares have return around 7% a year"',
      },
      {
        label: 'RBA inflation target',
        href: 'https://www.rba.gov.au/education/resources/explainers/australias-inflation-target.html',
        quote: '"between 2 to 3 per cent"',
      },
    ],
  },
]

const ADVANCED_SCENARIOS: AdvancedScenario[] = [
  {
    key: 'founder-retirement',
    name: 'Founder with Subdiv 152 relief',
    description: '$1m base, 12% p.a., 10 years, top rate, active asset reduction + $500k retirement exemption.',
    principal: 1000000,
    annualReturnPct: 12,
    yearsHeld: 10,
    inflationPct: 2.5,
    marginalTaxPct: 47,
    acquisitionDate: '2020-01-01',
    disposalDate: '2030-01-01',
    subDiv152Active: true,
    subDiv152ActiveAsset: true,
    subDiv152RetirementExemption: true,
    annualNegativeGearingLoss: 0,
    userAge: 58,
    assessmentLabel: 'Founder case',
    assessmentTone: 'success',
  },
  {
    key: 'partial-grandfathering',
    name: 'Straddle-the-cutoff investor',
    description: '$100k base, 9% p.a., acquired 2022, disposed 2032, 39% rate — straddles 1 July 2027.',
    principal: 100000,
    annualReturnPct: 9,
    yearsHeld: 10,
    inflationPct: 2.8,
    marginalTaxPct: 39,
    acquisitionDate: '2022-01-01',
    disposalDate: '2032-01-01',
    subDiv152Active: false,
    subDiv152ActiveAsset: false,
    subDiv152RetirementExemption: false,
    annualNegativeGearingLoss: 0,
    userAge: 45,
    assessmentLabel: 'Transition case',
    assessmentTone: 'warning',
  },
  {
    key: 'property-negative-gearing',
    name: 'Property with NG offset',
    description: '$150k equity, 7% p.a., 12 years, top rate, established property acquired post-cutoff.',
    principal: 150000,
    annualReturnPct: 7,
    yearsHeld: 12,
    inflationPct: 3,
    marginalTaxPct: 47,
    acquisitionDate: '2027-09-01',
    disposalDate: '2039-09-01',
    subDiv152Active: false,
    subDiv152ActiveAsset: false,
    subDiv152RetirementExemption: false,
    annualNegativeGearingLoss: 18000,
    userAge: 45,
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
    title: 'Budget Paper 1, Statement 4 — Tax reform for workers, businesses and future generations',
    href: 'https://budget.gov.au/content/bp1/download/bp1-2026-27.pdf',
    detail: 'pp.136–142, Chart 4.5 — distributional rationale and lifetime income concentration of CGT discount benefit.',
  },
  {
    title: 'Budget Paper 2 — Tax Reform: Boosting Home Ownership (CGT and negative gearing)',
    href: 'https://budget.gov.au/content/bp2/download/bp2-2026-27.pdf',
    detail: 'pp.21–22 — full policy detail: 1 July 2027 cutoff, indexation + 30% min tax, grandfathering, NG carve-out for new builds.',
  },
  {
    title: 'Budget Paper 2, p.18 — Expanding venture capital tax incentives',
    href: 'https://budget.gov.au/content/bp2/download/bp2-2026-27.pdf',
    detail: 'ESVCLP and VCLP investee asset and fund size cap increases. Tax-exempt ESVCLP returns unaffected by CGT discount change.',
  },
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
    verdict: 'Subdiv 152 relief now modelled — check advanced mode',
    tone: 'warning' as const,
    body: 'A "$225k worse off on a $1m business sale" result broadly matches a founder on the top marginal rate with no Subdivision 152 relief. The calculator now models the simplified Subdiv 152 stack in advanced mode. The government has indicated consultation on early-stage business treatment is underway.',
    bullets: [
      'Toggle "Asset qualifies as active business asset (Subdiv 152)" in advanced mode to see the Subdivision 152 scenario.',
      'With the 50% active asset reduction and $500k retirement exemption, the tax burden drops significantly.',
      'ESS and early-stage startup treatment remains under consultation and is not yet modelled.',
    ],
    sources: [
      { label: 'ATO small business CGT concessions', href: 'https://www.ato.gov.au/law/view/view.htm?docid=SAV/CGTCONCESSIONS/00001' },
      { label: 'Budget Paper 2, p.21–22', href: 'https://budget.gov.au/content/bp2/download/bp2-2026-27.pdf' },
    ],
  },
  {
    title: 'ETF and property headline losses',
    verdict: 'Grandfathering is now full and date-based',
    tone: 'warning' as const,
    body: 'The legislated design provides full grandfathering: gains on assets acquired before 1 July 2027 remain under the existing 50% CGT discount up to that date. Only post-cutoff gains on post-cutoff acquisitions (or the straddle portion) fall under the new regime.',
    bullets: [
      'Use the acquisition and disposal date inputs to model the straddle-the-cutoff scenario for your situation.',
      'The headline loss numbers are at their largest for fully post-2027 scenarios. For assets already held, only a portion of gain is affected.',
      'The calculator applies a straight-line apportionment for straddle gains. Actual legislation may specify alternative methods.',
    ],
    sources: [
      { label: 'Budget Paper 2, pp.21–22 — full grandfathering confirmed', href: 'https://budget.gov.au/content/bp2/download/bp2-2026-27.pdf' },
      { label: 'PBO operation of the CGT discount', href: 'https://www.pbo.gov.au/publications-and-data/publications/costings/operation-CGT-discount' },
    ],
  },
  {
    title: '"Money goes to housing instead"',
    verdict: 'CGT and negative gearing move together — weaker substitution argument',
    tone: 'danger' as const,
    body: 'The legislated package changes both CGT and negative gearing simultaneously, with a new-build carve-out for negative gearing. The simple story that capital will rush into leveraged housing is weaker when both sides of the housing-investor tax advantage are adjusted together.',
    bullets: [
      'Negative gearing losses on new established residential properties acquired from 12 May 2026 can no longer offset other income — only future rental income or property gains.',
      'New builds retain full negative gearing, creating a deliberate incentive toward new housing supply.',
      'That makes "housing remains favoured" harder to sustain than "this package pushes money into housing" for post-cutoff established property.',
    ],
    sources: [
      { label: 'Budget Paper 2, pp.21–22', href: 'https://budget.gov.au/content/bp2/download/bp2-2026-27.pdf' },
      { label: 'Treasury TEIS publication', href: 'https://treasury.gov.au/publication/p2025-721342' },
    ],
  },
  {
    title: '"This hits anyone trying to build wealth"',
    verdict: 'Conflicts strongly with BP1 Chart 4.5 lifetime distribution data',
    tone: 'success' as const,
    body: 'The official distributional data shows the current CGT discount is concentrated among higher-income and older Australians — not broadly spread across wealth-builders. Budget Paper 1 Chart 4.5 shows the top 1% by lifetime income received over $700,000 cumulative benefit from the discount since 2000.',
    bullets: [
      'The PBO says the top 10% receive 82% of the CGT discount benefit and the top 1% receive about 59%.',
      'Treasury chart data shows ages 18–34 receive about 4% of the CGT discount tax savings, while ages 60+ receive about 52%.',
      'BP1 Chart 4.5 lifetime income data further concentrates the picture: the discount accrues overwhelmingly over multi-decade horizons at the top.',
    ],
    sources: [
      { label: 'Budget Paper 1, Statement 4, Chart 4.5', href: 'https://budget.gov.au/content/bp1/download/bp1-2026-27.pdf' },
      { label: 'PBO distribution tables', href: 'https://www.pbo.gov.au/sites/default/files/2026-02/PBO%20-%20Operation%20of%20the%20CGT%20discount.pdf' },
      { label: 'Treasury TEIS chart workbook', href: 'https://treasury.gov.au/sites/default/files/2025-12/p2025-721342-chart-data.xlsx' },
    ],
  },
  {
    title: '"30% minimum tax floor catches middle-bracket investors"',
    verdict: 'New wrinkle — adds complexity',
    tone: 'warning' as const,
    body: 'The 30% minimum tax acts as a floor on the post-2027 nominal capital gain, meaning taxpayers on the 32% or 39% marginal rate who benefit most from indexation may still face a higher tax bill than the indexed gain calculation alone would suggest.',
    bullets: [
      'At low marginal rates or with significant inflation, the indexation calculation alone produces tax below 30% of the nominal gain — triggering the floor.',
      'The floor does not apply to income support recipients, including Age Pension recipients.',
      'For middle-bracket investors making moderate real returns over moderate periods, the floor is the binding constraint more often than the marginal rate on the indexed gain.',
    ],
    sources: [
      { label: 'Budget Paper 2, p.21 — minimum tax floor details', href: 'https://budget.gov.au/content/bp2/download/bp2-2026-27.pdf' },
    ],
  },
  {
    title: 'ESS / startup employee treatment',
    verdict: 'Under consultation — not yet resolved',
    tone: 'danger' as const,
    body: 'The treatment of Employee Share Scheme (ESS) shares and early-stage employee equity under the new CGT regime is not yet finalised. Consultation is underway.',
    bullets: [
      'This is a legitimate concern for startup employees who receive equity as part of compensation.',
      'The government has indicated it is aware of the issue and consultation is ongoing.',
      'This calculator does not model ESS carve-outs as the design is not finalised.',
    ],
    sources: [
      { label: 'Budget Paper 2, p.21 — consultation noted', href: 'https://budget.gov.au/content/bp2/download/bp2-2026-27.pdf' },
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

function parseNumberParam(value: string | null): number | null {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function parseBooleanParam(value: string | null): boolean | null {
  if (!value) return null
  if (value === '1' || value.toLowerCase() === 'true') return true
  if (value === '0' || value.toLowerCase() === 'false') return false
  return null
}

function parseDateParam(value: string | null): string | null {
  if (!value) return null
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null
}

function findScenario(key: string | null) {
  if (!key) return null
  return SCENARIOS.find((scenario) => scenario.key === key) ?? null
}

function findAdvancedScenario(key: string | null) {
  if (!key) return null
  return ADVANCED_SCENARIOS.find((scenario) => scenario.key === key) ?? null
}

type CalculatorState = {
  principal: number
  annualReturnPct: number
  yearsHeld: number
  inflationPct: number
  marginalTaxPct: number
  taxRatePreset: TaxRatePresetKey
  activeScenario: ScenarioKey
  advancedMode: boolean
  acquisitionDate: string
  disposalDate: string
  holdingOver12Months: boolean
  isIncomeSupport: boolean
  propertyType: PropertyType
  useDiscountForNewProperty: boolean
  subDiv152Active: boolean
  subDiv152MaxNetAssets: boolean
  subDiv152SmallBizTurnover: boolean
  subDiv152FifteenYearExemption: boolean
  subDiv152RetirementExemption: boolean
  userAge: number
  subDiv152ActiveAsset: boolean
  ngPropertyDate: string
  ngPropertyType: 'established' | 'new'
  annualRentalIncome: number
  annualDeductibleExpenses: number
  otherTaxableIncome: number
  annualNegativeGearingLoss: number
  linkedCaseFileId: string | null
}

const SCENARIO_SCHEMA_VERSION = scenarioManifest.schemaVersion
const SCENARIO_STATE_LIBRARY = scenarioManifest.scenarios as Record<string, Partial<CalculatorState>>

function applyStatePatch(state: CalculatorState, patch: Partial<CalculatorState>) {
  Object.assign(state, patch)
}

function resolveScenarioState(
  scenarioId: string | null,
  schemaVersion: number | null,
) {
  if (!scenarioId) return null
  if (schemaVersion !== null && schemaVersion !== SCENARIO_SCHEMA_VERSION) return null
  return SCENARIO_STATE_LIBRARY[scenarioId] ?? null
}

function buildCalculatorStateFromParams(searchParams: { get: (key: string) => string | null }): CalculatorState {
  const initialScenario = SCENARIOS[0]
  const state: CalculatorState = {
    principal: initialScenario.principal,
    annualReturnPct: initialScenario.annualReturnPct,
    yearsHeld: initialScenario.yearsHeld,
    inflationPct: initialScenario.inflationPct,
    marginalTaxPct: initialScenario.marginalTaxPct,
    taxRatePreset: 'top',
    activeScenario: 'ambition',
    advancedMode: false,
    acquisitionDate: '2020-01-01',
    disposalDate: '2030-01-01',
    holdingOver12Months: true,
    isIncomeSupport: false,
    propertyType: 'non-residential',
    useDiscountForNewProperty: false,
    subDiv152Active: false,
    subDiv152MaxNetAssets: false,
    subDiv152SmallBizTurnover: false,
    subDiv152FifteenYearExemption: false,
    subDiv152RetirementExemption: false,
    userAge: 45,
    subDiv152ActiveAsset: false,
    ngPropertyDate: '2026-01-01',
    ngPropertyType: 'established',
    annualRentalIncome: 30000,
    annualDeductibleExpenses: 42000,
    otherTaxableIncome: 100000,
    annualNegativeGearingLoss: 0,
    linkedCaseFileId: null,
  }

  const scenarioSchemaVersion = parseNumberParam(searchParams.get('schemaVersion'))
  const linkedScenarioState = resolveScenarioState(
    searchParams.get('scenarioId'),
    scenarioSchemaVersion,
  )
  if (linkedScenarioState) applyStatePatch(state, linkedScenarioState)

  const preset = findScenario(searchParams.get('preset'))
  if (preset) {
    state.activeScenario = preset.key
    state.principal = preset.principal
    state.annualReturnPct = preset.annualReturnPct
    state.yearsHeld = preset.yearsHeld
    state.inflationPct = preset.inflationPct
    state.marginalTaxPct = preset.marginalTaxPct
    state.taxRatePreset = 'custom'
  }

  const advancedPreset = findAdvancedScenario(searchParams.get('advancedPreset'))
  if (advancedPreset) {
    state.advancedMode = true
    state.activeScenario = 'moderate'
    state.taxRatePreset = 'custom'
    state.principal = advancedPreset.principal
    state.annualReturnPct = advancedPreset.annualReturnPct
    state.yearsHeld = advancedPreset.yearsHeld
    state.inflationPct = advancedPreset.inflationPct
    state.marginalTaxPct = advancedPreset.marginalTaxPct
    state.acquisitionDate = advancedPreset.acquisitionDate
    state.disposalDate = advancedPreset.disposalDate
    state.subDiv152Active = advancedPreset.subDiv152Active
    state.subDiv152ActiveAsset = advancedPreset.subDiv152ActiveAsset
    state.subDiv152RetirementExemption = advancedPreset.subDiv152RetirementExemption
    state.annualNegativeGearingLoss = advancedPreset.annualNegativeGearingLoss
    state.userAge = advancedPreset.userAge
  }

  const advancedModeParam = parseBooleanParam(searchParams.get('advanced'))
  if (advancedModeParam !== null) state.advancedMode = advancedModeParam

  const taxRatePresetParam = searchParams.get('taxRatePreset')
  const taxRatePresetMatch = TAX_RATE_PRESETS.find((presetEntry) => presetEntry.key === taxRatePresetParam)
  if (taxRatePresetMatch) {
    state.taxRatePreset = taxRatePresetMatch.key
    if (taxRatePresetMatch.key !== 'custom') {
      state.marginalTaxPct = taxRatePresetMatch.value
    }
  }

  const principalParam = parseNumberParam(searchParams.get('principal'))
  if (principalParam !== null) state.principal = principalParam

  const annualReturnParam = parseNumberParam(searchParams.get('annualReturnPct'))
  if (annualReturnParam !== null) state.annualReturnPct = annualReturnParam

  const yearsHeldParam = parseNumberParam(searchParams.get('yearsHeld'))
  if (yearsHeldParam !== null) state.yearsHeld = yearsHeldParam

  const inflationParam = parseNumberParam(searchParams.get('inflationPct'))
  if (inflationParam !== null) state.inflationPct = inflationParam

  const marginalTaxParam = parseNumberParam(searchParams.get('marginalTaxPct'))
  if (marginalTaxParam !== null) {
    state.marginalTaxPct = marginalTaxParam
    state.taxRatePreset = 'custom'
  }

  const acquisitionDateParam = parseDateParam(searchParams.get('acquisitionDate'))
  if (acquisitionDateParam) state.acquisitionDate = acquisitionDateParam

  const disposalDateParam = parseDateParam(searchParams.get('disposalDate'))
  if (disposalDateParam) state.disposalDate = disposalDateParam

  const holdingPeriodParam = parseBooleanParam(searchParams.get('holdingOver12Months'))
  if (holdingPeriodParam !== null) state.holdingOver12Months = holdingPeriodParam

  const incomeSupportParam = parseBooleanParam(searchParams.get('isIncomeSupport'))
  if (incomeSupportParam !== null) state.isIncomeSupport = incomeSupportParam

  const propertyTypeParam = searchParams.get('propertyType')
  if (propertyTypeParam === 'established' || propertyTypeParam === 'new' || propertyTypeParam === 'non-residential') {
    state.propertyType = propertyTypeParam
  }

  const newPropertyDiscountParam = parseBooleanParam(searchParams.get('useDiscountForNewProperty'))
  if (newPropertyDiscountParam !== null) state.useDiscountForNewProperty = newPropertyDiscountParam

  const subDiv152ActiveParam = parseBooleanParam(searchParams.get('subDiv152Active'))
  if (subDiv152ActiveParam !== null) state.subDiv152Active = subDiv152ActiveParam

  const subDiv152MaxNetAssetsParam = parseBooleanParam(searchParams.get('subDiv152MaxNetAssets'))
  if (subDiv152MaxNetAssetsParam !== null) state.subDiv152MaxNetAssets = subDiv152MaxNetAssetsParam

  const subDiv152SmallBizTurnoverParam = parseBooleanParam(searchParams.get('subDiv152SmallBizTurnover'))
  if (subDiv152SmallBizTurnoverParam !== null) state.subDiv152SmallBizTurnover = subDiv152SmallBizTurnoverParam

  const subDiv152FifteenYearParam = parseBooleanParam(searchParams.get('subDiv152FifteenYearExemption'))
  if (subDiv152FifteenYearParam !== null) state.subDiv152FifteenYearExemption = subDiv152FifteenYearParam

  const subDiv152RetirementParam = parseBooleanParam(searchParams.get('subDiv152RetirementExemption'))
  if (subDiv152RetirementParam !== null) state.subDiv152RetirementExemption = subDiv152RetirementParam

  const subDiv152ActiveAssetParam = parseBooleanParam(searchParams.get('subDiv152ActiveAsset'))
  if (subDiv152ActiveAssetParam !== null) state.subDiv152ActiveAsset = subDiv152ActiveAssetParam

  const userAgeParam = parseNumberParam(searchParams.get('userAge'))
  if (userAgeParam !== null) state.userAge = userAgeParam

  const annualNegativeGearingLossParam = parseNumberParam(searchParams.get('annualNegativeGearingLoss'))
  if (annualNegativeGearingLossParam !== null) state.annualNegativeGearingLoss = annualNegativeGearingLossParam

  const linkedCaseFileIdParam = searchParams.get('caseFile')
  if (linkedCaseFileIdParam) state.linkedCaseFileId = linkedCaseFileIdParam

  return state
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
  setAcquisitionDate: (v: string) => void
  setDisposalDate: (v: string) => void
  setSubDiv152Active: (v: boolean) => void
  setSubDiv152ActiveAsset: (v: boolean) => void
  setSubDiv152RetirementExemption: (v: boolean) => void
  setAnnualNegativeGearingLoss: (v: number) => void
  setUserAge: (v: number) => void
  setAdvancedMode: (v: boolean) => void
}, scenario: AdvancedScenario) {
  setters.setAdvancedMode(true)
  setters.setPrincipal(scenario.principal)
  setters.setAnnualReturnPct(scenario.annualReturnPct)
  setters.setYearsHeld(scenario.yearsHeld)
  setters.setInflationPct(scenario.inflationPct)
  setters.setMarginalTaxPct(scenario.marginalTaxPct)
  setters.setAcquisitionDate(scenario.acquisitionDate)
  setters.setDisposalDate(scenario.disposalDate)
  setters.setSubDiv152Active(scenario.subDiv152Active)
  setters.setSubDiv152ActiveAsset(scenario.subDiv152ActiveAsset)
  setters.setSubDiv152RetirementExemption(scenario.subDiv152RetirementExemption)
  setters.setAnnualNegativeGearingLoss(scenario.annualNegativeGearingLoss)
  setters.setUserAge(scenario.userAge)
}

export default function HomePageClient() {
  const searchParams = useSearchParams()
  const initialState = useMemo(() => buildCalculatorStateFromParams(searchParams), [searchParams])
  const lastAppliedQuery = useRef(searchParams.toString())

  // Core sliders
  const [principal, setPrincipal] = useState(initialState.principal)
  const [annualReturnPct, setAnnualReturnPct] = useState(initialState.annualReturnPct)
  const [yearsHeld, setYearsHeld] = useState(initialState.yearsHeld)
  const [inflationPct, setInflationPct] = useState(initialState.inflationPct)
  const [marginalTaxPct, setMarginalTaxPct] = useState(initialState.marginalTaxPct)
  const [taxRatePreset, setTaxRatePreset] = useState<TaxRatePresetKey>(initialState.taxRatePreset)
  const [activeScenario, setActiveScenario] = useState<ScenarioKey>(initialState.activeScenario)
  const [advancedMode, setAdvancedMode] = useState(initialState.advancedMode)

  // Date-based grandfathering
  const [acquisitionDate, setAcquisitionDate] = useState(initialState.acquisitionDate)
  const [disposalDate, setDisposalDate] = useState(initialState.disposalDate)
  const [holdingOver12Months, setHoldingOver12Months] = useState(initialState.holdingOver12Months)

  // Income support exemption (Item 5)
  const [isIncomeSupport, setIsIncomeSupport] = useState(initialState.isIncomeSupport)

  // Property type (Item 3)
  const [propertyType, setPropertyType] = useState<PropertyType>(initialState.propertyType)
  const [useDiscountForNewProperty, setUseDiscountForNewProperty] = useState(initialState.useDiscountForNewProperty)

  // Subdiv 152 (Item 6)
  const [subDiv152Active, setSubDiv152Active] = useState(initialState.subDiv152Active)
  const [subDiv152MaxNetAssets, setSubDiv152MaxNetAssets] = useState(initialState.subDiv152MaxNetAssets)
  const [subDiv152SmallBizTurnover, setSubDiv152SmallBizTurnover] = useState(initialState.subDiv152SmallBizTurnover)
  const [subDiv152FifteenYearExemption, setSubDiv152FifteenYearExemption] = useState(initialState.subDiv152FifteenYearExemption)
  const [subDiv152RetirementExemption, setSubDiv152RetirementExemption] = useState(initialState.subDiv152RetirementExemption)
  const [userAge, setUserAge] = useState(initialState.userAge)

  // Subdiv 152 active-asset convenience flag used by advanced scenario presets
  const [subDiv152ActiveAsset, setSubDiv152ActiveAsset] = useState(initialState.subDiv152ActiveAsset)

  // Negative gearing (Item 4)
  const [ngPropertyDate, setNgPropertyDate] = useState(initialState.ngPropertyDate)
  const [ngPropertyType, setNgPropertyType] = useState<'established' | 'new'>(initialState.ngPropertyType)
  const [annualRentalIncome, setAnnualRentalIncome] = useState(initialState.annualRentalIncome)
  const [annualDeductibleExpenses, setAnnualDeductibleExpenses] = useState(initialState.annualDeductibleExpenses)
  const [otherTaxableIncome, setOtherTaxableIncome] = useState(initialState.otherTaxableIncome)

  // Manual NG loss override (used by advanced scenario presets)
  const [annualNegativeGearingLoss, setAnnualNegativeGearingLoss] = useState(initialState.annualNegativeGearingLoss)
  const [linkedCaseFileId, setLinkedCaseFileId] = useState<string | null>(initialState.linkedCaseFileId)

  useEffect(() => {
    const queryKey = searchParams.toString()
    if (queryKey === lastAppliedQuery.current) return
    lastAppliedQuery.current = queryKey

    const nextState = buildCalculatorStateFromParams(searchParams)
    setPrincipal(nextState.principal)
    setAnnualReturnPct(nextState.annualReturnPct)
    setYearsHeld(nextState.yearsHeld)
    setInflationPct(nextState.inflationPct)
    setMarginalTaxPct(nextState.marginalTaxPct)
    setTaxRatePreset(nextState.taxRatePreset)
    setActiveScenario(nextState.activeScenario)
    setAdvancedMode(nextState.advancedMode)
    setAcquisitionDate(nextState.acquisitionDate)
    setDisposalDate(nextState.disposalDate)
    setHoldingOver12Months(nextState.holdingOver12Months)
    setIsIncomeSupport(nextState.isIncomeSupport)
    setPropertyType(nextState.propertyType)
    setUseDiscountForNewProperty(nextState.useDiscountForNewProperty)
    setSubDiv152Active(nextState.subDiv152Active)
    setSubDiv152MaxNetAssets(nextState.subDiv152MaxNetAssets)
    setSubDiv152SmallBizTurnover(nextState.subDiv152SmallBizTurnover)
    setSubDiv152FifteenYearExemption(nextState.subDiv152FifteenYearExemption)
    setSubDiv152RetirementExemption(nextState.subDiv152RetirementExemption)
    setUserAge(nextState.userAge)
    setSubDiv152ActiveAsset(nextState.subDiv152ActiveAsset)
    setNgPropertyDate(nextState.ngPropertyDate)
    setNgPropertyType(nextState.ngPropertyType)
    setAnnualRentalIncome(nextState.annualRentalIncome)
    setAnnualDeductibleExpenses(nextState.annualDeductibleExpenses)
    setOtherTaxableIncome(nextState.otherTaxableIncome)
    setAnnualNegativeGearingLoss(nextState.annualNegativeGearingLoss)
    setLinkedCaseFileId(nextState.linkedCaseFileId)
  }, [searchParams])

  const linkedCaseUrl = linkedCaseFileId
    ? `https://factual-au.setiyaputra.me/fact-check/${linkedCaseFileId}`
    : null

  const derived = useMemo(() => {
    const marginalTaxRate = marginalTaxPct / 100

    const acqDate = new Date(acquisitionDate)
    const dispDate = new Date(disposalDate)

    const totalHoldingMs = Math.max(dispDate.getTime() - acqDate.getTime(), 1)
    const acqAfterCutoff = acqDate >= CUTOFF_DATE
    const dispBeforeCutoff = dispDate <= CUTOFF_DATE
    const isPreCgtAsset = acqDate < PRE_CGT_DATE

    let preFraction: number
    let postFraction: number

    if (isPreCgtAsset && dispBeforeCutoff) {
      preFraction = 0
      postFraction = 0
    } else if (isPreCgtAsset) {
      preFraction = 0
      postFraction = Math.min(Math.max((dispDate.getTime() - CUTOFF_DATE.getTime()) / totalHoldingMs, 0), 1)
    } else if (dispBeforeCutoff) {
      preFraction = 1
      postFraction = 0
    } else if (acqAfterCutoff) {
      preFraction = 0
      postFraction = 1
    } else {
      preFraction = Math.min(Math.max((CUTOFF_DATE.getTime() - acqDate.getTime()) / totalHoldingMs, 0), 1)
      postFraction = 1 - preFraction
    }

    const annualReturn = annualReturnPct / 100
    const futureValue = principal * Math.pow(1 + annualReturn, yearsHeld)
    const nominalGain = Math.max(futureValue - principal, 0)

    // Pre-2027 portion — old rules
    const preGain = nominalGain * preFraction
    const preTaxableGain = holdingOver12Months ? preGain * 0.5 : preGain
    const preCgtPayable = preTaxableGain * marginalTaxRate

    // Post-2027 portion — new rules
    const postGain = nominalGain * postFraction
    const postCostBase = principal * postFraction

    // CPI: if straddle, measure from CUTOFF_DATE; if fully post, from acqDate
    const postCpiStartDate = acqAfterCutoff ? acqDate : CUTOFF_DATE
    const postCpiEnd = getCPI(dispDate)
    const postCpiStart = getCPI(postCpiStartDate)
    const postCpiMult = postCpiStart > 0 ? postCpiEnd / postCpiStart : 1

    // Indexed gain (floor at 0)
    const rawIndexedGain = postGain - postCostBase * (postCpiMult - 1)
    const postIndexedGain = Math.max(rawIndexedGain, 0)

    let postCgtPayable: number
    let postMarginalTax: number
    let postMinimumTax: number
    let postElectionTax: number
    let minTaxFloorBinding = false

    // New residential property can elect 50% discount instead
    const useNewPropertyDiscount = propertyType === 'new' && useDiscountForNewProperty
    postElectionTax = postGain * 0.5 * marginalTaxRate

    if (!holdingOver12Months) {
      // Short hold: no discount, full marginal rate on nominal gain
      postMarginalTax = postGain * marginalTaxRate
      postMinimumTax = postGain * 0.30
      postCgtPayable = postGain * marginalTaxRate
    } else if (useNewPropertyDiscount) {
      // New residential election: 50% CGT discount instead of new regime
      postMarginalTax = postGain * 0.5 * marginalTaxRate
      postMinimumTax = postGain * 0.30
      postCgtPayable = postMarginalTax
    } else {
      postMarginalTax = postIndexedGain * marginalTaxRate
      postMinimumTax = postGain * 0.30
      if (isIncomeSupport) {
        // Income support exemption removes the 30% floor
        postCgtPayable = postMarginalTax
      } else {
        postCgtPayable = Math.max(postMarginalTax, postMinimumTax)
        minTaxFloorBinding = postMinimumTax > postMarginalTax
      }
    }

    // Subdiv 152 eligibility
    const subDiv152Eligible =
      advancedMode &&
      subDiv152Active &&
      (subDiv152MaxNetAssets || subDiv152SmallBizTurnover || subDiv152ActiveAsset)

    function applySubdiv152Stack(taxAmount: number): number {
      if (!subDiv152Eligible) return taxAmount
      if (subDiv152FifteenYearExemption && userAge >= 55 && yearsHeld >= 15) return 0
      // Note: we apply subdiv 152 to the taxable gain, not the tax amount
      // For simplicity in this approximation, we halve the effective tax (50% active asset reduction)
      let adjusted = taxAmount * 0.5
      if (subDiv152RetirementExemption) {
        // The $500k retirement exemption reduces the taxable gain, not the tax
        // Approximate: reduce tax by 500000 * marginalTaxRate
        const exemptionTaxValue = 500000 * marginalTaxRate
        adjusted = Math.max(adjusted - exemptionTaxValue, 0)
      }
      return adjusted
    }

    const preCgtFinal = applySubdiv152Stack(preCgtPayable)
    const postCgtFinal = applySubdiv152Stack(postCgtPayable)
    const totalCgtPayable = preCgtFinal + postCgtFinal
    const afterTaxWealth = futureValue - totalCgtPayable
    const alternativePostTax = applySubdiv152Stack(postElectionTax)

    // Current law (50% discount if held >12 months)
    const currentTaxableGain = isPreCgtAsset ? 0 : holdingOver12Months ? nominalGain * 0.5 : nominalGain
    const currentCgtRaw = currentTaxableGain * marginalTaxRate
    const currentCgtFinal = applySubdiv152Stack(currentCgtRaw)
    const afterTaxCurrent = futureValue - currentCgtFinal

    // No-discount reference
    const noDiscountRaw = nominalGain * marginalTaxRate
    const noDiscountTax = applySubdiv152Stack(noDiscountRaw)
    const afterTaxNoDiscount = futureValue - noDiscountTax

    const extraTaxVsCurrent = totalCgtPayable - currentCgtFinal
    const extraTaxPct = currentCgtFinal > 0 ? (extraTaxVsCurrent / currentCgtFinal) * 100 : 0
    const ratioVsCurrent = currentCgtFinal > 0 ? totalCgtPayable / currentCgtFinal : 0

    const chartMax = Math.max(
      currentCgtFinal,
      totalCgtPayable,
      noDiscountTax,
      afterTaxCurrent,
      afterTaxWealth,
      afterTaxNoDiscount,
      futureValue,
      1
    )

    // Indexed cost base for display (uses the inflationPct slider)
    const inflation = inflationPct / 100
    const indexedCostBase = principal * Math.pow(1 + inflation, yearsHeld)

    // Negative gearing calculations
    const ngAcqDate = new Date(ngPropertyDate)
    const ngAcqBeforeCutoff = ngAcqDate < NG_CUTOFF_DATE
    const ngIsNewBuild = ngPropertyType === 'new'
    const ngNewRulesApply = !ngAcqBeforeCutoff && !ngIsNewBuild

    const annualNetRental = annualRentalIncome - annualDeductibleExpenses
    const isNegativelyGeared = annualNetRental < 0
    // Use manual override if set, otherwise derive from rental inputs
    const effectiveAnnualLoss =
      annualNegativeGearingLoss > 0
        ? annualNegativeGearingLoss
        : isNegativelyGeared
        ? Math.abs(annualNetRental)
        : 0

    const offsettableLossCurrent = Math.min(effectiveAnnualLoss, otherTaxableIncome)
    const currentAnnualTaxSaving = offsettableLossCurrent * marginalTaxRate
    const reformAnnualTaxSaving = ngNewRulesApply ? 0 : currentAnnualTaxSaving
    const annualCarriedForward = ngNewRulesApply && effectiveAnnualLoss > 0 ? effectiveAnnualLoss : 0
    const cumulativeCarriedForward = annualCarriedForward * yearsHeld
    const annualTaxSavingLost = currentAnnualTaxSaving - reformAnnualTaxSaving
    const currentAnnualCashflow = annualNetRental + currentAnnualTaxSaving
    const reformAnnualCashflow = annualNetRental + reformAnnualTaxSaving
    const newPropertyLowerTax =
      propertyType === 'new' && holdingOver12Months
        ? alternativePostTax < postCgtFinal
          ? 'Use 50% discount election produces lower post-2027 tax in this scenario.'
          : alternativePostTax > postCgtFinal
            ? 'Indexation + 30% minimum tax produces lower post-2027 tax in this scenario.'
            : 'Both post-2027 treatments produce the same tax in this scenario.'
        : ''

    return {
      futureValue,
      nominalGain,
      indexedCostBase,
      preFraction,
      postFraction,
      postCpiMult,
      postMarginalTax,
      postMinimumTax,
      postCgtPayable,
      alternativePostTax,
      totalCgtPayable,
      currentCgtFinal,
      noDiscountTax,
      afterTaxWealth,
      afterTaxCurrent,
      afterTaxNoDiscount,
      extraTaxVsCurrent,
      extraTaxPct,
      ratioVsCurrent,
      chartMax,
      minTaxFloorBinding,
      acqAfterCutoff,
      dispBeforeCutoff,
      isPreCgtAsset,
      ngAcqBeforeCutoff,
      ngNewRulesApply,
      annualNetRental,
      currentAnnualTaxSaving,
      reformAnnualTaxSaving,
      currentAnnualCashflow,
      reformAnnualCashflow,
      cumulativeCarriedForward,
      annualTaxSavingLost,
      effectiveAnnualLoss,
      newPropertyLowerTax,
    }
  }, [
    advancedMode,
    annualDeductibleExpenses,
    annualNegativeGearingLoss,
    annualRentalIncome,
    annualReturnPct,
    acquisitionDate,
    disposalDate,
    holdingOver12Months,
    inflationPct,
    isIncomeSupport,
    marginalTaxPct,
    ngPropertyDate,
    ngPropertyType,
    otherTaxableIncome,
    principal,
    propertyType,
    subDiv152Active,
    subDiv152ActiveAsset,
    subDiv152FifteenYearExemption,
    subDiv152MaxNetAssets,
    subDiv152RetirementExemption,
    subDiv152SmallBizTurnover,
    useDiscountForNewProperty,
    userAge,
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
                current 50% discount, the legislated From 1 July 2027 indexation + 30% minimum tax regime,
                and a no-discount reference case. Sources are Australian government publications only.
              </p>
            </div>
            <ThemeToggle />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="https://factual-au.setiyaputra.me/dashboard"
              className="btn-brutal btn-brutal-neutral text-xs sm:text-sm"
            >
              Open Factual AU dashboard
            </a>
            {linkedCaseUrl ? (
              <a
                href={linkedCaseUrl}
                className="btn-brutal btn-brutal-neutral text-xs sm:text-sm"
              >
                Back to linked case file
              </a>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="badge-brutal bg-white text-[10px] sm:text-xs">Australian sources only</span>
            <span className="badge-brutal bg-white text-[10px] sm:text-xs">Interactive scenarios</span>
            <span className="badge-brutal bg-white text-[10px] sm:text-xs">Neutral framing</span>
            <span className="badge-brutal bg-white text-[10px] sm:text-xs">Legislated 2027 regime</span>
          </div>
        </header>

        {linkedCaseUrl ? (
          <section className="mb-6">
            <div className="card-brutal card-purple p-4 sm:p-5">
              <p className="text-xs sm:text-sm font-black uppercase tracking-wide text-black">
                Loaded from Factual AU
              </p>
              <p className="mt-2 text-xs sm:text-sm text-black/80">
                This calculator state was prefilled from the linked case file so you can stress-test the claim with the same scenario assumptions.
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                <a href={linkedCaseUrl} className="btn-brutal btn-brutal-neutral text-xs sm:text-sm">
                  View the case file
                </a>
                <a
                  href="https://factual-au.setiyaputra.me/dashboard"
                  className="btn-brutal btn-brutal-neutral text-xs sm:text-sm"
                >
                  Browse all case files
                </a>
              </div>
            </div>
          </section>
        ) : null}

        <section className="mb-6">
          <div className="card-brutal p-4 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wide">
                  Scenarios
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-foreground-muted">
                  Use the presets, then adjust the sliders and date inputs to see how quickly the headline shifts
                  once you change returns, inflation, holding periods, dates, or tax rate.
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
                            setAcquisitionDate,
                            setDisposalDate,
                            setSubDiv152Active,
                            setSubDiv152ActiveAsset,
                            setSubDiv152RetirementExemption,
                            setAnnualNegativeGearingLoss,
                            setUserAge,
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
              <p className="mt-1 text-xs sm:text-sm text-black/80">
                The reform treatment shown here is for individuals, trusts and partnerships. Companies are not
                modelled in this calculator.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Portfolio value" value={formatCurrency(derived.futureValue)} tone="main" />
                <MetricCard label="Nominal capital gain" value={formatCurrency(derived.nominalGain)} tone="success" />
                <MetricCard label="Indexed cost base" value={formatCurrency(derived.indexedCostBase)} tone="warning" />
                <MetricCard
                  label="Extra tax vs current law"
                  value={formatCurrency(derived.extraTaxVsCurrent)}
                  tone="danger"
                />
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <InputCard label="Initial investment" value={principal} setValue={setPrincipal} min={1000} max={500000} step={1000} format={formatCurrency} />
              <InputCard label="Annual return" value={annualReturnPct} setValue={setAnnualReturnPct} min={1} max={25} step={0.5} format={formatPercent} />
              <InputCard label="Holding period (years)" value={yearsHeld} setValue={setYearsHeld} min={1} max={60} step={1} format={(v) => `${v.toFixed(0)} years`} />
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

            {/* Date inputs for date-based grandfathering */}
            <div className="mt-4 card-brutal bg-white p-4">
              <p className="text-xs sm:text-sm font-black uppercase tracking-wide">Asset dates (for grandfathering)</p>
              <p className="mt-1 text-[11px] sm:text-xs text-foreground-muted">
                Gains on assets held across 1 July 2027 are apportioned: pre-2027 portion taxed under the 50% CGT discount;
                post-2027 portion under indexation + 30% minimum tax. Straight-line apportionment (approximate).
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wide">Acquisition date</label>
                  <input
                    type="date"
                    value={acquisitionDate}
                    onChange={e => setAcquisitionDate(e.target.value)}
                    className="mt-2 w-full border-2 border-black rounded-[5px] px-3 py-2 text-sm bg-bg"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-black uppercase tracking-wide">Disposal date</label>
                  <input
                    type="date"
                    value={disposalDate}
                    onChange={e => setDisposalDate(e.target.value)}
                    className="mt-2 w-full border-2 border-black rounded-[5px] px-3 py-2 text-sm bg-bg"
                  />
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                <span className="badge-brutal bg-bg">Pre-2027: {(derived.preFraction * 100).toFixed(0)}%</span>
                <span className="badge-brutal bg-bg">Post-2027: {(derived.postFraction * 100).toFixed(0)}%</span>
                <span className="badge-brutal bg-bg">CPI multiplier: {derived.postCpiMult.toFixed(3)}×</span>
              </div>
              <p className="mt-2 text-[11px] sm:text-xs text-foreground-muted">
                CPI multiplier is an all-groups ABS CPI approximation for this build. Quarterly refreshes and any legislation-specific valuation method should be checked against the final ATO guidance.
              </p>
              {derived.dispBeforeCutoff && (
                <p className="mt-2 text-[11px] sm:text-xs font-medium text-foreground-muted">
                  Entirely under existing 50% CGT discount rules (disposal before 1 July 2027).
                </p>
              )}
              {derived.isPreCgtAsset && derived.dispBeforeCutoff && (
                <p className="mt-2 text-[11px] sm:text-xs font-medium text-foreground-muted">
                  Pre-1985 asset, exempt for pre-2027 gains.
                </p>
              )}
              {derived.isPreCgtAsset && !derived.dispBeforeCutoff && (
                <p className="mt-2 text-[11px] sm:text-xs font-medium text-foreground-muted">
                  Pre-1985 asset: pre-2027 gain treated as exempt. Only the post-1 July 2027 portion is modelled under the new regime.
                </p>
              )}
              {derived.acqAfterCutoff && (
                <p className="mt-2 text-[11px] sm:text-xs font-medium text-foreground-muted">
                  Entirely under new indexation + 30% minimum tax regime (acquisition on or after 1 July 2027).
                </p>
              )}
            </div>

            <div className="mt-4 card-brutal bg-bg-alt p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm sm:text-base font-black uppercase tracking-wide">
                    Advanced Assumptions
                  </p>
                  <p className="mt-1 text-xs sm:text-sm text-foreground-muted">
                    Turn this on for founder / property-style scenarios with Subdiv 152, property type,
                    income support exemption, and negative gearing override assumptions.
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
                  <ToggleCard
                    label="Holding period >12 months"
                    description="Assets held less than 12 months are fully taxable at marginal rate under both old and new regimes."
                    checked={holdingOver12Months}
                    setChecked={setHoldingOver12Months}
                  />
                  <ToggleCard
                    label="Income support recipient (incl. Age Pension)"
                    description="Exempts from 30% minimum tax floor per BP2 p.21. Only indexation applies to post-2027 gains."
                    checked={isIncomeSupport}
                    setChecked={setIsIncomeSupport}
                  />

                  {/* Property type */}
                  <div className="card-brutal bg-white p-4 sm:col-span-2">
                    <p className="text-xs sm:text-sm font-black uppercase tracking-wide">Property type</p>
                    <p className="mt-1 text-[11px] sm:text-xs text-foreground-muted">
                      New residential properties can elect to use the 50% CGT discount instead of the new indexation + 30% min tax regime.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(['established', 'new', 'non-residential'] as const).map(pt => (
                        <button
                          key={pt}
                          onClick={() => setPropertyType(pt)}
                          className={`badge-brutal text-xs ${propertyType === pt ? 'badge-main' : 'bg-white'}`}
                        >
                          {pt === 'established'
                            ? 'Established residential'
                            : pt === 'new'
                            ? 'New residential'
                            : 'Non-residential investment'}
                        </button>
                      ))}
                    </div>
                    {propertyType === 'new' && (
                      <label className="mt-3 flex items-center gap-2 text-xs font-black cursor-pointer">
                        <input
                          type="checkbox"
                          checked={useDiscountForNewProperty}
                          onChange={e => setUseDiscountForNewProperty(e.target.checked)}
                          className="h-4 w-4 accent-black"
                        />
                        Use 50% discount instead of new regime (new residential election)
                      </label>
                    )}
                    {propertyType === 'new' && useDiscountForNewProperty && (
                      <p className="mt-2 text-[11px] sm:text-xs text-foreground-muted">
                        Election applied: using 50% discount on post-2027 portion rather than indexation + 30% min tax.
                      </p>
                    )}
                    {propertyType === 'new' && derived.newPropertyLowerTax && (
                      <p className="mt-2 text-[11px] sm:text-xs font-medium text-foreground-muted">
                        {derived.newPropertyLowerTax}
                      </p>
                    )}
                  </div>

                  {/* Subdiv 152 */}
                  <div className="card-brutal bg-white p-4 sm:col-span-2">
                    <p className="text-xs sm:text-sm font-black uppercase tracking-wide">Subdivision 152 small business CGT concessions</p>
                    <p className="mt-1 text-[11px] sm:text-xs text-foreground-muted">
                      Subdiv 152 is unchanged by the 2026 Budget. Stack is approximate — actual ATO determinations are case-specific. Calculator does not substitute for tax advice.
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <ToggleCard
                        label="Asset qualifies as active business asset (Subdiv 152)"
                        description="Enables the Subdivision 152 concession stack. Requires either max net assets ≤$6m or annual turnover <$2m."
                        checked={subDiv152Active}
                        setChecked={setSubDiv152Active}
                      />
                      {subDiv152Active && (
                        <>
                          <ToggleCard
                            label="Max net assets test (≤$6m)"
                            description="Satisfies the basic conditions via the maximum net assets test."
                            checked={subDiv152MaxNetAssets}
                            setChecked={setSubDiv152MaxNetAssets}
                          />
                          <ToggleCard
                            label="Small business turnover test (<$2m)"
                            description="Satisfies the basic conditions via the small business entity turnover test."
                            checked={subDiv152SmallBizTurnover}
                            setChecked={setSubDiv152SmallBizTurnover}
                          />
                          <ToggleCard
                            label="15-year exemption (age 55+, held 15+ years)"
                            description="If eligible (age ≥55, holding ≥15 years), zeroes the entire taxable gain."
                            checked={subDiv152FifteenYearExemption}
                            setChecked={setSubDiv152FifteenYearExemption}
                          />
                          <ToggleCard
                            label="Retirement exemption ($500k lifetime cap)"
                            description="Reduces taxable gain by up to $500,000 after the 50% active asset reduction."
                            checked={subDiv152RetirementExemption}
                            setChecked={setSubDiv152RetirementExemption}
                          />
                          <InputCard
                            label="Taxpayer age (for 15-year exemption)"
                            value={userAge}
                            setValue={setUserAge}
                            min={18}
                            max={90}
                            step={1}
                            format={(v) => `${v.toFixed(0)} years old`}
                          />
                        </>
                      )}
                    </div>
                  </div>

                  <InputCard
                    label="Manual NG loss override (annual)"
                    value={annualNegativeGearingLoss}
                    setValue={setAnnualNegativeGearingLoss}
                    min={0}
                    max={100000}
                    step={1000}
                    format={formatCurrency}
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
                tax={derived.currentCgtFinal}
                afterTax={derived.afterTaxCurrent}
                taxPct={(derived.currentCgtFinal / derived.chartMax) * 100}
                wealthPct={(derived.afterTaxCurrent / derived.chartMax) * 100}
                tone="success"
              />
              <ScenarioBar
                label="From 1 July 2027 (indexation + 30% min tax)"
                tax={derived.totalCgtPayable}
                afterTax={derived.afterTaxWealth}
                taxPct={(derived.totalCgtPayable / derived.chartMax) * 100}
                wealthPct={(derived.afterTaxWealth / derived.chartMax) * 100}
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
              <MetricCard label="Tax under current law" value={formatCompactCurrency(derived.currentCgtFinal)} tone="success" />
              <MetricCard label="Tax under 2027 regime" value={formatCompactCurrency(derived.totalCgtPayable)} tone="danger" />
              <MetricCard
                label="Increase vs current law"
                value={formatPercent(derived.extraTaxPct)}
                tone="warning"
              />
              <MetricCard label="Multiple of current tax" value={derived.ratioVsCurrent > 0 ? `${derived.ratioVsCurrent.toFixed(2)}x` : 'n/a'} tone="main" />
            </div>

            <div className="mt-5 card-brutal bg-white p-4">
              <p className="text-sm sm:text-base font-bold">
                In this scenario, current-law tax is{' '}
                <span className="text-green-700">{formatCurrency(derived.currentCgtFinal)}</span>,
                versus{' '}
                <span className="text-red-700">{formatCurrency(derived.totalCgtPayable)}</span>
                {' '}under the From 1 July 2027 regime.
              </p>
              <p className="mt-3 text-xs sm:text-sm text-foreground-muted">
                That is an additional <strong>{formatCurrency(derived.extraTaxVsCurrent)}</strong> and
                {' '}roughly <strong>{derived.ratioVsCurrent.toFixed(2)}x</strong> the tax take.
              </p>
            </div>

            {/* Post-2027 breakdown */}
            {derived.postFraction > 0 && (
              <div className="mt-4 card-brutal bg-white p-4">
                <p className="text-[11px] sm:text-xs font-black uppercase tracking-wide text-foreground-muted">
                  Post-2027 portion breakdown
                </p>
                <p className="mt-2 text-[11px] sm:text-xs text-foreground-muted">
                  The 30% minimum tax is a floor, not a flat rate: the calculator compares marginal tax on the indexed gain with 30% of the nominal gain and uses the higher amount.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <MetricCard label="Marginal tax on indexed gain" value={formatCompactCurrency(derived.postMarginalTax)} tone="main" />
                  <MetricCard label="30% minimum tax on nominal gain" value={formatCompactCurrency(derived.postMinimumTax)} tone="warning" />
                  <div className="card-brutal bg-white p-4 sm:col-span-2">
                    <p className="text-[11px] sm:text-xs font-black uppercase tracking-wide text-foreground-muted">
                      CGT payable — binding constraint
                    </p>
                    <p className="mt-2 text-xl sm:text-2xl font-extrabold">{formatCompactCurrency(derived.postCgtPayable)}</p>
                    <span className={`mt-2 inline-flex badge-brutal text-[10px] sm:text-xs ${derived.minTaxFloorBinding ? 'badge-danger' : 'badge-success'}`}>
                      {derived.minTaxFloorBinding ? 'Minimum tax floor binding' : 'Marginal rate binding'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 card-brutal bg-white p-4">
              <p className="text-[11px] sm:text-xs font-black uppercase tracking-wide text-foreground-muted">
                Modelling boundary
              </p>
              <p className="mt-2 text-xs sm:text-sm text-foreground-muted">
                This page is a sensitivity tool, not a tax ruling. It does not by itself prove any live policy
                package, age-cohort incidence, capital flight, or business response.
              </p>
              <p className="mt-3 text-xs sm:text-sm text-foreground-muted">
                The advanced mode is an approximation layer, not a full tax engine. It applies date-based
                grandfathering, indexation + 30% min tax on the post-2027 portion, optional Subdiv 152 stack,
                and property type elections.
              </p>
              <p className="mt-3 text-xs sm:text-sm text-foreground-muted">
                Consultation is underway on early-stage business and ESS treatment. Calculator does not yet
                model those carve-outs as they are not finalised.
              </p>
            </div>
          </div>
        </section>

        {/* Negative Gearing Section (Item 4) */}
        <section className="mb-6">
          <div className="card-brutal p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wide">
              Negative Gearing: Pre vs Post 12 May 2026
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-foreground-muted">
              From 12 May 2026, negative gearing losses on established residential properties acquired on
              or after that date can only offset rental income or property capital gains — not other taxable
              income. New builds retain full negative gearing.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="card-brutal bg-white p-4">
                <label className="text-[11px] font-black uppercase tracking-wide">Property acquisition date</label>
                <input
                  type="date"
                  value={ngPropertyDate}
                  onChange={e => setNgPropertyDate(e.target.value)}
                  className="mt-2 w-full border-2 border-black rounded-[5px] px-3 py-2 text-sm bg-bg"
                />
                <div className="mt-2 flex gap-2">
                  <span className={`badge-brutal text-[10px] sm:text-xs ${derived.ngAcqBeforeCutoff ? 'badge-success' : 'badge-danger'}`}>
                    {derived.ngAcqBeforeCutoff ? 'Pre-cutoff: old NG rules apply' : 'Post-cutoff: new NG rules may apply'}
                  </span>
                </div>
              </div>

              <div className="card-brutal bg-white p-4">
                <p className="text-[11px] font-black uppercase tracking-wide">Property type</p>
                <div className="mt-3 flex gap-2">
                  {(['established', 'new'] as const).map(pt => (
                    <button
                      key={pt}
                      onClick={() => setNgPropertyType(pt)}
                      className={`badge-brutal text-xs ${ngPropertyType === pt ? 'badge-main' : 'bg-white'}`}
                    >
                      {pt === 'established' ? 'Established' : 'New build'}
                    </button>
                  ))}
                </div>
                {derived.ngNewRulesApply && (
                  <p className="mt-2 text-[11px] text-foreground-muted">
                    New NG rules apply — losses can only offset rental income / property gains.
                  </p>
                )}
                {!derived.ngNewRulesApply && !derived.ngAcqBeforeCutoff && ngPropertyType === 'new' && (
                  <p className="mt-2 text-[11px] text-foreground-muted">
                    New builds retain full negative gearing regardless of acquisition date.
                  </p>
                )}
              </div>

              <InputCard
                label="Annual rental income"
                value={annualRentalIncome}
                setValue={setAnnualRentalIncome}
                min={0}
                max={200000}
                step={1000}
                format={formatCurrency}
              />
              <InputCard
                label="Annual deductible expenses"
                value={annualDeductibleExpenses}
                setValue={setAnnualDeductibleExpenses}
                min={0}
                max={200000}
                step={1000}
                format={formatCurrency}
              />
              <InputCard
                label="Other taxable income"
                value={otherTaxableIncome}
                setValue={setOtherTaxableIncome}
                min={0}
                max={500000}
                step={1000}
                format={formatCurrency}
              />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Current annual cashflow"
                value={formatCompactCurrency(derived.currentAnnualCashflow)}
                tone="success"
              />
              <MetricCard
                label="Reform annual cashflow"
                value={formatCompactCurrency(derived.reformAnnualCashflow)}
                tone={derived.ngNewRulesApply ? 'warning' : 'main'}
              />
              <MetricCard
                label="Current annual tax saving"
                value={formatCompactCurrency(derived.currentAnnualTaxSaving)}
                tone="success"
              />
              <MetricCard
                label="Reform annual tax saving"
                value={formatCompactCurrency(derived.reformAnnualTaxSaving)}
                tone={derived.ngNewRulesApply ? 'danger' : 'success'}
              />
              <MetricCard
                label="Annual tax saving lost"
                value={formatCompactCurrency(derived.annualTaxSavingLost)}
                tone="warning"
              />
              <MetricCard
                label="Cumulative carried-forward loss"
                value={formatCompactCurrency(derived.cumulativeCarriedForward)}
                tone="main"
              />
            </div>
            <p className="mt-3 text-[11px] sm:text-xs text-foreground-muted">
              Other taxable income caps the amount of loss that can be offset immediately under current rules in this simplified model. Excess losses remain an approximation here.
            </p>

            {derived.ngNewRulesApply && derived.effectiveAnnualLoss > 0 && (
              <div className="mt-4 card-brutal card-warning p-4">
                <p className="text-xs sm:text-sm font-black text-black">
                  New NG rules apply: {formatCurrency(derived.effectiveAnnualLoss)}/yr in losses are
                  carried forward rather than deducted against other income.
                  Over {yearsHeld} years, cumulative carried-forward loss: {formatCurrency(derived.cumulativeCarriedForward)}.
                </p>
              </div>
            )}
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
                  That makes the "this is protecting young Australians trying to get ahead" framing hard to
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

        {/* Worker Tax Cuts Context (Item 7) */}
        <section className="mb-6">
          <div className="card-brutal card-bg-alt p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wide">
              Worker Tax Cuts — For Context
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-foreground-muted">
              The 2026–27 Budget also includes direct tax cuts for workers. These are separate from the CGT
              and negative gearing changes but provide useful scale context.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard label="WATO benefit from 2027–28" value="Up to $250/yr" tone="success" />
              <MetricCard label="Instant tax deduction (avg)" value="$205 benefit" tone="main" />
              <MetricCard label="Worker on $81,245 avg earnings — 2026–27" value="$1,978 tax cut" tone="warning" />
              <MetricCard label="Worker on $81,245 avg earnings — from 2027–28" value="$2,496/yr" tone="danger" />
            </div>
            <p className="mt-4 text-[11px] sm:text-xs text-foreground-muted">
              Source: BP1 Statement 4. Display only — not included in CGT calculations above.
            </p>
          </div>
        </section>

        {/* VC Incentive Context (Item 8) */}
        <section className="mb-6">
          <div className="card-brutal p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wide">
              Venture Capital Incentive Expansion
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-foreground-muted">
              Budget Paper 2, p.18 expanded ESVCLP and VCLP caps. Tax-exempt returns on eligible ESVCLP
              investments are unaffected by the general CGT discount change.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs sm:text-sm border-collapse">
                <thead>
                  <tr>
                    <th className="card-brutal p-2 text-left font-black">Cap</th>
                    <th className="card-brutal p-2 text-right font-black">Old</th>
                    <th className="card-brutal p-2 text-right font-black">New</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['VCLP investee asset cap', '$250m', '$480m'],
                    ['ESVCLP investee asset cap', '$50m', '$80m'],
                    ['ESVCLP tax-exempt investee asset cap', '$250m', '$420m'],
                    ['ESVCLP max fund size', '$200m', '$270m'],
                  ].map(([label, old, next]) => (
                    <tr key={label}>
                      <td className="card-brutal p-2">{label}</td>
                      <td className="card-brutal p-2 text-right text-foreground-muted">{old}</td>
                      <td className="card-brutal p-2 text-right font-black">{next}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-[11px] sm:text-xs text-foreground-muted">
              Tax-exempt returns on eligible ESVCLP investments are unaffected by the general CGT discount change. This is a separate, expanded incentive. Source: BP2 p.18.
            </p>
          </div>
        </section>

        <section className="mb-6">
          <div className="card-brutal p-4 sm:p-6">
            <h2 className="text-lg sm:text-2xl font-black uppercase tracking-wide">
              Updates
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-foreground-muted">
              Recent changes to this tool.
            </p>
            <div className="mt-4 space-y-3">
              <UpdateRow label="Budget 2026 update" detail="Implemented legislated 1 July 2027 CGT regime: date-based grandfathering, indexation + 30% min tax, Subdiv 152 stack, NG section, worker tax cuts context, VC incentive table, income support exemption." />
              <UpdateRow label="Advanced scenario cards" detail="Updated card-based UI for founder relief, straddle-the-cutoff, and property-style advanced scenario presets with date inputs." />
              <UpdateRow label="Advanced CGT scenario controls" detail="Replaced grandfatheredGainPct slider with acquisition/disposal date inputs. Added property type, Subdiv 152, income support, and NG section." />
              <UpdateRow label="CGT claim boundaries updated" detail="Updated claim-check section with Budget Paper references. Removed pre-Budget framing." />
              <UpdateRow label="Policy axis colors and social preview" detail="Refreshed the 2×2 matrix colour scheme and the Open Graph preview image." />
              <UpdateRow label="Initial release" detail="Launched with scenario presets, distributional fact section, claim-pressure-test section, and the 2×2 evidence matrix." />
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="card-brutal bg-black px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs sm:text-sm font-black uppercase tracking-wide text-white">
                  Updated post-Budget 2026 — reflects legislated policy per BP1 Statement 4 and BP2 pp.21–22
                </p>
                <p className="mt-2 text-[11px] sm:text-xs text-white/80">
                  This note sits at the bottom so the main calculator loads first, while still marking the current legislative basis for the scenarios and claim-check sections.
                </p>
              </div>
              <span className="badge-brutal bg-white text-black text-[10px] sm:text-xs">
                Last updated May 2026
              </span>
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

function UpdateRow({ label, detail }: { label: string; detail: string }) {
  return (
    <div className="card-brutal bg-white p-4">
      <div className="flex flex-wrap items-start gap-3">
        <span className="badge-brutal badge-main text-[10px] sm:text-xs shrink-0">{label}</span>
        <p className="text-xs sm:text-sm text-foreground-muted">{detail}</p>
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
