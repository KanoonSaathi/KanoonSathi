import { Groq } from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;

let groqClient = null;
if (apiKey) {
  try {
    groqClient = new Groq({ apiKey });
  } catch (e) {
    console.warn('Groq client initialization error:', e.message);
  }
}

export async function analyzeLegalSituation({ category, grievance, causeDate, urgency, language = 'en' }) {
  if (!groqClient) {
    return getFallbackAnalysis(category, grievance, language);
  }

  const systemPrompt = `You are KanoonSaathi's AI Senior Constitutional & Civil Law Triage Advocate, specialized in Indian jurisprudence, Bharatiya Nyaya Sanhita (BNS 2023), Civil Procedure Code (CPC 1908), Specific Relief Act 1963, Transfer of Property Act 1882, Negotiable Instruments Act 1881, Consumer Protection Act 2019, and Article 39A of the Constitution of India.

Analyze the citizen's legal grievance and output ONLY valid JSON matching this exact structure:
{
  "identifiedCauses": "Concise heading of identified legal causes of action",
  "applicableStatutes": [
    "Section X, Act Name: Short description of applicability",
    "Section Y, Act Name: Short description of applicability",
    "Section Z, Act Name: Short description of applicability"
  ],
  "forum": "Appropriate Court / Forum of Jurisdiction (e.g. Court of Civil Judge, Rent Tribunal, Consumer Disputes Commission)",
  "limitationPeriod": "Statutory Limitation period under Limitation Act 1963 (e.g. 3 Years, 6 Months)",
  "interimRelief": "Available interim relief (e.g. Temporary Injunction under Order XXXIX CPC, Stay Order)",
  "recommendedActions": [
    "Step 1: Immediate legal notice or action",
    "Step 2: Evidentiary preservation and documentation",
    "Step 3: Formal institution or filing before appropriate forum"
  ]
}`;

  const userPrompt = `Dispute Category: ${category}
Cause of Action Date: ${causeDate || 'Not specified'}
Urgency Level: ${urgency}
Language: ${language}
Citizen Grievance Narrative:
"${grievance}"

Provide the statutory assessment strictly as JSON.`;

  const modelsToTry = ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'allam-2-7b'];

  for (const model of modelsToTry) {
    try {
      const response = await groqClient.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
        max_tokens: 1024
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const parsed = JSON.parse(content);
        return {
          success: true,
          modelUsed: model,
          ...parsed
        };
      }
    } catch (err) {
      console.warn(`Groq model ${model} failed, attempting next:`, err.message);
    }
  }

  // Fallback to high quality rule-based response if LLM quota or connection fails
  return getFallbackAnalysis(category, grievance, language);
}

