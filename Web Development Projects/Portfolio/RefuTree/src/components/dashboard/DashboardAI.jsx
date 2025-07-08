import React, { useState, useEffect } from 'react';
import { 
  Brain, Lightbulb, TrendingUp, AlertTriangle, CheckCircle, 
  Clock, Users, FileText, Heart, School, Home, Zap,
  ChevronRight, ChevronDown, Sparkles, Target, BarChart3
} from 'lucide-react';

const DashboardAI = ({ residents, locationType }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [insights, setInsights] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (residents && residents.length > 0) {
      setIsProcessing(true);
      
      // Simulate AI processing
      setTimeout(() => {
        generateInsights();
        setIsProcessing(false);
      }, 800);
    }
  }, [residents]);

  const generateInsights = () => {
    const newInsights = [];
    const newSuggestions = [];
    const newAlerts = [];

    // Occupancy insights
    const occupancyRate = Math.round((residents.filter(r => r.attendance === 'Aanwezig').length / residents.length) * 100);
    if (occupancyRate < 70) {
      newInsights.push({
        type: 'info',
        icon: '📊',
        title: 'Lage Bezetting',
        message: `Bezetting is ${occupancyRate}% - ruimte voor nieuwe bewoners`,
        action: 'review_capacity'
      });
    } else if (occupancyRate > 95) {
      newInsights.push({
        type: 'warning',
        icon: '🏠',
        title: 'Hoge Bezetting',
        message: `Bezetting is ${occupancyRate}% - overweeg uitbreiding`,
        action: 'plan_expansion'
      });
    }

    // Medical insights
    const medicalNeeds = residents.filter(r => r.medicalInfo?.medications?.length > 0).length;
    if (medicalNeeds > 0) {
      newInsights.push({
        type: 'medical',
        icon: '💊',
        title: 'Medische Aandacht',
        message: `${medicalNeeds} bewoners hebben medicatie`,
        action: 'schedule_medical_review'
      });
    }

    // Document insights
    const expiringDocs = residents.filter(r => 
      r.documents?.some(d => {
        if (!d.expiryDate) return false;
        const daysUntilExpiry = (new Date(d.expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
        return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
      })
    ).length;

    if (expiringDocs > 0) {
      newAlerts.push({
        type: 'urgent',
        icon: '📄',
        title: 'Documenten Verlopen Binnenkort',
        message: `${expiringDocs} documenten verlopen binnen 30 dagen`,
        action: 'review_documents'
      });
    }

    // Integration insights
    const lowIntegration = residents.filter(r => (r.integrationScore || 0) < 50).length;
    const highIntegration = residents.filter(r => (r.integrationScore || 0) >= 80).length;

    if (lowIntegration > highIntegration) {
      newInsights.push({
        type: 'help',
        icon: '🎓',
        title: 'Integratie Hulp Nodig',
        message: `${lowIntegration} bewoners hebben lage integratie scores`,
        action: 'start_integration_support'
      });
    }

    // Smart suggestions
    const unlabeledResidents = residents.filter(r => !r.labels || r.labels.length === 0);
    if (unlabeledResidents.length > 0) {
      newSuggestions.push({
        type: 'auto_label',
        title: 'Automatische Labels',
        description: `${unlabeledResidents.length} bewoners zonder labels`,
        action: 'apply_suggested_labels',
        priority: 'medium'
      });
    }

    const highPriorityResidents = residents.filter(r => r.priority === 'High');
    if (highPriorityResidents.length > 0) {
      newSuggestions.push({
        type: 'meeting_schedule',
        title: 'Prioriteit Gesprekken',
        description: `${highPriorityResidents.length} bewoners met hoge prioriteit`,
        action: 'schedule_priority_meetings',
        priority: 'high'
      });
    }

    setInsights(newInsights);
    setSuggestions(newSuggestions);
    setAlerts(newAlerts);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'urgent': return 'text-red-600 bg-red-50 border-red-200';
      case 'warning': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'medical': return 'text-purple-600 bg-purple-50 border-purple-200';
      case 'help': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (residents.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
      {/* Header */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">AI Intelligence</h3>
              <p className="text-sm text-gray-600">Slimme inzichten en suggesties</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isProcessing && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span>Analyseren...</span>
              </div>
            )}
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t bg-gray-50">
          {/* Alerts */}
          {alerts.length > 0 && (
            <div className="p-4 border-b">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Urgente Meldingen
              </h4>
              <div className="space-y-2">
                {alerts.map((alert, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${getTypeColor(alert.type)}`}>
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{alert.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{alert.title}</p>
                        <p className="text-xs opacity-80">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Insights */}
          {insights.length > 0 && (
            <div className="p-4 border-b">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                Slimme Inzichten
              </h4>
              <div className="space-y-2">
                {insights.map((insight, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${getTypeColor(insight.type)}`}>
                    <div className="flex items-start gap-2">
                      <span className="text-lg">{insight.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{insight.title}</p>
                        <p className="text-xs opacity-80">{insight.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-500" />
                Automatisering Suggesties
              </h4>
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${getPriorityColor(suggestion.priority)}`}>
                    <div className="flex items-start gap-2">
                      <Zap className="w-4 h-4 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{suggestion.title}</p>
                        <p className="text-xs opacity-80">{suggestion.description}</p>
                      </div>
                      <button className="text-xs px-2 py-1 rounded bg-white border hover:bg-gray-50 transition-colors">
                        Uitvoeren
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {alerts.length === 0 && insights.length === 0 && suggestions.length === 0 && (
            <div className="p-8 text-center">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Geen AI inzichten beschikbaar</p>
              <p className="text-sm text-gray-400">AI analyseert je data voor slimme suggesties</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardAI; 