# RefuTree VMS - Vluchtelingen Management Systeem

Een professioneel vluchtelingen management systeem gebouwd met React, Tailwind CSS en moderne web technologieën.

## 🌟 Features

### 📊 Dashboard
- **Real-time statistieken** - Totaal bewoners, aanwezigheid, verlof, bezettingsgraad
- **Notificaties systeem** - Belangrijke updates en waarschuwingen
- **Recente activiteiten** - Live feed van alle acties
- **Verlofaanvragen** - Goedkeuring workflow
- **Bezettingsvisualisatie** - Per verdieping overzicht

### 👥 Bewoner Management
- **Uitgebreide profielen** - Met echte profielfoto's van Unsplash
- **Geavanceerde filters** - Status, aanwezigheid, nationaliteit, prioriteit, begeleider
- **Document management** - Upload, validatie en status tracking
- **Medische informatie** - Allergieën, medicatie, noodcontacten
- **Prioriteit systeem** - High, Normal, Low prioriteit levels
- **Caseworker toewijzing** - Persoonlijke begeleiding

### 📋 Documenten & Verlof
- **Document tracking** - Upload datum, validatie status, type
- **Verlof management** - Aanvragen, goedkeuring, afwijzing
- **Activiteiten logging** - Complete geschiedenis van acties
- **Notities systeem** - Belangrijke informatie per bewoner

### 🎨 UI/UX
- **Responsive design** - Werkt op desktop, tablet en mobiel
- **Moderne interface** - Clean, professioneel design
- **Toegankelijkheid** - Goede contrast en navigatie
- **Meertalig** - Nederlands en Engels ondersteuning

## 🚀 Installatie & Gebruik

### Vereisten
- Node.js 16+ 
- npm of yarn

### Setup
```bash
# Clone het project
git clone [repository-url]
cd RefuTree

# Installeer dependencies
npm install

# Start development server
npm run dev
```

### Build voor productie
```bash
npm run build
npm run preview
```

## 📱 Gebruik

### Dashboard
- **Overzicht** - Bekijk alle belangrijke statistieken
- **Notificaties** - Klik op de bel voor meldingen
- **Verlofaanvragen** - Goedkeuren/afwijzen met één klik
- **Bezettingsgraad** - Visualisatie per verdieping

### Bewoners
- **Zoeken** - Gebruik de zoekbalk voor snelle filtering
- **Filters** - Klik op "Filters" voor geavanceerde opties
- **Details** - Klik op het oog-icoon voor volledig profiel
- **Bewerken** - Klik op het potlood-icoon om te bewerken

### Nieuwe Bewoner Toevoegen
1. Klik op "Nieuwe Bewoner" knop
2. Vul alle verplichte velden in
3. Upload documenten indien beschikbaar
4. Klik "Opslaan"

## 🏗️ Technische Details

### Tech Stack
- **Frontend**: React 18 met Hooks
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Build Tool**: Vite
- **State Management**: useReducer

### Bestandsstructuur
```
src/
├── components/
│   └── VMS.jsx          # Hoofdcomponent
├── App.jsx              # App wrapper
├── main.jsx             # Entry point
└── index.css            # Global styles
```

### State Management
Het systeem gebruikt `useReducer` voor complexe state management:
- Bewoners data
- Verlofaanvragen
- Notificaties
- Filters en paginering
- Activiteiten logging

### Foto's
- **Bron**: Unsplash API
- **Formaat**: 150x150px, face crop
- **Fallback**: Automatische fallback bij laadfouten
- **Diversiteit**: Verschillende etniciteiten en leeftijden

## 🔧 Aanpassingen

### Nieuwe Bewoner Toevoegen
```javascript
const newResident = {
  id: Date.now(),
  name: 'Naam',
  photo: getRandomPhoto(), // Willekeurige foto
  nationality: 'Land',
  // ... andere velden
};
```

### Nieuwe Document Type
```javascript
documents: [
  {
    name: 'Document Naam',
    type: 'PDF',
    uploadDate: '2024-01-01',
    status: 'Gevalideerd' // of 'In behandeling'
  }
]
```

### Nieuwe Prioriteit Level
```javascript
priority: 'High' // High, Normal, Low
```

## 📊 Statistieken

Het systeem berekent automatisch:
- **Totaal bewoners**: Aantal geregistreerde bewoners
- **Aanwezigheid**: Aanwezig, Op verlof, Afwezig
- **Bezettingsgraad**: Percentage van totale capaciteit
- **Prioriteit**: High priority bewoners
- **Verlofaanvragen**: Pending requests

## 🎯 Toekomstige Features

- [ ] **Database integratie** - PostgreSQL/MongoDB
- [ ] **Authenticatie** - Login systeem
- [ ] **API endpoints** - REST API
- [ ] **Export functies** - PDF/Excel rapporten
- [ ] **Mobiele app** - React Native
- [ ] **Real-time updates** - WebSocket integratie
- [ ] **Advanced analytics** - Grafieken en trends
- [ ] **Multi-location** - Meerdere centra beheer

## 🤝 Bijdragen

1. Fork het project
2. Maak een feature branch
3. Commit je wijzigingen
4. Push naar de branch
5. Open een Pull Request

## 📄 Licentie

Dit project is gelicenseerd onder de MIT License.

## 📞 Support

Voor vragen of ondersteuning, neem contact op via:
- Email: support@refutree.nl
- GitHub Issues: [Repository Issues]

---

**RefuTree VMS** - Professioneel vluchtelingen management voor een betere wereld 🌍 