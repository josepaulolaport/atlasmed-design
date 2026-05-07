# AtlasMed Design - Implementation Specifications
## Phase 3: Complete Experience (Part 2)

---

## TASK-013: Terms & Privacy

### Context
Users need access to legal documentation (Terms of Service, Privacy Policy) for transparency and compliance. This should be accessible from the Profile screen and displayed in a readable format.

### User Flow
1. User taps "Termos de Uso" or "Política de Privacidade" in Profile
2. Document viewer opens
3. User can:
   - Scroll through the document
   - Search for specific terms
   - Download PDF version
   - Return to previous screen

### Visual Design

**Layout:**
- Top bar with back button, document title, and download button
- Scrollable document content with proper typography
- Table of contents (optional, for long documents)
- Last updated date at top

**Typography:**
- H1: 24px bold
- H2: 20px semibold
- H3: 18px semibold
- Body: 15px regular, line-height 1.6
- Caption: 13px, color gray

### Data Structure

```javascript
const LEGAL_DOCUMENTS = {
  terms: {
    title: 'Termos de Uso',
    lastUpdated: '2026-04-15',
    sections: [
      {
        id: 'intro',
        title: '1. Introdução',
        content: 'Bem-vindo ao AtlasMed. Ao usar nosso aplicativo, você concorda com estes termos...',
      },
      {
        id: 'account',
        title: '2. Conta de Usuário',
        content: 'Para usar o AtlasMed, você deve criar uma conta. Você é responsável por manter a confidencialidade...',
      },
      // ... more sections (10-15 total)
    ],
  },
  privacy: {
    title: 'Política de Privacidade',
    lastUpdated: '2026-04-15',
    sections: [
      {
        id: 'intro',
        title: '1. Informações que Coletamos',
        content: 'Coletamos informações que você nos fornece diretamente, como nome, email, dados de visitas...',
      },
      {
        id: 'usage',
        title: '2. Como Usamos suas Informações',
        content: 'Usamos as informações coletadas para fornecer, manter e melhorar nossos serviços...',
      },
      // ... more sections
    ],
  },
};
```

### Functionality

1. **Document Display:**
   - Render markdown or structured text
   - Proper spacing and typography
   - Responsive to screen width

2. **Search:**
   - Search bar to find specific terms
   - Highlight matching text
   - Jump to matching sections

3. **Download:**
   - Generate PDF version
   - Download with proper filename

4. **Table of Contents:**
   - Clickable section headers
   - Jump to section on tap

5. **Scroll Position:**
   - Remember scroll position when returning

### Component Structure

```javascript
// File: components/atlas-legal.jsx

function LegalDocumentScreen({ type, onBack }) {
  const doc = LEGAL_DOCUMENTS[type];
  const [searchQuery, setSearchQuery] = React.useState('');
  const [activeSection, setActiveSection] = React.useState(null);

  const filteredSections = React.useMemo(() => {
    if (!searchQuery) return doc.sections;
    const q = searchQuery.toLowerCase();
    return doc.sections.filter(section =>
      section.title.toLowerCase().includes(q) ||
      section.content.toLowerCase().includes(q)
    );
  }, [searchQuery, doc.sections]);

  const handleDownload = () => {
    // Generate PDF (pseudo-code)
    const content = doc.sections.map(s => `${s.title}\n\n${s.content}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${type}_atlasmed_${doc.lastUpdated}.txt`;
    link.click();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fff', paddingBottom: 80 }}>
      {/* Top Bar */}
      <div style={{
        padding: 16,
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button
            onClick={onBack}
            style={{
              width: 32,
              height: 32,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 20,
            }}
          >
            ←
          </button>
          <div style={{ flex: 1, fontSize: 20, fontWeight: 700 }}>{doc.title}</div>
          <button
            onClick={handleDownload}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              border: 'none',
              background: '#f3f4f6',
              cursor: 'pointer',
              fontSize: 18,
            }}
          >
            📥
          </button>
        </div>
        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>
          Última atualização: {new Date(doc.lastUpdated).toLocaleDateString('pt-BR')}
        </div>
        <input
          type="text"
          placeholder="Buscar no documento..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            fontSize: 14,
            outline: 'none',
          }}
        />
      </div>

      {/* Table of Contents (collapsed by default) */}
      {!searchQuery && (
        <details style={{ padding: 16, borderBottom: '1px solid #e5e7eb' }}>
          <summary style={{
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            color: '#6366f1',
          }}>
            📑 Índice
          </summary>
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {doc.sections.map((section, idx) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                style={{
                  fontSize: 14,
                  color: '#6b7280',
                  textDecoration: 'none',
                  padding: '6px 0',
                }}
              >
                {section.title}
              </a>
            ))}
          </div>
        </details>
      )}

      {/* Document Content */}
      <div style={{ padding: '24px 16px' }}>
        {filteredSections.length === 0 ? (
          <div style={{
            padding: 40,
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: 14,
          }}>
            Nenhum resultado encontrado
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {filteredSections.map(section => (
              <section key={section.id} id={section.id}>
                <h2 style={{
                  fontSize: 20,
                  fontWeight: 600,
                  marginBottom: 16,
                  color: '#1f2937',
                }}>
                  {section.title}
                </h2>
                <p style={{
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: '#4b5563',
                  whiteSpace: 'pre-wrap',
                }}>
                  {section.content}
                </p>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const LEGAL_DOCUMENTS = {
  terms: {
    title: 'Termos de Uso',
    lastUpdated: '2026-04-15',
    sections: [
      {
        id: 'intro',
        title: '1. Introdução',
        content: 'Bem-vindo ao AtlasMed. Ao usar nosso aplicativo, você concorda com estes termos de uso. Leia atentamente este documento antes de prosseguir.\n\nEstes termos constituem um acordo legal entre você (o "Usuário") e a AtlasMed Ltda. (a "Empresa"). O uso continuado do aplicativo implica na aceitação destes termos.',
      },
      {
        id: 'account',
        title: '2. Conta de Usuário',
        content: 'Para usar o AtlasMed, você deve criar uma conta fornecendo informações verdadeiras e completas. Você é responsável por:\n\n• Manter a confidencialidade de suas credenciais de acesso\n• Todas as atividades realizadas através de sua conta\n• Notificar imediatamente a Empresa sobre qualquer uso não autorizado\n\nA Empresa reserva-se o direito de suspender ou encerrar contas que violem estes termos.',
      },
      {
        id: 'usage',
        title: '3. Uso Permitido',
        content: 'O aplicativo destina-se exclusivamente ao uso profissional por representantes comerciais autorizados pela Empresa. É proibido:\n\n• Usar o aplicativo para fins não relacionados às atividades comerciais autorizadas\n• Compartilhar informações confidenciais de clientes com terceiros não autorizados\n• Realizar engenharia reversa ou tentativas de acesso não autorizado ao sistema\n• Usar o aplicativo de maneira que possa prejudicar sua funcionalidade ou outros usuários',
      },
      {
        id: 'data',
        title: '4. Dados e Privacidade',
        content: 'Ao usar o AtlasMed, você concorda com a coleta e processamento de dados conforme descrito em nossa Política de Privacidade. Os dados coletados incluem:\n\n• Informações de perfil do usuário\n• Dados de localização durante visitas\n• Histórico de interações com clientes\n• Indicadores de performance\n\nTodos os dados são tratados com confidencialidade e segurança apropriadas.',
      },
      {
        id: 'liability',
        title: '5. Limitação de Responsabilidade',
        content: 'A Empresa não se responsabiliza por:\n\n• Interrupções temporárias no serviço por motivos técnicos\n• Perda de dados resultante de ações do usuário\n• Decisões comerciais tomadas com base nas informações do aplicativo\n• Problemas de conectividade de terceiros\n\nO aplicativo é fornecido "como está", sem garantias expressas ou implícitas.',
      },
      {
        id: 'changes',
        title: '6. Alterações aos Termos',
        content: 'A Empresa reserva-se o direito de modificar estes termos a qualquer momento. Usuários serão notificados sobre mudanças significativas através do aplicativo. O uso continuado após as alterações constitui aceitação dos novos termos.',
      },
      {
        id: 'termination',
        title: '7. Encerramento',
        content: 'Você pode encerrar sua conta a qualquer momento através das configurações do aplicativo. A Empresa pode suspender ou encerrar o acesso de usuários que violem estes termos, sem aviso prévio.\n\nApós o encerramento, você perderá acesso aos dados armazenados no aplicativo.',
      },
      {
        id: 'contact',
        title: '8. Contato',
        content: 'Para dúvidas sobre estes termos, entre em contato:\n\nAtlasMed Ltda.\nEmail: legal@atlasmed.com.br\nTelefone: (11) 1234-5678\nEndereço: Av. Paulista, 1000 - São Paulo, SP',
      },
    ],
  },
  privacy: {
    title: 'Política de Privacidade',
    lastUpdated: '2026-04-15',
    sections: [
      {
        id: 'intro',
        title: '1. Informações que Coletamos',
        content: 'A AtlasMed coleta diferentes tipos de informações para fornecer e melhorar nossos serviços:\n\n**Informações Fornecidas por Você:**\n• Nome completo, email, telefone\n• Dados profissionais (empresa, cargo, território)\n• Informações de clientes (clínicas, médicos)\n• Dados de visitas e interações comerciais\n\n**Informações Coletadas Automaticamente:**\n• Localização GPS durante visitas\n• Dados de uso do aplicativo\n• Informações do dispositivo (modelo, sistema operacional)\n• Logs de acesso e atividades',
      },
      {
        id: 'usage',
        title: '2. Como Usamos suas Informações',
        content: 'Utilizamos suas informações para:\n\n• Fornecer funcionalidades do aplicativo\n• Gerar relatórios e indicadores de performance\n• Melhorar a experiência do usuário\n• Enviar notificações relevantes\n• Cumprir obrigações legais e contratuais\n• Prevenir fraudes e garantir segurança\n\nNunca vendemos suas informações pessoais a terceiros.',
      },
      {
        id: 'sharing',
        title: '3. Compartilhamento de Informações',
        content: 'Podemos compartilhar suas informações com:\n\n• Sua empresa empregadora (para gestão de equipe)\n• Provedores de serviços terceirizados (hospedagem, analytics)\n• Autoridades legais quando exigido por lei\n\nTodos os terceiros estão obrigados a proteger suas informações conforme esta política.',
      },
      {
        id: 'security',
        title: '4. Segurança',
        content: 'Implementamos medidas de segurança para proteger suas informações:\n\n• Criptografia de dados em trânsito e repouso\n• Controles de acesso baseados em função\n• Monitoramento contínuo de segurança\n• Backups regulares\n• Auditorias de segurança periódicas\n\nApesar de nossos esforços, nenhum sistema é 100% seguro. Você deve proteger suas credenciais de acesso.',
      },
      {
        id: 'rights',
        title: '5. Seus Direitos',
        content: 'De acordo com a LGPD, você tem direito a:\n\n• Confirmar a existência de tratamento de dados\n• Acessar seus dados pessoais\n• Corrigir dados incompletos ou incorretos\n• Solicitar anonimização ou exclusão\n• Revogar consentimento\n• Portabilidade de dados\n\nPara exercer estes direitos, entre em contato através de privacy@atlasmed.com.br.',
      },
      {
        id: 'retention',
        title: '6. Retenção de Dados',
        content: 'Mantemos suas informações pelo tempo necessário para:\n\n• Fornecer os serviços contratados\n• Cumprir obrigações legais\n• Resolver disputas\n\nApós o encerramento da conta, dados pessoais são excluídos em até 90 dias, exceto quando a retenção for exigida por lei.',
      },
      {
        id: 'children',
        title: '7. Menores de Idade',
        content: 'O AtlasMed não é destinado a menores de 18 anos. Não coletamos intencionalmente informações de menores. Se tomarmos conhecimento de coleta inadvertida, excluiremos os dados imediatamente.',
      },
      {
        id: 'changes',
        title: '8. Alterações a Esta Política',
        content: 'Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas através do aplicativo ou email. A data de última atualização está sempre indicada no topo do documento.',
      },
      {
        id: 'contact',
        title: '9. Contato',
        content: 'Para questões sobre privacidade:\n\nEncarregado de Dados: João Silva\nEmail: privacy@atlasmed.com.br\nTelefone: (11) 1234-5678\nEndereço: Av. Paulista, 1000 - São Paulo, SP, CEP 01310-100',
      },
    ],
  },
};

Object.assign(window, { LegalDocumentScreen, LEGAL_DOCUMENTS });
```

