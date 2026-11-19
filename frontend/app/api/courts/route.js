import { NextResponse } from 'next/server';

const COURTS = [
  {
    id: 1,
    tier: 'district',
    tierLabel: 'District & Sessions Court',
    name: 'Patiala House District Courts Complex',
    hindiName: 'पटियाला हाउस जिला अदालत परिसर',
    address: 'India Gate Circle, Purana Quila Road, New Delhi - 110001',
    jurisdiction: 'New Delhi District (South & New Delhi)',
    distance: 2.4,
    distanceText: '2.4 km',
    courtsCount: '34 Court Rooms',
    efilingCounter: 'Gate No. 2 (Counter 1-4)',
    helpline: '011-2338-6622',
    timings: '10:00 AM - 05:00 PM (Mon-Sat)',
    image: '/images/patiala_house_court.jpg',
    coords: { lat: 28.6148, lng: 77.2388 },
    mapPos: { x: 50, y: 52 },
    directionsUrl: 'https://maps.google.com/?q=Patiala+House+Court+New+Delhi'
  },
  {
    id: 2,
    tier: 'high',
    tierLabel: 'High Court',
    name: 'High Court of Delhi',
    hindiName: 'दिल्ली उच्च न्यायालय',
    address: 'Sher Shah Road, New Delhi - 110503',
    jurisdiction: 'NCT of Delhi (Appellate, Writ & Original)',
    distance: 3.8,
    distanceText: '3.8 km',
    courtsCount: '48 Benches',
    efilingCounter: 'Block-A e-Filing Registry',
    helpline: '011-2338-4101',
    timings: '10:30 AM - 04:30 PM (Mon-Fri)',
    image: '/images/delhi_high_court.jpg',
    coords: { lat: 28.6083, lng: 77.2407 },
    mapPos: { x: 54, y: 64 },
    directionsUrl: 'https://maps.google.com/?q=Delhi+High+Court'
  },
  {
    id: 3,
    tier: 'supreme',
    tierLabel: 'Apex Court of India',
    name: 'Supreme Court of India',
    hindiName: 'भारत का सर्वोच्च न्यायालय',
    address: 'Tilak Marg, Mandi House, New Delhi - 110001',
    jurisdiction: 'All India Constitutional & Appellate',
    distance: 2.9,
    distanceText: '2.9 km',
    courtsCount: '17 Court Rooms',
    efilingCounter: 'New Additional Building Complex',
    helpline: '011-2338-8922',
    timings: '10:30 AM - 04:00 PM (Mon-Fri)',
    image: '/images/supreme_court.jpg',
    coords: { lat: 28.6225, lng: 77.2393 },
    mapPos: { x: 52, y: 38 },
    directionsUrl: 'https://maps.google.com/?q=Supreme+Court+of+India'
  },
  {
    id: 4,
    tier: 'district',
    tierLabel: 'District & Sessions Court',
    name: 'Tis Hazari District Courts Complex',
    hindiName: 'तीस हजारी जिला अदालत परिसर',
    address: 'Mori Gate, Central Delhi - 110054',
    jurisdiction: 'Central & West Districts',
    distance: 6.1,
    distanceText: '6.1 km',
    courtsCount: '80+ Court Rooms',
    efilingCounter: 'Central Registry Room 102',
    helpline: '011-2395-0041',
    timings: '10:00 AM - 05:00 PM (Mon-Sat)',
    image: '/images/tis_hazari_court.jpg',
    coords: { lat: 28.6672, lng: 77.2155 },
    mapPos: { x: 34, y: 18 },
    directionsUrl: 'https://maps.google.com/?q=Tis+Hazari+Court'
  },
  {
    id: 5,
    tier: 'district',
    tierLabel: 'District Court Complex',
    name: 'Saket District Courts Complex',
    hindiName: 'साकेत जिला अदालत परिसर',
    address: 'Press Enclave Road, Saket, New Delhi - 110017',
    jurisdiction: 'South & South-East Districts',
    distance: 11.5,
    distanceText: '11.5 km',
    courtsCount: '52 Court Rooms',
    efilingCounter: 'Ground Floor Administrative Block',
    helpline: '011-2956-2001',
    timings: '10:00 AM - 05:00 PM (Mon-Sat)',
    image: '/images/patiala_house_court.jpg',
    coords: { lat: 28.5245, lng: 77.2185 },
    mapPos: { x: 42, y: 88 },
    directionsUrl: 'https://maps.google.com/?q=Saket+District+Court'
  },
  {
    id: 6,
    tier: 'tribunal',
    tierLabel: 'Tribunal & Authority',
    name: 'National Green Tribunal (NGT) Principal Bench',
    hindiName: 'राष्ट्रीय हरित अधिकरण (प्रिंसिपल बेंच)',
    address: 'Faridkot House, Copernicus Marg, New Delhi - 110001',
    jurisdiction: 'Environmental & Ecological Disputes (National)',
    distance: 2.1,
    distanceText: '2.1 km',
    courtsCount: '04 Benches',
    efilingCounter: 'Registry Counter 1',
    helpline: '011-2304-3500',
    timings: '10:00 AM - 05:00 PM (Mon-Fri)',
    image: '/images/delhi_high_court.jpg',
    coords: { lat: 28.6202, lng: 77.2356 },
    mapPos: { x: 46, y: 44 },
    directionsUrl: 'https://maps.google.com/?q=National+Green+Tribunal'
  }
];

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const tier = searchParams.get('tier') || 'all';
  const radius = parseFloat(searchParams.get('radius') || '50');

  let filtered = COURTS.filter(c => {
    const matchesSearch = !q || c.name.toLowerCase().includes(q.toLowerCase()) ||
                          c.hindiName.includes(q) ||
                          c.address.toLowerCase().includes(q.toLowerCase());
    const matchesTier = tier === 'all' || c.tier === tier;
    const matchesRadius = c.distance <= radius;
    return matchesSearch && matchesTier && matchesRadius;
  });

  return NextResponse.json({
    success: true,
    courts: filtered,
    total: filtered.length
  });
}
