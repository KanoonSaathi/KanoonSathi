import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Initial seed data for fallback database
const DEFAULT_DATA = {
  users: [
    {
      id: 'usr_default_rajesh',
      name: 'Advocate Rajesh Sharma',
      email: 'rajesh.sharma@delhibar.org',
      mobile: '9876543210',
      passwordHash: '$2a$10$7Z8V9m1wM2e8K1z5y3v7uu.kF8Z2wR4Pq3z0rK8j0v0l1b2c3d4e5', // Sovereign@2025
      role: 'Litigant / Citizen seeking legal help',
      barEnrollment: 'D/8849/2014',
      isVerified: true,
      aadhaarToken: '•••••••• 8812',
      eSignPaired: true,
      createdAt: new Date().toISOString()
    }
  ],
  otps: [],
  causeVault: [
    {
      id: 'cv_1',
      userId: 'usr_default_rajesh',
      name: 'Plaint & Statement of Truth - CS (OS) 482/2024.pdf',
      category: 'pleadings',
      caseNo: 'CS (OS) 482/2024 (Sharma v. Goel)',
      court: 'Patiala House District Courts Complex',
      date: '12 Sep 2026',
      size: '2.4 MB',
      hash: 'SHA256: 8f2a3d4e7b8c9a0123456789abcdef0123456789abcdef0123456789abcde0',
      status: 'Certified Copy',
      fileUrl: '/uploads/plaint_statement_of_truth_482_2024.pdf'
    },
    {
      id: 'cv_2',
      userId: 'usr_default_rajesh',
      name: 'Registered Vakalatnama & Bar Endorsement.pdf',
      category: 'vakalatnama',
      caseNo: 'CS (OS) 482/2024 (Sharma v. Goel)',
      court: 'Patiala House District Courts Complex',
      date: '14 Sep 2026',
      size: '840 KB',
      hash: 'SHA256: 19bc01928374650123456789abcdef0123456789abcdef0123456789abcde1',
      status: 'e-Signed',
      fileUrl: '/uploads/registered_vakalatnama.pdf'
    },
    {
      id: 'cv_3',
      userId: 'usr_default_rajesh',
      name: 'Judicial Order Sheet - Injunction Hearing.pdf',
      category: 'orders',
      caseNo: 'CS (OS) 482/2024 (Sharma v. Goel)',
      court: 'Court Room 14, PHC New Delhi',
      date: '28 Sep 2026',
      size: '1.1 MB',
      hash: 'SHA256: 4fa9928374650123456789abcdef0123456789abcdef0123456789abcdef02',
      status: 'Certified Order',
      fileUrl: '/uploads/judicial_order_sheet_injunction.pdf'
    },
    {
      id: 'cv_4',
      userId: 'usr_default_rajesh',
      name: 'Statutory Notice under Section 80 CPC.pdf',
      category: 'notices',
      caseNo: 'Pre-Litigation Record',
      court: 'Registry of Delhi Development Authority',
      date: '02 Aug 2026',
      size: '620 KB',
      hash: 'SHA256: ee81928374650123456789abcdef0123456789abcdef0123456789abcdef03',
      status: 'RPAD Delivered',
      fileUrl: '/uploads/section_80_cpc_notice.pdf'
    },
    {
      id: 'cv_5',
      userId: 'usr_default_rajesh',
      name: 'RTI Section 6(1) Application & Fee Receipt.pdf',
      category: 'rti',
      caseNo: 'RTI/MCD/2026/081',
      court: 'Public Information Officer, MCD South',
      date: '15 Aug 2026',
      size: '410 KB',
      hash: 'SHA256: 77a0198374650123456789abcdef0123456789abcdef0123456789abcdef04',
      status: 'Under Review',
      fileUrl: '/uploads/rti_section_6_1_mcd.pdf'
    }
  ],
  savedCourts: [
    {
      id: 1,
      userId: 'usr_default_rajesh',
      name: 'Patiala House District Courts Complex',
      hindiName: 'पटियाला हाउस जिला अदालत',
      jurisdiction: 'New Delhi District (South & New Delhi)',
      distance: '2.4 km from your geo-location',
      address: 'India Gate Circle, Purana Quila Road, New Delhi - 110001',
      activeCases: 2,
      nextHearing: 'Tomorrow • 10:30 AM (Court Room 14)',
      judge: 'Sh. Vikramajit Sen, DHJS (Commercial Court 02)',
      phone: '011-2338-6622',
      image: '/images/patiala_house_court.jpg'
    },
    {
      id: 2,
      userId: 'usr_default_rajesh',
      name: 'High Court of Delhi',
      hindiName: 'दिल्ली उच्च न्यायालय',
      jurisdiction: 'Appellate & Original Jurisdiction, NCT of Delhi',
      distance: '3.8 km from your geo-location',
      address: 'Sher Shah Road, New Delhi - 110503',
      activeCases: 1,
      nextHearing: '18 Oct 2026 • 11:15 AM (Court 04)',
      judge: 'Hon\'ble Mr. Justice Manmohan & Justice Mini Pushkarna',
      phone: '011-2338-4101',
      image: '/images/delhi_high_court.jpg'
    },
    {
      id: 3,
      userId: 'usr_default_rajesh',
      name: 'Tis Hazari District Courts Complex',
      hindiName: 'तीस हजारी जिला अदालत',
      jurisdiction: 'Central & West Districts',
      distance: '6.1 km from your geo-location',
      address: 'Mori Gate, Central Delhi - 110054',
      activeCases: 0,
      nextHearing: 'No active dockets scheduled',
      judge: 'Ld. Principal District & Sessions Judge',
      phone: '011-2395-0041',
      image: '/images/tis_hazari_court.jpg'
    }
  ],
  dockets: [
    {
      id: 'doc_1',
      cnr: 'DLND01-004821-2024',
      caseNo: 'CS (OS) 482/2024',
      parties: 'Sharma v. Goel & Ors.',
      cause: 'Civil Suit for Specific Performance',
      court: 'Patiala House Courts',
      courtRoom: 'Court Room 14',
      stage: 'Cross-Examination of PW-1',
      nextDate: 'Tomorrow, 10:30 AM',
      isUrgent: true,
      actionUrl: '/dossier',
      actionLabel: 'View Dossier'
    },
    {
      id: 'doc_2',
      cnr: 'DLHC01-009182-2024',
      caseNo: 'W.P.(C) 918/2024',
      parties: 'Rajesh Sharma v. Govt of NCT Delhi',
      cause: 'RTI Non-Compliance Writ',
      court: 'High Court of Delhi',
      courtRoom: 'Court Room 04',
      stage: 'Notice Issued to State',
      nextDate: '18 Oct 2026, 11:15 AM',
      isUrgent: false,
      actionUrl: '/rti',
      actionLabel: 'View RTI Draft'
    }
  ],
  rtis: [
    {
      id: 'rti_1',
      userId: 'usr_default_rajesh',
      department: 'mcd',
      departmentName: 'Municipal Corporation of Delhi (MCD) - Building Dept',
      applicantName: 'Adv. Rajesh Sharma',
      applicantAddress: 'Chamber 412, Patiala House Courts, New Delhi - 110001',
      bplStatus: false,
      questions: [
        'Please provide certified copy of sanctioned building plan for Property No. B-14, Connaught Circus, New Delhi.',
        'State the date and file diary number under which completion certificate was granted for said premises.',
        'Provide certified copies of inspection notes submitted by Junior Engineer (Building) between Jan 2024 to Aug 2024.'
      ],
      createdAt: '2026-10-12T10:00:00.000Z',
      status: 'Submitted'
    }
  ],
  assessments: [],
  legalAidApplications: [],
  notices: []
};

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DATA, null, 2), 'utf-8');
  }
}

export function getLocalDb() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return DEFAULT_DATA;
  }
}

export function saveLocalDb(data) {
  ensureDataFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// Global cached Mongoose connection
let cached = global.mongooseConnection;
if (!cached) {
  cached = global.mongooseConnection = { conn: null, promise: null };
}

export async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;

  // Check if URI is valid and does not have template placeholder
  if (!uri || uri.includes('<db_username>')) {
    return { isMongo: false, localDb: getLocalDb(), saveLocalDb };
  }

  if (cached.conn) {
    return { isMongo: true, conn: cached.conn };
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000
    }).then(mongooseInstance => mongooseInstance).catch(err => {
      console.warn('MongoDB connection failed, falling back to local persistent store:', err.message);
      return null;
    });
  }

  const conn = await cached.promise;
  if (!conn) {
    return { isMongo: false, localDb: getLocalDb(), saveLocalDb };
  }
  cached.conn = conn;
  return { isMongo: true, conn: cached.conn };
}