### Integration Points

1. **From Profile Screen (`atlas-profile.jsx`):**
   - Add "Termos de Uso" list item → Show `LegalDocumentScreen` with `type="terms"`
   - Add "Política de Privacidade" list item → Show `LegalDocumentScreen` with `type="privacy"`

2. **First-time User Flow:**
   - Show terms acceptance dialog before first use
   - Require checkbox acceptance before proceeding

### Testing Checklist

- [ ] Legal document screen loads with correct content
- [ ] Search filters sections correctly
- [ ] Search highlights matching text
- [ ] Download button generates file
- [ ] Downloaded file has correct name and content
- [ ] Table of contents links jump to sections
- [ ] Back button returns to profile
- [ ] Last updated date displays correctly
- [ ] Typography is readable and well-spaced
- [ ] Scroll position is smooth
- [ ] Long paragraphs wrap correctly
- [ ] Section anchors work correctly
- [ ] "No results" message shows when search is empty

---

## TASK-014: Language Selector

### Context
Users may prefer to use the app in different languages (e.g., Portuguese, Spanish, English). This screen allows changing the app language from the Profile settings.

### User Flow
1. User taps "Idioma" in Profile settings
2. Language selector modal opens
3. User selects preferred language
4. App UI updates to selected language
5. Modal closes automatically

### Visual Design

**Layout:**
- Bottom sheet modal (60% height)
- Title: "Selecionar Idioma"
- List of available languages with native names
- Checkmark next to current language
- Each language shows flag emoji and name

**Language Item:**
```
┌──────────────────────────────┐
│ 🇧🇷 Português (Brasil)      ✓ │
├──────────────────────────────┤
│ 🇺🇸 English                   │
├──────────────────────────────┤
│ 🇪🇸 Español                   │
└──────────────────────────────┘
```

### Data Structure

```javascript
const AVAILABLE_LANGUAGES = [
  {
    code: 'pt-BR',
    name: 'Português (Brasil)',
    nativeName: 'Português (Brasil)',
    flag: '🇧🇷',
  },
  {
    code: 'en-US',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'es-ES',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
  },
];

// Translation strings (example structure)
const TRANSLATIONS = {
  'pt-BR': {
    'home.title': 'Início',
    'profile.title': 'Perfil',
    'orders.title': 'Pedidos',
    // ... all app strings
  },
  'en-US': {
    'home.title': 'Home',
    'profile.title': 'Profile',
    'orders.title': 'Orders',
    // ... all app strings
  },
  'es-ES': {
    'home.title': 'Inicio',
    'profile.title': 'Perfil',
    'orders.title': 'Pedidos',
    // ... all app strings
  },
};
```

### Functionality

1. **Display Current Language:**
   - Show checkmark next to currently selected language
   - Load from localStorage or default to browser locale

2. **Language Selection:**
   - Tap language: Update app language immediately
   - Save preference to localStorage
   - Update all UI text without page reload (if possible)

3. **Language Detection:**
   - On first launch, detect browser/system language
   - Fallback to Portuguese if unsupported language

4. **Translation System:**
   - Use translation key system: `t('profile.title')`
   - Support string interpolation: `t('welcome', { name: 'João' })`

### Component Structure

