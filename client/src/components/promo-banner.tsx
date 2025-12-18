"use client";

import { StickyBanner } from "@/components/ui/sticky-banner";
import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { siteSettingsService, StickyBanner as StickyBannerType } from "@/lib/services/site-settings.service";

export function PromoBanner() {
  const [banner, setBanner] = useState<StickyBannerType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await siteSettingsService.getActiveStickyBanner();
        if (response.data.stickyBanner) {
          setBanner(response.data.stickyBanner);
        }
      } catch (error) {
        console.error("Failed to fetch sticky banner:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBanner();
  }, []);

  // Don't render anything if there's no active banner
  if (!banner && !isLoading) return null;
  if (isLoading) return null;

  return (
    <StickyBanner 
      className="bg-gradient-to-r from-primary via-primary/90 to-accent text-white"
      hideOnScroll={true}
    >
      <div className="flex items-center justify-center gap-3 text-sm font-medium">
        <Sparkles className="h-4 w-4 flex-shrink-0" />
        <span>{banner?.heading}</span>
        {banner?.linkText && banner?.linkUrl && (
          <>
            <span className="hidden sm:inline">—</span>
            <Link 
              href={banner.linkUrl} 
              className="hidden sm:inline underline underline-offset-4 hover:no-underline font-semibold"
            >
              {banner.linkText}
            </Link>
          </>
        )}
      </div>
    </StickyBanner>
  );
}
