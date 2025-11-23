import Link from "next/link"

export function Footer() {
  return (
    <footer className="mt-8 border-t">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div id="about">
            <div className="font-semibold mb-2">About</div>
            <p className="text-sm text-muted-foreground text-pretty">
              The HomeoPatha helps you book trusted doctors and shop essential medical products with ease.
            </p>
          </div>

          <div>
            <div className="font-semibold mb-2">Quick Links</div>
            <ul className="text-sm space-y-1">
              <li>
                <Link href="#" className="hover:underline underline-offset-4">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#top-doctors" className="hover:underline underline-offset-4">
                  Doctors
                </Link>
              </li>
              <li>
                <Link href="#shop-essentials" className="hover:underline underline-offset-4">
                  Products
                </Link>
              </li>
              <li>
                <Link href="#about" className="hover:underline underline-offset-4">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:underline underline-offset-4">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline underline-offset-4">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="font-semibold mb-2">Support</div>
            <ul className="text-sm space-y-1">
              <li>
                <Link href="#" className="hover:underline underline-offset-4">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline underline-offset-4">
                  Help
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:underline underline-offset-4">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div id="contact">
            <div className="font-semibold mb-2">Contact</div>
            <ul className="text-sm space-y-1">
              <li>Email: info@homeopatha.com</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li className="flex gap-3 pt-1" aria-label="Social links">
                <Link href="#" className="hover:underline underline-offset-4">
                  Twitter
                </Link>
                <Link href="#" className="hover:underline underline-offset-4">
                  LinkedIn
                </Link>
                <Link href="#" className="hover:underline underline-offset-4">
                  Instagram
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 text-xs text-muted-foreground">
          © {new Date().getFullYear()} The HomeoPatha. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
