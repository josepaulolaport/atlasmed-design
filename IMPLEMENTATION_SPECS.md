# Atlasmed Design - Missing Screens Implementation Specifications

**Project:** Atlasmed Salesman App Design System  
**Framework:** React 18.3.1 (loaded via CDN) + Babel Standalone  
**Date:** May 7, 2026  
**Status:** 74% Complete (52/70 screens)

---

## 📋 TABLE OF CONTENTS

1. [Project Context](#project-context)
2. [Design System Guidelines](#design-system-guidelines)
3. [Implementation Tasks Overview](#implementation-tasks-overview)
4. [Phase 1: Critical Path](#phase-1-critical-path)
5. [Phase 2: Enhanced UX](#phase-2-enhanced-ux)
6. [Phase 3: Complete Experience](#phase-3-complete-experience)

---

## PROJECT CONTEXT

### About Atlasmed
Atlasmed is a pharmaceutical sales representative mobile application. Sales reps use it to:
- Manage clinic and doctor relationships
- Track visits and follow-ups
- Place orders for medical products
- Access sales presentations
- View performance metrics

### Current Architecture
- **Static HTML project** with React components loaded via CDN
- **No build process** - JSX transpiled in-browser via Babel Standalone
- **Component location:** `/components/*.jsx`
- **Main entry:** `/index.html`
- **Navigation:** Top nav bar with tabs (BI, Login, Explorar, Mapa, Pedidos, Apresentações, Perfil)

### Existing Components
- `AtlasTopBar` - Navigation bar (used on all screens)
- `IOSDevice` / `AndroidDevice` - Phone frame wrappers
- `DesignCanvas`, `DCSection`, `DCArtboard` - Layout components
- All data is mocked inline in each component file

---

## DESIGN SYSTEM GUIDELINES

### Color Palette
```javascript
const ATLAS_COLORS = {
  // Primary
  navyDeep: '#0a2f7f',    // Main brand color
  navyBright: '#1e40af',  // Interactive elements
  
  // Accent
  green: '#16a373',       // Success, active clients
  amber: '#c6861b',       // Warnings, opportunities
  red: '#b84545',         // Errors, inactive
  
  // Neutrals
  gray900: '#0f1729',     // Headings
  gray700: '#374151',     // Body text
  gray500: '#6b7280',     // Secondary text
  gray400: '#9ca3af',     // Disabled text
  gray300: '#d1d5db',     // Borders
  gray100: '#f3f4f6',     // Backgrounds
  
  // Surfaces
  background: '#f7f8fb',  // App background
  cardBg: '#fff',         // Card background
  border: '#eef0f3',      // Card borders
};
```

### Typography
- **Font:** Inter (loaded from Google Fonts)
- **Headings:** 700 weight, -0.5 letter-spacing
- **Body:** 400-500 weight
- **Labels:** 600-700 weight, uppercase, 0.6-1.2 letter-spacing

### Common Patterns

#### Card Component
```javascript
<div style={{
  background: '#fff',
  border: '1px solid #eef0f3',
  borderRadius: 14,
  padding: 16,
  boxShadow: '0 1px 2px rgba(15,23,41,0.03)',
}}>
  {children}
</div>
```

#### Section Header
```javascript
<div style={{
  fontSize: 11, fontWeight: 700, color: '#8a94a6',
  letterSpacing: 0.6, textTransform: 'uppercase',
  padding: '20px 20px 10px',
}}>
  {title}
</div>
```

#### Button Primary
```javascript
<button style={{
  background: '#0a2f7f',
  color: '#fff',
  border: 'none',
  borderRadius: 12,
  padding: '12px 16px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
  fontFamily: 'Inter, system-ui',
}}>
  {label}
</button>
```

#### Status Chip
```javascript
<span style={{
  display: 'inline-flex',
  alignItems: 'center',
  gap: 5,
  padding: '3px 9px',
  borderRadius: 999,
  background: 'rgba(22,163,115,0.12)',
  color: '#16a373',
  fontSize: 11,
  fontWeight: 600,
}}>
  <span style={{
    width: 5, height: 5, borderRadius: 3,
    background: '#16a373'
  }}/>
  Active
</span>
```

### Layout Structure
All screens follow this structure:
```javascript
function ScreenName() {
  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      background: '#f7f8fb',
      fontFamily: 'Inter, system-ui',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
    }}>
      <AtlasTopBar page="PageName" active="pageKey"/>
      {/* Screen content */}
    </div>
  );
}
```

---

## IMPLEMENTATION TASKS OVERVIEW

| Phase | Task ID | Screen Name | Priority | Complexity | Est. Time |
|-------|---------|-------------|----------|------------|-----------|
| 1 | TASK-001 | Clinic Selector | Critical | Medium | 4h |
| 1 | TASK-002 | Doctor Selector | Critical | Medium | 3h |
| 1 | TASK-003 | Edit Suggestion Modal | Critical | High | 6h |
| 1 | TASK-004 | Photo Gallery Viewer | Critical | Medium | 4h |
| 2 | TASK-005 | Visit History Full List | High | Medium | 4h |
| 2 | TASK-006 | Products Full List | High | Medium | 3h |
| 2 | TASK-007 | Work Hours Editor | High | Low | 2h |
| 2 | TASK-008 | Profile Editor | High | Medium | 3h |
| 3 | TASK-009 | Territory Full Map | Medium | High | 5h |
| 3 | TASK-010 | Activity Full List | Medium | Low | 2h |
| 3 | TASK-011 | Help Center | Medium | Medium | 3h |
| 3 | TASK-012 | Support Chat | Medium | High | 5h |
| 3 | TASK-013 | Terms & Privacy | Low | Low | 1h |
| 3 | TASK-014 | Language Selector | Low | Low | 2h |
| 3 | TASK-015 | Nearby Clinics Expanded | Low | Low | 2h |
| 3 | TASK-016 | Presentation Filters | Low | Low | 2h |
| 3 | TASK-017 | Order Live Tracking | Low | High | 5h |
| 3 | TASK-018 | BI Drill-down Screens | Low | Medium | 4h |

**Total Estimated Time:** 60 hours  
**Phase 1 (Critical):** 17 hours  
**Phase 2 (Enhanced):** 12 hours  
**Phase 3 (Complete):** 31 hours

---

# PHASE 1: CRITICAL PATH

These screens block core user flows and must be implemented first.

---

## TASK-001: Clinic Selector Screen

**Priority:** Critical  
**Complexity:** Medium  
**Estimated Time:** 4 hours  
**Dependencies:** None  
**File to create:** `/components/clinic-selector.jsx`

### Context
This screen appears when a sales rep is creating a new order during checkout. They need to select which clinic will receive the order. Currently, the checkout screen shows a `SelectorField` with placeholder text "Selecionar clínica…" but clicking it does nothing.

### User Flow
1. User is on Checkout screen (`CheckoutScreen` in `atlas-pedidos.jsx`)
2. User taps "Selecionar clínica…" field
3. Bottom sheet slides up with clinic selector
4. User can search, filter, or scroll through recent/all clinics
5. User selects a clinic
6. Sheet closes, selected clinic appears in checkout form

### Requirements

#### Visual Design
- **Layout:** Bottom sheet (slide up from bottom, 85% screen height)
- **Header:** 
  - Handle bar (40px width, 4px height, #d1d5db, centered)
  - Title: "Selecionar clínica" (17px, 700 weight)
  - Close button (top right, X icon)
- **Search bar:**
  - Magnifying glass icon (left)
  - Placeholder: "Buscar clínica, bairro…"
  - Clear button (X) when typing
  - Height: 44px, border-radius: 12px
- **Tabs:** 
  - "Recentes" | "Todas"
  - Active tab: navy background (#0a2f7f), white text
  - Inactive: transparent, gray text
- **Clinic rows:**
  - Clinic icon (44x44, rounded square)
  - Clinic name (14px, 600 weight)
  - Address (12px, gray)
  - Distance (11px, right aligned)
  - Status chip (if relevant)
  - Chevron right arrow
- **Empty state:** 
  - Icon: search/empty illustration
  - Text: "Nenhuma clínica encontrada"
  - Sub-text: "Tente outra busca"

#### Data Structure
```javascript
const MOCK_CLINICS_FOR_SELECTOR = [
  {
    id: 'c-0',
    name: 'Clínica Santa Mônica',
    address: 'R. Joaquim Floriano, 871 — Itaim Bibi',
    city: 'São Paulo',
    distance: 2.3,
    status: { label: 'Ativa', color: '#16a373', bg: 'rgba(22,163,115,0.12)' },
    lastOrder: '17 abr',
    isRecent: true,
  },
  {
    id: 'c-14',
    name: 'Centro Médico OrtoVita',
    address: 'Av. Paulista, 1578 — Bela Vista',
    city: 'São Paulo',
    distance: 1.8,
    status: { label: 'Ativa', color: '#16a373', bg: 'rgba(22,163,115,0.12)' },
    lastOrder: '14 abr',
    isRecent: true,
  },
  {
    id: 'c-27',
    name: 'Instituto CardioMed',
    address: 'R. Augusta, 2410 — Jardins',
    city: 'São Paulo',
    distance: 3.1,
    status: { label: 'Em negociação', color: '#c6861b', bg: 'rgba(198,134,27,0.14)' },
    isRecent: false,
  },
  // ... add 10-15 more mock clinics
];
```

#### Functionality
1. **Recent tab:** Shows clinics sorted by `lastOrder` (most recent first)
2. **All tab:** Shows all clinics sorted by `distance` (closest first)
3. **Search:** Filters by clinic name, address, or city (case-insensitive)
4. **Selection:** onClick fires callback with selected clinic object
5. **Close:** Clicking backdrop or X button closes sheet

#### Component Structure
```javascript
function ClinicSelectorSheet({ open, onClose, onSelect, preSelected = null }) {
  const [tab, setTab] = React.useState('recentes');
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Filter logic
  const filtered = MOCK_CLINICS_FOR_SELECTOR.filter(c => {
    const matchTab = tab === 'recentes' ? c.isRecent : true;
    const matchSearch = !searchQuery || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchTab && matchSearch;
  });
  
  const handleSelect = (clinic) => {
    onSelect(clinic);
    onClose();
  };
  
  return (
    <BottomSheet open={open} onClose={onClose} height="85%">
      {/* Implementation */}
    </BottomSheet>
  );
}

// Export to window for use in CheckoutScreen
Object.assign(window, { ClinicSelectorSheet });
```

#### Integration Points
- Import in `index.html` via: `<script type="text/babel" src="components/clinic-selector.jsx"></script>`
- Modify `CheckoutScreen` in `atlas-pedidos.jsx` to:
  - Add state: `const [clinicSelectorOpen, setClinicSelectorOpen] = React.useState(false)`
  - Wire up `SelectorField` onClick
  - Handle selection callback

#### Testing Checklist
- [ ] Sheet opens on tap
- [ ] Tabs switch correctly
- [ ] Search filters results in real-time
- [ ] Empty state shows when no results
- [ ] Selection updates checkout screen
- [ ] Sheet closes on backdrop tap
- [ ] Sheet closes on X button
- [ ] Visual matches design system

---

## TASK-002: Doctor Selector Screen

**Priority:** Critical  
**Complexity:** Medium  
**Estimated Time:** 3 hours  
**Dependencies:** TASK-001 (similar pattern)  
**File to create:** `/components/doctor-selector.jsx`

### Context
After selecting a clinic in checkout, the user must select which doctor at that clinic will receive the order. The doctor list should be filtered to only show doctors who work at the selected clinic.

### User Flow
1. User has selected a clinic in checkout
2. User taps "Selecionar médico…" field
3. Bottom sheet slides up with doctor selector
4. Shows only doctors from the selected clinic
5. User can search or scroll through doctors
6. User selects a doctor
7. Sheet closes, selected doctor appears in checkout form

### Requirements

#### Visual Design
- **Layout:** Bottom sheet (slide up from bottom, 75% screen height)
- **Header:** 
  - Handle bar
  - Title: "Selecionar médico"
  - Subtitle: "{Clinic name}" (12px, gray, below title)
  - Close button
- **Search bar:**
  - Placeholder: "Buscar médico, especialidade…"
  - Same styling as clinic selector
- **Doctor rows:**
  - Avatar circle with initials (44x44)
  - Doctor name (14px, 600 weight)
  - Specialty (12px, navy color)
  - CRM number (11px, gray)
  - Chevron right

#### Data Structure
```javascript
const MOCK_DOCTORS_FOR_SELECTOR = [
  {
    id: 'd-0',
    name: 'Dra. Mariana Silva',
    initials: 'MS',
    hue: 12,
    specialty: 'Ortopedia',
    crm: 'CRM/SP 142.801',
    clinics: ['c-0', 'c-14'], // Array of clinic IDs where they work
    role: 'Decisora',
  },
  {
    id: 'd-1',
    name: 'Dr. Paulo Cardoso',
    initials: 'PC',
    hue: 150,
    specialty: 'Cardiologia',
    crm: 'CRM/SP 087.211',
    clinics: ['c-0'],
  },
  {
    id: 'd-2',
    name: 'Dra. Helena Ferreira',
    initials: 'HF',
    hue: 280,
    specialty: 'Ortopedia',
    crm: 'CRM/SP 198.442',
    clinics: ['c-0', 'c-27'],
  },
  // ... add 8-12 more mock doctors
];
```

#### Functionality
1. **Filter by clinic:** Only show doctors where `clinics` array includes selected clinic ID
2. **Search:** Filter by name, specialty, or CRM
3. **Sort:** Alphabetical by name
4. **Selection:** onClick fires callback with selected doctor object
5. **Empty state:** "Nenhum médico cadastrado nesta clínica" + "Adicionar médico" button

#### Component Structure
```javascript
function DoctorSelectorSheet({ open, onClose, onSelect, selectedClinic, preSelected = null }) {
  const [searchQuery, setSearchQuery] = React.useState('');
  
  // Filter doctors by selected clinic
  const clinicDoctors = MOCK_DOCTORS_FOR_SELECTOR.filter(d => 
    d.clinics.includes(selectedClinic?.id)
  );
  
  // Apply search filter
  const filtered = clinicDoctors.filter(d => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.specialty.toLowerCase().includes(q) ||
      d.crm.toLowerCase().includes(q)
    );
  });
  
  const handleSelect = (doctor) => {
    onSelect(doctor);
    onClose();
  };
  
  return (
    <BottomSheet open={open} onClose={onClose} height="75%">
      {/* Implementation */}
    </BottomSheet>
  );
}

Object.assign(window, { DoctorSelectorSheet });
```

#### Integration Points
- Import in `index.html`
- Modify `CheckoutScreen` to:
  - Add state: `const [doctorSelectorOpen, setDoctorSelectorOpen] = React.useState(false)`
  - Wire up second `SelectorField` onClick
  - Only enable doctor selector after clinic is selected
  - Handle selection callback

#### Special Cases
- If clinic has no doctors: Show empty state with "Adicionar médico" button
- If search returns no results: Show "Nenhum médico encontrado"
- Disable doctor field until clinic is selected

#### Testing Checklist
- [ ] Sheet only opens after clinic selected
- [ ] Shows only doctors from selected clinic
- [ ] Search filters correctly
- [ ] Empty state displays properly
- [ ] Selection updates checkout screen
- [ ] Visual matches design system

---

## TASK-003: Edit Suggestion Modal

**Priority:** Critical  
**Complexity:** High  
**Estimated Time:** 6 hours  
**Dependencies:** None  
**File to create:** `/components/edit-suggestion-modal.jsx`

### Context
Throughout the app, there are pencil icons (✏️) next to editable fields on clinic and doctor profiles. These allow sales reps to suggest corrections to administrative data (phone numbers, addresses, personal info, etc.). Currently, these pencils are rendered but do nothing. All edit suggestions go through administrative review before being applied.

### User Flow
1. User is viewing clinic or doctor detail screen
2. User taps pencil icon next to a field (e.g., phone number)
3. Modal slides up with edit form
4. User sees current value and can propose new value
5. User optionally adds a reason/note
6. User submits suggestion
7. Confirmation toast appears
8. Modal closes

### Requirements

#### Visual Design
- **Layout:** Bottom sheet (slide up from bottom, height adjusts to content)
- **Header:**
  - Pencil icon (circle background, navy)
  - Title: "Sugerir alteração"
  - Subtitle: "Passa por revisão administrativa"
  - Close button (X)
- **Field being edited:**
  - Label: Field name (e.g., "Telefone", "Endereço")
  - Current value (shown in read-only gray box)
  - Arrow down icon
  - New value input (white, editable)
- **Reason section:**
  - Label: "Motivo (opcional)"
  - Textarea: "Por que esta alteração é necessária?"
  - Character count: "0/200"
- **Actions:**
  - Cancel button (secondary, gray)
  - Submit button (primary, navy, "Enviar sugestão")
- **Success state:**
  - Toast notification: "Sugestão enviada para revisão ✓"
  - Green background, white text
  - Auto-dismiss after 3 seconds

#### Data Structure
```javascript
const EDITABLE_FIELDS = {
  // Clinic fields
  clinicPhone: { label: 'Telefone', type: 'tel', validation: 'phone' },
  clinicEmail: { label: 'E-mail', type: 'email', validation: 'email' },
  clinicAddress: { label: 'Endereço', type: 'textarea', validation: 'text' },
  clinicWebsite: { label: 'Site', type: 'url', validation: 'url' },
  clinicHours: { label: 'Horário', type: 'text', validation: 'text' },
  clinicCnpj: { label: 'CNPJ', type: 'text', validation: 'cnpj' },
  
  // Doctor fields
  doctorPhone: { label: 'Telefone', type: 'tel', validation: 'phone' },
  doctorEmail: { label: 'E-mail', type: 'email', validation: 'email' },
  doctorWhatsapp: { label: 'WhatsApp', type: 'tel', validation: 'phone' },
  doctorBirthday: { label: 'Aniversário', type: 'text', validation: 'text' },
  doctorTeam: { label: 'Time', type: 'text', validation: 'text' },
  doctorInterests: { label: 'Interesses', type: 'text', validation: 'text' },
  doctorLanguage: { label: 'Idiomas', type: 'text', validation: 'text' },
};

// Suggestion object structure
const editSuggestion = {
  id: 'sug-' + Date.now(),
  entityType: 'clinic', // or 'doctor'
  entityId: 'c-0',
  fieldKey: 'clinicPhone',
  currentValue: '(11) 3078-4522',
  proposedValue: '(11) 3078-4523',
  reason: 'Cliente informou que o número mudou',
  submittedBy: 'rafael.melo@atlasmed.com',
  submittedAt: new Date().toISOString(),
  status: 'pending', // pending | approved | rejected
};
```

#### Functionality
1. **Field validation:**
   - Phone: Format (11) 9XXXX-XXXX
   - Email: Standard email validation
   - CNPJ: Format XX.XXX.XXX/XXXX-XX
   - URL: Must start with http:// or https://
2. **Submit:**
   - Validate new value
   - Show error if invalid
   - Show success toast on submit
   - Log to console (in real app would POST to API)
3. **Empty value handling:**
   - If current value is "—" or empty, show "Completar" chip
   - New value can add missing information

#### Component Structure
```javascript
function EditSuggestionModal({
  open,
  onClose,
  fieldKey,
  currentValue,
  entityType,
  entityId,
  entityName,
}) {
  const [newValue, setNewValue] = React.useState('');
  const [reason, setReason] = React.useState('');
  const [error, setError] = React.useState('');
  const [showSuccess, setShowSuccess] = React.useState(false);
  
  const fieldConfig = EDITABLE_FIELDS[fieldKey];
  
  const validate = (value) => {
    // Validation logic based on fieldConfig.validation
    return true; // or error message
  };
  
  const handleSubmit = () => {
    if (!validate(newValue)) {
      setError('Valor inválido');
      return;
    }
    
    const suggestion = {
      id: 'sug-' + Date.now(),
      entityType,
      entityId,
      fieldKey,
      currentValue,
      proposedValue: newValue,
      reason,
      submittedBy: 'rafael.melo@atlasmed.com',
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };
    
    console.log('Edit suggestion submitted:', suggestion);
    
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 2000);
  };
  
  return (
    <>
      <BottomSheet open={open} onClose={onClose}>
        {/* Modal content */}
      </BottomSheet>
      
      {showSuccess && (
        <Toast message="Sugestão enviada para revisão ✓" />
      )}
    </>
  );
}

// Toast component for success feedback
function Toast({ message }) {
  return (
    <div style={{
      position: 'fixed',
      top: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      background: '#16a373',
      color: '#fff',
      padding: '12px 20px',
      borderRadius: 12,
      fontSize: 14,
      fontWeight: 600,
      boxShadow: '0 8px 24px rgba(22,163,115,0.4)',
      animation: 'slideDown 300ms ease',
    }}>
      {message}
    </div>
  );
}

Object.assign(window, { EditSuggestionModal, EDITABLE_FIELDS });
```

#### Integration Points
- Import in `index.html`
- Modify `EditPencilButton` in `atlas-clinic.jsx` and `atlas-doctor.jsx`:
  - Add onClick handler to open modal
  - Pass field metadata (fieldKey, currentValue, etc.)
- Modify `EmptyChip` component similarly

#### Special Cases
- **Completing empty fields:** 
  - currentValue = "—"
  - Label changes to "Adicionar {field name}"
- **Monospace fields (phone, CNPJ):**
  - Use monospace font in current value display
  - Format as user types
- **Long fields (address):**
  - Use textarea instead of input
  - Auto-expand as user types

#### Testing Checklist
- [ ] Modal opens from pencil icon
- [ ] Current value displays correctly
- [ ] Input accepts new value
- [ ] Validation works for each field type
- [ ] Error messages display
- [ ] Reason field is optional
- [ ] Submit creates suggestion object
- [ ] Success toast appears
- [ ] Modal closes after submit
- [ ] Works for both clinic and doctor fields

---

## TASK-004: Photo Gallery Viewer

**Priority:** Critical  
**Complexity:** Medium  
**Estimated Time:** 4 hours  
**Dependencies:** None  
**File to create:** `/components/photo-gallery-viewer.jsx`

### Context
Both clinic and doctor detail screens have a `PhotosButton` that shows thumbnail previews. Tapping this button should open a full-screen photo gallery where users can view all photos, add new photos, and see metadata.

### User Flow
1. User is on clinic or doctor detail screen
2. User taps "Fotos" button with stacked thumbnail previews
3. Full-screen gallery slides up
4. User can swipe through photos
5. User can tap "+" to add new photo (opens camera or file picker)
6. User can tap "×" to close gallery
7. Returns to detail screen

### Requirements

#### Visual Design
- **Layout:** Full screen overlay (position: fixed, inset: 0)
- **Background:** Dark semi-transparent (#000 at 85% opacity)
- **Header (floating):**
  - Close button (X, top left, white)
  - Photo counter: "2 / 5" (center, white, 14px)
  - Menu button (⋯, top right, white)
- **Photo viewer:**
  - Centered image (max width/height to fit screen)
  - Swipeable left/right
  - Pinch to zoom (optional for this task)
- **Caption bar (bottom):**
  - Semi-transparent dark background
  - Photo label (14px, white, bold)
  - Date (12px, white, 0.8 opacity)
  - Location/context (12px, white, 0.7 opacity)
- **Thumbnail strip:**
  - Below caption bar
  - Horizontal scroll
  - Small thumbnails (60x60)
  - Active thumbnail has white border
- **Add photo button:**
  - Floating action button (FAB)
  - Bottom right corner
  - Navy background (#0a2f7f)
  - Camera icon + "Adicionar" label

#### Data Structure
```javascript
// Photos from clinic/doctor detail
const MOCK_GALLERY = [
  {
    id: 'ph-1',
    label: 'Fachada',
    date: 'fev/2026',
    context: 'Visita de prospecção',
    hue: 218,
    placeholder: 'fachada', // For mock, real would be: url: '/uploads/clinic-1-facade.jpg'
  },
  {
    id: 'ph-2',
    label: 'Recepção',
    date: 'fev/2026',
    context: 'Clínica Santa Mônica',
    hue: 148,
    placeholder: 'recepção',
  },
  {
    id: 'ph-3',
    label: 'Sala 3 · Ortopedia',
    date: 'mar/2026',
    context: 'Com Dra. Mariana Silva',
    hue: 38,
    placeholder: 'sala 3',
  },
  // ... more photos
];
```

#### Functionality
1. **Navigation:**
   - Swipe left/right to change photos
   - Tap thumbnail to jump to photo
   - Keyboard arrows work (desktop)
2. **Add photo:**
   - Tap FAB button
   - Show options: "Câmera" | "Galeria" | "Cancelar"
   - In design mockup mode: Just show success toast "Foto adicionada"
3. **Menu (⋯) options:**
   - "Compartilhar foto"
   - "Editar descrição"
   - "Excluir foto" (red text, confirm dialog)
   - "Cancelar"
4. **Animation:**
   - Slide up entrance (300ms)
   - Fade in/out between photos (200ms)
   - Swipe gesture smooth transition

#### Component Structure
```javascript
function PhotoGalleryViewer({ open, onClose, photos = [], initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = React.useState(initialIndex);
  const [showMenu, setShowMenu] = React.useState(false);
  const [showAddOptions, setShowAddOptions] = React.useState(false);
  
  const currentPhoto = photos[currentIndex];
  
  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };
  
  const handleAddPhoto = () => {
    setShowAddOptions(true);
  };
  
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') onClose();
    };
    
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [open, currentIndex]);
  
  if (!open) return null;
  
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'rgba(0,0,0,0.92)',
      fontFamily: 'Inter, system-ui',
      animation: 'fadeIn 300ms ease',
    }}>
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, transparent 100%)',
        zIndex: 10,
      }}>
        <button onClick={onClose} style={{
          width: 40, height: 40, borderRadius: 20,
          background: 'rgba(255,255,255,0.15)',
          border: 'none', color: '#fff',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 4l12 12M16 4L4 16"/>
          </svg>
        </button>
        
        <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
          {currentIndex + 1} / {photos.length}
        </div>
        
        <button onClick={() => setShowMenu(true)} style={{
          width: 40, height: 40, borderRadius: 20,
          background: 'rgba(255,255,255,0.15)',
          border: 'none', color: '#fff',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <circle cx="4" cy="10" r="1.5"/>
            <circle cx="10" cy="10" r="1.5"/>
            <circle cx="16" cy="10" r="1.5"/>
          </svg>
        </button>
      </div>
      
      {/* Main photo viewer */}
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px 200px',
      }}>
        <PhotoDisplay photo={currentPhoto} />
      </div>
      
      {/* Navigation arrows */}
      {currentIndex > 0 && (
        <button onClick={handlePrev} style={{
          position: 'absolute',
          left: 20, top: '50%',
          transform: 'translateY(-50%)',
          width: 50, height: 50, borderRadius: 25,
          background: 'rgba(255,255,255,0.2)',
          border: 'none', color: '#fff',
          cursor: 'pointer',
          /* Arrow left icon */
        }}>←</button>
      )}
      
      {currentIndex < photos.length - 1 && (
        <button onClick={handleNext} style={{
          position: 'absolute',
          right: 20, top: '50%',
          transform: 'translateY(-50%)',
          /* Similar styling */
        }}>→</button>
      )}
      
      {/* Caption bar */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 100,
        background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.75) 40%)',
        padding: '40px 20px 16px',
        color: '#fff',
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
          {currentPhoto.label}
        </div>
        <div style={{ fontSize: 13, opacity: 0.8 }}>
          {currentPhoto.date}
          {currentPhoto.context && ` · ${currentPhoto.context}`}
        </div>
      </div>
      
      {/* Thumbnail strip */}
      <div style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 20,
        display: 'flex', gap: 8,
        padding: '0 20px',
        overflowX: 'auto',
      }}>
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setCurrentIndex(i)}
            style={{
              width: 60, height: 60, borderRadius: 8,
              border: i === currentIndex ? '2px solid #fff' : '2px solid transparent',
              background: `hsl(${photo.hue}, 40%, 72%)`,
              cursor: 'pointer',
              flexShrink: 0,
              opacity: i === currentIndex ? 1 : 0.6,
            }}
          />
        ))}
      </div>
      
      {/* Add photo FAB */}
      <button onClick={handleAddPhoto} style={{
        position: 'absolute',
        bottom: 30, right: 20,
        background: '#0a2f7f',
        color: '#fff',
        border: 'none',
        borderRadius: 28,
        padding: '12px 20px',
        fontSize: 14, fontWeight: 600,
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: '0 8px 24px rgba(10,47,127,0.5)',
      }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M9 3v12M3 9h12"/>
        </svg>
        Adicionar
      </button>
      
      {/* Menu sheet */}
      {showMenu && (
        <ActionSheet
          options={[
            { label: 'Compartilhar foto', icon: '↗' },
            { label: 'Editar descrição', icon: '✏' },
            { label: 'Excluir foto', icon: '🗑', color: '#b84545' },
            { label: 'Cancelar', cancel: true },
          ]}
          onClose={() => setShowMenu(false)}
        />
      )}
      
      {/* Add photo options */}
      {showAddOptions && (
        <ActionSheet
          options={[
            { label: 'Câmera', icon: '📷' },
            { label: 'Galeria', icon: '🖼' },
            { label: 'Cancelar', cancel: true },
          ]}
          onClose={() => setShowAddOptions(false)}
        />
      )}
    </div>
  );
}

// Photo display component (placeholder with striped pattern)
function PhotoDisplay({ photo }) {
  return (
    <div style={{
      maxWidth: '90%',
      maxHeight: '100%',
      aspectRatio: '4/3',
      borderRadius: 12,
      overflow: 'hidden',
      background: `hsl(${photo.hue}, 40%, 72%)`,
      boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
    }}>
      {/* Striped placeholder pattern */}
      <svg width="100%" height="100%" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id={`gal-${photo.id}`} width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
            <rect width="10" height="10" fill={`hsl(${photo.hue}, 40%, 72%)`}/>
            <rect width="5" height="10" fill={`hsl(${photo.hue}, 45%, 65%)`}/>
          </pattern>
        </defs>
        <rect width="400" height="300" fill={`url(#gal-${photo.id})`}/>
        
        {/* Placeholder label */}
        <text x="200" y="150" textAnchor="middle" fontFamily="monospace"
          fontSize="14" fill="rgba(0,0,0,0.3)">
          {photo.placeholder}
        </text>
      </svg>
    </div>
  );
}

// Action sheet for menu options
function ActionSheet({ options, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        zIndex: 20,
      }}/>
      <div style={{
        position: 'absolute',
        left: 0, right: 0, bottom: 0,
        zIndex: 21,
        background: '#fff',
        borderRadius: '20px 20px 0 0',
        padding: '12px 16px 28px',
        animation: 'slideUp 250ms ease',
      }}>
        {options.map((opt, i) => (
          <button
            key={i}
            onClick={() => {
              console.log('Action:', opt.label);
              onClose();
            }}
            style={{
              width: '100%',
              padding: '16px',
              border: 'none',
              borderTop: i > 0 ? '1px solid #f1f3f6' : 'none',
              background: opt.cancel ? '#f7f8fb' : 'transparent',
              color: opt.color || (opt.cancel ? '#6b7280' : '#1f2937'),
              fontSize: 15,
              fontWeight: opt.cancel ? 500 : 600,
              cursor: 'pointer',
              fontFamily: 'Inter, system-ui',
              textAlign: 'center',
            }}
          >
            {opt.icon && <span style={{ marginRight: 8 }}>{opt.icon}</span>}
            {opt.label}
          </button>
        ))}
      </div>
    </>
  );
}

Object.assign(window, { PhotoGalleryViewer });
```

#### Integration Points
- Import in `index.html`
- Modify `PhotosButton` in `atlas-clinic.jsx` and `atlas-doctor.jsx`:
  - Add state: `const [galleryOpen, setGalleryOpen] = React.useState(false)`
  - Wire up onClick
  - Render `<PhotoGalleryViewer open={galleryOpen} onClose={...} photos={clinic.gallery} />`

#### Animations
Add to global styles in `index.html`:
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

#### Testing Checklist
- [ ] Gallery opens from PhotosButton
- [ ] Photos display correctly
- [ ] Swipe navigation works
- [ ] Thumbnail strip shows all photos
- [ ] Active thumbnail highlighted
- [ ] Close button closes gallery
- [ ] Add photo button shows options
- [ ] Menu shows action options
- [ ] Keyboard navigation works (arrows, ESC)
- [ ] Photo counter updates
- [ ] Caption displays correctly

---

*Continue to [Phase 2 specs document for TASK-005 through TASK-008]*
