import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { Clock, Users, AlertTriangle, CheckCircle, XCircle, Calendar, FileText, Send, Download, Save, ChevronDown, User, Shield, Loader, Bell, Phone, ExternalLink, Eye, Lock } from 'lucide-react';
import DataService from '../../utils/dataService.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { useLocation } from '../../contexts/LocationContext.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';

// Dienst-specifieke checklists
const getChecklistForShift = (shift) => {
  const baseChecklist = [
    { categorie: "Veiligheid", vraag: "Zijn er incidenten geweest?", antwoord: "", toelichting: "", prioriteit: "hoog" },
    { categorie: "Veiligheid", vraag: "Zijn er calamiteiten geweest?", antwoord: "", toelichting: "", prioriteit: "hoog" },
    { categorie: "Activiteiten", vraag: "Zijn er activiteiten gedaan?", antwoord: "", toelichting: "", prioriteit: "normaal" },
    { categorie: "Taken", vraag: "Zijn alle algemene taken afgerond?", antwoord: "", toelichting: "", prioriteit: "normaal" },
    { categorie: "Taken", vraag: "Zijn alle bewoners taken afgerond?", antwoord: "", toelichting: "", prioriteit: "hoog" },
    { categorie: "Werkplek", vraag: "Is de werkplek netjes achtergelaten?", antwoord: "", toelichting: "", prioriteit: "normaal" },
    { categorie: "Overdracht", vraag: "Sleutels & piepers overgedragen?", antwoord: "", toelichting: "", prioriteit: "hoog" },
    { categorie: "Medicatie", vraag: "Zijn alle medicaties uitgegeven?", antwoord: "", toelichting: "", prioriteit: "hoog" },
    { categorie: "Communicatie", vraag: "Zijn alle berichten doorgenomen?", antwoord: "", toelichting: "", prioriteit: "normaal" }
  ];

  if (shift === 'Avonddienst') {
    baseChecklist.push({
      categorie: "Afsluiting", 
      vraag: "Sluitronde (gehele pand incl. tuin) uitgevoerd?", 
      antwoord: "", 
      toelichting: "", 
      prioriteit: "hoog"
    });
  }

  return baseChecklist;
};

// BHV informatie (alleen wat relevant is voor overdracht)
const emergencyInfo = {
  bhvBoard: "Aanmelden op BHV-bord bij start dienst",
  managementEmails: [
    "management@refutree.nl",
    "coordinator@refutree.nl", 
    "supervisor@refutree.nl"
  ]
};


const defaultData = {
  medewerker: "",
  shift: "",
  datum: new Date().toISOString().split('T')[0],
  startTijd: "",
  eindTijd: "",
  bhvAangemeld: false,
  sfeerimpressie: "",
  aanwezigeResidenten: [],
  afwezigeResidenten: [],
  bijzondereResidenten: [],
  rondes: Array(5).fill({ tijdstip: "", locatie: "", bijzonderheden: "", controles: "" }),
  checklist: getChecklistForShift('Ochtenddienst'),
  overdrachtBeveiliging: "",
  overdrachtVolgende: "",
  aandachtspunten: "",
  emailVerzonden: false,
  completed: false
};

