import React from 'react';
import { AlertTriangle, RefreshCw, Download, Upload } from 'lucide-react';
import ErrorBoundary from './ErrorBoundary.jsx';

const DataErrorFallback = ({
  error,
  onRetry,
  onResetData,
  onExportData,
  retryCount,
}) => {
  const isLocalStorageError =
    error?.message?.toLowerCase().includes('localstorage') ||
    error?.message?.toLowerCase().includes('quota') ||
    error?.message?.toLowerCase().includes('storage');

  const isDataParseError =
    error?.message?.toLowerCase().includes('json') ||
    error?.message?.toLowerCase().includes('parse') ||
    error?.message?.toLowerCase().includes('unexpected token');

  return (
    <div className='bg-white rounded-xl border border-red-200 p-6 m-4'>
      <div className='flex items-center gap-3 mb-4'>
        <div className='flex items-center justify-center w-10 h-10 bg-red-100 rounded-full'>
          <AlertTriangle className='w-5 h-5 text-red-600' />
        </div>
        <div>
          <h3 className='text-lg font-semibold text-gray-900'>
            Data Fout Gedetecteerd
          </h3>
          <p className='text-sm text-gray-600'>
            {isLocalStorageError && 'Probleem met lokale opslag'}
            {isDataParseError && 'Probleem met data formaat'}
            {!isLocalStorageError && !isDataParseError && 'Onbekende data fout'}
          </p>
        </div>
      </div>

      <div className='bg-red-50 border border-red-200 rounded-lg p-4 mb-4'>
        <p className='text-sm text-red-800'>
          {isLocalStorageError && (
            <>
              <strong>Opslag Probleem:</strong> De lokale opslag is vol of
              beschadigd. Dit kan gebeuren als er te veel gegevens zijn
              opgeslagen of als de browser storage beschadigd is.
            </>
          )}
          {isDataParseError && (
            <>
              <strong>Data Formaat Probleem:</strong> De opgeslagen gegevens
              hebben een ongeldig formaat. Dit kan gebeuren na een update of als
              de gegevens beschadigd zijn geraakt.
            </>
          )}
          {!isLocalStorageError && !isDataParseError && (
            <>
              <strong>Onbekende Fout:</strong> Er is een onverwachte fout
              opgetreden bij het verwerken van gegevens.
              <br />
              <code className='text-xs'>{error?.message}</code>
            </>
          )}
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-3 mb-4'>
        {retryCount < 2 && (
          <button
            onClick={onRetry}
            className='flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors'
          >
            <RefreshCw className='w-4 h-4' />
            Opnieuw proberen
          </button>
        )}

        {onExportData && (
          <button
            onClick={onExportData}
            className='flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors'
          >
            <Download className='w-4 h-4' />
            Backup maken
          </button>
        )}

        <button
          onClick={onResetData}
          className='flex items-center justify-center gap-2 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors'
        >
          <RefreshCw className='w-4 h-4' />
          Data herstellen
        </button>

        <button
          onClick={() => window.location.reload()}
          className='flex items-center justify-center gap-2 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors'
        >
          <Upload className='w-4 h-4' />
          Herstart app
        </button>
      </div>

      <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
        <p className='text-xs text-blue-800'>
          <strong>💡 Tip:</strong> Maak regelmatig een backup van uw gegevens
          via de export functie om gegevensverlies te voorkomen.
        </p>
      </div>
    </div>
  );
};

const DataErrorBoundary = ({ children, onDataExport }) => {
  return (
    <ErrorBoundary
      fallback={({ error, onRetry, onResetData, retryCount }) => (
        <DataErrorFallback
          error={error}
          onRetry={onRetry}
          onResetData={onResetData}
          onExportData={onDataExport}
          retryCount={retryCount}
        />
      )}
      showDetails={process.env.NODE_ENV === 'development'}
    >
      {children}
    </ErrorBoundary>
  );
};

export default DataErrorBoundary;
