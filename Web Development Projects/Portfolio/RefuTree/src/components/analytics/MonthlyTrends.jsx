import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, TrendingDown, Calendar, Users, UserPlus, UserMinus, 
  BarChart3, LineChart, Activity, Target, AlertTriangle, CheckCircle,
  Download, Filter, ChevronLeft, ChevronRight, Eye, EyeOff,
  ArrowUpRight, ArrowDownRight, Minus, Plus, RefreshCw
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

// 📊 Monthly Data Generator (simulates historical data)
const generateMonthlyData = (residents, locationType) => {
  const capacity = locationType === 'CNO' ? 120 : 80;
  const locationResidents = residents.filter(r => r.locationType === locationType);
  const currentOccupancy = locationResidents.filter(r => r.attendance === 'Aanwezig').length;
  
  // Generate 12 months of historical data
  const months = [];
  const today = new Date();
  
  for (let i = 11; i >= 0; i--) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' });
    const monthShort = date.toLocaleDateString('nl-NL', { month: 'short' });
    
    // Simulate realistic data with some randomness but trends
    const baseOccupancy = Math.max(20, Math.min(capacity, currentOccupancy + (Math.random() - 0.5) * 20));
    const instroom = Math.floor(Math.random() * 12) + 2;
    const uitstroom = Math.floor(Math.random() * 10) + 1;
    const netto = instroom - uitstroom;
    
    // Age distribution simulation
    const ageDistribution = {
      '0-4': Math.floor(Math.random() * 8) + 2,
      '4-12': Math.floor(Math.random() * 15) + 5,
      '12-18': Math.floor(Math.random() * 12) + 3,
      '18-64': Math.floor(Math.random() * 40) + 20,
      '65+': Math.floor(Math.random() * 6) + 1
    };
    
    // Incidents and activities simulation
    const incidents = Math.floor(Math.random() * 3);
    const activities = Math.floor(Math.random() * 8) + 2;
    
    months.push({
      month: monthName,
      monthShort,
      date,
      occupancy: Math.floor(baseOccupancy),
      capacity,
      instroom,
      uitstroom,
      netto,
      occupancyRate: ((baseOccupancy / capacity) * 100).toFixed(1),
      ageDistribution,
      incidents,
      activities,
      // Additional metrics
      schoolAge: ageDistribution['4-12'] + ageDistribution['12-18'],
      minors: ageDistribution['0-4'] + ageDistribution['4-12'] + ageDistribution['12-18'],
      adults: ageDistribution['18-64'] + ageDistribution['65+'],
      seniors: ageDistribution['65+']
    });
  }
  
  return months;
};

// 📈 Trend Indicator Component
const TrendIndicator = ({ value, previousValue, showPercentage = true }) => {
  const diff = value - previousValue;
  const percentChange = previousValue !== 0 ? ((diff / previousValue) * 100).toFixed(1) : 0;
  
  if (diff > 0) {
    return (
      <div className="flex items-center text-green-600 text-sm">
        <ArrowUpRight className="w-4 h-4 mr-1" />
        {showPercentage ? `+${percentChange}%` : `+${diff}`}
      </div>
    );
  } else if (diff < 0) {
    return (
      <div className="flex items-center text-red-600 text-sm">
        <ArrowDownRight className="w-4 h-4 mr-1" />
        {showPercentage ? `${percentChange}%` : `${diff}`}
      </div>
    );
  } else {
    return (
      <div className="flex items-center text-gray-500 text-sm">
        <Minus className="w-4 h-4 mr-1" />
        0%
      </div>
    );
  }
};

