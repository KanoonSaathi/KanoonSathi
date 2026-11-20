import { NextResponse } from 'next/server';
import { getLocalDb, saveLocalDb } from '../../../lib/db';
import { getUserFromRequest } from '../../../lib/auth';

export async function GET(req) {
  try {
    const user = getUserFromRequest(req);
    const db = getLocalDb();

    const savedCourts = db.savedCourts || [];
    const dockets = db.dockets || [];
    const rtis = db.rtis || [];

    const stats = {
      activeActionsCount: dockets.length || 3,
      actionsSub: '2 Civil Suits • 1 Writ Petition',
      nextHearingDate: 'Tomorrow',
      nextHearingDetails: '10:30 AM • Patiala House Court 14',
      savedCourtsCount: savedCourts.length || 3,
      savedCourtsSub: 'NJDG Direct Push Enabled',
      rtiCount: rtis.length || 2,
      rtiSub: 'Section 6(1) • 14 Days to PIO Reply'
    };

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name || 'Advocate Rajesh Sharma',
        role: user.role
      },
      stats,
      savedCourts,
      dockets
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = getUserFromRequest(req);
    const { court } = await req.json();

    if (!court || !court.name) {
      return NextResponse.json({ success: false, message: 'Invalid court data' }, { status: 400 });
    }

    const db = getLocalDb();
    if (!db.savedCourts) db.savedCourts = [];

    const existingIndex = db.savedCourts.findIndex(c => c.name.toLowerCase() === court.name.toLowerCase());
    let bookmarked = false;

    if (existingIndex >= 0) {
      db.savedCourts.splice(existingIndex, 1);
      bookmarked = false;
    } else {
      db.savedCourts.push({
        id: db.savedCourts.length + 1,
        userId: user.id,
        name: court.name,
        hindiName: court.hindiName || court.name,
        jurisdiction: court.jurisdiction || 'NCT of Delhi',
        distance: court.distanceText || `${court.distance || 3.0} km`,
        address: court.address,
        activeCases: 1,
        nextHearing: 'Listed Next Week',
        judge: 'Hon\'ble Presiding Judge',
        phone: court.helpline || '011-2338-0000',
        image: court.image || '/images/delhi_high_court.jpg'
      });
      bookmarked = true;
    }

    saveLocalDb(db);

    return NextResponse.json({
      success: true,
      bookmarked,
      message: bookmarked ? `Court "${court.name}" bookmarked to Workspace.` : `Court "${court.name}" removed from bookmarks.`,
      savedCourts: db.savedCourts
    });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
