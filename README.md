# Australia CGT Reform Calculator

Interactive one-page calculator and claim-check for Australia's capital gains tax debate.

Live site:

- `https://australia-cgt-reform-calculator.setiyaputra.me`

It compares:

- the current `50%` CGT discount
- an illustrative inflation-indexed cost-base scenario
- full nominal taxation with no discount

It also includes:

- scenario presets labeled `Realistic`, `Optimistic`, and `Exaggerated`
- a distributional fact section using official age and income split data
- a `Which Claims Matter Most?` 2x2 matrix for evidence strength vs policy importance
- direct references to PBO, Treasury, ABS, RBA, and ATO sources

## Why this project exists

Australia's CGT debate is often argued in slogans.

This project exists to do two narrower jobs well:

1. show how different tax treatments change long-run compounding outcomes under explicit assumptions
2. separate claims that are strongly supported by official public data from claims that are still rhetorical, assumption-driven, or unresolved

The site is intentionally built as both:

- a calculator for worked scenarios
- a claim-check for distributional and policy arguments

It is not trying to settle every reform question. It is trying to raise the evidentiary standard of the discussion.

## Reasoning behind the page

The page starts from a simple observation:

- a dramatic worked example can be mathematically correct and still be a weak guide to public policy if its assumptions are stretched
- a strong political claim can be emotionally compelling and still be weakly evidenced by the official data

So the project splits the problem into layers.

### 1. Mechanics layer

This is the compounding calculator itself.

It compares:

- current law with the `50%` CGT discount
- an illustrative inflation-indexed cost-base treatment
- a no-discount reference case

That layer answers:

- how much do return assumptions matter?
- how much does inflation matter?
- how sensitive is the headline to holding period and tax rate?

### 2. Evidence layer

This is the claim-check side of the page.

It asks:

- who benefits from the current discount now?
- how concentrated are those benefits by income?
- what do official age splits show?
- which arguments are already well supported, and which still need more evidence?

### 3. Interpretation layer

The site makes a deliberate distinction between:

- `directly supported`
- `illustrative but assumption-driven`
- `important but not yet proven with public data alone`

That distinction matters because several common claims in the CGT debate are not equally strong.

For example:

- concentration of benefit at the top of the income distribution is strongly evidenced
- age distribution of benefit is supported by Treasury chart data
- precise claims about capital flight, startup damage, and behavioural response are more weakly evidenced from public aggregate data alone

## Evidence model

The page uses an explicit evidence standard:

- **Directly supported:** official public data clearly measures the claim
- **Illustrative:** the math is transparent, but the scenario depends on assumptions
- **Not yet proven:** the claim may be plausible, but public official data does not cleanly establish it on its own

This is why the site includes both:

- scenario labels such as `Realistic`, `Optimistic`, and `Exaggerated`
- the `Which Claims Matter Most?` matrix

## Key claims the page is testing

- Whether replacing the current CGT discount would materially change long-horizon outcomes for investors
- Whether the current discount is mainly a broad middle-class or young-household concession
- Whether the strongest current evidence points to a high-income and older-age concentration of benefits
- Which policy objections are already evidenced and which still require stronger empirical support

## Stack

- Next.js `16`
- React `19`
- Tailwind CSS `4`
- Cloudflare Pages

## Local development

```bash
pnpm install
pnpm dev
```

Build:

```bash
pnpm build
```

## Deploy

This project is deployed as a static export to Cloudflare Pages.

```bash
pnpm build
pnpm exec wrangler pages deploy out --project-name=cgt-compound-calculator
```

## Sources used on-page

- Parliamentary Budget Office: `Operation of the CGT discount`
- Treasury: `2025–26 Tax Expenditures and Insights Statement`
- Treasury TEIS chart-data workbook
- Australian Bureau of Statistics
- Reserve Bank of Australia
- Australian Taxation Office

## Reference links

- PBO publication:
  `https://www.pbo.gov.au/publications-and-data/publications/costings/operation-CGT-discount`
- PBO PDF:
  `https://www.pbo.gov.au/sites/default/files/2026-02/PBO%20-%20Operation%20of%20the%20CGT%20discount.pdf`
- Treasury TEIS publication:
  `https://treasury.gov.au/publication/p2025-721342`
- Treasury TEIS chart-data workbook:
  `https://treasury.gov.au/sites/default/files/2025-12/p2025-721342-chart-data.xlsx`
- ABS Household Income and Wealth:
  `https://www.abs.gov.au/statistics/economy/finance/household-income-and-wealth-australia`
- ABS Housing Occupancy and Costs:
  `https://www.abs.gov.au/statistics/people/housing/housing-occupancy-and-costs`
- ABS Business Counts:
  `https://www.abs.gov.au/statistics/economy/business-indicators/counts-australian-businesses-including-entries-and-exits/latest-release`
- ABS Innovation in Australian Business:
  `https://www.abs.gov.au/statistics/industry/technology-and-innovation/innovation-australian-business`
- RBA Household Sector Chart Pack:
  `https://www.rba.gov.au/chart-pack/household-sector.html`
- ATO CGT statistics:
  `https://www.ato.gov.au/about-ato/research-and-statistics/in-detail/taxation-statistics/taxation-statistics-2022-23/statistics/capital-gains-tax-statistics`

## Method note

- The calculator does not claim to model a final enacted reform package.
- The indexation comparison is illustrative unless and until a live proposal is published with exact legislative design.
- Age and income distribution sections rely on official public releases, but some stronger causal claims would still require custom tabulations, linked microdata, or restricted datasets.
- The detailed research framing for this repo is captured in:
  `docs/shaping/2026-05-05-aus-gov-dataset-plan.md`

## Notes

- The calculator is a sensitivity tool, not tax or legal advice.
- The policy comparison is illustrative unless and until a final reform package is published.
