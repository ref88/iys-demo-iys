import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Edit,
  Trash2,
  X,
  Save,
  AlertTriangle,
  Users,
  FileText,
  Heart,
  School,
  Home,
  Clock,
  Star,
  ChevronDown,
  Shield,
  TrendingUp,
  Bell,
  CheckCircle,
  AlertCircle,
  Smartphone,
  Database,
  Settings,
  RefreshCw,
  Eye,
  BarChart3,
  // Nieuwe specifieke label icons
  HourglassIcon as Hourglass,
  Award,
  Ban,
  UserCheck,
  UserX,
  AlertOctagon,
  ArrowUp,
  ArrowDown,
  Minus,
  MessageSquare,
  FileEdit,
  FileX,
  Scale,
  CreditCard,
  Stethoscope,
  Pill,
  GraduationCap,
  BookOpen,
  Languages,
  Briefcase,
  Baby,
  Building,
  Sparkles,
  UserPlus,
  MapPin,
  Calendar,
  Globe,
} from 'lucide-react';
import { useNotifications } from '../../contexts/NotificationContext.jsx';

const LabelsManager = ({ isOpen, onClose, residents, onLabelsUpdate }) => {
  const { notify } = useNotifications();
  const [labels, setLabels] = useState([]);
  const [editingLabel, setEditingLabel] = useState(null);
  const [newLabel, setNewLabel] = useState({
    name: '',
    color: 'blue',
    category: 'general',
    customIcon: null,
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const [iconDropdownOpen, setIconDropdownOpen] = useState(false);

  // Available icons organized by category
  const availableIcons = {
    Status: [
      { name: 'Hourglass', component: Hourglass, label: 'Wachten' },
      { name: 'Award', component: Award, label: 'Toekenning' },
      { name: 'Ban', component: Ban, label: 'Afwijzing' },
      { name: 'UserCheck', component: UserCheck, label: 'Aanwezig' },
      { name: 'UserX', component: UserX, label: 'Afwezig' },
      { name: 'AlertOctagon', component: AlertOctagon, label: 'Waarschuwing' },
      { name: 'CheckCircle', component: CheckCircle, label: 'Voltooid' },
      { name: 'AlertCircle', component: AlertCircle, label: 'Alert' },
    ],
    Prioriteit: [
      { name: 'ArrowUp', component: ArrowUp, label: 'Hoog' },
      { name: 'Minus', component: Minus, label: 'Normaal' },
      { name: 'ArrowDown', component: ArrowDown, label: 'Laag' },
      { name: 'TrendingUp', component: TrendingUp, label: 'Stijgend' },
      { name: 'Star', component: Star, label: 'Favoriet' },
    ],
    Medisch: [
      { name: 'Stethoscope', component: Stethoscope, label: 'Medisch' },
      { name: 'Pill', component: Pill, label: 'Medicatie' },
      { name: 'Heart', component: Heart, label: 'Zorg' },
      { name: 'AlertTriangle', component: AlertTriangle, label: 'Urgent' },
      { name: 'Baby', component: Baby, label: 'Baby' },
    ],
    Juridisch: [
      { name: 'Scale', component: Scale, label: 'Juridisch' },
      { name: 'CreditCard', component: CreditCard, label: 'Identificatie' },
      { name: 'FileText', component: FileText, label: 'Document' },
      { name: 'Shield', component: Shield, label: 'Beveiliging' },
    ],
    Onderwijs: [
      { name: 'GraduationCap', component: GraduationCap, label: 'Onderwijs' },
      { name: 'BookOpen', component: BookOpen, label: 'Studie' },
      { name: 'Languages', component: Languages, label: 'Taal' },
      { name: 'School', component: School, label: 'School' },
      { name: 'Building', component: Building, label: 'Instituut' },
      { name: 'Globe', component: Globe, label: 'Internationaal' },
      { name: 'Sparkles', component: Sparkles, label: 'Speciaal' },
    ],
    Algemeen: [
      { name: 'Tag', component: Tag, label: 'Label' },
      { name: 'Clock', component: Clock, label: 'Tijd' },
      { name: 'MapPin', component: MapPin, label: 'Locatie' },
      { name: 'Calendar', component: Calendar, label: 'Datum' },
      { name: 'Briefcase', component: Briefcase, label: 'Werk' },
      { name: 'UserPlus', component: UserPlus, label: 'Contact' },
      { name: 'Home', component: Home, label: 'Wonen' },
      { name: 'Users', component: Users, label: 'Groep' },
    ],
    Communicatie: [
      { name: 'MessageSquare', component: MessageSquare, label: 'Bericht' },
      { name: 'FileEdit', component: FileEdit, label: 'Bewerken' },
      { name: 'FileX', component: FileX, label: 'Verwijderen' },
      { name: 'Bell', component: Bell, label: 'Notificatie' },
      { name: 'Smartphone', component: Smartphone, label: 'Telefoon' },
    ],
    Systeem: [
      { name: 'Settings', component: Settings, label: 'Instellingen' },
      { name: 'Database', component: Database, label: 'Data' },
      { name: 'RefreshCw', component: RefreshCw, label: 'Vernieuwen' },
      { name: 'Eye', component: Eye, label: 'Bekijken' },
      { name: 'BarChart3', component: BarChart3, label: 'Analyse' },
    ],
  };

  // Predefined label categories
  const categories = [
    { id: 'medical', name: 'Medisch', icon: Heart, color: 'red' },
    { id: 'legal', name: 'Juridisch', icon: FileText, color: 'blue' },
    { id: 'education', name: 'Onderwijs', icon: School, color: 'green' },
    { id: 'housing', name: 'Huisvesting', icon: Home, color: 'purple' },
    { id: 'urgent', name: 'Urgent', icon: AlertTriangle, color: 'orange' },
    { id: 'general', name: 'Algemeen', icon: Tag, color: 'gray' },
    { id: 'system', name: 'Systeem', icon: Shield, color: 'gray' },
  ];

  // Helper function to get icon component by name
  const getIconComponentByName = (iconName) => {
    for (const categoryIcons of Object.values(availableIcons)) {
      const icon = categoryIcons.find((i) => i.name === iconName);
      if (icon) {
        return icon.component;
      }
    }
    return null;
  };

  // Specifieke icons per label naam/type (now with custom icon support)
  const getLabelIcon = (labelName, category, customIcon = null) => {
    // 1. First check for custom icon
    if (customIcon) {
      const IconComponent = getIconComponentByName(customIcon);
      if (IconComponent) {
        return IconComponent;
      }
    }

    // 2. Auto-detected icons based on label name
    const iconMap = {
      // Status labels
      'In procedure': Hourglass,
      Verleend: Award,
      Afgewezen: Ban,
      Aanwezig: UserCheck,
      Afwezig: UserX,
      'Te laat terug': AlertOctagon,

      // Prioriteit labels
      High: ArrowUp,
      Normal: Minus,
      Low: ArrowDown,

      // Waarschuwing labels
      'Mondelinge waarschuwing': MessageSquare,
      '1e geschreven Socius waarschuwing': FileEdit,
      '2e geschreven Socius waarschuwing': FileX,
      'Gemeente waarschuwing': Scale,

      // Juridisch/Legal labels
      'BSN Aangevraagd': CreditCard,
      'BSN ontbreekt': AlertTriangle,
      'IND Sticker': FileText,

      // Age-based labels
      Baby: Baby,
      Peuter: UserPlus,
      Minderjarig: Users,
      Senior: UserCheck,

      // Medisch labels
      Allergieën: Stethoscope,
      Medicatie: Pill,

      // Onderwijs labels
      'School Inschrijving': GraduationCap,
      'Nederlandse Les': Languages,
      Leerplichtig: BookOpen,
      Basisschool: School,
      SBO: Building,
      ISK: Globe,
      'Speciaal Onderwijs': Sparkles,

      // Algemeen labels
      'Werk Zoeken': Briefcase,
      'Huisdier Eigenaar': Heart,
      Begeleider: UserPlus,
      Locatie: MapPin,
      Tijdelijk: Calendar,
    };

    // 3. Fallback: Auto-detected by name or category
    return iconMap[labelName] || getCategoryIcon(category);
  };

  const getCategoryIcon = (category) => {
    const categoryIcons = {
      medical: Stethoscope,
      legal: Scale,
      education: GraduationCap,
      housing: Home,
      urgent: AlertTriangle,
      general: Tag,
      system: Shield,
    };
    return categoryIcons[category] || Tag;
  };

  const colors = [
    {
      name: 'Blauw',
      value: 'blue',
      class: 'bg-blue-100 text-blue-800 border-blue-200',
      bgClass: 'bg-blue-500',
    },
    {
      name: 'Groen',
      value: 'green',
      class: 'bg-green-100 text-green-800 border-green-200',
      bgClass: 'bg-green-500',
    },
    {
      name: 'Rood',
      value: 'red',
      class: 'bg-red-100 text-red-800 border-red-200',
      bgClass: 'bg-red-500',
    },
    {
      name: 'Geel',
      value: 'yellow',
      class: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      bgClass: 'bg-yellow-400',
    },
    {
      name: 'Paars',
      value: 'purple',
      class: 'bg-purple-100 text-purple-800 border-purple-200',
      bgClass: 'bg-purple-500',
    },
    {
      name: 'Oranje',
      value: 'orange',
      class: 'bg-orange-100 text-orange-800 border-orange-200',
      bgClass: 'bg-orange-500',
    },
    {
      name: 'Pink',
      value: 'pink',
      class: 'bg-pink-100 text-pink-800 border-pink-200',
      bgClass: 'bg-pink-500',
    },
    {
      name: 'Grijs',
      value: 'gray',
      class: 'bg-gray-100 text-gray-800 border-gray-200',
      bgClass: 'bg-gray-500',
    },
    {
      name: 'Indigo',
      value: 'indigo',
      class: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      bgClass: 'bg-indigo-500',
    },
    {
      name: 'Turquoise',
      value: 'teal',
      class: 'bg-teal-100 text-teal-800 border-teal-200',
      bgClass: 'bg-teal-500',
    },
    {
      name: 'Lime',
      value: 'lime',
      class: 'bg-lime-100 text-lime-800 border-lime-200',
      bgClass: 'bg-lime-500',
    },
    {
      name: 'Cyaan',
      value: 'cyan',
      class: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      bgClass: 'bg-cyan-500',
    },
    {
      name: 'Fuchsia',
      value: 'fuchsia',
      class: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
      bgClass: 'bg-fuchsia-500',
    },
    {
      name: 'Violet',
      value: 'violet',
      class: 'bg-violet-100 text-violet-800 border-violet-200',
      bgClass: 'bg-violet-500',
    },
    {
      name: 'Amber',
      value: 'amber',
      class: 'bg-amber-100 text-amber-800 border-amber-200',
      bgClass: 'bg-amber-500',
    },
    {
      name: 'Emerald',
      value: 'emerald',
      class: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      bgClass: 'bg-emerald-500',
    },
    {
      name: 'Rose',
      value: 'rose',
      class: 'bg-rose-100 text-rose-800 border-rose-200',
      bgClass: 'bg-rose-500',
    },
    {
      name: 'Sky',
      value: 'sky',
      class: 'bg-sky-100 text-sky-800 border-sky-200',
      bgClass: 'bg-sky-500',
    },
  ];

  // Load labels from localStorage
  useEffect(() => {
    const savedLabels = localStorage.getItem('vms_labels');
    if (savedLabels) {
      setLabels(JSON.parse(savedLabels));
    } else {
      // Initialize with default labels including system labels
      const defaultLabels = [
        // System labels (cannot be deleted)
        {
          id: 1,
          name: 'In procedure',
          color: 'yellow',
          category: 'system',
          isSystem: true,
        },
        {
          id: 2,
          name: 'Verleend',
          color: 'green',
          category: 'system',
          isSystem: true,
        },
        {
          id: 3,
          name: 'Afgewezen',
          color: 'red',
          category: 'system',
          isSystem: true,
        },
        {
          id: 4,
          name: 'Aanwezig',
          color: 'green',
          category: 'system',
          isSystem: true,
        },
        {
          id: 5,
          name: 'Afwezig',
          color: 'orange',
          category: 'system',
          isSystem: true,
        },
        {
          id: 6,
          name: 'Te laat terug',
          color: 'red',
          category: 'system',
          isSystem: true,
        },
        {
          id: 7,
          name: 'High',
          color: 'red',
          category: 'system',
          isSystem: true,
        },
        {
          id: 8,
          name: 'Normal',
          color: 'blue',
          category: 'system',
          isSystem: true,
        },
        {
          id: 9,
          name: 'Low',
          color: 'gray',
          category: 'system',
          isSystem: true,
        },
        {
          id: 17,
          name: 'Mondelinge waarschuwing',
          color: 'yellow',
          category: 'system',
          isSystem: true,
        },
        {
          id: 18,
          name: '1e geschreven Socius waarschuwing',
          color: 'orange',
          category: 'system',
          isSystem: true,
        },
        {
          id: 19,
          name: '2e geschreven Socius waarschuwing',
          color: 'red',
          category: 'system',
          isSystem: true,
        },
        {
          id: 20,
          name: 'Gemeente waarschuwing',
          color: 'red',
          category: 'system',
          isSystem: true,
        },
        {
          id: 26,
          name: 'BSN ontbreekt',
          color: 'orange',
          category: 'system',
          isSystem: true,
          automatic: true,
        },
        {
          id: 27,
          name: 'Baby',
          color: 'pink',
          category: 'system',
          isSystem: true,
          automatic: true,
        },
        {
          id: 28,
          name: 'Peuter',
          color: 'sky',
          category: 'system',
          isSystem: true,
          automatic: true,
        },
        {
          id: 29,
          name: 'Minderjarig',
          color: 'blue',
          category: 'system',
          isSystem: true,
          automatic: true,
        },
        {
          id: 30,
          name: 'Senior',
          color: 'purple',
          category: 'system',
          isSystem: true,
          automatic: true,
        },

        // Regular labels
        { id: 10, name: 'BSN Aangevraagd', color: 'blue', category: 'legal' },
        { id: 11, name: 'IND Sticker', color: 'yellow', category: 'legal' },
        { id: 12, name: 'Allergieën', color: 'red', category: 'medical' },
        { id: 13, name: 'Medicatie', color: 'orange', category: 'medical' },
        {
          id: 14,
          name: 'School Inschrijving',
          color: 'green',
          category: 'education',
        },
        {
          id: 15,
          name: 'Nederlandse Les',
          color: 'purple',
          category: 'education',
        },
        { id: 16, name: 'Werk Zoeken', color: 'blue', category: 'general' },
        {
          id: 21,
          name: 'Leerplichtig',
          color: 'orange',
          category: 'education',
        },
        { id: 22, name: 'Basisschool', color: 'blue', category: 'education' },
        { id: 23, name: 'SBO', color: 'orange', category: 'education' },
        { id: 24, name: 'ISK', color: 'yellow', category: 'education' },
        {
          id: 25,
          name: 'Speciaal Onderwijs',
          color: 'pink',
          category: 'education',
        },
      ];
      setLabels(defaultLabels);
      localStorage.setItem('vms_labels', JSON.stringify(defaultLabels));
    }
  }, []);

  // Update label counts when residents change
  useEffect(() => {
    if (residents && labels.length > 0) {
      const updatedLabels = labels.map((label) => {
        let count = 0;
        residents.forEach((resident) => {
          if (resident.labels && resident.labels.includes(label.id)) {
            count++;
          }
        });
        return { ...label, count };
      });

      setLabels(updatedLabels);
      localStorage.setItem('vms_labels', JSON.stringify(updatedLabels));
    }
  }, [residents, labels]);

  const handleAddLabel = () => {
    if (!newLabel.name.trim()) {
      return;
    }

    // Check for duplicate labels (case-insensitive)
    const normalizedNewName = newLabel.name.trim().toLowerCase();
    const isDuplicate = labels.some(
      (label) => label.name.toLowerCase() === normalizedNewName
    );

    if (isDuplicate) {
      notify(
        'Een label met deze naam bestaat al. Labels zijn niet hoofdlettergevoelig.',
        { type: 'error' }
      );
      return;
    }

    const label = {
      id: Date.now(),
      name: newLabel.name.trim(),
      color: newLabel.color,
      category: newLabel.category,
      customIcon: newLabel.customIcon,
      count: 0,
    };

    const updatedLabels = [...labels, label];
    setLabels(updatedLabels);
    localStorage.setItem('vms_labels', JSON.stringify(updatedLabels));

    setNewLabel({
      name: '',
      color: 'blue',
      category: 'general',
      customIcon: null,
    });
    setShowAddForm(false);

    if (onLabelsUpdate) {
      onLabelsUpdate(updatedLabels);
    }
  };

  const handleEditLabel = (label) => {
    setEditingLabel(label);
    setNewLabel({
      name: label.name,
      color: label.color,
      category: label.category,
      customIcon: label.customIcon || null,
    });
    setShowAddForm(true);
  };

  const handleUpdateLabel = () => {
    if (!newLabel.name.trim()) {
      return;
    }

    // Check for duplicate labels (case-insensitive), excluding the current label being edited
    const normalizedNewName = newLabel.name.trim().toLowerCase();
    const isDuplicate = labels.some(
      (label) =>
        label.id !== editingLabel.id &&
        label.name.toLowerCase() === normalizedNewName
    );

    if (isDuplicate) {
      notify(
        'Een label met deze naam bestaat al. Labels zijn niet hoofdlettergevoelig.',
        { type: 'error' }
      );
      return;
    }

    const updatedLabels = labels.map((label) =>
      label.id === editingLabel.id
        ? {
            ...label,
            name: newLabel.name.trim(),
            color: newLabel.color,
            category: newLabel.category,
            customIcon: newLabel.customIcon,
          }
        : label
    );

    setLabels(updatedLabels);
    localStorage.setItem('vms_labels', JSON.stringify(updatedLabels));

    setEditingLabel(null);
    setNewLabel({
      name: '',
      color: 'blue',
      category: 'general',
      customIcon: null,
    });
    setShowAddForm(false);

    if (onLabelsUpdate) {
      onLabelsUpdate(updatedLabels);
    }
  };

  const handleDeleteLabel = (labelId) => {
    const labelToDelete = labels.find((l) => l.id === labelId);
    if (labelToDelete?.isSystem) {
      notify('Systeemlabels kunnen niet verwijderd worden.', {
        type: 'warning',
      });
      return;
    }

    // eslint-disable-next-line no-alert
    if (window.confirm('Weet je zeker dat je dit label wilt verwijderen?')) {
      const updatedLabels = labels.filter((label) => label.id !== labelId);
      setLabels(updatedLabels);
      localStorage.setItem('vms_labels', JSON.stringify(updatedLabels));

      if (onLabelsUpdate) {
        onLabelsUpdate(updatedLabels);
      }
    }
  };

  // const getColorClass = (color) => {
  //   const colorObj = colors.find((c) => c.value === color);
  //   return colorObj ? colorObj.class : colors[0].class;
  // };

  if (!isOpen) {
    return null;
  }

  const systemLabels = labels.filter((label) => label.category === 'system');
  const regularLabels = labels.filter((label) => label.category !== 'system');

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b'>
          <div className='flex items-center gap-3'>
            <Tag className='w-6 h-6 text-blue-600' />
            <h2 className='text-xl font-semibold text-gray-900'>
              Labels Beheren
            </h2>
          </div>
          <div className='flex items-center gap-3'>
            <button
              onClick={onClose}
              className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <X className='w-5 h-5' />
            </button>
          </div>
        </div>

        <div className='flex h-[calc(90vh-140px)]'>
          {/* Main Content */}
          <div className='flex-1 p-6 overflow-y-auto'>
            {/* Add/Edit Form */}
            {showAddForm && (
              <div className='bg-gray-50 rounded-lg p-4 mb-6'>
                <h3 className='font-semibold text-gray-900 mb-4'>
                  {editingLabel ? 'Label Bewerken' : 'Nieuw Label Toevoegen'}
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  <div>
                    <label
                      htmlFor='label-name-input'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Naam
                    </label>
                    <input
                      id='label-name-input'
                      type='text'
                      value={newLabel.name}
                      onChange={(e) =>
                        setNewLabel({ ...newLabel, name: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                      placeholder='Label naam'
                    />
                  </div>
                  <div>
                    <label
                      htmlFor='label-category-select'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Categorie
                    </label>
                    <select
                      id='label-category-select'
                      value={newLabel.category}
                      onChange={(e) =>
                        setNewLabel({ ...newLabel, category: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor='label-color-button'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Kleur
                    </label>
                    <div className='relative'>
                      <button
                        id='label-color-button'
                        type='button'
                        onClick={() => setColorDropdownOpen(!colorDropdownOpen)}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between'
                      >
                        <div className='flex items-center gap-2'>
                          <div
                            className={`w-4 h-4 rounded-full ${colors.find((c) => c.value === newLabel.color)?.bgClass || 'bg-blue-500'}`}
                          />
                          <span>
                            {colors.find((c) => c.value === newLabel.color)
                              ?.name || 'Blauw'}
                          </span>
                        </div>
                        <ChevronDown className='w-4 h-4 text-gray-400' />
                      </button>
                      {colorDropdownOpen && (
                        <div className='absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg'>
                          {colors.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => {
                                setNewLabel({
                                  ...newLabel,
                                  color: color.value,
                                });
                                setColorDropdownOpen(false);
                              }}
                              className='w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors'
                            >
                              <div
                                className={`w-4 h-4 rounded-full ${color.bgClass}`}
                              />
                              <span>{color.name}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label
                      htmlFor='label-icon-button'
                      className='block text-sm font-medium text-gray-700 mb-1'
                    >
                      Icoon
                    </label>
                    <div className='relative'>
                      <button
                        id='label-icon-button'
                        type='button'
                        onClick={() => setIconDropdownOpen(!iconDropdownOpen)}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center justify-between'
                      >
                        <div className='flex items-center gap-2'>
                          {newLabel.customIcon ? (
                            <>
                              {(() => {
                                const IconComponent = getIconComponentByName(
                                  newLabel.customIcon
                                );
                                return IconComponent ? (
                                  <IconComponent className='w-4 h-4 text-gray-600' />
                                ) : (
                                  <Tag className='w-4 h-4 text-gray-600' />
                                );
                              })()}
                              <span>
                                {availableIcons[
                                  Object.keys(availableIcons).find((cat) =>
                                    availableIcons[cat].some(
                                      (icon) =>
                                        icon.name === newLabel.customIcon
                                    )
                                  )
                                ]?.find(
                                  (icon) => icon.name === newLabel.customIcon
                                )?.label || newLabel.customIcon}
                              </span>
                            </>
                          ) : (
                            <>
                              <Tag className='w-4 h-4 text-gray-600' />
                              <span>Automatisch</span>
                            </>
                          )}
                        </div>
                        <ChevronDown className='w-4 h-4 text-gray-400' />
                      </button>
                      {iconDropdownOpen && (
                        <div className='absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto'>
                          {/* Auto option */}
                          <button
                            onClick={() => {
                              setNewLabel({ ...newLabel, customIcon: null });
                              setIconDropdownOpen(false);
                            }}
                            className='w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors border-b'
                          >
                            <Tag className='w-4 h-4 text-gray-600' />
                            <span>Automatisch</span>
                          </button>
                          {/* Icon categories */}
                          {Object.entries(availableIcons).map(
                            ([categoryName, categoryIcons]) => (
                              <div
                                key={categoryName}
                                className='border-b last:border-b-0'
                              >
                                <div className='px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-700 border-b'>
                                  {categoryName}
                                </div>
                                {categoryIcons.map((icon) => (
                                  <button
                                    key={icon.name}
                                    onClick={() => {
                                      setNewLabel({
                                        ...newLabel,
                                        customIcon: icon.name,
                                      });
                                      setIconDropdownOpen(false);
                                    }}
                                    className='w-full px-3 py-2 flex items-center gap-2 hover:bg-gray-50 transition-colors'
                                  >
                                    <icon.component className='w-4 h-4 text-gray-600' />
                                    <span>{icon.label}</span>
                                  </button>
                                ))}
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-3 mt-4'>
                  <button
                    onClick={editingLabel ? handleUpdateLabel : handleAddLabel}
                    className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2'
                  >
                    <Save className='w-4 h-4' />
                    {editingLabel ? 'Bijwerken' : 'Toevoegen'}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingLabel(null);
                      setNewLabel({
                        name: '',
                        color: 'blue',
                        category: 'general',
                        customIcon: null,
                      });
                      setColorDropdownOpen(false);
                      setIconDropdownOpen(false);
                    }}
                    className='px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors'
                  >
                    Annuleren
                  </button>
                </div>
              </div>
            )}

            {/* Add Button */}
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className='mb-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2'
              >
                <Plus className='w-4 h-4' />
                Nieuw Label
              </button>
            )}

            {/* System Labels */}
            <div className='mb-8'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                <Shield className='w-5 h-5 text-blue-600' />
                Systeemlabels
                <span className='text-sm text-gray-500 font-normal'>
                  (niet verwijderbaar)
                </span>
              </h3>
              <div className='space-y-3'>
                {systemLabels.map((label) => {
                  const IconComponent = getLabelIcon(
                    label.name,
                    label.category,
                    label.customIcon
                  );
                  return (
                    <div
                      key={label.id}
                      className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='flex items-center gap-2'>
                          <IconComponent className='w-4 h-4 text-gray-600' />
                          <div
                            className={`w-4 h-4 rounded-full ${colors.find((c) => c.value === label.color)?.bgClass}`}
                          />
                        </div>
                        <span className='font-medium'>{label.name}</span>
                        <span className='text-sm text-gray-500'>
                          (
                          {residents?.filter(
                            (r) => r.labels && r.labels.includes(label.id)
                          ).length || 0}{' '}
                          bewoners)
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => handleEditLabel(label)}
                          className='p-1 text-gray-400 hover:text-blue-600 transition-colors'
                          title='Kleur aanpassen'
                        >
                          <Edit className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Regular Labels */}
            <div>
              <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2'>
                <Tag className='w-5 h-5 text-green-600' />
                Vrije Labels
              </h3>
              <div className='space-y-3'>
                {regularLabels.map((label) => {
                  const IconComponent = getLabelIcon(
                    label.name,
                    label.category,
                    label.customIcon
                  );
                  return (
                    <div
                      key={label.id}
                      className='flex items-center justify-between p-3 bg-white rounded-lg border hover:bg-gray-50'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='flex items-center gap-2'>
                          <IconComponent className='w-4 h-4 text-gray-600' />
                          <div
                            className={`w-4 h-4 rounded-full ${colors.find((c) => c.value === label.color)?.bgClass}`}
                          />
                        </div>
                        <span className='font-medium'>{label.name}</span>
                        <span className='text-sm text-gray-500'>
                          (
                          {residents?.filter(
                            (r) => r.labels && r.labels.includes(label.id)
                          ).length || 0}{' '}
                          bewoners)
                        </span>
                        <span className='text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded'>
                          {
                            categories.find((c) => c.id === label.category)
                              ?.name
                          }
                        </span>
                      </div>
                      <div className='flex items-center gap-2'>
                        <button
                          onClick={() => handleEditLabel(label)}
                          className='p-1 text-gray-400 hover:text-blue-600 transition-colors'
                          title='Bewerken'
                        >
                          <Edit className='w-4 h-4' />
                        </button>
                        <button
                          onClick={() => handleDeleteLabel(label.id)}
                          className='p-1 text-gray-400 hover:text-red-600 transition-colors'
                          title='Verwijderen'
                        >
                          <Trash2 className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Statistics */}
            <div className='mt-8 bg-gray-50 rounded-lg p-6'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                Label Statistieken
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='bg-white rounded-lg p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Tag className='w-5 h-5 text-blue-600' />
                    <span className='font-semibold'>Totaal Labels</span>
                  </div>
                  <p className='text-2xl font-bold text-gray-900'>
                    {labels.length}
                  </p>
                </div>
                <div className='bg-white rounded-lg p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Users className='w-5 h-5 text-green-600' />
                    <span className='font-semibold'>Gelabelde Bewoners</span>
                  </div>
                  <p className='text-2xl font-bold text-gray-900'>
                    {residents?.filter((r) => r.labels && r.labels.length > 0)
                      .length || 0}{' '}
                    van {residents?.length || 0}
                  </p>
                </div>
                <div className='bg-white rounded-lg p-4'>
                  <div className='flex items-center gap-2 mb-2'>
                    <Star className='w-5 h-5 text-yellow-600' />
                    <span className='font-semibold'>Meest Gebruikt</span>
                  </div>
                  <p className='text-sm text-gray-600'>
                    {labels.length > 0
                      ? labels.reduce((max, label) =>
                          label.count > max.count ? label : max
                        ).name
                      : 'Geen'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelsManager;
