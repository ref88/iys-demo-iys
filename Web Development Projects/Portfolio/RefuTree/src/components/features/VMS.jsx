import React, { useState, useEffect, useReducer, useCallback, createContext, useContext } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';
import { useLocation, LocationProvider } from '../../contexts/LocationContext.jsx';
import DataService from '../../utils/dataService.js';
import { 
  User, Users, Calendar, FileText, Bell, Search, LogOut, Home, BarChart, Settings, 
  Check, X, Clock, MapPin, Phone, Mail, Globe, Eye, Download, ChevronDown, UserPlus, 
  Activity, TrendingUp, AlertCircle, CheckCircle, Edit, Save, Plus, Filter, 
  ChevronLeft, ChevronRight, Upload, Trash2, RefreshCw, ExternalLink, Star,
  Building, Shield, UserCheck, AlertTriangle, Archive, Crown, UserCog, Camera,
  Tag, Zap, Brain, Target, Lightbulb
} from 'lucide-react';
import NotificationPanel from '../NotificationPanel.jsx';
import Residents from '../residents/Residents.jsx';
import LeaveRequests from './LeaveRequests.jsx';
import Documents from './Documents.jsx';
import DataExport from './DataExport.jsx';
import AddResidentModal from '../forms/AddResidentModal.jsx';
import ResidentViewModal from '../forms/ResidentViewModal.jsx';
import Dashboard from '../dashboard/Dashboard.jsx';
import CapacityDashboard from '../analytics/CapacityDashboard.jsx';
import AgeGroupAnalytics from '../analytics/AgeGroupAnalytics.jsx';
import SchoolTracker from '../analytics/SchoolTracker.jsx';
import MonthlyTrends from '../analytics/MonthlyTrends.jsx';
import LabelsManager from './LabelsManager.jsx';
import IncidentManager from './IncidentManager.jsx';
import UserSelector from './UserSelector.jsx';
import AuditTrail from './AuditTrail.jsx';
import ShiftSchedule from '../dashboard/ShiftSchedule.jsx';
import ShiftAssignmentModal from '../forms/ShiftAssignmentModal.jsx';
import ShiftAnalytics from '../dashboard/ShiftAnalytics.jsx';
import ShiftHandover from '../dashboard/ShiftHandover.jsx';
import AIAssistant from './AIAssistant.jsx';

// Profile photos array - organized by gender and age
const malePhotos = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format'
];

const femalePhotos = [
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1465101178521-c1a9136a3b41?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1524253482453-3fed8d2fe12b?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face&auto=format'
];

const childPhotos = [
  'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=150&h=150&fit=crop&crop=face&auto=format'
];

const elderlyPhotos = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format',
  'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format'
];

