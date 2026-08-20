export default function Footer() {
  return (
    <footer className="border-t border-wm-border bg-wm-bg py-6 transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 md:flex-row">
        <p className="text-xs text-wm-text/60 font-semibold">
          © 2026 GabutHub. Made with  and nostalgic vibes.
        </p>

        <div className="flex gap-6 text-xs text-wm-text/60">
          <button className="hover:text-wm-coral font-bold cursor-pointer transition">
            About
          </button>
          <button className="hover:text-wm-coral font-bold cursor-pointer transition">
            Privacy
          </button>
          <button className="hover:text-wm-coral font-bold cursor-pointer transition">
            Contact
          </button>
        </div>
      </div>
    </footer>
  );
}