export interface Tatil {
  tarih: string; // YYYY-MM-DD
  ad: string;
  yarimGun: boolean;
}

const SABIT: [string, string][] = [
  ["01-01", "Yılbaşı"],
  ["04-23", "Ulusal Egemenlik ve Çocuk Bayramı"],
  ["05-01", "Emek ve Dayanışma Günü"],
  ["05-19", "Atatürk'ü Anma, Gençlik ve Spor Bayramı"],
  ["07-15", "Demokrasi ve Millî Birlik Günü"],
  ["08-30", "Zafer Bayramı"],
  ["10-29", "Cumhuriyet Bayramı"],
];

// Kaynak: Diyanet İşleri Başkanlığı dini günler takvimi. Her yıl güncellenmeli.
const DINI: Record<number, { ramazan: string; kurban: string }> = {
  2025: { ramazan: "2025-03-30", kurban: "2025-06-06" },
  2026: { ramazan: "2026-03-20", kurban: "2026-05-27" },
  2027: { ramazan: "2027-03-09", kurban: "2027-05-16" },
};

export const DESTEKLENEN_YILLAR = Object.keys(DINI).map(Number);

function gunEkle(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function tatiller(yil: number): Tatil[] {
  const liste: Tatil[] = SABIT.map(([g, ad]) => ({ tarih: `${yil}-${g}`, ad, yarimGun: false }));
  liste.push({ tarih: `${yil}-10-28`, ad: "Cumhuriyet Bayramı Arifesi", yarimGun: true });

  const dini = DINI[yil];
  if (dini) {
    liste.push({ tarih: gunEkle(dini.ramazan, -1), ad: "Ramazan Bayramı Arifesi", yarimGun: true });
    for (let i = 0; i < 3; i++)
      liste.push({ tarih: gunEkle(dini.ramazan, i), ad: `Ramazan Bayramı ${i + 1}. Gün`, yarimGun: false });
    liste.push({ tarih: gunEkle(dini.kurban, -1), ad: "Kurban Bayramı Arifesi", yarimGun: true });
    for (let i = 0; i < 4; i++)
      liste.push({ tarih: gunEkle(dini.kurban, i), ad: `Kurban Bayramı ${i + 1}. Gün`, yarimGun: false });
  }
  return liste.sort((a, b) => a.tarih.localeCompare(b.tarih));
}

export function isGunuHesapla(baslangic: string, bitis: string) {
  if (baslangic > bitis) [baslangic, bitis] = [bitis, baslangic];
  const harita = new Map<string, Tatil>();
  const y1 = Number(baslangic.slice(0, 4));
  const y2 = Number(bitis.slice(0, 4));
  const eksikYillar: number[] = [];
  for (let y = y1; y <= y2; y++) {
    if (!DINI[y]) eksikYillar.push(y);
    for (const t of tatiller(y)) harita.set(t.tarih, t);
  }

  let tamGun = 0;
  const yarimGunler: string[] = [];
  const tatilGunleri: Tatil[] = [];
  for (let g = baslangic; g <= bitis; g = gunEkle(g, 1)) {
    const hafta = new Date(g + "T00:00:00Z").getUTCDay();
    if (hafta === 0 || hafta === 6) continue;
    const t = harita.get(g);
    if (!t) tamGun++;
    else if (t.yarimGun) yarimGunler.push(g);
    else tatilGunleri.push(t);
  }
  return { tamIsGunu: tamGun, yarimIsGunu: yarimGunler, haftaIciTatiller: tatilGunleri, eksikYillar };
}
