# 🏆 GLOBAL HIGHSCORE SYSTEM

## ✅ Hvad er tilføjet?

Italian Brainrot har nu et **hybrid highscore system** med både lokale og globale scores!

### **📱 Local Highscores**
- Gemmes i browser localStorage
- Virker altid (også offline)
- Kun synlig på din enhed

### **🌍 Global Highscores**
- Gemmes i Firebase Realtime Database
- Delt mellem ALLE spillere
- Real-time opdateringer
- Top 50 scores vises

---

## 🚀 QUICK START

### **For at bruge systemet NU (uden Firebase):**
✅ Systemet virker allerede med **local highscores**!
- Spil et spil
- Se dine scores under "📱 Local" tab
- Alt fungerer uden setup

### **For at aktivere GLOBAL highscores:**
📖 Følg guiden i `FIREBASE_SETUP.md` (5-10 minutter)

---

## 🎮 SÅDAN VIRKER DET

1. **Spil et spil** → Få en score
2. **Indtast dit navn** (max 20 tegn)
3. **Score gemmes:**
   - ✅ Lokalt (instant)
   - ✅ Globalt (hvis Firebase er aktiveret)
4. **Se highscores:**
   - Klik på **"📱 Local"** for dine egne scores
   - Klik på **"🌍 Global"** for verdensranglisten

---

## 📊 FEATURES

✅ **Hybrid system** - Virker med eller uden Firebase
✅ **Tabs** - Skift mellem Local og Global
✅ **Real-time** - Global scores opdateres live
✅ **Fallback** - Hvis Firebase fejler, virker local stadig
✅ **Top 3 highlight** - Guld, sølv, bronze medaljer
✅ **Flersproget** - Alle sprog understøttet
✅ **Responsive** - Fungerer på mobil og desktop

---

## 🔧 TEKNISK OVERSIGT

### **Filer tilføjet/ændret:**

**NYE FILER:**
- `firebase-config.js` - Firebase konfiguration
- `FIREBASE_SETUP.md` - Detaljeret setup guide
- `README_HIGHSCORE.md` - Denne fil

**ÆNDREDE FILER:**
- `game.js` - Tilføjet global highscore funktioner
- `index.html` - Tilføjet Firebase SDK
- `style.css` - Tilføjet tab styling
- `translations.js` - Tilføjet highscore oversættelser

### **Nye funktioner i game.js:**

```javascript
HighscoreSystem.saveGlobal(name, score, mode)  // Gem til Firebase
HighscoreSystem.getGlobal(limit)               // Hent fra Firebase
HighscoreSystem.switchView('local'|'global')   // Skift tab
HighscoreSystem.renderLocal()                  // Vis lokale scores
HighscoreSystem.renderGlobal()                 // Vis globale scores
```

---

## 🌍 FIREBASE GRATIS TIER

**Hvad får du gratis?**
- ✅ 1 GB data storage
- ✅ 10 GB/måned downloads
- ✅ 100 samtidige forbindelser
- ✅ Ubegrænsede uploads

**Er det nok?**
- ✅ Ja! Rigeligt til et highscore system
- ~10 millioner highscores kan gemmes
- ~100.000 highscore views per måned

---

## 🔒 SIKKERHED

**Nuværende setup:**
- ⚠️ Test mode - Alle kan læse/skrive
- ✅ OK til udvikling
- ❌ Tilføj sikkerhed før produktion

**Anbefalinger:**
- Rate limiting (max 1 score per minut)
- Profanity filter på navne
- Score validering
- Se `FIREBASE_SETUP.md` for detaljer

---

## 💡 FREMTIDIGE FEATURES

Mulige udvidelser:
- 🏆 Ugentlige/månedlige leaderboards
- 🎯 Separate boards per game mode
- 🌍 Country flags
- 👤 Bruger-profiler
- 📊 Statistik og grafer
- 🔔 Notifikationer

---

## 📞 SUPPORT

**Problemer?**
1. Tjek `FIREBASE_SETUP.md` for troubleshooting
2. Åbn browser console (F12) for fejlmeddelelser
3. Verificer Firebase config i `firebase-config.js`

**Virker ikke?**
- Local highscores virker ALTID (uden Firebase)
- Global highscores kræver Firebase setup
- Systemet degrader gracefully hvis Firebase fejler

---

**Lav af: EricBuild AI Assistant** 🤖
**Dato: 2025-01-13**
