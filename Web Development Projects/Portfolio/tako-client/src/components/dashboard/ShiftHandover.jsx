import React, { useState, useEffect, useCallback } from 'react';
import jsPDF from 'jspdf';
import {
  Clock,
  Users,
  CheckCircle,
  FileText,
  Send,
  Download,
  Save,
  Shield,
  Loader,
  AlertTriangle,
  Bell,
  MapPin,
  CheckSquare,
  Square,
  Plus,
  X,
  Search,
  ExternalLink,
} from 'lucide-react';
import DataService from '../../utils/dataService.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { useLocation } from '../../contexts/LocationContext';
import { useNotifications } from '../../contexts/NotificationContext.jsx';

// Checklist questions matching current form
const CHECKLIST_QUESTIONS = [
  { id: 'incidents', question: 'Zijn er incidenten geweest?', required: true },
  {
    id: 'calamiteiten',
    question: 'Zijn er calamiteiten geweest?',
    required: true,
  },
  {
    id: 'activiteiten',
    question: 'Zijn er activiteiten gedaan?',
    required: false,
  },
  {
    id: 'algemene_taken',
    question: 'Zijn alle algemene taken afgerond?',
    required: false,
  },
  {
    id: 'bewoners_taken',
    question: 'Zijn alle bewonerstaken afgerond?',
    required: false,
  },
  {
    id: 'werkplek_netjes',
    question: 'Is de werkplek netjes achtergelaten?',
    required: false,
  },
  {
    id: 'sleutels_piepers',
    question: 'Sleutels & piepers overgedragen?',
    required: true,
  },
];

// Evening shift additional question
const EVENING_ADDITIONAL = {
  id: 'sluitronde_checklist',
  question: 'Sluitronde (gehele pand incl. tuin)',
  required: true,
};

// Todo lists for different phases
const START_SHIFT_TODOS = [
  {
    id: 'bhv_aanmelden',
    text: 'BHV aanmelden op desbetreffende bord',
    required: true,
  },
  {
    id: 'check_incidents',
    text: 'Check openstaande incidenten van vorige dienst',
    required: false,
  },
  {
    id: 'check_verlof',
    text: 'Controleer wie op verlof is/terugkomt',
    required: false,
  },
  {
    id: 'check_tijdelijke_info',
    text: 'Lees tijdelijke informatie en alerts',
    required: true,
  },
];

const END_SHIFT_TODOS = [
  {
    id: 'complete_checklist',
    text: 'Volledige checklist afgerond',
    required: true,
  },
  {
    id: 'handover_security',
    text: 'Overdracht aan beveiliging gedaan',
    required: true,
  },
  {
    id: 'email_management',
    text: 'Overdracht gemaild naar management',
    required: true,
  },
  {
    id: 'save_handover',
    text: 'Overdracht opgeslagen in systeem',
    required: true,
  },
];

// Mock tijdelijke informatie - in real app would come from admin/API
const TIJDELIJKE_INFO = [
  {
    date: '20-05-2025',
    message: 'Let op vanaf heden: ronde maken bij het kapel',
    type: 'alert',
    priority: 'high',
  },
  {
    date: '03-06-2025',
    message:
      'Instructie bij alarm Quality Guard - Het witte alarmkastje van Quality Guard (deur links, bij de piepers) gaat af.',
    type: 'instruction',
    priority: 'medium',
  },
];

// Mock staff data - in real app would come from API/DataService
const MOCK_STAFF = [
  { id: 1, name: 'Jan de Vries', email: 'jan@refutree.nl' },
  { id: 2, name: 'Emma Johnson', email: 'emma@refutree.nl' },
  { id: 3, name: 'Ahmed Hassan', email: 'ahmed@refutree.nl' },
  { id: 4, name: 'Maria Santos', email: 'maria@refutree.nl' },
  { id: 5, name: 'Peter van Berg', email: 'peter@refutree.nl' },
  { id: 6, name: 'Sophie Miller', email: 'sophie@refutree.nl' },
  { id: 7, name: 'Omar Al-Rashid', email: 'omar@refutree.nl' },
  { id: 8, name: 'Lisa Chen', email: 'lisa@refutree.nl' },
];

const createDefaultRondes = () => [
  { id: 1, tijdstip: '', bijzonderheden: '', staff: [] },
  { id: 2, tijdstip: '', bijzonderheden: '', staff: [] },
  { id: 3, tijdstip: '', bijzonderheden: '', staff: [] },
  {
    id: 'sluitronde',
    tijdstip: '',
    bijzonderheden: '',
    staff: [],
    isSluitronde: true,
  },
];

