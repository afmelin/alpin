# Alpin – Shopify-tema

Mobilanpassat Shopify-tema (Online Store 2.0) för Alpins skidmärken.
Alla texter, bilder och produkter går att ändra under **Webbshop → Teman → Anpassa**.

## Kom igång

1. **Koppla temat från GitHub**
   Shopify-admin → *Webbshop → Teman → Lägg till tema → Anslut från GitHub* → välj repot `afmelin/alpin` och grenen `Shopify`.
   Ändringar som pushas till grenen dyker då upp i Shopify automatiskt.

2. **Skapa huvudprodukten**
   - Namn: *Alpin skidmärken*, URL-handtag: `alpin-skidmarken`
   - Alternativ "Paket" med två varianter:
     - *Startpaketet* – 349 kr
     - *Syskonpaketet* – 599 kr, jämförpris 698 kr
   - Startsidan, Märkena och Vårt mål använder produkten automatiskt via handtaget.
     Använder du ett annat handtag väljer du produkten i temaredigeraren.

3. **Skapa tilläggsprodukter** (valfritt)
   Extra märken (t.ex. 49 kr styck) och *Presentinslagning*. Välj dem sedan i:
   - Varukorgen → sektionen *Varukorg* → *Tillägg i varukorgen*
   - Sidan Märkena → varje märkesblock → *Produkt att sälja*

4. **Skapa sidorna** (*Webbshop → Sidor*)

   | Sida      | URL-handtag | Mall           |
   |-----------|-------------|----------------|
   | Märkena   | `markena`   | `page.markena` |
   | Vårt mål  | `var-mal`   | `page.var-mal` |
   | Kontakt   | `kontakt`   | `page.contact` |
   | Retur eller reklamation | `retur` | `page.retur` |

   Texten för *Vårt mål* skrivs i sidans innehållsfält.

5. **Meny** (*Webbshop → Navigering*)
   Huvudmenyn (`main-menu`): Hem, Märkena, Vårt mål, Kontakt. Utan meny visas dessa länkar automatiskt.

6. **Betalning** (*Inställningar → Betalningar*)
   Aktivera Shopify Payments för Visa/Mastercard och kontrollera att Klarna och Swish
   kan slås på för butiken. Betalsätten som är aktiverade visas automatiskt som ikoner på sidan.

7. **Frakt** (*Inställningar → Frakt och leverans*)
   Lägg in fri frakt från 499 kr. Gränsen för mätaren i varukorgen ställs in under
   *Temainställningar → Frakt*.

8. **Returer** (*Inställningar → Kundkonton* och *Inställningar → Policyer*)
   Använd de nya kundkontona och slå på självbetjänade returer (return rules).
   Kunden loggar då in med en engångskod och begär retur direkt på sin order.
   Reklamationer kommer in via formuläret på returssidan till butikens e-post.

## Struktur

```
layout/     theme.liquid (ram för alla sidor), password.liquid
sections/   alla sektioner som går att redigera i temaredigeraren
snippets/   återanvändbara delar (bildruta, betalikoner, produktkort)
templates/  vilka sektioner som visas på varje sidtyp
assets/     base.css, theme.js, mountains.svg
config/     temainställningar
```
