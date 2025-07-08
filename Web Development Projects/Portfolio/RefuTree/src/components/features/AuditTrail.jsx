import React, { useState, useEffect } from 'react';
import { FileText, User, Calendar, Filter, Download, Search, X } from 'lucide-react';

const AuditTrail = ({ isOpen, onClose }) => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filters, setFilters] = useState({
    user: '',
    action: '',
    entity: '',
    dateFrom: '',
    dateTo: ''
  });

  // Load audit logs from localStorage
  useEffect(() => {
    const savedLogs = localStorage.getItem('vms_audit_logs');
    if (savedLogs) {
      const logs = JSON.parse(savedLogs);
      setAuditLogs(logs);
      setFilteredLogs(logs);
    }
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = auditLogs;

    if (filters.user) {
      filtered = filtered.filter(log => 
        log.userName.toLowerCase().includes(filters.user.toLowerCase())
      );
    }

    if (filters.action) {
      filtered = filtered.filter(log => 
        log.actionType.toLowerCase().includes(filters.action.toLowerCase())
      );
    }

    if (filters.entity) {
      filtered = filtered.filter(log => 
        log.entity.toLowerCase().includes(filters.entity.toLowerCase())
      );
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) >= new Date(filters.dateFrom)
      );
    }

    if (filters.dateTo) {
      filtered = filtered.filter(log => 
        new Date(log.timestamp) <= new Date(filters.dateTo + 'T23:59:59')
      );
    }

    setFilteredLogs(filtered);
  }, [auditLogs, filters]);

  const getActionIcon = (actionType) => {
    switch (actionType.toLowerCase()) {
      case 'create': return '➕';
      case 'update': return '✏️';
      case 'delete': return '🗑️';
      case 'warning': return '⚠️';
      case 'incident': return '🚨';
      default: return '📝';
    }
  };

  const getActionColor = (actionType) => {
    switch (actionType.toLowerCase()) {
      case 'create': return 'text-green-600 bg-green-50';
      case 'update': return 'text-blue-600 bg-blue-50';
      case 'delete': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-orange-600 bg-orange-50';
      case 'incident': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportLogs = () => {
    const csvContent = [
      ['Datum', 'Gebruiker', 'Actie', 'Entiteit', 'Details', 'IP Adres'],
      ...filteredLogs.map(log => [
        formatTimestamp(log.timestamp),
        log.userName,
        log.actionType,
        log.entity,
        log.details,
        log.ipAddress || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_log_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const clearFilters = () => {
    setFilters({
      user: '',
      action: '',
      entity: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Audit Trail</h2>
            <span className="text-sm text-gray-500">
              ({filteredLogs.length} acties)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportLogs}
              className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gebruiker
              </label>
              <input
                type="text"
                value={filters.user}
                onChange={(e) => setFilters({...filters, user: e.target.value})}
                placeholder="Zoek gebruiker..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Actie
              </label>
              <input
                type="text"
                value={filters.action}
                onChange={(e) => setFilters({...filters, action: e.target.value})}
                placeholder="Zoek actie..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Entiteit
              </label>
              <input
                type="text"
                value={filters.entity}
                onChange={(e) => setFilters({...filters, entity: e.target.value})}
                placeholder="Zoek entiteit..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Van datum
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tot datum
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Filters wissen
            </button>
          </div>
        </div>

        {/* Logs */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Geen audit logs gevonden</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLogs.map((log, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getActionColor(log.actionType)}`}>
                        {getActionIcon(log.actionType)}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-gray-900">{log.userName}</span>
                        <span className="text-gray-400">•</span>
                        <span className={`text-sm px-2 py-1 rounded-full ${getActionColor(log.actionType)}`}>
                          {log.actionType}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{log.entity}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-2">{log.details}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatTimestamp(log.timestamp)}
                        </span>
                        {log.ipAddress && (
                          <span>IP: {log.ipAddress}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTrail; 