function getFallbackAnalysis(category, grievance, language) {
  const isHi = language === 'hi';

  const fallbacks = {
    property: {
      identifiedCauses: isHi ? 'अवैध बेदखली एवं पट्टा अनुबंध का उल्लंघन' : 'Unlawful Dispossession & Breach of Lease Covenant',
      applicableStatutes: [
        'Section 6, Specific Relief Act, 1963: Suit by person dispossessed of immovable property without due process.',
        'Section 106, Transfer of Property Act, 1882: Mandatory 15-day statutory notice for lease termination.',
        'Section 316 BNS (Old 405 IPC): Criminal Breach of Trust regarding withheld security deposit.'
      ],
      forum: 'Court of Civil Judge (Senior Division) / Rent Tribunal',
      limitationPeriod: '6 Months from Dispossession (Section 6 SRA) / 3 Years for Deposit Recovery',
      interimRelief: 'Temporary Injunction under Order XXXIX Rules 1 & 2 CPC to restrain coercive dispossession',
      recommendedActions: [
        'Issue a formal legal reply notice under Section 106 Transfer of Property Act refuting arbitrary 3-day notice.',
        'Digitally archive registered lease agreement, rent transaction slips, and landlord communication in Cause Vault.',
        'Lodge Police Daily Diary (DD) entry if intimidation or lock-breaking is threatened.',
        'File civil suit for Permanent and Mandatory Injunction with an ex-parte ad-interim stay application.'
      ]
    },
    cheque: {
      identifiedCauses: isHi ? 'परक्राम्य लिखत अधिनियम की धारा 138 के तहत चेक अनादरण' : 'Dishonour of Cheque under Section 138 Negotiable Instruments Act',
      applicableStatutes: [
        'Section 138, Negotiable Instruments Act, 1881: Offence of dishonour of cheque for insufficiency of funds.',
        'Section 139, NI Act: Statutory presumption of legally enforceable debt in favour of holder.',
        'Section 318 BNS (Old 420 IPC): Cheating and dishonestly inducing delivery of property.'
      ],
      forum: 'Court of Metropolitan Magistrate (Special NI Act Court)',
      limitationPeriod: 'Statutory Notice within 30 days of memo; Complaint within 30 days following 15-day demand window',
      interimRelief: 'Interim Compensation up to 20% under Section 143A of NI Act',
      recommendedActions: [
        'Dispatch Statutory Demand Notice under Section 138(b) NI Act via Registered Post A.D. within 30 days of return memo.',
        'Collect certified Bank Return Memo with official bank endorsement stamp.',
        'Wait for statutory 15-day compliance window to elapse.',
        'Institute Criminal Complaint under Section 142 NI Act before the jurisdictional Magistrate.'
      ]
    },
    consumer: {
      identifiedCauses: isHi ? 'उपभोक्ता संरक्षण अधिनियम 2019 के अंतर्गत सेवा में कमी' : 'Deficiency in Service & Unfair Trade Practice',
      applicableStatutes: [
        'Section 2(11), Consumer Protection Act, 2019: Deficiency in goods or services.',
        'Section 35, Consumer Protection Act, 2019: Filing of complaint before District Commission.',
        'Section 84, CPA 2019: Product Liability Action for defective deliverables.'
      ],
      forum: 'District Consumer Disputes Redressal Commission (DCDRC)',
      limitationPeriod: '2 Years from the date on which cause of action arose (Section 69 CPA 2019)',
      interimRelief: 'Interim direction under Section 38(8) CPA for deposit or replacement',
      recommendedActions: [
        'Register formal grievance on National Consumer Helpline (NCH - 1915).',
        'Issue formal statutory pre-litigation legal notice giving 15 days for refund/rectification.',
        'File e-Daakhil consumer complaint before District Commission with invoice and service logs.'
      ]
    },
    matrimonial: {
      identifiedCauses: isHi ? 'पारिवारिक एवं भरण-पोषण संरक्षण विवाद' : 'Maintenance, Residence Rights & Matrimonial Protection',
      applicableStatutes: [
        'Section 12, Protection of Women from Domestic Violence Act (PWDVA) 2005.',
        'Section 144 BNSS (Old 125 CrPC): Order for maintenance of wives, children, and parents.',
        'Section 9/13, Hindu Marriage Act, 1955: Restitution of Conjugal Rights / Dissolution of Marriage.'
      ],
      forum: 'Family Court / Court of Metropolitan Magistrate',
      limitationPeriod: 'Continuous cause of action for maintenance and residence protection',
      interimRelief: 'Interim Maintenance and Protection Order under Section 23 of DV Act',
      recommendedActions: [
        'Seek confidential consultation at NALSA One-Stop Center or Legal Services Authority.',
        'File application under Section 12 DV Act for protection, residence, and monetary relief.',
        'Participate in pre-litigation mediation at Delhi High Court or District Court Mediation Center.'
      ]
    },
    cyber: {
      identifiedCauses: isHi ? 'साइबर वित्तीय धोखाधड़ी एवं अनधिकृत लेन-देन' : 'Cyber Financial Fraud & Unauthorised Digital Transfer',
      applicableStatutes: [
        'Section 66D, Information Technology Act, 2000: Cheating by personation using computer resource.',
        'Section 318(4) & 319 BNS: Cheating and identity personation.',
        'RBI Circular DBR.No.Leg.BC.78/09.07.005/2017-18: Zero liability of customer for unauthorised electronic transactions.'
      ],
      forum: 'Cyber Crime Police Station / Adjudicating Officer under IT Act',
      limitationPeriod: 'Immediate reporting within golden hours (24 Hours); 3 Years under Limitation Act',
      interimRelief: 'Freezing of beneficiary debit freeze account via National Cyber Crime Reporting Portal (1930)',
      recommendedActions: [
        'Immediately dial National Cyber Helpline 1930 and register complaint on cybercrime.gov.in.',
        'Submit written zero-liability dispute notice to home bank branch within 3 days under RBI guidelines.',
        'Preserve bank statement, SMS alerts, UPI transaction IDs, and fraudulent links/numbers.'
      ]
    },
    criminal: {
      identifiedCauses: isHi ? 'आपराधिक धमकी एवं संज्ञेय अपराध' : 'Criminal Intimidation & Cognizable Offence Complaint',
      applicableStatutes: [
        'Section 173 BNSS (Old 154 CrPC): Information in cognizable cases and mandatory e-FIR.',
        'Section 351 BNS (Old 503/506 IPC): Criminal Intimidation.',
        'Section 175(3) BNSS (Old 156(3) CrPC): Magistrate direction for investigation upon police refusal.'
      ],
      forum: 'Court of Judicial Magistrate First Class / Metropolitan Magistrate',
      limitationPeriod: '3 Years for offenses punishable up to 3 years; No limitation for serious offenses',
      interimRelief: 'Anticipatory Bail under Section 482 BNSS (Old 438 CrPC) / Police Protection',
      recommendedActions: [
        'Submit written formal complaint to Station House Officer (SHO) with postal/diary acknowledgment.',
        'If FIR is refused, submit complaint to Deputy Commissioner of Police (DCP) under Section 173(4) BNSS.',
        'File Section 175(3) BNSS petition before the Magistrate for court-directed FIR registration.'
      ]
    }
  };

  const selected = fallbacks[category] || fallbacks.property;
  return {
    success: true,
    modelUsed: 'rule-based-statutory-engine',
    ...selected
  };
}
