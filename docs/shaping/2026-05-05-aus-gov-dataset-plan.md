# Shaping Note: Australian Government Dataset Plan

## Goal

Pressure-test each claim on the page using **Australian government data only**.

This note is not about message framing. It is about:

- which claims are already supportable from public official data
- which claims need extra public datasets
- which claims require **custom tabulations or restricted microdata**

## Core principle

For this page, split every statement into one of three buckets:

1. **Directly supported**
2. **Illustrative but assumption-driven**
3. **Not yet evidenced with public government data**

The current calculator already handles the **illustrative math**. The work below is the evidence layer around it.

---

## Claim-by-Claim Dataset Matrix

| Claim to test | What we actually need to measure | Best Australian government datasets | Useful cuts / variables | Status |
|---|---|---|---|---|
| “The current 50% discount materially lowers tax on long-term gains” | Current-law mechanics, benchmark treatment, aggregate revenue forgone | PBO `Operation of the CGT discount`; Treasury `2025–26 Tax Expenditures and Insights Statement`; ATO `Taxation statistics 2022–23` | Revenue forgone, benchmark definition, net capital gain counts by entity type | `Ready now` |
| “A switch to inflation indexation would materially change outcomes for long-hold investors” | A worked scenario plus sensitivity analysis across return, inflation and hold period | Treasury TEIS benchmark definition + the page’s own calculator assumptions | Return rate, CPI assumption, holding years, marginal rate | `Ready now, but illustrative only` |
| “The current discount benefits high-income taxpayers disproportionately” | Distribution of the concession by income decile / top percentile | PBO `Operation of the CGT discount` | Top 10%, top 5%, top 2%, top 1%; income deciles | `Ready now` |
| “This would hit all major asset classes, not just housing” | Asset-class distribution of the current concession | PBO `Operation of the CGT discount` Table A3 | Property, shares, trusts, other | `Ready now` |
| “Young Australians get hit hardest” | Age-by-asset-holding, age-by-non-housing wealth, ideally age-by-CGT usage | ABS `Household Income and Wealth, Australia`; ABS `Housing Occupancy and Costs`; ABS `Income and Housing` TableBuilder microdata; ATO tax stats if age splits exist; otherwise custom ATO/PBO tabulation | Age of reference person, net worth, housing tenure, value of shares/business assets, deposits, super, investment property | `Partly ready; strongest proof needs custom tab` |
| “Boomers and Gen X built wealth under one regime, now the ladder is being pulled up” | Cohort comparison across age, tenure, and asset mix over time | ABS `Household Income and Wealth, Australia` historical releases; ABS `Australian National Accounts: Distribution of Household Income, Consumption and Wealth`; ABS TableBuilder | Age cohort, net worth quintile, housing wealth vs financial wealth across releases | `Partly ready` |
| “The change would push capital toward the family home” | Relative tax favoritism of housing vs other assets; current household asset allocation | Treasury TEIS: `E7 Main residence exemption` and `E15 Discount for individuals and trusts`; ABS `Housing Occupancy and Costs`; ABS `Household Income and Wealth`; RBA `Chart Pack – Household Sector` | Main residence exemption value, home ownership, investor property share, housing share of wealth | `Supportable directionally` |
| “The change would push capital into term deposits/cash” | Household allocation to deposits vs risk assets over time | RBA `Chart Pack – Household Sector`; ABS `Household Income and Wealth`; ABS TableBuilder | Deposits/cash holdings, direct equity holdings, other financial assets, age/wealth deciles | `Supportable directionally` |
| “The change would hurt productive business investment, startups and innovation” | Business formation, business survival, innovation spending, startup/VC activity | ABS `Counts of Australian Businesses, including Entries and Exits`; ABS `Innovation in Australian Business`; ABS `BLADE` (restricted); Jobs and Skills Australia employment projections; Department/Portfolio innovation releases if needed | Business entries/exits, survival, innovation expenditure, industry splits, employing vs non-employing businesses | `Public data gives partial support; strongest test needs BLADE` |
| “The change would hurt farms and private businesses” | Exposure of farm and small-business asset owners to CGT changes; business/farm balance-sheet dependence on asset sales | ABARES farm business datasets; ATO small business CGT concession statistics/guidance; ABS BLADE where available | Farm asset values, income volatility, business size, active asset sales, small business concession usage | `Needs more work` |
| “Capital will go offshore” | Portfolio reallocation from domestic risk assets toward foreign assets / offshore structures | ABS Balance of Payments & International Investment Position; ABS finance statistics; possibly ATO or FIRB-linked microdata via BLADE | Household/business external asset holdings, foreign equity exposure, outbound investment trends | `Weak with public data alone` |
| “This is intergenerational betrayal, not equity” | Net effect across age cohorts after combining housing, financial wealth and income concentration | ABS wealth + housing datasets; PBO distribution tables; ideally custom age-cohort CGT claimant data | Age cohort, income cohort, wealth composition, housing status, taxable capital gains incidence | `Needs composite analysis` |

