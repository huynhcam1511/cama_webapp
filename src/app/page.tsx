"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { User, LogIn, ExternalLink, Play, X, Shield } from "lucide-react";

interface CollectionItem {
  id: string;
  title: string;
  mediaType: "pdf" | "video";
  mediaUrl: string;
  coverDesktop?: string;
  coverMobile?: string;
  btnText: string;
}

const COLLECTIONS: CollectionItem[] = [
  {
    id: "nouvelle-eclat",
    title: "Nouvelle Éclat Bridal",
    mediaType: "pdf",
    mediaUrl: "/nouvelle-eclat-bridal.pdf",
    coverDesktop: "/nouvelle-cover.jpg",
    btnText: "Khám Phá",
  },
  {
    id: "your-happy-day",
    title: "Your Happy Day",
    mediaType: "pdf",
    mediaUrl: "/YOUR-HAPPY-DAY.pdf",
    coverDesktop: "/hero.jpg",
    btnText: "Khám Phá",
  },
  {
    id: "luxury-bridal",
    title: "Luxury Bridal",
    mediaType: "pdf",
    mediaUrl: "/LUXURY-BRIDAL.pdf",
    coverDesktop: "/luxury-dress.jpg",
    coverMobile: "/luxury-mobile.png",
    btnText: "Khám Phá",
  },
  {
    id: "limited-bridal",
    title: "Limited Bridal",
    mediaType: "pdf",
    mediaUrl: "/LIMITED-BRIDAL.pdf",
    coverDesktop: "/limited-dress.jpg",
    coverMobile: "/limited-mobile.png",
    btnText: "Khám Phá",
  },
  {
    id: "gold-bridal",
    title: "Gold Bridal",
    mediaType: "pdf",
    mediaUrl: "/GOLD-BRIDAL.pdf",
    coverDesktop: "/gold-dress.jpg",
    coverMobile: "/gold-mobile.png",
    btnText: "Khám Phá",
  },
  {
    id: "cama-suit-campaign",
    title: "CAMA Suit Campaign",
    mediaType: "video",
    mediaUrl: "/cama-suit.mp4",
    coverDesktop: "/suit-man-1-cover.jpg",
    btnText: "Thưởng Thức",
  },
  {
    id: "suit-man-1",
    title: "Suit Man Collection 1",
    mediaType: "pdf",
    mediaUrl: "/suit-man-collection-1.pdf",
    coverDesktop: "/suit-man-1-cover.jpg",
    btnText: "Khám Phá",
  },
  {
    id: "suit-man-2",
    title: "Suit Man Collection 2",
    mediaType: "pdf",
    mediaUrl: "/suit-man-collection-2.pdf",
    coverDesktop: "/suit-man.jpg",
    coverMobile: "/suit-man-2-mobile.png",
    btnText: "Khám Phá",
  },
  {
    id: "cama-studio",
    title: "CAMA Studio",
    mediaType: "pdf",
    mediaUrl: "/slide-camastudio.pdf",
    coverDesktop: "/cama-studio-cover.jpg",
    coverMobile: "/cama-studio-mobile.png",
    btnText: "Khám Phá",
  },
];

