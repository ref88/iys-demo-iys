import React, { useState, useEffect } from 'react';
import {
  Search,
  Upload,
  Download,
  Eye,
  FileText,
  FileImage,
  FileArchive,
  CheckCircle,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Shield,
  X,
  FileCheck,
  FileX,
  Trash2,
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext.jsx';

const Documents = () => {
  const { notify } = useNotifications();
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // const [_residents, _setResidents] = useState([]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedDocuments = localStorage.getItem('vms_documents');
    // const savedResidents = localStorage.getItem('vms_residents');

    if (savedDocuments) {
      setDocuments(JSON.parse(savedDocuments));
    } else {
      // Initialize with demo data
      const demoDocuments = [
        {
          id: 1,
          name: 'Identiteitsbewijs - Ahmad Al-Rashid',
          type: 'ID',
          fileType: 'pdf',
          size: '2.4 MB',
          uploadDate: '2024-01-15T10:30:00',
          status: 'Geverifieerd',
          statusColor: 'green',
          residentId: 1,
          residentName: 'Ahmad Al-Rashid',
          residentPhoto:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          uploadedBy: 'Sarah Johnson',
          verifiedBy: 'Maria Rodriguez',
          verifiedAt: '2024-01-16T14:20:00',
          notes: 'Origineel document geverifieerd',
          fileUrl: '#',
          expiryDate: '2029-01-15',
        },
        {
          id: 2,
          name: 'Medische verklaring - Fatima Hassan',
          type: 'Medical',
          fileType: 'pdf',
          size: '1.8 MB',
          uploadDate: '2024-01-20T16:45:00',
          status: 'In behandeling',
          statusColor: 'yellow',
          residentId: 2,
          residentName: 'Fatima Hassan',
          residentPhoto:
            'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          uploadedBy: 'Maria Rodriguez',
          verifiedBy: null,
          verifiedAt: null,
          notes: 'Wacht op beoordeling door arts',
          fileUrl: '#',
          expiryDate: '2024-07-20',
        },
        {
          id: 3,
          name: 'Werkvergunning - Omar Khalil',
          type: 'Work',
          fileType: 'pdf',
          size: '3.1 MB',
          uploadDate: '2024-01-18T09:15:00',
          status: 'Geverifieerd',
          statusColor: 'green',
          residentId: 3,
          residentName: 'Omar Khalil',
          residentPhoto:
            'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          uploadedBy: 'Ahmed Hassan',
          verifiedBy: 'Sarah Johnson',
          verifiedAt: '2024-01-19T11:30:00',
          notes: 'Werkvergunning goedgekeurd voor horeca sector',
          fileUrl: '#',
          expiryDate: '2026-01-18',
        },
        {
          id: 4,
          name: 'Geboorteakte - Fatima Hassan',
          type: 'Birth',
          fileType: 'pdf',
          size: '1.2 MB',
          uploadDate: '2024-01-22T14:20:00',
          status: 'Verlopen',
          statusColor: 'red',
          residentId: 2,
          residentName: 'Fatima Hassan',
          residentPhoto:
            'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
          uploadedBy: 'Maria Rodriguez',
          verifiedBy: 'Sarah Johnson',
          verifiedAt: '2024-01-23T10:15:00',
          notes: 'Document verlopen - vernieuwing nodig',
          fileUrl: '#',
          expiryDate: '2023-12-31',
        },
        {
          id: 5,
          name: 'Taal certificaat - Ahmad Al-Rashid',
          type: 'Language',
          fileType: 'pdf',
          size: '0.9 MB',
          uploadDate: '2024-01-25T12:00:00',
          status: 'Geverifieerd',
          statusColor: 'green',
          residentId: 1,
          residentName: 'Ahmad Al-Rashid',
          residentPhoto:
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
          uploadedBy: 'Lisa Chen',
          verifiedBy: 'Maria Rodriguez',
          verifiedAt: '2024-01-26T15:45:00',
          notes: 'Nederlands niveau B1 behaald',
          fileUrl: '#',
          expiryDate: '2027-01-25',
        },
      ];
      setDocuments(demoDocuments);
      localStorage.setItem('vms_documents', JSON.stringify(demoDocuments));
    }

    // if (savedResidents) {
    //   _setResidents(JSON.parse(savedResidents));
    // }

    setIsLoading(false);
  }, []);

  // Filter documents based on search and filters
  useEffect(() => {
    let filtered = documents;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (document) =>
          document.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          document.residentName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          document.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(
        (document) => document.status === statusFilter
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter((document) => document.type === typeFilter);
    }

    setFilteredDocuments(filtered);
  }, [documents, searchTerm, statusFilter, typeFilter]);

  // Removed unused function: _handleUploadDocument

  const handleVerifyDocument = (documentId) => {
    const documentToVerify = documents.find((doc) => doc.id === documentId);
    const updatedDocuments = documents.map((document) => {
      if (document.id === documentId) {
        return {
          ...document,
          status: 'Geverifieerd',
          statusColor: 'green',
          verifiedBy: 'Huidige gebruiker', // In real app, get from auth context
          verifiedAt: new Date().toISOString(),
        };
      }
      return document;
    });
    setDocuments(updatedDocuments);
    localStorage.setItem('vms_documents', JSON.stringify(updatedDocuments));
    notify(`Document "${documentToVerify?.name || 'Onbekend'}" geverifieerd`, {
      type: 'success',
    });
  };

  const handleRejectDocument = (documentId, reason) => {
    const documentToReject = documents.find((doc) => doc.id === documentId);
    const updatedDocuments = documents.map((document) => {
      if (document.id === documentId) {
        return {
          ...document,
          status: 'Afgewezen',
          statusColor: 'red',
          verifiedBy: 'Huidige gebruiker', // In real app, get from auth context
          verifiedAt: new Date().toISOString(),
          notes: reason || 'Document afgewezen',
        };
      }
      return document;
    });
    setDocuments(updatedDocuments);
    localStorage.setItem('vms_documents', JSON.stringify(updatedDocuments));
    notify(`Document "${documentToReject?.name || 'Onbekend'}" afgewezen`, {
      type: 'warning',
    });
  };

  const handleDeleteDocument = (documentId) => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Weet je zeker dat je dit document wilt verwijderen?')) {
      const documentToDelete = documents.find((doc) => doc.id === documentId);
      const updatedDocuments = documents.filter(
        (document) => document.id !== documentId
      );
      setDocuments(updatedDocuments);
      localStorage.setItem('vms_documents', JSON.stringify(updatedDocuments));
      notify(
        `Document "${documentToDelete?.name || 'Onbekend'}" succesvol verwijderd`,
        { type: 'success' }
      );
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Geverifieerd':
        return 'bg-green-100 text-green-800';
      case 'In behandeling':
        return 'bg-yellow-100 text-yellow-800';
      case 'Afgewezen':
        return 'bg-red-100 text-red-800';
      case 'Verlopen':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFileTypeIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return <FileText className='w-5 h-5 text-red-500' />;
      case 'image':
        return <FileImage className='w-5 h-5 text-blue-500' />;
      case 'archive':
        return <FileArchive className='w-5 h-5 text-orange-500' />;
      default:
        return <FileText className='w-5 h-5 text-gray-500' />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('nl-NL');
  };

  const formatDateTime = (dateTimeString) => {
    return new Date(dateTimeString).toLocaleString('nl-NL');
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' />
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div>
          <h1 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
            <FileText className='w-6 h-6 text-blue-600' />
            Documenten
          </h1>
          <p className='text-gray-600 mt-1'>
            Beheer alle documenten ({documents.length} totaal)
          </p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2'
        >
          <Upload className='w-4 h-4' />
          Document Uploaden
        </button>
      </div>

      {/* Statistics */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <div className='bg-white p-4 rounded-lg shadow-sm border'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Totaal</p>
              <p className='text-2xl font-bold text-gray-900'>
                {documents.length}
              </p>
            </div>
            <FileText className='w-8 h-8 text-blue-600' />
          </div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow-sm border'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Geverifieerd</p>
              <p className='text-2xl font-bold text-green-600'>
                {documents.filter((d) => d.status === 'Geverifieerd').length}
              </p>
            </div>
            <FileCheck className='w-8 h-8 text-green-600' />
          </div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow-sm border'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>In behandeling</p>
              <p className='text-2xl font-bold text-yellow-600'>
                {documents.filter((d) => d.status === 'In behandeling').length}
              </p>
            </div>
            <Clock className='w-8 h-8 text-yellow-600' />
          </div>
        </div>
        <div className='bg-white p-4 rounded-lg shadow-sm border'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-sm text-gray-600'>Verlopen</p>
              <p className='text-2xl font-bold text-red-600'>
                {documents.filter((d) => d.status === 'Verlopen').length}
              </p>
            </div>
            <FileX className='w-8 h-8 text-red-600' />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className='bg-white p-4 rounded-lg shadow-sm border'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <label
              htmlFor='doc-search'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Zoeken
            </label>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <input
                id='doc-search'
                type='text'
                placeholder='Document, bewoner, type...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
          </div>

          <div>
            <label
              htmlFor='doc-status'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Status
            </label>
            <select
              id='doc-status'
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='all'>Alle statussen</option>
              <option value='Geverifieerd'>Geverifieerd</option>
              <option value='In behandeling'>In behandeling</option>
              <option value='Afgewezen'>Afgewezen</option>
              <option value='Verlopen'>Verlopen</option>
            </select>
          </div>

          <div>
            <label
              htmlFor='doc-type'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Type
            </label>
            <select
              id='doc-type'
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              <option value='all'>Alle types</option>
              <option value='ID'>Identiteitsbewijs</option>
              <option value='Medical'>Medisch</option>
              <option value='Work'>Werk</option>
              <option value='Birth'>Geboorte</option>
              <option value='Language'>Taal</option>
            </select>
          </div>

          <div className='flex items-end'>
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
              }}
              className='w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
            >
              Filters wissen
            </button>
          </div>
        </div>
      </div>

      {/* Documents List */}
      <div className='space-y-4'>
        {filteredDocuments.map((document) => (
          <div
            key={document.id}
            className='bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow'
          >
            <div className='p-6'>
              {/* Header */}
              <div className='flex items-start justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  {getFileTypeIcon(document.fileType)}
                  <div>
                    <h3 className='font-semibold text-gray-900'>
                      {document.name}
                    </h3>
                    <p className='text-sm text-gray-600'>
                      {document.type} • {document.size}
                    </p>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <span
                    className={`px-3 py-1 text-sm rounded-full ${getStatusColor(document.status)}`}
                  >
                    {document.status}
                  </span>
                  {isExpired(document.expiryDate) && (
                    <AlertTriangle className='w-4 h-4 text-red-500' />
                  )}
                </div>
              </div>

              {/* Details */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                <div className='space-y-2'>
                  <div className='flex items-center gap-2 text-sm'>
                    <User className='w-4 h-4 text-gray-400' />
                    <span className='text-gray-600'>
                      {document.residentName}
                    </span>
                  </div>
                  <div className='flex items-center gap-2 text-sm'>
                    <Calendar className='w-4 h-4 text-gray-400' />
                    <span className='text-gray-600'>
                      Upload: {formatDate(document.uploadDate)}
                    </span>
                  </div>
                  <div className='flex items-center gap-2 text-sm'>
                    <Shield className='w-4 h-4 text-gray-400' />
                    <span className='text-gray-600'>
                      Verloopt: {formatDate(document.expiryDate)}
                      {isExpired(document.expiryDate) && (
                        <span className='text-red-600 ml-1'>(Verlopen)</span>
                      )}
                    </span>
                  </div>
                </div>
                <div className='space-y-2'>
                  <div className='text-sm'>
                    <span className='font-medium text-gray-700'>
                      Geüpload door:
                    </span>
                    <p className='text-gray-600'>{document.uploadedBy}</p>
                  </div>
                  {document.verifiedBy && (
                    <div className='text-sm'>
                      <span className='font-medium text-gray-700'>
                        Geverifieerd door:
                      </span>
                      <p className='text-gray-600'>{document.verifiedBy}</p>
                    </div>
                  )}
                  {document.notes && (
                    <div className='text-sm'>
                      <span className='font-medium text-gray-700'>
                        Notities:
                      </span>
                      <p className='text-gray-600'>{document.notes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className='flex items-center justify-between text-sm text-gray-500 border-t pt-4'>
                <div className='flex items-center gap-4'>
                  <span>Upload: {formatDateTime(document.uploadDate)}</span>
                  {document.verifiedAt && (
                    <span>
                      Verificatie: {formatDateTime(document.verifiedAt)}
                    </span>
                  )}
                </div>
                <div className='flex items-center gap-2'>
                  <button className='p-2 text-gray-400 hover:text-blue-600 transition-colors'>
                    <Eye className='w-4 h-4' />
                  </button>
                  <button className='p-2 text-gray-400 hover:text-green-600 transition-colors'>
                    <Download className='w-4 h-4' />
                  </button>
                  {document.status === 'In behandeling' && (
                    <>
                      <button
                        onClick={() => handleVerifyDocument(document.id)}
                        className='px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors flex items-center gap-1'
                      >
                        <CheckCircle className='w-3 h-3' />
                        Verifiëren
                      </button>
                      <button
                        onClick={() => {
                          // eslint-disable-next-line no-alert
                          const reason = prompt('Reden voor afwijzing:');
                          if (reason !== null) {
                            handleRejectDocument(document.id, reason);
                          }
                        }}
                        className='px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors flex items-center gap-1'
                      >
                        <X className='w-3 h-3' />
                        Afwijzen
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDeleteDocument(document.id)}
                    className='p-2 text-gray-400 hover:text-red-600 transition-colors'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredDocuments.length === 0 && (
        <div className='text-center py-12'>
          <FileText className='w-12 h-12 text-gray-400 mx-auto mb-4' />
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            Geen documenten gevonden
          </h3>
          <p className='text-gray-600 mb-4'>
            {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Probeer je zoekopdracht of filters aan te passen.'
              : 'Upload je eerste document om te beginnen.'}
          </p>
          {!searchTerm && statusFilter === 'all' && typeFilter === 'all' && (
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
            >
              Document Uploaden
            </button>
          )}
        </div>
      )}

      {/* Upload Modal - Placeholder for now */}
      {isUploadModalOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg shadow-xl w-full max-w-2xl'>
            <div className='p-6 border-b'>
              <h3 className='text-xl font-semibold'>Document Uploaden</h3>
              <p className='text-gray-600 mt-1'>
                Functie komt in de volgende stap
              </p>
            </div>
            <div className='p-6'>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className='px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors'
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
