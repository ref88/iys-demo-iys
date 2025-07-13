import React, { useState } from 'react';
import {
  Download,
  Upload,
  FileText,
  Users,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Database,
  RefreshCw,
  Trash2,
  Loader,
  BarChart,
  Clock,
} from 'lucide-react';
import jsPDF from 'jspdf';
import DataService from '../../utils/dataService.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { useNotification } from '../../contexts/NotificationContext.jsx';

const DataExport = () => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotification();

  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [exportStatus, setExportStatus] = useState(null);
  const [activeTab, setActiveTab] = useState('data');
  const [selectedReport, setSelectedReport] = useState('residents');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  const exportData = async () => {
    setIsExporting(true);
    setExportStatus(null);

    try {
      // Use DataService to export all data
      const data = DataService.exportAllData();

      // Create and download file
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vms-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setExportStatus({
        type: 'success',
        message: 'Data succesvol geëxporteerd!',
      });

      addNotification({
        type: 'success',
        message: 'Data backup succesvol gedownload',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Export error:', error);
      setExportStatus({
        type: 'error',
        message: `Fout bij exporteren: ${error.message}`,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const importData = async (event) => {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    setIsImporting(true);
    setImportStatus(null);

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Validate data structure
      if (!data.version || !data.exportDate) {
        throw new Error('Ongeldig export bestand');
      }

      // Import data with confirmation
      if (
        // eslint-disable-next-line no-alert
        window.confirm(
          'Weet je zeker dat je de data wilt importeren?\n\n' +
            'Dit zal alle huidige data vervangen.\n' +
            `Export datum: ${new Date(data.exportDate).toLocaleString('nl-NL')}\n` +
            `Bewoners: ${data.residents?.length || 0}\n` +
            `Verlofaanvragen: ${data.leaveRequests?.length || 0}\n` +
            `Documenten: ${data.documents?.length || 0}\n` +
            `Notificaties: ${data.notifications?.length || 0}`
        )
      ) {
        // Use DataService to import data
        const success = DataService.importData(data);

        if (success) {
          setImportStatus({
            type: 'success',
            message: `Data succesvol geïmporteerd! ${data.residents?.length || 0} bewoners, ${data.leaveRequests?.length || 0} verlofaanvragen, ${data.documents?.length || 0} documenten.`,
          });

          addNotification({
            type: 'success',
            message: 'Data succesvol geïmporteerd',
            timestamp: new Date().toISOString(),
          });

          // Reload page to reflect changes
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          throw new Error('Fout bij importeren van data');
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Import error:', error);
      setImportStatus({
        type: 'error',
        message: `Fout bij importeren: ${error.message}`,
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const generatePDFReport = async (reportType) => {
    try {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(18);
      doc.setTextColor(44, 82, 130);
      doc.text('RefuTree VMS - Management Rapport', 10, 15);

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`Rapport Type: ${getReportTypeLabel(reportType)}`, 10, 25);
      doc.text(
        `Gegenereerd op: ${new Date().toLocaleDateString('nl-NL')}`,
        10,
        32
      );
      doc.text(`Door: ${currentUser?.name || 'Onbekend'}`, 10, 39);
      doc.text(
        `Periode: ${new Date(dateRange.start).toLocaleDateString('nl-NL')} - ${new Date(dateRange.end).toLocaleDateString('nl-NL')}`,
        10,
        46
      );

      // Line separator
      doc.line(10, 50, 200, 50);

      let y = 60;

      switch (reportType) {
        case 'residents':
          y = await generateResidentsReport(doc, y);
          break;
        case 'incidents':
          // Incidents are now managed in the dedicated IncidentManager
          doc.text(
            'Incidents worden beheerd in het Incident Management systeem.',
            20,
            y
          );
          y += 10;
          break;
        case 'handovers':
          y = await generateHandoversReport(doc, y);
          break;
        case 'analytics':
          y = await generateAnalyticsReport(doc, y);
          break;
      }

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `Pagina ${i} van ${pageCount} - RefuTree VMS Management Rapport`,
          10,
          287
        );
        doc.text('Vertrouwelijk - Alleen voor intern gebruik', 150, 287);
      }

      const fileName = `${reportType}-rapport-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      addNotification({
        type: 'success',
        message: `${getReportTypeLabel(reportType)} rapport gedownload`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('PDF generation error:', error);
      addNotification({
        type: 'error',
        message: 'Fout bij genereren PDF rapport',
        timestamp: new Date().toISOString(),
      });
    }
  };

  const generateResidentsReport = async (doc, startY) => {
    const residents = DataService.getResidents() || [];
    let y = startY;

    // Section header
    doc.setFontSize(14);
    doc.text('BEWONERS OVERZICHT', 10, y);
    y += 10;

    // Statistics
    doc.setFontSize(12);
    const totalResidents = residents.length;
    const presentResidents = residents.filter(
      (r) => r.status === 'Aanwezig'
    ).length;
    const onLeave = residents.filter((r) => r.status === 'Op verlof').length;
    const absent = residents.filter((r) => r.status === 'Afwezig').length;
    const highPriority = residents.filter((r) => r.priority === 'High').length;

    doc.text('STATISTIEKEN', 10, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Totaal bewoners: ${totalResidents}`, 15, y);
    y += 6;
    doc.text(`Aanwezig: ${presentResidents}`, 15, y);
    y += 6;
    doc.text(`Op verlof: ${onLeave}`, 15, y);
    y += 6;
    doc.text(`Afwezig: ${absent}`, 15, y);
    y += 6;
    doc.text(`Hoge prioriteit: ${highPriority}`, 15, y);
    y += 10;

    // Nationality breakdown
    const nationalityStats = residents.reduce((acc, resident) => {
      acc[resident.nationality] = (acc[resident.nationality] || 0) + 1;
      return acc;
    }, {});

    doc.setFontSize(12);
    doc.text('NATIONALITEITEN', 10, y);
    y += 8;
    doc.setFontSize(10);
    Object.entries(nationalityStats).forEach(([nationality, count]) => {
      doc.text(`${nationality}: ${count}`, 15, y);
      y += 6;
    });
    y += 5;

    // High priority residents
    if (highPriority > 0) {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(12);
      doc.text('HOGE PRIORITEIT BEWONERS', 10, y);
      y += 8;
      doc.setFontSize(10);

      residents
        .filter((r) => r.priority === 'High')
        .forEach((resident) => {
          doc.text(
            `• ${resident.name} (${resident.nationality}) - ${resident.status}`,
            15,
            y
          );
          y += 6;
          if (resident.notes) {
            const noteLines = doc.splitTextToSize(
              `  Notities: ${resident.notes}`,
              170
            );
            noteLines.forEach((line) => {
              doc.text(line, 20, y);
              y += 5;
            });
          }
          y += 2;
        });
    }

    return y;
  };

  const generateHandoversReport = async (doc, startY) => {
    const handovers = DataService.getHandovers() || [];
    const filteredHandovers = handovers.filter((handover) => {
      const handoverDate = new Date(handover.datum);
      return (
        handoverDate >= new Date(dateRange.start) &&
        handoverDate <= new Date(dateRange.end)
      );
    });

    let y = startY;

    // Section header
    doc.setFontSize(14);
    doc.text('OVERDRACHTEN RAPPORT', 10, y);
    y += 10;

    // Statistics
    doc.setFontSize(12);
    const totalHandovers = filteredHandovers.length;
    const completedHandovers = filteredHandovers.filter(
      (h) => h.completed
    ).length;
    const avgProgress =
      filteredHandovers.length > 0
        ? Math.round(
            filteredHandovers.reduce((sum, h) => sum + (h.progress || 0), 0) /
              filteredHandovers.length
          )
        : 0;

    doc.text('STATISTIEKEN', 10, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Totaal overdrachten: ${totalHandovers}`, 15, y);
    y += 6;
    doc.text(`Afgeronde overdrachten: ${completedHandovers}`, 15, y);
    y += 6;
    doc.text(`Gemiddelde volledigheid: ${avgProgress}%`, 15, y);
    y += 10;

    // Shift distribution
    const shiftStats = filteredHandovers.reduce((acc, handover) => {
      acc[handover.shift] = (acc[handover.shift] || 0) + 1;
      return acc;
    }, {});

    doc.setFontSize(12);
    doc.text('DIENSTEN VERDELING', 10, y);
    y += 8;
    doc.setFontSize(10);
    Object.entries(shiftStats).forEach(([shift, count]) => {
      doc.text(`${shift}: ${count}`, 15, y);
      y += 6;
    });
    y += 10;

    // Recent handovers summary
    const recentHandovers = filteredHandovers.slice(0, 5);

    if (recentHandovers.length > 0) {
      if (y > 220) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(12);
      doc.text('RECENTE OVERDRACHTEN', 10, y);
      y += 8;
      doc.setFontSize(10);

      recentHandovers.forEach((handover) => {
        doc.text(`• ${handover.medewerker} - ${handover.shift}`, 15, y);
        y += 5;
        doc.text(
          `  ${new Date(handover.datum).toLocaleDateString('nl-NL')} (${handover.completed ? 'Afgerond' : 'In behandeling'})`,
          20,
          y
        );
        y += 5;
        if (handover.sfeerimpressie) {
          const moodLines = doc.splitTextToSize(
            `  Sfeer: ${handover.sfeerimpressie.substring(0, 80)}...`,
            170
          );
          moodLines.forEach((line) => {
            doc.text(line, 20, y);
            y += 4;
          });
        }
        y += 3;
      });
    }

    return y;
  };

  const generateAnalyticsReport = async (doc, startY) => {
    const residents = DataService.getResidents() || [];
    const incidents = DataService.getIncidents() || [];
    const handovers = DataService.getHandovers() || [];

    let y = startY;

    // Section header
    doc.setFontSize(14);
    doc.text('ANALYTICS & TRENDS', 10, y);
    y += 10;

    // Key Performance Indicators
    doc.setFontSize(12);
    doc.text('KEY PERFORMANCE INDICATORS', 10, y);
    y += 8;
    doc.setFontSize(10);

    const occupancyRate =
      (residents.filter((r) => r.status === 'Aanwezig').length /
        Math.max(residents.length, 1)) *
      100;
    const incidentRate = incidents.length / Math.max(residents.length, 1);
    const handoverCompletionRate =
      (handovers.filter((h) => h.completed).length /
        Math.max(handovers.length, 1)) *
      100;

    doc.text(`Bezettingsgraad: ${occupancyRate.toFixed(1)}%`, 15, y);
    y += 6;
    doc.text(`Incidenten per bewoner: ${incidentRate.toFixed(2)}`, 15, y);
    y += 6;
    doc.text(
      `Overdracht afronding: ${handoverCompletionRate.toFixed(1)}%`,
      15,
      y
    );
    y += 10;

    // Trends (simplified)
    doc.setFontSize(12);
    doc.text('TRENDS & OBSERVATIES', 10, y);
    y += 8;
    doc.setFontSize(10);

    const highPriorityPercentage =
      (residents.filter((r) => r.priority === 'High').length /
        Math.max(residents.length, 1)) *
      100;
    const criticalIncidentPercentage =
      (incidents.filter((i) => i.priority === 'critical').length /
        Math.max(incidents.length, 1)) *
      100;

    doc.text(
      `• ${highPriorityPercentage.toFixed(1)}% van bewoners heeft hoge prioriteit`,
      15,
      y
    );
    y += 6;
    doc.text(
      `• ${criticalIncidentPercentage.toFixed(1)}% van incidenten is kritiek`,
      15,
      y
    );
    y += 6;

    if (incidents.length > 0) {
      const avgResponseTime = '< 24 uur'; // Simplified
      doc.text(`• Gemiddelde incident responstijd: ${avgResponseTime}`, 15, y);
      y += 6;
    }

    y += 10;

    // Recommendations
    doc.setFontSize(12);
    doc.text('AANBEVELINGEN', 10, y);
    y += 8;
    doc.setFontSize(10);

    const recommendations = [];

    if (highPriorityPercentage > 30) {
      recommendations.push(
        'Hoog percentage hoge prioriteit bewoners - extra aandacht vereist'
      );
    }

    if (criticalIncidentPercentage > 20) {
      recommendations.push(
        'Veel kritieke incidenten - preventieve maatregelen overwegen'
      );
    }

    if (handoverCompletionRate < 80) {
      recommendations.push(
        'Overdracht completion rate laag - training overwegen'
      );
    }

    if (occupancyRate > 95) {
      recommendations.push(
        'Zeer hoge bezetting - capaciteit uitbreiding overwegen'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'Geen specifieke aanbevelingen - systeem functioneert goed'
      );
    }

    recommendations.forEach((rec) => {
      doc.text(`• ${rec}`, 15, y);
      y += 7;
    });

    return y;
  };

  const getReportTypeLabel = (type) => {
    const labels = {
      residents: 'Bewoners Overzicht',
      incidents: 'Incidenten Analyse',
      handovers: 'Overdrachten Rapport',
      analytics: 'Analytics & Trends',
    };
    return labels[type] || type;
  };

  const clearAllData = () => {
    if (
      // eslint-disable-next-line no-alert
      window.confirm(
        'WAARSCHUWING: Dit zal ALLE data permanent verwijderen!\n\n' +
          'Dit omvat:\n' +
          '• Alle bewoners gegevens\n' +
          '• Alle verlofaanvragen\n' +
          '• Alle documenten\n' +
          '• Alle notificaties\n' +
          '• Alle incidenten\n' +
          '• Alle overdrachten\n\n' +
          'Deze actie kan NIET ongedaan worden gemaakt!\n\n' +
          'Typ "VERWIJDER ALLES" om te bevestigen:'
      )
    ) {
      // eslint-disable-next-line no-alert
      const confirmation = prompt('Typ "VERWIJDER ALLES" om te bevestigen:');
      if (confirmation === 'VERWIJDER ALLES') {
        DataService.clearAllData();
        addNotification({
          type: 'warning',
          message: 'Alle data is verwijderd',
          timestamp: new Date().toISOString(),
        });
        setTimeout(() => window.location.reload(), 1000);
      }
    }
  };

  const renderDataTab = () => (
    <div className='space-y-6'>
      {/* Export Section */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h3 className='text-lg font-semibold flex items-center'>
              <Download className='w-5 h-5 mr-2 text-blue-600' />
              Data Export
            </h3>
            <p className='text-gray-600 text-sm'>
              Download een backup van alle systeem data
            </p>
          </div>
          <button
            onClick={exportData}
            disabled={isExporting}
            className='bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center'
          >
            {isExporting ? (
              <>
                <Loader className='w-4 h-4 mr-2 animate-spin' />
                Exporteren...
              </>
            ) : (
              <>
                <Download className='w-4 h-4 mr-2' />
                Data Exporteren
              </>
            )}
          </button>
        </div>

        {exportStatus && (
          <div
            className={`p-3 rounded-md ${
              exportStatus.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <div className='flex items-center'>
              {exportStatus.type === 'success' ? (
                <CheckCircle className='w-4 h-4 mr-2' />
              ) : (
                <AlertTriangle className='w-4 h-4 mr-2' />
              )}
              {exportStatus.message}
            </div>
          </div>
        )}

        <div className='mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm'>
          <div className='bg-blue-50 p-3 rounded border border-blue-200'>
            <div className='flex items-center'>
              <Users className='w-4 h-4 text-blue-600 mr-2' />
              <span className='font-medium'>Bewoners Data</span>
            </div>
          </div>
          <div className='bg-green-50 p-3 rounded border border-green-200'>
            <div className='flex items-center'>
              <Calendar className='w-4 h-4 text-green-600 mr-2' />
              <span className='font-medium'>Verlofaanvragen</span>
            </div>
          </div>
          <div className='bg-yellow-50 p-3 rounded border border-yellow-200'>
            <div className='flex items-center'>
              <FileText className='w-4 h-4 text-yellow-600 mr-2' />
              <span className='font-medium'>Documenten</span>
            </div>
          </div>
          <div className='bg-purple-50 p-3 rounded border border-purple-200'>
            <div className='flex items-center'>
              <Database className='w-4 h-4 text-purple-600 mr-2' />
              <span className='font-medium'>Systeemdata</span>
            </div>
          </div>
        </div>
      </div>

      {/* Import Section */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h3 className='text-lg font-semibold flex items-center'>
              <Upload className='w-5 h-5 mr-2 text-green-600' />
              Data Import
            </h3>
            <p className='text-gray-600 text-sm'>
              Herstel data vanuit een backup bestand
            </p>
          </div>
          <label className='bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 cursor-pointer flex items-center'>
            <Upload className='w-4 h-4 mr-2' />
            {isImporting ? 'Importeren...' : 'Bestand Selecteren'}
            <input
              type='file'
              accept='.json'
              onChange={importData}
              disabled={isImporting}
              className='hidden'
            />
          </label>
        </div>

        {importStatus && (
          <div
            className={`p-3 rounded-md ${
              importStatus.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            <div className='flex items-center'>
              {importStatus.type === 'success' ? (
                <CheckCircle className='w-4 h-4 mr-2' />
              ) : (
                <AlertTriangle className='w-4 h-4 mr-2' />
              )}
              {importStatus.message}
            </div>
          </div>
        )}

        <div className='mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
          <div className='flex items-start'>
            <AlertTriangle className='w-5 h-5 text-yellow-600 mr-2 mt-0.5' />
            <div>
              <p className='text-yellow-800 font-medium text-sm'>
                Waarschuwing
              </p>
              <p className='text-yellow-700 text-sm'>
                Het importeren van data zal alle huidige data vervangen. Zorg
                ervoor dat je een backup hebt gemaakt voordat je importeert.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div>
            <h3 className='text-lg font-semibold flex items-center'>
              <Database className='w-5 h-5 mr-2 text-gray-600' />
              Data Management
            </h3>
            <p className='text-gray-600 text-sm'>
              Beheer en onderhoud van systeem data
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <button
            onClick={() => {
              localStorage.removeItem('vms-cache');
              addNotification({
                type: 'info',
                message: 'Cache geleegd',
                timestamp: new Date().toISOString(),
              });
            }}
            className='flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors'
          >
            <RefreshCw className='w-4 h-4 mr-2' />
            Cache Legen
          </button>

          <button
            onClick={clearAllData}
            className='flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors'
          >
            <Trash2 className='w-4 h-4 mr-2' />
            Alle Data Verwijderen
          </button>
        </div>
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div className='space-y-6'>
      {/* Report Selection */}
      <div className='bg-white border border-gray-200 rounded-lg p-6'>
        <h3 className='text-lg font-semibold mb-4'>PDF Rapporten Genereren</h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
          <div>
            <label
              htmlFor='report-type'
              className='block text-sm font-medium text-gray-700 mb-2'
            >
              Rapport Type
            </label>
            <select
              id='report-type'
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
              className='w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            >
              <option value='residents'>Bewoners Overzicht</option>
              <option value='incidents' disabled>
                Incidenten (Zie Incident Management)
              </option>
              <option value='handovers'>Overdrachten Rapport</option>
              <option value='analytics'>Analytics & Trends</option>
            </select>
          </div>

          <div className='grid grid-cols-2 gap-2'>
            <div>
              <label
                htmlFor='date-start'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Van Datum
              </label>
              <input
                id='date-start'
                type='date'
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className='w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
            <div>
              <label
                htmlFor='date-end'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Tot Datum
              </label>
              <input
                id='date-end'
                type='date'
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className='w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => generatePDFReport(selectedReport)}
          className='bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center'
        >
          <FileText className='w-4 h-4 mr-2' />
          PDF Rapport Genereren
        </button>
      </div>

      {/* Quick Reports */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <div className='flex items-center mb-3'>
            <Users className='w-6 h-6 text-blue-600 mr-2' />
            <h4 className='font-medium'>Bewoners</h4>
          </div>
          <p className='text-sm text-gray-600 mb-3'>
            Compleet overzicht van alle bewoners, statistieken en statusupdates.
          </p>
          <button
            onClick={() => generatePDFReport('residents')}
            className='w-full bg-blue-50 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-100 transition-colors'
          >
            Genereer Rapport
          </button>
        </div>

        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <div className='flex items-center mb-3'>
            <AlertTriangle className='w-6 h-6 text-gray-400 mr-2' />
            <h4 className='font-medium text-gray-500'>Incidenten</h4>
          </div>
          <p className='text-sm text-gray-600 mb-3'>
            Voor incident rapportage gebruik het Incident Management systeem.
          </p>
          <button
            disabled
            className='w-full bg-gray-100 text-gray-500 px-3 py-2 rounded text-sm cursor-not-allowed'
          >
            Zie Incident Management
          </button>
        </div>

        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <div className='flex items-center mb-3'>
            <Clock className='w-6 h-6 text-green-600 mr-2' />
            <h4 className='font-medium'>Overdrachten</h4>
          </div>
          <p className='text-sm text-gray-600 mb-3'>
            Overzicht van dienst overdrachten en volledigheid.
          </p>
          <button
            onClick={() => generatePDFReport('handovers')}
            className='w-full bg-green-50 text-green-700 px-3 py-2 rounded text-sm hover:bg-green-100 transition-colors'
          >
            Genereer Rapport
          </button>
        </div>

        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <div className='flex items-center mb-3'>
            <BarChart className='w-6 h-6 text-purple-600 mr-2' />
            <h4 className='font-medium'>Analytics</h4>
          </div>
          <p className='text-sm text-gray-600 mb-3'>
            Trends, KPI's en management inzichten.
          </p>
          <button
            onClick={() => generatePDFReport('analytics')}
            className='w-full bg-purple-50 text-purple-700 px-3 py-2 rounded text-sm hover:bg-purple-100 transition-colors'
          >
            Genereer Rapport
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className='max-w-6xl mx-auto p-6'>
      {/* Header */}
      <div className='mb-6'>
        <h1 className='text-2xl font-bold text-gray-900 flex items-center'>
          <Database className='w-8 h-8 mr-3 text-blue-600' />
          Data Export & Rapporten
        </h1>
        <p className='text-gray-600 mt-1'>
          Beheer data export, import en genereer management rapporten
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className='border-b border-gray-200 mb-6'>
        <nav className='-mb-px flex space-x-8'>
          {[
            { id: 'data', label: 'Data Management', icon: Database },
            { id: 'reports', label: 'PDF Rapporten', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className='w-4 h-4 mr-2' />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'data' && renderDataTab()}
      {activeTab === 'reports' && renderReportsTab()}
    </div>
  );
};

export default DataExport;
