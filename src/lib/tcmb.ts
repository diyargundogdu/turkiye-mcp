// TCMB'nin kamuya açık "gösterge niteliğindeki" döviz kurları.
// https://www.tcmb.gov.tr/kurlar/today.xml

export interface Kur {
  kod: string;
  isim: string;
  birim: number;
  dovizAlis: number | null;
  dovizSatis: number | null;
  efektifAlis: number | null;
  efektifSatis: number | null;
}

const sayi = (s?: string) => (s && s.trim() ? Number(s.trim()) : null);
const etiket = (blok: string, ad: string) => blok.match(new RegExp(`<${ad}>([^<]*)</${ad}>`))?.[1];

export function xmlCozumle(xml: string): { tarih: string; kurlar: Kur[] } {
  const tarih = xml.match(/Tarih="([^"]+)"/)?.[1] ?? "";
  const kurlar: Kur[] = [];
  for (const m of xml.matchAll(/<Currency[^>]*CurrencyCode="([A-Z]+)"[^>]*>([\s\S]*?)<\/Currency>/g)) {
    const b = m[2];
    kurlar.push({
      kod: m[1],
      isim: etiket(b, "Isim")?.trim() ?? "",
      birim: Number(etiket(b, "Unit") ?? 1),
      dovizAlis: sayi(etiket(b, "ForexBuying")),
      dovizSatis: sayi(etiket(b, "ForexSelling")),
      efektifAlis: sayi(etiket(b, "BanknoteBuying")),
      efektifSatis: sayi(etiket(b, "BanknoteSelling")),
    });
  }
  return { tarih, kurlar };
}

export function tcmbUrl(tarih?: string): string {
  if (!tarih) return "https://www.tcmb.gov.tr/kurlar/today.xml";
  const [y, a, g] = tarih.split("-");
  return `https://www.tcmb.gov.tr/kurlar/${y}${a}/${g}${a}${y}.xml`;
}

export async function kurlariGetir(tarih?: string) {
  const res = await fetch(tcmbUrl(tarih), { headers: { "User-Agent": "turkiye-mcp" } });
  if (res.status === 404) throw new Error("Bu tarih için kur yayımlanmamış (hafta sonu/tatil olabilir).");
  if (!res.ok) throw new Error(`TCMB yanıt vermedi: HTTP ${res.status}`);
  return xmlCozumle(await res.text());
}