const defaultData = {
  datum: new Date().toISOString().split('T')[0],

  // BHV registration
  bhvAangemeld: false,

  // Start/End shift todos
  startShiftTodos: START_SHIFT_TODOS.reduce((acc, todo) => {
    acc[todo.id] = false;
    return acc;
  }, {}),
  endShiftTodos: END_SHIFT_TODOS.reduce((acc, todo) => {
    acc[todo.id] = false;
    return acc;
  }, {}),

  // Ochtenddienst data
  ochtenddienst: {
    team: [], // Staff with their time slots
    overdrachtBeveiliging: { text: '', staff: [] },
    sfeerimpressie: { text: '', staff: [] },
    rondes: createDefaultRondes(),
    checklist: CHECKLIST_QUESTIONS.reduce((acc, q) => {
      acc[q.id] = { answer: '', toelichting: '', staff: [] };
      return acc;
    }, {}),
  },

  // Avonddienst data
  avonddienst: {
    team: [], // Staff with their time slots
    overdrachtBeveiliging: { text: '', staff: [] },
    sfeerimpressie: { text: '', staff: [] },
    rondes: createDefaultRondes(),
    checklist: [...CHECKLIST_QUESTIONS, EVENING_ADDITIONAL].reduce((acc, q) => {
      acc[q.id] = { answer: '', toelichting: '', staff: [] };
      return acc;
    }, {}),
  },

  completed: false,
  emailSent: false,
};

// System integration indicators (mock data)
const getSystemIndicators = () => {
  return {
    incidents: { count: 2, urgent: 1, route: '/incidents' },
    leaveRequests: { count: 3, pending: 3, route: '/verlof' },
    roomChanges: { count: 0, today: 0, route: '/bewoners' },
    bikeLoans: { count: 5, active: 5, route: '/bewoners' },
    tasks: { count: 8, pending: 8, overdue: 2, route: '/dashboard' },
  };
};