export default function HomePage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [activeVideo, setActiveVideo] = useState<{ url: string; title: string } | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [collections, setCollections] = useState<CollectionItem[]>(COLLECTIONS);

  // Lấy danh mục động từ ERP Dashboard (nếu có cập nhật mới)
  useEffect(() => {
    fetch('/api/marketing/lookbooks/public', { cache: 'no-store' })
      .then(res => res.json())
      .then(res => {
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const dynamicItems: CollectionItem[] = res.data.map((item: any) => ({
            id: item.id,
            title: item.title,
            mediaType: item.file_type || 'pdf',
            mediaUrl: item.file_url,
            coverDesktop: item.cover_image_url || '/hero.jpg',
            coverMobile: item.cover_mobile_url || item.cover_image_url || '/hero.jpg',
            btnText: item.file_type === 'video' ? 'Thưởng Thức' : 'Khám Phá'
          }));
          setCollections(dynamicItems);
        }
      })
      .catch(() => {});
  }, []);

  // Check auth state
  useEffect(() => {
    try {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) {
          setUser({ email: data.user.email });
        }
      });
    } catch (e) {
      // In case client initialization fails gracefully
    }

    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveVideo(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <main
      className="min-h-screen bg-[#050505] text-[#F8F5F0] selection:bg-[#E6CFA5] selection:text-[#050505]"
      style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
    >
      {/* NAVBAR */}
      <nav
        className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 sm:px-12 transition-all duration-300 ${
          isScrolled
            ? "py-3 bg-[#050505]/95 backdrop-blur-md border-b border-[#E6CFA5]/20 shadow-lg shadow-black/40"
            : "py-5 bg-[#050505]/40 backdrop-blur-sm border-b border-[#E6CFA5]/10"
        }`}
      >
        <div className="flex-1 flex items-center">
          <span
            className="text-xs uppercase tracking-[0.25em] text-[#E6CFA5]/70 hidden sm:inline-block"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            Haute Couture
          </span>
        </div>

        <div className="flex-1 text-center">
          <Link
            href="/"
            className="inline-block text-2xl sm:text-3xl tracking-[0.35em] text-[#E6CFA5] hover:text-[#FFF0D4] transition-colors"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            CAMA
          </Link>
        </div>

        <div className="flex-1 flex justify-end items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-[#050505] bg-gradient-to-r from-[#FFF3DC] via-[#E6CFA5] to-[#B89658] hover:shadow-[0_0_20px_rgba(230,207,165,0.4)] transition-all"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Vào Hệ Thống</span>
            </Link>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium tracking-wider text-[#E6CFA5] bg-[#121212]/80 border border-[#E6CFA5]/50 hover:bg-[#E6CFA5] hover:text-[#050505] hover:shadow-[0_0_15px_rgba(230,207,165,0.3)] transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Đăng Nhập Nhân Viên</span>
            </Link>
          )}
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-[#050505]">
        <video
          autoPlay
          muted
          loop
          playsInline
          poster="/hero.jpg"
          className="absolute inset-0 w-full h-full object-cover opacity-60 pointer-events-none"
        >
          <source src="/cama-haute-couture.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#050505]" />
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
          <p
            className="text-xs sm:text-sm tracking-[0.4em] uppercase text-[#E6CFA5] mb-4"
            style={{ fontFamily: "var(--font-cinzel), serif" }}
          >
            Atelier & Bridal Studio
          </p>
          <h1
            className="text-4xl sm:text-6xl md:text-7xl font-normal text-[#F8F5F0] tracking-[0.1em] drop-shadow-2xl"
            style={{ fontFamily: "var(--font-playfair), serif" }}
          >
            Chào Quý Khách
          </h1>
          <div className="w-12 h-[1px] bg-[#E6CFA5]/60 my-6" />
          <p className="text-sm sm:text-base text-[#F8F5F0]/80 font-light max-w-xl tracking-wide leading-relaxed">
            Nơi hội tụ tinh hoa thiết kế Haute Couture cưới đỉnh cao, lưu giữ trọn vẹn từng khoảnh khắc thiêng liêng.
          </p>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#E6CFA5]">Khám phá</span>
          <div className="w-px h-8 bg-gradient-to-b from-[#E6CFA5] to-transparent animate-pulse" />
        </div>
      </section>

      {/* COLLECTIONS LIST */}
      <section id="collections" className="w-full">
        {collections.map((col, idx) => {
          const isVideoItem = col.mediaType === "video";
          const bgImage = isMobile && col.coverMobile ? col.coverMobile : col.coverDesktop;

          return (
            <div
              key={col.id}
              className="group relative w-full h-screen overflow-hidden flex items-center justify-center bg-[#121212]"
            >
              {/* Background media */}
              {isVideoItem ? (
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster={col.coverDesktop}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                >
                  <source src={col.mediaUrl} type="video/mp4" />
                </video>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={bgImage || "/hero.jpg"}
                  alt={col.title}
                  loading={idx < 2 ? "eager" : "lazy"}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src !== `${window.location.origin}/hero.jpg`) {
                      target.src = "/hero.jpg";
                    }
                  }}
                />
              )}

              {/* Elegant overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/85 via-black/25 to-transparent flex flex-col justify-end items-center pb-16 sm:pb-20 z-10 pointer-events-none" />

              {/* Action content */}
              <div className="relative z-20 text-center px-4 max-w-xl mx-auto flex flex-col items-center">
                <span
                  className="text-xs uppercase tracking-[0.3em] text-[#E6CFA5]/90 mb-2 opacity-0 transform translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500"
                  style={{ fontFamily: "var(--font-cinzel), serif" }}
                >
                  Bộ Sưu Tập #{idx + 1}
                </span>

                <h3
                  className="text-2xl sm:text-4xl text-[#F8F5F0] font-normal tracking-[0.1em] mb-6 drop-shadow-lg"
                  style={{ fontFamily: "var(--font-playfair), serif" }}
                >
                  {col.title}
                </h3>

                {isVideoItem ? (
                  <button
                    onClick={() => setActiveVideo({ url: col.mediaUrl, title: col.title })}
                    className="inline-flex items-center gap-3 px-10 py-3.5 bg-[#E6CFA5] text-[#050505] font-semibold text-xs tracking-[0.25em] uppercase border border-[#E6CFA5] hover:bg-transparent hover:text-[#E6CFA5] hover:shadow-[0_0_25px_rgba(230,207,165,0.4)] transition-all duration-300 transform group-hover:scale-105"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{col.btnText}</span>
                  </button>
                ) : (
                  <a
                    href={col.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-10 py-3.5 bg-[#E6CFA5] text-[#050505] font-semibold text-xs tracking-[0.25em] uppercase border border-[#E6CFA5] hover:bg-transparent hover:text-[#E6CFA5] hover:shadow-[0_0_25px_rgba(230,207,165,0.4)] transition-all duration-300 transform group-hover:scale-105"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{col.btnText}</span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </section>

      {/* FOOTER */}
      <footer className="py-20 px-6 sm:px-12 text-center bg-[#050505] border-t border-[#E6CFA5]/10">
        <div
          className="text-3xl sm:text-4xl tracking-[0.3em] text-[#E6CFA5] mb-4"
          style={{ fontFamily: "var(--font-cinzel), serif" }}
        >
          CAMA
        </div>
        <p className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-6 font-light">
          Haute Couture Wedding Atelier
        </p>
        <div className="w-8 h-[1px] bg-[#E6CFA5]/30 mx-auto mb-6" />
        <p className="text-[11px] text-neutral-600 tracking-wider">
          &copy; {new Date().getFullYear()} CAMA Studio. All Rights Reserved.
        </p>
      </footer>

      {/* LUXURY VIDEO LIGHTBOX MODAL */}
      {activeVideo && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative w-full max-w-5xl bg-[#080808] border border-[#E6CFA5]/40 rounded-lg shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_50px_rgba(230,207,165,0.15)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E6CFA5]/20 bg-[#0b0b0b]">
              <h4
                className="text-xs sm:text-sm tracking-[0.2em] text-[#E6CFA5] uppercase font-semibold"
                style={{ fontFamily: "var(--font-cinzel), serif" }}
              >
                {activeVideo.title}
              </h4>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-neutral-400 hover:text-[#E6CFA5] transition-colors p-1"
                aria-label="Đóng video"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video container 16:9 */}
            <div className="relative pt-[56.25%] bg-black">
              <video
                src={activeVideo.url}
                controls
                autoPlay
                playsInline
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
