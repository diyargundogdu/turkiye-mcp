// Yalnızca algoritmik format kontrolü yapar. Hiçbir veri saklanmaz veya dışarı gönderilmez.

export interface Sonuc {
  gecerli: boolean;
  neden?: string;
}

export function tcknDogrula(girdi: string): Sonuc {
  const t = girdi.replace(/\s/g, "");
  if (!/^\d{11}$/.test(t)) return { gecerli: false, neden: "11 haneli rakam olmalı" };
  if (t[0] === "0") return { gecerli: false, neden: "İlk hane 0 olamaz" };
  const d = [...t].map(Number);
  const tek = d[0] + d[2] + d[4] + d[6] + d[8];
  const cift = d[1] + d[3] + d[5] + d[7];
  const h10 = (((tek * 7 - cift) % 10) + 10) % 10;
  if (h10 !== d[9]) return { gecerli: false, neden: "10. hane kontrolü başarısız" };
  const h11 = d.slice(0, 10).reduce((a, b) => a + b, 0) % 10;
  if (h11 !== d[10]) return { gecerli: false, neden: "11. hane kontrolü başarısız" };
  return { gecerli: true };
}

export function vknDogrula(girdi: string): Sonuc {
  const v = girdi.replace(/\s/g, "");
  if (!/^\d{10}$/.test(v)) return { gecerli: false, neden: "10 haneli rakam olmalı" };
  const d = [...v].map(Number);
  let toplam = 0;
  for (let i = 0; i < 9; i++) {
    const tmp = (d[i] + (9 - i)) % 10;
    let deger = (tmp * 2 ** (9 - i)) % 9;
    if (tmp !== 0 && deger === 0) deger = 9;
    toplam += deger;
  }
  const kontrol = (10 - (toplam % 10)) % 10;
  if (kontrol !== d[9]) return { gecerli: false, neden: "Kontrol hanesi uyuşmuyor" };
  return { gecerli: true };
}

export interface IbanSonuc extends Sonuc {
  bicimli?: string;
  bankaKodu?: string;
  hesapNo?: string;
}

export function ibanDogrula(girdi: string): IbanSonuc {
  const iban = girdi.replace(/\s/g, "").toUpperCase();
  if (!/^TR\d{24}$/.test(iban)) return { gecerli: false, neden: "TR ile başlayan 26 karakter olmalı" };
  const yeniden = iban.slice(4) + iban.slice(0, 4);
  const sayisal = yeniden.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let kalan = 0;
  for (const ch of sayisal) kalan = (kalan * 10 + Number(ch)) % 97;
  if (kalan !== 1) return { gecerli: false, neden: "Kontrol basamakları (mod 97) hatalı" };
  return {
    gecerli: true,
    bicimli: iban.match(/.{1,4}/g)!.join(" "),
    bankaKodu: iban.slice(4, 9),
    hesapNo: iban.slice(10),
  };
}
