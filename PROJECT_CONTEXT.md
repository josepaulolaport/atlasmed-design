# AtlasMed Design Project - Context & Guidelines

## Project Overview

**AtlasMed** is a salesman/field representative mobile application design project. This repository contains **static design frames** created for presentation and stakeholder review purposes.

### Important: Design Frames Only

**This project is NOT a production application.** The purpose is to create static, visually polished screens that demonstrate the user interface and user experience design. These frames will be used in:

- Stakeholder presentations
- Design reviews
- User research and feedback sessions
- Development team handoff documentation

**Do not implement:**
- Real backend integrations
- Authentication systems
- Database connections
- Complex state management
- Production-ready code architecture

**Do implement:**
- Beautiful, pixel-perfect UI frames
- Mock data to populate screens realistically
- Smooth transitions between states (when simple)
- Interactive elements that demonstrate the concept
- Consistent visual design across all screens

---

## Technology Stack

This is a **static HTML project** with no build system:

- **HTML5** - Single `index.html` file
- **React 18** - Loaded via CDN (no npm/webpack)
- **Babel Standalone** - In-browser JSX transpilation
- **CSS** - Inline styles via React style objects
- **Deployment** - GitHub Pages (static file hosting)

### Why This Approach?

- ✅ Zero setup - just open `index.html` in a browser
- ✅ Fast iteration - edit `.jsx` files and refresh
- ✅ No dependencies to install or manage
- ✅ Easy for designers to preview without technical setup
- ✅ Shareable via GitHub Pages instantly

---

## Project Structure

```
atlasmed-design/
├── index.html                          # Main entry point
├── components/
│   ├── atlas-logo.jsx                  # AtlasMed logo component
│   ├── atlas-bi.jsx                    # BI Dashboard screen
│   ├── atlas-pedidos.jsx               # Orders screen
│   ├── atlas-map.jsx                   # Territory map screen
│   ├── atlas-presentations.jsx         # Product presentations screen
│   ├── atlas-list.jsx                  # Client list screen
│   ├── atlas-clinic.jsx                # Clinic detail screen
│   ├── atlas-doctor.jsx                # Doctor detail screen
│   ├── atlas-profile.jsx               # User profile screen
│   └── [other components].jsx          # Additional screens
├── IMPLEMENTATION_SPECS.md             # Phase 1 specifications
├── IMPLEMENTATION_SPECS_PHASE2.md      # Phase 2 specifications
├── IMPLEMENTATION_SPECS_PHASE3.md      # Phase 3 Part 1 specifications
├── IMPLEMENTATION_SPECS_PHASE3_PART2.md # Phase 3 Part 2 specifications
└── PROJECT_CONTEXT.md                  # This file
```

---

## Design System

### Color Palette

```javascript
{
  primary: '#6366f1',      // Indigo - primary actions, buttons
  success: '#10b981',      // Green - success states, positive metrics
  warning: '#f59e0b',      // Amber - warnings, pending states
  error: '#ef4444',        // Red - errors, negative metrics
  
  // Backgrounds
  bgMain: '#f8f9fa',       // Light gray - main background
  bgCard: '#ffffff',       // White - cards and elevated surfaces
  
  // Text
  textPrimary: '#1f2937',  // Dark gray - primary text
  textSecondary: '#6b7280', // Medium gray - secondary text
  textTertiary: '#9ca3af', // Light gray - tertiary/disabled text
}
```

### Typography

- **Font Family:** 'Inter', system-ui, -apple-system, sans-serif
- **Display:** 28px, bold
- **H1:** 24px, bold
- **H2:** 20px, semibold
- **H3:** 18px, semibold
- **Body:** 16px, normal
- **Small:** 14px, normal
- **Caption:** 12px, normal

### Common Patterns

1. **Cards:** White background, border-radius 16px, subtle shadow
2. **Buttons:** 
   - Primary: Indigo background, white text
   - Secondary: White background with border
   - Padding: 12px 24px, border-radius 12px
3. **Bottom Sheets:** Modal overlays sliding from bottom
4. **Top Bar:** 64px height, white background, back button + title
5. **Status Chips:** Small colored pills (e.g., "Pendente", "Concluído")
6. **List Items:** 16px padding, touchable with right chevron
7. **Icons:** Emoji-based for simplicity and universal appeal

---

## Existing Screens

The following screens are already implemented:

### Core Navigation
- ✅ Login Screen
- ✅ BI Dashboard (Sales metrics, charts)
- ✅ Orders Screen (Order list and status)
- ✅ Territory Map (Map view with nearby clinics)
- ✅ Presentations (Product catalog)
- ✅ Client List (Clinics and doctors)
- ✅ Profile Screen (User settings)

### Detail Screens
- ✅ Clinic Detail (Full clinic information)
- ✅ Doctor Detail (Full doctor information)

### Common Components
- ✅ `AtlasLogo` - Animated logo
- ✅ `AtlasTopBar` - Navigation bar
- ✅ `BottomSheet` - Modal sheet component
- ✅ `CCard` - Generic card component
- ✅ `StatusChip` - Status indicator pill

---

## Missing Screens (To Be Implemented)

Refer to the specification documents for detailed requirements:

### Phase 1: Critical Path
- [ ] Clinic Selector Screen (TASK-001)
- [ ] Doctor Selector Screen (TASK-002)
- [ ] Edit Suggestion Modal (TASK-003)
- [ ] Photo Gallery Viewer (TASK-004)