// Staff Autocomplete Component
const StaffAutocomplete = ({
  selectedStaff = [],
  onStaffChange,
  placeholder = 'Zoek medewerker...',
  maxStaff = 2,
  className = '',
}) => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  const availableStaff = MOCK_STAFF.filter(
    (staff) => !selectedStaff.find((s) => s.id === staff.id)
  );

  const filteredStaff = availableStaff.filter((staff) =>
    staff.name.toLowerCase().includes(query.toLowerCase())
  );

  const addStaff = (staff) => {
    if (selectedStaff.length < maxStaff) {
      onStaffChange([...selectedStaff, staff]);
      setQuery('');
      setShowResults(false);
    }
  };

  const removeStaff = (staffId) => {
    onStaffChange(selectedStaff.filter((s) => s.id !== staffId));
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Selected Staff */}
      {selectedStaff.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {selectedStaff.map((staff) => (
            <span
              key={staff.id}
              className='inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full'
            >
              {staff.name}
              <button
                onClick={() => removeStaff(staff.id)}
                className='ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200'
              >
                <X className='w-3 h-3' />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add Staff Input */}
      {selectedStaff.length < maxStaff && (
        <div className='relative'>
          <div className='relative'>
            <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400' />
            <input
              type='text'
              className='w-full pl-7 pr-3 py-1 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              placeholder={placeholder}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              onBlur={() => setTimeout(() => setShowResults(false), 200)}
            />
          </div>

          {showResults && query && filteredStaff.length > 0 && (
            <div className='absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-32 overflow-y-auto'>
              {filteredStaff.slice(0, 4).map((staff) => (
                <button
                  key={staff.id}
                  className='w-full text-left px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm'
                  onClick={() => addStaff(staff)}
                >
                  <div className='font-medium text-gray-900 dark:text-white'>
                    {staff.name}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function ShiftHandover() {
  const { currentUser } = useAuth();
  const { currentLocation } = useLocation();
  const { notify } = useNotifications();

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(
      `handover-v4-${new Date().toISOString().split('T')[0]}`
    );
    return saved ? JSON.parse(saved) : defaultData;
  });

  const [activeSection, setActiveSection] = useState('start');
  const [completing, setCompleting] = useState(false);
  const [systemIndicators] = useState(getSystemIndicators());
  const [saveStatus, setSaveStatus] = useState({
    status: 'saved',
    timestamp: new Date(),
  });

  // Auto-save with user feedback
  useEffect(() => {
    setSaveStatus({ status: 'saving', timestamp: new Date() });

    const saveTimer = setTimeout(() => {
      try {
        localStorage.setItem(`handover-v4-${data.datum}`, JSON.stringify(data));
        setSaveStatus({ status: 'saved', timestamp: new Date() });
      } catch {
        setSaveStatus({ status: 'error', timestamp: new Date() });
      }
    }, 1000);

    return () => clearTimeout(saveTimer);
  }, [data]);

  const updateShiftData = useCallback((shiftType, section, field, value) => {
    setData((prev) => ({
      ...prev,
      [shiftType]: {
        ...prev[shiftType],
        [section]:
          typeof prev[shiftType][section] === 'object' &&
          !Array.isArray(prev[shiftType][section])
            ? { ...prev[shiftType][section], [field]: value }
            : value,
      },
    }));
  }, []);

  const updateTodoStatus = useCallback((section, todoId, checked) => {
    setData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [todoId]: checked,
      },
    }));
  }, []);

  const updateRonde = useCallback((shiftType, rondeId, field, value) => {
    setData((prev) => ({
      ...prev,
      [shiftType]: {
        ...prev[shiftType],
        rondes: prev[shiftType].rondes.map((ronde) =>
          ronde.id === rondeId ? { ...ronde, [field]: value } : ronde
        ),
      },
    }));
  }, []);

  const addRonde = useCallback((shiftType) => {
    setData((prev) => {
      const currentRondes = prev[shiftType].rondes;
      const nextId =
        Math.max(
          ...currentRondes
            .filter((r) => typeof r.id === 'number')
            .map((r) => r.id)
        ) + 1;
      const newRonde = {
        id: nextId,
        tijdstip: '',
        bijzonderheden: '',
        staff: [],
      };

      // Insert before sluitronde
      const sluitrondeIndex = currentRondes.findIndex((r) => r.isSluitronde);
      const newRondes = [...currentRondes];
      newRondes.splice(sluitrondeIndex, 0, newRonde);

      return {
        ...prev,
        [shiftType]: {
          ...prev[shiftType],
          rondes: newRondes,
        },
      };
    });
  }, []);

  const removeRonde = useCallback((shiftType, rondeId) => {
    setData((prev) => ({
      ...prev,
      [shiftType]: {
        ...prev[shiftType],
        rondes: prev[shiftType].rondes.filter((ronde) => ronde.id !== rondeId),
      },
    }));
  }, []);

  const updateChecklist = useCallback((shiftType, questionId, field, value) => {
    setData((prev) => ({
      ...prev,
      [shiftType]: {
        ...prev[shiftType],
        checklist: {
          ...prev[shiftType].checklist,
          [questionId]: {
            ...prev[shiftType].checklist[questionId],
            [field]: value,
          },
        },
      },
    }));
  }, []);

  const handleSystemIndicatorClick = (route) => {
    // For now, just show an alert - in real app would navigate to route
    notify(`Navigeren naar ${route}`, 'info');
  };

  const getCompletionProgress = () => {
    let completed = 0;
    let total = 0;

    // Check both shifts
    ['ochtenddienst', 'avonddienst'].forEach((shiftType) => {
      const shiftData = data[shiftType];

      if (shiftData.overdrachtBeveiliging?.text) completed++;
      total++;

      if (shiftData.sfeerimpressie?.text) completed++;
      total++;

      // Check required checklist items
      const requiredQuestions =
        shiftType === 'avonddienst'
          ? [...CHECKLIST_QUESTIONS, EVENING_ADDITIONAL]
          : CHECKLIST_QUESTIONS;

      requiredQuestions.forEach((q) => {
        if (q.required && shiftData.checklist[q.id]?.answer) completed++;
        if (q.required) total++;
      });
    });

    return Math.round((completed / total) * 100);
  };

  const validateHandover = () => {
    const errors = [];

    // Check both shifts for required fields
    ['ochtenddienst', 'avonddienst'].forEach((shiftType) => {
      const shiftData = data[shiftType];

      if (!shiftData.overdrachtBeveiliging?.text) {
        errors.push(`${shiftType}: Overdracht beveiliging is verplicht`);
      }

      const requiredQuestions =
        shiftType === 'avonddienst'
          ? [...CHECKLIST_QUESTIONS, EVENING_ADDITIONAL]
          : CHECKLIST_QUESTIONS;

      const incompleteRequired = requiredQuestions.filter(
        (q) => q.required && !shiftData.checklist[q.id]?.answer
      );

      if (incompleteRequired.length > 0) {
        errors.push(
          `${shiftType}: Verplichte checklist vragen niet beantwoord`
        );
      }
    });

    return errors;
  };

  const completeHandover = async () => {
    const errors = validateHandover();
    if (errors.length > 0) {
      notify(errors[0], 'error');
      return;
    }

    setCompleting(true);
    try {
      const handoverRecord = {
        ...data,
        id: `handover-${Date.now()}`,
        completed: true,
        completedAt: new Date().toISOString(),
        location: currentLocation,
        completedBy: currentUser?.name,
      };

      DataService.saveHandover(handoverRecord);
      setData((prev) => ({ ...prev, completed: true }));

      localStorage.removeItem(`handover-v4-${data.datum}`);
      notify('Overdracht succesvol afgerond!', 'success');
    } catch {
      notify('Fout bij afronden overdracht', 'error');
    } finally {
      setCompleting(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(44, 82, 130);
    doc.text('DIENST OVERDRACHT', 10, 15);

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    let y = 30;

    doc.text(
      `Datum: ${new Date(data.datum).toLocaleDateString('nl-NL')}`,
      10,
      y
    );
    y += 6;
    doc.text(`Locatie: ${currentLocation}`, 10, y);
    y += 10;

    // Add both shift data
    ['ochtenddienst', 'avonddienst'].forEach((shiftType) => {
      const shiftData = data[shiftType];

      doc.setFontSize(12);
      doc.text(shiftType.toUpperCase(), 10, y);
      y += 8;

      doc.setFontSize(10);
      const securityLines = doc.splitTextToSize(
        shiftData.overdrachtBeveiliging?.text || 'Geen bijzonderheden',
        180
      );
      securityLines.forEach((line) => {
        doc.text(line, 10, y);
        y += 5;
      });
      y += 10;
    });

    const fileName = `overdracht-${data.datum}-${currentLocation.replace(/\s+/g, '-')}.pdf`;
    doc.save(fileName);
    notify('PDF gedownload!', 'success');
  };

  const sendToManagement = () => {
    const subject = encodeURIComponent(
      `Overdracht Rapport - ${new Date(data.datum).toLocaleDateString('nl-NL')}`
    );

    const emailBody = `Overdracht rapport verzonden vanuit TAKO VMS systeem.\n\nDatum: ${new Date(data.datum).toLocaleDateString('nl-NL')}\nLocatie: ${currentLocation}`;

    const body = encodeURIComponent(emailBody);
    const recipients = [
      's.schuyer@woonfervent.nl',
      'j.heij@woonfervent.nl',
      'v.elkhadir@woonfervent.nl',
    ].join(';');
    window.open(`mailto:${recipients}?subject=${subject}&body=${body}`);

    setData((prev) => ({ ...prev, emailSent: true }));
    notify('E-mail wordt voorbereid...', 'info');
  };

  // Render functions
  const renderSaveStatus = () => {
    const { status, timestamp } = saveStatus;
    const timeStr = timestamp.toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    switch (status) {
      case 'saving':
        return (
          <span className='flex items-center text-yellow-600 dark:text-yellow-400'>
            <Loader className='w-3 h-3 mr-1 animate-spin' />
            Opslaan... {timeStr}
          </span>
        );
      case 'saved':
        return (
          <span className='flex items-center text-green-600 dark:text-green-400'>
            <CheckCircle className='w-3 h-3 mr-1' />
            Opgeslagen {timeStr}
          </span>
        );
      case 'error':
        return (
          <span className='flex items-center text-red-600 dark:text-red-400'>
            <AlertTriangle className='w-3 h-3 mr-1' />
            Fout - Probeer opnieuw
          </span>
        );
      default:
        return null;
    }
  };

  const renderHeader = () => (
    <div className='border-b border-gray-200 dark:border-gray-700 pb-6'>
      <div className='flex items-center justify-between mb-4'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>
            Overdracht
          </h1>
          <p className='text-gray-600 dark:text-gray-300 mt-1'>
            {new Date(data.datum).toLocaleDateString('nl-NL', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <div className='text-right'>
          <div className='text-sm text-gray-500 dark:text-gray-400 mb-1'>
            Voortgang: {getCompletionProgress()}%
          </div>
          <div className='text-xs'>{renderSaveStatus()}</div>
        </div>
      </div>
    </div>
  );

  const renderSystemIndicators = () => (
    <div className='bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4'>
      <h3 className='font-medium text-blue-900 dark:text-blue-300 mb-3 flex items-center'>
        <Bell className='w-4 h-4 mr-2' />
        Systeem Overzicht
      </h3>
      <div className='grid grid-cols-2 md:grid-cols-5 gap-3 text-sm'>
        <button
          onClick={() =>
            handleSystemIndicatorClick(systemIndicators.incidents.route)
          }
          className='bg-white dark:bg-gray-800 rounded p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group'
        >
          <div className='flex items-center justify-between'>
            <div className='text-gray-600 dark:text-gray-400'>Incidenten</div>
            <ExternalLink className='w-3 h-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300' />
          </div>
          <div className='font-bold text-red-600'>
            {systemIndicators.incidents.count}
          </div>
          {systemIndicators.incidents.urgent > 0 && (
            <div className='text-xs text-red-500'>
              {systemIndicators.incidents.urgent} urgent
            </div>
          )}
        </button>

        <button
          onClick={() =>
            handleSystemIndicatorClick(systemIndicators.leaveRequests.route)
          }
          className='bg-white dark:bg-gray-800 rounded p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group'
        >
          <div className='flex items-center justify-between'>
            <div className='text-gray-600 dark:text-gray-400'>
              Verlofaanvragen
            </div>
            <ExternalLink className='w-3 h-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300' />
          </div>
          <div className='font-bold text-orange-600'>
            {systemIndicators.leaveRequests.pending}
          </div>
        </button>

        <button
          onClick={() =>
            handleSystemIndicatorClick(systemIndicators.roomChanges.route)
          }
          className='bg-white dark:bg-gray-800 rounded p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group'
        >
          <div className='flex items-center justify-between'>
            <div className='text-gray-600 dark:text-gray-400'>
              Kamerwijzigingen
            </div>
            <ExternalLink className='w-3 h-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300' />
          </div>
          <div className='font-bold text-blue-600'>
            {systemIndicators.roomChanges.today}
          </div>
        </button>

        <button
          onClick={() =>
            handleSystemIndicatorClick(systemIndicators.bikeLoans.route)
          }
          className='bg-white dark:bg-gray-800 rounded p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group'
        >
          <div className='flex items-center justify-between'>
            <div className='text-gray-600 dark:text-gray-400'>
              Fiets leningen
            </div>
            <ExternalLink className='w-3 h-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300' />
          </div>
          <div className='font-bold text-green-600'>
            {systemIndicators.bikeLoans.active}
          </div>
        </button>

        <button
          onClick={() =>
            handleSystemIndicatorClick(systemIndicators.tasks.route)
          }
          className='bg-white dark:bg-gray-800 rounded p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left group'
        >
          <div className='flex items-center justify-between'>
            <div className='text-gray-600 dark:text-gray-400'>Taken</div>
            <ExternalLink className='w-3 h-3 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300' />
          </div>
          <div className='font-bold text-purple-600'>
            {systemIndicators.tasks.pending}
          </div>
          {systemIndicators.tasks.overdue > 0 && (
            <div className='text-xs text-red-500'>
              {systemIndicators.tasks.overdue} te laat
            </div>
          )}
        </button>
      </div>
    </div>
  );

  const renderTijdelijkeInfo = () => (
    <div className='bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4'>
      <h3 className='font-medium text-yellow-900 dark:text-yellow-300 mb-3 flex items-center'>
        <AlertTriangle className='w-4 h-4 mr-2' />
        Tijdelijke Informatie
      </h3>
      <div className='text-sm text-yellow-800 dark:text-yellow-200'>
        <p className='italic mb-2'>
          Alleen te plaatsen in overleg met leidinggevende:
        </p>
        {TIJDELIJKE_INFO.map((info, index) => (
          <div
            key={index}
            className='mb-2 p-2 bg-white dark:bg-gray-800 rounded border-l-4 border-yellow-400'
          >
            <div className='font-medium'>{info.date}</div>
            <div>{info.message}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTodoSection = (title, todos, dataKey, icon) => (
    <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4'>
      <h3 className='font-medium text-gray-900 dark:text-white mb-3 flex items-center'>
        {icon}
        {title}
      </h3>
      <div className='space-y-2'>
        {todos.map((todo) => (
          <label
            key={todo.id}
            className='flex items-center space-x-3 cursor-pointer'
          >
            <button
              onClick={() =>
                updateTodoStatus(dataKey, todo.id, !data[dataKey][todo.id])
              }
              className='flex-shrink-0'
            >
              {data[dataKey][todo.id] ? (
                <CheckSquare className='w-5 h-5 text-green-600' />
              ) : (
                <Square className='w-5 h-5 text-gray-400' />
              )}
            </button>
            <span
              className={`text-sm ${data[dataKey][todo.id] ? 'line-through text-gray-500' : 'text-gray-900 dark:text-white'}`}
            >
              {todo.text}
              {todo.required && <span className='text-red-500 ml-1'>*</span>}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderShiftContent = (shiftType) => {
    const shiftData = data[shiftType];
    const isEvening = shiftType === 'avonddienst';
    const checklistQuestions = isEvening
      ? [...CHECKLIST_QUESTIONS, EVENING_ADDITIONAL]
      : CHECKLIST_QUESTIONS;

    return (
      <div className='space-y-6'>
        {/* Team Composition */}
        <div className='bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
            <Users className='w-5 h-5 mr-2 text-blue-600' />
            Team Samenstelling ({shiftType})
          </h3>
          <div className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
            {isEvening
              ? 'Voeg de 3 medewerkers van de avonddienst toe (flexibele starttijden 15:00/17:00)'
              : 'Voeg 2 medewerkers toe die om 07:00 starten + 1 medewerker die om 09:00 start'}
          </div>
          <StaffAutocomplete
            selectedStaff={shiftData.team || []}
            onStaffChange={(staff) =>
              updateShiftData(shiftType, 'team', null, staff)
            }
            maxStaff={3}
            placeholder='Voeg teamlid toe...'
          />
        </div>

        {/* Security Handover */}
        <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white flex items-center'>
              <Shield className='w-5 h-5 mr-2 text-blue-600' />
              Overdracht beveiliging
            </h3>
            <div className='w-48'>
              <StaffAutocomplete
                selectedStaff={shiftData.overdrachtBeveiliging?.staff || []}
                onStaffChange={(staff) =>
                  updateShiftData(
                    shiftType,
                    'overdrachtBeveiliging',
                    'staff',
                    staff
                  )
                }
                maxStaff={2}
                placeholder='Medewerker...'
              />
            </div>
          </div>
          <textarea
            className='w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            rows={4}
            placeholder='Overdracht aan beveiliging...'
            value={shiftData.overdrachtBeveiliging?.text || ''}
            onChange={(e) =>
              updateShiftData(
                shiftType,
                'overdrachtBeveiliging',
                'text',
                e.target.value
              )
            }
          />
        </div>

        {/* Atmosphere */}
        <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white flex items-center'>
              <Users className='w-5 h-5 mr-2 text-green-600' />
              Sfeerimpressie ({shiftType})
            </h3>
            <div className='w-48'>
              <StaffAutocomplete
                selectedStaff={shiftData.sfeerimpressie?.staff || []}
                onStaffChange={(staff) =>
                  updateShiftData(shiftType, 'sfeerimpressie', 'staff', staff)
                }
                maxStaff={2}
                placeholder='Medewerker...'
              />
            </div>
          </div>
          <textarea
            className='w-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            rows={3}
            placeholder='Sfeer en algemene indruk tijdens de dienst...'
            value={shiftData.sfeerimpressie?.text || ''}
            onChange={(e) =>
              updateShiftData(
                shiftType,
                'sfeerimpressie',
                'text',
                e.target.value
              )
            }
          />
        </div>

        {/* Rondes */}
        <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white flex items-center'>
              <MapPin className='w-5 h-5 mr-2 text-purple-600' />
              Rondes ({shiftType})
            </h3>
            <button
              onClick={() => addRonde(shiftType)}
              className='bg-blue-500 dark:bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors flex items-center'
            >
              <Plus className='w-4 h-4 mr-1' />
              Ronde toevoegen
            </button>
          </div>

          <div className='mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded text-red-800 dark:text-red-300 text-sm'>
            <strong>Let op vanaf heden:</strong> ronde maken bij het kapel
          </div>

          <div className='space-y-4'>
            {shiftData.rondes?.map((ronde, index) => (
              <div
                key={ronde.id}
                className='border border-gray-200 dark:border-gray-700 rounded-lg p-4'
              >
                <div className='flex items-center justify-between mb-3'>
                  <h4 className='font-medium text-gray-900 dark:text-white'>
                    {ronde.isSluitronde
                      ? 'Sluitronde'
                      : `Ronde ${typeof ronde.id === 'number' ? ronde.id : index + 1}`}
                  </h4>
                  {!ronde.isSluitronde && shiftData.rondes.length > 4 && (
                    <button
                      onClick={() => removeRonde(shiftType, ronde.id)}
                      className='text-red-500 hover:text-red-700 transition-colors'
                    >
                      <X className='w-4 h-4' />
                    </button>
                  )}
                </div>

                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div>
                    <label
                      htmlFor={`tijd-${shiftType}-${ronde.id}`}
                      className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                    >
                      Tijdstip
                    </label>
                    <input
                      id={`tijd-${shiftType}-${ronde.id}`}
                      type='time'
                      className='w-full text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-2 py-1'
                      value={ronde.tijdstip || ''}
                      onChange={(e) =>
                        updateRonde(
                          shiftType,
                          ronde.id,
                          'tijdstip',
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div>
                    <div className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
                      Medewerker(s)
                    </div>
                    <StaffAutocomplete
                      selectedStaff={ronde.staff || []}
                      onStaffChange={(staff) =>
                        updateRonde(shiftType, ronde.id, 'staff', staff)
                      }
                      maxStaff={2}
                      placeholder='Wie liep ronde...'
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`bijz-${shiftType}-${ronde.id}`}
                      className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'
                    >
                      Bijzonderheden
                    </label>
                    <input
                      id={`bijz-${shiftType}-${ronde.id}`}
                      type='text'
                      className='w-full text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-2 py-1'
                      placeholder='Wat is er opgemerkt...'
                      value={ronde.bijzonderheden || ''}
                      onChange={(e) =>
                        updateRonde(
                          shiftType,
                          ronde.id,
                          'bijzonderheden',
                          e.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Checklist */}
        <div className='bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center'>
            <CheckCircle className='w-5 h-5 mr-2 text-green-600' />
            Checklist ({shiftType})
          </h3>

          <div className='space-y-3'>
            {checklistQuestions.map((question) => (
              <div
                key={question.id}
                className='border border-gray-200 dark:border-gray-700 rounded p-3'
              >
                <div className='flex items-center justify-between mb-2'>
                  <span className='text-sm font-medium text-gray-900 dark:text-white'>
                    {question.question}
                    {question.required && (
                      <span className='text-red-500 ml-1'>*</span>
                    )}
                  </span>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
                  <select
                    className='text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-2 py-1'
                    value={shiftData.checklist[question.id]?.answer || ''}
                    onChange={(e) =>
                      updateChecklist(
                        shiftType,
                        question.id,
                        'answer',
                        e.target.value
                      )
                    }
                  >
                    <option value=''>Ja/Nee</option>
                    <option value='ja'>Ja</option>
                    <option value='nee'>Nee</option>
                  </select>
                  <div className='md:col-span-2'>
                    <input
                      type='text'
                      className='w-full text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded px-2 py-1'
                      placeholder='Toelichting...'
                      value={
                        shiftData.checklist[question.id]?.toelichting || ''
                      }
                      onChange={(e) =>
                        updateChecklist(
                          shiftType,
                          question.id,
                          'toelichting',
                          e.target.value
                        )
                      }
                    />
                  </div>
                  <div>
                    <StaffAutocomplete
                      selectedStaff={
                        shiftData.checklist[question.id]?.staff || []
                      }
                      onStaffChange={(staff) =>
                        updateChecklist(shiftType, question.id, 'staff', staff)
                      }
                      maxStaff={1}
                      placeholder='Wie deed dit...'
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className='mt-4 text-xs text-gray-600 dark:text-gray-400'>
            *Vul bij deze keuze altijd een toelichting in.
          </div>
        </div>
      </div>
    );
  };

  const renderNavigation = () => (
    <div className='border-b border-gray-200 dark:border-gray-700 mb-6'>
      <nav className='-mb-px flex space-x-8'>
        {[
          { id: 'start', label: 'Start Dienst', icon: Clock },
          { id: 'ochtenddienst', label: 'Ochtenddienst', icon: FileText },
          { id: 'avonddienst', label: 'Avonddienst', icon: FileText },
          { id: 'end', label: 'Einde Dienst', icon: CheckCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                activeSection === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Icon className='w-4 h-4 mr-2' />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );

  return (
    <div className='max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-gray-900/50 space-y-6'>
      {renderHeader()}

      {renderSystemIndicators()}

      {renderTijdelijkeInfo()}

      {renderNavigation()}

      {/* Content based on active section */}
      {activeSection === 'start' && (
        <div className='space-y-6'>
          <div className='bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-4'>
            <h3 className='font-medium text-blue-900 dark:text-blue-300 mb-3'>
              Bij start dienst:
            </h3>
            <div className='mb-4'>
              <label className='flex items-center space-x-3'>
                <input
                  type='checkbox'
                  checked={data.bhvAangemeld}
                  onChange={(e) =>
                    setData((prev) => ({
                      ...prev,
                      bhvAangemeld: e.target.checked,
                    }))
                  }
                  className='rounded border-gray-300 dark:border-gray-600 text-blue-600 dark:text-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400'
                />
                <span className='text-sm text-blue-800 dark:text-blue-200'>
                  Let op: <strong>BHV</strong> aanmelden op desbetreffende bord.
                </span>
              </label>
            </div>
          </div>

          {renderTodoSection(
            'Start Dienst Checklist',
            START_SHIFT_TODOS,
            'startShiftTodos',
            <Clock className='w-4 h-4 mr-2 text-blue-600' />
          )}
        </div>
      )}

      {activeSection === 'ochtenddienst' && renderShiftContent('ochtenddienst')}
      {activeSection === 'avonddienst' && renderShiftContent('avonddienst')}

      {activeSection === 'end' && (
        <div className='space-y-6'>
          <div className='bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 rounded-lg p-4'>
            <h3 className='font-medium text-orange-900 dark:text-orange-300 mb-3'>
              Bij einde dienst:
            </h3>
            <div className='text-sm text-orange-800 dark:text-orange-200'>
              <p className='mb-2'>
                Overdracht (en evt. meldplicht-/kamercontrolelijst) e-mailen
                naar:
              </p>
              <div className='space-y-1 ml-4'>
                <div>• s.schuyer@woonfervent.nl</div>
                <div>• j.heij@woonfervent.nl</div>
                <div>• v.elkhadir@woonfervent.nl</div>
              </div>
            </div>
          </div>

          {renderTodoSection(
            'Einde Dienst Checklist',
            END_SHIFT_TODOS,
            'endShiftTodos',
            <CheckCircle className='w-4 h-4 mr-2 text-green-600' />
          )}
        </div>
      )}

      {/* Actions */}
      <div className='border-t border-gray-200 dark:border-gray-700 pt-6'>
        <div className='flex flex-wrap gap-3'>
          <button
            onClick={() => {
              localStorage.setItem(
                `handover-v4-${data.datum}`,
                JSON.stringify(data)
              );
              notify('Overdracht opgeslagen', 'success');
            }}
            className='bg-blue-500 dark:bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors flex items-center'
          >
            <Save className='w-4 h-4 mr-2' />
            Opslaan
          </button>

          <button
            onClick={exportToPDF}
            className='bg-gray-600 dark:bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors flex items-center'
          >
            <Download className='w-4 h-4 mr-2' />
            Download PDF
          </button>

          <button
            onClick={sendToManagement}
            className='bg-green-600 dark:bg-green-700 text-white px-6 py-2 rounded-md hover:bg-green-700 dark:hover:bg-green-800 transition-colors flex items-center'
          >
            <Send className='w-4 h-4 mr-2' />
            E-mail naar Management
          </button>

          <button
            onClick={completeHandover}
            disabled={completing || data.completed}
            className={`px-8 py-2 rounded-md font-medium transition-colors flex items-center ${
              data.completed
                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 cursor-not-allowed'
                : 'bg-orange-500 dark:bg-orange-600 text-white hover:bg-orange-600 dark:hover:bg-orange-700'
            }`}
          >
            {completing ? (
              <>
                <Loader className='w-4 h-4 mr-2 animate-spin' />
                Afronden...
              </>
            ) : data.completed ? (
              <>
                <CheckCircle className='w-4 h-4 mr-2' />
                Afgerond
              </>
            ) : (
              <>
                <FileText className='w-4 h-4 mr-2' />
                Overdracht Afronden
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
