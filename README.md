# turkiye-mcp 🇹🇷

Claude, Cursor ve diğer MCP uyumlu yapay zeka araçlarına **Türkiye'ye özgü veri ve doğrulama** yetenekleri kazandıran açık kaynak [Model Context Protocol](https://modelcontextprotocol.io) sunucusu.

> An open-source MCP server that gives AI assistants Turkey-specific tools: central bank exchange rates, public holidays, business-day math, and offline validation for Turkish ID / tax / IBAN numbers.

## Araçlar

| Araç | Ne yapar |
|---|---|
| `tcmb_doviz_kurlari` | TCMB'nin gösterge niteliğindeki döviz kurları (bugün veya geçmiş tarih) |
| `resmi_tatiller` | Yıla göre resmi tatiller, arife yarım günleri dahil |
| `is_gunu_hesapla` | İki tarih arası iş günü (hafta sonu + resmi tatil düşülür) |
| `tckn_dogrula` | TC Kimlik No algoritmik format kontrolü |
| `vkn_dogrula` | Vergi Kimlik No kontrol hanesi doğrulaması |
| `iban_dogrula` | TR IBAN formatı + mod-97 kontrolü, banka kodu ayrıştırma |
| `il_bul` | Plaka kodu ↔ il adı |

## Kurulum

Gereksinim: Node.js 18+

```bash
git clone https://github.com/diyargundogdu/turkiye-mcp.git
cd turkiye-mcp
npm install && npm run build
```

### Claude Desktop

`claude_desktop_config.json` dosyasına ekleyin:

```json
{
  "mcpServers": {
    "turkiye": {
      "command": "node",
      "args": ["/tam/yol/turkiye-mcp/dist/index.js"]
    }
  }
}
```

### Claude Code

```bash
claude mcp add turkiye -- node /tam/yol/turkiye-mcp/dist/index.js
```

### Cursor

`.cursor/mcp.json` içine yukarıdaki `mcpServers` bloğunu ekleyin.

## Örnek kullanım

- "Bugün dolar ve euro kaç TL?"
- "2026'da Kurban Bayramı hangi günler?"
- "1 Mayıs ile 31 Mayıs 2026 arasında kaç iş günü var?"
- "Şu IBAN geçerli mi: TR33 0006 1005 1978 6457 8413 26"

## Gizlilik ve sorumluluk

- **TCKN / VKN / IBAN araçları tamamen çevrimdışıdır.** Girilen değer hiçbir yere gönderilmez, kaydedilmez veya loglanmaz. Yalnızca matematiksel format kontrolü yapılır; kişinin, mükellefin veya hesabın **gerçekten var olduğunu doğrulamaz.**
- Proje hiçbir kurumun resmi sistemine (e-Devlet, NVİ, GİB vb.) bağlanmaz.
- Döviz kurları TCMB'nin kamuya açık XML yayınından alınır ve **gösterge niteliğindedir**; alım-satım işlemlerinde bankanızın kurunu esas alın.
- Dini bayram tarihleri Diyanet İşleri Başkanlığı takviminden alınmıştır (şu an 2025–2027). Ek tatil/idari izin kararları dahil değildir.
- Bu proje TCMB, Diyanet veya herhangi bir kamu kurumuyla bağlantılı değildir.

## Geliştirme

```bash
npm test
```

Yeni yılın bayram tarihlerini eklemek için `src/lib/tatiller.ts` içindeki `DINI` tablosunu güncelleyip PR açabilirsiniz.

## Lisans

[MIT](LICENSE) — Novaprovt