// 📊 Monthly Card Component
const MonthlyCard = ({ monthData, isSelected, onClick }) => (
  <div 
    className={`bg-white rounded-lg border p-4 cursor-pointer transition-all duration-200 ${
      isSelected 
        ? 'border-blue-500 ring-2 ring-blue-200 shadow-lg' 
        : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
    }`}
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-3">
      <h3 className="font-semibold text-gray-900">{monthData.monthShort}</h3>
      <div className="text-sm text-gray-500">
        {monthData.date.getFullYear()}
      </div>
    </div>
    
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Bezetting</span>
        <span className="font-medium">{monthData.occupancy}/{monthData.capacity}</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${monthData.occupancyRate}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>Instroom: +{monthData.instroom}</span>
        <span>Uitstroom: -{monthData.uitstroom}</span>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">Netto</span>
        <span className={`font-medium ${monthData.netto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {monthData.netto >= 0 ? '+' : ''}{monthData.netto}
        </span>
      </div>
    </div>
  </div>
);

// 📊 Summary Stats Component
const SummaryStats = ({ monthlyData, selectedMonth }) => {
  const currentMonth = monthlyData[monthlyData.length - 1];
  const previousMonth = monthlyData[monthlyData.length - 2];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <TrendIndicator 
            value={currentMonth.occupancy} 
            previousValue={previousMonth.occupancy} 
            showPercentage={false}
          />
        </div>
        <div className="text-2xl font-bold text-gray-900">{currentMonth.occupancy}</div>
        <div className="text-sm text-gray-500">Huidige bezetting</div>
        <div className="text-xs text-gray-400 mt-1">
          {currentMonth.occupancyRate}% van capaciteit
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <UserPlus className="w-5 h-5 text-green-600" />
          </div>
          <TrendIndicator 
            value={currentMonth.instroom} 
            previousValue={previousMonth.instroom} 
            showPercentage={false}
          />
        </div>
        <div className="text-2xl font-bold text-gray-900">{currentMonth.instroom}</div>
        <div className="text-sm text-gray-500">Instroom deze maand</div>
        <div className="text-xs text-gray-400 mt-1">
          Gemiddeld: {(monthlyData.reduce((sum, m) => sum + m.instroom, 0) / monthlyData.length).toFixed(1)}
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-red-100 rounded-lg">
            <UserMinus className="w-5 h-5 text-red-600" />
          </div>
          <TrendIndicator 
            value={currentMonth.uitstroom} 
            previousValue={previousMonth.uitstroom} 
            showPercentage={false}
          />
        </div>
        <div className="text-2xl font-bold text-gray-900">{currentMonth.uitstroom}</div>
        <div className="text-sm text-gray-500">Uitstroom deze maand</div>
        <div className="text-xs text-gray-400 mt-1">
          Gemiddeld: {(monthlyData.reduce((sum, m) => sum + m.uitstroom, 0) / monthlyData.length).toFixed(1)}
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <TrendIndicator 
            value={currentMonth.netto} 
            previousValue={previousMonth.netto} 
            showPercentage={false}
          />
        </div>
        <div className={`text-2xl font-bold ${currentMonth.netto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {currentMonth.netto >= 0 ? '+' : ''}{currentMonth.netto}
        </div>
        <div className="text-sm text-gray-500">Netto groei</div>
        <div className="text-xs text-gray-400 mt-1">
          12-maands trend: {monthlyData.reduce((sum, m) => sum + m.netto, 0) > 0 ? 'Groeiend' : 'Krimpend'}
        </div>
      </div>
    </div>
  );
};

// 📈 Trend Chart Component (Simple visualization)
const TrendChart = ({ monthlyData, metric = 'occupancy' }) => {
  const maxValue = Math.max(...monthlyData.map(m => m[metric]));
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {metric === 'occupancy' ? 'Bezetting Trend' : 
         metric === 'instroom' ? 'Instroom Trend' : 
         metric === 'uitstroom' ? 'Uitstroom Trend' : 'Netto Groei'}
      </h3>
      
      <div className="flex items-end space-x-2 h-32">
        {monthlyData.map((month, index) => {
          const height = (month[metric] / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-blue-500 rounded-t transition-all duration-300 hover:bg-blue-600"
                style={{ height: `${height}%` }}
                title={`${month.monthShort}: ${month[metric]}`}
              />
              <div className="text-xs text-gray-500 mt-1 transform rotate-45 origin-left">
                {month.monthShort}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 📋 Monthly Details Component
const MonthlyDetails = ({ monthData }) => {
  if (!monthData) return null;
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Details: {monthData.month}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Bezetting & Capaciteit</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Bezetting:</span>
              <span className="font-medium">{monthData.occupancy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Capaciteit:</span>
              <span className="font-medium">{monthData.capacity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Bezettingsgraad:</span>
              <span className="font-medium">{monthData.occupancyRate}%</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Instroom & Uitstroom</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Instroom:</span>
              <span className="font-medium text-green-600">+{monthData.instroom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Uitstroom:</span>
              <span className="font-medium text-red-600">-{monthData.uitstroom}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Netto:</span>
              <span className={`font-medium ${monthData.netto >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {monthData.netto >= 0 ? '+' : ''}{monthData.netto}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="font-medium text-gray-700 mb-3">Leeftijdsverdeling</h4>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(monthData.ageDistribution).map(([group, count]) => (
            <div key={group} className="text-center">
              <div className="text-lg font-bold text-gray-900">{count}</div>
              <div className="text-xs text-gray-500">{group} jaar</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Activiteiten & Incidenten</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Activiteiten:</span>
              <span className="font-medium">{monthData.activities}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Incidenten:</span>
              <span className="font-medium">{monthData.incidents}</span>
            </div>
          </div>
        </div>
        
        <div>
          <h4 className="font-medium text-gray-700 mb-3">Demografische Highlights</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Minderjarigen:</span>
              <span className="font-medium">{monthData.minors}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Schoolgaand:</span>
              <span className="font-medium">{monthData.schoolAge}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Senioren:</span>
              <span className="font-medium">{monthData.seniors}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 🎯 Main MonthlyTrends Component
const MonthlyTrends = ({ residents = [] }) => {
  const { locationType } = useLocation();
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [viewMode, setViewMode] = useState('overview'); // 'overview', 'chart', 'details'
  
  // Generate monthly data
  const monthlyData = useMemo(() => 
    generateMonthlyData(residents, locationType), 
    [residents, locationType]
  );
  
  // Set default selected month to current month
  React.useEffect(() => {
    if (monthlyData.length > 0 && !selectedMonth) {
      setSelectedMonth(monthlyData[monthlyData.length - 1]);
    }
  }, [monthlyData, selectedMonth]);
  
  const handleExport = () => {
    exportAnalytics.monthlyTrends(residents, locationType, monthlyData);
  };
  
  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            📅 Maandelijkse Trends - {locationType === 'CNO' ? 'CNO' : 'Oekraïne'}
          </h1>
          <p className="text-gray-600 mt-1">
            Historische data en trends voor bewonersbeheer
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 lg:mt-0">
          <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border border-gray-200">
            <button
              onClick={() => setViewMode('overview')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'overview' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4 mr-1 inline" />
              Overzicht
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'chart' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <BarChart3 className="w-4 h-4 mr-1 inline" />
              Grafieken
            </button>
          </div>
          <button 
            onClick={handleExport}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-2 inline" />
            Excel Export
          </button>
        </div>
      </div>
      
      {/* Summary Statistics */}
      <SummaryStats monthlyData={monthlyData} selectedMonth={selectedMonth} />
      
      {/* Monthly Overview Cards */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">12-Maands Overzicht</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {monthlyData.map((month, index) => (
            <MonthlyCard
              key={index}
              monthData={month}
              isSelected={selectedMonth?.month === month.month}
              onClick={() => setSelectedMonth(month)}
            />
          ))}
        </div>
      </div>
      
      {/* Main Content Area */}
      {viewMode === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart monthlyData={monthlyData} metric="occupancy" />
          <TrendChart monthlyData={monthlyData} metric="netto" />
        </div>
      )}
      
      {viewMode === 'chart' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TrendChart monthlyData={monthlyData} metric="instroom" />
          <TrendChart monthlyData={monthlyData} metric="uitstroom" />
        </div>
      )}
      
      {/* Selected Month Details */}
      {selectedMonth && (
        <MonthlyDetails monthData={selectedMonth} />
      )}
      
      {/* Insights and Recommendations */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Inzichten & Aanbevelingen</h3>
        <div className="space-y-4">
          <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-800">Stabiele bezetting</p>
              <p className="text-sm text-blue-700">
                Bezettingsgraad blijft binnen optimale range van 70-85%
              </p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-green-50 border border-green-200 rounded-lg">
            <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-800">Positieve instroom trend</p>
              <p className="text-sm text-green-700">
                Instroom is consistent hoger dan uitstroom de afgelopen 3 maanden
              </p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-orange-800">Capaciteit monitoring</p>
              <p className="text-sm text-orange-700">
                Bij huidige groei wordt 90% capaciteit bereikt binnen 2 maanden
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyTrends;