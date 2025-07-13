import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useReducer,
} from 'react';
import {
  Search,
  Filter,
  // MoreVertical, // Unused
  Eye,
  Edit,
  Trash2,
  // Plus, // Unused
  Download,
  Upload,
  Grid,
  List,
  BarChart3,
  ChevronDown,
  X,
  Star,
  Calendar,
  MapPin,
  // Phone, // Unused
  // Mail, // Unused
  Users,
  Clock,
  // Activity, // Unused
  AlertTriangle,
  CheckCircle,
  // Settings, // Unused
  SortAsc,
  SortDesc,
  UserPlus,
  // Tag, // Unused
  Shield,
  // FileText, // Unused
  // Zap, // Unused
  RefreshCw,
  Archive,
  MoreHorizontal,
  TrendingUp,
  // PieChart, // Unused
  // Target, // Unused
  User,
  Cat,
  Dog,
  Heart,
} from 'lucide-react';
import AddResidentModalNew from '../forms/AddResidentModalNew.jsx';
import ResidentViewModal from '../forms/ResidentViewModal.jsx';
import FamilySetupWizard from '../forms/FamilySetupWizard.jsx';
import OptimizedImage from '../ui/OptimizedImage.jsx';
import ErrorBoundary from '../common/ErrorBoundary.jsx';
import DataErrorBoundary from '../common/DataErrorBoundary.jsx';
import { useNotifications } from '../../contexts/NotificationContext.jsx';
import { useLocation } from '../../contexts/LocationContext';
import DataService from '../../utils/dataService.js';
import PhotoService from '../../utils/photoService.js';
import { calculateAge } from '../../utils/dateUtils.js';
import { auditHelpers } from '../../utils/auditLogger';
import { useAuth } from '../auth/AuthContext.jsx';

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
      return {
        ...state,
        sortField: action.payload.field,
        sortDirection: action.payload.direction,
      };
    case 'SET_SELECTED':
      return { ...state, selectedResidents: action.payload };
    case 'TOGGLE_SELECTED': {
      const id = action.payload;
      const selected = state.selectedResidents.includes(id)
        ? state.selectedResidents.filter((sid) => sid !== id)
        : [...state.selectedResidents, id];
      return { ...state, selectedResidents: selected };
    }
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
    caseworker: 'all',
    hasPets: 'all',
    type: 'all',
  },
  sortField: 'name',
  sortDirection: 'asc',
  selectedResidents: [],
};

// 🔥 Smart Filter Presets
const FILTER_PRESETS = [
  { id: 'all', name: 'Alle Bewoners', icon: Users, filters: {} },
  { id: 'humans', name: 'Mensen', icon: User, filters: { type: 'human' } },
  { id: 'cats', name: 'Katten', icon: Cat, filters: { type: 'cat' } },
  { id: 'dogs', name: 'Honden', icon: Dog, filters: { type: 'dog' } },
  {
    id: 'high-priority',
    name: 'Hoge Prioriteit',
    icon: AlertTriangle,
    filters: { priority: 'High' },
  },
  {
    id: 'on-leave',
    name: 'Op Verlof',
    icon: Calendar,
    filters: { attendance: 'Op verlof' },
  },
  {
    id: 'absent',
    name: 'Afwezig',
    icon: Clock,
    filters: { attendance: 'Afwezig' },
  },
  { id: 'new', name: 'Nieuw', icon: Star, filters: { status: 'In procedure' } },
];

// 🏷️ Get resident type icon and color
const getResidentTypeInfo = (type) => {
  switch (type) {
    case 'human':
      return {
        icon: User,
        color: 'blue',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-600',
        label: 'Mens',
      };
    case 'cat':
      return {
        icon: Cat,
        color: 'purple',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-600',
        label: 'Kat',
      };
    case 'dog':
      return {
        icon: Dog,
        color: 'orange',
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-600',
        label: 'Hond',
      };
    default:
      return {
        icon: User,
        color: 'gray',
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-600',
        label: 'Onbekend',
      };
  }
};