---

## Best Public Datasets To Pull First

If we want the **highest-signal public evidence fast**, start with these:

### 1. PBO: `Operation of the CGT discount`

Use this for:

- who benefits now by income percentile
- which asset classes currently receive the concession
- the scale of the current concession

Why it matters:

- it is the cleanest official source for the **distributional baseline**
- it stops us from hand-waving about “who wins now”

Source:

- https://www.pbo.gov.au/publications-and-data/publications/costings/operation-CGT-discount
- PDF: https://www.pbo.gov.au/sites/default/files/2026-02/PBO%20-%20Operation%20of%20the%20CGT%20discount.pdf

### 2. Treasury: `2025–26 Tax Expenditures and Insights Statement`

Use this for:

- benchmark treatment of capital gains
- the current discount’s revenue forgone
- comparison with the **main residence exemption**

Why it matters:

- it gives the official benchmark definition the calculator should cite
- it lets us compare tax preference for the family home versus other assets

Source:

- https://treasury.gov.au/sites/default/files/2025-12/p2025-721342.pdf

### 3. ABS: `Household Income and Wealth, Australia`

Use this for:

- wealth distribution by age/life stage
- composition of household wealth
- whether younger households rely more on non-housing assets, or simply hold much less wealth overall

Why it matters:

- this is the main public dataset for testing the “young Australians get hit hardest” line
- it keeps us honest if the real story is “younger households own less of every asset class”

Sources:

- https://www.abs.gov.au/statistics/economy/finance/household-income-and-wealth-australia
- latest release page: https://www.abs.gov.au/statistics/economy/finance/household-income-and-wealth-australia/latest-release
- TableBuilder: https://www.abs.gov.au/statistics/microdata-tablebuilder/available-microdata-tablebuilder/income-and-housing-australia

### 4. ABS: `Housing Occupancy and Costs`

Use this for:

- home ownership / mortgage / renting by age and household type
- whether housing is already structurally advantaged in household balance sheets

Why it matters:

- if we want to argue that tax changes would push more capital toward housing, we need the housing baseline first

Source:

- https://www.abs.gov.au/statistics/people/housing/housing-occupancy-and-costs

### 5. RBA: `Chart Pack – Household Sector`

Use this for:

- household wealth and liabilities
- housing prices and household debt
- macro context for deposits versus risk assets

Why it matters:

- it helps frame portfolio substitution claims without leaving the official public data ecosystem

Source:

- https://www.rba.gov.au/chart-pack/household-sector.html

### 6. ABS: `Innovation in Australian Business`

Use this for:

- innovation-active businesses
- innovation expenditure
- business characteristics around innovation effort

Why it matters:

- this is the best public official source for the “productive investment / innovation” branch of the argument

Source:

