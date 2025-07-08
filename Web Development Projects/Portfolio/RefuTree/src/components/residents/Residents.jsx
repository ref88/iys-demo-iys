import React, { useState, useEffect, useMemo, useCallback, useReducer } from 'react';
import { 
  Search, Filter, MoreVertical, Eye, Edit, Trash2, Plus, Download, Upload,
  Grid, List, BarChart3, ChevronDown, X, Star, Calendar, MapPin, Phone, Mail,
  Users, Clock, Activity, AlertTriangle, CheckCircle, Settings, SortAsc, SortDesc,
  UserPlus, Tag, Shield, FileText, Zap, RefreshCw, Archive, MoreHorizontal,
  TrendingUp, PieChart, Target
} from 'lucide-react';
import AddResidentModal from '../forms/AddResidentModal.jsx';
import ResidentViewModal from '../forms/ResidentViewModal.jsx';
import { useNotifications } from '../../contexts/NotificationContext.jsx';
import { useLocation } from '../../contexts/LocationContext.jsx';
import DataService from '../../utils/dataService.js';

// 🧮 Utility function to calculate age from birth date
const calculateAge = (birthDate) => {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// 🎯 Advanced State Management
const residentsReducer = (state, action) => {
  switch (action.type) {
    case 'SET_RESIDENTS':
      return { ...state, residents: action.payload };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchTerm: action.payload };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_SORT':
      return { ...state, sortField: action.payload.field, sortDirection: action.payload.direction };
    case 'SET_SELECTED':
      return { ...state, selectedResidents: action.payload };
    case 'TOGGLE_SELECTED':
      const id = action.payload;
      const selected = state.selectedResidents.includes(id) 
        ? state.selectedResidents.filter(sid => sid !== id)
        : [...state.selectedResidents, id];
      return { ...state, selectedResidents: selected };
    case 'CLEAR_SELECTED':
      return { ...state, selectedResidents: [] };
    default:
      return state;
  }
};

const initialState = {
  residents: [],
  viewMode: 'grid', // 'list', 'grid', 'analytics'
  searchTerm: '',
  filters: {
    status: 'all',
    attendance: 'all',
    priority: 'all',
    locationType: 'all',
    caseworker: 'all'
  },
  sortField: 'name',
  sortDirection: 'asc',
  selectedResidents: []
};

// 🔥 Smart Filter Presets
const FILTER_PRESETS = [
  { id: 'all', name: 'Alle Bewoners', icon: Users, filters: {} },
  { id: 'high-priority', name: 'Hoge Prioriteit', icon: AlertTriangle, filters: { priority: 'High' } },
  { id: 'on-leave', name: 'Op Verlof', icon: Calendar, filters: { attendance: 'Op verlof' } },
  { id: 'absent', name: 'Afwezig', icon: Clock, filters: { attendance: 'Afwezig' } },
  { id: 'new', name: 'Nieuw', icon: Star, filters: { status: 'In procedure' } }
];

