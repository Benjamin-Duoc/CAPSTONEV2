// Mock data for initial development - Sprint 0/1 base data
// Full data is loaded from the backend API via create-db.py

export const heroHeading = {
  id: 1,
  title: 'CiPress',
  subtitle: 'Círculo de Periodistas Emprendedores e Innovadores de Chile'
};

export const siteStats = [
  { id: 1, label: 'Periodistas Registrados', value: '0', icon: 'users' },
  { id: 2, label: 'Publicaciones', value: '0', icon: 'articles' },
  { id: 3, label: 'Oportunidades Activas', value: '0', icon: 'briefcase' },
];

export const partnerLogos = [
  { id: 1, name: 'Colegio de Periodistas', logoUrl: '/assets/images/logo_colegio_periodistas_2021_web.png', websiteUrl: 'https://www.colegiodeperiodistas.cl/' },
  { id: 2, name: 'INMA', logoUrl: '/assets/images/inma-logo-test-01.svg', websiteUrl: 'https://www.inma.org/' },
];

export const chileanRegions: string[] = [
  "Arica y Parinacota",
  "Tarapacá",
  "Antofagasta",
  "Atacama",
  "Coquimbo",
  "Valparaíso",
  "Metropolitana de Santiago",
  "Libertador General Bernardo O'Higgins",
  "Maule",
  "Ñuble",
  "Biobío",
  "La Araucanía",
  "Los Ríos",
  "Los Lagos",
  "Aysén del General Carlos Ibáñez del Campo",
  "Magallanes y de la Antártica Chilena",
];
