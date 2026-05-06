export function Footer() {
  return (
    <footer className="mt-8 card-brutal p-4" role="contentinfo">
      <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[10px] sm:text-sm">
        <a
          href="/legal/privacy"
          className="link-brutal"
        >
          Privacy
        </a>
        <span aria-hidden="true" className="text-black/30">•</span>
        <a
          href="https://www.pbo.gov.au/sites/default/files/2026-02/PBO%20-%20Operation%20of%20the%20CGT%20discount.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="link-brutal"
        >
          Source PDF
        </a>
        <span aria-hidden="true" className="text-black/30">•</span>
        <a
          href="https://www.pbo.gov.au/"
          target="_blank"
          rel="noopener noreferrer"
          className="link-brutal"
        >
          PBO
        </a>
        <span aria-hidden="true" className="text-black/30">•</span>
        <a
          href="https://github.com/suryast"
          target="_blank"
          rel="noopener noreferrer"
          className="link-brutal"
        >
          GitHub
        </a>
      </div>
      <p className="mt-3 text-center text-[9px] sm:text-xs text-black/40">
        This page is an educational calculator. It is not tax advice, legal advice,
        or a statement that any specific budget proposal is final.
      </p>
    </footer>
  )
}
