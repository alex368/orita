// Mock data for tours, drivers, and bookings

export interface Tour {
  id: string;
  title: string;
  durations: { days: number; price: number }[];
  highlights: string[];
  included: string[];
  notIncluded: string[];
  image: string;
  popular?: boolean;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  zone: string;
  vehicleType: string;
  available: boolean;
  image: string;
}

export interface BonPlan {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
}

export interface Booking {
  id: string;
  type: 'tour' | 'driver';
  tourId?: string;
  tourTitle?: string;
  driverId?: string;
  driverName?: string;
  date: string;
  duration: number;
  price: number;
  status: 'pending' | 'confirmed' | 'unavailable' | 'refunded';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}

export const tours: Tour[] = [
  {
    id: '1',
    title: 'Découverte de Cotonou & Ganvié',
    durations: [
      { days: 1, price: 45000 },
      { days: 3, price: 120000 }
    ],
    highlights: [
      'Visite de la cité lacustre de Ganvié',
      'Marché Dantokpa',
      'Plage de Fidjrossè',
      'Musée Honmè'
    ],
    included: [
      'Prise en charge à l\'aéroport',
      'Transport A à Z',
      'Guide francophone',
      'Hébergement (3 jours)',
      'Repas principaux'
    ],
    notIncluded: [
      'Boissons alcoolisées',
      'Pourboires',
      'Activités non mentionnées'
    ],
    image: 'https://images.unsplash.com/photo-1753818268804-662cabaa63de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCZW5pbiUyMEdhbnZpZSUyMHN0aWx0JTIwaG91c2VzfGVufDF8fHx8MTc3MTk1MzQ1MHww&ixlib=rb-4.1.0&q=80&w=1080',
    popular: true
  },
  {
    id: '2',
    title: 'Route des Esclaves - Ouidah',
    durations: [
      { days: 1, price: 35000 },
      { days: 3, price: 95000 }
    ],
    highlights: [
      'Porte du Non-Retour',
      'Musée d\'Histoire',
      'Temple des Pythons',
      'Forêt Sacrée'
    ],
    included: [
      'Transport aller-retour',
      'Guide historique',
      'Entrées aux sites',
      'Déjeuner typique'
    ],
    notIncluded: [
      'Hébergement',
      'Dîner',
      'Souvenirs'
    ],
    image: 'https://images.unsplash.com/photo-1638427067705-457b6480ed2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCZW5pbiUyME91aWRhaCUyMHRlbXBsZSUyMGhpc3Rvcnl8ZW58MXx8fHwxNzcxOTUzNDUxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    popular: true
  },
  {
    id: '3',
    title: 'Safari Parc Pendjari',
    durations: [
      { days: 3, price: 250000 },
      { days: 8, price: 580000 }
    ],
    highlights: [
      'Safari 4x4',
      'Observation éléphants & lions',
      'Chutes de Tanougou',
      'Villages Tata Somba'
    ],
    included: [
      'Transport 4x4',
      'Hébergement lodge',
      'Tous les repas',
      'Guides rangers',
      'Entrées parc'
    ],
    notIncluded: [
      'Vols internes',
      'Assurance voyage',
      'Équipement photo pro'
    ],
    image: 'https://images.unsplash.com/photo-1760199078626-d295728e9b1b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBZnJpY2FuJTIwc2FmYXJpJTIwd2lsZGxpZmUlMjBuYXR1cmV8ZW58MXx8fHwxNzcxOTUzNDUxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    popular: false
  },
  {
    id: '4',
    title: 'Immersion Culturelle - Grand Tour',
    durations: [
      { days: 8, price: 450000 },
      { days: 12, price: 620000 }
    ],
    highlights: [
      'Cotonou, Ouidah, Porto-Novo',
      'Abomey - Palais Royaux',
      'Parc Pendjari',
      'Rencontres avec artisans'
    ],
    included: [
      'Tout compris A à Z',
      'Hébergements variés',
      'Tous les repas',
      'Guides spécialisés',
      'Transferts aéroport'
    ],
    notIncluded: [
      'Visa',
      'Vaccins',
      'Shopping personnel'
    ],
    image: 'https://images.unsplash.com/photo-1753818293325-9d01d3e79885?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCZW5pbiUyMGN1bHR1cmFsJTIwdHJhZGl0aW9uYWwlMjBkYW5jZXxlbnwxfHx8fDE3NzE5NTM0NTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    popular: true
  },
  {
    id: '5',
    title: 'Détente Plages du Bénin',
    durations: [
      { days: 3, price: 85000 },
      { days: 8, price: 210000 }
    ],
    highlights: [
      'Plages Grand-Popo',
      'Lac Ahémé',
      'Pêche traditionnelle',
      'Massage & spa'
    ],
    included: [
      'Hébergement bord de mer',
      'Petits-déjeuners',
      'Activités nautiques',
      'Transport privé'
    ],
    notIncluded: [
      'Déjeuners & dîners',
      'Excursions optionnelles',
      'Spa premium'
    ],
    image: 'https://images.unsplash.com/photo-1734867837237-7c41b0e97df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCZW5pbiUyMHRvdXJpc20lMjBiZWFjaCUyMGNvYXN0fGVufDF8fHx8MTc3MTk1MzQ1MHww&ixlib=rb-4.1.0&q=80&w=1080',
    popular: false
  }
];

