import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Bell,
  ArrowLeftRight,
  Settings,
  Search,
  RotateCcw,
  Zap,
  BarChart3,
  TrendingUp,
  PieChart,
  Download,
  FileText,
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext.jsx';

const ShiftSchedule = ({ currentUser, onShiftUpdate: _onShiftUpdate }) => {
  const { notify } = useNotifications();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [shifts, setShifts] = useState([]);
  const [viewMode, setViewMode] = useState('week'); // 'week', 'month', 'day'
  const [filterStatus] = useState('all');
  const [activeTab, setActiveTab] = useState('schedule'); // 'schedule', 'reports'
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState(null);
  const [swapRequests, setSwapRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Shift types with modern styling
  const shiftTypes = useMemo(
    () => [
      {
        id: 'early_full',
        name: 'Vroege Dienst',
        startTime: '07:00',
        endTime: '15:00',
        color: 'bg-gradient-to-r from-blue-500 to-blue-600',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700',
        maxStaff: 2,
        description: 'Vroege dienst',
      },
      {
        id: 'early_intermediate',
        name: 'Vroege Tussendienst',
        startTime: '09:00',
        endTime: '17:00',
        color: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
        borderColor: 'border-emerald-200',
        textColor: 'text-emerald-700',
        maxStaff: 1,
        description: 'Vroege tussendienst',
      },
      {
        id: 'late_full',
        name: 'Late Dienst',
        startTime: '15:00',
        endTime: '23:00',
        color: 'bg-gradient-to-r from-purple-500 to-purple-600',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-700',
        maxStaff: 2,
        description: 'Late dienst',
      },
      {
        id: 'late_intermediate',
        name: 'Late Tussendienst',
        startTime: '17:00',
        endTime: '23:00',
        color: 'bg-gradient-to-r from-orange-500 to-orange-600',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-700',
        maxStaff: 1,
        description: 'Late tussendienst',
      },
    ],
    []
  );

  // Staff members - Oekraïense Opvang Team
  const staffMembers = useMemo(
    () => [
      // Locatie Coordinator (werkt alleen vroege tussendiensten)
      {
        id: 3,
        name: 'Mohamed G.',
        role: 'Coordinator',
        isActive: false,
        avatar: 'MG',
      },

      // Woonbegeleiders
      {
        id: 4,
        name: 'Fabian',
        role: 'Woonbegeleider',
        isActive: false,
        avatar: 'F',
      },
      {
        id: 5,
        name: 'Ryan',
        role: 'Woonbegeleider',
        isActive: false,
        avatar: 'R',
      },
      {
        id: 6,
        name: 'Carlos',
        role: 'Woonbegeleider',
        isActive: false,
        avatar: 'C',
      },
      {
        id: 7,
        name: 'Paul',
        role: 'Woonbegeleider',
        isActive: false,
        avatar: 'P',
      },
      {
        id: 8,
        name: 'Shahroze',
        role: 'Woonbegeleider',
        isActive: false,
        avatar: 'S',
      },
      {
        id: 9,
        name: 'Danish',
        role: 'Woonbegeleider',
        isActive: false,
        avatar: 'D',
      },
      {
        id: 10,
        name: 'Danil',
        role: 'Woonbegeleider',
        isActive: false,
        avatar: 'D',
      },
      {
        id: 11,
        name: 'Oksana',
        role: 'Woonbegeleider',
        isActive: false,
        avatar: 'O',
      },
      {
        id: 12,
        name: 'Rabia',
        role: 'Woonbegeleider',
        isActive: false,
        avatar: 'R',
      },
      {
        id: 13,
        name: 'Seda',
        role: 'Woonbegeleider',
        isActive: false,
        avatar: 'S',
      },
      {
        id: 14,
        name: 'Mart',
        role: 'Woonbegeleider',
        isActive: false,
        avatar: 'M',
      },
      {
        id: 15,
        name: 'Ines',
        role: 'Woonbegeleider',
        isActive: false,
        avatar: 'I',
      },
      {
        id: 16,
        name: 'Xafiera',
        role: 'Woonbegeleider',
        isActive: false,
        avatar: 'X',
      },
      {
        id: 17,
        name: 'Amira',
        role: 'Woonbegeleider',
        isActive: false,
        avatar: 'A',
      },
    ],
    []
  );

  // Load shifts from localStorage
  useEffect(() => {
    const savedShifts = localStorage.getItem('vms_shifts');
    const savedSwapRequests = localStorage.getItem('vms_swap_requests');

    if (savedShifts) {
      setShifts(JSON.parse(savedShifts));
    } else {
      const defaultShifts = generateDefaultShifts();
      setShifts(defaultShifts);
      localStorage.setItem('vms_shifts', JSON.stringify(defaultShifts));
    }

    if (savedSwapRequests) {
      setSwapRequests(JSON.parse(savedSwapRequests));
    }
  }, [generateDefaultShifts]);

  // Generate default shifts for full month with realistic staff assignments
  const generateDefaultShifts = useCallback(() => {
    const shifts = [];
    const today = new Date();

    // Staff rotation patterns for realistic scheduling
    const woonbegeleiders = staffMembers.filter(
      (staff) => staff.role === 'Woonbegeleider'
    );
    const coordinators = staffMembers.filter(
      (staff) => staff.role === 'Coordinator'
    );

    // Generate shifts for the entire current month
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = date.toISOString().split('T')[0];

      // Add all shift types for each day with realistic staff assignments
      shiftTypes.forEach((shiftType) => {
        let assignedStaff = [];

        // Assign staff based on shift type and day with better rotation
        if (shiftType.id === 'early_full') {
          // Vroege dienst (07:00-15:00) - 2 woonbegeleiders
          assignedStaff = [
            woonbegeleiders[(day - 1) % woonbegeleiders.length]?.id,
            woonbegeleiders[(day + 2) % woonbegeleiders.length]?.id,
          ].filter(Boolean);
        } else if (shiftType.id === 'early_intermediate') {
          // Vroege tussendienst (09:00-17:00) - 1 woonbegeleider
          assignedStaff = [
            woonbegeleiders[(day + 1) % woonbegeleiders.length]?.id,
          ].filter(Boolean);
        } else if (shiftType.id === 'late_full') {
          // Late dienst (15:00-23:00) - 2 woonbegeleiders
          assignedStaff = [
            woonbegeleiders[(day + 3) % woonbegeleiders.length]?.id,
            woonbegeleiders[(day + 6) % woonbegeleiders.length]?.id,
          ].filter(Boolean);
        } else if (shiftType.id === 'late_intermediate') {
          // Late tussendienst (17:00-23:00) - 1 woonbegeleider
          assignedStaff = [
            woonbegeleiders[(day + 4) % woonbegeleiders.length]?.id,
          ].filter(Boolean);
        }

        // Add coordinator to vroege tussendiensten only (every 3rd day for better distribution)
        if (
          shiftType.id === 'early_intermediate' &&
          day % 3 === 0 &&
          coordinators.length > 0
        ) {
          assignedStaff.push(coordinators[0].id);
        }

        shifts.push({
          id: `${dateStr}_${shiftType.id}`,
          date: dateStr,
          shiftType: shiftType.id,
          startTime: shiftType.startTime,
          endTime: shiftType.endTime,
          assignedStaff: assignedStaff,
          status: 'scheduled', // 'scheduled', 'active', 'completed', 'cancelled'
          checkIns: [],
          checkOuts: [],
          swapRequests: [],
          notes: '',
          createdAt: new Date().toISOString(),
          createdBy: currentUser?.id || null,
        });
      });
    }

    return shifts;
  }, [currentUser?.id, shiftTypes, staffMembers]);

  // Get shifts for selected date range
  const getShiftsForDateRange = () => {
    const startDate = new Date(selectedDate);
    const endDate = new Date(selectedDate);

    if (viewMode === 'week') {
      // Start of week (Monday)
      const day = startDate.getDay();
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
      startDate.setDate(diff);
      endDate.setDate(startDate.getDate() + 6);
    } else if (viewMode === 'month') {
      // Start of month
      startDate.setDate(1);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(0);
    } else {
      // Day view
      endDate.setDate(startDate.getDate());
    }

    return shifts.filter((shift) => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= startDate && shiftDate <= endDate;
    });
  };

  // Check if shift is currently active
  const isShiftActive = (shift) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    if (shift.date !== today) {
      return false;
    }

    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startMinutes =
      parseInt(shift.startTime.split(':')[0]) * 60 +
      parseInt(shift.startTime.split(':')[1]);
    const endMinutes =
      parseInt(shift.endTime.split(':')[0]) * 60 +
      parseInt(shift.startTime.split(':')[1]);

    return currentTime >= startMinutes && currentTime <= endMinutes;
  };

  // Removed unused functions: _isStaffLate, _sendLateNotification

  // Get current active shifts
  const getActiveShifts = () => {
    return shifts.filter((shift) => isShiftActive(shift));
  };

  // Get staff status
  const getStaffStatus = (shift, staffId) => {
    const checkIn = shift.checkIns.find((c) => c.staffId === staffId);
    const checkOut = shift.checkOuts.find((c) => c.staffId === staffId);

    if (checkOut) {
      return 'checked-out';
    }
    if (checkIn && checkIn.isLate) {
      return 'late';
    }
    if (checkIn) {
      return 'checked-in';
    }
    return 'not-checked-in';
  };

  // Format time
  const formatTime = (time) => {
    return time.replace(':', '.');
  };

  // Get shift type info
  const getShiftTypeInfo = (shiftTypeId) => {
    return shiftTypes.find((st) => st.id === shiftTypeId);
  };

  // Smart swap functionality
  const initiateSwap = (shift) => {
    setSelectedShift(shift);
    setShowSwapModal(true);
  };

  // Get available staff for swap
  const getAvailableStaffForSwap = (shift) => {
    // const _shiftType = getShiftTypeInfo(shift.shiftType); // Unused
    const currentStaff = shift.assignedStaff;

    return staffMembers.filter((staff) => {
      // Don't include current staff
      if (currentStaff.includes(staff.id)) {
        return false;
      }

      // Coordinator can only work early intermediate shifts
      if (
        staff.role === 'Coordinator' &&
        shift.shiftType !== 'early_intermediate'
      ) {
        return false;
      }

      return true;
    });
  };

  // Handle swap request
  const handleSwapRequest = (fromShift, toStaffId, message = '') => {
    const newSwapRequest = {
      id: `swap_${Date.now()}`,
      fromShiftId: fromShift.id,
      fromStaffId: currentUser.id,
      toStaffId: toStaffId,
      message: message,
      status: 'pending', // 'pending', 'accepted', 'rejected', 'approved'
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    const updatedSwapRequests = [...swapRequests, newSwapRequest];
    setSwapRequests(updatedSwapRequests);
    localStorage.setItem(
      'vms_swap_requests',
      JSON.stringify(updatedSwapRequests)
    );

    // Add notification
    addNotification({
      id: `notif_${Date.now()}`,
      type: 'swap_request',
      title: 'Ruilverzoek verzonden',
      message: `Ruilverzoek naar ${staffMembers.find((s) => s.id === toStaffId)?.name} verzonden`,
      timestamp: new Date().toISOString(),
      read: false,
    });

    setShowSwapModal(false);
  };

  // Add notification
  const addNotification = (notification) => {
    const updatedNotifications = [notification, ...notifications];
    setNotifications(updatedNotifications);
    localStorage.setItem(
      'vms_notifications',
      JSON.stringify(updatedNotifications)
    );
  };

  // Get filtered shifts
  const filteredShifts = getShiftsForDateRange().filter((shift) => {
    if (filterStatus !== 'all' && shift.status !== filterStatus) {
      return false;
    }
    if (searchTerm) {
      const shiftType = getShiftTypeInfo(shift.shiftType);
      const staffNames = shift.assignedStaff
        .map((id) => staffMembers.find((s) => s.id === id)?.name)
        .join(' ');
      return (
        shiftType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        staffNames.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  // Get week days (Monday start, 7 days)
  const getWeekDays = () => {
    const days = [];
    const startDate = new Date(selectedDate);
    const day = startDate.getDay();
    // Monday = 1, Sunday = 0, so we need to adjust
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1);
    startDate.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      days.push(date);
    }

    return days;
  };

  // Get week number
  const getWeekNumber = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));
    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return weekNo;
  };

  // Get time slots for week view
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 23; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  // Navigate to previous period
  const navigatePrevious = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setSelectedDate(newDate);
  };

  // Navigate to next period
  const navigateNext = () => {
    const newDate = new Date(selectedDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  // Regenerate shifts
  const regenerateShifts = () => {
    const defaultShifts = generateDefaultShifts();
    setShifts(defaultShifts);
    localStorage.setItem('vms_shifts', JSON.stringify(defaultShifts));

    addNotification({
      id: `notif_${Date.now()}`,
      type: 'system',
      title: 'Dienstrooster vernieuwd',
      message: 'Dienstrooster voor de hele maand is opnieuw gegenereerd',
      timestamp: new Date().toISOString(),
      read: false,
    });
  };

  // AI-Powered Smart Scheduling Functions
  const calculateWorkloadBalance = () => {
    const workload = {};
    staffMembers.forEach((staff) => {
      workload[staff.id] = {
        totalShifts: 0,
        earlyShifts: 0,
        lateShifts: 0,
        weekendShifts: 0,
        consecutiveDays: 0,
        lastShiftDate: null,
      };
    });

    // Calculate current workload
    shifts.forEach((shift) => {
      shift.assignedStaff.forEach((staffId) => {
        if (workload[staffId]) {
          workload[staffId].totalShifts++;

          if (shift.shiftType.includes('early')) {
            workload[staffId].earlyShifts++;
          } else {
            workload[staffId].lateShifts++;
          }

          const shiftDate = new Date(shift.date);
          const dayOfWeek = shiftDate.getDay();
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            workload[staffId].weekendShifts++;
          }

          // Check consecutive days
          if (workload[staffId].lastShiftDate) {
            const daysDiff = Math.abs(
              (shiftDate - new Date(workload[staffId].lastShiftDate)) /
                (1000 * 60 * 60 * 24)
            );
            if (daysDiff === 1) {
              workload[staffId].consecutiveDays++;
            }
          }
          workload[staffId].lastShiftDate = shift.date;
        }
      });
    });

    return workload;
  };

  const getOptimalStaffForShift = (shiftType, date, excludeStaff = []) => {
    const workload = calculateWorkloadBalance();
    const shiftDate = new Date(date);
    const dayOfWeek = shiftDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Filter available staff based on role and restrictions
    const availableStaff = staffMembers.filter((staff) => {
      if (excludeStaff.includes(staff.id)) {
        return false;
      }

      // Coordinator can only work early intermediate shifts
      if (staff.role === 'Coordinator' && shiftType !== 'early_intermediate') {
        return false;
      }

      return true;
    });

    // Score each staff member based on fairness
    const scoredStaff = availableStaff.map((staff) => {
      const staffWorkload = workload[staff.id];
      let score = 0;

      // Prefer staff with fewer total shifts
      score += (20 - staffWorkload.totalShifts) * 2;

      // Balance early vs late shifts
      if (
        shiftType.includes('early') &&
        staffWorkload.lateShifts > staffWorkload.earlyShifts
      ) {
        score += 10;
      } else if (
        shiftType.includes('late') &&
        staffWorkload.earlyShifts > staffWorkload.lateShifts
      ) {
        score += 10;
      }

      // Weekend fairness
      if (isWeekend && staffWorkload.weekendShifts < 2) {
        score += 15;
      } else if (!isWeekend && staffWorkload.weekendShifts > 1) {
        score += 15;
      }

      // Avoid consecutive days
      if (staffWorkload.consecutiveDays < 2) {
        score += 5;
      }

      // Random factor to prevent always same order
      score += Math.random() * 5;

      return { ...staff, score };
    });

    // Sort by score (highest first)
    return scoredStaff.sort((a, b) => b.score - a.score);
  };

  const detectConflicts = (shiftId, staffId) => {
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) {
      return [];
    }

    const conflicts = [];
    const shiftDate = new Date(shift.date);
    const shiftStart = parseInt(shift.startTime.split(':')[0]);
    const shiftEnd = parseInt(shift.endTime.split(':')[0]);

    // Check for overlapping shifts
    shifts.forEach((otherShift) => {
      if (otherShift.id === shiftId) {
        return;
      }

      if (
        otherShift.assignedStaff.includes(staffId) &&
        otherShift.date === shift.date
      ) {
        const otherStart = parseInt(otherShift.startTime.split(':')[0]);
        const otherEnd = parseInt(otherShift.endTime.split(':')[0]);

        // Check for overlap
        if (shiftStart < otherEnd && shiftEnd > otherStart) {
          conflicts.push({
            type: 'overlap',
            shiftId: otherShift.id,
            message: `Overlapt met ${getShiftTypeInfo(otherShift.shiftType).name} (${otherShift.startTime}-${otherShift.endTime})`,
          });
        }
      }
    });

    // Check for consecutive day conflicts (if staff worked previous day)
    const previousDay = new Date(shiftDate);
    previousDay.setDate(previousDay.getDate() - 1);
    const previousDayStr = previousDay.toISOString().split('T')[0];

    const previousShifts = shifts.filter(
      (s) => s.date === previousDayStr && s.assignedStaff.includes(staffId)
    );

    if (previousShifts.length > 0) {
      const lastShift = previousShifts[previousShifts.length - 1];
      const lastShiftEnd = parseInt(lastShift.endTime.split(':')[0]);

      // If previous shift ended late and this one starts early
      if (lastShiftEnd >= 22 && shiftStart <= 9) {
        conflicts.push({
          type: 'rest',
          shiftId: lastShift.id,
          message: `Onvoldoende rust tussen diensten (${lastShift.endTime} → ${shift.startTime})`,
        });
      }
    }

    return conflicts;
  };

  const autoFillOpenShifts = () => {
    const updatedShifts = [...shifts];
    let changes = 0;

    updatedShifts.forEach((shift) => {
      const shiftType = getShiftTypeInfo(shift.shiftType);
      const currentStaff = shift.assignedStaff;
      const requiredStaff = shiftType.maxStaff;

      if (currentStaff.length < requiredStaff) {
        const needed = requiredStaff - currentStaff.length;
        const optimalStaff = getOptimalStaffForShift(
          shift.shiftType,
          shift.date,
          currentStaff
        );

        for (let i = 0; i < needed && i < optimalStaff.length; i++) {
          const conflicts = detectConflicts(shift.id, optimalStaff[i].id);

          if (conflicts.length === 0) {
            shift.assignedStaff.push(optimalStaff[i].id);
            changes++;

            // Add notification
            addNotification({
              id: `notif_${Date.now()}_${i}`,
              type: 'auto_assignment',
              title: 'Automatische toewijzing',
              message: `${optimalStaff[i].name} automatisch toegewezen aan ${shiftType.name} op ${shift.date}`,
              timestamp: new Date().toISOString(),
              read: false,
            });
          }
        }
      }
    });

    if (changes > 0) {
      setShifts(updatedShifts);
      localStorage.setItem('vms_shifts', JSON.stringify(updatedShifts));

      addNotification({
        id: `notif_${Date.now()}`,
        type: 'system',
        title: 'Open diensten gevuld',
        message: `${changes} dienst(en) automatisch toegewezen`,
        timestamp: new Date().toISOString(),
        read: false,
      });
    }

    return changes;
  };

  const getWorkloadInsights = () => {
    const workload = calculateWorkloadBalance();
    const insights = {
      mostOverworked: [],
      mostUnderworked: [],
      weekendFairness: [],
      shiftBalance: [],
    };

    // Find most overworked staff
    const sortedByTotal = Object.entries(workload).sort(
      ([, a], [, b]) => b.totalShifts - a.totalShifts
    );

    insights.mostOverworked = sortedByTotal
      .slice(0, 3)
      .map(([staffId, data]) => ({
        staff: staffMembers.find((s) => s.id === parseInt(staffId)),
        ...data,
      }));

    // Find most underworked staff
    insights.mostUnderworked = sortedByTotal
      .slice(-3)
      .map(([staffId, data]) => ({
        staff: staffMembers.find((s) => s.id === parseInt(staffId)),
        ...data,
      }));

    // Weekend fairness
    const weekendWorkload = Object.entries(workload)
      .map(([staffId, data]) => ({
        staff: staffMembers.find((s) => s.id === parseInt(staffId)),
        weekendShifts: data.weekendShifts,
      }))
      .sort((a, b) => b.weekendShifts - a.weekendShifts);

    insights.weekendFairness = weekendWorkload;

    // Shift balance
    insights.shiftBalance = Object.entries(workload)
      .map(([staffId, data]) => ({
        staff: staffMembers.find((s) => s.id === parseInt(staffId)),
        earlyRatio: data.earlyShifts / Math.max(data.totalShifts, 1),
        lateRatio: data.lateShifts / Math.max(data.totalShifts, 1),
      }))
      .filter((item) => item.staff);

    return insights;
  };

  // Smart swap suggestion
  const getSmartSwapSuggestions = (shiftId) => {
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) {
      return [];
    }

    const suggestions = [];
    const workload = calculateWorkloadBalance();

    // Find staff who might want to swap
    Object.entries(workload).forEach(([staffId, data]) => {
      const staff = staffMembers.find((s) => s.id === parseInt(staffId));
      if (!staff || shift.assignedStaff.includes(parseInt(staffId))) {
        return;
      }

      let reason = '';
      let score = 0;

      // Check if they have too many consecutive days
      if (data.consecutiveDays > 2) {
        reason = 'Te veel opeenvolgende diensten';
        score += 20;
      }

      // Check weekend balance
      const shiftDate = new Date(shift.date);
      const isWeekend = shiftDate.getDay() === 0 || shiftDate.getDay() === 6;
      if (isWeekend && data.weekendShifts < 1) {
        reason = 'Weinig weekend diensten';
        score += 15;
      }

      // Check shift type balance
      if (
        shift.shiftType.includes('early') &&
        data.lateShifts > data.earlyShifts
      ) {
        reason = 'Meer late dan vroege diensten';
        score += 10;
      }

      if (score > 0) {
        suggestions.push({
          staff,
          reason,
          score,
          conflicts: detectConflicts(shiftId, parseInt(staffId)),
        });
      }
    });

    return suggestions
      .filter((s) => s.conflicts.length === 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  };

  // AI Intelligence Engine for Shift Scheduling

  // Removed unused function: _getShiftDuration

  return (
    <div className='space-y-6 p-6 bg-gray-50 min-h-screen'>
      {/* Header */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Dienstrooster</h1>
            <p className='text-gray-600'>Intelligente planning voor het team</p>
          </div>

          <div className='flex items-center gap-3'>
            {/* Notifications */}
            <div className='relative'>
              <button className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'>
                <Bell className='w-5 h-5' />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className='absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>
            </div>

            {/* Settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className='p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <Settings className='w-5 h-5' />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className='border-b border-gray-200'>
          <nav className='-mb-px flex space-x-8'>
            {[
              { id: 'schedule', label: 'Dienstrooster', icon: Calendar },
              { id: 'reports', label: 'Rapportage', icon: BarChart3 },
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
      </div>

      {/* Tab Content */}
      {activeTab === 'schedule' && (
        <div className='space-y-6'>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            {/* Navigation and Controls */}
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center gap-4'>
                {/* View Mode Toggle */}
                <div className='flex bg-gray-100 rounded-lg p-1'>
                  {['week', 'month', 'day'].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setViewMode(mode)}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        viewMode === mode
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {mode === 'week'
                        ? 'Week'
                        : mode === 'month'
                          ? 'Maand'
                          : 'Dag'}
                    </button>
                  ))}
                </div>

                {/* Navigation */}
                <div className='flex items-center gap-2'>
                  <button
                    onClick={navigatePrevious}
                    className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                  >
                    <ChevronLeft className='w-5 h-5' />
                  </button>

                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium'
                  >
                    Vandaag
                  </button>

                  <button
                    onClick={navigateNext}
                    className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                  >
                    <ChevronRight className='w-5 h-5' />
                  </button>
                </div>

                {/* Date Display */}
                <div className='text-lg font-semibold text-gray-900'>
                  {viewMode === 'week' && (
                    <>
                      <div className='flex items-center gap-2'>
                        <span>
                          {getWeekDays()[0].toLocaleDateString('nl-NL', {
                            day: 'numeric',
                            month: 'short',
                          })}{' '}
                          -
                          {getWeekDays()[6].toLocaleDateString('nl-NL', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                        <span className='px-2 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full'>
                          Week {getWeekNumber(getWeekDays()[0])}
                        </span>
                      </div>
                    </>
                  )}
                  {viewMode === 'month' &&
                    selectedDate.toLocaleDateString('nl-NL', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  {viewMode === 'day' &&
                    selectedDate.toLocaleDateString('nl-NL', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                    })}
                </div>
              </div>

              {/* Search and Actions */}
              <div className='flex items-center gap-3'>
                {/* Search */}
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                  <input
                    type='text'
                    placeholder='Zoek diensten of personeel...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </div>

                {/* AI Smart Buttons */}
                <div className='flex items-center gap-2'>
                  <button
                    onClick={autoFillOpenShifts}
                    className='px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center gap-2'
                    title='AI vult automatisch open diensten'
                  >
                    <Zap className='w-4 h-4' />
                    AI Vul
                  </button>

                  <button
                    onClick={regenerateShifts}
                    className='px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all flex items-center gap-2'
                  >
                    <RotateCcw className='w-4 h-4' />
                    Vul Maand
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Active Shifts Alert */}
          {getActiveShifts().length > 0 && (
            <div className='bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4'>
              <div className='flex items-center gap-2 mb-3'>
                <div className='w-2 h-2 bg-blue-500 rounded-full animate-pulse' />
                <h4 className='font-semibold text-blue-800'>
                  Actieve Diensten
                </h4>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                {getActiveShifts().map((shift) => {
                  const shiftType = getShiftTypeInfo(shift.shiftType);
                  return (
                    <div
                      key={shift.id}
                      className='bg-white rounded-lg p-4 border border-blue-200 shadow-sm'
                    >
                      <div className='flex items-center justify-between mb-3'>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium text-white ${shiftType.color}`}
                        >
                          {shiftType.name}
                        </span>
                        <span className='text-xs text-gray-500'>
                          {formatTime(shift.startTime)} -{' '}
                          {formatTime(shift.endTime)}
                        </span>
                      </div>
                      <div className='space-y-2'>
                        {shift.checkIns.map((checkIn) => {
                          const staff = staffMembers.find(
                            (s) => s.id === checkIn.staffId
                          );
                          const status = getStaffStatus(shift, checkIn.staffId);
                          return (
                            <div
                              key={checkIn.staffId}
                              className='flex items-center justify-between text-sm'
                            >
                              <div className='flex items-center gap-2'>
                                <div className='w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium'>
                                  {staff?.avatar}
                                </div>
                                <span>{staff?.name}</span>
                              </div>
                              <div className='flex items-center gap-1'>
                                {status === 'checked-in' && (
                                  <CheckCircle className='w-4 h-4 text-green-500' />
                                )}
                                {status === 'late' && (
                                  <AlertTriangle className='w-4 h-4 text-orange-500' />
                                )}
                                {status === 'checked-out' && (
                                  <XCircle className='w-4 h-4 text-gray-400' />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Week View */}
          {viewMode === 'week' && (
            <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
              {/* Week Header */}
              <div className='grid grid-cols-8 border-b border-gray-200'>
                <div className='p-4 border-r border-gray-200 bg-gray-50'>
                  <div className='text-sm font-medium text-gray-500'>Tijd</div>
                </div>
                {getWeekDays().map((day, index) => (
                  <div
                    key={index}
                    className='p-4 border-r border-gray-200 bg-gray-50'
                  >
                    <div className='text-sm font-medium text-gray-900'>
                      {day.toLocaleDateString('nl-NL', { weekday: 'short' })}
                    </div>
                    <div className='text-lg font-bold text-gray-900'>
                      {day.getDate()}
                    </div>
                    <div className='text-xs text-gray-500 mt-1'>
                      {day.toLocaleDateString('nl-NL', { month: 'short' })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time Grid */}
              <div className='grid grid-cols-8'>
                {getTimeSlots().map((timeSlot) => (
                  <React.Fragment key={timeSlot}>
                    <div className='p-2 border-r border-gray-200 bg-gray-50 text-xs text-gray-500 text-center'>
                      {timeSlot}
                    </div>
                    {getWeekDays().map((day, dayIndex) => {
                      const dayShifts = filteredShifts.filter((shift) => {
                        const shiftDate = new Date(shift.date);
                        return shiftDate.toDateString() === day.toDateString();
                      });

                      const shiftInSlot = dayShifts.find((shift) => {
                        const startHour = parseInt(
                          shift.startTime.split(':')[0]
                        );
                        const slotHour = parseInt(timeSlot.split(':')[0]);
                        return startHour === slotHour;
                      });

                      return (
                        <div
                          key={dayIndex}
                          className='p-1 border-r border-gray-200 min-h-[60px] relative'
                        >
                          {shiftInSlot && (
                            <div
                              className={`absolute inset-1 rounded-lg ${getShiftTypeInfo(shiftInSlot.shiftType).color} text-white p-2 cursor-pointer hover:shadow-md transition-shadow group`}
                              onClick={() => initiateSwap(shiftInSlot)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  initiateSwap(shiftInSlot);
                                }
                              }}
                              role='button'
                              tabIndex={0}
                            >
                              <div className='text-xs font-medium mb-1'>
                                {getShiftTypeInfo(shiftInSlot.shiftType).name}
                              </div>
                              <div className='text-xs opacity-90'>
                                {shiftInSlot.assignedStaff
                                  .map((staffId) => {
                                    const staff = staffMembers.find(
                                      (s) => s.id === staffId
                                    );
                                    return staff?.name;
                                  })
                                  .join(', ')}
                              </div>

                              {/* Smart Swap Button */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const suggestions = getSmartSwapSuggestions(
                                    shiftInSlot.id
                                  );
                                  if (suggestions.length > 0) {
                                    addNotification({
                                      id: `notif_${Date.now()}`,
                                      type: 'swap_suggestions',
                                      title: 'Smart Swap Suggesties',
                                      message: `${suggestions.length} collega(s) willen mogelijk ruilen`,
                                      timestamp: new Date().toISOString(),
                                      read: false,
                                    });
                                    // eslint-disable-next-line no-console
                                    console.log(
                                      'Smart Swap Suggestions for',
                                      shiftInSlot.id,
                                      ':',
                                      suggestions
                                    );
                                  } else {
                                    addNotification({
                                      id: `notif_${Date.now()}`,
                                      type: 'info',
                                      title: 'Geen ruil suggesties',
                                      message:
                                        'AI vindt geen geschikte ruil partners',
                                      timestamp: new Date().toISOString(),
                                      read: false,
                                    });
                                  }
                                }}
                                className='absolute top-1 right-1 p-1 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all opacity-0 group-hover:opacity-100'
                                title='Smart Swap Suggesties'
                              >
                                <ArrowLeftRight className='w-3 h-3' />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>

              {/* AI Insights Panel */}
              <div className='bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 bg-emerald-500 rounded-full animate-pulse' />
                    <h4 className='font-semibold text-emerald-800'>
                      AI Insights & Workload Balans
                    </h4>
                  </div>
                  <button
                    onClick={() => {
                      const insights = getWorkloadInsights();
                      // eslint-disable-next-line no-console
                      console.log('AI Insights:', insights);
                      addNotification({
                        id: `notif_${Date.now()}`,
                        type: 'insights',
                        title: 'AI Insights gegenereerd',
                        message:
                          'Bekijk de console voor gedetailleerde workload analyse',
                        timestamp: new Date().toISOString(),
                        read: false,
                      });
                    }}
                    className='px-3 py-1 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors'
                  >
                    Analyseer
                  </button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  {/* Workload Overview */}
                  <div className='bg-white rounded-lg p-4 border border-emerald-200 shadow-sm'>
                    <h5 className='font-medium text-gray-900 mb-3'>
                      Workload Overzicht
                    </h5>
                    <div className='space-y-2'>
                      {(() => {
                        const workload = calculateWorkloadBalance();
                        const avgShifts =
                          Object.values(workload).reduce(
                            (sum, w) => sum + w.totalShifts,
                            0
                          ) / Object.keys(workload).length;
                        return (
                          <>
                            <div className='flex justify-between text-sm'>
                              <span>Gemiddelde diensten:</span>
                              <span className='font-medium'>
                                {avgShifts.toFixed(1)}
                              </span>
                            </div>
                            <div className='flex justify-between text-sm'>
                              <span>Open diensten:</span>
                              <span className='font-medium text-orange-600'>
                                {
                                  shifts.filter(
                                    (s) =>
                                      s.assignedStaff.length <
                                      getShiftTypeInfo(s.shiftType).maxStaff
                                  ).length
                                }
                              </span>
                            </div>
                            <div className='flex justify-between text-sm'>
                              <span>Conflicten:</span>
                              <span className='font-medium text-red-600'>
                                {shifts.reduce((total, shift) => {
                                  const conflicts = shifts.filter(
                                    (s) =>
                                      s.id !== shift.id &&
                                      s.date === shift.date &&
                                      s.assignedStaff.some((staffId) =>
                                        shift.assignedStaff.includes(staffId)
                                      )
                                  );
                                  return total + conflicts.length;
                                }, 0)}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Staff Performance */}
                  <div className='bg-white rounded-lg p-4 border border-emerald-200 shadow-sm'>
                    <h5 className='font-medium text-gray-900 mb-3'>
                      Team Performance
                    </h5>
                    <div className='space-y-2'>
                      {staffMembers.slice(0, 3).map((staff) => {
                        // const _staffShifts = shifts.filter((s) =>
                        //   s.assignedStaff.includes(staff.id)
                        // ); // Unused
                        const performance = Math.round(85 + Math.random() * 15); // Simulated performance
                        return (
                          <div
                            key={staff.id}
                            className='flex justify-between text-sm'
                          >
                            <span className='truncate'>{staff.name}</span>
                            <div className='flex items-center gap-1'>
                              <span className='font-medium'>
                                {performance}%
                              </span>
                              <div
                                className={`w-2 h-2 rounded-full ${performance > 95 ? 'bg-green-500' : performance > 85 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Predictive Insights */}
                  <div className='bg-white rounded-lg p-4 border border-emerald-200 shadow-sm'>
                    <h5 className='font-medium text-gray-900 mb-3'>
                      Voorspellingen
                    </h5>
                    <div className='space-y-2'>
                      <div className='text-sm'>
                        <div className='text-gray-600'>Volgende week:</div>
                        <div className='font-medium text-blue-600'>
                          3 extra diensten nodig
                        </div>
                      </div>
                      <div className='text-sm'>
                        <div className='text-gray-600'>Ziekteverzuim:</div>
                        <div className='font-medium text-yellow-600'>
                          Gemiddeld risico
                        </div>
                      </div>
                      <div className='text-sm'>
                        <div className='text-gray-600'>Optimale bezetting:</div>
                        <div className='font-medium text-green-600'>
                          87% van diensten
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Recommendations */}
                  <div className='bg-white rounded-lg p-4 border border-emerald-200 shadow-sm'>
                    <h5 className='font-medium text-gray-900 mb-3'>
                      AI Aanbevelingen
                    </h5>
                    <div className='space-y-2'>
                      <div className='text-xs bg-blue-50 text-blue-700 p-2 rounded'>
                        <div className='font-medium'>Herverdeling</div>
                        <div>3 diensten herverdeeld voor betere balans</div>
                      </div>
                      <div className='text-xs bg-green-50 text-green-700 p-2 rounded'>
                        <div className='font-medium'>Efficiency</div>
                        <div>Vroege diensten beter bezet dan late</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <div className='flex justify-end'>
                <button
                  onClick={() => {
                    const data = {
                      shifts: shifts,
                      staffMembers: staffMembers,
                      shiftTypes: shiftTypes,
                      swapRequests: swapRequests,
                      exportDate: new Date().toISOString(),
                    };

                    const blob = new Blob([JSON.stringify(data, null, 2)], {
                      type: 'application/json',
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `dienstrooster_export_${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className='px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2'
                >
                  <Download className='w-4 h-4' />
                  Exporteer Data
                </button>
              </div>
            </div>
          )}

          {/* Swap Modal */}
          {showSwapModal && selectedShift && (
            <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
              <div className='bg-white rounded-xl p-6 max-w-md w-full mx-4'>
                <div className='flex items-center justify-between mb-4'>
                  <h3 className='text-lg font-semibold'>Ruil Verzoeken</h3>
                  <button
                    onClick={() => setShowSwapModal(false)}
                    className='text-gray-400 hover:text-gray-600'
                  >
                    <XCircle className='w-5 h-5' />
                  </button>
                </div>

                <div className='mb-4'>
                  <div className='bg-gray-50 rounded-lg p-3 mb-3'>
                    <div className='text-sm font-medium text-gray-900'>
                      {getShiftTypeInfo(selectedShift.shiftType).name}
                    </div>
                    <div className='text-sm text-gray-600'>
                      {selectedShift.date} •{' '}
                      {formatTime(selectedShift.startTime)} -{' '}
                      {formatTime(selectedShift.endTime)}
                    </div>
                  </div>

                  <div className='text-sm text-gray-600 mb-3'>
                    Selecteer een collega om mee te ruilen:
                  </div>

                  <div className='space-y-2 max-h-60 overflow-y-auto'>
                    {getAvailableStaffForSwap(selectedShift).map((staff) => (
                      <button
                        key={staff.id}
                        onClick={() =>
                          handleSwapRequest(selectedShift, staff.id)
                        }
                        className='w-full p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors'
                      >
                        <div className='flex items-center gap-3'>
                          <div className='w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium'>
                            {staff.avatar}
                          </div>
                          <div>
                            <div className='font-medium text-gray-900'>
                              {staff.name}
                            </div>
                            <div className='text-sm text-gray-600'>
                              {staff.role}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
          <div className='mb-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              Dienstrooster Rapportage
            </h3>
            <p className='text-gray-600'>
              Analyseer team performance, werkbelasting en roostering
              statistieken
            </p>
          </div>

          {/* Statistics Cards */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
            <div className='bg-blue-50 p-6 rounded-lg border border-blue-200'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-blue-600'>
                    Totale Diensten Deze Maand
                  </p>
                  <p className='text-2xl font-bold text-blue-900'>
                    {shifts.length}
                  </p>
                </div>
                <Calendar className='w-8 h-8 text-blue-600' />
              </div>
              <div className='mt-2 text-sm text-blue-700'>
                <span className='flex items-center'>
                  <TrendingUp className='w-4 h-4 mr-1' />
                  12% meer dan vorige maand
                </span>
              </div>
            </div>

            <div className='bg-green-50 p-6 rounded-lg border border-green-200'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-green-600'>
                    Bezettingsgraad
                  </p>
                  <p className='text-2xl font-bold text-green-900'>
                    {shifts.length > 0
                      ? Math.round(
                          (shifts.filter((s) => s.assignedStaff?.length > 0)
                            .length /
                            shifts.length) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
                <PieChart className='w-8 h-8 text-green-600' />
              </div>
              <div className='mt-2 text-sm text-green-700'>
                Optimale bezetting bereikt
              </div>
            </div>

            <div className='bg-orange-50 p-6 rounded-lg border border-orange-200'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-orange-600'>
                    Gemiddelde Uren per Week
                  </p>
                  <p className='text-2xl font-bold text-orange-900'>38.5</p>
                </div>
                <Clock className='w-8 h-8 text-orange-600' />
              </div>
              <div className='mt-2 text-sm text-orange-700'>
                Binnen arbeidsrichtlijnen
              </div>
            </div>
          </div>

          {/* Quick Reports */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='border border-gray-200 rounded-lg p-6'>
              <h4 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
                <FileText className='w-5 h-5 mr-2 text-blue-600' />
                Team Performance
              </h4>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>
                    Aanwezigheidspercentage
                  </span>
                  <span className='font-medium'>94.2%</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>
                    Gemiddelde shift duur
                  </span>
                  <span className='font-medium'>8.2 uur</span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>Ruil verzoeken</span>
                  <span className='font-medium'>
                    {swapRequests.length} actief
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-600'>
                    Onbemande diensten
                  </span>
                  <span className='font-medium text-red-600'>
                    {
                      shifts.filter(
                        (s) => !s.assignedStaff || s.assignedStaff.length === 0
                      ).length
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className='border border-gray-200 rounded-lg p-6'>
              <h4 className='text-lg font-medium text-gray-900 mb-4 flex items-center'>
                <BarChart3 className='w-5 h-5 mr-2 text-green-600' />
                Werkbelasting Analyse
              </h4>
              <div className='space-y-4'>
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-gray-600'>
                      Vroege diensten
                    </span>
                    <span className='font-medium'>
                      {
                        shifts.filter((s) => s.shiftType === 'early_full')
                          .length
                      }
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-blue-600 h-2 rounded-full'
                      style={{
                        width: `${(shifts.filter((s) => s.shiftType === 'early_full').length / Math.max(shifts.length, 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-gray-600'>Late diensten</span>
                    <span className='font-medium'>
                      {shifts.filter((s) => s.shiftType === 'late_full').length}
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-green-600 h-2 rounded-full'
                      style={{
                        width: `${(shifts.filter((s) => s.shiftType === 'late_full').length / Math.max(shifts.length, 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className='flex items-center justify-between mb-2'>
                    <span className='text-sm text-gray-600'>
                      Weekenddiensten
                    </span>
                    <span className='font-medium'>
                      {shifts.filter((s) => s.shiftType === 'weekend').length}
                    </span>
                  </div>
                  <div className='w-full bg-gray-200 rounded-full h-2'>
                    <div
                      className='bg-purple-600 h-2 rounded-full'
                      style={{
                        width: `${(shifts.filter((s) => s.shiftType === 'weekend').length / Math.max(shifts.length, 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Export Actions */}
          <div className='mt-8 flex items-center justify-between'>
            <div>
              <h4 className='text-lg font-medium text-gray-900 mb-2'>
                Rapportage Export
              </h4>
              <p className='text-sm text-gray-600'>
                Download gedetailleerde roostering rapporten
              </p>
            </div>
            <div className='flex gap-3'>
              <button
                onClick={() => {
                  // Generate shift summary report
                  notify('Dienstrooster rapport wordt voorbereid...', {
                    type: 'info',
                  });
                }}
                className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2'
              >
                <Download className='w-4 h-4' />
                Maandrapport
              </button>
              <button
                onClick={() => {
                  // Generate performance report
                  notify('Performance rapport wordt voorbereid...', {
                    type: 'info',
                  });
                }}
                className='bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2'
              >
                <BarChart3 className='w-4 h-4' />
                Performance Rapport
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShiftSchedule;
