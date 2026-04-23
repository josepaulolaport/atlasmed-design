// Mock data for the clinic/doctor list.

const FIRST_NAMES_M = ['Rafael','Bruno','Carlos','Diego','Eduardo','Felipe','Gustavo','Henrique','Igor','João','Leonardo','Marcelo','Nicolas','Otávio','Paulo','Rodrigo','Thiago','Vinícius','André','Fábio'];
const FIRST_NAMES_F = ['Ana','Beatriz','Camila','Daniela','Eliane','Fernanda','Giovana','Helena','Isabela','Juliana','Larissa','Mariana','Natália','Olívia','Patrícia','Renata','Sofia','Tatiana','Valéria','Yasmin'];
const LAST_NAMES = ['Silva','Santos','Oliveira','Souza','Rodrigues','Ferreira','Almeida','Nascimento','Lima','Araújo','Costa','Cardoso','Carvalho','Teixeira','Pereira','Gomes','Martins','Rocha','Ribeiro','Moreira','Mendes','Barbosa','Moraes','Azevedo','Pinheiro'];

const CLINIC_SUFFIXES = ['Clínica','Centro Médico','Instituto','Hospital','Policlínica'];
const CLINIC_BRAND = ['Vida','Saúde','Bem Estar','Nova Era','Esperança','São Lucas','Santa Mônica','Cardio','OrtoCenter','NeuroVida','Dermavida','Vitalis','Primavera','CardioMed','OrtoVita','Unimed','Santa Clara','Vida Nova','Recoleta','Progresso'];

const NEIGHBORHOODS = ['Pinheiros','Itaim Bibi','Vila Olímpia','Moema','Vila Mariana','Jardins','Bela Vista','Consolação','Perdizes','Higienópolis','Vila Madalena','Morumbi','Santana','Tatuapé','Liberdade','Vila Nova Conceição','Butantã','Ipiranga'];

const SPECIALTIES = ['Cardiologia','Ortopedia','Dermatologia','Pediatria','Ginecologia','Neurologia','Oftalmologia','Endocrinologia','Reumatologia','Urologia','Psiquiatria','Otorrino','Gastro','Oncologia','Cirurgia Plástica'];

const PRODUCTS = ['AtlasGel','AtlasDerm','CardioFlex','OrtoPlus','VitalScan','AtlasVit','DermaShield'];

const STATUSES = [
  { key: 'ativa', label: 'Ativa', color: '#16a373', bg: 'rgba(22,163,115,0.12)' },
  { key: 'negociacao', label: 'Em negociação', color: '#c6861b', bg: 'rgba(198,134,27,0.14)' },
  { key: 'inativa', label: 'Inativa', color: '#b84545', bg: 'rgba(184,69,69,0.12)' },
  { key: 'nunca', label: 'Nunca comprou', color: '#707079', bg: 'rgba(112,112,121,0.14)' },
  { key: 'rejeicao', label: 'Rejeição', color: '#d14a4a', bg: 'rgba(209,74,74,0.12)' },
];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function pick(arr, rnd) { return arr[Math.floor(rnd() * arr.length)]; }

function genClinics(count = 60, seed = 42) {
  const rnd = seededRandom(seed);
  const list = [];
  for (let i = 0; i < count; i++) {
    const status = pick(STATUSES, rnd);
    const last = Math.floor(rnd() * 180);
    const needsAttention = status.key === 'ativa' && last > 60;
    list.push({
      id: `c-${i}`,
      kind: 'clinic',
      name: `${pick(CLINIC_SUFFIXES, rnd)} ${pick(CLINIC_BRAND, rnd)}`,
      city: `${pick(NEIGHBORHOODS, rnd)}, São Paulo`,
      neighborhood: pick(NEIGHBORHOODS, rnd),
      distance: +(rnd() * 28 + 0.3).toFixed(1),
      status: status.key,
      statusLabel: status.label,
      statusColor: status.color,
      statusBg: status.bg,
      lastVisitDays: status.key === 'nunca' ? null : last,
      doctorCount: Math.floor(rnd() * 14) + 1,
      priority: (needsAttention || status.key === 'rejeicao') && rnd() > 0.4,
      products: Array.from({ length: Math.floor(rnd() * 3) }, () => pick(PRODUCTS, rnd)),
    });
  }
  // sort so known statuses are interleaved but first few show variety
  return list;
}

function genDoctors(count = 60, seed = 99) {
  const rnd = seededRandom(seed);
  const list = [];
  for (let i = 0; i < count; i++) {
    const female = rnd() > 0.55;
    const first = pick(female ? FIRST_NAMES_F : FIRST_NAMES_M, rnd);
    const last = `${pick(LAST_NAMES, rnd)} ${pick(LAST_NAMES, rnd)}`;
    const specialty = pick(SPECIALTIES, rnd);
    const lastContact = Math.floor(rnd() * 120);
    list.push({
      id: `d-${i}`,
      kind: 'doctor',
      name: `Dr${female ? 'a.' : '.'} ${first} ${last}`,
      specialty,
      clinic: `${pick(CLINIC_SUFFIXES, rnd)} ${pick(CLINIC_BRAND, rnd)}`,
      crm: `CRM/SP ${(100000 + Math.floor(rnd() * 800000))}`,
      distance: +(rnd() * 30 + 0.5).toFixed(1),
      lastContactDays: lastContact,
      priority: lastContact > 75 && rnd() > 0.5,
      initials: first[0] + last[0],
      hue: Math.floor(rnd() * 360),
    });
  }
  return list;
}

const CLINICS_ALL = genClinics(80, 42);
const DOCTORS_ALL = genDoctors(80, 77);

function formatLastVisit(days) {
  if (days == null) return 'Nunca visitada';
  if (days === 0) return 'Hoje';
  if (days === 1) return 'Ontem';
  if (days < 7) return `Há ${days} dias`;
  if (days < 30) return `Há ${Math.floor(days / 7)} semana${Math.floor(days / 7) > 1 ? 's' : ''}`;
  if (days < 60) return 'Há 1 mês';
  return `Há ${Math.floor(days / 30)} meses`;
}

Object.assign(window, { CLINICS_ALL, DOCTORS_ALL, STATUSES, PRODUCTS, formatLastVisit });
