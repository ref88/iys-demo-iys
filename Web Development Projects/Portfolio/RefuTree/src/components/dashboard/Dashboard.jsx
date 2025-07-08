import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, UserMinus, Home, School, AlertTriangle, 
  Calendar, TrendingUp, TrendingDown, Activity, Clock, Star,
  MapPin, Shield, FileText, Download, Filter, Search,
  BarChart3, Phone, Mail, Eye, Edit, Save, Plus, RefreshCw,
  ExternalLink, CheckCircle, CheckSquare, Clock3, UserX,
  Briefcase, GraduationCap, Heart, Globe, Award, PieChart,
  Bell, Info, X
} from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext.jsx';
import DashboardAI from './DashboardAI.jsx';

// Tijdelijke belangrijke mededelingen - moved from ShiftHandover
const temporaryNotices = [
  {
    id: 1,
    type: "urgent",
    message: "LET OP: Vanaf heden extra ronde maken bij het kapel",
    addedBy: "Management",
    addedDate: new Date().toISOString().split('T')[0],
    priority: "high"
  },
  {
    id: 2, 
    type: "info",
    message: "Portofoon frequentie wijziging - Kanaal 3 gebruiken",
    addedBy: "Coordinator",
    addedDate: new Date().toISOString().split('T')[0],
    priority: "medium"
  },
  {
    id: 3,
    type: "info", 
    message: "Nieuwe digitale planbord links beschikbaar in overdracht sectie",
    addedBy: "IT Support",
    addedDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    priority: "low"
  }
];

