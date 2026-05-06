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

## Notes

- The calculator is a sensitivity tool, not tax or legal advice.
- The policy comparison is illustrative unless and until a final reform package is published.
