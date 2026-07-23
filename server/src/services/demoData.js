const medicines = [
  {
    id: 'demo-paracetamol',
    brandName: 'Paracetamol',
    genericName: 'Acetaminophen',
    manufacturer: 'Johnson & Johnson',
    purpose: 'Pain reliever and fever reducer. Used for headaches, muscle aches, toothaches, and reducing fever.',
    dosage: 'Adults: 500mg to 1000mg every 4-6 hours as needed. Do not exceed 4000mg in 24 hours. Take with a full glass of water.',
    sideEffects: ['Nausea', 'Stomach pain', 'Loss of appetite', 'Headache'],
    warnings: [
      'Do not exceed the recommended dose — overdose can cause severe liver damage',
      'Avoid alcohol while taking this medicine',
      'Check other medicines for paracetamol to avoid double dosing',
      'Do not take for more than 10 days for pain or 3 days for fever unless directed by a doctor',
    ],
    activeIngredient: 'Paracetamol 500mg',
    storage: 'Store at room temperature away from moisture and heat.',
    source: 'Demo Mode (Mock Data)',
  },
  {
    id: 'demo-ibuprofen',
    brandName: 'Ibuprofen',
    genericName: 'Ibuprofen',
    manufacturer: 'Pfizer',
    purpose: 'Nonsteroidal anti-inflammatory drug (NSAID) used to reduce fever and treat pain or inflammation caused by headaches, toothaches, arthritis, menstrual cramps, and minor injuries.',
    dosage: 'Adults: 200mg to 400mg every 4-6 hours as needed. Do not exceed 1200mg in 24 hours without doctor approval. Take with food or milk to reduce stomach irritation.',
    sideEffects: ['Stomach pain', 'Heartburn', 'Nausea', 'Diarrhea', 'Dizziness'],
    warnings: [
      'May increase risk of heart attack, stroke, and stomach bleeding',
      'Do not use if you have had an allergic reaction to aspirin or other NSAIDs',
      'Avoid alcohol while taking this medicine',
      'Do not take during the last 3 months of pregnancy',
      'Long-term use requires medical supervision',
    ],
    activeIngredient: 'Ibuprofen 200mg',
    storage: 'Store at room temperature away from moisture and heat. Keep the bottle tightly closed.',
    source: 'Demo Mode (Mock Data)',
  },
  {
    id: 'demo-amoxicillin',
    brandName: 'Amoxicillin',
    genericName: 'Amoxicillin',
    manufacturer: 'GlaxoSmithKline',
    purpose: 'A penicillin antibiotic that fights bacteria. Used to treat many different types of bacterial infections such as ear infections, throat infections, pneumonia, and urinary tract infections.',
    dosage: 'Adults: 250mg to 500mg three times daily, or 500mg to 875mg twice daily, depending on the infection. Complete the full course even if you feel better.',
    sideEffects: ['Diarrhea', 'Nausea', 'Vomiting', 'Skin rash', 'Yeast infections'],
    warnings: [
      'Do not use if you are allergic to penicillin or cephalosporin antibiotics',
      'Severe allergic reactions can be life-threatening — seek emergency help if you have trouble breathing or swelling',
      'May reduce effectiveness of birth control pills',
      'Complete the full prescribed course — do not stop early even if symptoms improve',
    ],
    activeIngredient: 'Amoxicillin 500mg',
    storage: 'Store at room temperature. Liquid suspension should be refrigerated and shaken well before each use. Discard unused liquid after 14 days.',
    source: 'Demo Mode (Mock Data)',
  },
]

export function searchMockMedicines(query) {
  const term = query.toLowerCase().trim()
  if (!term) return []

  return medicines.filter(
    (m) =>
      m.brandName.toLowerCase().includes(term) ||
      m.genericName.toLowerCase().includes(term) ||
      m.purpose.toLowerCase().includes(term),
  )
}

