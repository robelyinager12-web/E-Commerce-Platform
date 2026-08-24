export function Footer() {
  return (
    <footer className="mt-24 border-t border-hairline bg-paper">
      <div className="mx-auto max-w-6xl px-6 py-10 font-sans text-sm text-muted">
        <div className="flex flex-col justify-between gap-4 md:flex-row">
          <p>© {new Date().getFullYear()} Aurora Market. All rights reserved.</p>
          <div className="flex gap-6">
            <span>Shipping &amp; returns</span>
            <span>Contact</span>
            <span>Privacy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}