// 📊 Analytics Cards
const StatCard = ({ icon: Icon, title, value, change, color = 'blue' }) => {
  const colorClasses = {
    blue: {
      text: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      icon: 'text-blue-600 dark:text-blue-400',
    },
    green: {
      text: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900/30',
      icon: 'text-green-600 dark:text-green-400',
    },
    red: {
      text: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900/30',
      icon: 'text-red-600 dark:text-red-400',
    },
    yellow: {
      text: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900/30',
      icon: 'text-yellow-600 dark:text-yellow-400',
    },
  };

  const currentColor = colorClasses[color] || colorClasses.blue;

  return (
    <div className='bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm font-medium text-gray-600 dark:text-gray-300'>
            {title}
          </p>
          <p className={`text-3xl font-bold mt-1 ${currentColor.text}`}>
            {value}
          </p>
          {change && (
            <p
              className={`text-sm mt-1 flex items-center ${
                change.startsWith('+')
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}
            >
              <TrendingUp className='w-4 h-4 mr-1' />
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${currentColor.bg}`}>
          <Icon className={`w-6 h-6 ${currentColor.icon}`} />
        </div>
      </div>
    </div>
  );
};

// 🎨 Modern Action Button
const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
  count,
}) => (
  <button
    onClick={onClick}
    className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
      variant === 'primary'
        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500'
    }`}
  >
    <Icon className='w-4 h-4 mr-2' />
    {label}
    {count && (
      <span className='ml-2 px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs'>
        {count}
      </span>
    )}
  </button>
);

// 🔍 Advanced Search Component
const AdvancedSearch = ({
  searchTerm,
  onSearchChange,
  onFiltersChange,
  filters,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className='space-y-4'>
      {/* Main Search */}
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500' />
        <input
          type='text'
          placeholder='Zoek op naam, nationaliteit/ras, kamer, V-nummer...'
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className='w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400'
        />
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className='absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
        >
          <Filter className='w-5 h-5' />
        </button>
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className='bg-gray-50 dark:bg-gray-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4'>
          <select
            value={filters.status}
            onChange={(e) => onFiltersChange({ status: e.target.value })}
            className='border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
          >
            <option value='all'>Alle Statussen</option>
            <option value='In procedure'>In procedure</option>
            <option value='Tijdelijke bescherming'>
              Tijdelijke bescherming
            </option>
            <option value='Afgewezen'>Afgewezen</option>
          </select>

          <select
            value={filters.attendance}
            onChange={(e) => onFiltersChange({ attendance: e.target.value })}
            className='border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
          >
            <option value='all'>Alle Aanwezigheid</option>
            <option value='Aanwezig'>Aanwezig</option>
            <option value='Op verlof'>Op verlof</option>
            <option value='Afwezig'>Afwezig</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => onFiltersChange({ priority: e.target.value })}
            className='border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
          >
            <option value='all'>Alle Prioriteiten</option>
            <option value='High'>Hoog</option>
            <option value='Normal'>Normaal</option>
            <option value='Low'>Laag</option>
          </select>

          <select
            value={filters.type}
            onChange={(e) => onFiltersChange({ type: e.target.value })}
            className='border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
          >
            <option value='all'>Alle Types</option>
            <option value='human'>Mensen</option>
            <option value='cat'>Katten</option>
            <option value='dog'>Honden</option>
          </select>

          <select
            value={filters.locationType}
            onChange={(e) => onFiltersChange({ locationType: e.target.value })}
            className='border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
          >
            <option value='all'>Alle Locaties</option>
            <option value='CNO'>CNO</option>
            <option value='OEKRAINE'>Oekraïne</option>
          </select>

          <select
            value={filters.hasPets}
            onChange={(e) =>
              onFiltersChange({
                hasPets:
                  e.target.value === 'true'
                    ? true
                    : e.target.value === 'false'
                      ? false
                      : 'all',
              })
            }
            className='border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white'
          >
            <option value='all'>Alle Huisdieren</option>
            <option value='true'>Met Huisdieren</option>
            <option value='false'>Zonder Huisdieren</option>
          </select>

          <button
            onClick={() =>
              onFiltersChange({
                status: 'all',
                attendance: 'all',
                priority: 'all',
                locationType: 'all',
                hasPets: 'all',
              })
            }
            className='px-3 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium'
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

// 📋 List View Component
const ListView = ({
  residents,
  onEdit,
  onView,
  selectedResidents,
  onToggleSelect,
  sortField,
  sortDirection,
  onSort,
  onSelectAll,
  pets,
}) => {
  const SortButton = ({ field, children }) => (
    <button
      onClick={() => onSort(field)}
      className='flex items-center space-x-1 text-left text-gray-700 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
    >
      <span>{children}</span>
      {sortField === field &&
        (sortDirection === 'asc' ? (
          <SortAsc className='w-4 h-4' />
        ) : (
          <SortDesc className='w-4 h-4' />
        ))}
    </button>
  );

  return (
    <div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden'>
      <div className='overflow-x-auto'>
        <table className='w-full table-auto'>
          <thead className='bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600'>
            <tr>
              <th className='px-6 py-4 text-left'>
                <input
                  type='checkbox'
                  className='rounded border-gray-300'
                  checked={
                    selectedResidents.length === residents.length &&
                    residents.length > 0
                  }
                  onChange={onSelectAll}
                />
              </th>
              <th className='px-6 py-4 text-left w-auto min-w-[120px] max-w-[300px]'>
                <SortButton field='name'>Naam</SortButton>
              </th>
              <th className='px-6 py-4 text-center'>
                <SortButton field='gender'>Geslacht</SortButton>
              </th>
              <th className='px-6 py-4 text-center'>
                <SortButton field='age'>Leeftijd</SortButton>
              </th>
              <th className='px-6 py-4 text-left'>
                <SortButton field='nationality'>Nationaliteit</SortButton>
              </th>
              <th className='px-6 py-4 text-center'>
                <span className='text-gray-700 dark:text-white font-medium'>
                  BSN
                </span>
              </th>
              <th className='px-6 py-4 text-left'>
                <SortButton field='status'>Status</SortButton>
              </th>
              <th className='px-6 py-4 text-left'>
                <SortButton field='attendance'>Aanwezigheid</SortButton>
              </th>
              <th className='px-6 py-4 text-center'>
                <SortButton field='room'>Kamer</SortButton>
              </th>
              <th className='px-6 py-4 text-center'>
                <SortButton field='priority'>Prioriteit</SortButton>
              </th>
              <th className='px-6 py-4 text-center'>
                <span className='text-gray-700 dark:text-white font-medium'>
                  Huisdieren
                </span>
              </th>
              <th className='px-6 py-4 text-left sticky right-0 bg-gray-50 dark:bg-gray-700 z-20 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.3)] border-l border-gray-200 dark:border-gray-600'>
                <span className='text-gray-700 dark:text-white font-medium flex items-center'>
                  Acties
                  <MoreHorizontal className='w-4 h-4 ml-1 text-gray-400 dark:text-gray-500' />
                </span>
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
            {residents.map((resident) => {
              const residentPets = pets.filter(
                (pet) => pet.owners && pet.owners.includes(resident.id)
              );
              return (
                <tr
                  key={resident.id}
                  className='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
                >
                  <td className='px-6 py-4'>
                    <input
                      type='checkbox'
                      checked={selectedResidents.includes(resident.id)}
                      onChange={() => onToggleSelect(resident.id)}
                      className='rounded border-gray-300'
                    />
                  </td>
                  <td className='px-6 py-4 w-auto min-w-[120px] max-w-[300px]'>
                    <div>
                      <p className='font-semibold text-gray-900 dark:text-white text-sm whitespace-nowrap overflow-hidden text-ellipsis'>
                        {resident.name}
                      </p>
                      <p className='text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap overflow-hidden text-ellipsis'>
                        {resident.email}
                      </p>
                    </div>
                  </td>
                  <td className='px-6 py-4 text-center'>
                    <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      {resident.gender || '-'}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-center'>
                    <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      {calculateAge(resident.birthDate) || '-'}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-sm text-gray-600 dark:text-gray-300'>
                    {resident.type === 'human'
                      ? resident.nationality
                      : resident.breed}
                  </td>
                  <td className='px-6 py-4 text-center'>
                    <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      {resident.bsn || '-'}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-md ${
                        resident.statusColor === 'yellow'
                          ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700'
                          : resident.statusColor === 'blue'
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                            : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
                      }`}
                    >
                      {resident.status}
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-md ${
                        resident.attendance === 'Aanwezig'
                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700'
                          : resident.attendance === 'Op verlof'
                            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                            : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
                      }`}
                    >
                      {resident.attendance}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-center'>
                    <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                      {resident.room}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-center'>
                    <span
                      className={`text-xs font-medium ${
                        resident.priority === 'High'
                          ? 'text-red-600 dark:text-red-400'
                          : resident.priority === 'Normal'
                            ? 'text-gray-500 dark:text-gray-400'
                            : 'text-green-600 dark:text-green-400'
                      }`}
                    >
                      {resident.priority === 'High'
                        ? '●'
                        : resident.priority === 'Normal'
                          ? '○'
                          : '●'}
                      <span className='ml-1'>{resident.priority}</span>
                    </span>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex justify-center'>
                      {residentPets.length > 0 ? (
                        <span className='text-xs font-medium text-gray-700 dark:text-gray-300'>
                          {residentPets.length}
                        </span>
                      ) : (
                        <span className='text-xs text-gray-400 dark:text-gray-500'>
                          -
                        </span>
                      )}
                    </div>
                  </td>
                  <td className='px-6 py-4 sticky right-0 bg-white dark:bg-gray-800 z-10 shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.1)] dark:shadow-[-4px_0_6px_-1px_rgba(0,0,0,0.3)] border-l border-gray-200 dark:border-gray-600'>
                    <div className='flex items-center space-x-2'>
                      <button
                        onClick={() => onView(resident)}
                        className='p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors'
                      >
                        <Eye className='w-4 h-4' />
                      </button>
                      <button
                        onClick={() => onEdit(resident)}
                        className='p-2 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors'
                      >
                        <Edit className='w-4 h-4' />
                      </button>
                      <button className='p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors'>
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// 🔲 Grid View Component
const GridView = ({
  residents,
  onEdit,
  onView,
  selectedResidents,
  onToggleSelect,
  pets,
}) => (
  <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
    {residents.map((resident) => {
      // Get pets for this resident
      const residentPets = pets.filter(
        (pet) => pet.owners && pet.owners.includes(resident.id)
      );

      return (
        <div
          key={resident.id}
          className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 overflow-hidden group'
        >
          {/* Header */}
          <div className='relative p-4 pb-0'>
            <input
              type='checkbox'
              checked={selectedResidents.includes(resident.id)}
              onChange={() => onToggleSelect(resident.id)}
              className='absolute top-4 right-4 rounded border-gray-300 z-10'
            />
            <div className='flex items-center space-x-3'>
              <div className='relative'>
                <OptimizedImage
                  src={resident.photo}
                  fallbackSrc={PhotoService.generateAvatar(
                    resident.name,
                    resident.gender
                  )}
                  alt={resident.name}
                  className='w-12 h-12 rounded-full object-cover'
                  lazy={true}
                />
                {/* Type indicator */}
                <div
                  className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${getResidentTypeInfo(resident.type).bgColor} border-2 border-white`}
                >
                  {React.createElement(
                    getResidentTypeInfo(resident.type).icon,
                    {
                      className: `w-3 h-3 ${getResidentTypeInfo(resident.type).textColor}`,
                    }
                  )}
                </div>
              </div>
              <div className='flex-1 min-w-0'>
                <h3 className='font-semibold text-gray-900 dark:text-white truncate'>
                  {resident.name}
                </h3>
                <p className='text-sm text-gray-500 dark:text-gray-400 truncate'>
                  {resident.type === 'human'
                    ? resident.nationality
                    : resident.breed}
                  {calculateAge(resident.birthDate) && (
                    <span className='text-gray-400 dark:text-gray-500'>
                      {' '}
                      • {calculateAge(resident.birthDate)} jaar
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className='p-4 space-y-3'>
            <div className='flex items-center justify-between'>
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  resident.statusColor === 'yellow'
                    ? 'bg-yellow-100 text-yellow-800'
                    : resident.statusColor === 'blue'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {resident.status}
              </span>
              <span
                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                  resident.attendance === 'Aanwezig'
                    ? 'bg-green-100 text-green-800'
                    : resident.attendance === 'Op verlof'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                {resident.attendance}
              </span>
            </div>

            <div className='space-y-2 text-sm'>
              <div className='flex items-center text-gray-600'>
                <MapPin className='w-4 h-4 mr-2' />
                Kamer {resident.room}
              </div>
              <div className='flex items-center text-gray-600'>
                <Shield className='w-4 h-4 mr-2' />
                {resident.vNumber || resident.bsnNumber || 'Geen nummer'}
              </div>
              <div className='flex items-center text-gray-600'>
                <Clock className='w-4 h-4 mr-2' />
                {resident.lastSeen}
              </div>
              {/* Pet Information */}
              {residentPets.length > 0 && (
                <div className='flex items-center text-gray-600'>
                  <Heart className='w-4 h-4 mr-2' />
                  {residentPets.length} huisdier
                  {residentPets.length === 1 ? '' : 'en'} (
                  {residentPets.map((pet) => pet.name).join(', ')})
                </div>
              )}
            </div>

            {/* Priority Badge */}
            {resident.priority === 'High' && (
              <div className='flex items-center justify-center w-full'>
                <span className='inline-flex items-center px-3 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full'>
                  <AlertTriangle className='w-3 h-3 mr-1' />
                  Hoge Prioriteit
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className='border-t border-gray-200 dark:border-gray-700 px-4 py-3 bg-gray-50 dark:bg-gray-700'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-2'>
                <button
                  onClick={() => onView(resident)}
                  className='p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50'
                >
                  <Eye className='w-4 h-4' />
                </button>
                <button
                  onClick={() => onEdit(resident)}
                  className='p-2 text-gray-400 hover:text-green-600 transition-colors rounded-lg hover:bg-green-50'
                >
                  <Edit className='w-4 h-4' />
                </button>
              </div>
              <button className='p-2 text-gray-400 hover:text-gray-600 transition-colors'>
                <MoreHorizontal className='w-4 h-4' />
              </button>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

// 📊 Analytics View Component
const AnalyticsView = ({ residents, pets }) => {
  const stats = useMemo(() => {
    const total = residents.length;
    const present = residents.filter((r) => r.attendance === 'Aanwezig').length;
    const onLeave = residents.filter(
      (r) => r.attendance === 'Op verlof'
    ).length;
    const absent = residents.filter((r) => r.attendance === 'Afwezig').length;
    const highPriority = residents.filter((r) => r.priority === 'High').length;
    const cno = residents.filter((r) => r.locationType === 'CNO').length;
    const ukraine = residents.filter(
      (r) => r.locationType === 'OEKRAINE'
    ).length;

    // Age statistics
    const ages = residents
      .map((r) => calculateAge(r.birthDate))
      .filter(Boolean);
    const avgAge =
      ages.length > 0
        ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length)
        : 0;
    const minAge = ages.length > 0 ? Math.min(...ages) : 0;
    const maxAge = ages.length > 0 ? Math.max(...ages) : 0;
    const under18 = residents.filter(
      (r) => calculateAge(r.birthDate) < 18
    ).length;
    const over65 = residents.filter(
      (r) => calculateAge(r.birthDate) > 65
    ).length;

    // Type statistics
    const humans = residents.filter(
      (r) => r.type === 'human' || !r.type
    ).length;
    const cats = residents.filter((r) => r.type === 'cat').length;
    const dogs = residents.filter((r) => r.type === 'dog').length;

    // Pet statistics
    const totalPets = pets.length;
    const residentsWithPets = residents.filter((r) =>
      pets.some((pet) => pet.owners && pet.owners.includes(r.id))
    ).length;
    const petDogs = pets.filter((pet) => pet.type === 'dog').length;
    const petCats = pets.filter((pet) => pet.type === 'cat').length;
    const otherPets = pets.filter(
      (pet) => pet.type !== 'dog' && pet.type !== 'cat'
    ).length;

    return {
      total,
      present,
      onLeave,
      absent,
      highPriority,
      cno,
      ukraine,
      avgAge,
      minAge,
      maxAge,
      under18,
      over65,
      humans,
      cats,
      dogs,
      totalPets,
      residentsWithPets,
      petDogs,
      petCats,
      otherPets,
    };
  }, [residents, pets]);

  return (
    <div className='space-y-8'>
      {/* Overview Stats */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        <StatCard
          icon={Users}
          title='Totaal Bewoners'
          value={stats.total}
          color='blue'
        />
        <StatCard
          icon={CheckCircle}
          title='Aanwezig'
          value={stats.present}
          color='green'
        />
        <StatCard
          icon={Calendar}
          title='Op Verlof'
          value={stats.onLeave}
          color='blue'
        />
        <StatCard
          icon={AlertTriangle}
          title='Hoge Prioriteit'
          value={stats.highPriority}
          color='red'
        />
      </div>

      {/* Type Distribution */}
      <div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
          Type Verdeling
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg'>
            <div className='flex items-center justify-center mb-2'>
              <User className='w-8 h-8 text-blue-600' />
            </div>
            <div className='text-2xl font-bold text-blue-600'>
              {stats.humans}
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-300'>
              Mensen
            </div>
          </div>
          <div className='text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg'>
            <div className='flex items-center justify-center mb-2'>
              <Cat className='w-8 h-8 text-purple-600' />
            </div>
            <div className='text-2xl font-bold text-purple-600'>
              {stats.cats}
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-300'>
              Katten
            </div>
          </div>
          <div className='text-center p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg'>
            <div className='flex items-center justify-center mb-2'>
              <Dog className='w-8 h-8 text-orange-600' />
            </div>
            <div className='text-2xl font-bold text-orange-600'>
              {stats.dogs}
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-300'>
              Honden
            </div>
          </div>
        </div>
      </div>

      {/* Location Distribution */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            Locatie Verdeling
          </h3>
          <div className='space-y-4'>
            <div>
              <div className='flex justify-between text-sm mb-1'>
                <span className='text-gray-700 dark:text-gray-300'>
                  CNO Bewoners
                </span>
                <span className='text-gray-700 dark:text-gray-300'>
                  {stats.cno}
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-blue-600 h-2 rounded-full'
                  style={{ width: `${(stats.cno / stats.total) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className='flex justify-between text-sm mb-1'>
                <span className='text-gray-700 dark:text-gray-300'>
                  Oekraïne Bewoners
                </span>
                <span className='text-gray-700 dark:text-gray-300'>
                  {stats.ukraine}
                </span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-yellow-500 h-2 rounded-full'
                  style={{ width: `${(stats.ukraine / stats.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Overview */}
        <div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            Aanwezigheid Overzicht
          </h3>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <div className='w-3 h-3 bg-green-500 rounded-full mr-3' />
                <span className='text-sm text-gray-700 dark:text-gray-300'>
                  Aanwezig
                </span>
              </div>
              <span className='font-medium text-gray-700 dark:text-gray-300'>
                {stats.present}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <div className='w-3 h-3 bg-blue-500 rounded-full mr-3' />
                <span className='text-sm text-gray-700 dark:text-gray-300'>
                  Op Verlof
                </span>
              </div>
              <span className='font-medium text-gray-700 dark:text-gray-300'>
                {stats.onLeave}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <div className='w-3 h-3 bg-red-500 rounded-full mr-3' />
                <span className='text-sm text-gray-700 dark:text-gray-300'>
                  Afwezig
                </span>
              </div>
              <span className='font-medium text-gray-700 dark:text-gray-300'>
                {stats.absent}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Age Demographics */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            Leeftijd Statistieken
          </h3>
          <div className='grid grid-cols-3 gap-4 mb-4'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-600'>
                {stats.avgAge}
              </div>
              <div className='text-sm text-gray-500 dark:text-gray-400'>
                Gemiddeld
              </div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-green-600'>
                {stats.minAge}
              </div>
              <div className='text-sm text-gray-500 dark:text-gray-400'>
                Jongste
              </div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-orange-600'>
                {stats.maxAge}
              </div>
              <div className='text-sm text-gray-500 dark:text-gray-400'>
                Oudste
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6'>
          <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
            Leeftijd Groepen
          </h3>
          <div className='space-y-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <div className='w-3 h-3 bg-purple-500 rounded-full mr-3' />
                <span className='text-sm text-gray-700 dark:text-gray-300'>
                  Onder 18 jaar
                </span>
              </div>
              <span className='font-medium text-gray-700 dark:text-gray-300'>
                {stats.under18}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <div className='w-3 h-3 bg-blue-500 rounded-full mr-3' />
                <span className='text-sm text-gray-700 dark:text-gray-300'>
                  18-65 jaar
                </span>
              </div>
              <span className='font-medium text-gray-700 dark:text-gray-300'>
                {stats.total - stats.under18 - stats.over65}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <div className='w-3 h-3 bg-orange-500 rounded-full mr-3' />
                <span className='text-sm text-gray-700 dark:text-gray-300'>
                  Boven 65 jaar
                </span>
              </div>
              <span className='font-medium text-gray-700 dark:text-gray-300'>
                {stats.over65}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pet Statistics */}
      <div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
          Huisdieren Statistieken
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='text-center p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg'>
            <div className='text-2xl font-bold text-purple-600'>
              {stats.totalPets}
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-300'>
              Totaal Huisdieren
            </div>
          </div>
          <div className='text-center p-4 bg-green-50 dark:bg-green-900/30 rounded-lg'>
            <div className='text-2xl font-bold text-green-600'>
              {stats.residentsWithPets}
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-300'>
              Bewoners met Huisdieren
            </div>
          </div>
          <div className='text-center p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg'>
            <div className='text-2xl font-bold text-blue-600'>
              {stats.petDogs}
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-300'>
              Honden
            </div>
          </div>
          <div className='text-center p-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg'>
            <div className='text-2xl font-bold text-orange-600'>
              {stats.petCats}
            </div>
            <div className='text-sm text-gray-600 dark:text-gray-300'>
              Katten
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>
          Recente Activiteit
        </h3>
        <div className='space-y-3'>
          <div className='flex items-center text-sm'>
            <div className='w-2 h-2 bg-green-500 rounded-full mr-3' />
            <span className='text-gray-600 dark:text-gray-300'>
              Ahmad Al-Rashid - Check-in uitgevoerd
            </span>
            <span className='ml-auto text-gray-400'>2 min geleden</span>
          </div>
          <div className='flex items-center text-sm'>
            <div className='w-2 h-2 bg-blue-500 rounded-full mr-3' />
            <span className='text-gray-600 dark:text-gray-300'>
              Olena Kovalenko - Document geüpload
            </span>
            <span className='ml-auto text-gray-400'>1 uur geleden</span>
          </div>
          <div className='flex items-center text-sm'>
            <div className='w-2 h-2 bg-yellow-500 rounded-full mr-3' />
            <span className='text-gray-600 dark:text-gray-300'>
              Viktor Petrenko - Status gewijzigd
            </span>
            <span className='ml-auto text-gray-400'>3 uur geleden</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🚀 Main Component
const Residents = ({
  residents: _propResidents,
  onSelectResident: _onSelectResident,
  onAddResident: _onAddResident,
  onUpdateResident: _onUpdateResident,
  onDeleteResident: _onDeleteResident,
  searchTerm: _propSearchTerm,
  onSearchChange: _onSearchChange,
  selectedLabels: _propSelectedLabels,
  onLabelsChange: _onLabelsChange,
  sortBy: _propSortBy,
  sortOrder: _propSortOrder,
  onSortChange: _onSortChange,
  onSortOrderChange: _onSortOrderChange,
  viewMode: _propViewMode,
  onViewModeChange: _onViewModeChange,
  onFamilyWizardClick: _onFamilyWizardClick,
}) => {
  const [state, dispatch] = useReducer(residentsReducer, initialState);
  const { user, hasPermission } = useAuth();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  // const [addResidentForm, setAddResidentForm] = useState({}); // Not used with new modal
  // const [editResidentForm, setEditResidentForm] = useState({}); // Not used with new modal
  const [viewingResident, setViewingResident] = useState(null);
  const [isFamilyWizardOpen, setIsFamilyWizardOpen] = useState(false);
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [pets, setPets] = useState([]);
  const { addNotification } = useNotifications();
  const { locationType } = useLocation();

  // Caseworkers list
  const caseworkers = [
    'Sarah Johnson',
    'Maria Rodriguez',
    'John Smith',
    'Lisa Williams',
    'Tom Anderson',
    'Emma Thompson',
  ];

  // 📊 Load residents data
  useEffect(() => {
    const loadResidents = async () => {
      setIsLoading(true);
      try {
        const data = (await DataService.getResidentsAsync()) || [];
        dispatch({ type: 'SET_RESIDENTS', payload: data });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading residents:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadResidents();
  }, []);

  // Load pets data
  useEffect(() => {
    const savedPets = localStorage.getItem('vms_pets');
    if (savedPets) {
      try {
        const petsData = JSON.parse(savedPets);
        setPets(petsData);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error loading pets:', error);
      }
    }
  }, []);

  // Preload photos for better performance
  useEffect(() => {
    if (state.residents.length > 0) {
      PhotoService.preloadPhotos(state.residents);
    }
  }, [state.residents]);

  // 🔍 Smart filtering & sorting
  const filteredAndSortedResidents = useMemo(() => {
    const filtered = state.residents.filter((resident) => {
      // Location filter
      if (resident.locationType !== locationType) {
        return false;
      }

      // Search filter
      if (state.searchTerm) {
        const searchLower = state.searchTerm.toLowerCase();
        const searchable = [
          resident.name,
          resident.type === 'human' ? resident.nationality : resident.breed,
          resident.room,
          resident.email,
          resident.vNumber,
          resident.bsnNumber,
          resident.status,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchable.includes(searchLower)) {
          return false;
        }
      }

      // Advanced filters
      const { filters } = state;
      if (filters.status !== 'all' && resident.status !== filters.status) {
        return false;
      }
      if (
        filters.attendance !== 'all' &&
        resident.attendance !== filters.attendance
      ) {
        return false;
      }
      if (
        filters.priority !== 'all' &&
        resident.priority !== filters.priority
      ) {
        return false;
      }
      if (
        filters.locationType !== 'all' &&
        resident.locationType !== filters.locationType
      ) {
        return false;
      }
      if (filters.type !== 'all' && resident.type !== filters.type) {
        return false;
      }

      // Pets filter
      if (filters.hasPets !== 'all') {
        // Check if resident has any pets
        const hasPets = pets.some(
          (pet) => pet.owners && pet.owners.includes(resident.id)
        );
        if (filters.hasPets === true && !hasPets) {
          return false;
        }
        if (filters.hasPets === false && hasPets) {
          return false;
        }
      }

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
  }, [state, locationType, pets]);

  // 🎯 Event handlers
  const handleSearch = useCallback((term) => {
    dispatch({ type: 'SET_SEARCH', payload: term });
  }, []);

  const handleFiltersChange = useCallback((newFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: newFilters });
  }, []);

  const handleSort = useCallback(
    (field) => {
      const direction =
        state.sortField === field && state.sortDirection === 'asc'
          ? 'desc'
          : 'asc';
      dispatch({ type: 'SET_SORT', payload: { field, direction } });
    },
    [state.sortField, state.sortDirection]
  );

  const handleViewModeChange = useCallback((mode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  const handleEdit = useCallback((resident) => {
    setEditingResident(resident);
    // setEditResidentForm(resident); // Not used with new modal
  }, []);

  const handleView = useCallback((resident) => {
    setViewingResident(resident);
  }, []);

  const handleToggleSelect = useCallback((id) => {
    dispatch({ type: 'TOGGLE_SELECTED', payload: id });
  }, []);

  const handleSelectAll = useCallback(() => {
    const allIds = filteredAndSortedResidents.map((r) => r.id);
    dispatch({ type: 'SET_SELECTED', payload: allIds });
  }, [filteredAndSortedResidents]);

  const handleClearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTED' });
  }, []);

  const handleBulkEdit = useCallback(() => {
    if (state.selectedResidents.length === 0) {
      return;
    }
    setIsBulkEditOpen(true);
  }, [state.selectedResidents]);

  const handleBulkEditSave = useCallback(
    async (updates) => {
      if (state.selectedResidents.length === 0) {
        return;
      }

      // Update all selected residents
      const updatedResidents = state.residents.map((resident) =>
        state.selectedResidents.includes(resident.id)
          ? {
              ...resident,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : resident
      );

      // Update in DataService
      await Promise.all(
        state.selectedResidents.map(async (id) => {
          const resident = updatedResidents.find((r) => r.id === id);
          if (resident) {
            await DataService.updateResidentAsync(resident);
          }
        })
      );

      dispatch({ type: 'SET_RESIDENTS', payload: updatedResidents });
      handleClearSelection();
      setIsBulkEditOpen(false);

      addNotification({
        type: 'success',
        message: `${state.selectedResidents.length} bewoners bijgewerkt`,
        timestamp: new Date().toISOString(),
      });
    },
    [
      state.selectedResidents,
      state.residents,
      handleClearSelection,
      addNotification,
    ]
  );

  const handleBulkArchive = useCallback(async () => {
    if (state.selectedResidents.length === 0) {
      return;
    }

    // eslint-disable-next-line no-alert
    const confirmAction = window.confirm(
      `Wilt u ${state.selectedResidents.length} bewoners archiveren?`
    );
    if (!confirmAction) {
      return;
    }

    // Update all selected residents to archived status
    const selectedResidentsData = state.residents.filter((r) =>
      state.selectedResidents.includes(r.id)
    );

    await Promise.all(
      selectedResidentsData.map(async (resident) => {
        const updatedResident = {
          ...resident,
          status: 'Gearchiveerd',
          statusColor: 'gray',
          archivedAt: new Date().toISOString(),
        };
        await DataService.updateResidentAsync(updatedResident);
      })
    );

    // Update local state
    const updatedResidents = state.residents.map((resident) =>
      state.selectedResidents.includes(resident.id)
        ? {
            ...resident,
            status: 'Gearchiveerd',
            statusColor: 'gray',
            archivedAt: new Date().toISOString(),
          }
        : resident
    );

    dispatch({ type: 'SET_RESIDENTS', payload: updatedResidents });
    handleClearSelection();

    addNotification({
      type: 'success',
      message: `${state.selectedResidents.length} bewoners gearchiveerd`,
      timestamp: new Date().toISOString(),
    });
  }, [
    state.selectedResidents,
    state.residents,
    handleClearSelection,
    addNotification,
  ]);

  const handleExport = useCallback(() => {
    try {
      // Prepare data for export
      const exportData = {
        exportDate: new Date().toISOString(),
        locationType: locationType,
        totalResidents: filteredAndSortedResidents.length,
        residents: filteredAndSortedResidents.map((resident) => ({
          ...resident,
          // Add pet information
          pets: pets.filter(
            (pet) => pet.owners && pet.owners.includes(resident.id)
          ),
        })),
        pets: pets,
        metadata: {
          exportedBy: 'TAKO VMS',
          version: '1.0',
          filters: state.filters,
          searchTerm: state.searchTerm,
        },
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `TAKO_bewoners_export_${locationType}_${new Date().toISOString().split('T')[0]}.json`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addNotification({
        type: 'success',
        message: `${filteredAndSortedResidents.length} bewoners geëxporteerd`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Export error:', error);
      addNotification({
        type: 'error',
        message: 'Fout bij exporteren van gegevens',
        timestamp: new Date().toISOString(),
      });
    }
  }, [
    filteredAndSortedResidents,
    pets,
    locationType,
    state.filters,
    state.searchTerm,
    addNotification,
  ]);

  const handleExportCSV = useCallback(() => {
    try {
      // CSV headers
      const headers = [
        'Naam',
        'Type',
        'Nationaliteit',
        'Leeftijd',
        'Geslacht',
        'Status',
        'Aanwezigheid',
        'Kamer',
        'Prioriteit',
        'Telefoon',
        'Email',
        'V-nummer/BSN',
        'Begeleider',
        'Aankomstdatum',
        'Huisdieren',
      ];

      // CSV rows
      const rows = filteredAndSortedResidents.map((resident) => {
        const residentPets = pets.filter(
          (pet) => pet.owners && pet.owners.includes(resident.id)
        );
        const age = calculateAge(resident.birthDate);

        return [
          resident.name || '',
          resident.type === 'human'
            ? 'Mens'
            : resident.type === 'cat'
              ? 'Kat'
              : 'Hond',
          resident.type === 'human'
            ? resident.nationality || ''
            : resident.breed || '',
          age || '',
          resident.gender || '',
          resident.status || '',
          resident.attendance || '',
          resident.room || '',
          resident.priority || '',
          resident.phone || '',
          resident.email || '',
          resident.vNumber || resident.bsnNumber || '',
          resident.caseworker || '',
          resident.arrivalDate || '',
          residentPets.map((pet) => pet.name).join('; ') || 'Geen',
        ].map((field) => `"${String(field).replace(/"/g, '""')}"`); // Escape quotes
      });

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
      ].join('\n');

      // Create and download CSV file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `TAKO_bewoners_export_${locationType}_${new Date().toISOString().split('T')[0]}.csv`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      addNotification({
        type: 'success',
        message: `${filteredAndSortedResidents.length} bewoners geëxporteerd naar CSV`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('CSV Export error:', error);
      addNotification({
        type: 'error',
        message: 'Fout bij CSV export',
        timestamp: new Date().toISOString(),
      });
    }
  }, [filteredAndSortedResidents, pets, locationType, addNotification]);

  const handleImport = useCallback(() => {
    // Create file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (!file) {
        return;
      }

      try {
        const text = await file.text();
        const importData = JSON.parse(text);

        // Validate the import data structure
        if (!importData.residents || !Array.isArray(importData.residents)) {
          throw new Error('Ongeldig bestandsformaat: geen bewoners gevonden');
        }

        // Confirm import
        // eslint-disable-next-line no-alert
        const confirm = window.confirm(
          `Wilt u ${importData.residents.length} bewoners importeren? Dit overschrijft bestaande gegevens met hetzelfde ID.`
        );

        if (!confirm) {
          return;
        }

        // Import residents
        let imported = 0;
        let updated = 0;

        await Promise.all(
          importData.residents.map(async (resident) => {
            const existing = state.residents.find((r) => r.id === resident.id);
            if (existing) {
              await DataService.updateResidentAsync(resident);
              updated++;
            } else {
              await DataService.addResidentAsync(resident);
              imported++;
            }
          })
        );

        // Import pets if available
        if (importData.pets && Array.isArray(importData.pets)) {
          // Save pets to localStorage (pets are handled separately)
          localStorage.setItem('vms_pets', JSON.stringify(importData.pets));
          setPets(importData.pets);
        }

        // Refresh residents data
        const allResidents = DataService.getResidents();
        dispatch({ type: 'SET_RESIDENTS', payload: allResidents });

        addNotification({
          type: 'success',
          message: `Import voltooid: ${imported} nieuwe bewoners, ${updated} bijgewerkt`,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Import error:', error);
        addNotification({
          type: 'error',
          message: `Import fout: ${error.message}`,
          timestamp: new Date().toISOString(),
        });
      }
    };

    input.click();
  }, [state.residents, addNotification]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showExportMenu && !event.target.closest('.relative')) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  // 📊 Quick stats
  const quickStats = useMemo(() => {
    const total = filteredAndSortedResidents.length;
    const selected = state.selectedResidents.length;
    return { total, selected, showing: total };
  }, [filteredAndSortedResidents, state.selectedResidents]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' />
      </div>
    );
  }

  const handleDataExport = () => {
    try {
      handleExport();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Emergency export failed:', error);
    }
  };

  return (
    <ErrorBoundary>
      <DataErrorBoundary onDataExport={handleDataExport}>
        <div className='space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen'>
          {/* 🎯 Header */}
          <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                Bewoners {locationType === 'CNO' ? 'CNO' : 'Oekraïne'}
              </h1>
              <p className='text-gray-600 dark:text-gray-300 mt-1'>
                {quickStats.showing} bewoners • {quickStats.selected}{' '}
                geselecteerd
              </p>
            </div>

            <div className='flex items-center space-x-3'>
              <ActionButton
                icon={RefreshCw}
                label='Vernieuwen'
                onClick={() => window.location.reload()}
              />

              {/* Export Dropdown */}
              <div className='relative'>
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className='inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200'
                >
                  <Download className='w-4 h-4 mr-2' />
                  Export
                  <ChevronDown className='w-4 h-4 ml-1' />
                </button>

                {showExportMenu && (
                  <div className='absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10'>
                    <button
                      onClick={() => {
                        handleExport();
                        setShowExportMenu(false);
                      }}
                      className='w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg'
                    >
                      JSON Export (volledig)
                    </button>
                    <button
                      onClick={() => {
                        handleExportCSV();
                        setShowExportMenu(false);
                      }}
                      className='w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg'
                    >
                      CSV Export (Excel)
                    </button>
                  </div>
                )}
              </div>

              <ActionButton
                icon={Upload}
                label='Import'
                onClick={handleImport}
              />
              {hasPermission('add_residents') && (
                <ActionButton
                  icon={UserPlus}
                  label='Nieuwe Bewoner'
                  onClick={() => setIsAddModalOpen(true)}
                  variant='primary'
                />
              )}
              {hasPermission('add_residents') && (
                <ActionButton
                  icon={Users}
                  label='Gezinsregistratie'
                  onClick={() => setIsFamilyWizardOpen(true)}
                  variant='secondary'
                />
              )}
            </div>
          </div>

          {/* 🔍 Search & Filters */}
          <div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6'>
            <AdvancedSearch
              searchTerm={state.searchTerm}
              onSearchChange={handleSearch}
              onFiltersChange={handleFiltersChange}
              filters={state.filters}
            />
          </div>

          {/* 📊 Filter Presets */}
          <div className='flex flex-wrap gap-3'>
            {FILTER_PRESETS.map((preset) => {
              const Icon = preset.icon;
              return (
                <button
                  key={preset.id}
                  onClick={() => {
                    // Reset all filters first, then apply preset filters
                    const resetFilters = {
                      status: 'all',
                      attendance: 'all',
                      priority: 'all',
                      locationType: 'all',
                      hasPets: 'all',
                      type: 'all',
                    };
                    handleFiltersChange({ ...resetFilters, ...preset.filters });
                  }}
                  className='inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200'
                >
                  <Icon className='w-4 h-4 mr-2 text-gray-500 dark:text-gray-400' />
                  <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                    {preset.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 🎛️ View Controls */}
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0'>
            <div className='flex items-center space-x-2'>
              <span className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                Weergave:
              </span>
              <div className='flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1'>
                {[
                  { id: 'list', icon: List, label: 'Lijst' },
                  { id: 'grid', icon: Grid, label: 'Grid' },
                  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
                ].map((view) => {
                  const Icon = view.icon;
                  return (
                    <button
                      key={view.id}
                      onClick={() => handleViewModeChange(view.id)}
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        state.viewMode === view.id
                          ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                          : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      <Icon className='w-4 h-4 mr-2' />
                      {view.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {state.selectedResidents.length > 0 && (
              <div className='flex items-center space-x-3'>
                <span className='text-sm text-gray-600 dark:text-gray-300'>
                  {state.selectedResidents.length} geselecteerd
                </span>
                <ActionButton
                  icon={Edit}
                  label='Bewerken'
                  count={state.selectedResidents.length}
                  onClick={handleBulkEdit}
                />
                <ActionButton
                  icon={Archive}
                  label='Archiveren'
                  onClick={handleBulkArchive}
                />
                <button
                  onClick={handleClearSelection}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <X className='w-5 h-5' />
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
              onSelectAll={handleSelectAll}
              pets={pets}
            />
          )}

          {state.viewMode === 'grid' && (
            <GridView
              residents={filteredAndSortedResidents}
              onEdit={handleEdit}
              onView={handleView}
              selectedResidents={state.selectedResidents}
              onToggleSelect={handleToggleSelect}
              pets={pets}
            />
          )}

          {state.viewMode === 'analytics' && (
            <AnalyticsView residents={filteredAndSortedResidents} pets={pets} />
          )}

          {/* 📝 Modals */}
          {isAddModalOpen && hasPermission('add_residents') && (
            <AddResidentModalNew
              isOpen={isAddModalOpen}
              onClose={() => {
                setIsAddModalOpen(false);
              }}
              onSubmit={async (newResident) => {
                // Add to DataService
                const residentWithDefaults = {
                  ...newResident,
                  locationType: locationType,
                  attendance: 'Aanwezig',
                  lastSeen: 'Nu online',
                  leaveBalance: 20,
                  createdAt: new Date().toISOString(),
                };
                await DataService.addResidentAsync(residentWithDefaults);

                // Log audit trail
                if (user) {
                  auditHelpers.logResidentCreated(user, residentWithDefaults);
                }

                // Update local state
                dispatch({
                  type: 'SET_RESIDENTS',
                  payload: [...state.residents, residentWithDefaults],
                });
                addNotification({
                  type: 'success',
                  message: `Bewoner ${newResident.name} toegevoegd`,
                  timestamp: new Date().toISOString(),
                });
                setIsAddModalOpen(false);
                // setAddResidentForm({}); // Not used with new modal
              }}
              locationType={locationType}
              caseworkers={caseworkers}
              existingResidents={state.residents}
              onFamilyWizardClick={() => {
                setIsAddModalOpen(false);
                setIsFamilyWizardOpen(true);
              }}
            />
          )}

          {editingResident && (
            <AddResidentModalNew
              isOpen={!!editingResident}
              onClose={() => {
                setEditingResident(null);
              }}
              onSubmit={async (updatedResident) => {
                // Update in DataService
                const residentWithUpdate = {
                  ...updatedResident,
                  updatedAt: new Date().toISOString(),
                };
                await DataService.updateResidentAsync(residentWithUpdate);

                // Update local state
                const updated = state.residents.map((r) =>
                  r.id === updatedResident.id ? residentWithUpdate : r
                );
                dispatch({ type: 'SET_RESIDENTS', payload: updated });
                addNotification({
                  type: 'success',
                  message: `Bewoner ${updatedResident.name} bijgewerkt`,
                  timestamp: new Date().toISOString(),
                });
                setEditingResident(null);
                // setEditResidentForm({}); // Not used with new modal
              }}
              locationType={locationType}
              existingResidents={state.residents}
              onFamilyWizardClick={() => {
                setEditingResident(null);
                setIsFamilyWizardOpen(true);
              }}
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

          {/* Family Setup Wizard */}
          {isFamilyWizardOpen && hasPermission('add_residents') && (
            <FamilySetupWizard
              isOpen={isFamilyWizardOpen}
              onClose={() => setIsFamilyWizardOpen(false)}
              onSave={async (familyMembers, _familyId) => {
                // Add all family members to DataService
                await Promise.all(
                  familyMembers.map(async (member) => {
                    await DataService.addResidentAsync(member);
                  })
                );

                // Update local state
                dispatch({
                  type: 'SET_RESIDENTS',
                  payload: [...state.residents, ...familyMembers],
                });

                addNotification({
                  type: 'success',
                  message: `Familie ${familyMembers[0]?.familyName || 'nieuwe familie'} toegevoegd (${familyMembers.length} leden)`,
                  timestamp: new Date().toISOString(),
                });

                setIsFamilyWizardOpen(false);
              }}
              locationType={locationType}
              caseworkers={caseworkers}
              existingResidents={state.residents}
            />
          )}

          {/* Bulk Edit Modal */}
          {isBulkEditOpen && (
            <BulkEditModal
              isOpen={isBulkEditOpen}
              onClose={() => setIsBulkEditOpen(false)}
              onSave={handleBulkEditSave}
              selectedCount={state.selectedResidents.length}
              caseworkers={caseworkers}
            />
          )}
        </div>
      </DataErrorBoundary>
    </ErrorBoundary>
  );
};

// 📝 Bulk Edit Modal Component
const BulkEditModal = ({
  isOpen,
  onClose,
  onSave,
  selectedCount,
  caseworkers,
}) => {
  const { notify } = useNotifications();
  const [bulkData, setBulkData] = useState({
    priority: '',
    status: '',
    caseworker: '',
    attendance: '',
  });

  const handleSave = () => {
    // Filter out empty values
    const updates = Object.entries(bulkData)
      .filter(([_key, value]) => value !== '')
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    if (Object.keys(updates).length === 0) {
      notify('Selecteer minimaal één veld om bij te werken', { type: 'error' });
      return;
    }

    onSave(updates);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md'>
        <h2 className='text-xl font-bold text-gray-900 dark:text-white mb-4'>
          Bulk Bewerken ({selectedCount} bewoners)
        </h2>

        <div className='space-y-4'>
          <div>
            <label
              htmlFor='bulk-edit-priority'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Prioriteit
            </label>
            <select
              id='bulk-edit-priority'
              value={bulkData.priority}
              onChange={(e) =>
                setBulkData((prev) => ({ ...prev, priority: e.target.value }))
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Niet wijzigen</option>
              <option value='High'>Hoog</option>
              <option value='Normal'>Normaal</option>
              <option value='Low'>Laag</option>
            </select>
          </div>

          <div>
            <label
              htmlFor='bulk-edit-status'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Status
            </label>
            <select
              id='bulk-edit-status'
              value={bulkData.status}
              onChange={(e) =>
                setBulkData((prev) => ({ ...prev, status: e.target.value }))
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Niet wijzigen</option>
              <option value='In procedure'>In procedure</option>
              <option value='Tijdelijke bescherming'>
                Tijdelijke bescherming
              </option>
              <option value='Afgewezen'>Afgewezen</option>
              <option value='Gearchiveerd'>Gearchiveerd</option>
            </select>
          </div>

          <div>
            <label
              htmlFor='bulk-edit-attendance'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Aanwezigheid
            </label>
            <select
              id='bulk-edit-attendance'
              value={bulkData.attendance}
              onChange={(e) =>
                setBulkData((prev) => ({ ...prev, attendance: e.target.value }))
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Niet wijzigen</option>
              <option value='Aanwezig'>Aanwezig</option>
              <option value='Op verlof'>Op verlof</option>
              <option value='Afwezig'>Afwezig</option>
            </select>
          </div>

          <div>
            <label
              htmlFor='bulk-edit-caseworker'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Begeleider
            </label>
            <select
              id='bulk-edit-caseworker'
              value={bulkData.caseworker}
              onChange={(e) =>
                setBulkData((prev) => ({ ...prev, caseworker: e.target.value }))
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value=''>Niet wijzigen</option>
              {caseworkers.map((worker) => (
                <option key={worker} value={worker}>
                  {worker}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className='mt-6 flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-gray-600 hover:text-gray-800'
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700'
          >
            Bewoners Bijwerken
          </button>
        </div>
      </div>
    </div>
  );
};

export default Residents;
