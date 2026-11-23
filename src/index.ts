#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { tcknDogrula, vknDogrula, ibanDogrula } from "./lib/dogrulama.js";
import { tatiller, isGunuHesapla, DESTEKLENEN_YILLAR } from "./lib/tatiller.js";
import { kurlariGetir } from "./lib/tcmb.js";
import { ilBul } from "./lib/iller.js";

const server = new McpServer({ name: "turkiye-mcp", version: "0.1.0" });
const json = (v: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(v, null, 2) }] });
const tarihSema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "YYYY-MM-DD formatında olmalı");

server.registerTool(
  "tcmb_doviz_kurlari",
  {
    title: "TCMB Döviz Kurları",
    description: "TCMB'nin yayımladığı gösterge niteliğindeki döviz kurlarını getirir. Tarih verilmezse bugünkü kurlar.",
    inputSchema: {
      tarih: tarihSema.optional().describe("YYYY-MM-DD (opsiyonel)"),
      kodlar: z.array(z.string()).optional().describe("Örn. ['USD','EUR']. Boşsa tümü."),
    },
  },
  async ({ tarih, kodlar }) => {
    try {
      const veri = await kurlariGetir(tarih);
      const filtre = kodlar?.map((k) => k.toUpperCase());
      const kurlar = filtre ? veri.kurlar.filter((k) => filtre.includes(k.kod)) : veri.kurlar;
      return json({ kaynak: "TCMB (gösterge niteliğinde)", tarih: veri.tarih, kurlar });
    } catch (e) {
      return { isError: true, content: [{ type: "text", text: (e as Error).message }] };
    }
  },
);

server.registerTool(
  "resmi_tatiller",
  {
    title: "Resmi Tatiller",
    description: `Türkiye resmi tatillerini listeler (yarım günler dahil). Dini bayramlar için desteklenen yıllar: ${DESTEKLENEN_YILLAR.join(", ")}.`,
    inputSchema: { yil: z.number().int().min(2000).max(2100) },
  },
  async ({ yil }) => {
    const uyari = DESTEKLENEN_YILLAR.includes(yil) ? undefined : "Bu yıl için dini bayram verisi yok; sadece sabit tatiller listelendi.";
    return json({ yil, uyari, tatiller: tatiller(yil) });
  },
);

server.registerTool(
  "is_gunu_hesapla",
  {
    title: "İş Günü Hesapla",
    description: "İki tarih arasındaki (dahil) iş günlerini hafta sonu ve resmi tatilleri düşerek hesaplar.",
    inputSchema: { baslangic: tarihSema, bitis: tarihSema },
  },
  async ({ baslangic, bitis }) => json(isGunuHesapla(baslangic, bitis)),
);

server.registerTool(
  "tckn_dogrula",
  {
    title: "TC Kimlik No Format Kontrolü",
    description: "TCKN'nin algoritmik olarak geçerli olup olmadığını kontrol eder. Kişinin var olduğunu DOĞRULAMAZ; veri saklanmaz.",
    inputSchema: { tckn: z.string() },
  },
  async ({ tckn }) => json(tcknDogrula(tckn)),
);

server.registerTool(
  "vkn_dogrula",
  {
    title: "Vergi Kimlik No Format Kontrolü",
    description: "10 haneli VKN'nin kontrol hanesini doğrular. Mükellefin varlığını sorgulamaz.",
    inputSchema: { vkn: z.string() },
  },
  async ({ vkn }) => json(vknDogrula(vkn)),
);

server.registerTool(
  "iban_dogrula",
  {
    title: "TR IBAN Kontrolü",
    description: "Türk IBAN'ının formatını ve mod-97 kontrol basamaklarını doğrular. Hesabın varlığını sorgulamaz.",
    inputSchema: { iban: z.string() },
  },
  async ({ iban }) => json(ibanDogrula(iban)),
);

server.registerTool(
  "il_bul",
  {
    title: "İl / Plaka Kodu",
    description: "Plaka kodundan il adını veya il adından plaka kodunu bulur.",
    inputSchema: { sorgu: z.string().describe("Plaka kodu (örn. '65') veya il adı (örn. 'van')") },
  },
  async ({ sorgu }) => json(ilBul(sorgu)),
);

await server.connect(new StdioServerTransport());
