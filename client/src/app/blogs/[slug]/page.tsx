"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { blogService } from "@/lib/services/blog.service";
import { Blog } from "@/types/blog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Clock, 
  BookOpen,
  Share2,
  Tag,
  Copy,
  Check,
  Twitter,
  Linkedin,
  Facebook
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Footer } from "@/components/footer";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Helper function to estimate reading time
const getReadingTime = (content: string) => {
  const wordsPerMinute = 200;
  const wordCount = content?.split(/\s+/).length || 0;
  const minutes = Math.ceil(wordCount / wordsPerMinute);
  return minutes < 1 ? 1 : minutes;
};

// Helper function to format blog content
const formatBlogContent = (content: string) => {
  if (!content) return '';
  
  // Check if content is HTML
  if (content.includes('<') && content.includes('>')) {
    return content;
  }
  
  // Convert plain text with line breaks to paragraphs
  return content
    .split('\n\n')
    .filter(p => p.trim())
    .map(p => `<p>${p.replace(/\n/g, '<br />')}</p>`)
    .join('');
};

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetchBlog(params.slug as string);
    }
  }, [params.slug]);

  const fetchBlog = async (slug: string) => {
    setIsLoading(true);
    try {
      const response = await blogService.getBlogBySlug(slug);
      setBlog(response.data.blog);
    } catch (error) {
      console.error("Failed to fetch blog:", error);
      toast.error("Failed to load blog");
      router.push("/aboutus");
    } finally {
      setIsLoading(false);
    }
  };

  const getShareUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.href;
    }
    return '';
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const shareOnTwitter = () => {
    const url = encodeURIComponent(getShareUrl());
    const text = encodeURIComponent(blog?.title || '');
    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const shareOnLinkedIn = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener,noreferrer');
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(getShareUrl());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (navigator.share && blog) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.summary,
          url: getShareUrl(),
        });
      } catch (error) {
        // User cancelled - do nothing
      }
    }
  };

  if (isLoading) {
    return (
      <>
        <main className="min-h-screen pt-28 pb-12 px-4 md:px-8 lg:px-12 bg-background">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-6 animate-pulse">
              <div className="h-8 w-24 bg-muted rounded-full" />
              <div className="h-64 md:h-96 bg-muted rounded-3xl" />
              <div className="h-10 bg-muted rounded w-3/4" />
              <div className="h-6 bg-muted rounded w-1/2" />
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded" />
                <div className="h-4 bg-muted rounded w-5/6" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <>
      <main className="min-h-screen pt-28 pb-12 bg-background">
        {/* Back Button & Actions - Fixed spacing for navbar */}
        <div className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12 mb-6">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-border/50 hover:bg-primary/90 hover:border-primary/30"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            
            {/* Share Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-border/50 hover:bg-primary/90 hover:border-primary/30"
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer rounded-lg">
                  {copied ? (
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  {copied ? "Copied!" : "Copy Link"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareOnTwitter} className="cursor-pointer rounded-lg">
                  <Twitter className="h-4 w-4 mr-2" />
                  Share on X
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareOnLinkedIn} className="cursor-pointer rounded-lg">
                  <Linkedin className="h-4 w-4 mr-2" />
                  Share on LinkedIn
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareOnFacebook} className="cursor-pointer rounded-lg">
                  <Facebook className="h-4 w-4 mr-2" />
                  Share on Facebook
                </DropdownMenuItem>
                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <DropdownMenuItem onClick={handleNativeShare} className="cursor-pointer rounded-lg">
                    <Share2 className="h-4 w-4 mr-2" />
                    More Options
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Blog Content */}
        <article className="max-w-4xl mx-auto px-4 md:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Cover Image */}
            {blog.coverImage && (
              <div className="relative h-64 md:h-96 rounded-3xl overflow-hidden mb-8">
                <Image
                  src={blog.coverImage}
                  alt={blog.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-linear-to-t from-background/60 via-transparent to-transparent" />
              </div>
            )}

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {blog.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="rounded-full px-3 py-1 text-xs capitalize"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {blog.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-border/50">
              {/* Author */}
              {blog.author && (
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-linear-to-br from-primary/20 to-accent/20">
                    {blog.author.images?.[0] ? (
                      <Image
                        src={blog.author.images[0]}
                        alt={blog.author.userId?.fullName || "Author"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary/40" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {blog.author.userId?.fullName || "Unknown"}
                    </p>
                    {blog.author.qualification && (
                      <p className="text-xs text-muted-foreground">
                        {blog.author.qualification}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 md:ml-auto text-sm text-muted-foreground">
                {/* Date */}
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(blog.publishedAt || blog.createdAt)}</span>
                </div>

                {/* Reading Time */}
                {blog.content && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{getReadingTime(blog.content)} min read</span>
                  </div>
                )}
              </div>
            </div>

            {/* Summary */}
            {blog.summary && (
              <div className="mb-8 p-6 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="flex items-start gap-3">
                  <BookOpen className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <p className="text-lg text-muted-foreground leading-relaxed italic">
                    {blog.summary}
                  </p>
                </div>
              </div>
            )}

            {/* Content */}
            {blog.content && (
              <div 
                className="prose prose-lg dark:prose-invert max-w-none
                  prose-headings:font-bold prose-headings:tracking-tight
                  prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
                  prose-p:text-muted-foreground prose-p:leading-relaxed
                  prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-foreground
                  prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                  prose-blockquote:border-primary prose-blockquote:text-muted-foreground
                  prose-img:rounded-2xl prose-img:shadow-lg"
                dangerouslySetInnerHTML={{ __html: formatBlogContent(blog.content) }}
              />
            )}

            {/* Bottom Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-12 pt-8 border-t border-border/50"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <Link href="/aboutus">
                  <Button variant="outline" className="rounded-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Articles
                  </Button>
                </Link>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground mr-2">Share:</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full hover:bg-primary/10"
                    onClick={shareOnTwitter}
                  >
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full hover:bg-primary/10"
                    onClick={shareOnLinkedIn}
                  >
                    <Linkedin className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full hover:bg-primary/10"
                    onClick={shareOnFacebook}
                  >
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full hover:bg-primary/10"
                    onClick={copyToClipboard}
                  >
                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-10 text-center"
            >
              <div className="p-8 rounded-3xl bg-linear-to-br from-primary/10 to-accent/10 border border-primary/10">
                <h3 className="text-xl font-bold mb-2">Interested in Natural Healing?</h3>
                <p className="text-muted-foreground mb-6">
                  Book a consultation with our expert homeopathic practitioners today.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link href="/appointments">
                    <Button className="rounded-full bg-linear-to-r from-primary to-accent hover:opacity-90">
                      Book Appointment
                    </Button>
                  </Link>
                  <Link href="/products">
                    <Button variant="outline" className="rounded-full">
                      Browse Products
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </article>
      </main>
      <Footer />
    </>
  );
}
