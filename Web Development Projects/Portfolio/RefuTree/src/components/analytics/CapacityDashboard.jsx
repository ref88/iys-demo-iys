import React, { useState, useMemo } from 'react';
import { 
  Users, Home, UserPlus, UserMinus, TrendingUp, TrendingDown, 
  AlertTriangle, CheckCircle, Clock, BarChart3, PieChart, 
  Calendar, MapPin, Target, Zap, Download, RefreshCw
} from 'lucide-react';
import { useLocation } from '../../contexts/LocationContext.jsx';
import { exportAnalytics } from '../../utils/excelExport.js';

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

// 📊 Metric Card Component
const MetricCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'blue', 
  trend, 
  trendValue,
  onClick 
}) => (
  <div 
    className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 ${
      onClick ? 'cursor-pointer' : ''
    }`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-lg bg-${color}-100`}>
        <Icon className={`w-6 h-6 text-${color}-600`} />
      </div>
      {trend && (
        <div className={`flex items-center text-sm ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend === 'up' ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
          {trendValue}
        </div>
      )}
    </div>
    <div>
      <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
      )}
    </div>
  </div>
);

// 📈 Capacity Bar Component
const CapacityBar = ({ current, max, label, color = 'blue' }) => {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  const isNearCapacity = percentage > 85;
  const isOverCapacity = percentage > 100;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className={`${
          isOverCapacity ? 'text-red-600' : 
          isNearCapacity ? 'text-orange-600' : 
          'text-gray-600'
        }`}>
          {current} / {max}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div 
          className={`h-3 rounded-full transition-all duration-300 ${
            isOverCapacity ? 'bg-red-500' : 
            isNearCapacity ? 'bg-orange-500' : 
            `bg-${color}-500`
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="text-xs text-gray-500">
        {percentage.toFixed(1)}% bezetting
        {isOverCapacity && <span className="text-red-600 ml-2">⚠️ Overcapaciteit</span>}
        {isNearCapacity && !isOverCapacity && <span className="text-orange-600 ml-2">⚠️ Bijna vol</span>}
      </div>
    </div>
  );
};

// 🏠 Housing Status Component
const HousingStatusCard = ({ residents, locationType }) => {
  const statusCounts = useMemo(() => {
    const counts = {
      fysiek: residents.filter(r => r.attendance === 'Aanwezig').length,
      administratief: residents.length, // All residents are administratively present
      logee: residents.filter(r => r.labels?.includes('logee')).length || 0, // Assuming logee is a label
      verlof: residents.filter(r => r.attendance === 'Op verlof').length
    };
    return counts;
  }, [residents]);

  const capacity = locationType === 'CNO' ? 120 : 80; // Example capacities

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Bezetting {locationType === 'CNO' ? 'CNO' : 'Oekraïne'}
        </h3>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <CapacityBar 
          current={statusCounts.fysiek} 
          max={capacity} 
          label="Fysieke bezetting" 
          color="blue"
        />
        <CapacityBar 
          current={statusCounts.administratief} 
          max={capacity} 
          label="Administratieve bezetting" 
          color="purple"
        />
        <CapacityBar 
          current={statusCounts.logee} 
          max={Math.floor(capacity * 0.1)} 
          label="Logees" 
          color="orange"
        />
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <div className="flex justify-between mb-1">
            <span>Beschikbare plaatsen:</span>
            <span className="font-medium">{capacity - statusCounts.fysiek}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>Op verlof:</span>
            <span className="font-medium">{statusCounts.verlof}</span>
          </div>
          <div className="flex justify-between">
            <span>Totale capaciteit:</span>
            <span className="font-medium">{capacity}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🔄 Flow Metrics Component
const FlowMetrics = ({ residents }) => {
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  
  const flowData = useMemo(() => {
    const instroom = residents.filter(r => {
      const arrivalDate = new Date(r.arrivalDate || r.createdAt);
      return arrivalDate.getMonth() === thisMonth && arrivalDate.getFullYear() === thisYear;
    }).length;

    const uitstroom = residents.filter(r => {
      const departureDate = r.departureDate ? new Date(r.departureDate) : null;
      return departureDate && 
             departureDate.getMonth() === thisMonth && 
             departureDate.getFullYear() === thisYear;
    }).length;

    return { instroom, uitstroom };
  }, [residents, thisMonth, thisYear]);

  const currentMonth = new Date().toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <MetricCard
        title="Instroom deze maand"
        value={flowData.instroom}
        subtitle={`${currentMonth}`}
        icon={UserPlus}
        color="green"
        trend="up"
        trendValue={`+${flowData.instroom}`}
      />
      <MetricCard
        title="Uitstroom deze maand"
        value={flowData.uitstroom}
        subtitle={`${currentMonth}`}
        icon={UserMinus}
        color="red"
        trend="down"
        trendValue={`-${flowData.uitstroom}`}
      />
    </div>
  );
};

// 🎯 Main CapacityDashboard Component
const CapacityDashboard = ({ residents = [] }) => {
  const { locationType } = useLocation();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Filter residents by location
  const locationResidents = useMemo(() => 
    residents.filter(r => r.locationType === locationType), 
    [residents, locationType]
  );

  // Calculate key metrics
  const metrics = useMemo(() => {
    const total = locationResidents.length;
    const present = locationResidents.filter(r => r.attendance === 'Aanwezig').length;
    const onLeave = locationResidents.filter(r => r.attendance === 'Op verlof').length;
    const absent = locationResidents.filter(r => r.attendance === 'Afwezig').length;

    // Age group calculations
    const ageGroups = {
      '0-4': 0,
      '4-12': 0,
      '12-18': 0,
      '18-64': 0,
      '65+': 0
    };

    locationResidents.forEach(resident => {
      const age = calculateAge(resident.birthDate);
      if (age !== null) {
        if (age < 4) ageGroups['0-4']++;
        else if (age < 12) ageGroups['4-12']++;
        else if (age < 18) ageGroups['12-18']++;
        else if (age < 65) ageGroups['18-64']++;
        else ageGroups['65+']++;
      }
    });

    return {
      total,
      present,
      onLeave,
      absent,
      ageGroups
    };
  }, [locationResidents]);

  const capacity = locationType === 'CNO' ? 120 : 80;

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            📊 Capaciteit Dashboard - {locationType === 'CNO' ? 'CNO' : 'Oekraïne'}
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time inzicht in bezetting, capaciteit en bewonersstromen
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
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
          <button 
            onClick={() => exportAnalytics.capacity(residents, locationType)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2 inline" />
            Excel Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Totale Bewoners"
          value={metrics.total}
          subtitle={`van ${capacity} plaatsen`}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Aanwezig"
          value={metrics.present}
          subtitle={`${((metrics.present / capacity) * 100).toFixed(1)}% bezetting`}
          icon={CheckCircle}
          color="green"
        />
        <MetricCard
          title="Op Verlof"
          value={metrics.onLeave}
          subtitle="Tijdelijk afwezig"
          icon={Clock}
          color="orange"
        />
        <MetricCard
          title="Beschikbaar"
          value={capacity - metrics.present}
          subtitle="Vrije plaatsen"
          icon={Home}
          color="purple"
        />
      </div>

      {/* Housing Status and Flow */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HousingStatusCard residents={locationResidents} locationType={locationType} />
        
        <div className="space-y-6">
          <FlowMetrics residents={locationResidents} />
          
          {/* Quick Age Distribution */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Leeftijdsverdeling</h3>
            <div className="space-y-3">
              {Object.entries(metrics.ageGroups).map(([group, count]) => (
                <div key={group} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{group} jaar</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${metrics.total > 0 ? (count / metrics.total) * 100 : 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Alerts and Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Meldingen & Alerts</h3>
        <div className="space-y-3">
          {((metrics.present / capacity) * 100) > 85 && (
            <div className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-orange-800">Capaciteit waarschuwing</p>
                <p className="text-sm text-orange-700">Bezetting is hoger dan 85% ({((metrics.present / capacity) * 100).toFixed(1)}%)</p>
              </div>
            </div>
          )}
          
          {metrics.present > capacity && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-red-800">Overcapaciteit</p>
                <p className="text-sm text-red-700">Er zijn meer bewoners dan beschikbare plaatsen</p>
              </div>
            </div>
          )}
          
          {metrics.present < capacity * 0.5 && (
            <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <CheckCircle className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-800">Lage bezetting</p>
                <p className="text-sm text-blue-700">Bezetting is lager dan 50% - ruimte voor nieuwe bewoners</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CapacityDashboard;