```javascript
// File: components/atlas-language.jsx

function LanguageSelectorSheet({ open, onClose, currentLanguage, onLanguageChange }) {
  const handleSelect = (langCode) => {
    onLanguageChange(langCode);
    localStorage.setItem('atlasmed_language', langCode);
    onClose();
    
    // Show confirmation toast
    showToast(TRANSLATIONS[langCode]['language.changed']);
  };

  return (
    <BottomSheet open={open} onClose={onClose} height="60%">
      <div style={{ padding: '20px 0' }}>
        <div style={{
          fontSize: 20,
          fontWeight: 700,
          marginBottom: 20,
          padding: '0 20px',
        }}>
          Selecionar Idioma
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {AVAILABLE_LANGUAGES.map(lang => (
            <div
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                cursor: 'pointer',
                background: currentLanguage === lang.code ? '#f3f4f6' : 'transparent',
                borderBottom: '1px solid #f3f4f6',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (currentLanguage !== lang.code) {
                  e.currentTarget.style.background = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (currentLanguage !== lang.code) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div style={{ fontSize: 32 }}>{lang.flag}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500 }}>
                  {lang.nativeName}
                </div>
              </div>
              {currentLanguage === lang.code && (
                <div style={{ fontSize: 20, color: '#10b981' }}>✓</div>
              )}
            </div>
          ))}
        </div>

        <div style={{
          padding: '16px 20px',
          fontSize: 13,
          color: '#6b7280',
          textAlign: 'center',
        }}>
          O idioma será aplicado em todo o aplicativo
        </div>
      </div>
    </BottomSheet>
  );
}

// Translation utility function
function useTranslation() {
  const [currentLang, setCurrentLang] = React.useState(
    localStorage.getItem('atlasmed_language') || 
    navigator.language || 
    'pt-BR'
  );

  const t = (key, params = {}) => {
    let text = TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS['pt-BR'][key] || key;
    
    // Simple string interpolation
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    
    return text;
  };

  return { t, currentLang, setCurrentLang };
}

const AVAILABLE_LANGUAGES = [
  {
    code: 'pt-BR',
    name: 'Portuguese (Brazil)',
    nativeName: 'Português (Brasil)',
    flag: '🇧🇷',
  },
  {
    code: 'en-US',
    name: 'English (US)',
    nativeName: 'English',
    flag: '🇺🇸',
  },
  {
    code: 'es-ES',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸',
  },
];

// Sample translations (in production, this would be much larger)
const TRANSLATIONS = {
  'pt-BR': {
    'language.changed': 'Idioma alterado com sucesso',
    'home.title': 'Início',
    'bi.title': 'BI',
    'profile.title': 'Perfil',
    'orders.title': 'Pedidos',
    'explore.title': 'Explorar',
    'presentations.title': 'Apresentações',
    'map.title': 'Mapa',
    'visits.title': 'Visitas',
    'clinics.title': 'Clínicas',
    'doctors.title': 'Médicos',
    'settings.language': 'Idioma',
    'settings.help': 'Central de Ajuda',
    'settings.support': 'Suporte',
    'settings.terms': 'Termos de Uso',
    'settings.privacy': 'Política de Privacidade',
    'settings.logout': 'Sair',
  },
  'en-US': {
    'language.changed': 'Language changed successfully',
    'home.title': 'Home',
    'bi.title': 'BI',
    'profile.title': 'Profile',
    'orders.title': 'Orders',
    'explore.title': 'Explore',
    'presentations.title': 'Presentations',
    'map.title': 'Map',
    'visits.title': 'Visits',
    'clinics.title': 'Clinics',
    'doctors.title': 'Doctors',
    'settings.language': 'Language',
    'settings.help': 'Help Center',
    'settings.support': 'Support',
    'settings.terms': 'Terms of Service',
    'settings.privacy': 'Privacy Policy',
    'settings.logout': 'Logout',
  },
  'es-ES': {
    'language.changed': 'Idioma cambiado con éxito',
    'home.title': 'Inicio',
    'bi.title': 'BI',
    'profile.title': 'Perfil',
    'orders.title': 'Pedidos',
    'explore.title': 'Explorar',
    'presentations.title': 'Presentaciones',
    'map.title': 'Mapa',
    'visits.title': 'Visitas',
    'clinics.title': 'Clínicas',
    'doctors.title': 'Médicos',
    'settings.language': 'Idioma',
    'settings.help': 'Centro de Ayuda',
    'settings.support': 'Soporte',
    'settings.terms': 'Términos de Uso',
    'settings.privacy': 'Política de Privacidad',
    'settings.logout': 'Cerrar Sesión',
  },
};

function showToast(message) {
  // Simple toast notification
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 14px;
    z-index: 10000;
    animation: fadeInOut 2s ease-in-out;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

Object.assign(window, { 
  LanguageSelectorSheet, 
  AVAILABLE_LANGUAGES, 
  TRANSLATIONS, 
  useTranslation,
  showToast,
});
```

### Integration Points

1. **From Profile Screen:**
   - Add "Idioma / Language" list item showing current language
   - On tap: Open `LanguageSelectorSheet`

2. **App-wide Translation:**
   - Wrap all components with translation context
   - Replace hardcoded strings with `t('key')` calls
   - Update all component files to use translation function

3. **Persistence:**
   - Save language preference to localStorage
   - Load on app initialization

### Testing Checklist

- [ ] Language selector opens from Profile
- [ ] All available languages display correctly
- [ ] Current language shows checkmark
- [ ] Tapping language updates UI immediately
- [ ] Language preference persists after app reload
- [ ] Flag emojis display correctly
- [ ] Bottom sheet closes after selection
- [ ] Toast confirmation shows after change
- [ ] Browser locale detection works on first launch
- [ ] Fallback to Portuguese if unsupported locale
- [ ] All UI strings update when language changes
- [ ] Date/time formats respect selected locale
- [ ] Numbers and currencies format correctly

---

## TASK-015: Nearby Clinics Expanded

### Context
The Map screen shows a "Clínicas Próximas" list with 2-3 items. Users need to see the full list of nearby clinics, sorted by distance, with filtering options.

### User Flow
1. User taps "Ver todas" on Nearby Clinics section
2. Full list screen opens
3. User can:
   - See all nearby clinics sorted by distance
   - Filter by visit status (all, visited, pending)
   - Filter by priority
   - Search by name
   - Tap clinic to see details
   - Get directions to clinic

### Visual Design

**Layout:**
- Top bar with back button and "Clínicas Próximas"
- Current location display
- Search bar
- Filter pills (Todas, Visitadas, Pendentes, Prioritárias)
- Clinic list with distance and status
- Each item shows: name, address, distance, last visit, priority badge

**Clinic Card:**
```
┌─────────────────────────────────────┐
│ 🏥 Clínica São Lucas          0.5km │
│ Av. Paulista, 1000            ⚠️    │
│ ✅ Visitado há 3 dias              │
│ [Ver detalhes] [Rota]              │
└─────────────────────────────────────┘
```

### Data Structure

```javascript
const NEARBY_CLINICS = [
  {
    id: 'clinic-1',
    name: 'Clínica São Lucas',
    address: 'Av. Paulista, 1000',
    lat: -23.561414,
    lng: -46.655882,
    distance: 0.5, // km
    lastVisit: '2026-05-04',
    status: 'visited',
    priority: 1, // 1=high, 2=medium, 3=low
  },
  {
    id: 'clinic-2',
    name: 'Hospital Central',
    address: 'Rua Augusta, 500',
    lat: -23.556858,
    lng: -46.662335,
    distance: 1.2,
    lastVisit: null,
    status: 'pending',
    priority: 1,
  },
  // ... more clinics (20-30 total)
];
```

### Functionality

1. **Distance Calculation:**
   - Calculate distance from user's current location
   - Sort clinics by distance (nearest first)
   - Update distances when location changes

2. **Filtering:**
   - Status filter: all, visited, pending
   - Priority filter: Show only high-priority
   - Multiple filters can be active

3. **Search:**
   - Real-time search by clinic name or address
   - Highlight matching text

4. **Location:**
   - Request location permission if not granted
   - Show current address/neighborhood
   - Refresh button to update location

5. **Navigation:**
   - Tap clinic: Go to clinic detail
   - "Rota" button: Open maps app with directions

