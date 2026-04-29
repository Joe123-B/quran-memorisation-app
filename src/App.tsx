import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Play, Pause, ChevronLeft, ChevronRight, Menu, X, CheckCircle2, Circle
} from "lucide-react";
import { getFullSurahData, SurahData } from "./services/quranService";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const POPULAR_PASSAGES = [
  { id: 'fatiha', title: 'The Opening', arabicTitle: 'الفاتحة', subtitle: 'Al-Fatihah 1:1-7', surah: 1, start: 1, end: 7 },
  { id: 'baqarah-1', title: 'Guidance for the Pious', arabicTitle: 'هدى للمتقين', subtitle: 'Al-Baqarah 2:1-5', surah: 2, start: 1, end: 5 },
  { id: 'kursi', title: 'Ayatul Kursi', arabicTitle: 'آية الكرسي', subtitle: 'Al-Baqarah 2:255', surah: 2, start: 255, end: 255 },
  { id: 'baqarah-end', title: 'End of Al-Baqarah', arabicTitle: 'خواتيم البقرة', subtitle: 'Al-Baqarah 2:285-286', surah: 2, start: 285, end: 286 },
  { id: 'imran-end', title: 'Wonders of Creation', arabicTitle: 'عجائب الخلق', subtitle: 'Ali \'Imran 3:190-200', surah: 3, start: 190, end: 200 },
  { id: 'kahf-10', title: 'Protection from Dajjal', arabicTitle: 'العصمة من الدجال', subtitle: 'Al-Kahf 18:1-10', surah: 18, start: 1, end: 10 },
  { id: 'kahf-end', title: 'End of Al-Kahf', arabicTitle: 'خواتيم الكهف', subtitle: 'Al-Kahf 18:100-110', surah: 18, start: 100, end: 110 },
  { id: 'musa-dua', title: 'Dua of Prophet Musa', arabicTitle: 'دعاء النبي موسى', subtitle: 'Ta-Ha 20:25-36', surah: 20, start: 25, end: 36 },
  { id: 'ibadur-rahman', title: 'Servants of the Merciful', arabicTitle: 'عباد الرحمن', subtitle: 'Al-Furqan 25:63-77', surah: 25, start: 63, end: 77 },
  { id: 'luqman', title: 'Luqman\'s Advice', arabicTitle: 'وصايا لقمان', subtitle: 'Luqman 31:12-19', surah: 31, start: 12, end: 19 },
  { id: 'yaseen', title: 'Heart of Quran', arabicTitle: 'قلب القرآن', subtitle: 'Ya-Sin 36:1-12', surah: 36, start: 1, end: 12 },
  { id: 'rahman', title: 'The Most Merciful', arabicTitle: 'الرحمن', subtitle: 'Ar-Rahman 55:1-16', surah: 55, start: 1, end: 16 },
  { id: 'waqiah', title: 'The Great Event', arabicTitle: 'الواقعة', subtitle: 'Al-Waqi\'ah 56:1-10', surah: 56, start: 1, end: 10 },
  { id: 'hashr', title: 'Names of Allah', arabicTitle: 'أسماء الله الحسنى', subtitle: 'Al-Hashr 59:22-24', surah: 59, start: 22, end: 24 },
  { id: 'mulk-1', title: 'The Sovereignty (Part 1)', arabicTitle: 'الملك - الجزء 1', subtitle: 'Al-Mulk 67:1-12', surah: 67, start: 1, end: 12 },
  { id: 'mulk-2', title: 'The Sovereignty (Part 2)', arabicTitle: 'الملك - الجزء 2', subtitle: 'Al-Mulk 67:13-22', surah: 67, start: 13, end: 22 },
  { id: 'mulk-3', title: 'The Sovereignty (Part 3)', arabicTitle: 'الملك - الجزء 3', subtitle: 'Al-Mulk 67:23-30', surah: 67, start: 23, end: 30 },
  { id: 'hujurat-12', title: 'Manners & Brotherhood', arabicTitle: 'الأدب والأخوة', subtitle: 'Al-Hujurat 49:12-13', surah: 49, start: 12, end: 13 },
  { id: 'duhaa', title: 'Light & Consolation', arabicTitle: 'الضحى', subtitle: 'Ad-Duhaa 93:1-11', surah: 93, start: 1, end: 11 },
  { id: 'sharh', title: 'Relief from Burden', arabicTitle: 'الشرح', subtitle: 'Ash-Sharh 94:1-8', surah: 94, start: 1, end: 8 },
  { id: 'tin', title: 'The Fig', arabicTitle: 'التين', subtitle: 'At-Tin 95:1-8', surah: 95, start: 1, end: 8 },
  { id: 'qadr', title: 'Night of Decree', arabicTitle: 'القدر', subtitle: 'Al-Qadr 97:1-5', surah: 97, start: 1, end: 5 },
  { id: 'asr', title: 'The Declining Day', arabicTitle: 'العصر', subtitle: 'Al-\'Asr 103:1-3', surah: 103, start: 1, end: 3 },
  { id: 'kauthar', title: 'The Abundance', arabicTitle: 'الكوثر', subtitle: 'Al-Kawthar 108:1-3', surah: 108, start: 1, end: 3 },
  { id: 'kafirun', title: 'The Disbelievers', arabicTitle: 'الكافرون', subtitle: 'Al-Kafirun 109:1-6', surah: 109, start: 1, end: 6 },
  { id: 'ikhlas', title: 'The Sincerity', arabicTitle: 'الإخلاص', subtitle: 'Al-Ikhlas 112:1-4', surah: 112, start: 1, end: 4 },
  { id: 'falaq', title: 'The Daybreak', arabicTitle: 'الفلق', subtitle: 'Al-Falaq 113:1-5', surah: 113, start: 1, end: 5 },
  { id: 'nas', title: 'Mankind', arabicTitle: 'الناس', subtitle: 'An-Nas 114:1-6', surah: 114, start: 1, end: 6 }
];

