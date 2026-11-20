import { NextResponse } from 'next/server';

const CLINICS = [
  {
    id: 1,
    name: 'Delhi Bar Association Legal Aid Clinic',
    hindi: 'दिल्ली बार एसोसिएशन निःशुल्क विधिक सहायता केंद्र',
    type: 'general',
    typeLabel: 'General Litigation',
    address: 'Hall No. 2, Tis Hazari Court Complex, Delhi - 110054',
    timings: '02:00 PM - 05:00 PM (Daily)',
    paralegal: 'Adv. Suresh Narain (PLV Empaneled)',
    phone: '011-2395-8812',
    badge: 'Free Consultation'
  },
  {
    id: 2,
    name: 'Women & Child Legal Defense Clinic (One Stop Centre)',
    hindi: 'महिला एवं बाल विधिक संरक्षण केंद्र',
    type: 'women',
    typeLabel: 'Women & Domestic Violence',
    address: 'Deen Dayal Upadhyay Hospital Complex, Hari Nagar, New Delhi',
    timings: 'Open 24 Hours Emergency Desk',
    paralegal: 'Smt. Kavita Mehra (Counselor & Legal Advocate)',
    phone: '181 / 011-2512-0044',
    badge: '24x7 Emergency'
  },
  {
    id: 3,
    name: 'Labour & Industrial Workers Free Legal Cell',
    hindi: 'श्रमिक एवं कामगार विधिक सहायता प्रकोष्ठ',
    type: 'labour',
    typeLabel: 'Labour Rights & Wages',
    address: 'Pusa Road Industrial Area, Karampura, New Delhi - 110015',
    timings: '10:00 AM - 04:00 PM (Mon-Fri)',
    paralegal: 'Sh. Ram Avtar Verma (Trade Union Legal Advisor)',
    phone: '011-2541-9921',
    badge: 'Free Court Representation'
  },
  {
    id: 4,
    name: 'Senior Citizen Legal Redressal Clinic',
    hindi: 'वरिष्ठ नागरिक विधिक समाधान केंद्र',
    type: 'senior',
    typeLabel: 'Senior Citizens (Maintenance Act)',
    address: 'Near Sub-Divisional Magistrate Office, Vasant Vihar, New Delhi',
    timings: '11:00 AM - 03:00 PM (Mon-Sat)',
    paralegal: 'Adv. Meenakshi Sundaram',
    phone: '011-2615-3341',
    badge: 'Home Visit Available'
  }
];

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'all';

  let filtered = CLINICS;
  if (type !== 'all') {
    filtered = CLINICS.filter(c => c.type === type);
  }

  return NextResponse.json({
    success: true,
    clinics: filtered
  });
}