### Component Structure

```javascript
// File: components/atlas-nearby.jsx

function NearbyClinicsScreen({ onBack }) {
  const [clinics, setClinics] = React.useState(NEARBY_CLINICS);
  const [filter, setFilter] = React.useState('all'); // all | visited | pending | priority
  const [searchQuery, setSearchQuery] = React.useState('');
  const [userLocation, setUserLocation] = React.useState(null);
  const [refreshing, setRefreshing] = React.useState(false);

  React.useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => console.error('Location error:', error)
      );
    }
  }, []);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Haversine formula
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filteredClinics = React.useMemo(() => {
    let result = [...clinics];

    // Calculate distances if user location available
    if (userLocation) {
      result = result.map(clinic => ({
        ...clinic,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          clinic.lat,
          clinic.lng
        ),
      }));
    }

    // Sort by distance
    result.sort((a, b) => a.distance - b.distance);

    // Apply filters
    if (filter === 'visited') {
      result = result.filter(c => c.status === 'visited');
    } else if (filter === 'pending') {
      result = result.filter(c => c.status === 'pending');
    } else if (filter === 'priority') {
      result = result.filter(c => c.priority === 1);
    }

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
      );
    }

    return result;
  }, [clinics, filter, searchQuery, userLocation]);

  const handleRefreshLocation = () => {
    setRefreshing(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setRefreshing(false);
      },
      (error) => {
        console.error('Location error:', error);
        setRefreshing(false);
      }
    );
  };

  const handleGetDirections = (clinic) => {
    const url = `https://maps.google.com/?q=${clinic.lat},${clinic.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', paddingBottom: 80 }}>
      <AtlasTopBar page="Clínicas Próximas" active="mapa" />

      {/* Current Location */}
      <div style={{
        padding: 16,
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{ fontSize: 24 }}>📍</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Sua localização</div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>
            {userLocation ? 'Av. Paulista, São Paulo' : 'Aguardando localização...'}
          </div>
        </div>
        <button
          onClick={handleRefreshLocation}
          disabled={refreshing}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            border: 'none',
            background: '#f3f4f6',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            fontSize: 18,
            animation: refreshing ? 'spin 1s linear infinite' : 'none',
          }}
        >
          🔄
        </button>
      </div>

      {/* Search Bar */}
      <div style={{ padding: 16, background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <input
          type="text"
          placeholder="Buscar clínica..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: 12,
            fontSize: 15,
            outline: 'none',
          }}
        />
      </div>

      {/* Filter Pills */}
      <div style={{
        padding: '12px 16px',
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
      }}>
        {['all', 'visited', 'pending', 'priority'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: 20,
              background: filter === f ? '#6366f1' : '#f3f4f6',
              color: filter === f ? '#fff' : '#6b7280',
              fontSize: 13,
              fontWeight: 500,
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            {f === 'all' ? 'Todas' :
             f === 'visited' ? 'Visitadas' :
             f === 'pending' ? 'Pendentes' : 'Prioritárias'}
          </button>
        ))}
      </div>

      {/* Clinics List */}
      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>
          {filteredClinics.length} {filteredClinics.length === 1 ? 'clínica encontrada' : 'clínicas encontradas'}
        </div>
        
        {filteredClinics.length === 0 ? (
          <div style={{
            padding: 40,
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: 14,
          }}>
            Nenhuma clínica encontrada
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredClinics.map(clinic => (
              <ClinicNearbyCard
                key={clinic.id}
                clinic={clinic}
                onViewDetails={() => {
                  onBack();
                  // showClinicDetail(clinic.id)
                }}
                onGetDirections={() => handleGetDirections(clinic)}
              />
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function ClinicNearbyCard({ clinic, onViewDetails, onGetDirections }) {
  const priorityColors = {
    1: '#ef4444', // high
    2: '#f59e0b', // medium
    3: '#10b981', // low
  };

  return (
    <div style={{
      padding: 16,
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          background: '#3b82f615',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
        }}>
          🏥
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4 }}>
            <div style={{ flex: 1, fontSize: 16, fontWeight: 600 }}>
              {clinic.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
                {clinic.distance.toFixed(1)} km
              </div>
              {clinic.priority === 1 && (
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  background: '#ef444415',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                }}>
                  ⚠️
                </div>
              )}
            </div>
          </div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>
            {clinic.address}
          </div>
          {clinic.lastVisit && (
            <div style={{ fontSize: 12, color: '#10b981' }}>
              ✅ Visitado {getRelativeTime(clinic.lastVisit)}
            </div>
          )}
          {!clinic.lastVisit && (
            <div style={{ fontSize: 12, color: '#f59e0b' }}>
              ⏱ Nunca visitado
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onViewDetails}
          style={{
            flex: 1,
            padding: '8px 16px',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            background: '#fff',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Ver detalhes
        </button>
        <button
          onClick={onGetDirections}
          style={{
            flex: 1,
            padding: '8px 16px',
            border: 'none',
            borderRadius: 8,
            background: '#6366f1',
            color: '#fff',
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Rota 🗺
        </button>
      </div>
    </div>
  );
}

function getRelativeTime(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'hoje';
  if (diffDays === 1) return 'ontem';
  return `há ${diffDays} dias`;
}

const NEARBY_CLINICS = [
  {
    id: 'clinic-1',
    name: 'Clínica São Lucas',
    address: 'Av. Paulista, 1000',
    lat: -23.561414,
    lng: -46.655882,
    distance: 0.5,
    lastVisit: '2026-05-04',
    status: 'visited',
    priority: 2,
  },
  {
    id: 'clinic-2',
    name: 'Hospital Central',
    address: 'Rua Augusta, 500',
    lat: -23.556858,
    lng: -46.662335,
    distance: 1.2,
    lastVisit: null,
    status: 'pending',
    priority: 1,
  },
  {
    id: 'clinic-3',
    name: 'Clínica Vida',
    address: 'Av. Rebouças, 300',
    lat: -23.568420,
    lng: -46.672050,
    distance: 2.1,
    lastVisit: '2026-05-01',
    status: 'visited',
    priority: 3,
  },
  // Add 15+ more clinics for realistic testing
];

Object.assign(window, { NearbyClinicsScreen, NEARBY_CLINICS });
```

### Integration Points

1. **From Map Screen (`atlas-map.jsx`):**
   - Add "Ver todas" button on "Clínicas Próximas" section
   - On tap: Show `NearbyClinicsScreen`

2. **Location Permission:**
   - Request permission on first use
   - Handle permission denial gracefully
   - Show manual location input if permission denied

3. **Navigation:**
   - From clinic card to clinic detail: Use existing `ClinicDetailScreen`

### Testing Checklist

- [ ] Screen loads with nearby clinics
- [ ] Clinics are sorted by distance (nearest first)
- [ ] Distance calculation is accurate
- [ ] Current location displays correctly
- [ ] Refresh location button updates distances
- [ ] Refresh animation works
- [ ] Search filters clinics by name/address
- [ ] Filter pills work (all, visited, pending, priority)
- [ ] Priority badge (⚠️) shows for high-priority clinics
- [ ] Last visit status displays correctly
- [ ] "Nunca visitado" shows for unvisited clinics
- [ ] "Ver detalhes" navigates to clinic detail
- [ ] "Rota" opens maps app with correct location
- [ ] Location permission request works
- [ ] Handles location permission denial
- [ ] "No clinics found" message shows when filters return empty

---

## TASK-016: Presentation Filters

### Context
The Presentations screen shows all product presentations. Users need advanced filtering to find specific products by category, lab, therapeutic class, etc.

### User Flow
1. User taps filter icon on Presentations screen
2. Filter modal opens
3. User can:
   - Filter by category (Cardiovascular, Diabetes, etc.)
   - Filter by laboratory
   - Filter by availability
   - Sort by name, newest, popularity
   - Apply filters
   - Clear all filters

### Visual Design

**Layout:**
- Bottom sheet modal (80% height)
- Title: "Filtros"
- Scrollable filter sections:
  - Categoria
  - Laboratório
  - Disponibilidade
  - Ordenar por
- Bottom bar with "Limpar" and "Aplicar" buttons
- Show count of active filters

**Filter Section:**
```
Categoria
┌──────────────────────────┐
│ ☐ Cardiovascular         │
│ ☑ Diabetes               │
│ ☐ Oncologia              │
└──────────────────────────┘
```

### Data Structure

```javascript
const FILTER_OPTIONS = {
  categories: [
    { id: 'cardio', label: 'Cardiovascular', icon: '❤️' },
    { id: 'diabetes', label: 'Diabetes', icon: '🩺' },
    { id: 'onco', label: 'Oncologia', icon: '🎗' },
    { id: 'neuro', label: 'Neurologia', icon: '🧠' },
    { id: 'gastro', label: 'Gastroenterologia', icon: '🫁' },
  ],
  laboratories: [
    { id: 'bayer', label: 'Bayer' },
    { id: 'novartis', label: 'Novartis' },
    { id: 'pfizer', label: 'Pfizer' },
    { id: 'roche', label: 'Roche' },
    { id: 'astrazeneca', label: 'AstraZeneca' },
  ],
  availability: [
    { id: 'in-stock', label: 'Em estoque' },
    { id: 'low-stock', label: 'Estoque baixo' },
    { id: 'out-of-stock', label: 'Sem estoque' },
  ],
  sortOptions: [
    { id: 'name-asc', label: 'Nome (A-Z)' },
    { id: 'name-desc', label: 'Nome (Z-A)' },
    { id: 'newest', label: 'Mais recente' },
    { id: 'popular', label: 'Mais popular' },
  ],
};

const ACTIVE_FILTERS = {
  categories: ['diabetes'],
  laboratories: [],
  availability: [],
  sortBy: 'name-asc',
};
```

### Functionality

1. **Multi-select Filters:**
   - Categories: Can select multiple
   - Laboratories: Can select multiple
   - Availability: Can select multiple

2. **Single-select Sort:**
   - Only one sort option at a time
   - Radio button behavior

3. **Apply Filters:**
   - On "Aplicar": Close modal and filter presentations
   - Show filtered count in main screen

4. **Clear Filters:**
   - "Limpar" button: Reset all filters to default
   - Show confirmation before clearing

5. **Active Filter Count:**
   - Show badge on filter icon in main screen
   - Count: Number of active filter selections

### Component Structure

```javascript
// File: components/atlas-presentation-filters.jsx

function PresentationFiltersSheet({ open, onClose, currentFilters, onApplyFilters }) {
  const [filters, setFilters] = React.useState(currentFilters);

  const toggleFilter = (category, id) => {
    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(id)
        ? prev[category].filter(x => x !== id)
        : [...prev[category], id],
    }));
  };

  const setSortOption = (sortId) => {
    setFilters(prev => ({ ...prev, sortBy: sortId }));
  };

  const handleClear = () => {
    setFilters({
      categories: [],
      laboratories: [],
      availability: [],
      sortBy: 'name-asc',
    });
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const activeFilterCount = 
    filters.categories.length +
    filters.laboratories.length +
    filters.availability.length;

  return (
    <BottomSheet open={open} onClose={onClose} height="85%">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <div style={{
          padding: 20,
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Filtros</div>
          {activeFilterCount > 0 && (
            <div style={{
              padding: '4px 10px',
              borderRadius: 12,
              background: '#6366f1',
              color: '#fff',
              fontSize: 12,
              fontWeight: 600,
            }}>
              {activeFilterCount} {activeFilterCount === 1 ? 'filtro' : 'filtros'}
            </div>
          )}
        </div>

        {/* Filter Sections (Scrollable) */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
          {/* Categories */}
          <FilterSection title="Categoria">
            {FILTER_OPTIONS.categories.map(cat => (
              <CheckboxItem
                key={cat.id}
                label={cat.label}
                icon={cat.icon}
                checked={filters.categories.includes(cat.id)}
                onChange={() => toggleFilter('categories', cat.id)}
              />
            ))}
          </FilterSection>

          {/* Laboratories */}
          <FilterSection title="Laboratório">
            {FILTER_OPTIONS.laboratories.map(lab => (
              <CheckboxItem
                key={lab.id}
                label={lab.label}
                checked={filters.laboratories.includes(lab.id)}
                onChange={() => toggleFilter('laboratories', lab.id)}
              />
            ))}
          </FilterSection>

          {/* Availability */}
          <FilterSection title="Disponibilidade">
            {FILTER_OPTIONS.availability.map(avail => (
              <CheckboxItem
                key={avail.id}
                label={avail.label}
                checked={filters.availability.includes(avail.id)}
                onChange={() => toggleFilter('availability', avail.id)}
              />
            ))}
          </FilterSection>

          {/* Sort */}
          <FilterSection title="Ordenar por">
            {FILTER_OPTIONS.sortOptions.map(sort => (
              <RadioItem
                key={sort.id}
                label={sort.label}
                selected={filters.sortBy === sort.id}
                onChange={() => setSortOption(sort.id)}
              />
            ))}
          </FilterSection>
        </div>

        {/* Bottom Actions */}
        <div style={{
          padding: 16,
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: 12,
        }}>
          <button
            onClick={handleClear}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              background: '#fff',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Limpar
          </button>
          <button
            onClick={handleApply}
            style={{
              flex: 2,
              padding: '12px 16px',
              border: 'none',
              borderRadius: 12,
              background: '#6366f1',
              color: '#fff',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Aplicar filtros
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

function FilterSection({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        fontSize: 16,
        fontWeight: 600,
        marginBottom: 12,
        padding: '0 20px',
        color: '#1f2937',
      }}>
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}

function CheckboxItem({ label, icon, checked, onChange }) {
  return (
    <div
      onClick={onChange}
      style={{
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        background: checked ? '#f3f4f6' : 'transparent',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => !checked && (e.currentTarget.style.background = '#f9fafb')}
      onMouseLeave={(e) => !checked && (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{
        width: 20,
        height: 20,
        borderRadius: 4,
        border: `2px solid ${checked ? '#6366f1' : '#d1d5db'}`,
        background: checked ? '#6366f1' : '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        color: '#fff',
        transition: 'all 0.15s',
      }}>
        {checked && '✓'}
      </div>
      {icon && <div style={{ fontSize: 20 }}>{icon}</div>}
      <div style={{ fontSize: 15, fontWeight: checked ? 500 : 400 }}>
        {label}
      </div>
    </div>
  );
}

function RadioItem({ label, selected, onChange }) {
  return (
    <div
      onClick={onChange}
      style={{
        padding: '12px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        background: selected ? '#f3f4f6' : 'transparent',
        transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => !selected && (e.currentTarget.style.background = '#f9fafb')}
      onMouseLeave={(e) => !selected && (e.currentTarget.style.background = 'transparent')}
    >
      <div style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        border: `2px solid ${selected ? '#6366f1' : '#d1d5db'}`,
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.15s',
      }}>
        {selected && (
          <div style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            background: '#6366f1',
          }} />
        )}
      </div>
      <div style={{ fontSize: 15, fontWeight: selected ? 500 : 400 }}>
        {label}
      </div>
    </div>
  );
}

const FILTER_OPTIONS = {
  categories: [
    { id: 'cardio', label: 'Cardiovascular', icon: '❤️' },
    { id: 'diabetes', label: 'Diabetes', icon: '🩺' },
    { id: 'onco', label: 'Oncologia', icon: '🎗' },
    { id: 'neuro', label: 'Neurologia', icon: '🧠' },
    { id: 'gastro', label: 'Gastroenterologia', icon: '🫁' },
  ],
  laboratories: [
    { id: 'bayer', label: 'Bayer' },
    { id: 'novartis', label: 'Novartis' },
    { id: 'pfizer', label: 'Pfizer' },
    { id: 'roche', label: 'Roche' },
    { id: 'astrazeneca', label: 'AstraZeneca' },
  ],
  availability: [
    { id: 'in-stock', label: 'Em estoque' },
    { id: 'low-stock', label: 'Estoque baixo' },
    { id: 'out-of-stock', label: 'Sem estoque' },
  ],
  sortOptions: [
    { id: 'name-asc', label: 'Nome (A-Z)' },
    { id: 'name-desc', label: 'Nome (Z-A)' },
    { id: 'newest', label: 'Mais recente' },
    { id: 'popular', label: 'Mais popular' },
  ],
};

Object.assign(window, { PresentationFiltersSheet, FILTER_OPTIONS });
```

### Integration Points

1. **From Presentations Screen (`atlas-presentations.jsx`):**
   - Add filter icon button in top bar
   - Show active filter count badge
   - On tap: Open `PresentationFiltersSheet`
   - Apply filters to presentation list

2. **Filtering Logic:**
   - Update presentation list based on active filters
   - Show "X resultados" count
   - Maintain scroll position after filtering

### Testing Checklist

- [ ] Filter modal opens from presentations screen
- [ ] All filter sections display correctly
- [ ] Checkboxes toggle correctly (multi-select)
- [ ] Radio buttons work correctly (single-select)
- [ ] Category icons display correctly
- [ ] Active filter count shows in header
- [ ] "Limpar" button resets all filters
- [ ] "Aplicar" button closes modal and applies filters
- [ ] Filtered presentations update correctly
- [ ] Filter badge shows on main screen icon
- [ ] Sort options reorder presentations correctly
- [ ] Multiple filters work together (AND logic)
- [ ] Scroll works in filter list
- [ ] Visual feedback on hover/tap
- [ ] Filter state persists while modal is open

---

## TASK-017: Order Live Tracking

### Context
After placing an order, users need real-time tracking to see the order's progress from processing to delivery.

### User Flow
1. User places an order or taps existing order in Orders screen
2. Order detail screen opens
3. User sees:
   - Current order status
   - Progress timeline
   - Estimated delivery date
   - Tracking updates
   - Delivery driver info (when out for delivery)
   - Contact options

### Visual Design

**Layout:**
- Top bar with back button and order number
- Order status card with timeline
- Product list
- Delivery information
- Action buttons (Cancel, Contact support)

**Timeline:**
```
✅ Pedido confirmado
   15 Mai, 10:30

🔄 Em preparação
   15 Mai, 14:00

○  Saiu para entrega
   Previsão: 16 Mai

○  Entregue
   —
```

### Data Structure

```javascript
const ORDER_STATUSES = {
  pending: { label: 'Pendente', icon: '⏱', color: '#f59e0b' },
  confirmed: { label: 'Confirmado', icon: '✅', color: '#10b981' },
  processing: { label: 'Em preparação', icon: '🔄', color: '#3b82f6' },
  shipped: { label: 'Saiu para entrega', icon: '🚚', color: '#8b5cf6' },
  delivered: { label: 'Entregue', icon: '📦', color: '#10b981' },
  cancelled: { label: 'Cancelado', icon: '❌', color: '#ef4444' },
};

const ORDER_DETAIL = {
  id: 'ORD-1234',
  status: 'processing',
  createdAt: '2026-05-15T10:30:00',
  estimatedDelivery: '2026-05-17',
  clinic: {
    id: 'clinic-1',
    name: 'Clínica São Lucas',
    address: 'Av. Paulista, 1000',
  },
  items: [
    {
      id: 'item-1',
      productName: 'Xarelto 20mg',
      quantity: 50,
      unit: 'caixas',
    },
  ],
  timeline: [
    {
      status: 'confirmed',
      timestamp: '2026-05-15T10:30:00',
      description: 'Pedido confirmado',
    },
    {
      status: 'processing',
      timestamp: '2026-05-15T14:00:00',
      description: 'Pedido em separação no centro de distribuição',
    },
  ],
  driver: null, // Will be populated when shipped
};
```

### Functionality

1. **Real-time Updates:**
   - Poll order status every 30 seconds (or use WebSocket)
   - Show loading indicator when refreshing
   - Push notification when status changes

2. **Timeline:**
   - Show completed steps with checkmark and timestamp
   - Show current step highlighted
   - Show future steps grayed out

3. **Delivery Tracking (when shipped):**
   - Show driver name and photo
   - Show driver phone number
   - Show delivery vehicle info
   - Live map showing driver location (optional)

4. **Actions:**
   - Cancel order (only if not shipped)
   - Contact support
   - Download invoice (when delivered)

### Component Structure

```javascript
// File: components/atlas-order-tracking.jsx

function OrderTrackingScreen({ orderId, onBack }) {
  const [order, setOrder] = React.useState(ORDER_DETAIL);
  const [refreshing, setRefreshing] = React.useState(false);

  // Poll for updates
  React.useEffect(() => {
    const interval = setInterval(() => {
      // Fetch latest order status
      // fetchOrderStatus(orderId).then(setOrder);
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [orderId]);

  const handleRefresh = () => {
    setRefreshing(true);
    // Fetch latest status
    setTimeout(() => {
      setRefreshing(false);
      // Update order state
    }, 1000);
  };

  const handleCancelOrder = () => {
    if (confirm('Tem certeza que deseja cancelar este pedido?')) {
      // Cancel order API call
      // cancelOrder(orderId)
    }
  };

  const canCancel = !['shipped', 'delivered', 'cancelled'].includes(order.status);

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', paddingBottom: 80 }}>
      {/* Top Bar */}
      <div style={{
        padding: 16,
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <button
          onClick={onBack}
          style={{
            width: 32,
            height: 32,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 20,
          }}
        >
          ←
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Pedido #{order.id}</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>
            {new Date(order.createdAt).toLocaleDateString('pt-BR')}
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            border: 'none',
            background: '#f3f4f6',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            fontSize: 18,
            animation: refreshing ? 'spin 1s linear infinite' : 'none',
          }}
        >
          🔄
        </button>
      </div>

      {/* Status Card */}
      <div style={{ padding: 16 }}>
        <div style={{
          padding: 20,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 16,
          }}>
            <div style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              background: `${ORDER_STATUSES[order.status].color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
            }}>
              {ORDER_STATUSES[order.status].icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                {ORDER_STATUSES[order.status].label}
              </div>
              {order.estimatedDelivery && order.status !== 'delivered' && (
                <div style={{ fontSize: 13, color: '#6b7280' }}>
                  Previsão de entrega: {new Date(order.estimatedDelivery).toLocaleDateString('pt-BR')}
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div style={{ marginTop: 20 }}>
            {Object.keys(ORDER_STATUSES).filter(s => s !== 'pending' && s !== 'cancelled').map((status, idx) => {
              const timelineItem = order.timeline.find(t => t.status === status);
              const isCompleted = !!timelineItem;
              const isCurrent = status === order.status;
              
              return (
                <TimelineItem
                  key={status}
                  icon={ORDER_STATUSES[status].icon}
                  label={ORDER_STATUSES[status].label}
                  timestamp={timelineItem?.timestamp}
                  description={timelineItem?.description}
                  isCompleted={isCompleted}
                  isCurrent={isCurrent}
                  isLast={idx === Object.keys(ORDER_STATUSES).length - 3}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Delivery Info (when shipped) */}
      {order.driver && (
        <div style={{ padding: '0 16px 16px' }}>
          <div style={{
            padding: 16,
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
              Informações de entrega
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                background: '#e5e7eb',
                backgroundImage: order.driver.photo ? `url(${order.driver.photo})` : 'none',
                backgroundSize: 'cover',
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500 }}>
                  {order.driver.name}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>
                  {order.driver.vehicle}
                </div>
              </div>
              <a
                href={`tel:${order.driver.phone}`}
                style={{
                  padding: '8px 16px',
                  borderRadius: 8,
                  background: '#6366f1',
                  color: '#fff',
                  textDecoration: 'none',
                  fontSize: 14,
                }}
              >
                📞 Ligar
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Product List */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{
          padding: 16,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
            Produtos
          </div>
          {order.items.map(item => (
            <div
              key={item.id}
              style={{
                padding: '12px 0',
                borderTop: '1px solid #f3f4f6',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ fontSize: 15 }}>{item.productName}</div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>
                {item.quantity} {item.unit}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Address */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{
          padding: 16,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            Endereço de entrega
          </div>
          <div style={{ fontSize: 15 }}>🏥 {order.clinic.name}</div>
          <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            {order.clinic.address}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: '0 16px 16px', display: 'flex', gap: 12 }}>
        {canCancel && (
          <button
            onClick={handleCancelOrder}
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid #ef4444',
              borderRadius: 12,
              background: '#fff',
              color: '#ef4444',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancelar pedido
          </button>
        )}
        <button
          onClick={() => {/* Open support chat */}}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: 'none',
            borderRadius: 12,
            background: '#6366f1',
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Falar com suporte
        </button>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function TimelineItem({ icon, label, timestamp, description, isCompleted, isCurrent, isLast }) {
  const color = isCompleted || isCurrent ? '#6366f1' : '#d1d5db';
  
  return (
    <div style={{ display: 'flex', gap: 12, position: 'relative' }}>
      {/* Timeline line */}
      {!isLast && (
        <div style={{
          position: 'absolute',
          left: 15,
          top: 32,
          width: 2,
          height: 40,
          background: isCompleted ? '#6366f1' : '#e5e7eb',
        }} />
      )}
      
      {/* Icon */}
      <div style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        border: `2px solid ${color}`,
        background: isCompleted || isCurrent ? color : '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 16,
        flexShrink: 0,
        zIndex: 1,
      }}>
        {isCompleted ? '✓' : icon}
      </div>
      
      {/* Content */}
      <div style={{ flex: 1, paddingBottom: 20 }}>
        <div style={{
          fontSize: 15,
          fontWeight: isCurrent ? 600 : 500,
          color: isCompleted || isCurrent ? '#1f2937' : '#9ca3af',
        }}>
          {label}
        </div>
        {timestamp && (
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
            {new Date(timestamp).toLocaleString('pt-BR', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        )}
        {description && (
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
            {description}
          </div>
        )}
      </div>
    </div>
  );
}

const ORDER_STATUSES = {
  pending: { label: 'Pendente', icon: '⏱', color: '#f59e0b' },
  confirmed: { label: 'Confirmado', icon: '✅', color: '#10b981' },
  processing: { label: 'Em preparação', icon: '🔄', color: '#3b82f6' },
  shipped: { label: 'Saiu para entrega', icon: '🚚', color: '#8b5cf6' },
  delivered: { label: 'Entregue', icon: '📦', color: '#10b981' },
  cancelled: { label: 'Cancelado', icon: '❌', color: '#ef4444' },
};

const ORDER_DETAIL = {
  id: 'ORD-1234',
  status: 'processing',
  createdAt: '2026-05-15T10:30:00',
  estimatedDelivery: '2026-05-17',
  clinic: {
    id: 'clinic-1',
    name: 'Clínica São Lucas',
    address: 'Av. Paulista, 1000 - São Paulo, SP',
  },
  items: [
    {
      id: 'item-1',
      productName: 'Xarelto 20mg',
      quantity: 50,
      unit: 'caixas',
    },
    {
      id: 'item-2',
      productName: 'Aspirina 100mg',
      quantity: 30,
      unit: 'caixas',
    },
  ],
  timeline: [
    {
      status: 'confirmed',
      timestamp: '2026-05-15T10:30:00',
      description: 'Pedido confirmado e enviado ao centro de distribuição',
    },
    {
      status: 'processing',
      timestamp: '2026-05-15T14:00:00',
      description: 'Pedido em separação no centro de distribuição',
    },
  ],
  driver: null,
  // When shipped, driver would be:
  // driver: {
  //   name: 'Carlos Silva',
  //   phone: '+55 11 98765-4321',
  //   vehicle: 'Fiat Strada - ABC-1234',
  //   photo: 'https://...',
  // },
};

Object.assign(window, { OrderTrackingScreen, ORDER_STATUSES, ORDER_DETAIL });
```

### Integration Points

1. **From Orders Screen (`atlas-pedidos.jsx`):**
   - Tap order card: Open `OrderTrackingScreen`

2. **Real-time Updates:**
   - Poll API every 30 seconds for status
   - Or implement WebSocket connection
   - Send push notification when status changes

3. **Contact Support:**
   - "Falar com suporte" opens `SupportChatScreen` (TASK-012)

### Testing Checklist

- [ ] Order tracking screen loads with correct data
- [ ] Timeline shows all status steps
- [ ] Completed steps show checkmark and timestamp
- [ ] Current step is highlighted
- [ ] Future steps are grayed out
- [ ] Estimated delivery date displays correctly
- [ ] Product list shows all items with quantities
- [ ] Delivery address displays correctly
- [ ] Refresh button updates status
- [ ] Refresh animation works
- [ ] "Cancel order" button shows only when applicable
- [ ] Cancel confirmation dialog works
- [ ] "Falar com suporte" opens chat
- [ ] Driver info shows when status is "shipped"
- [ ] Call driver button works (tel: link)
- [ ] Auto-refresh polls every 30 seconds
- [ ] Status changes update UI immediately

---

## TASK-018: BI Drill-down Screens

### Context
The BI Dashboard shows high-level metrics with charts. Users need detailed drill-down screens to analyze specific metrics, see trends over time, and filter by dimensions.

### User Flow
1. User taps a metric card or chart on BI Dashboard
2. Drill-down screen opens showing detailed analysis
3. User can:
   - See granular data
   - Filter by date range, territory, product, etc.
   - View different chart types
   - Export data
   - Compare periods

### Visual Design

**Layout:**
- Top bar with back button and metric name
- Date range selector
- Main chart (line, bar, or pie)
- Summary stats cards
- Data table (optional)
- Export button

**Metric Detail:**
```
┌─────────────────────────────────┐
│ Vendas - Maio 2026              │
│                                 │
│   [Chart showing daily sales]   │
│                                 │
│ Total: R$ 125.000               │
│ Média: R$ 5.000/dia             │
│ Crescimento: +12%               │
└─────────────────────────────────┘
```

### Data Structure

```javascript
const BI_METRICS = {
  sales: {
    id: 'sales',
    name: 'Vendas',
    icon: '💰',
    unit: 'R$',
    data: [
      { date: '2026-05-01', value: 4500 },
      { date: '2026-05-02', value: 5200 },
      // ... daily data for current month
    ],
    total: 125000,
    average: 5000,
    growth: 12, // percentage
  },
  visits: {
    id: 'visits',
    name: 'Visitas',
    icon: '🏥',
    unit: 'visitas',
    data: [
      { date: '2026-05-01', value: 8 },
      { date: '2026-05-02', value: 10 },
      // ... daily data
    ],
    total: 203,
    average: 8.1,
    growth: -5,
  },
  // ... more metrics
};

const DATE_RANGES = [
  { id: 'today', label: 'Hoje' },
  { id: '7days', label: 'Últimos 7 dias' },
  { id: '30days', label: 'Últimos 30 dias' },
  { id: 'month', label: 'Este mês' },
  { id: 'quarter', label: 'Este trimestre' },
  { id: 'year', label: 'Este ano' },
  { id: 'custom', label: 'Personalizado' },
];
```

### Functionality

1. **Charts:**
   - Line chart for trends over time
   - Bar chart for comparisons
   - Pie chart for distributions
   - Toggle between chart types

2. **Date Range:**
   - Preset ranges (today, 7 days, 30 days, etc.)
   - Custom date picker
   - Compare with previous period

3. **Summary Stats:**
   - Total, Average, Min, Max
   - Growth percentage vs previous period
   - Color-coded growth indicator

4. **Filters:**
   - By territory/region
   - By product/category
   - By client type

5. **Export:**
   - Export chart as image
   - Export data as CSV

### Component Structure

```javascript
// File: components/atlas-bi-drilldown.jsx

function BIDrilldownScreen({ metricId, onBack }) {
  const metric = BI_METRICS[metricId];
  const [dateRange, setDateRange] = React.useState('30days');
  const [chartType, setChartType] = React.useState('line'); // line | bar | pie
  const [exporting, setExporting] = React.useState(false);

  const handleExport = () => {
    setExporting(true);
    
    // Generate CSV
    const headers = ['Data', metric.name];
    const rows = metric.data.map(d => [
      new Date(d.date).toLocaleDateString('pt-BR'),
      d.value,
    ]);
    
    const csv = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${metric.id}_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    setTimeout(() => setExporting(false), 1000);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa', paddingBottom: 80 }}>
      {/* Top Bar */}
      <div style={{
        padding: 16,
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <button
          onClick={onBack}
          style={{
            width: 32,
            height: 32,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: 20,
          }}
        >
          ←
        </button>
        <div style={{ fontSize: 24, marginRight: 8 }}>{metric.icon}</div>
        <div style={{ flex: 1, fontSize: 20, fontWeight: 700 }}>{metric.name}</div>
        <button
          onClick={handleExport}
          disabled={exporting}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: exporting ? '#e5e7eb' : '#6366f1',
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: exporting ? 'not-allowed' : 'pointer',
          }}
        >
          {exporting ? '⏳' : '📥'} Exportar
        </button>
      </div>

      {/* Date Range Selector */}
      <div style={{
        padding: 16,
        background: '#fff',
        borderBottom: '1px solid #e5e7eb',
        overflowX: 'auto',
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {DATE_RANGES.map(range => (
            <button
              key={range.id}
              onClick={() => setDateRange(range.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: dateRange === range.id ? 'none' : '1px solid #e5e7eb',
                background: dateRange === range.id ? '#6366f1' : '#fff',
                color: dateRange === range.id ? '#fff' : '#6b7280',
                fontSize: 14,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
              }}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ padding: 16 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 12,
        }}>
          <SummaryCard
            label="Total"
            value={`${metric.unit === 'R$' ? 'R$ ' : ''}${metric.total.toLocaleString('pt-BR')}`}
            icon="📊"
          />
          <SummaryCard
            label="Média/dia"
            value={`${metric.unit === 'R$' ? 'R$ ' : ''}${metric.average.toLocaleString('pt-BR')}`}
            icon="📈"
          />
          <SummaryCard
            label="Crescimento"
            value={`${metric.growth > 0 ? '+' : ''}${metric.growth}%`}
            icon={metric.growth > 0 ? '📈' : '📉'}
            valueColor={metric.growth > 0 ? '#10b981' : '#ef4444'}
          />
          <SummaryCard
            label="Período"
            value="30 dias"
            icon="📅"
          />
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{
          padding: 20,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          {/* Chart Type Selector */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'flex-end' }}>
            {['line', 'bar'].map(type => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: chartType === type ? 'none' : '1px solid #e5e7eb',
                  background: chartType === type ? '#6366f1' : '#fff',
                  color: chartType === type ? '#fff' : '#6b7280',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                {type === 'line' ? '📈 Linha' : '📊 Barra'}
              </button>
            ))}
          </div>

          {/* Simple Chart Placeholder */}
          <div style={{
            height: 250,
            display: 'flex',
            alignItems: 'flex-end',
            gap: 4,
            padding: '20px 0',
            borderBottom: '2px solid #e5e7eb',
          }}>
            {metric.data.slice(0, 15).map((d, idx) => {
              const maxValue = Math.max(...metric.data.map(x => x.value));
              const height = (d.value / maxValue) * 200;
              
              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    height: `${height}px`,
                    background: chartType === 'line' ? '#6366f1' : '#6366f1',
                    borderRadius: chartType === 'bar' ? '4px 4px 0 0' : 0,
                    opacity: 0.8,
                    transition: 'opacity 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = 0.8}
                  title={`${new Date(d.date).toLocaleDateString('pt-BR')}: ${d.value}`}
                />
              );
            })}
          </div>
          
          <div style={{
            marginTop: 12,
            fontSize: 12,
            color: '#9ca3af',
            textAlign: 'center',
          }}>
            Últimos 15 dias • Toque nas barras para ver detalhes
          </div>
        </div>
      </div>

      {/* Data Table (optional) */}
      <div style={{ padding: '0 16px 16px' }}>
        <details style={{
          padding: 16,
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <summary style={{
            fontSize: 16,
            fontWeight: 600,
            cursor: 'pointer',
            color: '#6366f1',
          }}>
            📋 Ver dados detalhados
          </summary>
          <div style={{ marginTop: 16, maxHeight: 300, overflowY: 'auto' }}>
            <table style={{ width: '100%', fontSize: 14, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '8px 0', textAlign: 'left', fontWeight: 600 }}>Data</th>
                  <th style={{ padding: '8px 0', textAlign: 'right', fontWeight: 600 }}>{metric.name}</th>
                </tr>
              </thead>
              <tbody>
                {metric.data.slice(0, 30).map((d, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '8px 0' }}>
                      {new Date(d.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 500 }}>
                      {metric.unit === 'R$' ? 'R$ ' : ''}{d.value.toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, icon, valueColor = '#1f2937' }) {
  return (
    <div style={{
      padding: 16,
      background: '#fff',
      borderRadius: 12,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 20 }}>{icon}</div>
        <div style={{ fontSize: 13, color: '#6b7280' }}>{label}</div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: valueColor }}>
        {value}
      </div>
    </div>
  );
}

const BI_METRICS = {
  sales: {
    id: 'sales',
    name: 'Vendas',
    icon: '💰',
    unit: 'R$',
    data: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2026, 4, i + 1).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 3000) + 3000,
    })),
    total: 125000,
    average: 5000,
    growth: 12,
  },
  visits: {
    id: 'visits',
    name: 'Visitas',
    icon: '🏥',
    unit: 'visitas',
    data: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(2026, 4, i + 1).toISOString().split('T')[0],
      value: Math.floor(Math.random() * 5) + 6,
    })),
    total: 203,
    average: 8.1,
    growth: -5,
  },
};

const DATE_RANGES = [
  { id: 'today', label: 'Hoje' },
  { id: '7days', label: '7 dias' },
  { id: '30days', label: '30 dias' },
  { id: 'month', label: 'Este mês' },
  { id: 'quarter', label: 'Trimestre' },
  { id: 'year', label: 'Ano' },
];

Object.assign(window, { BIDrilldownScreen, BI_METRICS, DATE_RANGES });
```

### Integration Points

1. **From BI Dashboard (`atlas-bi.jsx`):**
   - Tap any metric card: Open `BIDrilldownScreen` with `metricId`
   - Tap chart area: Open drilldown for that specific metric

2. **Chart Library (Optional):**
   - For production, consider using Chart.js or Recharts via CDN
   - Add to `index.html`:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
   ```

### Testing Checklist

- [ ] Drilldown screen loads with correct metric data
- [ ] Date range selector works
- [ ] Summary cards show correct calculations
- [ ] Growth percentage displays with correct color (green/red)
- [ ] Chart renders with correct data
- [ ] Chart type toggle works (line/bar)
- [ ] Bars/points show values on hover
- [ ] Export button generates CSV
- [ ] CSV has correct filename and data
- [ ] Data table shows all records
- [ ] Data table is scrollable
- [ ] Details accordion expands/collapses
- [ ] Back button returns to BI Dashboard
- [ ] Handles different date ranges correctly
- [ ] Chart scales correctly with data values

---

## Summary

Phase 3 tasks complete the AtlasMed app user experience with:

1. **TASK-009:** Full-screen interactive territory map
2. **TASK-010:** Complete activity history with filtering
3. **TASK-011:** Help center with FAQs and tutorials
4. **TASK-012:** Real-time support chat
5. **TASK-013:** Terms of service and privacy policy
6. **TASK-014:** Multi-language selector
7. **TASK-015:** Expanded nearby clinics list
8. **TASK-016:** Advanced presentation filters
9. **TASK-017:** Live order tracking with timeline
10. **TASK-018:** BI metric drill-down screens

All components follow the established design system and integrate seamlessly with existing screens.
