# 🔥 FIREBASE SETUP GUIDE - Global Highscore System

## 📋 Hvad er tilføjet?

Italian Brainrot har nu et **hybrid highscore system**:
- 📱 **Local Highscores** - Gemmes i browser localStorage (virker altid)
- 🌍 **Global Highscores** - Gemmes i Firebase Realtime Database (delt mellem alle spillere)

---

## 🚀 SETUP TRIN

### **1. Opret Firebase Projekt**

1. Gå til [Firebase Console](https://console.firebase.google.com/)
2. Klik **"Add project"** eller **"Tilføj projekt"**
3. Navngiv projektet: `italian-brainrot` (eller vælg dit eget navn)
4. Deaktiver Google Analytics (ikke nødvendigt for dette projekt)
5. Klik **"Create project"**

---

### **2. Aktiver Realtime Database**

1. I Firebase Console, klik på **"Realtime Database"** i venstre menu
2. Klik **"Create Database"**
3. Vælg location: **Europe (europe-west1)** (tættest på Danmark)
4. Start i **"Test mode"** (vi ændrer regler senere)
5. Klik **"Enable"**

---

### **3. Konfigurer Database Regler**

1. Gå til **"Rules"** tab i Realtime Database
2. Erstat reglerne med følgende:

```json
{
  "rules": {
    "highscores": {
      ".read": true,
      ".write": true,
      "$scoreId": {
        ".validate": "newData.hasChildren(['name', 'score', 'mode', 'date'])",
        "name": {
          ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 20"
        },
        "score": {
          ".validate": "newData.isNumber() && newData.val() >= 0"
        },
        "mode": {
          ".validate": "newData.isString()"
        },
        "date": {
          ".validate": "newData.isNumber()"
        }
      }
    }
  }
}
```

3. Klik **"Publish"**

**Hvad gør disse regler?**
- ✅ Alle kan læse highscores
- ✅ Alle kan skrive highscores
- ✅ Validerer at scores har korrekt format
- ✅ Begrænser navn til max 20 tegn
- ✅ Sikrer at score er et positivt tal

---

### **4. Hent Firebase Config**

1. Gå til **Project Settings** (tandhjul-ikon øverst til venstre)
2. Scroll ned til **"Your apps"**
3. Klik på **"Web"** ikonet (`</>`)
4. Navngiv appen: `Italian Brainrot Web`
5. **VIGTIGT:** Vælg **IKKE** "Also set up Firebase Hosting"
6. Klik **"Register app"**
7. Kopier `firebaseConfig` objektet

---

### **5. Opdater firebase-config.js**

1. Åbn filen `firebase-config.js` i projektet
2. Find linjen med `const firebaseConfig = {`
3. Erstat hele objektet med din Firebase config:

```javascript
const firebaseConfig = {
    apiKey: "DIN_API_KEY_HER",
    authDomain: "italian-brainrot.firebaseapp.com",
    databaseURL: "https://italian-brainrot-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "italian-brainrot",
    storageBucket: "italian-brainrot.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
};
```

4. Gem filen

---

## ✅ TEST AT DET VIRKER

1. Åbn `index.html` i en browser
2. Åbn Developer Console (F12)
3. Du skulle se: `✅ Firebase initialized successfully`
4. Spil et spil og få en highscore
5. Gå til highscore-skærmen
6. Klik på **"🌍 Global"** tab
7. Din score skulle vises!

---

## 🔒 SIKKERHED (VIGTIGT!)

### **Nuværende Setup:**
- ⚠️ **Test mode** - Alle kan læse og skrive
- ✅ **OK til udvikling og test**
- ❌ **IKKE OK til produktion**

### **Før du går live:**

1. **Tilføj rate limiting** i Firebase Console:
   - Gå til Realtime Database → Usage
   - Sæt limits på writes per bruger

2. **Overvej at tilføje:**
   - Spam-beskyttelse (max 1 score per minut)
   - Profanity filter på navne
   - Score validering (max score baseret på game mode)

3. **Opdater regler** til at inkludere rate limiting:

```json
{
  "rules": {
    "highscores": {
      ".read": true,
      ".write": "!data.exists() || (now - data.child('timestamp').val() > 60000)",
      "$scoreId": {
        ".validate": "newData.hasChildren(['name', 'score', 'mode', 'date', 'timestamp'])"
      }
    }
  }
}
```

---

## 📊 FIREBASE GRATIS TIER

**Hvad får du gratis?**
- ✅ 1 GB stored data
- ✅ 10 GB/måned downloaded
- ✅ 100 simultaneous connections
- ✅ Unlimited uploads

**Er det nok?**
- ✅ Ja! For et highscore system er det mere end rigeligt
- Hver highscore entry er ~100 bytes
- 1 GB = ~10 millioner highscores
- 10 GB download = ~100.000 highscore views/måned

---

## 🎮 HVORDAN SYSTEMET VIRKER

### **For Spillere:**

1. **Spil et spil** → Få en score
2. **Indtast navn** → Score gemmes lokalt OG globalt
3. **Se highscores:**
   - 📱 **Local tab** - Dine egne scores på denne enhed
   - 🌍 **Global tab** - Top 50 scores fra hele verden

### **Teknisk:**

- **Local scores:** localStorage (instant, altid tilgængelig)
- **Global scores:** Firebase Realtime Database (synkroniseret)
- **Fallback:** Hvis Firebase fejler, virker local scores stadig
- **Hybrid:** Begge systemer kører parallelt

---

## 🐛 TROUBLESHOOTING

### **"Firebase not initialized"**
- Tjek at `firebase-config.js` er loaded før `game.js`
- Tjek at Firebase SDK scripts er loaded
- Åbn Console (F12) for fejlmeddelelser

### **"Permission denied"**
- Tjek Firebase Database Rules
- Sørg for at `.read` og `.write` er `true`

### **Scores vises ikke i Global tab**
- Tjek internet forbindelse
- Åbn Firebase Console → Realtime Database
- Verificer at data bliver skrevet

### **"Loading scores..." hænger**
- Tjek Firebase Database URL i config
- Verificer at databasen er aktiveret
- Tjek browser console for fejl

---

## 📝 NÆSTE SKRIDT

1. ✅ Følg setup-guiden ovenfor
2. ✅ Test at scores gemmes og vises
3. ✅ Del linket med venner og test global leaderboard
4. ⚠️ Overvej sikkerhedsforanstaltninger før produktion

---

## 💡 FREMTIDIGE FORBEDRINGER

**Mulige features:**
- 🏆 Ugentlige/månedlige leaderboards
- 🎯 Separate leaderboards per game mode
- 🌍 Country flags baseret på IP
- 👤 Bruger-profiler med avatars
- 📊 Statistik og grafer
- 🔔 Notifikationer når nogen slår din score

**Vil du have hjælp til at implementere disse?** Bare sig til! 🚀
