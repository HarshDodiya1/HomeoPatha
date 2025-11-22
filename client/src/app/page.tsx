import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { SearchBar } from "@/components/search-bar"
import { FeaturedDoctors } from "@/components/sections/featured-doctors"
import { FeaturedProducts } from "@/components/sections/featured-products"
import { HowItWorks } from "@/components/sections/how-it-works"
import { WhyChooseUs } from "@/components/sections/why-choose-us"
import { Testimonials } from "@/components/sections/testimonials"
import { Newsletter } from "@/components/sections/newsletter"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-dvh flex flex-col">
      {/* <Navbar /> */}
      <section aria-labelledby="hero" className="relative">
        <Hero />
        <div className="pointer-events-none absolute inset-x-0 -bottom-8 mx-4 md:mx-auto md:max-w-5xl">
          <SearchBar />
        </div>
      </section>

      <section aria-labelledby="top-doctors" className="mt-20 md:mt-28 px-4 md:px-8 lg:px-12">
        <FeaturedDoctors />
      </section>

      <section aria-labelledby="shop-essentials" className="px-4 md:px-8 lg:px-12">
        <FeaturedProducts />
      </section>

      <section aria-labelledby="how-it-works" className="px-4 md:px-8 lg:px-12">
        <HowItWorks />
      </section>

      <section aria-labelledby="why-choose-us" className="px-4 md:px-8 lg:px-12">
        <WhyChooseUs />
      </section>

      <section aria-labelledby="testimonials" className="px-4 md:px-8 lg:px-12">
        <Testimonials />
      </section>

      <section aria-labelledby="newsletter" className="px-4 md:px-8 lg:px-12">
        <Newsletter />
      </section>

      <Footer />
    </main>
  )
}

