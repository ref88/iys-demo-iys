# RefuTree VMS - Development Notes

## Project Overview
Refugee Management System built with React + Vite + Tailwind CSS

## Development Commands
```bash
npm run dev         # Start development server (port 3000)
npm run build       # Build for production
npm run preview     # Preview production build
npm run clean       # Clean build artifacts
```

## Component Architecture

### Folder Structure
```
src/components/
├── ui/             # Reusable UI components
│   ├── Button.jsx
│   ├── Modal.jsx
│   ├── Tooltip.jsx
│   ├── LabelChip.jsx
│   └── ProfileImage.jsx
├── forms/          # Forms and modals
│   ├── AddResidentModal.jsx
│   ├── AddLeaveRequestModal.jsx
│   ├── ShiftAssignmentModal.jsx
│   └── ResidentViewModal.jsx
├── dashboard/      # Dashboard related components
│   ├── Dashboard.jsx
│   ├── DashboardAI.jsx
│   ├── ShiftAnalytics.jsx
│   ├── ShiftReport.jsx
│   ├── ShiftSchedule.jsx
│   └── ShiftHandover.jsx
├── residents/      # Resident management
│   └── Residents.jsx
├── auth/           # Authentication
│   ├── AuthContext.jsx
│   ├── LoginPage.jsx
│   └── ProtectedRoute.jsx
└── features/       # Main features
    ├── VMS.jsx (main component)
    ├── LeaveRequests.jsx
    ├── Documents.jsx
    ├── DataExport.jsx
    ├── AIAssistant.jsx
    ├── IncidentManager.jsx
    ├── AuditTrail.jsx
    ├── LabelsManager.jsx
    ├── LabelSelector.jsx
    └── UserSelector.jsx
```

## Tech Stack
- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS 
- **Icons**: Lucide React
- **State**: useReducer for complex state

## Notes
- Main VMS component contains all business logic
- Uses local storage for persistence
- Unsplash API for resident photos
- No backend currently - all client-side

## TODO for Future
- [ ] Add ESLint/Prettier
- [ ] Add TypeScript
- [ ] Separate server/client repos
- [ ] Add testing setup
- [ ] Add API integration