- https://www.abs.gov.au/statistics/industry/technology-and-innovation/innovation-australian-business

### 7. ABS: `Counts of Australian Businesses, including Entries and Exits`

Use this for:

- business formation
- business exits
- survival by size and industry

Why it matters:

- if we later want to argue “policy settings matter for risk-taking”, this gives us the operating business baseline

Source:

- https://www.abs.gov.au/statistics/economy/business-indicators/counts-australian-businesses-including-entries-and-exits/latest-release

---

## Datasets That Need Restricted Or Custom Access

These are the important gaps if we want the case to be stronger than a slogan.

### A. Age distribution of actual CGT-discount users

Needed for:

- “young Australians get hit hardest”
- “boomers built wealth under this regime”

Problem:

- the clean public PBO distribution is **by income**, not by age
- public ABS wealth tables are **by age**, but do not directly show CGT discount usage

Best path:

- custom ATO or PBO tabulation of **net capital gains / CGT discount incidence by age band**
- or an ABS/ATO linked research extract through approved channels

### B. Business investment response to CGT treatment

Needed for:

- “this will hurt startups / risk-taking / productive investment”

Problem:

- public ABS releases show business formation and innovation, but not a simple public causal link to CGT treatment

Best path:

- ABS `BLADE`-based research design using CGT, BAS, business income tax, PAYG and innovation variables

Source:

- https://www.abs.gov.au/about/data-services/data-integration/integrated-data/business-longitudinal-analysis-data-environment-blade

### C. Offshore substitution / capital flight

Needed for:

- “money will go offshore”

Problem:

- this is the weakest empirical claim using public aggregate data alone
- macro international investment series do not isolate “because of CGT treatment”

Best path:

- treat this as a **hypothesis**, not a headline, unless we get a stronger government-backed empirical study

---

## Recommended Page Upgrades From This Dataset Plan

### Upgrade 1: Add a “What the public data can already show” panel

Use:

- PBO distribution by income percentile
- PBO asset-class split
- Treasury comparison between `E15` CGT discount and `E7` main residence exemption

This is the strongest factual section available immediately.

### Upgrade 2: Add a “What this page does not yet prove” panel

Explicitly say the page does **not** yet prove:

- age-cohort incidence of CGT discount use
- causal capital flight
- exact investment response of startups/farms/businesses

This makes the page more credible, not weaker.

### Upgrade 3: Build a second chart around housing vs non-housing tax preferences

Public data needed:

- Treasury TEIS `E7` main residence exemption
- Treasury TEIS `E15` CGT discount
- ABS housing tenure / wealth composition

This is probably the cleanest official-data counter to the “intergenerational equity” framing.

---

## Suggested Build Order

1. **Now**
   Pull PBO + Treasury + ABS wealth/housing and add a factual evidence sidebar.

2. **Next**
   Add an “assumption sensitivity” section to show how much the headline changes with:
   - lower return assumptions
   - shorter holding periods
   - lower marginal tax rates
   - different CPI

3. **Later**
   Only make age-cohort or startup-damage claims stronger if we get:
   - custom ATO/PBO age breakdowns
   - ABS TableBuilder outputs
   - BLADE-backed research

---

## Exact Stats We Will Use

This is the concrete stat list to pull into the page, notes, or follow-up analysis.

### From PBO `Operation of the CGT discount`

Use these exact outputs:

- total estimated **revenue foregone** from the CGT discount for individuals and trusts
- **share of benefit by taxable income decile**
- **share of benefit received by the top 10%, top 5%, top 2%, and top 1%**
- **average impact per affected person** for those top percentiles
- **asset-class split** of the benefit:
  - property
  - shares
  - trusts
  - other

Why:

- these are the strongest official stats for “who benefits now” and “what assets are actually involved”

### From Treasury `2025–26 Tax Expenditures and Insights Statement`

Use these exact tax-expenditure items:

- `E15` **Capital gains tax discount for individuals and trusts**
- `E7` **Main residence exemption**