export function getMockExplanation(drug) {
  const name = drug.brandName || drug.genericName || 'this medicine'
  const purposeText = drug.purpose || 'Information unavailable'
  const activeIngredient = drug.activeIngredient || ''

  const warningsList = drug.warnings && drug.warnings.length > 0
    ? drug.warnings.map((w) => `- ${w}`).join('\n')
    : 'Information unavailable'

  const sideEffectsList = drug.sideEffects && drug.sideEffects.length > 0
    ? drug.sideEffects.map((s) => `- ${s}`).join('\n')
    : 'Information unavailable'

  const storageText = drug.storage || 'Information unavailable'

  return `Uses
According to the provided data, ${name}${activeIngredient ? ` (${activeIngredient})` : ''} is labeled for: ${purposeText}.

Warnings
${warningsList}

Side Effects
${sideEffectsList}

Storage
${storageText}

When to Contact a Healthcare Professional
Information unavailable

This information is for educational purposes only. It does not constitute medical advice. Always consult your doctor or pharmacist before taking any medicine. Read the full patient information leaflet provided with your medicine.`
}

export function getMockInteraction(drugA, drugB) {
  const nameA = drugA?.brandName || 'Medicine A'
  const nameB = drugB?.brandName || 'Medicine B'
  const purposeA = drugA?.purpose || 'the uses described in its label'
  const purposeB = drugB?.purpose || 'the uses described in its label'

  return `Safety Summary
Based on the provided data, ${nameA} is labeled for: ${purposeA}. ${nameB} is labeled for: ${purposeB}.

Potential Concerns
Based on available medicine information, there is insufficient data in the provided drug labels to identify specific interactions between ${nameA} and ${nameB}.

Professional Advice
Consult your doctor or pharmacist before combining ${nameA} and ${nameB}. Your healthcare provider can review your full medication list and medical history to assess any potential concerns.

This information is for educational purposes only. It does not constitute medical advice. Always consult your doctor or pharmacist before combining any medicines.`
}

const prescriptionExplanations = {
  '1 tab BID PC x 7d':
    `How Often (Frequency)
Take one tablet twice daily — once after breakfast and once after dinner.

How Long (Duration)
Take for 7 days. Complete the full course even if you feel better.

How to Store
Information not provided in the prescription. Store medicines at room temperature unless otherwise directed.

Warnings
Do not skip doses. If you miss a dose, take it as soon as you remember unless it is almost time for your next dose.

Always follow your doctor's or pharmacist's exact instructions. This explanation is for educational purposes only and does not replace professional medical guidance.`,

  'Amoxicillin 500mg, 1 tablet, Three times daily, 7 days':
    `How Often (Frequency)
Take one 500mg tablet of Amoxicillin three times daily — morning, afternoon, and evening. Spread the doses evenly throughout your waking hours, approximately every 8 hours.

How Long (Duration)
Take for 7 days. It is very important to complete the full course of antibiotics even if you start feeling better before the 7 days are over. Stopping early may cause the infection to return.

How to Store
Information not provided in the prescription. Amoxicillin tablets should be stored at room temperature. Liquid amoxicillin must be refrigerated.

Warnings
Do not take Amoxicillin if you are allergic to penicillin. Complete the full prescribed course. If you experience a rash, difficulty breathing, or swelling, seek emergency medical attention immediately.

Always follow your doctor's or pharmacist's exact instructions. This explanation is for educational purposes only and does not replace professional medical guidance.`,

  'Take one tablet twice daily after meals for 10 days':
    `How Often (Frequency)
Take one tablet twice each day — once after breakfast and once after dinner. Taking it after meals helps reduce the chance of stomach upset.

How Long (Duration)
Take for 10 days. Complete the full course as directed.

How to Store
Information not provided in the prescription. Store at room temperature away from moisture.

Warnings
Take with food to reduce stomach irritation. Do not stop taking early without consulting your doctor.

Always follow your doctor's or pharmacist's exact instructions. This explanation is for educational purposes only and does not replace professional medical guidance.`,
}

export function getMockPrescription(text) {
  const trimmed = text.trim()

  for (const [key, response] of Object.entries(prescriptionExplanations)) {
    if (trimmed.toLowerCase() === key.toLowerCase()) {
      return response
    }
  }

  return 'Unable to interpret the prescription. Please provide clearer instructions including the medicine name, dosage, frequency, and duration.'
}
