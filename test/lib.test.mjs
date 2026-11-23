import { test } from "node:test";
import assert from "node:assert/strict";
import { tcknDogrula, vknDogrula, ibanDogrula } from "../dist/lib/dogrulama.js";
import { tatiller, isGunuHesapla } from "../dist/lib/tatiller.js";
import { xmlCozumle, tcmbUrl } from "../dist/lib/tcmb.js";
import { ilBul } from "../dist/lib/iller.js";

test("TCKN", () => {
  assert.equal(tcknDogrula("10000000146").gecerli, true);
  assert.equal(tcknDogrula("10000000147").gecerli, false);
  assert.equal(tcknDogrula("01234567890").gecerli, false);
  assert.equal(tcknDogrula("123").gecerli, false);
});

test("VKN", () => {
  assert.equal(vknDogrula("1234567890").gecerli, true);
  assert.equal(vknDogrula("1234567891").gecerli, false);
  assert.equal(vknDogrula("0000000001").gecerli, true); // algoritmik olarak geçerli
  assert.equal(vknDogrula("abc").gecerli, false);
});

test("IBAN", () => {
  const r = ibanDogrula("TR33 0006 1005 1978 6457 8413 26");
  assert.equal(r.gecerli, true);
  assert.equal(r.bankaKodu, "00061");
  assert.equal(ibanDogrula("TR330006100519786457841327").gecerli, false);
  assert.equal(ibanDogrula("DE89370400440532013000").gecerli, false);
});

test("Tatiller 2026", () => {
  const t = tatiller(2026);
  assert.ok(t.some((x) => x.tarih === "2026-03-20" && x.ad.startsWith("Ramazan")));
  assert.ok(t.some((x) => x.tarih === "2026-05-26" && x.yarimGun));
  assert.equal(t.filter((x) => x.ad.startsWith("Kurban Bayramı ") && !x.yarimGun).length, 4);
});

test("İş günü", () => {
  // 2026-05-25 Pzt .. 2026-05-29 Cum: 25 iş, 26 yarım, 27-29 bayram
  const r = isGunuHesapla("2026-05-25", "2026-05-29");
  assert.equal(r.tamIsGunu, 1);
  assert.deepEqual(r.yarimIsGunu, ["2026-05-26"]);
  assert.equal(r.haftaIciTatiller.length, 3);
});

test("TCMB XML", () => {
  const xml = `<Tarih_Date Tarih="20.11.2026" Date="11/20/2026"><Currency CrossOrder="0" Kod="USD" CurrencyCode="USD"><Unit>1</Unit><Isim>ABD DOLARI</Isim><ForexBuying>42.1</ForexBuying><ForexSelling>42.2</ForexSelling><BanknoteBuying>42.0</BanknoteBuying><BanknoteSelling>42.3</BanknoteSelling></Currency><Currency Kod="XDR" CurrencyCode="XDR"><Unit>1</Unit><Isim>ÖZEL ÇEKME HAKKI (SDR)</Isim><ForexBuying>56.1</ForexBuying><ForexSelling></ForexSelling><BanknoteBuying></BanknoteBuying><BanknoteSelling></BanknoteSelling></Currency></Tarih_Date>`;
  const r = xmlCozumle(xml);
  assert.equal(r.tarih, "20.11.2026");
  assert.equal(r.kurlar[0].dovizSatis, 42.2);
  assert.equal(r.kurlar[1].efektifAlis, null);
  assert.equal(tcmbUrl("2026-11-20"), "https://www.tcmb.gov.tr/kurlar/202611/20112026.xml");
});

test("İl", () => {
  assert.deepEqual(ilBul("65"), [{ plaka: 65, il: "Van" }]);
  assert.equal(ilBul("istanbul")[0].plaka, 34);
  assert.equal(ilBul("ığdır")[0].plaka, 76);
});
