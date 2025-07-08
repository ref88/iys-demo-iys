import React, { useState, useEffect } from 'react';
import { 
  BarChart3, TrendingUp, Clock, Users, Calendar, 
  Download, Filter, ChevronDown, ChevronUp, 
  Target, Award, AlertTriangle, CheckCircle, 
  PieChart, Activity, Zap, TrendingDown,
  FileText, BarChart, LineChart, PieChart as PieChartIcon
} from 'lucide-react';

const ShiftAnalytics = ({ shifts, staffMembers, currentUser }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('month'); // week, month, quarter
  const [selectedStaff, setSelectedStaff] = useState('all');
  const [showDetails, setShowDetails] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');

  // Calculate analytics data
  const calculateAnalytics = () => {
    const now = new Date();
    const periodStart = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        periodStart.setDate(now.getDate() - 7);
        break;
      case 'month':
        periodStart.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        periodStart.setMonth(now.getMonth() - 3);
        break;
      default:
        periodStart.setMonth(now.getMonth() - 1);
    }

    const filteredShifts = shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= periodStart && shiftDate <= now;
    });

    const analytics = {
      totalShifts: filteredShifts.length,
      totalHours: 0,
      averageShiftsPerStaff: 0,
      onTimeRate: 0,
      lateRate: 0,
      noShowRate: 0,
      staffPerformance: {},
      shiftTypeDistribution: {},
      weeklyTrends: [],
      productivityScore: 0,
      costAnalysis: {
        totalCost: 0,
        averageCostPerShift: 0,
        costPerHour: 0
      },
      efficiencyMetrics: {
        optimalStaffing: 0,
        understaffedShifts: 0,
        overstaffedShifts: 0
      }
    };

    // Calculate hours and performance metrics
    let totalCheckIns = 0;
    let onTimeCheckIns = 0;
    let lateCheckIns = 0;
    let noShows = 0;

    filteredShifts.forEach(shift => {
      const shiftType = getShiftTypeInfo(shift.shiftType);
      const shiftHours = (parseInt(shift.endTime.split(':')[0]) - parseInt(shift.startTime.split(':')[0]));
      analytics.totalHours += shiftHours * shift.assignedStaff.length;

      // Shift type distribution
      if (!analytics.shiftTypeDistribution[shift.shiftType]) {
        analytics.shiftTypeDistribution[shift.shiftType] = 0;
      }
      analytics.shiftTypeDistribution[shift.shiftType]++;

      // Staff performance
      shift.assignedStaff.forEach(staffId => {
        if (!analytics.staffPerformance[staffId]) {
          analytics.staffPerformance[staffId] = {
            totalShifts: 0,
            totalHours: 0,
            onTimeShifts: 0,
            lateShifts: 0,
            noShows: 0,
            productivityScore: 0
          };
        }

        const staff = analytics.staffPerformance[staffId];
        staff.totalShifts++;
        staff.totalHours += shiftHours;

        // Check attendance
        const checkIn = shift.checkIns.find(c => c.staffId === staffId);
        if (checkIn) {
          totalCheckIns++;
          const checkInTime = new Date(checkIn.checkInTime);
          const shiftStartTime = new Date(`${shift.date}T${shift.startTime}`);
          
          if (checkInTime <= shiftStartTime) {
            staff.onTimeShifts++;
            onTimeCheckIns++;
          } else {
            staff.lateShifts++;
            lateCheckIns++;
          }
        } else {
          staff.noShows++;
          noShows++;
        }

        // Calculate productivity score (simplified)
        staff.productivityScore = Math.round(
          ((staff.onTimeShifts / staff.totalShifts) * 0.4 + 
           (staff.totalHours / 40) * 0.3 + 
           (1 - staff.noShows / staff.totalShifts) * 0.3) * 100
        );
      });

      // Efficiency analysis
      const optimalStaff = shiftType.maxStaff;
      if (shift.assignedStaff.length < optimalStaff) {
        analytics.efficiencyMetrics.understaffedShifts++;
      } else if (shift.assignedStaff.length > optimalStaff) {
        analytics.efficiencyMetrics.overstaffedShifts++;
      } else {
        analytics.efficiencyMetrics.optimalStaffing++;
      }
    });

    // Calculate rates
    analytics.onTimeRate = totalCheckIns > 0 ? (onTimeCheckIns / totalCheckIns) * 100 : 0;
    analytics.lateRate = totalCheckIns > 0 ? (lateCheckIns / totalCheckIns) * 100 : 0;
    analytics.noShowRate = totalCheckIns > 0 ? (noShows / totalCheckIns) * 100 : 0;
    analytics.averageShiftsPerStaff = staffMembers.length > 0 ? analytics.totalShifts / staffMembers.length : 0;

    // Calculate overall productivity score
    const avgProductivity = Object.values(analytics.staffPerformance)
      .reduce((sum, staff) => sum + staff.productivityScore, 0) / Object.keys(analytics.staffPerformance).length;
    analytics.productivityScore = Math.round(avgProductivity);

    // Cost analysis (simplified - assuming €15/hour average)
    const hourlyRate = 15;
    analytics.costAnalysis.totalCost = analytics.totalHours * hourlyRate;
    analytics.costAnalysis.averageCostPerShift = analytics.totalShifts > 0 ? analytics.costAnalysis.totalCost / analytics.totalShifts : 0;
    analytics.costAnalysis.costPerHour = analytics.totalHours > 0 ? analytics.costAnalysis.totalCost / analytics.totalHours : 0;

    return analytics;
  };

  const getShiftTypeInfo = (shiftTypeId) => {
    const shiftTypes = {
      'early_full': { name: 'Vroege Dienst', color: 'bg-blue-500', maxStaff: 2 },
      'early_intermediate': { name: 'Vroege Tussendienst', color: 'bg-green-500', maxStaff: 1 },
      'late_full': { name: 'Late Dienst', color: 'bg-purple-500', maxStaff: 2 },
      'late_intermediate': { name: 'Late Tussendienst', color: 'bg-orange-500', maxStaff: 1 }
    };
    return shiftTypes[shiftTypeId] || { name: 'Onbekend', color: 'bg-gray-500', maxStaff: 1 };
  };

  const analytics = calculateAnalytics();

  const exportAnalytics = () => {
    const data = {
      period: selectedPeriod,
      analytics: analytics,
      staffMembers: staffMembers,
      exportDate: new Date().toISOString()
    };

    let content, filename, mimeType;

    if (exportFormat === 'json') {
      content = JSON.stringify(data, null, 2);
      filename = `analytics_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.json`;
      mimeType = 'application/json';
    } else if (exportFormat === 'csv') {
      // Convert to CSV format
      const csvRows = [
        ['Staff Member', 'Total Shifts', 'Total Hours', 'On Time Rate', 'Late Rate', 'Productivity Score'],
        ...Object.entries(analytics.staffPerformance).map(([staffId, performance]) => {
          const staff = staffMembers.find(s => s.id === parseInt(staffId));
          return [
            staff?.name || 'Unknown',
            performance.totalShifts,
            performance.totalHours,
            `${((performance.onTimeShifts / performance.totalShifts) * 100).toFixed(1)}%`,
            `${((performance.lateShifts / performance.totalShifts) * 100).toFixed(1)}%`,
            performance.productivityScore
          ];
        })
      ];
      content = csvRows.map(row => row.join(',')).join('\n');
      filename = `analytics_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`;
      mimeType = 'text/csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getPerformanceColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceIcon = (score) => {
    if (score >= 80) return <Award className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <Target className="w-5 h-5 text-yellow-600" />;
    return <AlertTriangle className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Analytics Dashboard</h2>
          <p className="text-gray-600">Performance insights en KPI's voor optimale dienstplanning</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="week">Laatste Week</option>
            <option value="month">Laatste Maand</option>
            <option value="quarter">Laatste Kwartaal</option>
          </select>
          
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
          
          <button
            onClick={exportAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Totaal Diensten</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalShifts}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-600">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>{analytics.averageShiftsPerStaff.toFixed(1)} gemiddeld per personeel</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Totaal Uren</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.totalHours}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-600">
              <Zap className="w-4 h-4 mr-1" />
              <span>€{analytics.costAnalysis.totalCost.toFixed(0)} totale kosten</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Productiviteit Score</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(analytics.productivityScore)}`}>
                {analytics.productivityScore}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              {getPerformanceIcon(analytics.productivityScore)}
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-600">
              <Activity className="w-4 h-4 mr-1" />
              <span>Gemiddelde team performance</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Op Tijd Rate</p>
              <p className="text-2xl font-bold text-gray-900">{analytics.onTimeRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm text-gray-600">
              <Users className="w-4 h-4 mr-1" />
              <span>{analytics.lateRate.toFixed(1)}% te laat, {analytics.noShowRate.toFixed(1)}% afwezig</span>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Performance */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Personeel Performance</h3>
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-blue-600 hover:text-blue-700"
            >
              {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
          </div>
          
          <div className="space-y-3">
            {Object.entries(analytics.staffPerformance)
              .sort(([,a], [,b]) => b.productivityScore - a.productivityScore)
              .slice(0, showDetails ? 10 : 5)
              .map(([staffId, performance]) => {
                const staff = staffMembers.find(s => s.id === parseInt(staffId));
                return (
                  <div key={staffId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                        {staff?.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{staff?.name}</p>
                        <p className="text-sm text-gray-600">{performance.totalShifts} diensten</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${getPerformanceColor(performance.productivityScore)}`}>
                        {performance.productivityScore}%
                      </p>
                      <p className="text-xs text-gray-600">{performance.totalHours}u</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Shift Distribution */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Dienst Type Verdeling</h3>
          <div className="space-y-3">
            {Object.entries(analytics.shiftTypeDistribution).map(([shiftType, count]) => {
              const shiftInfo = getShiftTypeInfo(shiftType);
              const percentage = (count / analytics.totalShifts) * 100;
              return (
                <div key={shiftType} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${shiftInfo.color}`}></div>
                    <span className="font-medium text-gray-900">{shiftInfo.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{count}</p>
                    <p className="text-sm text-gray-600">{percentage.toFixed(1)}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Efficiency Analysis */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Efficiëntie Analyse</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{analytics.efficiencyMetrics.optimalStaffing}</p>
            <p className="text-sm text-gray-600">Optimale bezetting</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-600">{analytics.efficiencyMetrics.understaffedShifts}</p>
            <p className="text-sm text-gray-600">Onderbezet</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{analytics.efficiencyMetrics.overstaffedShifts}</p>
            <p className="text-sm text-gray-600">Overbezet</p>
          </div>
        </div>
      </div>

      {/* Cost Analysis */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kosten Analyse</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">€{analytics.costAnalysis.totalCost.toFixed(0)}</p>
            <p className="text-sm text-gray-600">Totale kosten</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">€{analytics.costAnalysis.averageCostPerShift.toFixed(0)}</p>
            <p className="text-sm text-gray-600">Gemiddelde kosten per dienst</p>
          </div>
          
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">€{analytics.costAnalysis.costPerHour.toFixed(0)}</p>
            <p className="text-sm text-gray-600">Kosten per uur</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftAnalytics; 