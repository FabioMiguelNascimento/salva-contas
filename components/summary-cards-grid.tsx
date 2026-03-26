"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import * as React from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { A11y, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

interface SummaryCardsGridProps {
  children: ReactNode;
  className?: string;
}

export function SummaryCardsGrid({ children, className }: SummaryCardsGridProps) {
  const cardCount = React.Children.count(children);
  const desktopSlides = cardCount >= 4 ? 4 : cardCount;

  return (
    <section className={cn("relative rounded-2xl overflow-hidden border border-border h-[230px] md:h-60", className)}>
      <Swiper
        modules={[ Pagination, A11y]}
        style={{ height: "100%"}}
        slidesPerView={1.05}
        loop={false}
        grabCursor
        pagination={{ clickable: true }}
        breakpoints={{
          640: {
            slidesPerView: 1.15,
            spaceBetween: 0,
          },
          768: {
            slidesPerView: 2.05,
            spaceBetween: 0,
          },
          1280: {
            slidesPerView: desktopSlides,
            spaceBetween: 0,
          },
        }}
        className="px-0 py-0 overflow-visible"
      >
        {React.Children.map(children, (child, index) => (
          <SwiperSlide key={`summary-card-${index}`} className="h-full" style={{ height: '100%' }}>
            <div className="h-full">{child}</div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
