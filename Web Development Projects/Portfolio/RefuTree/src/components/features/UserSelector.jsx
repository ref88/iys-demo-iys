import React, { useState, useEffect } from 'react';
import { User, ChevronDown, AlertTriangle, CheckCircle, X } from 'lucide-react';

const UserSelector = ({ onUserChange, currentUser, showSelector, onClose, triggerPosition }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [sessionTimeout, setSessionTimeout] = useState(null);

  // Load users from localStorage
  useEffect(() => {
    const savedUsers = localStorage.getItem('vms_users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Default team members - Oekraïense Opvang Team
      const defaultUsers = [
        // Management
        { id: 1, name: 'Soraya Schuyer', role: 'Admin', isActive: false },
        { id: 2, name: 'Jesse Heij', role: 'Admin', isActive: false },
        
        // Locatie Coordinator
        { id: 3, name: 'Mohamed G.', role: 'Coordinator', isActive: false },
        
        // Woonbegeleiders
        { id: 4, name: 'Fabian', role: 'Woonbegeleider', isActive: false },
        { id: 5, name: 'Ryan', role: 'Woonbegeleider', isActive: false },
        { id: 6, name: 'Carlos', role: 'Woonbegeleider', isActive: false },
        { id: 7, name: 'Paul', role: 'Woonbegeleider', isActive: false },
        { id: 8, name: 'Shahroze', role: 'Woonbegeleider', isActive: false },
        { id: 9, name: 'Danish', role: 'Woonbegeleider', isActive: false },
        { id: 10, name: 'Danil', role: 'Woonbegeleider', isActive: false },
        { id: 11, name: 'Oksana', role: 'Woonbegeleider', isActive: false },
        { id: 12, name: 'Rabia', role: 'Woonbegeleider', isActive: false },
        { id: 13, name: 'Seda', role: 'Woonbegeleider', isActive: false },
        { id: 14, name: 'Mart', role: 'Woonbegeleider', isActive: false },
        { id: 15, name: 'Ines', role: 'Woonbegeleider', isActive: false },
        { id: 16, name: 'Xafiera', role: 'Woonbegeleider', isActive: false },
        { id: 17, name: 'Amira', role: 'Woonbegeleider', isActive: false }
      ];
      setUsers(defaultUsers);
      localStorage.setItem('vms_users', JSON.stringify(defaultUsers));
    }
  }, []);

  // Session timeout management
  useEffect(() => {
    if (currentUser) {
      // Reset timeout when user is active
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
      
      const timeout = setTimeout(() => {
        onUserChange(null);
        alert('Sessie verlopen. Selecteer opnieuw je naam.');
      }, 30 * 60 * 1000); // 30 minutes

      setSessionTimeout(timeout);
    }

    return () => {
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
      }
    };
  }, [currentUser]);

  const handleUserSelect = (user) => {
    // Update user active status
    const updatedUsers = users.map(u => ({
      ...u,
      isActive: u.id === user.id
    }));
    setUsers(updatedUsers);
    localStorage.setItem('vms_users', JSON.stringify(updatedUsers));
    
    onUserChange(user);
    setIsOpen(false);
    if (onClose) onClose();
  };

  const getStatusColor = () => {
    if (!currentUser) return 'text-red-500';
    return 'text-green-500';
  };

  const getStatusIcon = () => {
    if (!currentUser) return <AlertTriangle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  // Floating indicator (always visible)
  if (!showSelector) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all duration-200 hover:scale-105 ${
            currentUser 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white animate-pulse'
          }`}
          title={currentUser ? `${currentUser.name} (${currentUser.role})` : 'Selecteer gebruiker'}
        >
          <User className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">
            {currentUser ? currentUser.name.split(' ')[0] : 'Gebruiker'}
          </span>
          {getStatusIcon()}
        </button>

        {isOpen && (
          <div className="absolute bottom-full right-0 mb-2 w-64 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
            <div className="p-2">
              <div className="text-xs text-gray-500 mb-2 px-2">Teamleden</div>
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-left transition-colors ${
                    currentUser?.id === user.id
                      ? 'bg-green-100 text-green-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.role}</div>
                  </div>
                  {currentUser?.id === user.id && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Contextual popup (when triggered)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {currentUser ? 'Wissel gebruiker' : 'Selecteer je naam'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
          {currentUser && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-green-700">
                    {currentUser.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-green-800">{currentUser.name}</div>
                  <div className="text-sm text-green-600">{currentUser.role}</div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-500 ml-auto" />
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="text-sm text-gray-600 mb-3">
              {currentUser ? 'Of selecteer een andere teamlid:' : 'Wie ben jij?'}
            </div>
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserSelect(user)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  currentUser?.id === user.id
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'hover:bg-gray-50 text-gray-700 border border-gray-200'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-sm font-semibold">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.role}</div>
                </div>
                {currentUser?.id === user.id && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSelector; 