import React, { memo, useMemo, useCallback, useState } from 'react';
import {
  User,
  Users,
  Calendar,
  FileText,
  // Bell, // Unused
  // Search, // Unused
  LogOut,
  Home,
  BarChart,
  Settings,
  Moon,
  Sun,
  Tag,
  Activity,
  ArrowLeft,
  ArrowRight,
  ClipboardCheck,
  ChevronDown,
  AlertTriangle,
  ArrowRightLeft,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext.jsx';
import { useDarkMode } from '../../contexts/DarkModeContext';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import LanguageSwitcher from '../ui/LanguageSwitcher.jsx';
import Tooltip from '../ui/Tooltip.jsx';

const VMSLayout = memo(
  ({
    children,
    activeView,
    setView,
    sidebarCollapsed,
    toggleSidebar,
    onRoomCapacityClick,
  }) => {
    const { user, logout } = useAuth();
    const { isDarkMode, toggleDarkMode } = useDarkMode();
    const { t } = useLanguage();
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);

    const menuItems = useMemo(
      () => [
        { id: 'dashboard', label: t('dashboard'), icon: Home },
        { id: 'residents', label: t('residents'), icon: Users },
        { id: 'incidents', label: 'Incidenten', icon: AlertTriangle },
        { id: 'handover', label: 'Overdracht', icon: ArrowRightLeft },
        { id: 'meldplicht', label: t('meldplicht'), icon: ClipboardCheck },
        { id: 'leave-requests', label: t('verlof'), icon: Calendar },
        { id: 'documents', label: t('documents'), icon: FileText },
        { id: 'analytics', label: t('analytics'), icon: BarChart },
        { id: 'audit-trail', label: t('auditTrail'), icon: Activity },
        { id: 'labels', label: t('labels'), icon: Tag },
        { id: 'settings', label: t('settings'), icon: Settings },
        {
          id: 'room-capacity',
          label: 'Kamer Capaciteit',
          icon: Home,
          action: 'room-capacity',
        },
      ],
      [t]
    );

    const handleViewChange = useCallback(
      (view) => {
        setView(view);
      },
      [setView]
    );

    const handleMenuItemClick = useCallback(
      (item) => {
        if (item.action === 'room-capacity') {
          onRoomCapacityClick && onRoomCapacityClick();
        } else {
          handleViewChange(item.id);
        }
      },
      [handleViewChange, onRoomCapacityClick]
    );

    return (
      <div
        className={`min-h-screen transition-gentle ${isDarkMode ? 'dark' : ''}`}
      >
        <div className='flex h-screen bg-gray-100 dark:bg-gray-900'>
          {/* Sidebar */}
          <div
            className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white dark:bg-gray-800 shadow-lg transition-gentle flex flex-col`}
          >
            {/* Header */}
            <div className='p-4 border-b border-gray-200 dark:border-gray-700'>
              <div className='flex items-center justify-between'>
                {!sidebarCollapsed && (
                  <h1 className='text-xl font-bold text-gray-800 dark:text-white'>
                    TAKO VMS
                  </h1>
                )}
                <button
                  onClick={toggleSidebar}
                  className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-gentle text-gray-700 dark:text-gray-300'
                >
                  {sidebarCollapsed ? (
                    <ArrowRight className='h-5 w-5' />
                  ) : (
                    <ArrowLeft className='h-5 w-5' />
                  )}
                </button>
              </div>
            </div>

            {/* Navigation */}
            <nav className='flex-1 p-4 space-y-2'>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                const button = (
                  <button
                    onClick={() => handleMenuItemClick(item)}
                    className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'px-3'} py-2 rounded-lg transition-gentle ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className='h-5 w-5 flex-shrink-0' />
                    {!sidebarCollapsed && (
                      <span className='ml-3 text-sm font-medium'>
                        {item.label}
                      </span>
                    )}
                  </button>
                );

                return sidebarCollapsed ? (
                  <Tooltip
                    key={item.id}
                    content={item.label}
                    position='right'
                    className='w-full'
                  >
                    {button}
                  </Tooltip>
                ) : (
                  <div key={item.id}>{button}</div>
                );
              })}
            </nav>

            {/* Footer - Minimalist */}
            <div className='p-3 border-t border-gray-200 dark:border-gray-700'>
              {sidebarCollapsed ? (
                <div className='flex flex-col space-y-2 items-center'>
                  <Tooltip content='Taal' position='right'>
                    <LanguageSwitcher />
                  </Tooltip>
                  <Tooltip
                    content={isDarkMode ? 'Licht modus' : 'Donker modus'}
                    position='right'
                  >
                    <button
                      onClick={toggleDarkMode}
                      className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-gentle text-gray-700 dark:text-gray-300'
                    >
                      {isDarkMode ? (
                        <Sun className='h-5 w-5' />
                      ) : (
                        <Moon className='h-5 w-5' />
                      )}
                    </button>
                  </Tooltip>
                  <Tooltip content='Uitloggen' position='right'>
                    <button
                      onClick={logout}
                      className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-gentle text-red-600 dark:text-red-400'
                    >
                      <LogOut className='h-4 w-4' />
                    </button>
                  </Tooltip>
                </div>
              ) : (
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-1'>
                    <LanguageSwitcher />
                    <button
                      onClick={toggleDarkMode}
                      className='p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-gentle text-gray-700 dark:text-gray-300'
                      title={isDarkMode ? 'Licht modus' : 'Donker modus'}
                    >
                      {isDarkMode ? (
                        <Sun className='h-5 w-5' />
                      ) : (
                        <Moon className='h-5 w-5' />
                      )}
                    </button>
                  </div>

                  {/* User Dropdown */}
                  <div className='relative'>
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className='flex items-center space-x-1 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-gentle text-gray-700 dark:text-gray-300'
                    >
                      <User className='h-5 w-5' />
                      <span className='text-xs font-medium'>
                        {user?.name || 'Admin'}
                      </span>
                      <ChevronDown className='h-3 w-3' />
                    </button>

                    {userDropdownOpen && (
                      <div className='absolute bottom-full left-0 mb-2 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1'>
                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className='w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-gentle text-red-600 dark:text-red-400'
                        >
                          <LogOut className='h-4 w-4' />
                          <span className='text-xs'>Uitloggen</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className='flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900'>
            <div className='h-full overflow-y-auto'>{children}</div>
          </div>
        </div>
      </div>
    );
  }
);

VMSLayout.displayName = 'VMSLayout';

export default VMSLayout;