// 📊 Analytics Cards
const StatCard = ({ icon: Icon, title, value, change, color = 'blue' }) => (
  <div className={`bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className={`text-3xl font-bold text-${color}-600 mt-1`}>{value}</p>
        {change && (
          <p className={`text-sm mt-1 flex items-center ${
            change.startsWith('+') ? 'text-green-600' : 'text-red-600'
          }`}>
            <TrendingUp className="w-4 h-4 mr-1" />
            {change}
          </p>
        )}
      </div>
      <div className={`p-3 bg-${color}-100 rounded-xl`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
    </div>
  </div>
);

// 🎨 Modern Action Button
const ActionButton = ({ icon: Icon, label, onClick, variant = 'default', count }) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
      variant === 'primary' 
        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl' 
        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
    }`}
  >
    <Icon className="w-4 h-4 mr-2" />
    {label}
    {count && <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs">{count}</span>}
  </button>
);

// 🔍 Advanced Search Component
const AdvancedSearch = ({ searchTerm, onSearchChange, onFiltersChange, filters }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-4">
      {/* Main Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Zoek op naam, nationaliteit, kamer, V-nummer..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
        >
          <Filter className="w-5 h-5" />
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <select
            value={filters.status}
            onChange={(e) => onFiltersChange({ status: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Alle Statussen</option>
            <option value="In procedure">In procedure</option>
            <option value="Tijdelijke bescherming">Tijdelijke bescherming</option>
            <option value="Afgewezen">Afgewezen</option>
          </select>

          <select
            value={filters.attendance}
            onChange={(e) => onFiltersChange({ attendance: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Alle Aanwezigheid</option>
            <option value="Aanwezig">Aanwezig</option>
            <option value="Op verlof">Op verlof</option>
            <option value="Afwezig">Afwezig</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => onFiltersChange({ priority: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Alle Prioriteiten</option>
            <option value="High">Hoog</option>
            <option value="Normal">Normaal</option>
            <option value="Low">Laag</option>
          </select>

          <select
            value={filters.locationType}
            onChange={(e) => onFiltersChange({ locationType: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">Alle Locaties</option>
            <option value="CNO">CNO</option>
            <option value="OEKRAINE">Oekraïne</option>
          </select>

          <button
            onClick={() => onFiltersChange({ status: 'all', attendance: 'all', priority: 'all', locationType: 'all' })}
            className="px-3 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

// 📋 List View Component
const ListView = ({ residents, onEdit, onView, selectedResidents, onToggleSelect, sortField, sortDirection, onSort }) => {
  const SortButton = ({ field, children }) => (
    <button
      onClick={() => onSort(field)}
      className="flex items-center space-x-1 text-left hover:text-blue-600 transition-colors"
    >
      <span>{children}</span>
      {sortField === field && (
        sortDirection === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
      )}
    </button>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="px-6 py-4 text-left">
                <SortButton field="name">Naam</SortButton>
              </th>
              <th className="px-6 py-4 text-left">
                <SortButton field="nationality">Nationaliteit</SortButton>
              </th>
              <th className="px-6 py-4 text-left">
                <SortButton field="age">Leeftijd</SortButton>
              </th>
              <th className="px-6 py-4 text-left">
                <SortButton field="status">Status</SortButton>
              </th>
              <th className="px-6 py-4 text-left">
                <SortButton field="attendance">Aanwezigheid</SortButton>
              </th>
              <th className="px-6 py-4 text-left">
                <SortButton field="room">Kamer</SortButton>
              </th>
              <th className="px-6 py-4 text-left">
                <SortButton field="priority">Prioriteit</SortButton>
              </th>
              <th className="px-6 py-4 text-left">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {residents.map((resident) => (
              <tr key={resident.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <input
                    type="checkbox"
                    checked={selectedResidents.includes(resident.id)}
                    onChange={() => onToggleSelect(resident.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={resident.photo}
                      alt={resident.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{resident.name}</p>
                      <p className="text-sm text-gray-500">{resident.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{resident.nationality}</td>
                <td className="px-6 py-4">
                  <span className="text-sm text-gray-600">
                    {calculateAge(resident.birthDate) || '-'} {calculateAge(resident.birthDate) ? 'jaar' : ''}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    resident.statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                    resident.statusColor === 'blue' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {resident.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    resident.attendance === 'Aanwezig' ? 'bg-green-100 text-green-800' :
                    resident.attendance === 'Op verlof' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {resident.attendance}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{resident.room}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    resident.priority === 'High' ? 'bg-red-100 text-red-800' :
                    resident.priority === 'Normal' ? 'bg-gray-100 text-gray-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {resident.priority}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onView(resident)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(resident)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 🔲 Grid View Component  
const GridView = ({ residents, onEdit, onView, selectedResidents, onToggleSelect }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {residents.map((resident) => (
      <div
        key={resident.id}
        className="bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-200 overflow-hidden group"
      >
        {/* Header */}
        <div className="relative p-4 pb-0">
          <input
            type="checkbox"
            checked={selectedResidents.includes(resident.id)}
            onChange={() => onToggleSelect(resident.id)}
            className="absolute top-4 right-4 rounded border-gray-300 z-10"
          />
          <div className="flex items-center space-x-3">
            <img
              src={resident.photo}
              alt={resident.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{resident.name}</h3>
              <p className="text-sm text-gray-500 truncate">
                {resident.nationality}
                {calculateAge(resident.birthDate) && (
                  <span className="text-gray-400"> • {calculateAge(resident.birthDate)} jaar</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              resident.statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
              resident.statusColor === 'blue' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {resident.status}
            </span>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              resident.attendance === 'Aanwezig' ? 'bg-green-100 text-green-800' :
              resident.attendance === 'Op verlof' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>
              {resident.attendance}
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              Kamer {resident.room}
            </div>
            <div className="flex items-center text-gray-600">
              <Shield className="w-4 h-4 mr-2" />
              {resident.vNumber || resident.bsnNumber || 'Geen nummer'}
            </div>
            <div className="flex items-center text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              {resident.lastSeen}
            </div>
          </div>

          {/* Priority Badge */}
          {resident.priority === 'High' && (
            <div className="flex items-center justify-center w-full">
              <span className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Hoge Prioriteit
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onView(resident)}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(resident)}
                className="p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// 📊 Analytics View Component
const AnalyticsView = ({ residents }) => {
  const stats = useMemo(() => {
    const total = residents.length;
    const present = residents.filter(r => r.attendance === 'Aanwezig').length;
    const onLeave = residents.filter(r => r.attendance === 'Op verlof').length;
    const absent = residents.filter(r => r.attendance === 'Afwezig').length;
    const highPriority = residents.filter(r => r.priority === 'High').length;
    const cno = residents.filter(r => r.locationType === 'CNO').length;
    const ukraine = residents.filter(r => r.locationType === 'OEKRAINE').length;

    // Age statistics
    const ages = residents.map(r => calculateAge(r.birthDate)).filter(Boolean);
    const avgAge = ages.length > 0 ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) : 0;
    const minAge = ages.length > 0 ? Math.min(...ages) : 0;
    const maxAge = ages.length > 0 ? Math.max(...ages) : 0;
    const under18 = residents.filter(r => calculateAge(r.birthDate) < 18).length;
    const over65 = residents.filter(r => calculateAge(r.birthDate) > 65).length;

    return { total, present, onLeave, absent, highPriority, cno, ukraine, avgAge, minAge, maxAge, under18, over65 };
  }, [residents]);

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} title="Totaal Bewoners" value={stats.total} color="blue" />
        <StatCard icon={CheckCircle} title="Aanwezig" value={stats.present} color="green" />
        <StatCard icon={Calendar} title="Op Verlof" value={stats.onLeave} color="blue" />
        <StatCard icon={AlertTriangle} title="Hoge Prioriteit" value={stats.highPriority} color="red" />
      </div>

      {/* Location Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Locatie Verdeling</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>CNO Bewoners</span>
                <span>{stats.cno}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(stats.cno / stats.total) * 100}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Oekraïne Bewoners</span>
                <span>{stats.ukraine}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ width: `${(stats.ukraine / stats.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Overview */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aanwezigheid Overzicht</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <span className="text-sm">Aanwezig</span>
              </div>
              <span className="font-medium">{stats.present}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm">Op Verlof</span>
              </div>
              <span className="font-medium">{stats.onLeave}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                <span className="text-sm">Afwezig</span>
              </div>
              <span className="font-medium">{stats.absent}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Age Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leeftijd Statistieken</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.avgAge}</div>
              <div className="text-sm text-gray-500">Gemiddeld</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.minAge}</div>
              <div className="text-sm text-gray-500">Jongste</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.maxAge}</div>
              <div className="text-sm text-gray-500">Oudste</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Leeftijd Groepen</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <span className="text-sm">Onder 18 jaar</span>
              </div>
              <span className="font-medium">{stats.under18}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-sm">18-65 jaar</span>
              </div>
              <span className="font-medium">{stats.total - stats.under18 - stats.over65}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                <span className="text-sm">Boven 65 jaar</span>
              </div>
              <span className="font-medium">{stats.over65}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recente Activiteit</h3>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
            <span className="text-gray-600">Ahmad Al-Rashid - Check-in uitgevoerd</span>
            <span className="ml-auto text-gray-400">2 min geleden</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
            <span className="text-gray-600">Olena Kovalenko - Document geüpload</span>
            <span className="ml-auto text-gray-400">1 uur geleden</span>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
            <span className="text-gray-600">Viktor Petrenko - Status gewijzigd</span>
            <span className="ml-auto text-gray-400">3 uur geleden</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🚀 Main Component
const Residents = () => {
  const [state, dispatch] = useReducer(residentsReducer, initialState);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  const [viewingResident, setViewingResident] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addNotification } = useNotifications();
  const { locationType } = useLocation();

  // Caseworkers list
  const caseworkers = [
    'Sarah Johnson',
    'Maria Rodriguez', 
    'John Smith',
    'Lisa Williams',
    'Tom Anderson',
    'Emma Thompson'
  ];

  // 📊 Load residents data
  useEffect(() => {
    const loadResidents = async () => {
      setIsLoading(true);
      try {
        const data = DataService.getResidents() || [];
        dispatch({ type: 'SET_RESIDENTS', payload: data });
      } catch (error) {
        console.error('Error loading residents:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadResidents();
  }, []);

  // 🔍 Smart filtering & sorting
  const filteredAndSortedResidents = useMemo(() => {
    let filtered = state.residents.filter(resident => {
      // Location filter
      if (resident.locationType !== locationType) return false;
      
      // Search filter
      if (state.searchTerm) {
        const searchLower = state.searchTerm.toLowerCase();
        const searchable = [
          resident.name,
          resident.nationality,
          resident.room,
          resident.email,
          resident.vNumber,
          resident.bsnNumber,
          resident.status
        ].filter(Boolean).join(' ').toLowerCase();
        
        if (!searchable.includes(searchLower)) return false;
      }

      // Advanced filters
      const { filters } = state;
      if (filters.status !== 'all' && resident.status !== filters.status) return false;
      if (filters.attendance !== 'all' && resident.attendance !== filters.attendance) return false;
      if (filters.priority !== 'all' && resident.priority !== filters.priority) return false;
      if (filters.locationType !== 'all' && resident.locationType !== filters.locationType) return false;

      return true;
    });

    // Sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      const direction = state.sortDirection === 'asc' ? 1 : -1;
      
      // Special handling for age sorting
      if (state.sortField === 'age') {
        aVal = calculateAge(a.birthDate) || 0;
        bVal = calculateAge(b.birthDate) || 0;
        return (aVal - bVal) * direction;
      }
      
      // Default field sorting
      aVal = a[state.sortField] || '';
      bVal = b[state.sortField] || '';
      
      if (typeof aVal === 'string') {
        return aVal.localeCompare(bVal) * direction;
      }
      return (aVal - bVal) * direction;
    });

    return filtered;
  }, [state.residents, state.searchTerm, state.filters, state.sortField, state.sortDirection, locationType]);

  // 🎯 Event handlers
  const handleSearch = useCallback((term) => {
    dispatch({ type: 'SET_SEARCH', payload: term });
  }, []);

  const handleFiltersChange = useCallback((newFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: newFilters });
  }, []);

  const handleSort = useCallback((field) => {
    const direction = state.sortField === field && state.sortDirection === 'asc' ? 'desc' : 'asc';
    dispatch({ type: 'SET_SORT', payload: { field, direction } });
  }, [state.sortField, state.sortDirection]);

  const handleViewModeChange = useCallback((mode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  const handleEdit = useCallback((resident) => {
    setEditingResident(resident);
  }, []);

  const handleView = useCallback((resident) => {
    setViewingResident(resident);
  }, []);

  const handleToggleSelect = useCallback((id) => {
    dispatch({ type: 'TOGGLE_SELECTED', payload: id });
  }, []);

  const handleSelectAll = useCallback(() => {
    const allIds = filteredAndSortedResidents.map(r => r.id);
    dispatch({ type: 'SET_SELECTED', payload: allIds });
  }, [filteredAndSortedResidents]);

  const handleClearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTED' });
  }, []);

  // 📊 Quick stats
  const quickStats = useMemo(() => {
    const total = filteredAndSortedResidents.length;
    const selected = state.selectedResidents.length;
    return { total, selected, showing: total };
  }, [filteredAndSortedResidents, state.selectedResidents]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* 🎯 Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bewoners {locationType === 'CNO' ? 'CNO' : 'Oekraïne'}
          </h1>
          <p className="text-gray-600 mt-1">
            {quickStats.showing} bewoners • {quickStats.selected} geselecteerd
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <ActionButton icon={RefreshCw} label="Vernieuwen" onClick={() => window.location.reload()} />
          <ActionButton icon={Download} label="Export" />
          <ActionButton icon={UserPlus} label="Nieuwe Bewoner" onClick={() => setIsAddModalOpen(true)} variant="primary" />
        </div>
      </div>

      {/* 🔍 Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <AdvancedSearch
          searchTerm={state.searchTerm}
          onSearchChange={handleSearch}
          onFiltersChange={handleFiltersChange}
          filters={state.filters}
        />
      </div>

      {/* 📊 Filter Presets */}
      <div className="flex flex-wrap gap-3">
        {FILTER_PRESETS.map(preset => {
          const Icon = preset.icon;
          return (
            <button
              key={preset.id}
              onClick={() => handleFiltersChange(preset.filters)}
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
            >
              <Icon className="w-4 h-4 mr-2 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">{preset.name}</span>
            </button>
          );
        })}
      </div>

      {/* 🎛️ View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700">Weergave:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { id: 'list', icon: List, label: 'Lijst' },
              { id: 'grid', icon: Grid, label: 'Grid' },
              { id: 'analytics', icon: BarChart3, label: 'Analytics' }
            ].map(view => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  onClick={() => handleViewModeChange(view.id)}
                  className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    state.viewMode === view.id
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {view.label}
                </button>
              );
            })}
          </div>
        </div>

        {state.selectedResidents.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {state.selectedResidents.length} geselecteerd
            </span>
            <ActionButton icon={Edit} label="Bewerken" count={state.selectedResidents.length} />
            <ActionButton icon={Archive} label="Archiveren" />
            <button onClick={handleClearSelection} className="text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* 📋 Content Views */}
      {state.viewMode === 'list' && (
        <ListView
          residents={filteredAndSortedResidents}
          onEdit={handleEdit}
          onView={handleView}
          selectedResidents={state.selectedResidents}
          onToggleSelect={handleToggleSelect}
          sortField={state.sortField}
          sortDirection={state.sortDirection}
          onSort={handleSort}
        />
      )}

      {state.viewMode === 'grid' && (
        <GridView
          residents={filteredAndSortedResidents}
          onEdit={handleEdit}
          onView={handleView}
          selectedResidents={state.selectedResidents}
          onToggleSelect={handleToggleSelect}
        />
      )}

      {state.viewMode === 'analytics' && (
        <AnalyticsView residents={filteredAndSortedResidents} />
      )}

      {/* 📝 Modals */}
      {isAddModalOpen && (
        <AddResidentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={(newResident) => {
            // Add to DataService
            const residentWithDefaults = {
              ...newResident,
              locationType: locationType,
              attendance: 'Aanwezig',
              lastSeen: 'Nu online',
              leaveBalance: 20,
              createdAt: new Date().toISOString()
            };
            DataService.addResident(residentWithDefaults);
            
            // Update local state
            dispatch({ type: 'SET_RESIDENTS', payload: [...state.residents, residentWithDefaults] });
            addNotification({
              type: 'success',
              message: `Bewoner ${newResident.name} toegevoegd`,
              timestamp: new Date().toISOString()
            });
            setIsAddModalOpen(false);
          }}
          locationType={locationType}
          caseworkers={caseworkers}
        />
      )}

      {editingResident && (
        <AddResidentModal
          isOpen={!!editingResident}
          onClose={() => setEditingResident(null)}
          initialData={editingResident}
          caseworkers={caseworkers}
          onSave={(updatedResident) => {
            // Update in DataService
            const residentWithUpdate = {
              ...updatedResident,
              updatedAt: new Date().toISOString()
            };
            DataService.updateResident(residentWithUpdate);
            
            // Update local state
            const updated = state.residents.map(r => 
              r.id === updatedResident.id ? residentWithUpdate : r
            );
            dispatch({ type: 'SET_RESIDENTS', payload: updated });
            addNotification({
              type: 'success',
              message: `Bewoner ${updatedResident.name} bijgewerkt`,
              timestamp: new Date().toISOString()
            });
            setEditingResident(null);
          }}
          locationType={locationType}
        />
      )}

      {viewingResident && (
        <ResidentViewModal
          resident={viewingResident}
          isOpen={!!viewingResident}
          onClose={() => setViewingResident(null)}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};

export default Residents;