export interface VerseBlock {
  numberInSurah: number;
  text: string;
  translation: string;
  transliteration: string;
  audio: string;
}

export interface SurahData {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  verses: VerseBlock[];
}

export const QURAN_API_BASE = "https://api.alquran.cloud/v1";

const surahCache = new Map<number, SurahData>();

export async function getFullSurahData(surahNumber: number): Promise<SurahData> {
  if (surahCache.has(surahNumber)) return surahCache.get(surahNumber)!;

  const [arRes, enRes, transRes] = await Promise.all([
    fetch(`${QURAN_API_BASE}/surah/${surahNumber}/ar.alafasy`),
    fetch(`${QURAN_API_BASE}/surah/${surahNumber}/en.sahih`),
    fetch(`${QURAN_API_BASE}/surah/${surahNumber}/en.transliteration`)
  ]);

  const arData = await arRes.json();
  const enData = await enRes.json();
  const transData = await transRes.json();

  const verses: VerseBlock[] = arData.data.ayahs.map((arAyah: any, i: number) => ({
    numberInSurah: arAyah.numberInSurah,
    text: arAyah.text,
    audio: arAyah.audio,
    translation: enData.data.ayahs[i].text,
    transliteration: transData.data.ayahs[i].text
  }));

  const result = {
    number: arData.data.number,
    name: arData.data.name,
    englishName: arData.data.englishName,
    numberOfAyahs: arData.data.ayahs.length,
    verses
  };

  surahCache.set(surahNumber, result);
  return result;
}