export const drivers: Driver[] = [
  {
    id: '1',
    name: 'Kofi Mensah',
    phone: '+229 97 12 34 56',
    whatsapp: '+229 97 12 34 56',
    zone: 'Cotonou / Littoral',
    vehicleType: '4x4 Toyota (7 places)',
    available: true,
    image: 'https://images.unsplash.com/photo-1762657478568-69c8fc06225e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBZnJpY2FuJTIwZHJpdmVyJTIwY2FyJTIwdGF4aXxlbnwxfHx8fDE3NzE5NTM0NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '2',
    name: 'Amara Diallo',
    phone: '+229 96 45 67 89',
    whatsapp: '+229 96 45 67 89',
    zone: 'Ouidah / Côte',
    vehicleType: 'Berline climatisée (4 places)',
    available: true,
    image: 'https://images.unsplash.com/photo-1762657478568-69c8fc06225e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBZnJpY2FuJTIwZHJpdmVyJTIwY2FyJTIwdGF4aXxlbnwxfHx8fDE3NzE5NTM0NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '3',
    name: 'Youssef Traoré',
    phone: '+229 94 23 45 67',
    whatsapp: '+229 94 23 45 67',
    zone: 'Porto-Novo / Plateau',
    vehicleType: 'Minibus (12 places)',
    available: false,
    image: 'https://images.unsplash.com/photo-1762657478568-69c8fc06225e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBZnJpY2FuJTIwZHJpdmVyJTIwY2FyJTIwdGF4aXxlbnwxfHx8fDE3NzE5NTM0NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '4',
    name: 'Sébastien Akotovi',
    phone: '+229 98 76 54 32',
    whatsapp: '+229 98 76 54 32',
    zone: 'Nord / Parakou',
    vehicleType: '4x4 Pick-up (5 places)',
    available: true,
    image: 'https://images.unsplash.com/photo-1762657478568-69c8fc06225e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBZnJpY2FuJTIwZHJpdmVyJTIwY2FyJTIwdGF4aXxlbnwxfHx8fDE3NzE5NTM0NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080'
  }
];

export const bonsPlans: BonPlan[] = [
  {
    id: '1',
    title: 'Chez Clarisse',
    category: 'Restaurant',
    description: 'Restaurant traditionnel béninois. Pâte rouge, amiwo, akassa. Prix abordables, ambiance familiale.',
    image: 'https://images.unsplash.com/photo-1763140556679-d2c9c10df590?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxBZnJpY2FuJTIwcmVzdGF1cmFudCUyMGxvY2FsJTIwZm9vZHxlbnwxfHx8fDE3NzE5NTM0NTJ8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '2',
    title: 'Plage de Fidjrossè',
    category: 'Plage',
    description: 'Plage populaire près de Cotonou. Idéal pour sunset, bars de plage, sports nautiques.',
    image: 'https://images.unsplash.com/photo-1734867837237-7c41b0e97df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCZW5pbiUyMHRvdXJpc20lMjBiZWFjaCUyMGNvYXN0fGVufDF8fHx8MTc3MTk1MzQ1MHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '3',
    title: 'Marché Artisanal d\'Abomey',
    category: 'Shopping',
    description: 'Artisanat local : sculptures, tissus, bijoux. Négociation possible. Ouvert 7j/7.',
    image: 'https://images.unsplash.com/photo-1753818293325-9d01d3e79885?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCZW5pbiUyMGN1bHR1cmFsJTIwdHJhZGl0aW9uYWwlMjBkYW5jZXxlbnwxfHx8fDE3NzE5NTM0NTB8MA&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '4',
    title: 'Ganvié en pirogue',
    category: 'Activité',
    description: 'Visite en pirogue de la cité lacustre. Départ tôt le matin pour le marché flottant.',
    image: 'https://images.unsplash.com/photo-1753818268804-662cabaa63de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCZW5pbiUyMEdhbnZpZSUyMHN0aWx0JTIwaG91c2VzfGVufDF8fHx8MTc3MTk1MzQ1MHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '5',
    title: 'Bar Azalaï Lounge',
    category: 'Sortie',
    description: 'Bar branché à Cotonou. Cocktails, DJ sets, terrasse vue mer. Ambiance cosmopolite.',
    image: 'https://images.unsplash.com/photo-1734867837237-7c41b0e97df4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCZW5pbiUyMHRvdXJpc20lMjBiZWFjaCUyMGNvYXN0fGVufDF8fHx8MTc3MTk1MzQ1MHww&ixlib=rb-4.1.0&q=80&w=1080'
  },
  {
    id: '6',
    title: 'Temple des Pythons',
    category: 'Lieu',
    description: 'Temple vodoun à Ouidah. Serpents sacrés, guide obligatoire. Expérience unique.',
    image: 'https://images.unsplash.com/photo-1638427067705-457b6480ed2f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxCZW5pbiUyME91aWRhaCUyMHRlbXBsZSUyMGhpc3Rvcnl8ZW58MXx8fHwxNzcxOTUzNDUxfDA&ixlib=rb-4.1.0&q=80&w=1080'
  }
];

// Mock bookings storage
let bookings: Booking[] = [];

export const addBooking = (booking: Omit<Booking, 'id'>): Booking => {
  const newBooking = {
    ...booking,
    id: `BK${Date.now()}`
  };
  bookings.push(newBooking);
  return newBooking;
};

export const getBookings = (): Booking[] => {
  return bookings;
};

export const updateBookingStatus = (id: string, status: Booking['status']) => {
  const booking = bookings.find(b => b.id === id);
  if (booking) {
    booking.status = status;
  }
};