### Phase 2: Enhanced UX
- [ ] Visit History Full List (TASK-005)
- [ ] Products Full List (TASK-006)
- [ ] Work Hours Editor (TASK-007)
- [ ] Profile Editor (TASK-008)

### Phase 3: Complete Experience
- [ ] Territory Full Map (TASK-009)
- [ ] Activity Full List (TASK-010)
- [ ] Help Center (TASK-011)
- [ ] Support Chat (TASK-012)
- [ ] Terms & Privacy (TASK-013)
- [ ] Language Selector (TASK-014)
- [ ] Nearby Clinics Expanded (TASK-015)
- [ ] Presentation Filters (TASK-016)
- [ ] Order Live Tracking (TASK-017)
- [ ] BI Drill-down Screens (TASK-018)

---

## Guidelines for Creating New Frames

### 1. File Structure

Create new screens as separate `.jsx` files in the `components/` folder:

```javascript
// File: components/atlas-new-screen.jsx

function NewScreen({ onBack, /* other props */ }) {
  const [state, setState] = React.useState(initialValue);
  
  return (
    <div style={{ /* full screen container */ }}>
      {/* Your UI here */}
    </div>
  );
}

// Mock data
const MOCK_DATA = [
  { id: 1, name: 'Example' },
  // ... more items
];

// Export to global scope
Object.assign(window, { NewScreen, MOCK_DATA });
```

### 2. Mock Data

**Always use realistic mock data** to make frames feel authentic:

```javascript
// ✅ Good - Realistic data
const MOCK_CLINICS = [
  {
    id: 'clinic-1',
    name: 'Clínica São Lucas',
    address: 'Av. Paulista, 1000',
    phone: '(11) 3456-7890',
    doctors: 12,
    lastVisit: '2026-05-04',
  },
  // ... 5-10 more entries
];

// ❌ Bad - Placeholder data
const MOCK_CLINICS = [
  { id: 1, name: 'Clinic 1' },
  { id: 2, name: 'Clinic 2' },
];
```

### 3. Styling

Use inline React style objects for all styling:

```javascript
// ✅ Good
<div style={{
  padding: 16,
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
}}>
  Content
</div>

// ❌ Bad - Don't use external CSS files
<div className="card">Content</div>
```

### 4. Interactivity

Keep interactions simple - just enough to demonstrate the concept:

```javascript
// ✅ Good - Simple state for demo
const [expanded, setExpanded] = React.useState(false);

// ❌ Bad - Complex state management
const [state, dispatch] = React.useReducer(reducer, initialState);
```

### 5. Navigation

Use callback props to simulate navigation between screens:

```javascript
function ScreenA({ onShowScreenB }) {
  return (
    <button onClick={() => onShowScreenB()}>
      Go to Screen B
    </button>
  );
}

// In index.html, handle navigation
function handleShowScreenB() {
  document.getElementById('root-a').style.display = 'none';
  document.getElementById('root-b').style.display = 'block';
}
```

### 6. Responsiveness

Design for **mobile-first** (iPhone 14 Pro dimensions: 393x852px):

```javascript
<div style={{
  maxWidth: 430,
  margin: '0 auto',
  minHeight: '100vh',
  background: '#f8f9fa',
}}>
  {/* Mobile-optimized UI */}
</div>
```

---

## How to Run Locally

1. Clone the repository
2. Open `index.html` in a modern browser (Chrome, Safari, Firefox)
3. That's it! No build step required.

### Live Reload (Optional)

For convenience, you can use a simple HTTP server:

```bash
# Python 3
python3 -m http.server 8000

# Node.js (if you have it)
npx serve

# Then open http://localhost:8000
```

---

## How to Deploy

The project is automatically deployed to GitHub Pages via GitHub Actions (`.github/workflows/pages.yml`).

**To deploy manually:**

1. Push changes to the `main` branch
2. GitHub Actions will automatically deploy to GitHub Pages
3. Access the live site at: `https://[username].github.io/atlasmed-design/`

---

## AI Instructions Summary

When creating new screens for this project:

1. **Read the relevant TASK specification** from the implementation specs documents
2. **Create a new `.jsx` file** in the `components/` folder
3. **Use realistic mock data** (Brazilian Portuguese names, addresses, etc.)
4. **Follow the design system** (colors, typography, spacing)
5. **Keep it simple** - focus on visual design, not complex logic
6. **Make it beautiful** - this is for presentation, so polish matters
7. **Test in browser** - open `index.html` to see your frame
8. **Export to window** - use `Object.assign(window, { YourComponent })`

### What NOT to do:

- ❌ Don't create backend APIs or database schemas
- ❌ Don't implement authentication or authorization
- ❌ Don't add npm packages or build systems
- ❌ Don't create overly complex state management
- ❌ Don't worry about production performance optimization
- ❌ Don't implement real data fetching or mutations

### What TO do:

- ✅ Create pixel-perfect, beautiful UI frames
- ✅ Use realistic mock data
- ✅ Follow the design system consistently
- ✅ Make interactions smooth (simple transitions)
- ✅ Ensure screens are visually consistent
- ✅ Add enough detail to tell the story
- ✅ Think like a designer showing their vision

---

## Questions?

Refer to:
- **Design specs:** `IMPLEMENTATION_SPECS*.md` files
- **Existing components:** Check `components/` folder for examples
- **Design system:** See "Design System" section above

Remember: **This is a design prototype for presentations, not a production app.** Focus on creating beautiful, polished frames that effectively communicate the user experience vision.