const Dashboard = ({ residents }) => {
  const { locationType } = useLocation();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [filteredResidents, setFilteredResidents] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('week');
  const [dismissedNotices, setDismissedNotices] = useState(() => {
    const saved = localStorage.getItem('dismissed_notices');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (residents) {
      setFilteredResidents(residents.filter(r => r.locationType === locationType));
    }
  }, [residents, locationType]);

  // Handle dismissing notices
  const dismissNotice = (noticeId) => {
    const newDismissed = [...dismissedNotices, noticeId];
    setDismissedNotices(newDismissed);
    localStorage.setItem('dismissed_notices', JSON.stringify(newDismissed));
  };

  // Get active notices (not dismissed)
  const activeNotices = temporaryNotices.filter(notice => 
    !dismissedNotices.includes(notice.id)
  );

  // Calculate KPIs
  const calculateKPIs = () => {
    const total = filteredResidents.length;
    const present = filteredResidents.filter(r => r.attendance === 'Aanwezig').length;
    const absent = filteredResidents.filter(r => r.attendance === 'Afwezig').length;
    const late = filteredResidents.filter(r => r.attendance === 'Te laat terug').length;
    const highPriority = filteredResidents.filter(r => r.priority === 'High').length;
    const inProcedure = filteredResidents.filter(r => r.status === 'In procedure').length;
    const children = filteredResidents.filter(r => {
      if (!r.birthDate) return false;
      const age = new Date().getFullYear() - new Date(r.birthDate).getFullYear();
      return age < 18;
    }).length;
    const adults = total - children;

    // Calculate occupancy rate (assuming 100 rooms as example)
    const totalRooms = 100;
    const occupiedRooms = new Set(filteredResidents.map(r => r.room)).size;
    const occupancyRate = Math.round((occupiedRooms / totalRooms) * 100);

    return {
      total,
      present,
      absent,
      late,
      highPriority,
      inProcedure,
      children,
      adults,
      occupancyRate,
      occupiedRooms
    };
  };

  const kpis = calculateKPIs();

  // Get recent activity (last 5 residents added/modified)
  const recentActivity = filteredResidents
    .sort((a, b) => new Date(b.id) - new Date(a.id))
    .slice(0, 5);

  // Get urgent items
  const urgentItems = filteredResidents.filter(r => 
    r.priority === 'High' || 
    r.attendance === 'Te laat terug' ||
    r.medicalInfo?.allergies?.length > 0
  );

  // Get residents with warnings
  const residentsWithWarnings = filteredResidents.filter(r => {
    if (!r.labels) return false;
    const warningLabels = [
      'Mondelinge waarschuwing',
      '1e geschreven Socius waarschuwing',
      '2e geschreven Socius waarschuwing', 
      'Gemeente waarschuwing'
    ];
    return r.labels.some(labelId => {
      const labels = JSON.parse(localStorage.getItem('vms_labels') || '[]');
      const label = labels.find(l => l.id === labelId);
      return label && warningLabels.includes(label.name);
    });
  });

  const StatCard = ({ title, value, icon: Icon, color = 'blue', trend = null, subtitle = null }) => {
    const getColorClasses = (color) => {
      const colorMap = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        red: 'bg-red-100 text-red-600',
        yellow: 'bg-yellow-100 text-yellow-600'
      };
      return colorMap[color] || colorMap.blue;
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-full ${getColorClasses(color)}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        {trend && (
          <div className="flex items-center mt-2">
            {trend > 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(trend)}% van vorige periode
            </span>
          </div>
        )}
      </div>
    );
  };

  const QuickActionCard = ({ title, description, icon: Icon, action, color = 'blue' }) => {
    const getColorClasses = (color) => {
      const colorMap = {
        blue: 'bg-blue-100 text-blue-600',
        green: 'bg-green-100 text-green-600',
        red: 'bg-red-100 text-red-600',
        yellow: 'bg-yellow-100 text-yellow-600',
        purple: 'bg-purple-100 text-purple-600',
        orange: 'bg-orange-100 text-orange-600'
      };
      return colorMap[color] || colorMap.blue;
    };

    return (
      <button 
        onClick={action}
        className="bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-all hover:scale-105 text-left w-full"
      >
        <div className={`p-2 rounded-full ${getColorClasses(color)} w-fit mb-3`}>
          <Icon className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </button>
    );
  };

  // Important Notices Component
  const ImportantNotices = () => {
    if (activeNotices.length === 0) return null;

    return (
      <div className="mb-6">
        {activeNotices.map(notice => (
          <div 
            key={notice.id}
            className={`mb-3 p-4 rounded-lg border-l-4 flex items-start justify-between ${
              notice.type === 'urgent' 
                ? 'bg-red-50 border-red-400 text-red-800' 
                : 'bg-blue-50 border-blue-400 text-blue-800'
            }`}
          >
            <div className="flex items-start space-x-3 flex-1">
              <div className={`mt-0.5 ${
                notice.type === 'urgent' ? 'text-red-600' : 'text-blue-600'
              }`}>
                {notice.type === 'urgent' ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <Info className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    notice.type === 'urgent'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {notice.type === 'urgent' ? 'URGENT' : 'INFO'}
                  </span>
                  <span className="text-xs text-gray-600">
                    {notice.addedBy} • {new Date(notice.addedDate).toLocaleDateString('nl-NL')}
                  </span>
                </div>
                <p className="text-sm font-medium">{notice.message}</p>
              </div>
            </div>
            <button
              onClick={() => dismissNotice(notice.id)}
              className={`ml-4 p-1 rounded hover:bg-opacity-20 transition-colors ${
                notice.type === 'urgent' 
                  ? 'text-red-600 hover:bg-red-600' 
                  : 'text-blue-600 hover:bg-blue-600'
              }`}
              title="Markeer als gelezen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Overzicht van {locationType === 'CNO' ? 'CNO Bewoners' : 'Vergunninghouders'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="week">Deze week</option>
            <option value="month">Deze maand</option>
            <option value="quarter">Dit kwartaal</option>
            <option value="year">Dit jaar</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Important Notices */}
      <ImportantNotices />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Totaal Bewoners"
          value={kpis.total}
          icon={Users}
          color="blue"
          subtitle={`${kpis.present} aanwezig`}
        />
        <StatCard
          title="Bezettingsgraad"
          value={`${kpis.occupancyRate}%`}
          icon={Home}
          color="green"
          subtitle={`${kpis.occupiedRooms} van 100 kamers`}
        />
        <StatCard
          title="Hoog Prioriteit"
          value={kpis.highPriority}
          icon={AlertTriangle}
          color="red"
          subtitle="Aandacht nodig"
        />
        <StatCard
          title="In Procedure"
          value={kpis.inProcedure}
          icon={FileText}
          color="yellow"
          subtitle="Asielaanvraag"
        />
        <StatCard
          title="Waarschuwingen"
          value={residentsWithWarnings.length}
          icon={AlertTriangle}
          color="red"
          subtitle="Aandacht nodig"
        />
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Demographics */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Demografie
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Volwassenen (18+)</span>
              <span className="font-semibold">{kpis.adults} van {kpis.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Kinderen (&lt;18)</span>
              <span className="font-semibold">{kpis.children} van {kpis.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Afwezig</span>
              <span className="font-semibold text-orange-600">{kpis.absent} van {kpis.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Te laat terug</span>
              <span className="font-semibold text-red-600">{kpis.late} van {kpis.total}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recente Activiteit
          </h3>
          <div className="space-y-3">
            {recentActivity.map((resident) => (
              <div key={resident.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">
                    {resident.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{resident.name}</p>
                  <p className="text-xs text-gray-500">Kamer {resident.room}</p>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  resident.status === 'In procedure' ? 'bg-yellow-100 text-yellow-800' :
                  resident.status === 'Vergunninghouder' ? 'bg-green-100 text-green-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {resident.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Urgent Items */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Urgente Items
          </h3>
          <div className="space-y-3">
            {urgentItems.slice(0, 5).map((resident) => (
              <div key={resident.id} className="flex items-center gap-3 p-2 rounded-lg bg-red-50 border border-red-200">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-red-600">
                    {resident.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{resident.name}</p>
                  <p className="text-xs text-red-600">
                    {resident.priority === 'High' && 'Hoog prioriteit'}
                    {resident.attendance === 'Te laat terug' && 'Te laat terug'}
                    {resident.medicalInfo?.allergies?.length > 0 && 'Allergieën'}
                  </p>
                </div>
              </div>
            ))}
            {urgentItems.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">Geen urgente items</p>
            )}
          </div>
        </div>

        {/* Warnings */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Waarschuwingen
          </h3>
          <div className="space-y-3">
            {residentsWithWarnings.slice(0, 5).map((resident) => {
              const warningLabel = resident.labels?.find(labelId => {
                const labels = JSON.parse(localStorage.getItem('vms_labels') || '[]');
                const label = labels.find(l => l.id === labelId);
                return label && label.name.includes('waarschuwing');
              });
              
              const labels = JSON.parse(localStorage.getItem('vms_labels') || '[]');
              const label = labels.find(l => l.id === warningLabel);
              
              return (
                <div key={resident.id} className="flex items-center gap-3 p-2 rounded-lg bg-orange-50 border border-orange-200">
                  <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-sm font-semibold text-orange-600">
                      {resident.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{resident.name}</p>
                    <p className="text-xs text-orange-600">
                      {label ? label.name : 'Waarschuwing'}
                    </p>
                  </div>
                </div>
              );
            })}
            {residentsWithWarnings.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">Geen waarschuwingen</p>
            )}
          </div>
        </div>
      </div>

      {/* AI Intelligence */}
      <DashboardAI residents={filteredResidents} locationType={locationType} />

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Snelle Acties</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickActionCard
            title="Nieuwe Bewoner"
            description="Voeg een nieuwe bewoner toe aan het systeem"
            icon={UserPlus}
            color="green"
            action={() => {/* TODO: Open add resident modal */}}
          />
          <QuickActionCard
            title="Bewoners Zoeken"
            description="Zoek snel naar specifieke bewoners"
            icon={Search}
            color="blue"
            action={() => {/* TODO: Focus search */}}
          />
          <QuickActionCard
            title="Labels Beheren"
            description="Beheer labels en tags voor bewoners"
            icon={Filter}
            color="purple"
            action={() => {/* TODO: Open labels modal */}}
          />
          <QuickActionCard
            title="Rapport Exporteren"
            description="Exporteer bewonersdata naar Excel/PDF"
            icon={Download}
            color="orange"
            action={() => {/* TODO: Export data */}}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 