import { useState, useEffect } from 'react';
import { Music, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { t } from '../i18n/translations';
import LanguageSelector from '../i18n/LanguageSelector';

interface LandingProps {
  onNavigate: (page: 'register' | 'login') => void;
}

// Concert/festival images for slideshow - razni koncerti i festivali
// Rock bandovi: gitare i bubnjevi, Ultra: velika pozornica, ostali: publika
const slideshowImages = [
  {
    // Thompson - Sinj Hipodrom
    url: 'https://api.hrt.hr/media/4d/4d/pxl-040825-136386621-20250804204542.webp',
    titleHr: 'Thompson - Sinj Hipodrom',
    titleEn: 'Thompson - Sinj Hipodrom',
    subtitleHr: 'Nezaboravna atmosfera pred preko 150.000 ljudi',
    subtitleEn: 'Unforgettable atmosphere with over 150,000 people'
  },
  {
    // Colonia/Indira Levak
    url: 'https://tuzlanski.ba/wp-content/uploads/2025/01/indira-levak-instagram-1735729083.jpg?v1735729132',
    titleHr: 'Colonia - Indira Levak',
    titleEn: 'Colonia - Indira Levak',
    subtitleHr: 'Kraljica hrvatske dance scene',
    subtitleEn: 'Queen of Croatian dance scene'
  },
  {
    // Ultra Europe Split - velika pozornica s U logom
    url: 'https://ultraeurope.com/wp-content/uploads/2019/07/europe-og-2020.jpg',
    titleHr: 'Ultra Europe - Split',
    titleEn: 'Ultra Europe - Split',
    subtitleHr: 'Najveći EDM festival na Jadranu',
    subtitleEn: 'The biggest EDM festival on the Adriatic'
  },
  {
    // AC/DC
    url: 'https://www.ac-dc.net/img1/acdc_header-index-432.jpg',
    titleHr: 'AC/DC - Rock Legenda',
    titleEn: 'AC/DC - Rock Legend',
    subtitleHr: 'Osjetite energiju rock\'n\'rolla',
    subtitleEn: 'Feel the rock\'n\'roll energy'
  },
  {
    // Guns N' Roses
    url: 'https://dynamicmedia.livenationinternational.com/j/i/n/238fbe23-b0aa-4191-a69a-ae53e6066f7d.jpeg?format=webp&width=3840&quality=75',
    titleHr: 'Guns N\' Roses',
    titleEn: 'Guns N\' Roses',
    subtitleHr: 'Welcome to the Jungle',
    subtitleEn: 'Welcome to the Jungle'
  },
  {
    // Metallica
    url: 'https://i.ytimg.com/vi/j0VNemTPhK8/maxresdefault.jpg',
    titleHr: 'Metallica',
    titleEn: 'Metallica',
    subtitleHr: 'Nothing Else Matters',
    subtitleEn: 'Nothing Else Matters'
  },
  {
    // Queen Tribute Band
    url: 'https://sfae.blob.core.windows.net/media/ecommercesite/media/sfae/sfae.artwork/800-queen-wembley-stadium-1986_1.jpg?ext=.jpg',
    titleHr: 'Queen Tribute Band',
    titleEn: 'Queen Tribute Band',
    subtitleHr: 'We Will Rock You - u spomen Freddieju',
    subtitleEn: 'We Will Rock You - in memory of Freddie'
  },
  {
    // Coldplay
    url: 'https://www.timeoutbahrain.com/cloud/timeoutbahrain/2024/09/27/7f8c5b19-88b1-4b29-8ccf-d55f175efd0b-1-scaled.jpg',
    titleHr: 'Coldplay',
    titleEn: 'Coldplay',
    subtitleHr: 'A Sky Full of Stars',
    subtitleEn: 'A Sky Full of Stars'
  },
  {
    // Ed Sheeran
    url: 'https://i.ytimg.com/vi/sImgyNSsOyw/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLC30GcxPq3e60iRH50Kdw5SFkcyOg',
    titleHr: 'Ed Sheeran',
    titleEn: 'Ed Sheeran',
    subtitleHr: 'Shape of You Tour',
    subtitleEn: 'Shape of You Tour'
  },
  {
    // Gibonni
    url: 'https://istrain.hr/data/images/2025-06-22/12654_unnamed-2025-06-22t084148777_f.jpg?timestamp=1750543200',
    titleHr: 'Gibonni',
    titleEn: 'Gibonni',
    subtitleHr: 'Legenda hrvatske glazbe',
    subtitleEn: 'Legend of Croatian music'
  },
  {
    // Bijelo Dugme
    url: 'https://photorokaj.com/wp-content/uploads/2025/03/20250328-DSC_0305-scaled.jpg',
    titleHr: 'Bijelo Dugme',
    titleEn: 'Bijelo Dugme',
    subtitleHr: 'Legenda ex-Yu rocka',
    subtitleEn: 'Ex-Yu rock legends'
  }
];

export default function Landing({ onNavigate }: LandingProps) {
  const { lang } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  
  // Auto-advance slideshow - resets when manually changed
  useEffect(() => {
    if (!autoPlay) {
      const timeout = setTimeout(() => setAutoPlay(true), 3000);
      return () => clearTimeout(timeout);
    }
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [autoPlay]);

  const nextSlide = () => {
    setAutoPlay(false); // Pause auto-advance
    setCurrentSlide((prev) => (prev + 1) % slideshowImages.length);
  };

  const prevSlide = () => {
    setAutoPlay(false); // Pause auto-advance
    setCurrentSlide((prev) => (prev - 1 + slideshowImages.length) % slideshowImages.length);
  };
  
  const goToSlide = (index: number) => {
    setAutoPlay(false); // Pause auto-advance
    setCurrentSlide(index);
  };
  
  const features = lang === 'hr' ? [
    '🎵 Kreiraj glazbeni profil',
    '🎯 Pronađi matchane korisnike',
    '🎪 Otkrivaj koncerte u blizini',
    '💌 Direktni chat s ljudima'
  ] : [
    '🎵 Create your music profile',
    '🎯 Find matched users',
    '🎪 Discover concerts nearby',
    '💌 Direct chat with people'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 backdrop-blur-lg bg-slate-950/70 sticky top-0 z-30">
        <div className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-lagoon to-coral text-lg sm:text-xl font-black shadow-lg">TB</span>
            <div>
              <p className="text-base sm:text-lg font-bold">TuneBuddy</p>
              <p className="text-xs text-slate-400 hidden sm:block">Connect through music</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <LanguageSelector />
            <button
              onClick={() => onNavigate('login')}
              className="btn text-xs sm:text-sm border border-slate-700 bg-slate-900/50 hover:border-slate-500 px-3 py-1.5 sm:px-4 sm:py-2"
            >
              {t('login', lang)}
            </button>
            <button
              onClick={() => onNavigate('register')}
              className="btn text-xs sm:text-sm bg-gradient-to-r from-lagoon to-coral text-slate-900 font-semibold px-3 py-1.5 sm:px-4 sm:py-2"
            >
              {t('register', lang)}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section with Title */}
        <section className="text-center py-8 sm:py-12 px-4">
          <div className="flex justify-center mb-4 sm:mb-6">
            <span className="inline-flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-gradient-to-br from-lagoon/20 to-coral/20 text-3xl sm:text-5xl">
              <Music />
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black leading-tight mb-3 sm:mb-4">
            TuneBuddy — {lang === 'hr' ? 'Pronađi' : 'Find'} <span className="text-transparent bg-clip-text bg-gradient-to-r from-lagoon to-coral">{lang === 'hr' ? 'nove ljude' : 'new people'}</span>
            <br className="hidden sm:block" />
            <span className="sm:hidden"> </span>
            {lang === 'hr' ? 'kroz glazbu' : 'through music'}
          </h1>
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto">
            {t('landingSubtitle', lang)}
          </p>
        </section>

        {/* Full-width Slideshow - mekši prijelazi */}
        <section className="relative w-full">
          {/* Gornji gradient za stapanje s pozadinom */}
          <div className="absolute top-0 left-0 right-0 h-20 sm:h-32 bg-gradient-to-b from-slate-950 to-transparent z-10 pointer-events-none" />
          
          <div className="relative h-[280px] sm:h-[400px] md:h-[500px] overflow-hidden">
            {slideshowImages.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-[1500ms] ease-in-out ${
                  index === currentSlide 
                    ? 'opacity-100 scale-100 blur-0' 
                    : 'opacity-0 scale-110 blur-sm'
                }`}
              >
                <div 
                  className="absolute inset-0 bg-cover transform transition-transform duration-[8000ms] ease-linear"
                  style={{ 
                    backgroundImage: `url(${slide.url})`,
                    backgroundPosition: index === 0 ? 'center 30%' : 'center',
                    transform: index === currentSlide ? 'scale(1.05)' : 'scale(1)'
                  }}
                />
                {/* Mekši overlay gradienti za stopljniji izgled */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-slate-950/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-transparent to-slate-950/70" />
                <div className="absolute inset-0 bg-slate-950/20" />
                
                {/* Slide Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-center">
                  <h3 className="text-2xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                    {lang === 'hr' ? slide.titleHr : slide.titleEn}
                  </h3>
                  <p className="text-base sm:text-xl text-slate-200 drop-shadow-md">
                    {lang === 'hr' ? slide.subtitleHr : slide.subtitleEn}
                  </p>
                </div>
              </div>
            ))}

            {/* Navigation Arrows - mekši stil */}
            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white/90 transition-all z-20 border border-white/10"
            >
              <ChevronLeft size={24} className="sm:w-8 sm:h-8" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white/90 transition-all z-20 border border-white/10"
            >
              <ChevronRight size={24} className="sm:w-8 sm:h-8" />
            </button>

            {/* Slide Indicators - mekši stil */}
            <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {slideshowImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    index === currentSlide 
                      ? 'bg-gradient-to-r from-lagoon to-coral w-8 shadow-lg shadow-coral/30' 
                      : 'bg-white/30 hover:bg-white/50 w-2'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Donji gradient za stapanje s pozadinom */}
          <div className="absolute bottom-0 left-0 right-0 h-20 sm:h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
        </section>

        {/* Features & CTA Section */}
        <section className="py-10 sm:py-16 px-4 sm:px-6 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
              <p className="text-xs sm:text-sm text-slate-400 text-center">{t('features', lang)}:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg sm:rounded-xl border border-slate-800 bg-slate-900/50 px-3 sm:px-4 py-2 sm:py-3 hover:border-lagoon/50 transition">
                    <span className="text-base sm:text-lg">{feature.split(' ')[0]}</span>
                    <span className="text-sm sm:text-base text-slate-300">{feature.split(' ').slice(1).join(' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => onNavigate('register')}
                className="btn bg-gradient-to-r from-lagoon to-coral text-slate-900 font-semibold text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 gap-2 justify-center shadow-lg hover:shadow-lagoon/25"
              >
                {t('getStarted', lang)} <ArrowRight />
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="btn border border-slate-700 bg-slate-900 text-slate-100 font-semibold text-base sm:text-lg px-6 sm:px-8 py-2.5 sm:py-3 justify-center hover:border-slate-500"
              >
                {t('haveAccount', lang)}
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800 bg-slate-950/70 py-4 sm:py-6">
        <div className="px-4 sm:px-6 text-center text-xs sm:text-sm text-slate-500">
          <p>© 2026 TuneBuddy — Tim: Karmen Grubić · Matea Begonja · Barbara Jezidžić</p>
        </div>
      </footer>
    </div>
  );
}