// Function to get random profile photo based on gender and age
const getRandomPhoto = (gender = 'M', age = 30, name = 'Bewoner') => {
  // Eenvoudige UI Avatar
  const color = gender === 'M' ? '3b82f6' : 'ec4899';
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${color}&color=ffffff&size=150&bold=true`;
};

// State management with useReducer for better state handling
const initialState = {
  residents: [
    // CNO Bewoners (Asielzoekers met V-nummers)
    {
      id: 1,
      name: 'Ahmad Al-Rashid',
      gender: 'M',
      nationality: 'Syrië',
      status: 'In procedure',
      statusColor: 'yellow',
      room: 'A-101',
      vNumber: 'V-2024-001',
      bsnNumber: null,
      bsnStatus: null,
      attendance: 'Aanwezig',
      lastSeen: 'Nu online',
      leaveBalance: 15,
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format',
      birthDate: '1985-03-15',
      phone: '+31 6 12345678',
      email: 'ahmad@example.com',
      language: 'Arabisch',
      priority: 'Normal',
      caseworker: 'Sarah Johnson',
      notes: 'Asielaanvraag in behandeling. Nederlands leren.',
      labels: [17], // 1e waarschuwing
      medicalInfo: {
        allergies: ['Noten'],
        medications: ['Vitamine D'],
        emergencyContact: 'Fatima Al-Rashid +31 6 87654321'
      },
      documents: [
        { name: 'Asielaanvraag', status: 'In behandeling', type: 'Asylum' },
        { name: 'Identiteitsbewijs', status: 'Geverifieerd', type: 'ID' },
        { name: 'Medische verklaring', status: 'In behandeling', type: 'Medical' }
      ],
      locationType: 'CNO'
    },
    {
      id: 2,
      name: 'Fatima Hassan',
      gender: 'V',
      nationality: 'Somalië',
      status: 'In procedure',
      statusColor: 'yellow',
      room: 'B-203',
      vNumber: 'V-2024-002',
      bsnNumber: null,
      bsnStatus: null,
      attendance: 'Aanwezig',
      lastSeen: '2 uur geleden',
      leaveBalance: 8,
      photo: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format',
      birthDate: '1992-07-22',
      phone: '+31 6 23456789',
      email: 'fatima@example.com',
      language: 'Somalisch',
      priority: 'High',
      caseworker: 'Maria Rodriguez',
      notes: 'Moeder van 2 kinderen. Heeft extra ondersteuning nodig bij integratie.',
      labels: [2, 4, 6], // IND Sticker, Medicatie, Nederlandse Les
      medicalInfo: {
        allergies: [],
        medications: ['IJzer supplement'],
        emergencyContact: 'Abdi Hassan +31 6 34567890'
      },
      documents: [
        { name: 'Geboorteakte', status: 'Geverifieerd', type: 'Birth' },
        { name: 'Asielaanvraag', status: 'In behandeling', type: 'Asylum' },
        { name: 'Kindergeboorteakten', status: 'Geverifieerd', type: 'Birth' }
      ],
      locationType: 'CNO'
    },
    {
      id: 3,
      name: 'Omar Khalil',
      gender: 'M',
      nationality: 'Irak',
      status: 'Tijdelijke bescherming',
      statusColor: 'blue',
      room: 'C-305',
      vNumber: 'V-2024-003',
      bsnNumber: null,
      bsnStatus: null,
      attendance: 'Afwezig',
      lastSeen: '1 dag geleden',
      leaveBalance: 22,
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format',
      birthDate: '1988-11-08',
      phone: '+31 6 34567890',
      email: 'omar@example.com',
      language: 'Arabisch',
      priority: 'Normal',
      caseworker: 'Sarah Johnson',
      notes: 'Werkzaam als vrijwilliger in de keuken. Goede integratie.',
      labels: [7, 8], // Werk Zoeken, Logee
      medicalInfo: {
        allergies: ['Lactose'],
        medications: [],
        emergencyContact: 'Layla Khalil +31 6 45678901'
      },
      documents: [
        { name: 'Tijdelijke verblijfsvergunning', status: 'Geverifieerd', type: 'Residence' },
        { name: 'Werkvergunning', status: 'Geverifieerd', type: 'Work' },
        { name: 'Taal certificaat', status: 'Geverifieerd', type: 'Language' }
      ],
      locationType: 'CNO'
    },
    // Oekraïense Bewoners (met BSN-nummers)
    {
      id: 4,
      name: 'Olena Kovalenko',
      gender: 'V',
      nationality: 'Oekraïne',
      status: 'Tijdelijke bescherming',
      statusColor: 'blue',
      room: 'D-401',
      vNumber: null,
      bsnNumber: '123456789',
      bsnStatus: 'Toegekend',
      attendance: 'Aanwezig',
      lastSeen: 'Nu online',
      leaveBalance: 18,
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format',
      birthDate: '1990-05-12',
      phone: '+31 6 56789012',
      email: 'olena@example.com',
      language: 'Oekraïens',
      priority: 'Normal',
      caseworker: 'Ahmed Hassan',
      notes: 'Docent Engels. Zoekt werk in het onderwijs. Goede Nederlandse taalvaardigheid.',
      medicalInfo: {
        allergies: [],
        medications: [],
        emergencyContact: 'Mykola Kovalenko +31 6 67890123'
      },
      documents: [
        { name: 'BSN Bewijs', status: 'Geverifieerd', type: 'BSN' },
        { name: 'Diploma Docent Engels', status: 'Geverifieerd', type: 'Education' },
        { name: 'Zorgverzekering', status: 'Geverifieerd', type: 'Insurance' }
      ],
      locationType: 'OEKRAINE'
    },
    {
      id: 5,
      name: 'Viktor Petrenko',
      gender: 'M',
      nationality: 'Oekraïne',
      status: 'Tijdelijke bescherming',
      statusColor: 'blue',
      room: 'D-402',
      vNumber: null,
      bsnNumber: null,
      bsnStatus: 'Aangevraagd',
      attendance: 'Aanwezig',
      lastSeen: '3 uur geleden',
      leaveBalance: 12,
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format',
      birthDate: '1987-09-25',
      phone: '+31 6 78901234',
      email: 'viktor@example.com',
      language: 'Oekraïens',
      priority: 'High',
      caseworker: 'Lisa Chen',
      notes: 'Ingenieur. BSN nog in behandeling. Actief in vrijwilligerswerk.',
      medicalInfo: {
        allergies: ['Penicilline'],
        medications: ['Astma inhalator'],
        emergencyContact: 'Olena Petrenko +31 6 89012345'
      },
      documents: [
        { name: 'BSN Aanvraag', status: 'In behandeling', type: 'BSN' },
        { name: 'Ingenieur Diploma', status: 'Geverifieerd', type: 'Education' },
        { name: 'Medische verklaring', status: 'Geverifieerd', type: 'Medical' }
      ],
      locationType: 'OEKRAINE'
    },
    {
      id: 6,
      name: 'Mariya Shevchenko',
      gender: 'V',
      nationality: 'Oekraïne',
      status: 'Tijdelijke bescherming',
      statusColor: 'blue',
      room: 'D-403',
      vNumber: null,
      bsnNumber: '987654321',
      bsnStatus: 'Toegekend',
      attendance: 'Op verlof',
      lastSeen: '2 dagen geleden',
      leaveBalance: 5,
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face&auto=format',
      birthDate: '1995-12-03',
      phone: '+31 6 90123456',
      email: 'mariya@example.com',
      language: 'Oekraïens',
      priority: 'Normal',
      caseworker: 'Ahmed Hassan',
      notes: 'Verpleegkundige. Werkt parttime in lokale zorginstelling.',
      medicalInfo: {
        allergies: [],
        medications: [],
        emergencyContact: 'Andriy Shevchenko +31 6 01234567'
      },
      documents: [
        { name: 'BSN Bewijs', status: 'Geverifieerd', type: 'BSN' },
        { name: 'Verpleegkundige Diploma', status: 'Geverifieerd', type: 'Education' },
        { name: 'Werkvergunning Zorg', status: 'Geverifieerd', type: 'Work' }
      ],
      locationType: 'OEKRAINE'
    },
    {
      id: 10,
      name: 'Dmytro Bondarenko',
      gender: 'M',
      nationality: 'Oekraïne',
      status: 'Tijdelijke bescherming',
      statusColor: 'blue',
      room: 'D-404',
      vNumber: null,
      bsnNumber: '112233445',
      bsnStatus: 'Toegekend',
      attendance: 'Aanwezig',
      lastSeen: 'Nu online',
      leaveBalance: 9,
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face&auto=format',
      birthDate: '1983-02-14',
      phone: '+31 6 23459876',
      email: 'dmytro@example.com',
      language: 'Oekraïens',
      priority: 'Normal',
      caseworker: 'Sarah Johnson',
      notes: 'Houdt van tuinieren en werkt in de moestuin.',
      medicalInfo: {
        allergies: ['Pollen'],
        medications: [],
        emergencyContact: 'Kateryna Bondarenko +31 6 34561234'
      },
      documents: [
        { name: 'BSN Bewijs', status: 'Geverifieerd', type: 'BSN' }
      ],
      locationType: 'OEKRAINE'
    },
    {
      id: 11,
      name: 'Kateryna Melnyk',
      gender: 'V',
      nationality: 'Oekraïne',
      status: 'Tijdelijke bescherming',
      statusColor: 'blue',
      room: 'D-405',
      vNumber: null,
      bsnNumber: null,
      bsnStatus: 'Aangevraagd',
      attendance: 'Afwezig',
      lastSeen: '1 dag geleden',
      leaveBalance: 6,
      photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face&auto=format',
      birthDate: '1997-08-21',
      phone: '+31 6 34561234',
      email: 'kateryna@example.com',
      language: 'Oekraïens',
      priority: 'Low',
      caseworker: 'Maria Rodriguez',
      notes: 'Speelt piano en geeft muziekles aan kinderen.',
      medicalInfo: {
        allergies: [],
        medications: [],
        emergencyContact: 'Dmytro Melnyk +31 6 45612345'
      },
      documents: [
        { name: 'BSN Aanvraag', status: 'In behandeling', type: 'BSN' }
      ],
      locationType: 'OEKRAINE'
    },
    {
      id: 12,
      name: 'Yuriy Ivanov',
      gender: 'M',
      nationality: 'Oekraïne',
      status: 'Tijdelijke bescherming',
      statusColor: 'blue',
      room: 'D-406',
      vNumber: null,
      bsnNumber: '998877665',
      bsnStatus: 'Toegekend',
      attendance: 'Aanwezig',
      lastSeen: '2 uur geleden',
      leaveBalance: 11,
      photo: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face&auto=format',
      birthDate: '1989-11-11',
      phone: '+31 6 45612345',
      email: 'yuriy@example.com',
      language: 'Oekraïens',
      priority: 'High',
      caseworker: 'Lisa Chen',
      notes: 'Houdt van schaken en organiseert toernooien.',
      medicalInfo: {
        allergies: ['Noten'],
        medications: [],
        emergencyContact: 'Olena Ivanova +31 6 56712345'
      },
      documents: [
        { name: 'BSN Bewijs', status: 'Geverifieerd', type: 'BSN' }
      ],
      locationType: 'OEKRAINE'
    },
    // Senioren (65+) - CNO
    {
      id: 13,
      name: 'Hassan Al-Mahmoud',
      gender: 'M',
      nationality: 'Syrië',
      status: 'In procedure',
      statusColor: 'yellow',
      room: 'A-102',
      vNumber: 'V-2024-013',
      bsnNumber: null,
      bsnStatus: null,
      attendance: 'Aanwezig',
      lastSeen: '1 uur geleden',
      leaveBalance: 10,
      photo: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face&auto=format',
      birthDate: '1955-04-12',
      phone: '+31 6 67890123',
      email: 'hassan@example.com',
      language: 'Arabisch',
      priority: 'High',
      caseworker: 'Sarah Johnson',
      notes: 'Diabetespatiënt. Heeft extra medische zorg nodig.',
      labels: [1], // Medische aandacht
      medicalInfo: {
        allergies: [],
        medications: ['Metformine', 'Insuline'],
        emergencyContact: 'Amina Al-Mahmoud +31 6 78901234'
      },
      documents: [
        { name: 'Medische verklaring', status: 'Geverifieerd', type: 'Medical' },
        { name: 'Asielaanvraag', status: 'In behandeling', type: 'Asylum' }
      ],
      locationType: 'CNO'
    },
    {
      id: 14,
      name: 'Mariam Osman',
      gender: 'V',
      nationality: 'Somalië',
      status: 'In procedure',
      statusColor: 'yellow',
      room: 'B-301',
      vNumber: 'V-2024-014',
      bsnNumber: null,
      bsnStatus: null,
      attendance: 'Aanwezig',
      lastSeen: '3 uur geleden',
      leaveBalance: 8,
      photo: 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=150&h=150&fit=crop&crop=face&auto=format',
      birthDate: '1952-09-30',
      phone: '+31 6 78901234',
      email: 'mariam@example.com',
      language: 'Somalisch',
      priority: 'High',
      caseworker: 'Maria Rodriguez',
      notes: 'Grootmoeder van 3 kleinkinderen. Heeft hulp nodig bij dagelijkse verzorging.',
      labels: [1, 4], // Medische aandacht, Nederlandse les
      medicalInfo: {
        allergies: ['Pinda\'s'],
        medications: ['Bloeddruk medicatie'],
        emergencyContact: 'Farah Osman +31 6 89012345'
      },
      documents: [
        { name: 'Medische verklaring', status: 'Geverifieerd', type: 'Medical' },
        { name: 'Asielaanvraag', status: 'In behandeling', type: 'Asylum' }
      ],
      locationType: 'CNO'
    },
    // Senioren (65+) - Oekraïne
    {
      id: 15,
      name: 'Vasyl Kovalenko',
      gender: 'M',
      nationality: 'Oekraïne',
      status: 'Tijdelijke bescherming',
      statusColor: 'blue',
      room: 'D-501',
      vNumber: null,
      bsnNumber: '112233445',
      bsnStatus: 'Toegekend',
      attendance: 'Aanwezig',
      lastSeen: '30 minuten geleden',
      leaveBalance: 12,
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format',
      birthDate: '1950-07-15',
      phone: '+31 6 89012345',
      email: 'vasyl@example.com',
      language: 'Oekraïens',
      priority: 'High',
      caseworker: 'John Smith',
      notes: 'Gepensioneerde leraar. Geeft Nederlandse les aan andere bewoners.',
      labels: [6], // Nederlandse les
      medicalInfo: {
        allergies: [],
        medications: ['Hartmedicatie'],
        emergencyContact: 'Olena Kovalenko +31 6 90123456'
      },
      documents: [
        { name: 'BSN Bewijs', status: 'Geverifieerd', type: 'BSN' },
        { name: 'Pensioen documenten', status: 'Geverifieerd', type: 'ID' }
      ],
      locationType: 'OEKRAINE'
    },
    
    // Sample child residents with school info
    {
      id: 12,
      name: 'Malik Al-Rashid',
      gender: 'M',
      nationality: 'Syrië',
      status: 'In procedure',
      attendance: 'Aanwezig',
      birthDate: '2015-03-15', // 9 jaar oud
      arrivalDate: '2024-06-15',
      room: 'K-12A',
      address: 'Centrum Noord Opvang',
      phone: '',
      email: '',
      emergencyContact: 'Ahmad Al-Rashid +31 6 12345678',
      caseWorker: 'Emma de Boer',
      caseworker: 'Emma de Boer',
      lastSeen: '2024-12-07 15:30',
      notes: 'Zoon van Ahmad Al-Rashid. Zeer leergierig en spreekt al goed Nederlands.',
      labels: [21, 22], // Leerplichtig, Basisschool
      medicalInfo: {
        allergies: ['Noten'],
        medications: [],
        emergencyContact: 'Ahmad Al-Rashid +31 6 12345678'
      },
      schoolInfo: {
        isAttendingSchool: true,
        schoolType: 'BASIS'
      },
      documents: [
        { name: 'Geboorteakte', status: 'Geverifieerd', type: 'ID' },
        { name: 'School inschrijving', status: 'In behandeling', type: 'ONDERWIJS' }
      ],
      locationType: 'CNO'
    },
    
    {
      id: 13,
      name: 'Amina Hassan',
      gender: 'V',
      nationality: 'Syrië',
      status: 'In procedure',
      attendance: 'Aanwezig',
      birthDate: '2012-08-20', // 12 jaar oud
      arrivalDate: '2024-07-20',
      room: 'K-15B',
      address: 'Centrum Noord Opvang',
      phone: '',
      email: '',
      emergencyContact: 'Fatima Hassan +31 6 23456789',
      caseWorker: 'Emma de Boer',
      caseworker: 'Emma de Boer',
      lastSeen: '2024-12-07 16:00',
      notes: 'Dochter van Fatima Hassan. Heeft extra ondersteuning nodig vanwege leerproblemen.',
      labels: [21, 23], // Leerplichtig, SBO
      medicalInfo: {
        allergies: [],
        medications: ['Concentratiemedicatie'],
        emergencyContact: 'Fatima Hassan +31 6 23456789'
      },
      schoolInfo: {
        isAttendingSchool: true,
        schoolType: 'SBO'
      },
      documents: [
        { name: 'Geboorteakte', status: 'Geverifieerd', type: 'ID' },
        { name: 'SBO Rapport', status: 'Geverifieerd', type: 'ONDERWIJS' }
      ],
      locationType: 'CNO'
    },
    
    {
      id: 14,
      name: 'Petra Kovalenko',
      gender: 'V',
      nationality: 'Oekraïne',
      status: 'Statushouder',
      attendance: 'Aanwezig',
      birthDate: '2008-11-10', // 16 jaar oud
      arrivalDate: '2024-08-10',
      room: 'O-08A',
      address: 'Oekraïne Opvang',
      phone: '+31 6 34567890',
      email: 'petra.kovalenko@email.com',
      emergencyContact: 'Vasyl Kovalenko +31 6 90123456',
      caseWorker: 'Lisa van der Berg',
      caseworker: 'Lisa van der Berg',
      lastSeen: '2024-12-07 14:45',
      notes: 'Dochter van Vasyl Kovalenko. Volgt ISK onderwijs om Nederlands te leren.',
      labels: [21, 24], // Leerplichtig, ISK
      medicalInfo: {
        allergies: [],
        medications: [],
        emergencyContact: 'Vasyl Kovalenko +31 6 90123456'
      },
      schoolInfo: {
        isAttendingSchool: true,
        schoolType: 'ISK'
      },
      documents: [
        { name: 'Oekraïens Paspoort', status: 'Geverifieerd', type: 'ID' },
        { name: 'ISK Inschrijving', status: 'Geverifieerd', type: 'ONDERWIJS' }
      ],
      locationType: 'OEKRAINE'
    }
  ],
  leaveRequests: [
    { 
      id: 1, 
      residentId: 1, 
      resident: 'Ahmad Al-Rashid', 
      startDate: '2024-12-20', 
      endDate: '2024-12-25', 
      reason: 'Familie bezoek', 
      status: 'pending',
      requestDate: '2024-12-01',
      approvedBy: null,
      notes: 'Bezoek aan ziek familielid in Duitsland'
    },
    { 
      id: 2, 
      residentId: 2, 
      resident: 'Fatima Hassan', 
      startDate: '2024-12-15', 
      endDate: '2024-12-16', 
      reason: 'Medische afspraak', 
      status: 'approved',
      requestDate: '2024-11-28',
      approvedBy: 'Jan de Vries',
      notes: 'Specialistische controle ziekenhuis'
    },
    { 
      id: 3, 
      residentId: 3, 
      resident: 'Omar Khalil', 
      startDate: '2024-12-18', 
      endDate: '2024-12-19', 
      reason: 'Sollicitatiegesprek', 
      status: 'pending',
      requestDate: '2024-12-02',
      approvedBy: null,
      notes: 'Tweede gesprek bij Albert Heijn'
    }
  ],
  activities: [
    { 
      id: 1, 
      type: 'check-in', 
      resident: 'Ahmad Al-Rashid', 
      timestamp: new Date(Date.now() - 120000).toISOString(),
      description: 'Check-in uitgevoerd'
    },
    { 
      id: 2, 
      type: 'registration', 
      resident: 'Nieuwe bewoner', 
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      description: 'Nieuwe bewoner geregistreerd'
    },
    { 
      id: 3, 
      type: 'leave-request', 
      resident: 'Omar Khalil', 
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      description: 'Verlofaanvraag ingediend'
    },
    { 
      id: 4, 
      type: 'document-upload', 
      resident: 'Olena Kovalenko', 
      timestamp: new Date(Date.now() - 21600000).toISOString(),
      description: 'Nieuwe documenten geüpload'
    }
  ],
  notifications: [
    {
      id: 1,
      type: 'leave-request',
      title: 'Nieuwe verlofaanvraag',
      message: 'Ahmad Al-Rashid - 5 dagen',
      timestamp: new Date().toISOString(),
      read: false,
      urgent: false
    },
    {
      id: 2,
      type: 'document-expiry',
      title: 'Document verloopt binnenkort',
      message: 'Asielaanvraag Fatima Hassan',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      urgent: true
    }
  ],
  filters: {
    status: '',
    attendance: '',
    nationality: '',
    priority: '',
    caseworker: ''
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0
  }
};

// Reducer for state management
const vmsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_RESIDENTS':
      return { ...state, residents: action.payload };
    case 'ADD_RESIDENT':
      return { ...state, residents: [...state.residents, action.payload] };
    case 'UPDATE_RESIDENT':
      return {
        ...state,
        residents: state.residents.map(resident =>
          resident.id === action.payload.id ? { ...resident, ...action.payload } : resident
        )
      };
    case 'DELETE_RESIDENT':
      return {
        ...state,
        residents: state.residents.filter(resident => resident.id !== action.payload)
      };
    case 'UPDATE_LEAVE_REQUEST':
      return {
        ...state,
        leaveRequests: state.leaveRequests.map(request =>
          request.id === action.payload.id ? { ...request, ...action.payload } : request
        )
      };
    case 'ADD_ACTIVITY':
      return {
        ...state,
        activities: [action.payload, ...state.activities].slice(0, 50)
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_PAGINATION':
      return { ...state, pagination: { ...state.pagination, ...action.payload } };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification =>
          notification.id === action.payload ? { ...notification, read: true } : notification
        )
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 50)
      };
    default:
      return state;
  }
};

// Location context - moved to separate file

// AI Global Intelligence Hub
const aiGlobalIntelligence = {
  // Unified system insights
  generateSystemInsights: (state, currentUser) => {
    const insights = [];
    
    // Cross-module analytics
    const residents = state.residents || [];
    const incidents = state.incidents || [];
    const shifts = state.shifts || [];
    
    // System health score
    const systemHealth = calculateSystemHealth(residents, incidents, shifts);
    insights.push({
      type: 'system_health',
      title: 'Systeem Gezondheid',
      score: systemHealth.score,
      status: systemHealth.status,
      recommendations: systemHealth.recommendations
    });
    
    // Workflow efficiency
    const workflowEfficiency = analyzeWorkflowEfficiency(residents, incidents, shifts);
    insights.push({
      type: 'workflow_efficiency',
      title: 'Workflow Efficiëntie',
      score: workflowEfficiency.score,
      bottlenecks: workflowEfficiency.bottlenecks,
      improvements: workflowEfficiency.improvements
    });
    
    // Resource optimization
    const resourceOptimization = analyzeResourceOptimization(residents, shifts, currentUser);
    insights.push({
      type: 'resource_optimization',
      title: 'Resource Optimalisatie',
      recommendations: resourceOptimization.recommendations,
      potentialSavings: resourceOptimization.savings
    });
    
    return insights;
  },

  // Intelligent workflow automation
  suggestWorkflowAutomations: (state, currentUser) => {
    const automations = [];
    
    // Auto-schedule follow-ups
    const residentsNeedingFollowUp = (state.residents || []).filter(r => 
      r.status === 'In procedure' && !r.nextFollowUp
    );
    
    if (residentsNeedingFollowUp.length > 0) {
      automations.push({
        type: 'auto_schedule_followups',
        title: 'Automatische Follow-up Planning',
        description: `${residentsNeedingFollowUp.length} bewoners hebben follow-up gesprekken nodig`,
        action: 'schedule_followups',
        priority: 'medium',
        estimatedTime: '15 minutes',
        impact: 'high'
      });
    }
    
    // Auto-assign high-priority cases
    const highPriorityResidents = (state.residents || []).filter(r => r.priority === 'High');
    const availableStaff = getAvailableStaff(state.shifts || []);
    
    if (highPriorityResidents.length > 0 && availableStaff.length > 0) {
      automations.push({
        type: 'auto_assign_priority_cases',
        title: 'Automatische Toewijzing Prioriteit Cases',
        description: `${highPriorityResidents.length} hoge prioriteit bewoners toewijzen aan beschikbare staff`,
        action: 'assign_priority_cases',
        priority: 'high',
        estimatedTime: '10 minutes',
        impact: 'critical'
      });
    }
    
    // Auto-generate reports
    const lastReportDate = localStorage.getItem('last_ai_report_date');
    const daysSinceLastReport = lastReportDate ? 
      (new Date() - new Date(lastReportDate)) / (1000 * 60 * 60 * 24) : 7;
    
    if (daysSinceLastReport >= 7) {
      automations.push({
        type: 'auto_generate_reports',
        title: 'Automatische Rapportage',
        description: 'Wekelijks systeem rapport genereren',
        action: 'generate_weekly_report',
        priority: 'low',
        estimatedTime: '5 minutes',
        impact: 'medium'
      });
    }
    
    return automations;
  },

  // Predictive system maintenance
  predictSystemNeeds: (state, historicalData) => {
    const predictions = [];
    
    // Staffing needs prediction
    const upcomingResidents = (state.residents || []).filter(r => 
      new Date(r.arrivalDate) > new Date() && 
      new Date(r.arrivalDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );
    
    if (upcomingResidents.length > 5) {
      predictions.push({
        type: 'staffing_prediction',
        title: 'Staffing Behoefte Voorspelling',
        message: `${upcomingResidents.length} nieuwe bewoners verwacht - extra staffing nodig`,
        timeframe: '30 days',
        confidence: 85,
        recommendedAction: 'Increase staffing by 20%'
      });
    }
    
    // Resource allocation prediction
    const highNeedsResidents = (state.residents || []).filter(r => 
      r.priority === 'High' || r.medicalInfo?.medications?.length > 0
    );
    
    if (highNeedsResidents.length > 10) {
      predictions.push({
        type: 'resource_allocation',
        title: 'Resource Toewijzing Voorspelling',
        message: `${highNeedsResidents.length} bewoners met hoge behoeften - extra resources nodig`,
        timeframe: 'immediate',
        confidence: 90,
        recommendedAction: 'Allocate additional medical and support resources'
      });
    }
    
    return predictions;
  },

  // Smart notification aggregation
  aggregateSmartNotifications: (state) => {
    const notifications = [];
    
    // Critical alerts aggregation
    const criticalAlerts = [];
    
    // Medical alerts
    (state.residents || []).forEach(resident => {
      if (resident.medicalInfo?.medications?.length > 0) {
        const lastCheck = resident.medicalInfo.lastCheck || resident.arrivalDate;
        const daysSinceCheck = (new Date() - new Date(lastCheck)) / (1000 * 60 * 60 * 24);
        
        if (daysSinceCheck > 60) {
          criticalAlerts.push({
            type: 'medical',
            resident: resident.name,
            urgency: 'critical',
            message: 'Medische controle meer dan 60 dagen geleden'
          });
        }
      }
    });
    
    if (criticalAlerts.length > 0) {
      notifications.push({
        type: 'critical_alerts_summary',
        title: 'Kritieke Meldingen Samenvatting',
        count: criticalAlerts.length,
        alerts: criticalAlerts,
        priority: 'critical',
        action: 'review_critical_alerts'
      });
    }
    
    // Workflow bottlenecks
    const workflowBottlenecks = identifyWorkflowBottlenecks(state);
    if (workflowBottlenecks.length > 0) {
      notifications.push({
        type: 'workflow_bottlenecks',
        title: 'Workflow Bottlenecks Gedetecteerd',
        bottlenecks: workflowBottlenecks,
        priority: 'high',
        action: 'optimize_workflows'
      });
    }
    
    return notifications;
  },

  // Intelligent decision support
  provideDecisionSupport: (context, state, currentUser) => {
    const decisions = [];
    
    // Staff assignment decisions
    if (context.type === 'staff_assignment') {
      const availableStaff = getAvailableStaff(state.shifts || []);
      const resident = context.resident;
      
      const recommendedStaff = availableStaff.filter(staff => {
        // Language match
        const languageMatch = staff.languages?.includes(resident.language);
        
        // Experience level
        const experienceMatch = staff.experienceLevel === 'senior' && resident.priority === 'High';
        
        // Specialization match
        const specializationMatch = resident.medicalInfo?.medications?.length > 0 && 
          staff.specializations?.includes('medical');
        
        return languageMatch || experienceMatch || specializationMatch;
      });
      
      if (recommendedStaff.length > 0) {
        decisions.push({
          type: 'staff_assignment',
          title: 'Staff Toewijzing Aanbeveling',
          recommendations: recommendedStaff.map(staff => ({
            staff: staff.name,
            reasons: [
              staff.languages?.includes(resident.language) ? 'Taal match' : null,
              staff.experienceLevel === 'senior' && resident.priority === 'High' ? 'Ervaring niveau' : null,
              staff.specializations?.includes('medical') && resident.medicalInfo?.medications?.length > 0 ? 'Medische specialisatie' : null
            ].filter(Boolean)
          })),
          confidence: 85
        });
      }
    }
    
    // Resource allocation decisions
    if (context.type === 'resource_allocation') {
      const residents = state.residents || [];
      const highPriorityResidents = residents.filter(r => r.priority === 'High');
      
      decisions.push({
        type: 'resource_allocation',
        title: 'Resource Toewijzing Strategie',
        recommendations: [
          {
            action: 'Prioritize medical resources',
            reason: `${highPriorityResidents.length} bewoners met hoge prioriteit`,
            impact: 'high'
          },
          {
            action: 'Increase language support',
            reason: `${residents.filter(r => r.language !== 'Nederlands').length} bewoners met taalbarrière`,
            impact: 'medium'
          }
        ],
        confidence: 80
      });
    }
    
    return decisions;
  }
};

// Helper functions
const calculateSystemHealth = (residents, incidents, shifts) => {
  let score = 100;
  const recommendations = [];
  
  // Incident rate impact
  const incidentRate = incidents.length / Math.max(residents.length, 1);
  if (incidentRate > 0.5) {
    score -= 20;
    recommendations.push('Reduce incident rate through preventive measures');
  }
  
  // Staff coverage impact
  const unfilledShifts = shifts.filter(s => s.assignedStaff.length < s.maxStaff).length;
  if (unfilledShifts > 0) {
    score -= 15;
    recommendations.push('Fill unfilled shifts to improve coverage');
  }
  
  // Resident satisfaction impact (based on integration scores)
  const avgIntegrationScore = residents.reduce((sum, r) => sum + (r.integrationScore || 0), 0) / Math.max(residents.length, 1);
  if (avgIntegrationScore < 50) {
    score -= 25;
    recommendations.push('Improve integration support for residents');
  }
  
  return {
    score: Math.max(0, score),
    status: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'poor',
    recommendations
  };
};

const analyzeWorkflowEfficiency = (residents, incidents, shifts) => {
  const bottlenecks = [];
  const improvements = [];
  
  // Identify bottlenecks
  const highIncidentResidents = residents.filter(r => 
    incidents.filter(i => i.residentId === r.id).length > 2
  );
  
  if (highIncidentResidents.length > 0) {
    bottlenecks.push({
      type: 'high_incident_residents',
      description: `${highIncidentResidents.length} bewoners met meerdere incidenten`,
      impact: 'high'
    });
  }
  
  // Suggest improvements
  if (highIncidentResidents.length > 0) {
    improvements.push({
      action: 'Implement preventive measures',
      impact: 'high',
      effort: 'medium'
    });
  }
  
  return {
    score: 100 - (bottlenecks.length * 10),
    bottlenecks,
    improvements
  };
};

const analyzeResourceOptimization = (residents, shifts, currentUser) => {
  const recommendations = [];
  let potentialSavings = 0;
  
  // Staff utilization analysis
  const totalShiftHours = shifts.reduce((sum, shift) => sum + getShiftDuration(shift), 0);
  const averageHourlyRate = 25;
  const currentCost = totalShiftHours * averageHourlyRate;
  
  // Identify optimization opportunities
  const underutilizedShifts = shifts.filter(s => s.assignedStaff.length < s.maxStaff / 2);
  if (underutilizedShifts.length > 0) {
    recommendations.push({
      type: 'shift_consolidation',
      description: `Consolideer ${underutilizedShifts.length} onderbenutte diensten`,
      potentialSavings: underutilizedShifts.length * 4 * averageHourlyRate
    });
  }
  
  potentialSavings = recommendations.reduce((sum, rec) => sum + (rec.potentialSavings || 0), 0);
  
  return {
    recommendations,
    savings: potentialSavings
  };
};

const getAvailableStaff = (shifts) => {
  // This would integrate with actual staff data
  return [
    { id: 1, name: 'Fabian', languages: ['Nederlands', 'Engels'], experienceLevel: 'senior', specializations: ['medical'] },
    { id: 2, name: 'Ryan', languages: ['Nederlands', 'Engels'], experienceLevel: 'intermediate', specializations: ['social'] },
    { id: 3, name: 'Carlos', languages: ['Nederlands', 'Spaans'], experienceLevel: 'senior', specializations: ['integration'] }
  ];
};

const getShiftDuration = (shift) => {
  const start = new Date(`2000-01-01 ${shift.startTime}`);
  const end = new Date(`2000-01-01 ${shift.endTime}`);
  return (end - start) / (1000 * 60 * 60);
};

const identifyWorkflowBottlenecks = (state) => {
  const bottlenecks = [];
  
  // Document processing bottlenecks
  const residentsWithMissingDocs = (state.residents || []).filter(r => 
    !r.documents?.some(d => d.name === 'Identiteitsbewijs')
  );
  
  if (residentsWithMissingDocs.length > 5) {
    bottlenecks.push({
      type: 'document_processing',
      description: `${residentsWithMissingDocs.length} bewoners missen belangrijke documenten`,
      impact: 'medium'
    });
  }
  
  return bottlenecks;
};

const VMS = () => {
  const { user, logout, hasPermission, getFilteredResidents } = useAuth();
  const [state, dispatch] = useReducer(vmsReducer, initialState);
  const [activeView, setActiveView] = useState('dashboard');
  const [showLabelsManager, setShowLabelsManager] = useState(false);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showUserSelector, setShowUserSelector] = useState(false);
  const [showShiftSchedule, setShowShiftSchedule] = useState(false);
  const [showShiftAssignment, setShowShiftAssignment] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [showShiftAnalytics, setShowShiftAnalytics] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [language, setLanguage] = useState('nl');
  const [editingResident, setEditingResident] = useState(null);
  const [showAddResident, setShowAddResident] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationType, setLocationType] = useState('CNO'); // 'CNO' of 'OEKRAINE'
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [globalSearchResults, setGlobalSearchResults] = useState([]);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [isGlobalSearching, setIsGlobalSearching] = useState(false);

  // Caseworkers array for AddResidentModal
  const caseworkers = [
    'Sarah Johnson',
    'Maria Rodriguez', 
    'Ahmed Hassan',
    'Lisa Chen'
  ];

  // Enhanced translations
  const translations = {
    nl: {
      dashboard: 'Dashboard',
      residents: 'Bewoners',
      leave: 'Verlof',
      reports: 'Rapportages',
      settings: 'Instellingen',
      search: 'Zoeken...',
      overview: 'Overzicht',
      totalResidents: 'Totaal Bewoners',
      present: 'Aanwezig',
      onLeave: 'Op Verlof',
      absent: 'Afwezig',
      recentActivities: 'Recente Activiteiten',
      leaveRequests: 'Verlofaanvragen',
      approve: 'Goedkeuren',
      reject: 'Afwijzen',
      pending: 'In behandeling',
      occupancyRate: 'Bezettingsgraad',
      addResident: 'Nieuwe Bewoner',
      editResident: 'Bewoner Bewerken',
      save: 'Opslaan',
      cancel: 'Annuleren',
      delete: 'Verwijderen',
      filters: 'Filters',
      notifications: 'Meldingen',
      documents: 'Documenten',
      medicalInfo: 'Medische Informatie',
      emergencyContact: 'Noodcontact',
      caseworker: 'Begeleider',
      priority: 'Prioriteit',
      notes: 'Notities'
    },
    en: {
      dashboard: 'Dashboard',
      residents: 'Residents',
      leave: 'Leave',
      reports: 'Reports',
      settings: 'Settings',
      search: 'Search...',
      overview: 'Overview',
      totalResidents: 'Total Residents',
      present: 'Present',
      onLeave: 'On Leave',
      absent: 'Absent',
      recentActivities: 'Recent Activities',
      leaveRequests: 'Leave Requests',
      approve: 'Approve',
      reject: 'Reject',
      pending: 'Pending',
      occupancyRate: 'Occupancy Rate',
      addResident: 'Add Resident',
      editResident: 'Edit Resident',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      filters: 'Filters',
      notifications: 'Notifications',
      documents: 'Documents',
      medicalInfo: 'Medical Information',
      emergencyContact: 'Emergency Contact',
      caseworker: 'Case Worker',
      priority: 'Priority',
      notes: 'Notes'
    }
  };

  const t = translations[language];

  // Load initial data and check for user selection
  useEffect(() => {
    // Check if this is the first visit of the day
    const lastVisit = localStorage.getItem('vms_last_visit');
    const today = new Date().toDateString();
    
    if (lastVisit !== today) {
      // First visit of the day - prompt for user selection
      setShowUserSelector(true);
      localStorage.setItem('vms_last_visit', today);
    }
    
    // Load saved data using DataService
    let residents = DataService.getResidents();
    const leaveRequests = DataService.getLeaveRequests();
    const labels = DataService.getLabels();
    
    console.log('Loaded residents from localStorage:', residents.length);
    console.log('CNO residents:', residents.filter(r => r.locationType === 'CNO').length);
    console.log('OEKRAINE residents:', residents.filter(r => r.locationType === 'OEKRAINE').length);
    
    // Initialize with comprehensive demo data if none exists or if data doesn't have both CNO and OEKRAINE residents
    const hasCNOResidents = residents.some(r => r.locationType === 'CNO');
    const hasOekraineResidents = residents.some(r => r.locationType === 'OEKRAINE');
    
    if (residents.length === 0 || !hasCNOResidents || !hasOekraineResidents) {
      // Use comprehensive demo data from Residents component
      const comprehensiveResidents = [
        // CNO Bewoners (Asielzoekers met V-nummers)
        {
          id: 1,
          name: 'Ahmad Al-Rashid',
          gender: 'M',
          nationality: 'Syrië',
          status: 'In procedure',
          statusColor: 'yellow',
          room: 'A-101',
          vNumber: 'V-2024-001',
          bsnNumber: null,
          bsnStatus: null,
          attendance: 'Aanwezig',
          lastSeen: 'Nu online',
          leaveBalance: 15,
          photo: getRandomPhoto('M', 30, 'Ahmad Al-Rashid'),
          birthDate: '1985-03-15',
          phone: '+31 6 12345678',
          email: 'ahmad@example.com',
          language: 'Arabisch',
          priority: 'Normal',
          caseworker: 'Sarah Johnson',
          notes: 'Asielaanvraag in behandeling. Nederlands leren.',
          labels: [17], // 1e waarschuwing
          medicalInfo: {
            allergies: ['Noten'],
            medications: ['Vitamine D'],
            emergencyContact: 'Fatima Al-Rashid +31 6 87654321'
          },
          documents: [
            { name: 'Asielaanvraag', status: 'In behandeling', type: 'Asylum' },
            { name: 'Identiteitsbewijs', status: 'Geverifieerd', type: 'ID' },
            { name: 'Medische verklaring', status: 'In behandeling', type: 'Medical' }
          ],
          locationType: 'CNO'
        },
        {
          id: 2,
          name: 'Fatima Hassan',
          gender: 'V',
          nationality: 'Somalië',
          status: 'In procedure',
          statusColor: 'yellow',
          room: 'B-203',
          vNumber: 'V-2024-002',
          bsnNumber: null,
          bsnStatus: null,
          attendance: 'Aanwezig',
          lastSeen: '2 uur geleden',
          leaveBalance: 8,
          photo: getRandomPhoto('F', 28, 'Fatima Hassan'),
          birthDate: '1992-07-22',
          phone: '+31 6 23456789',
          email: 'fatima@example.com',
          language: 'Somalisch',
          priority: 'High',
          caseworker: 'Maria Rodriguez',
          notes: 'Moeder van 2 kinderen. Heeft extra ondersteuning nodig bij integratie.',
          labels: [2, 4, 6], // IND Sticker, Medicatie, Nederlandse Les
          medicalInfo: {
            allergies: [],
            medications: ['IJzer supplement'],
            emergencyContact: 'Abdi Hassan +31 6 34567890'
          },
          documents: [
            { name: 'Geboorteakte', status: 'Geverifieerd', type: 'Birth' },
            { name: 'Asielaanvraag', status: 'In behandeling', type: 'Asylum' },
            { name: 'Kindergeboorteakten', status: 'Geverifieerd', type: 'Birth' }
          ],
          locationType: 'CNO'
        },
        {
          id: 3,
          name: 'Omar Khalil',
          gender: 'M',
          nationality: 'Irak',
          status: 'Tijdelijke bescherming',
          statusColor: 'blue',
          room: 'C-305',
          vNumber: 'V-2024-003',
          bsnNumber: null,
          bsnStatus: null,
          attendance: 'Afwezig',
          lastSeen: '1 dag geleden',
          leaveBalance: 22,
          photo: getRandomPhoto('M', 32, 'Omar Khalil'),
          birthDate: '1988-11-08',
          phone: '+31 6 34567890',
          email: 'omar@example.com',
          language: 'Arabisch',
          priority: 'Normal',
          caseworker: 'Sarah Johnson',
          notes: 'Werkzaam als vrijwilliger in de keuken. Goede integratie.',
          labels: [7, 8], // Werk Zoeken, Logee
          medicalInfo: {
            allergies: ['Lactose'],
            medications: [],
            emergencyContact: 'Layla Khalil +31 6 45678901'
          },
          documents: [
            { name: 'Tijdelijke verblijfsvergunning', status: 'Geverifieerd', type: 'Residence' },
            { name: 'Werkvergunning', status: 'Geverifieerd', type: 'Work' },
            { name: 'Taal certificaat', status: 'Geverifieerd', type: 'Language' }
          ],
          locationType: 'CNO'
        },
        // Oekraïense Bewoners (met BSN-nummers)
        {
          id: 4,
          name: 'Olena Kovalenko',
          gender: 'V',
          nationality: 'Oekraïne',
          status: 'Tijdelijke bescherming',
          statusColor: 'blue',
          room: 'D-401',
          vNumber: null,
          bsnNumber: '123456789',
          bsnStatus: 'Toegekend',
          attendance: 'Aanwezig',
          lastSeen: 'Nu online',
          leaveBalance: 18,
          photo: getRandomPhoto('F', 29, 'Olena Kovalenko'),
          birthDate: '1990-05-12',
          phone: '+31 6 56789012',
          email: 'olena@example.com',
          language: 'Oekraïens',
          priority: 'Normal',
          caseworker: 'Ahmed Hassan',
          notes: 'Docent Engels. Zoekt werk in het onderwijs. Goede Nederlandse taalvaardigheid.',
          medicalInfo: {
            allergies: [],
            medications: [],
            emergencyContact: 'Mykola Kovalenko +31 6 67890123'
          },
          documents: [
            { name: 'BSN Bewijs', status: 'Geverifieerd', type: 'BSN' },
            { name: 'Diploma Docent Engels', status: 'Geverifieerd', type: 'Education' },
            { name: 'Zorgverzekering', status: 'Geverifieerd', type: 'Insurance' }
          ],
          locationType: 'OEKRAINE'
        },
        {
          id: 5,
          name: 'Viktor Petrenko',
          gender: 'M',
          nationality: 'Oekraïne',
          status: 'Tijdelijke bescherming',
          statusColor: 'blue',
          room: 'D-402',
          vNumber: null,
          bsnNumber: null,
          bsnStatus: 'Aangevraagd',
          attendance: 'Aanwezig',
          lastSeen: '3 uur geleden',
          leaveBalance: 12,
          photo: getRandomPhoto('M', 31, 'Viktor Petrenko'),
          birthDate: '1987-09-25',
          phone: '+31 6 78901234',
          email: 'viktor@example.com',
          language: 'Oekraïens',
          priority: 'High',
          caseworker: 'Lisa Chen',
          notes: 'Ingenieur. BSN nog in behandeling. Actief in vrijwilligerswerk.',
          medicalInfo: {
            allergies: ['Penicilline'],
            medications: ['Astma inhalator'],
            emergencyContact: 'Olena Petrenko +31 6 89012345'
          },
          documents: [
            { name: 'BSN Aanvraag', status: 'In behandeling', type: 'BSN' },
            { name: 'Ingenieur Diploma', status: 'Geverifieerd', type: 'Education' },
            { name: 'Medische verklaring', status: 'Geverifieerd', type: 'Medical' }
          ],
          locationType: 'OEKRAINE'
        },
        {
          id: 6,
          name: 'Mariya Shevchenko',
          gender: 'V',
          nationality: 'Oekraïne',
          status: 'Tijdelijke bescherming',
          statusColor: 'blue',
          room: 'D-403',
          vNumber: null,
          bsnNumber: '987654321',
          bsnStatus: 'Toegekend',
          attendance: 'Op verlof',
          lastSeen: '2 dagen geleden',
          leaveBalance: 5,
          photo: getRandomPhoto('F', 25, 'Mariya Shevchenko'),
          birthDate: '1995-12-03',
          phone: '+31 6 90123456',
          email: 'mariya@example.com',
          language: 'Oekraïens',
          priority: 'Normal',
          caseworker: 'Ahmed Hassan',
          notes: 'Verpleegkundige. Werkt parttime in lokale zorginstelling.',
          medicalInfo: {
            allergies: [],
            medications: [],
            emergencyContact: 'Andriy Shevchenko +31 6 01234567'
          },
          documents: [
            { name: 'BSN Bewijs', status: 'Geverifieerd', type: 'BSN' },
            { name: 'Verpleegkundige Diploma', status: 'Geverifieerd', type: 'Education' },
            { name: 'Werkvergunning Zorg', status: 'Geverifieerd', type: 'Work' }
          ],
          locationType: 'OEKRAINE'
        },
        {
          id: 10,
          name: 'Dmytro Bondarenko',
          gender: 'M',
          nationality: 'Oekraïne',
          status: 'Tijdelijke bescherming',
          statusColor: 'blue',
          room: 'D-404',
          vNumber: null,
          bsnNumber: '112233445',
          bsnStatus: 'Toegekend',
          attendance: 'Aanwezig',
          lastSeen: 'Nu online',
          leaveBalance: 9,
          photo: getRandomPhoto('M', 40, 'Dmytro Bondarenko'),
          birthDate: '1983-02-14',
          phone: '+31 6 23459876',
          email: 'dmytro@example.com',
          language: 'Oekraïens',
          priority: 'Normal',
          caseworker: 'Sarah Johnson',
          notes: 'Houdt van tuinieren en werkt in de moestuin.',
          medicalInfo: {
            allergies: ['Pollen'],
            medications: [],
            emergencyContact: 'Kateryna Bondarenko +31 6 34561234'
          },
          documents: [
            { name: 'BSN Bewijs', status: 'Geverifieerd', type: 'BSN' }
          ],
          locationType: 'OEKRAINE'
        },
        {
          id: 11,
          name: 'Kateryna Melnyk',
          gender: 'V',
          nationality: 'Oekraïne',
          status: 'Tijdelijke bescherming',
          statusColor: 'blue',
          room: 'D-405',
          vNumber: null,
          bsnNumber: null,
          bsnStatus: 'Aangevraagd',
          attendance: 'Afwezig',
          lastSeen: '1 dag geleden',
          leaveBalance: 6,
          photo: getRandomPhoto('F', 26, 'Kateryna Melnyk'),
          birthDate: '1997-08-21',
          phone: '+31 6 34561234',
          email: 'kateryna@example.com',
          language: 'Oekraïens',
          priority: 'Low',
          caseworker: 'Maria Rodriguez',
          notes: 'Speelt piano en geeft muziekles aan kinderen.',
          medicalInfo: {
            allergies: [],
            medications: [],
            emergencyContact: 'Dmytro Melnyk +31 6 45612345'
          },
          documents: [
            { name: 'BSN Aanvraag', status: 'In behandeling', type: 'BSN' }
          ],
          locationType: 'OEKRAINE'
        },
        {
          id: 12,
          name: 'Yuriy Ivanov',
          gender: 'M',
          nationality: 'Oekraïne',
          status: 'Tijdelijke bescherming',
          statusColor: 'blue',
          room: 'D-406',
          vNumber: null,
          bsnNumber: '998877665',
          bsnStatus: 'Toegekend',
          attendance: 'Aanwezig',
          lastSeen: '2 uur geleden',
          leaveBalance: 11,
          photo: getRandomPhoto('M', 34, 'Yuriy Ivanov'),
          birthDate: '1989-11-11',
          phone: '+31 6 45612345',
          email: 'yuriy@example.com',
          language: 'Oekraïens',
          priority: 'High',
          caseworker: 'Lisa Chen',
          notes: 'Houdt van schaken en organiseert toernooien.',
          medicalInfo: {
            allergies: ['Noten'],
            medications: [],
            emergencyContact: 'Olena Ivanova +31 6 56712345'
          },
          documents: [
            { name: 'BSN Bewijs', status: 'Geverifieerd', type: 'BSN' }
          ],
          locationType: 'OEKRAINE'
        }
      ];
      
      DataService.setResidents(comprehensiveResidents);
      residents = comprehensiveResidents;
      console.log('Loaded comprehensive demo data with', comprehensiveResidents.length, 'residents');
      console.log('CNO residents:', comprehensiveResidents.filter(r => r.locationType === 'CNO').length);
      console.log('OEKRAINE residents:', comprehensiveResidents.filter(r => r.locationType === 'OEKRAINE').length);
    }
    
    dispatch({ type: 'SET_RESIDENTS', payload: residents });
    
    if (leaveRequests.length === 0) {
      dispatch({ type: 'SET_LEAVE_REQUESTS', payload: initialState.leaveRequests });
    } else {
      dispatch({ type: 'SET_LEAVE_REQUESTS', payload: leaveRequests });
    }
    
    if (labels.length === 0) {
      dispatch({ type: 'SET_LABELS', payload: initialState.labels });
    } else {
      dispatch({ type: 'SET_LABELS', payload: labels });
    }
  }, []);

  // Filter and search logic with user permissions
  const allFilteredResidents = state.residents.filter(resident => {
    // Filter by location type first
    if (resident.locationType !== locationType) {
      return false;
    }

    const matchesSearch = resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resident.room.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (resident.vNumber && resident.vNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (resident.bsnNumber && resident.bsnNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilters = 
      (state.filters.status === '' || resident.status === state.filters.status) &&
      (state.filters.attendance === '' || resident.attendance === state.filters.attendance) &&
      (state.filters.nationality === '' || resident.nationality === state.filters.nationality) &&
      (state.filters.priority === '' || resident.priority === state.filters.priority) &&
      (state.filters.caseworker === '' || resident.caseworker === state.filters.caseworker);

    return matchesSearch && matchesFilters;
  });

  // Apply user permissions to filtered residents
  // For now, show all residents regardless of assignment to fix Oekraïne issue
  const filteredResidents = allFilteredResidents;

  // Statistics calculation based on user permissions
  // For now, use all residents to fix Oekraïne issue
  const userResidents = state.residents;
  const stats = {
    total: userResidents.length,
    present: userResidents.filter(r => r.attendance === 'Aanwezig').length,
    onLeave: userResidents.filter(r => r.attendance === 'Op verlof').length,
    absent: userResidents.filter(r => r.attendance === 'Afwezig').length,
    occupancy: Math.round((userResidents.length / 350) * 100),
    highPriority: userResidents.filter(r => r.priority === 'High').length,
    pendingLeaveRequests: state.leaveRequests.filter(r => r.status === 'pending').length
  };

  // Handle leave request approval/rejection
  const handleLeaveRequest = useCallback((requestId, status, notes = '') => {
    const currentUser = 'Jan de Vries'; // This would come from authentication
    dispatch({
      type: 'UPDATE_LEAVE_REQUEST',
      payload: {
        id: requestId,
        status,
        approvedBy: currentUser,
        processedDate: new Date().toISOString(),
        processingNotes: notes
      }
    });

    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        id: Date.now(),
        type: 'leave-processing',
        resident: state.leaveRequests.find(r => r.id === requestId)?.resident || 'Onbekend',
        timestamp: new Date().toISOString(),
        description: `Verlofaanvraag ${status === 'approved' ? 'goedgekeurd' : 'afgewezen'}`
      }
    });
  }, [state.leaveRequests]);

  // Format date helper
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format relative time
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Net';
    if (diffInHours < 24) return `${diffInHours} uur geleden`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} dagen geleden`;
    return `${Math.floor(diffInHours / 168)} weken geleden`;
  };

  // Get profile image with fallback to initials
  const getProfileImage = (resident) => {
    if (resident.photo) return resident.photo;
    const initials = resident.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    return `https://ui-avatars.com/api/?name=${initials}&background=3b82f6&color=ffffff&size=150`;
  };

  // Handle add resident
  const handleAddResident = (newResident) => {
    // Check if user is selected before adding resident
    if (!currentUser) {
      setShowUserSelector(true);
      return;
    }
    
    // Zorg ervoor dat nieuwe bewoners altijd een foto hebben
    const residentWithPhoto = {
      ...newResident,
      attendance: 'Aanwezig',
      lastSeen: 'Nu online',
      leaveBalance: 20,
      photo: newResident.photo || getRandomPhoto(newResident.gender || 'M', 30, newResident.name)
    };
    
    console.log('Adding resident with photo:', residentWithPhoto.photo);
    
    // Add to DataService
    const addedResident = DataService.addResident(residentWithPhoto);
    
    // Update state
    dispatch({
      type: 'ADD_RESIDENT',
      payload: addedResident
    });

    // Log activity
    DataService.addAuditLog({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      actionType: 'CREATE',
      entity: 'resident',
      details: `Nieuwe bewoner geregistreerd: ${newResident.name}`,
      newValue: addedResident
    });

    setShowAddResident(false);
  };

  // Handle edit resident
  const handleEditResident = (updatedResident) => {
    // Check if user is selected before editing resident
    if (!currentUser) {
      setShowUserSelector(true);
      return;
    }
    
    // Update in DataService
    const updatedResidentData = DataService.updateResident(updatedResident);
    
    if (updatedResidentData) {
      // Update state
      dispatch({
        type: 'UPDATE_RESIDENT',
        payload: updatedResidentData
      });

      // Log activity
      DataService.addAuditLog({
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: currentUser.role,
        actionType: 'UPDATE',
        entity: 'resident',
        details: `Bewoner gegevens bijgewerkt: ${updatedResident.name}`,
        newValue: updatedResidentData
      });
    }

    setEditingResident(null);
  };

  const handleViewResident = (resident) => {
    setViewingResident(resident);
  };

  // Handle shift assignment update
  const handleShiftAssignmentUpdate = (updatedShift) => {
    // Check if user is selected before updating shift
    if (!currentUser) {
      setShowUserSelector(true);
      return;
    }

    // Update shift in localStorage
    const savedShifts = localStorage.getItem('vms_shifts');
    if (savedShifts) {
      const shifts = JSON.parse(savedShifts);
      const updatedShifts = shifts.map(shift => 
        shift.id === updatedShift.id ? updatedShift : shift
      );
      localStorage.setItem('vms_shifts', JSON.stringify(updatedShifts));
    }

    // Log activity
    dispatch({
      type: 'ADD_ACTIVITY',
      payload: {
        id: Date.now(),
        type: 'shift_assignment',
        resident: 'Dienstrooster',
        timestamp: new Date().toISOString(),
        description: `Diensttoewijzing bijgewerkt voor ${new Date(updatedShift.date).toLocaleDateString('nl-NL')} ${updatedShift.startTime}-${updatedShift.endTime}`
      }
    });

    setShowShiftAssignment(false);
    setSelectedShift(null);
  };

  // Debounce global search
  useEffect(() => {
    if (globalSearchTerm) {
      setIsGlobalSearching(true);
    }
    
    const timer = setTimeout(() => {
      if (globalSearchTerm.trim()) {
        performGlobalSearch(globalSearchTerm.trim());
      } else {
        setGlobalSearchResults([]);
        setShowGlobalSearch(false);
      }
      setIsGlobalSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [globalSearchTerm]);

  // Close global search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const searchContainer = document.querySelector('.global-search-container');
      if (searchContainer && !searchContainer.contains(event.target)) {
        setShowGlobalSearch(false);
      }
    };

    if (showGlobalSearch) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showGlobalSearch]);

  // Global search function
  const performGlobalSearch = (searchTerm) => {
    const results = [];
    const searchLower = searchTerm.toLowerCase();

    // Search in residents
    state.residents.forEach(resident => {
      const searchableFields = [
        resident.name,
        resident.room,
        resident.nationality,
        resident.vNumber,
        resident.bsnNumber,
        resident.caseworker,
        resident.language,
        resident.phone,
        resident.email
      ].map(field => (field || '').toLowerCase());

      if (searchableFields.some(field => field.includes(searchLower))) {
        results.push({
          type: 'resident',
          title: resident.name,
          subtitle: `${resident.room} • ${resident.nationality}`,
          description: `Status: ${resident.status}`,
          icon: Users,
          action: () => {
            setSelectedResident(resident);
            setActiveView('residents');
            setShowGlobalSearch(false);
            setGlobalSearchTerm('');
          }
        });
      }
    });

    // Search in leave requests
    state.leaveRequests.forEach(request => {
      const searchableFields = [
        request.residentName,
        request.reason,
        request.status,
        request.destination
      ].map(field => (field || '').toLowerCase());

      if (searchableFields.some(field => field.includes(searchLower))) {
        results.push({
          type: 'leave_request',
          title: request.residentName,
          subtitle: `${request.startDate} - ${request.endDate}`,
          description: `Status: ${request.status}`,
          icon: Calendar,
          action: () => {
            setActiveView('leave');
            setShowGlobalSearch(false);
            setGlobalSearchTerm('');
          }
        });
      }
    });

    // Search in documents
    state.residents.forEach(resident => {
      resident.documents.forEach(doc => {
        const searchableFields = [
          doc.name,
          doc.status,
          resident.name
        ].map(field => (field || '').toLowerCase());

        if (searchableFields.some(field => field.includes(searchLower))) {
          results.push({
            type: 'document',
            title: doc.name,
            subtitle: `Van: ${resident.name}`,
            description: `Status: ${doc.status}`,
            icon: FileText,
            action: () => {
              setActiveView('documents');
              setShowGlobalSearch(false);
              setGlobalSearchTerm('');
            }
          });
        }
      });
    });

    setGlobalSearchResults(results);
    setShowGlobalSearch(results.length > 0);
  };

  // Dashboard component is now imported from Dashboard.jsx

  // Enhanced Residents List Component
  const ResidentsList = () => {
    console.log('ResidentsList render:', filteredResidents);
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">{t.residents}</h2>
          <div className="flex gap-2">
            <button
              onClick={() => {
                // Update alle bestaande bewoners met foto's
                const updatedResidents = state.residents.map(resident => ({
                  ...resident,
                  photo: resident.photo || getRandomPhoto(resident.gender || 'M', 30, resident.name)
                }));
                updatedResidents.forEach(resident => {
                  dispatch({ type: 'UPDATE_RESIDENT', payload: resident });
                });
                addNotification({
                  type: 'success',
                  title: 'Foto\'s bijgewerkt',
                  message: 'Alle bewoners hebben nu foto\'s.'
                });
              }}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
            >
              <Camera className="w-4 h-4" />
              Foto's toevoegen
            </button>
            {hasPermission('edit_all_residents') && (
              <button
                onClick={() => {
                  if (!currentUser) {
                    setShowUserSelector(true);
                  } else {
                    setShowAddResident(true);
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                {t.addResident}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t.search}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                {t.filters}
              </button>
            </div>
            
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <select
                    value={state.filters.status}
                    onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { status: e.target.value } })}
                    className="border rounded-lg px-3 py-2"
                  >
                    <option value="">Alle statussen</option>
                    <option value="Vergunninghouder">Vergunninghouder</option>
                    <option value="In procedure">In procedure</option>
                    <option value="Tijdelijke bescherming">Tijdelijke bescherming</option>
                  </select>
                  
                  <select
                    value={state.filters.attendance}
                    onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { attendance: e.target.value } })}
                    className="border rounded-lg px-3 py-2"
                  >
                    <option value="">Alle aanwezigheid</option>
                    <option value="Aanwezig">Aanwezig</option>
                    <option value="Op verlof">Op verlof</option>
                    <option value="Afwezig">Afwezig</option>
                  </select>
                  
                  <select
                    value={state.filters.priority}
                    onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { priority: e.target.value } })}
                    className="border rounded-lg px-3 py-2"
                  >
                    <option value="">Alle prioriteiten</option>
                    <option value="High">Hoog</option>
                    <option value="Normal">Normaal</option>
                    <option value="Low">Laag</option>
                  </select>
                  
                  <input
                    type="text"
                    placeholder="Nationaliteit"
                    value={state.filters.nationality}
                    onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { nationality: e.target.value } })}
                    className="border rounded-lg px-3 py-2"
                  />
                  
                  <input
                    type="text"
                    placeholder="Begeleider"
                    value={state.filters.caseworker}
                    onChange={(e) => dispatch({ type: 'SET_FILTERS', payload: { caseworker: e.target.value } })}
                    className="border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bewoner</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kamer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioriteit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aanwezigheid</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Begeleider</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acties</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResidents.map(resident => (
                  <tr key={resident.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img 
                          src={getProfileImage(resident)} 
                          alt={resident.name}
                          className="w-10 h-10 rounded-full object-cover mr-3 border-2 border-gray-200"
                          onError={(e) => {
                            e.target.src = getProfileImage(resident);
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {resident.name}
                            {resident.gender === 'M' && (
                              <span title="Man" className="inline-block w-4 h-4 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center text-xs font-bold">♂</span>
                            )}
                            {resident.gender === 'F' && (
                              <span title="Vrouw" className="inline-block w-4 h-4 rounded-full bg-pink-200 text-pink-700 flex items-center justify-center text-xs font-bold">♀</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">{resident.nationality}</div>
                          <div className="text-xs text-gray-400">{resident.vNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {resident.room}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        resident.statusColor === 'green' ? 'bg-green-100 text-green-800' :
                        resident.statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {resident.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          resident.priority === 'High' ? 'bg-red-100 text-red-800' :
                          resident.priority === 'Normal' ? 'bg-gray-100 text-gray-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {resident.priority}
                        </span>
                        {resident.priority === 'High' && resident.status === 'In procedure' && (
                          <span title="Officiële waarschuwing nodig" className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 pulse-warning">
                            Waarschuwing
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          resident.attendance === 'Aanwezig' ? 'bg-green-500' :
                          resident.attendance === 'Op verlof' ? 'bg-yellow-500' :
                          resident.attendance === 'Te laat terug' ? 'bg-red-500 pulse-urgent' :
                          'bg-red-500'
                        }`}></div>
                        <span className={`text-sm ${resident.attendance === 'Te laat terug' ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                          {resident.attendance}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">{resident.lastSeen}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {resident.caseworker}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          <span className="truncate">{resident.phone}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{resident.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedResident(resident)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Bekijk details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {hasPermission('edit_all_residents') && (
                          <button
                            onClick={() => setEditingResident(resident)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Bewerk"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };



  return (
    <div className="min-h-screen bg-gray-100">
      {/* Location selector bovenin */}
      <div className="fixed left-0 top-0 w-full z-40 bg-white border-b flex justify-center items-center py-2">
        <span className="mr-2 text-sm text-gray-600">Actieve locatie:</span>
        <select
          value={locationType}
          onChange={e => {
            const newLocation = e.target.value;
            console.log('Location changed from', locationType, 'to', newLocation);
            setLocationType(newLocation);
          }}
          className="px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="CNO">CNO</option>
          <option value="OEKRAINE">Oekraïense Opvang</option>
        </select>
      </div>
      {/* Enhanced Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg z-40">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-blue-600">VMS</h1>
          <p className="text-sm text-gray-500">Vluchtelingen Management</p>
        </div>

        <nav className="mt-6">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors ${
              activeView === 'dashboard' ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
            }`}
          >
            <Home className="w-5 h-5" />
            {t.dashboard}
          </button>
          
          <button
            onClick={() => setActiveView('residents')}
            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors ${
              activeView === 'residents' ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
            }`}
          >
            <Users className="w-5 h-5" />
            {t.residents}
            <span className="ml-auto bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
              {state.residents.length}
            </span>
          </button>

          <button
            onClick={() => setActiveView('leave')}
            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors ${
              activeView === 'leave' ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
            }`}
          >
            <Calendar className="w-5 h-5" />
            {t.leave}
            {stats.pendingLeaveRequests > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {stats.pendingLeaveRequests}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('documents')}
            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors ${
              activeView === 'documents' ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
            }`}
          >
            <FileText className="w-5 h-5" />
            Documenten
          </button>

          <button
            onClick={() => setActiveView('handover')}
            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors ${
              activeView === 'handover' ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
            }`}
          >
            <Clock className="w-5 h-5" />
            Dienst Overdracht
          </button>

          {/* Analytics Section */}
          <div className="px-6 py-2 mt-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Analytics</h3>
          </div>

          <button
            onClick={() => setActiveView('capacity')}
            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors ${
              activeView === 'capacity' ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
            }`}
          >
            <BarChart className="w-5 h-5" />
            Capaciteit Dashboard
          </button>

          <button
            onClick={() => setActiveView('age-groups')}
            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors ${
              activeView === 'age-groups' ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
            }`}
          >
            <Users className="w-5 h-5" />
            Leeftijdsgroepen
          </button>

          <button
            onClick={() => setActiveView('school-tracker')}
            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors ${
              activeView === 'school-tracker' ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
            }`}
          >
            <UserCheck className="w-5 h-5" />
            School Tracker
          </button>

          <button
            onClick={() => setActiveView('monthly-trends')}
            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors ${
              activeView === 'monthly-trends' ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Maandelijkse Trends
          </button>

          <button
            onClick={() => setShowLabelsManager(true)}
            className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors text-gray-700 relative"
          >
            <Tag className="w-5 h-5" />
            <span>Labels Beheren</span>
          </button>

          <button
            onClick={() => setActiveView('incidents')}
            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors ${
              activeView === 'incidents' ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
            Incident Management
          </button>

          <button
            onClick={() => {
              if (!currentUser) {
                setShowUserSelector(true);
              } else {
                setShowAuditTrail(true);
              }
            }}
            className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors text-gray-700"
          >
            <FileText className="w-5 h-5" />
            Audit Trail
          </button>
          <button
            onClick={() => {
              if (!currentUser) {
                setShowUserSelector(true);
              } else {
                setShowShiftSchedule(true);
              }
            }}
            className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors text-gray-700"
          >
            <Calendar className="w-5 h-5" />
            Dienstrooster
          </button>

          <button
            onClick={() => {
              if (!currentUser) {
                setShowUserSelector(true);
              } else {
                setShowShiftAnalytics(true);
              }
            }}
            className="w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors text-gray-700"
          >
            <TrendingUp className="w-5 h-5" />
            Analytics Dashboard
          </button>

          <button
            onClick={() => setActiveView('reports')}
            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors ${
              activeView === 'reports' ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
            }`}
          >
            <BarChart className="w-5 h-5" />
            {t.reports}
          </button>

          <button
            onClick={() => setActiveView('settings')}
            className={`w-full flex items-center gap-3 px-6 py-3 hover:bg-gray-50 transition-colors ${
              activeView === 'settings' ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700'
            }`}
          >
            <Settings className="w-5 h-5" />
            {t.settings}
          </button>
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t">
          <div className="flex items-center gap-3 mb-4">
            <img 
              src={user?.avatar} 
              alt={user?.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face';
              }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <div className="flex items-center gap-1">
                {user?.role === 'admin' && <Crown className="w-3 h-3 text-yellow-500" />}
                {user?.role === 'manager' && <Shield className="w-3 h-3 text-blue-500" />}
                {user?.role === 'caseworker' && <UserCog className="w-3 h-3 text-green-500" />}
                {user?.role === 'volunteer' && <User className="w-3 h-3 text-purple-500" />}
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setLanguage(language === 'nl' ? 'en' : 'nl')}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors px-2 py-1 rounded"
            >
              {language === 'nl' ? 'EN' : 'NL'}
            </button>
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition-colors px-2 py-1 rounded hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Uitloggen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8 relative">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1 max-w-md relative global-search-container">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Globaal zoeken in bewoners, verlof, documenten..."
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              {isGlobalSearching && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                </div>
              )}
              {globalSearchTerm && !isGlobalSearching && (
                <button
                  onClick={() => {
                    setGlobalSearchTerm('');
                    setShowGlobalSearch(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Global Search Results Dropdown */}
            {showGlobalSearch && globalSearchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-2 border-b bg-gray-50">
                  <p className="text-sm text-gray-600">
                    {globalSearchResults.length} resultaten gevonden
                  </p>
                </div>
                {globalSearchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={result.action}
                    className="w-full p-3 hover:bg-gray-50 transition-colors text-left border-b last:border-b-0"
                  >
                    <div className="flex items-center gap-3">
                      <result.icon className="w-5 h-5 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{result.title}</p>
                        <p className="text-sm text-gray-600 truncate">{result.subtitle}</p>
                        <p className="text-xs text-gray-500">{result.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <NotificationPanel />
            <div className="flex items-center gap-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                <option value="nl">Nederlands</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content based on active view */}
        {activeView === 'dashboard' && <Dashboard residents={state.residents} />}
        {activeView === 'residents' && (
          <LocationProvider value={{ locationType }}>
            <Residents />
          </LocationProvider>
        )}
        {activeView === 'leave' && (
          <LocationProvider value={{ locationType }}>
            <LeaveRequests />
          </LocationProvider>
        )}
        {activeView === 'documents' && <Documents />}
        {activeView === 'handover' && <ShiftHandover />}
        {activeView === 'incidents' && <IncidentManager />}
        {activeView === 'reports' && <DataExport />}
        {activeView === 'settings' && <div className="text-center py-20 text-gray-500">Instellingen coming soon...</div>}
        
        {/* Analytics Views */}
        {activeView === 'capacity' && (
          <LocationProvider value={{ locationType }}>
            <CapacityDashboard residents={state.residents} />
          </LocationProvider>
        )}
        {activeView === 'age-groups' && (
          <LocationProvider value={{ locationType }}>
            <AgeGroupAnalytics residents={state.residents} />
          </LocationProvider>
        )}
        {activeView === 'school-tracker' && (
          <LocationProvider value={{ locationType }}>
            <SchoolTracker 
              residents={state.residents}
              onEditResident={handleEditResident}
              onViewResident={handleViewResident}
            />
          </LocationProvider>
        )}
        {activeView === 'monthly-trends' && (
          <LocationProvider value={{ locationType }}>
            <MonthlyTrends residents={state.residents} />
          </LocationProvider>
        )}

        {/* Labels Manager Modal */}
        <LabelsManager
          isOpen={showLabelsManager}
          onClose={() => setShowLabelsManager(false)}
          residents={state.residents}
          onLabelsUpdate={(updatedLabels, updatedResidents = null) => {
            // Update labels in localStorage
            console.log('Labels updated:', updatedLabels);
            
            // If residents were updated by AI auto-fill, update them too
            if (updatedResidents) {
              console.log('Residents updated by AI auto-fill:', updatedResidents);
              dispatch({ type: 'UPDATE_RESIDENTS', payload: updatedResidents });
              
              // Show success notification
              const notification = {
                id: Date.now(),
                type: 'success',
                title: 'AI Auto-fill Voltooid',
                message: `${updatedResidents.length} bewoners bijgewerkt met intelligente labels`,
                timestamp: new Date().toISOString(),
                read: false
              };
              dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
            }
          }}
        />


        {/* Audit Trail Modal */}
        <AuditTrail
          isOpen={showAuditTrail}
          onClose={() => setShowAuditTrail(false)}
        />

        {/* User Selector - Floating and Contextual */}
        <UserSelector
          currentUser={currentUser}
          onUserChange={setCurrentUser}
          showSelector={showUserSelector}
          onClose={() => setShowUserSelector(false)}
        />

        {/* Shift Schedule Modal */}
        {showShiftSchedule && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Dienstrooster Beheer</h3>
                <button
                  onClick={() => setShowShiftSchedule(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <ShiftSchedule
                  currentUser={currentUser}
                  onShiftUpdate={handleShiftAssignmentUpdate}
                />
              </div>
            </div>
          </div>
        )}

        {/* Shift Assignment Modal */}
        <ShiftAssignmentModal
          isOpen={showShiftAssignment}
          onClose={() => {
            setShowShiftAssignment(false);
            setSelectedShift(null);
          }}
          shift={selectedShift}
          staffMembers={[
            // Management
            { id: 1, name: 'Soraya Schuyer', role: 'Admin', isActive: false },
            { id: 2, name: 'Jesse Heij', role: 'Admin', isActive: false },
            
            // Locatie Coordinator
            { id: 3, name: 'Mohamed G.', role: 'Coordinator', isActive: false },
            
            // Woonbegeleiders
            { id: 4, name: 'Fabian', role: 'Woonbegeleider', isActive: false },
            { id: 5, name: 'Ryan', role: 'Woonbegeleider', isActive: false },
            { id: 6, name: 'Carlos', role: 'Woonbegeleider', isActive: false },
            { id: 7, name: 'Paul', role: 'Woonbegeleider', isActive: false },
            { id: 8, name: 'Shahroze', role: 'Woonbegeleider', isActive: false },
            { id: 9, name: 'Danish', role: 'Woonbegeleider', isActive: false },
            { id: 10, name: 'Danil', role: 'Woonbegeleider', isActive: false },
            { id: 11, name: 'Oksana', role: 'Woonbegeleider', isActive: false },
            { id: 12, name: 'Rabia', role: 'Woonbegeleider', isActive: false },
            { id: 13, name: 'Seda', role: 'Woonbegeleider', isActive: false },
            { id: 14, name: 'Mart', role: 'Woonbegeleider', isActive: false },
            { id: 15, name: 'Ines', role: 'Woonbegeleider', isActive: false },
            { id: 16, name: 'Xafiera', role: 'Woonbegeleider', isActive: false },
            { id: 17, name: 'Amira', role: 'Woonbegeleider', isActive: false }
          ]}
          shiftTypes={[
            {
              id: 'early_full',
              name: 'Vroege dienst',
              startTime: '07:00',
              endTime: '15:00',
              color: 'bg-blue-500',
              maxStaff: 2,
              description: 'Vroege dienst'
            },
            {
              id: 'early_intermediate',
              name: 'Vroege tussendienst',
              startTime: '09:00',
              endTime: '17:00',
              color: 'bg-green-500',
              maxStaff: 1,
              description: 'Vroege tussendienst'
            },
            {
              id: 'late_full',
              name: 'Late dienst',
              startTime: '15:00',
              endTime: '23:00',
              color: 'bg-purple-500',
              maxStaff: 2,
              description: 'Late dienst'
            },
            {
              id: 'late_intermediate',
              name: 'Late tussendienst',
              startTime: '17:00',
              endTime: '23:00',
              color: 'bg-orange-500',
              maxStaff: 1,
              description: 'Late tussendienst'
            }
          ]}
          onAssignmentUpdate={handleShiftAssignmentUpdate}
          currentUser={currentUser}
        />


        {/* Shift Analytics Modal */}
        {showShiftAnalytics && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Advanced Analytics Dashboard</h3>
                <button
                  onClick={() => setShowShiftAnalytics(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6">
                <ShiftAnalytics
                  shifts={[]} // Will be loaded from localStorage
                  staffMembers={[
                    // Management
                    { id: 1, name: 'Soraya Schuyer', role: 'Admin', isActive: false },
                    { id: 2, name: 'Jesse Heij', role: 'Admin', isActive: false },
                    
                    // Locatie Coordinator
                    { id: 3, name: 'Mohamed G.', role: 'Coordinator', isActive: false },
                    
                    // Woonbegeleiders
                    { id: 4, name: 'Fabian', role: 'Woonbegeleider', isActive: false },
                    { id: 5, name: 'Ryan', role: 'Woonbegeleider', isActive: false },
                    { id: 6, name: 'Carlos', role: 'Woonbegeleider', isActive: false },
                    { id: 7, name: 'Paul', role: 'Woonbegeleider', isActive: false },
                    { id: 8, name: 'Shahroze', role: 'Woonbegeleider', isActive: false },
                    { id: 9, name: 'Danish', role: 'Woonbegeleider', isActive: false },
                    { id: 10, name: 'Danil', role: 'Woonbegeleider', isActive: false },
                    { id: 11, name: 'Oksana', role: 'Woonbegeleider', isActive: false },
                    { id: 12, name: 'Rabia', role: 'Woonbegeleider', isActive: false },
                    { id: 13, name: 'Seda', role: 'Woonbegeleider', isActive: false },
                    { id: 14, name: 'Mart', role: 'Woonbegeleider', isActive: false },
                    { id: 15, name: 'Ines', role: 'Woonbegeleider', isActive: false },
                    { id: 16, name: 'Xafiera', role: 'Woonbegeleider', isActive: false },
                    { id: 17, name: 'Amira', role: 'Woonbegeleider', isActive: false }
                  ]}
                  currentUser={currentUser}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedResident && (
        <ResidentViewModal
          resident={selectedResident}
          isOpen={!!selectedResident}
          onClose={() => setSelectedResident(null)}
          onEdit={(resident) => {
            setEditingResident(resident);
            setSelectedResident(null);
          }}
        />
      )}
      {showAddResident && (
        <AddResidentModal
          isOpen={showAddResident}
          onClose={() => setShowAddResident(false)}
          onSave={handleAddResident}
          caseworkers={caseworkers}
          locationType={locationType}
        />
      )}
      {editingResident && (
        <AddResidentModal
          isOpen={!!editingResident}
          onClose={() => setEditingResident(null)}
          onSave={handleEditResident}
          caseworkers={caseworkers}
          initialData={editingResident}
          locationType={locationType}
        />
      )}
      
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
            <span>Laden...</span>
          </div>
        </div>
      )}

      {/* AI Assistant */}
      <AIAssistant />
    </div>
  );
};

export default VMS;