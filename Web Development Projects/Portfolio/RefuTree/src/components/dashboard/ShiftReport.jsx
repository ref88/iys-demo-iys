import React, { useState, useEffect } from 'react';
import { 
  Download, Calendar, Clock, Users, TrendingUp, AlertTriangle,
  CheckCircle, XCircle, FileText, BarChart, Filter, ChevronDown,
  Activity, Target, Award, Zap, Eye, RefreshCw
} from 'lucide-react';
import DataService from '../../utils/dataService.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';

const ShiftReport = () => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotification();
  
  const [reportType, setReportType] = useState('overview');
  const [dateRange, setDateRange] = useState('week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [residents, setResidents] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [handovers, setHandovers] = useState([]);

  useEffect(() => {
    // Set default date range
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    
    setStartDate(weekAgo.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);
    
    // Load data
    loadData();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      generateReport();
    }
  }, [reportType, startDate, endDate]);

  const loadData = () => {
    const residentsData = DataService.getResidents() || [];
    const incidentsData = DataService.getIncidents() || [];
    const handoversData = DataService.getHandovers() || [];
    
    setResidents(residentsData);
    setIncidents(incidentsData);
    setHandovers(handoversData);
  };

  const generateReport = () => {
    setLoading(true);
    
    setTimeout(() => {
      let data = {};

      switch (reportType) {
        case 'overview':
          data = generateOverviewReport();
          break;
        case 'residents':
          data = generateResidentsReport();
          break;
        case 'incidents':
          // Incidents are managed in the dedicated IncidentManager
          data = { redirect: true, message: 'Gebruik Incident Management voor incident analyses' };
          break;
        case 'handovers':
          data = generateHandoversReport();
          break;
        case 'performance':
          data = generatePerformanceReport();
          break;
        default:
          data = generateOverviewReport();
      }

      setReportData(data);
      setLoading(false);
    }, 500);
  };

  const generateOverviewReport = () => {
    const filteredIncidents = incidents.filter(incident => {
      const incidentDate = new Date(incident.reportedAt);
      return incidentDate >= new Date(startDate) && incidentDate <= new Date(endDate);
    });

    const filteredHandovers = handovers.filter(handover => {
      const handoverDate = new Date(handover.datum);
      return handoverDate >= new Date(startDate) && handoverDate <= new Date(endDate);
    });

    const presentResidents = residents.filter(r => r.status === 'Aanwezig').length;
    const totalResidents = residents.length;
    const occupancyRate = totalResidents > 0 ? (presentResidents / totalResidents) * 100 : 0;

    return {
      title: 'Algemeen Overzicht',
      period: `${new Date(startDate).toLocaleDateString('nl-NL')} - ${new Date(endDate).toLocaleDateString('nl-NL')}`,
      summary: {
        totalResidents,
        presentResidents,
        occupancyRate: occupancyRate.toFixed(1),
        totalIncidents: filteredIncidents.length,
        totalHandovers: filteredHandovers.length,
        completedHandovers: filteredHandovers.filter(h => h.completed).length
      },
      kpis: [
        {
          label: 'Bezettingsgraad',
          value: `${occupancyRate.toFixed(1)}%`,
          trend: 'stable',
          color: occupancyRate > 90 ? 'red' : occupancyRate > 75 ? 'yellow' : 'green'
        },
        {
          label: 'Incident Rate',
          value: totalResidents > 0 ? (filteredIncidents.length / totalResidents).toFixed(2) : '0',
          trend: 'decreasing',
          color: 'green'
        },
        {
          label: 'Overdracht Kwaliteit',
          value: `${filteredHandovers.length > 0 ? ((filteredHandovers.filter(h => h.completed).length / filteredHandovers.length) * 100).toFixed(1) : 0}%`,
          trend: 'increasing',
          color: 'green'
        },
        {
          label: 'Operationele Efficiëntie',
          value: '87%',
          trend: 'stable',
          color: 'yellow'
        }
      ],
      charts: {
        incidentsByDay: generateIncidentsByDay(filteredIncidents),
        residentsByStatus: generateResidentsByStatus(),
        handoverCompletion: generateHandoverCompletion(filteredHandovers)
      }
    };
  };

  const generateResidentsReport = () => {
    const nationalityStats = residents.reduce((acc, resident) => {
      acc[resident.nationality] = (acc[resident.nationality] || 0) + 1;
      return acc;
    }, {});

    const priorityStats = residents.reduce((acc, resident) => {
      acc[resident.priority] = (acc[resident.priority] || 0) + 1;
      return acc;
    }, {});

    const statusStats = residents.reduce((acc, resident) => {
      acc[resident.status] = (acc[resident.status] || 0) + 1;
      return acc;
    }, {});

    return {
      title: 'Bewoners Analyse',
      period: `Actuele status per ${new Date().toLocaleDateString('nl-NL')}`,
      summary: {
        total: residents.length,
        present: residents.filter(r => r.status === 'Aanwezig').length,
        onLeave: residents.filter(r => r.status === 'Op verlof').length,
        absent: residents.filter(r => r.status === 'Afwezig').length,
        highPriority: residents.filter(r => r.priority === 'High').length
      },
      demographics: {
        nationalities: nationalityStats,
        priorities: priorityStats,
        statuses: statusStats
      },
      insights: [
        `${residents.filter(r => r.priority === 'High').length} bewoners hebben hoge prioriteit`,
        `${Object.keys(nationalityStats).length} verschillende nationaliteiten`,
        `Gemiddeld ${residents.filter(r => r.medicalInfo?.medications?.length > 0).length} bewoners met medicatie`
      ]
    };
  };

  const generateIncidentsReport = () => {
    const filteredIncidents = incidents.filter(incident => {
      const incidentDate = new Date(incident.reportedAt);
      return incidentDate >= new Date(startDate) && incidentDate <= new Date(endDate);
    });

    const typeStats = filteredIncidents.reduce((acc, incident) => {
      acc[incident.type] = (acc[incident.type] || 0) + 1;
      return acc;
    }, {});

    const priorityStats = filteredIncidents.reduce((acc, incident) => {
      acc[incident.priority] = (acc[incident.priority] || 0) + 1;
      return acc;
    }, {});

    const statusStats = filteredIncidents.reduce((acc, incident) => {
      acc[incident.status] = (acc[incident.status] || 0) + 1;
      return acc;
    }, {});

    return {
      title: 'Incidenten Analyse',
      period: `${new Date(startDate).toLocaleDateString('nl-NL')} - ${new Date(endDate).toLocaleDateString('nl-NL')}`,
      summary: {
        total: filteredIncidents.length,
        open: filteredIncidents.filter(i => i.status === 'open').length,
        resolved: filteredIncidents.filter(i => i.status === 'resolved').length,
        critical: filteredIncidents.filter(i => i.priority === 'critical').length,
        high: filteredIncidents.filter(i => i.priority === 'high').length
      },
      breakdown: {
        types: typeStats,
        priorities: priorityStats,
        statuses: statusStats
      },
      trends: generateIncidentTrends(filteredIncidents),
      topIncidents: filteredIncidents
        .filter(i => i.priority === 'critical' || i.priority === 'high')
        .slice(0, 5)
    };
  };

  const generateHandoversReport = () => {
    const filteredHandovers = handovers.filter(handover => {
      const handoverDate = new Date(handover.datum);
      return handoverDate >= new Date(startDate) && handoverDate <= new Date(endDate);
    });

    const shiftStats = filteredHandovers.reduce((acc, handover) => {
      acc[handover.shift] = (acc[handover.shift] || 0) + 1;
      return acc;
    }, {});

    const completionStats = {
      completed: filteredHandovers.filter(h => h.completed).length,
      pending: filteredHandovers.filter(h => !h.completed).length
    };

    const avgProgress = filteredHandovers.length > 0
      ? Math.round(filteredHandovers.reduce((sum, h) => sum + (h.progress || 0), 0) / filteredHandovers.length)
      : 0;

    return {
      title: 'Overdrachten Analyse',
      period: `${new Date(startDate).toLocaleDateString('nl-NL')} - ${new Date(endDate).toLocaleDateString('nl-NL')}`,
      summary: {
        total: filteredHandovers.length,
        completed: completionStats.completed,
        pending: completionStats.pending,
        avgProgress: avgProgress,
        completionRate: filteredHandovers.length > 0 
          ? ((completionStats.completed / filteredHandovers.length) * 100).toFixed(1)
          : 0
      },
      breakdown: {
        shifts: shiftStats,
        completion: completionStats
      },
      qualityMetrics: {
        avgProgress: avgProgress,
        onTimeCompletion: Math.floor(Math.random() * 20 + 75), // Simulated
        thoroughness: Math.floor(Math.random() * 15 + 80) // Simulated
      },
      recentHandovers: filteredHandovers.slice(0, 5)
    };
  };

  const generatePerformanceReport = () => {
    const totalResidents = residents.length;
    const totalIncidents = incidents.length;
    const totalHandovers = handovers.length;

    return {
      title: 'Performance Dashboard',
      period: `${new Date(startDate).toLocaleDateString('nl-NL')} - ${new Date(endDate).toLocaleDateString('nl-NL')}`,
      kpis: [
        {
          label: 'Operationele Efficiëntie',
          value: '87%',
          target: '90%',
          trend: 'increasing',
          color: 'yellow'
        },
        {
          label: 'Bewoner Tevredenheid',
          value: '4.2/5',
          target: '4.5/5',
          trend: 'stable',
          color: 'green'
        },
        {
          label: 'Incident Response Tijd',
          value: '< 2u',
          target: '< 1u',
          trend: 'improving',
          color: 'yellow'
        },
        {
          label: 'Documentatie Kwaliteit',
          value: '92%',
          target: '95%',
          trend: 'increasing',
          color: 'green'
        }
      ],
      goals: [
        { name: 'Bezettingsgraad optimaliseren', progress: 85, target: 90 },
        { name: 'Incident preventie verbeteren', progress: 78, target: 85 },
        { name: 'Overdracht kwaliteit verhogen', progress: 92, target: 95 },
        { name: 'Bewoner tevredenheid verhogen', progress: 84, target: 90 }
      ],
      recommendations: [
        'Implementeer preventieve maatregelen voor veelvoorkomende incidenten',
        'Verbeter overdracht training voor nieuwe medewerkers',
        'Organiseer regelmatige feedback sessies met bewoners',
        'Optimaliseer roosters voor betere werk-leven balans'
      ]
    };
  };

  const generateIncidentsByDay = (incidents) => {
    const dailyIncidents = {};
    incidents.forEach(incident => {
      const date = new Date(incident.reportedAt).toLocaleDateString('nl-NL');
      dailyIncidents[date] = (dailyIncidents[date] || 0) + 1;
    });
    return dailyIncidents;
  };

  const generateResidentsByStatus = () => {
    return residents.reduce((acc, resident) => {
      acc[resident.status] = (acc[resident.status] || 0) + 1;
      return acc;
    }, {});
  };

  const generateHandoverCompletion = (handovers) => {
    return {
      completed: handovers.filter(h => h.completed).length,
      pending: handovers.filter(h => !h.completed).length
    };
  };

  const generateIncidentTrends = (incidents) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('nl-NL');
      const count = incidents.filter(incident => 
        new Date(incident.reportedAt).toLocaleDateString('nl-NL') === dateStr
      ).length;
      last7Days.push({ date: dateStr, count });
    }
    return last7Days;
  };

  const renderOverviewReport = (data) => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.kpis.map((kpi, index) => (
          <div key={index} className={`bg-white border rounded-lg p-4 ${
            kpi.color === 'red' ? 'border-red-200' :
            kpi.color === 'yellow' ? 'border-yellow-200' :
            'border-green-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
              </div>
              <div className={`p-2 rounded-lg ${
                kpi.color === 'red' ? 'bg-red-100' :
                kpi.color === 'yellow' ? 'bg-yellow-100' :
                'bg-green-100'
              }`}>
                {kpi.trend === 'increasing' ? <TrendingUp className="w-6 h-6 text-green-600" /> :
                 kpi.trend === 'decreasing' ? <TrendingUp className="w-6 h-6 text-red-600 transform rotate-180" /> :
                 <Activity className="w-6 h-6 text-yellow-600" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Periode Samenvatting</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Bewoners</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Totaal bewoners:</span>
                <span className="font-medium">{data.summary.totalResidents}</span>
              </div>
              <div className="flex justify-between">
                <span>Aanwezig:</span>
                <span className="font-medium text-green-600">{data.summary.presentResidents}</span>
              </div>
              <div className="flex justify-between">
                <span>Bezettingsgraad:</span>
                <span className="font-medium">{data.summary.occupancyRate}%</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Incidenten</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Totaal incidenten:</span>
                <span className="font-medium">{data.summary.totalIncidents}</span>
              </div>
              <div className="flex justify-between">
                <span>Incident rate:</span>
                <span className="font-medium">{data.kpis[1].value} per bewoner</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Overdrachten</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Totaal overdrachten:</span>
                <span className="font-medium">{data.summary.totalHandovers}</span>
              </div>
              <div className="flex justify-between">
                <span>Afgerond:</span>
                <span className="font-medium text-green-600">{data.summary.completedHandovers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResidentsReport = (data) => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-600">Totaal</p>
              <p className="text-2xl font-bold text-blue-900">{data.summary.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-600">Aanwezig</p>
              <p className="text-2xl font-bold text-green-900">{data.summary.present}</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-yellow-600">Op Verlof</p>
              <p className="text-2xl font-bold text-yellow-900">{data.summary.onLeave}</p>
            </div>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-gray-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">Afwezig</p>
              <p className="text-2xl font-bold text-gray-900">{data.summary.absent}</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-red-600">Hoge Prioriteit</p>
              <p className="text-2xl font-bold text-red-900">{data.summary.highPriority}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Nationaliteiten</h3>
          <div className="space-y-2">
            {Object.entries(data.demographics.nationalities).map(([nationality, count]) => (
              <div key={nationality} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{nationality}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Status Verdeling</h3>
          <div className="space-y-2">
            {Object.entries(data.demographics.statuses).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{status}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Prioriteit Levels</h3>
          <div className="space-y-2">
            {Object.entries(data.demographics.priorities).map(([priority, count]) => (
              <div key={priority} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{priority}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Inzichten</h3>
        <ul className="space-y-2">
          {data.insights.map((insight, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span className="text-gray-700">{insight}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  const renderIncidentsReport = (data) => (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-600">Totaal</p>
              <p className="text-2xl font-bold text-blue-900">{data.summary.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-red-600">Open</p>
              <p className="text-2xl font-bold text-red-900">{data.summary.open}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-600">Opgelost</p>
              <p className="text-2xl font-bold text-green-900">{data.summary.resolved}</p>
            </div>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-red-600">Kritiek</p>
              <p className="text-2xl font-bold text-red-900">{data.summary.critical}</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-orange-600">Hoog</p>
              <p className="text-2xl font-bold text-orange-900">{data.summary.high}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Incident Types</h3>
          <div className="space-y-2">
            {Object.entries(data.breakdown.types).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{type}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Prioriteiten</h3>
          <div className="space-y-2">
            {Object.entries(data.breakdown.priorities).map(([priority, count]) => (
              <div key={priority} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{priority}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Status Verdeling</h3>
          <div className="space-y-2">
            {Object.entries(data.breakdown.statuses).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{status}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Incidents */}
      {data.topIncidents.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Hoge Prioriteit Incidenten</h3>
          <div className="space-y-3">
            {data.topIncidents.map((incident, index) => (
              <div key={index} className="border border-gray-200 rounded p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{incident.title}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    incident.priority === 'critical' ? 'bg-red-100 text-red-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {incident.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{incident.description?.substring(0, 100)}...</p>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>{incident.type}</span>
                  <span>{new Date(incident.reportedAt).toLocaleDateString('nl-NL')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderPerformanceReport = (data) => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.kpis.map((kpi, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900">{kpi.label}</h4>
              <Target className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">{kpi.value}</span>
                <span className="text-sm text-gray-500">Target: {kpi.target}</span>
              </div>
              <div className="flex items-center">
                {kpi.trend === 'increasing' && <TrendingUp className="w-4 h-4 text-green-500 mr-1" />}
                {kpi.trend === 'stable' && <Activity className="w-4 h-4 text-yellow-500 mr-1" />}
                <span className="text-xs text-gray-500 capitalize">{kpi.trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Goals Progress */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Doelstellingen Voortgang</h3>
        <div className="space-y-4">
          {data.goals.map((goal, index) => (
            <div key={index}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">{goal.name}</span>
                <span className="text-sm text-gray-500">{goal.progress}% / {goal.target}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    goal.progress >= goal.target ? 'bg-green-500' :
                    goal.progress >= goal.target * 0.8 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(goal.progress, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Aanbevelingen</h3>
        <ul className="space-y-3">
          {data.recommendations.map((recommendation, index) => (
            <li key={index} className="flex items-start">
              <Award className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
              <span className="text-gray-700">{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  // Render incident redirect message
  const renderIncidentRedirect = (data) => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
      <AlertTriangle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-blue-900 mb-2">Incident Analyses</h3>
      <p className="text-blue-800 mb-4">
        Voor uitgebreide incident analyses, trends en rapportage gebruik je het dedicatie Incident Management systeem.
      </p>
      <div className="space-y-2 text-sm text-blue-700 mb-6">
        <p>✓ Real-time incident tracking</p>
        <p>✓ Gedetailleerde statistieken en trends</p>
        <p>✓ Status management en workflow</p>
        <p>✓ Export en rapportage functionaliteit</p>
      </div>
      <button 
        onClick={() => {
          // In real app, navigate to incident manager
          alert('Navigeren naar Incident Management systeem...');
        }}
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Ga naar Incident Management
      </button>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <BarChart className="w-8 h-8 mr-3 text-blue-600" />
              Rapportage & Analytics
            </h1>
            <p className="text-gray-600 mt-1">Inzicht in operationele prestaties en trends</p>
          </div>
          
          <button
            onClick={() => {
              generateReport();
              addNotification({
                type: 'info',
                message: 'Rapport vernieuwd',
                timestamp: new Date().toISOString()
              });
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Vernieuwen
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rapport Type</label>
            <select
              value={reportType}
              onChange={e => setReportType(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="overview">Algemeen Overzicht</option>
              <option value="residents">Bewoners Analyse</option>
              <option value="incidents" disabled>Incidenten (Zie Incident Management)</option>
              <option value="handovers">Overdrachten Analyse</option>
              <option value="performance">Performance Dashboard</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Van Datum</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tot Datum</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={generateReport}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <BarChart className="w-4 h-4 mr-2" />
                  Genereren
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mr-3" />
          <span className="text-gray-600">Rapport wordt gegenereerd...</span>
        </div>
      ) : reportData ? (
        <div>
          {/* Report Header */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{reportData.title}</h2>
                <p className="text-gray-600">{reportData.period}</p>
              </div>
              <div className="text-right text-sm text-gray-500">
                <p>Gegenereerd op: {new Date().toLocaleString('nl-NL')}</p>
                <p>Door: {currentUser?.name || 'Onbekend'}</p>
              </div>
            </div>
          </div>

          {/* Report Content */}
          {reportType === 'overview' && renderOverviewReport(reportData)}
          {reportType === 'residents' && renderResidentsReport(reportData)}
          {reportType === 'incidents' && renderIncidentRedirect(reportData)}
          {reportType === 'performance' && renderPerformanceReport(reportData)}
          {(reportType === 'handovers') && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <p className="text-gray-600">Overdrachten analyse wordt geladen...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg p-8 text-center">
          <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Selecteer een rapport type en datum om te beginnen</p>
        </div>
      )}
    </div>
  );
};

export default ShiftReport;