export default function ShiftHandover() {
  const { currentUser } = useAuth();
  const { currentLocation } = useLocation();
  const { addNotification } = useNotification();
  
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(`handover-${new Date().toISOString().split('T')[0]}`);
    const handoverData = saved ? JSON.parse(saved) : { ...defaultData, medewerker: currentUser?.name || '' };
    return handoverData;
  });
  
  const [residents, setResidents] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('overzicht');
  const [activeShiftTab, setActiveShiftTab] = useState('ochtenddienst');
  const [toast, setToast] = useState("");
  const [sending, setSending] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showTaskLinks, setShowTaskLinks] = useState(false);

  // Load residents and incidents on mount
  useEffect(() => {
    const loadedResidents = DataService.getResidents() || [];
    const loadedIncidents = DataService.getIncidents() || [];
    setResidents(loadedResidents);
    setIncidents(loadedIncidents);
    
    // Generate suggestions based on resident status
    generateSuggestions(loadedResidents, loadedIncidents);
  }, []);

  // Update checklist when shift changes
  useEffect(() => {
    if (data.shift) {
      const newChecklist = getChecklistForShift(data.shift);
      setData(prev => ({
        ...prev,
        checklist: newChecklist
      }));
    }
  }, [data.shift]);

  // Auto-save and progress calculation
  useEffect(() => {
    localStorage.setItem(`handover-${data.datum}`, JSON.stringify(data));
    calculateProgress();
  }, [data]);

  const calculateProgress = () => {
    const essential = [
      data.medewerker, data.shift, data.startTijd, data.eindTijd,
      data.sfeerimpressie, data.overdrachtBeveiliging
    ];
    
    const checklistCompleted = data.checklist.filter(item => 
      item.prioriteit === 'hoog' ? item.antwoord && item.toelichting : item.antwoord
    ).length;
    
    const rondesCompleted = data.rondes.filter(ronde => 
      ronde.tijdstip && ronde.locatie
    ).length;
    
    const essentialCompleted = essential.filter(Boolean).length;
    const totalEssential = essential.length + data.checklist.filter(c => c.prioriteit === 'hoog').length;
    
    const progressValue = Math.round(
      ((essentialCompleted + checklistCompleted + (rondesCompleted * 0.5)) / 
       (totalEssential + (data.rondes.length * 0.5))) * 100
    );
    
    setProgress(Math.min(progressValue, 100));
  };

  const generateSuggestions = (residentsData, incidentsData) => {
    const suggestionsList = [];
    
    // High priority residents
    const highPriorityResidents = residentsData.filter(r => r.priority === 'High');
    if (highPriorityResidents.length > 0) {
      suggestionsList.push(
        `${highPriorityResidents.length} bewoner(s) hebben hoge prioriteit - extra aandacht vereist.`
      );
    }
    
    // Medical attention needed
    const medicalAttention = residentsData.filter(r => 
      r.medicalInfo?.medications?.length > 0 || r.medicalInfo?.allergies?.length > 0
    );
    if (medicalAttention.length > 0) {
      suggestionsList.push(
        `${medicalAttention.length} bewoner(s) hebben medische aandacht nodig.`
      );
    }

    // Suggest incident management for any issues
    if (incidentsData && incidentsData.length > 0) {
      suggestionsList.push(
        `Voor incident meldingen gebruik het Incident Management systeem.`
      );
    }
    
    setSuggestions(suggestionsList);
  };

  // Toast feedback
  const showToast = (msg, type = 'info') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(""), 3000);
    
    // Also add to notifications
    addNotification({
      type,
      message: msg,
      timestamp: new Date().toISOString()
    });
  };

  // Quick navigation to incident manager
  const openIncidentManager = () => {
    showToast('Gebruik het Incident Management systeem voor volledige incident afhandeling', 'info');
    // In real app, this would navigate to incident manager
  };

  const markResidentSpecial = (residentId, reason) => {
    const resident = residents.find(r => r.id === residentId);
    if (resident && !data.bijzondereResidenten.find(br => br.id === residentId)) {
      setData(prev => ({
        ...prev,
        bijzondereResidenten: [...prev.bijzondereResidenten, {
          ...resident,
          reason,
          timestamp: new Date().toISOString()
        }]
      }));
      showToast(`${resident.name} gemarkeerd als bijzonder`, 'info');
    }
  };

  const updateResidentStatus = () => {
    const presentResidents = residents.filter(r => r.status === 'Aanwezig');
    const absentResidents = residents.filter(r => r.status === 'Op verlof' || r.status === 'Afwezig');
    
    setData(prev => ({
      ...prev,
      aanwezigeResidenten: presentResidents.map(r => ({ id: r.id, name: r.name })),
      afwezigeResidenten: absentResidents.map(r => ({ id: r.id, name: r.name, reason: r.status }))
    }));
    
    showToast('Bewonerstatus bijgewerkt', 'success');
  };

  // Enhanced PDF export
  function exportToPDF() {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.setTextColor(44, 82, 130);
    doc.text("DIENST OVERDRACHT RAPPORT", 10, 15);
    
    // Basic info section
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    let y = 30;
    
    doc.text("ALGEMENE INFORMATIE", 10, y);
    doc.line(10, y + 2, 200, y + 2);
    y += 10;
    
    doc.setFontSize(10);
    doc.text(`Medewerker: ${data.medewerker}`, 10, y); y += 6;
    doc.text(`Dienst: ${data.shift}`, 10, y); y += 6;
    doc.text(`Datum: ${new Date(data.datum).toLocaleDateString('nl-NL')}`, 10, y); y += 6;
    doc.text(`Tijd: ${data.startTijd} - ${data.eindTijd}`, 10, y); y += 6;
    doc.text(`Locatie: ${currentLocation}`, 10, y); y += 10;
    
    // Sfeer en algemeen
    doc.setFontSize(12);
    doc.text("SFEER & ALGEMENE INDRUK", 10, y);
    doc.line(10, y + 2, 200, y + 2);
    y += 10;
    doc.setFontSize(10);
    const sfeerLines = doc.splitTextToSize(data.sfeerimpressie || 'Geen bijzonderheden', 180);
    sfeerLines.forEach(line => {
      doc.text(line, 10, y);
      y += 5;
    });
    y += 5;
    
    const fileName = `overdracht-${data.medewerker}-${data.datum}-${data.shift}.pdf`;
    doc.save(fileName);
    showToast("Uitgebreide PDF gedownload!", 'success');
  }

  // Complete handover
  const completeHandover = async () => {
    setSending(true);
    
    // Validate essential fields
    const requiredFields = ['medewerker', 'shift', 'startTijd', 'eindTijd'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      showToast(`Vul eerst de verplichte velden in: ${missingFields.join(', ')}`, 'error');
      setSending(false);
      return;
    }
    
    const highPriorityIncomplete = data.checklist.filter(item => 
      item.prioriteit === 'hoog' && (!item.antwoord || !item.toelichting)
    );
    
    if (highPriorityIncomplete.length > 0) {
      showToast('Alle hoge prioriteit checklist items moeten compleet zijn', 'error');
      setSending(false);
      return;
    }
    
    try {
      // Save to DataService
      const handoverRecord = {
        ...data,
        id: `handover-${Date.now()}`,
        completed: true,
        completedAt: new Date().toISOString(),
        location: currentLocation
      };
      
      DataService.saveHandover(handoverRecord);
      
      // Update data state
      setData(prev => ({ ...prev, completed: true }));
      
      // Clear localStorage for this date
      localStorage.removeItem(`handover-${data.datum}`);
      
      showToast("Overdracht succesvol afgerond!", 'success');
      
      // Auto-generate PDF
      setTimeout(() => {
        exportToPDF();
      }, 1000);
      
    } catch (err) {
      showToast("Fout bij afronden overdracht", 'error');
      console.error('Handover completion error:', err);
    }
    
    setSending(false);
  };

  // Email to management (required at end of shift)
  function sendToManagement() {
    const subject = encodeURIComponent(`Overdracht Rapport - ${data.medewerker} - ${data.shift} - ${new Date(data.datum).toLocaleDateString('nl-NL')}`);
    
    const emailBody = `
OVERDRACHT RAPPORT

Medewerker: ${data.medewerker}
Dienst: ${data.shift}
Datum: ${new Date(data.datum).toLocaleDateString('nl-NL')}
Tijd: ${data.startTijd} - ${data.eindTijd}
Locatie: ${currentLocation}
BHV Aangemeld: ${data.bhvAangemeld ? 'Ja' : 'Nee'}

SFEER & ALGEMEEN:
${data.sfeerimpressie || 'Geen bijzonderheden'}

OVERDRACHT BEVEILIGING:
${data.overdrachtBeveiliging || 'Geen bijzonderheden'}

CHECKLIST RESULTATEN:
${data.checklist.map(item => `- ${item.vraag}: ${item.antwoord || 'Niet ingevuld'}`).join('\n')}

Rapport gegenereerd op: ${new Date().toLocaleString('nl-NL')}`;
    
    const body = encodeURIComponent(emailBody);
    const recipients = emergencyInfo.managementEmails.join(';');
    window.open(`mailto:${recipients}?subject=${subject}&body=${body}`);
    
    // Mark as sent
    setData(prev => ({ ...prev, emailVerzonden: true }));
    showToast("E-mail wordt voorbereid naar management...", 'info');
  }

  // New render functions for enhanced interface
  
  // Overzicht tab with instructions and emergency info
  const renderOverzichtTab = () => (
    <div className="space-y-6">
      {/* Instructies bij start/einde dienst */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          Instructies Start/Einde Dienst
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded border">
            <h4 className="font-medium text-green-800 mb-2">START DIENST</h4>
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm">{emergencyInfo.bhvBoard}</span>
            </div>
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={data.bhvAangemeld}
                onChange={e => setData({ ...data, bhvAangemeld: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span>BHV aanmelding voltooid</span>
            </label>
          </div>
          <div className="bg-white p-4 rounded border">
            <h4 className="font-medium text-orange-800 mb-2">EINDE DIENST</h4>
            <p className="text-sm text-gray-600 mb-2">Overdracht en meldplicht emailen naar:</p>
            <div className="space-y-1">
              {emergencyInfo.managementEmails.map((email, i) => (
                <div key={i} className="text-xs text-gray-500 flex items-center">
                  <Send className="w-3 h-3 mr-1" />
                  {email}
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded ${data.emailVerzonden ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                {data.emailVerzonden ? 'E-mail verzonden' : 'E-mail nog niet verzonden'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Planbord (digitale takenlijsten) */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <ExternalLink className="w-5 h-5 mr-2" />
            Planbord - Digitale Takenlijsten
          </h3>
          <button
            onClick={() => setShowTaskLinks(!showTaskLinks)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            {showTaskLinks ? 'Verberg' : 'Toon'} links
          </button>
        </div>
        {showTaskLinks && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a href="#" className="bg-white p-3 rounded border hover:bg-blue-50 transition-colors">
              <div className="text-sm font-medium text-blue-900">Vleugel A</div>
              <div className="text-xs text-gray-600">Takenlijst A-vleugel</div>
            </a>
            <a href="#" className="bg-white p-3 rounded border hover:bg-blue-50 transition-colors">
              <div className="text-sm font-medium text-blue-900">Vleugel B</div>
              <div className="text-xs text-gray-600">Takenlijst B-vleugel</div>
            </a>
            <a href="#" className="bg-white p-3 rounded border hover:bg-blue-50 transition-colors">
              <div className="text-sm font-medium text-blue-900">Algemeen</div>
              <div className="text-xs text-gray-600">Algemene taken</div>
            </a>
          </div>
        )}
      </div>


    </div>
  );

  // Tab content render functions
  const renderAlgemeenTab = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Medewerker</label>
          <input
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Naam medewerker"
            value={data.medewerker}
            onChange={e => setData({ ...data, medewerker: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dienst</label>
          <select
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={data.shift}
            onChange={e => setData({ ...data, shift: e.target.value })}
          >
            <option value="">Kies dienst</option>
            <option value="Ochtenddienst">Ochtenddienst (07:00-15:00)</option>
            <option value="Avonddienst">Avonddienst (15:00-23:00)</option>
            <option value="Nachtdienst">Nachtdienst (23:00-07:00)</option>
            <option value="Weekenddienst">Weekenddienst</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Starttijd</label>
          <input
            type="time"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={data.startTijd}
            onChange={e => setData({ ...data, startTijd: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Eindtijd</label>
          <input
            type="time"
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={data.eindTijd}
            onChange={e => setData({ ...data, eindTijd: e.target.value })}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Algemene sfeerimpressie</label>
        <textarea
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Beschrijf de algemene sfeer en situatie tijdens de dienst..."
          value={data.sfeerimpressie}
          onChange={e => setData({ ...data, sfeerimpressie: e.target.value })}
        />
      </div>
      
      {/* Quick resident status update */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-blue-900">Bewonerstatus</h3>
          <button
            onClick={updateResidentStatus}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
          >
            <Users className="w-4 h-4 inline mr-1" />
            Update Status
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-green-700">Aanwezig: </span>
            <span>{data.aanwezigeResidenten.length} bewoners</span>
          </div>
          <div>
            <span className="font-medium text-orange-700">Afwezig: </span>
            <span>{data.afwezigeResidenten.length} bewoners</span>
          </div>
        </div>
      </div>
      
      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Suggesties voor overdracht
          </h3>
          <ul className="space-y-1 text-sm text-yellow-700">
            {suggestions.map((suggestion, i) => (
              <li key={i} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  // Dienst-specifieke render functies
  const renderShiftSpecificTab = (shiftType) => {
    const isOchtend = shiftType === 'ochtenddienst';
    const bgColor = isOchtend ? 'bg-blue-50 border-blue-200' : 'bg-yellow-50 border-yellow-200';
    const textColor = isOchtend ? 'text-blue-900' : 'text-yellow-900';
    
    return (
      <div className="space-y-6">
        {/* Shift Header */}
        <div className={`${bgColor} border rounded-lg p-6`}>
          <h3 className={`text-xl font-semibold ${textColor} mb-4 flex items-center`}>
            <Clock className="w-6 h-6 mr-2" />
            {isOchtend ? 'Ochtenddienst Overdracht' : 'Avonddienst Overdracht'}
          </h3>
          
          {/* Shift selection and basic info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dienst</label>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={data.shift}
                onChange={e => setData({ ...data, shift: e.target.value })}
              >
                <option value="">Kies dienst</option>
                <option value="Ochtenddienst">Ochtenddienst (07:00-15:00)</option>
                <option value="Avonddienst">Avonddienst (15:00-23:00)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Starttijd</label>
              <input
                type="time"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={data.startTijd}
                onChange={e => setData({ ...data, startTijd: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Eindtijd</label>
              <input
                type="time"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={data.eindTijd}
                onChange={e => setData({ ...data, eindTijd: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* Overdracht Beveiliging */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Overdracht Beveiliging
          </h4>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Belangrijke zaken voor beveiliging: sleutels, toegangscodes, alarmen, bijzonderheden..."
            value={data.overdrachtBeveiliging}
            onChange={e => setData({ ...data, overdrachtBeveiliging: e.target.value })}
          />
        </div>

        {/* Sfeerimpressie */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Sfeerimpressie</h4>
          <textarea
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Hoe was de algemene sfeer tijdens de dienst? Bijzondere voorvallen of stemming..."
            value={data.sfeerimpressie}
            onChange={e => setData({ ...data, sfeerimpressie: e.target.value })}
          />
        </div>

        {/* Rondes */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Rondes ({isOchtend ? 'Ochtenddienst' : 'Avonddienst'})
          </h4>
          
          {!isOchtend && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
              <strong>Let op:</strong> Vanaf heden ronde maken bij het kapel
            </div>
          )}
          
          <div className="space-y-4">
            {data.rondes.map((ronde, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded border">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tijdstip</label>
                  <input
                    type="time"
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                    value={ronde.tijdstip}
                    onChange={e => {
                      const newRondes = [...data.rondes];
                      newRondes[index] = { ...ronde, tijdstip: e.target.value };
                      setData({ ...data, rondes: newRondes });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Locatie</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                    placeholder="Bijv. Vleugel A, Kapel, Tuin..."
                    value={ronde.locatie}
                    onChange={e => {
                      const newRondes = [...data.rondes];
                      newRondes[index] = { ...ronde, locatie: e.target.value };
                      setData({ ...data, rondes: newRondes });
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bijzonderheden</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                    placeholder="Wat opgemerkt tijdens ronde..."
                    value={ronde.bijzonderheden}
                    onChange={e => {
                      const newRondes = [...data.rondes];
                      newRondes[index] = { ...ronde, bijzonderheden: e.target.value };
                      setData({ ...data, rondes: newRondes });
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Checklist ({isOchtend ? 'Ochtenddienst' : 'Avonddienst'})
          </h4>
          
          <div className="space-y-4">
            {data.checklist.map((item, index) => (
              <div key={index} className={`p-4 border rounded-lg ${
                item.prioriteit === 'hoog' ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        item.prioriteit === 'hoog' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {item.categorie}
                      </span>
                      {item.prioriteit === 'hoog' && (
                        <span className="text-xs text-red-600 font-medium">VERPLICHT</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-2">{item.vraag}</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Antwoord</label>
                        <select
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          value={item.antwoord}
                          onChange={e => {
                            const newChecklist = [...data.checklist];
                            newChecklist[index] = { ...item, antwoord: e.target.value };
                            setData({ ...data, checklist: newChecklist });
                          }}
                        >
                          <option value="">Selecteer...</option>
                          <option value="Ja">Ja</option>
                          <option value="Nee">Nee</option>
                          <option value="N.v.t.">N.v.t.</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Toelichting {item.prioriteit === 'hoog' && <span className="text-red-600">*</span>}
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          placeholder="Toelichting bij je antwoord..."
                          value={item.toelichting}
                          onChange={e => {
                            const newChecklist = [...data.checklist];
                            newChecklist[index] = { ...item, toelichting: e.target.value };
                            setData({ ...data, checklist: newChecklist });
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // UI
  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="w-8 h-8 mr-3 text-blue-600" />
              Dienst Overdracht
            </h1>
            <p className="text-gray-600 mt-1">
              {new Date(data.datum).toLocaleDateString('nl-NL', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-32 bg-gray-200 rounded-full h-3">
                <div 
                  className={`h-3 rounded-full transition-all duration-300 ${
                    progress < 50 ? 'bg-red-500' : progress < 80 ? 'bg-yellow-500' : 'bg-green-500'
                  }`} 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <span className="text-sm font-medium">{progress}%</span>
            </div>
            <div className="text-sm text-gray-500">
              {progress < 50 ? 'Begin pas' : progress < 80 ? 'Bijna klaar' : 'Gereed voor overdracht'}
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overzicht', label: 'Overzicht & Instructies', icon: Bell },
            { id: 'ochtenddienst', label: 'Ochtenddienst', icon: Clock, color: 'blue' },
            { id: 'avonddienst', label: 'Avonddienst', icon: Clock, color: 'yellow' },
            { id: 'algemeen', label: 'Algemeen', icon: User }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {activeTab === 'overzicht' && renderOverzichtTab()}
        {activeTab === 'ochtenddienst' && renderShiftSpecificTab('ochtenddienst')}
        {activeTab === 'avonddienst' && renderShiftSpecificTab('avonddienst')}
        {activeTab === 'algemeen' && renderAlgemeenTab()}
      </div>

      {/* Action Buttons */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => {
              localStorage.setItem(`handover-${data.datum}`, JSON.stringify(data));
              showToast("Overdracht opgeslagen!", 'success');
            }}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Opslaan
          </button>
          
          <button
            onClick={exportToPDF}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors flex items-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </button>
          
          <button
            onClick={sendToManagement}
            className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center"
          >
            <Send className="w-4 h-4 mr-2" />
            E-mail naar Management
          </button>
          
          <button
            onClick={completeHandover}
            disabled={sending || progress < 70 || data.completed}
            className={`px-8 py-2 rounded-md font-medium transition-colors flex items-center ${
              data.completed
                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                : progress >= 70
                ? 'bg-orange-500 text-white hover:bg-orange-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {sending ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Afronden...
              </>
            ) : data.completed ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Afgerond
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Overdracht Afronden
              </>
            )}
          </button>
        </div>
        
        {progress < 70 && (
          <p className="text-sm text-gray-600 mt-2">
            Vul minimaal 70% in om de overdracht af te ronden (nu {progress}%)
          </p>
        )}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all transform ${
          toast.type === 'error' ? 'bg-red-500' :
          toast.type === 'success' ? 'bg-green-500' :
          toast.type === 'warning' ? 'bg-yellow-500' :
          'bg-blue-500'
        }`}>
          <div className="flex items-center">
            {toast.type === 'error' && <XCircle className="w-5 h-5 mr-2" />}
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 mr-2" />}
            <span>{typeof toast === 'string' ? toast : toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}