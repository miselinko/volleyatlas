# VolleyAtlas 🏐

Mobile-first platforma za **mušku i žensku odbojku**: rezultati mečeva, statistika igrača, poređenje liga i transparentni izvori.

## Status v0.3
- **Web/PWA**: React + TypeScript + Vite, responzivan dizajn i mobilna navigacija.
- **Android**: Capacitor konfiguracija i GitHub Actions workflow za debug APK (workflow tek treba pokrenuti i proveriti).
- **API**: Django REST osnova, PostgreSQL model i health endpoint; baza nije produkciono podešena.
- **Podaci**: prvi kurirani istorijski uzorak rezultata muških liga, direktni linkovi ka izvorima. Ovo nije live feed niti kompletna sezonska statistika.
- Ženska odbojka je podržana u modelu/interfejsu, ali stvarni podaci još nisu uvezeni.

Arhitektura je inspirisana [POMAK](https://github.com/rumeni/pomak-deploy), ali ima **originalan interfejs i zaseban kod**.

### Monorepo

```
frontend/  React, TypeScript, Vite, PWA, Capacitor Android
backend/   Django API, modeli, validacija
data/      Kurirani stvarni primeri i pravila izvora
docs/      Arhitektura, mobilni build, plan uvoza
.github/   Web build i Android debug workflow
```

### Web lokalno
```sh
cd frontend
npm install
npm run build
npm run dev
```

### Android debug
```sh
cd frontend
npm install
npm run build
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```
Potreban je JDK 21 i Android SDK. Alternativa je GitHub Actions → Android debug APK → Run workflow. Debug APK nije potpisan za Play Store.

### Django API
```sh
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
Backend nije povezan sa prikazom na produkcionom sajtu dok ne postavimo PostgreSQL bazu i import.

## Važna pravila podataka
Izvorni zapisnik ili zvanična vest uz svaki meč; `null` znači nepoznato, a ne nula. Poeni iz nekoliko potvrđenih mečeva **nisu** sezonski ukupni poeni. Za masovno preuzimanje i ponovno objavljivanje podataka proveriti prava/ToS, po mogućnosti dobiti autorizovan feed.