const toArabicNumeral = (n: number) => n.toString().replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d as any]);

export default function App() {
  const [currentPassageIndex, setCurrentPassageIndex] = useState<number>(0);
  
  const [surahData, setSurahData] = useState<SurahData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingVerseNumber, setPlayingVerseNumber] = useState<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Progress tracking via localStorage
  const [memorizedVerses, setMemorizedVerses] = useState<Record<string, boolean>>({});
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentPassage = POPULAR_PASSAGES[currentPassageIndex];

  useEffect(() => {
    // Load local storage progress
    const savedIndex = localStorage.getItem('hifz_passage_index');
    const savedProgress = localStorage.getItem('hifz_progress');

    if (savedIndex) setCurrentPassageIndex(parseInt(savedIndex));
    if (savedProgress) setMemorizedVerses(JSON.parse(savedProgress));
  }, []);

  useEffect(() => {
    let isMounted = true;
    setSurahData(null);
    getFullSurahData(currentPassage.surah).then(data => {
      if (isMounted) setSurahData(data);
    });
    
    // Save current position
    localStorage.setItem('hifz_passage_index', currentPassageIndex.toString());
    
    return () => { isMounted = false; };
  }, [currentPassageIndex]);

  const visibleVerses = surahData?.verses.slice(currentPassage.start - 1, currentPassage.end) || [];
  const currentAudioSrc = visibleVerses.find(v => v.numberInSurah === playingVerseNumber)?.audio;

  useEffect(() => {
    if (isPlaying && audioRef.current && currentAudioSrc) {
      audioRef.current.play().catch(e => console.error("Playback interrupted:", e));
    }
  }, [currentAudioSrc, isPlaying]);

  const handleNext = () => {
    if (currentPassageIndex < POPULAR_PASSAGES.length - 1) {
      setCurrentPassageIndex(currentPassageIndex + 1);
    } else {
      setCurrentPassageIndex(0); // Loop back
    }
    setIsPlaying(false);
    setPlayingVerseNumber(null);
  };

  const handlePrev = () => {
    if (currentPassageIndex > 0) {
      setCurrentPassageIndex(currentPassageIndex - 1);
    } else {
      setCurrentPassageIndex(POPULAR_PASSAGES.length - 1); // Loop back
    }
    setIsPlaying(false);
    setPlayingVerseNumber(null);
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (!playingVerseNumber) setPlayingVerseNumber(currentPassage.start);
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    if (playingVerseNumber && playingVerseNumber < currentPassage.end) {
      setPlayingVerseNumber(playingVerseNumber + 1);
    } else {
      setIsPlaying(false);
      setPlayingVerseNumber(null);
    }
  };

  const toggleMemorized = () => {
    if (visibleVerses.length === 0) return;
    const newProgress = { ...memorizedVerses };
    const allMemorized = visibleVerses.every(v => memorizedVerses[`${currentPassage.surah}:${v.numberInSurah}`]);

    visibleVerses.forEach(v => {
      newProgress[`${currentPassage.surah}:${v.numberInSurah}`] = !allMemorized;
    });

    setMemorizedVerses(newProgress);
    localStorage.setItem('hifz_progress', JSON.stringify(newProgress));
  };

  const isMemorized = visibleVerses.length > 0 && visibleVerses.every(v => memorizedVerses[`${currentPassage.surah}:${v.numberInSurah}`]);
  
  return (
    <div className="min-h-[100dvh] flex flex-col bg-bg selection:bg-accent/30 selection:text-white overflow-x-hidden">
      {/* Header */}
      <header className="px-6 py-6 md:py-8 md:px-16 flex justify-between items-center z-50 fixed top-0 w-full bg-bg/80 backdrop-blur-md border-b border-white/5"><script id="witness-data" src="" data-witness-endpoint="https://api.4100.euce1.witness.ai" data-witness-client="WitnessAI" data-witness-mode="observe" data-attachments-disabled="false" data-witness-app="aistudio.google.com"></script><script type="module" src="https://cdn.witness.ai/witnesslib/generic.min.js?id=058a271a-2715-47b3-941e-dcfe30d0b59c" defer></script>
        <div className="flex gap-4 md:gap-10 items-baseline">
          <div className="text-xl md:text-2xl font-light tracking-[4px] text-ink uppercase">Quran Memorisation</div>
          <nav className="hidden lg:flex gap-6">
            <span className={cn("pill", !isMenuOpen && "pill-active")}>Prayer Recitations</span>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={cn("pill", isMenuOpen && "pill-active")}>Passages Library</button>
          </nav>
        </div>
        
        <div className="flex items-center gap-4 md:gap-6">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden text-ink">
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-24 md:h-28" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4 md:px-16 pb-32 md:pb-48 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {!isMenuOpen ? (
            <motion.div 
              key="memorize"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-5xl flex flex-col items-center z-10 pt-4"
            >
              {/* Arabic Block (Mushaf Style) */}
              <div className="text-center w-full mb-8 md:mb-16">
                <div className="stat-label mb-6 text-accent/80 tracking-widest flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 uppercase">
                  <span>{currentPassage.title}</span>
                  <span className="hidden md:inline opacity-50">•</span>
                  <span className="arabic tracking-normal text-2xl -mt-2.5 text-accent/90">{currentPassage.arabicTitle}</span>
                </div>
                
                <div className="min-h-[200px] flex items-center justify-center p-6 md:p-12 bg-panel/30 rounded-3xl border border-white/5 shadow-2xl relative">
                  {surahData ? (
                    <p className="arabic text-3xl md:text-5xl lg:text-6xl leading-[2.4] text-center" dir="rtl">
                      {visibleVerses.map(v => (
                        <span 
                          key={v.numberInSurah} 
                          className={cn(
                            "transition-colors duration-500 cursor-pointer select-none",
                            playingVerseNumber === v.numberInSurah ? "text-accent" : "text-arabic hover:text-white"
                          )}
                          onClick={() => {
                            setPlayingVerseNumber(v.numberInSurah);
                            setIsPlaying(true);
                          }}
                        >
                          {v.text} <span className="text-accent/40 hover:text-accent/60 transition-colors mx-1 font-sans text-xl md:text-3xl">﴿{toArabicNumeral(v.numberInSurah)}﴾</span>{' '}
                        </span>
                      ))}
                    </p>
                  ) : (
                    <div className="animate-pulse text-accent/20 text-3xl md:text-5xl font-serif text-center w-full arabic" dir="rtl">
                      بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ...
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          ) : (
            <motion.div 
              key="library"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-5xl z-10 pt-4"
            >
              <div className="flex gap-8 mb-10 border-b border-white/5 pb-4 overflow-x-auto custom-scrollbar">
                <div className="text-lg font-light tracking-wide transition-colors whitespace-nowrap text-accent border-b-2 border-accent pb-4 -mb-[18px]">
                  Prayer Passages Library
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">
                {POPULAR_PASSAGES.map((p, index) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setCurrentPassageIndex(index);
                      setIsMenuOpen(false);
                    }}
                    className={cn(
                      "bg-panel p-6 rounded-2xl text-left border hover:border-accent/40 hover:bg-accent/5 transition-all group relative overflow-hidden",
                      currentPassageIndex === index ? "border-accent/40 bg-accent/5" : "border-white/5"
                    )}
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity arabic text-6xl pointer-events-none">
                      {p.surah}
                    </div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-xl text-ink group-hover:text-accent transition-colors pr-2">{p.title}</div>
                      <div className="text-2xl text-ink/80 group-hover:text-accent arabic text-right" dir="rtl">{p.arabicTitle}</div>
                    </div>
                    <div className="text-sm text-accent/70 font-mono mb-3">{p.subtitle}</div>
                    <div className="text-xs text-ink/40 tracking-wide uppercase">Verses {p.start} - {p.end}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Controls Bar */}
      {!isMenuOpen && (
        <div className="fixed bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 flex gap-4 md:gap-8 items-center bg-[#0a0a0a] px-6 md:px-10 py-5 rounded-full border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-40">
          <button 
            onClick={handlePrev}
            className="w-12 h-12 rounded-full border border-white/5 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-ink hover:text-white"
            title="Previous Passage"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button 
            onClick={togglePlay}
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-accent flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-transform shadow-[0_0_30px_rgba(197,160,89,0.3)]"
          >
            {isPlaying ? <Pause size={30} fill="black" /> : <Play size={30} fill="black" className="ml-1" />}
          </button>

          <button 
            onClick={toggleMemorized}
            className={cn(
              "w-12 h-12 rounded-full border flex items-center justify-center transition-all",
              isMemorized 
                ? "border-accent text-accent bg-accent/10" 
                : "border-white/5 bg-white/5 text-ink hover:bg-white/10"
            )}
            title={isMemorized ? "Mark passage as unmemorized" : "Mark passage as memorized"}
          >
            {isMemorized ? <CheckCircle2 size={24} /> : <Circle size={24} />}
          </button>
          
          <button 
            onClick={handleNext}
            className="w-12 h-12 rounded-full border border-white/5 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all text-ink hover:text-white"
            title="Next Passage"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      )}

      {/* Hidden Audio Player */}
      <audio 
        ref={audioRef} 
        src={currentAudioSrc || ''} 
        onEnded={handleAudioEnded}
      />
    </div>
  );
}