Use these exact outputs:

- annual **revenue forgone estimate** for `E15`
- annual **revenue forgone estimate** for `E7`
- any published **distributional chart data** for `E15`
- benchmark definition showing that the current concession is a deviation from benchmark treatment

Why:

- this is the cleanest way to compare tax preference for non-housing gains versus owner-occupied housing

### From ATO `Capital gains tax statistics for Taxation statistics 2022–23`

Use these exact outputs:

- **net capital gains by entity type**
- counts and value ranges for capital gains where available
- individuals versus trusts versus companies where reported
- any CGT-schedule counts that show how concentrated gain realisations are

Why:

- this grounds the page in actual taxpayer usage, not just benchmark estimates

### From ABS `Household Income and Wealth, Australia`

Use these exact cuts:

- **median and mean household net worth by age of reference person**
- **wealth composition by age**:
  - owner-occupied dwelling
  - other property
  - shares and other financial assets
  - superannuation
  - deposits / accounts with financial institutions
  - own business assets
- **net worth quintiles by age**
- **share ownership / financial asset holding by age cohort**, if available in TableBuilder

Why:

- these are the core stats for testing whether younger households are materially exposed to non-housing asset accumulation at all

### From ABS `Housing Occupancy and Costs`

Use these exact cuts:

- **home ownership rate by age**
- **mortgage prevalence by age**
- **private renter share by age**
- **investor / multiple-property indicators** where available

Why:

- these stats frame whether capital is already structurally biased toward housing

### From RBA `Chart Pack – Household Sector`

Use these exact series:

- **Household Wealth and Liabilities**
- **Housing Prices and Household Debt**
- **Housing Loan Commitments**

Use them for:

- housing share of household wealth
- household leverage tied to housing
- macro backdrop for deposits, debt and property concentration

Why:

- these provide the macro household balance-sheet context that ABS microdata alone does not

### From ABS `Counts of Australian Businesses, including Entries and Exits`

Use these exact stats:

- total **actively trading businesses**
- total **employing businesses**
- annual **entry rate**
- annual **exit rate**
- **number of entries**
- **number of exits**
- business survival rates by industry / size where available

Current official headline numbers from the latest release:

- `2,729,648` actively trading businesses at 30 June 2025
- `994,178` employing businesses
- `16.4%` entry rate with `437,150` entries
- `13.9%` exit rate with `370,500` exits

Why:

- this is the baseline for any “risk-taking / business formation” argument

### From ABS `Innovation in Australian Business`

Use these exact stats:

- share of businesses that are **innovation-active**
- innovation activity by business size
- innovation activity by industry
- innovation expenditure, where published

Why:

- this is the strongest public official baseline for “productive investment” and innovation effort

### From ABS TableBuilder / DataLab for deeper age testing

If we escalate beyond public cubes, use:

- **age of person / household reference person**
- **wealth item type**
- **value of financial assets**
- **value of non-financial assets**
- **business ownership / own business assets**
- **housing tenure**
- **main source of income**
- **occupation / labour force status**

Why:

- this is the route to building age-by-asset-exposure cuts that published tables do not provide cleanly

### From ABS BLADE for later-stage research

If we need a stronger business-response case, use BLADE-linked variables for:

- business entry and survival
- employment growth
- innovation participation
- IP / trade / tax-linked business characteristics

Why:

- this is where a serious causal business-investment argument would have to live

---

## Bottom Line

Using public Australian government stats alone, the strongest evidence base is:

- **who benefits from the current discount**
- **which asset classes are involved**
- **how the benchmark works**
- **how tax treatment compares with housing’s existing preference**
- **how wealth and housing are distributed across households**

The weakest public-data claims are:

- exact intergenerational incidence of CGT discount usage
- startup/farm/business behavioural response
- offshore capital flight

Those should stay out of the strongest headline copy unless we add better evidence.
