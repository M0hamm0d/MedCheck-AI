export const SYSTEM_PROMPT = `You are a medicine information assistant. Your ONLY function is to summarize and explain medicine information that has been VERIFIED and PROVIDED to you from an official drug database.

CRITICAL RULES — you MUST follow these exactly:

1. NEVER invent, guess, or fabricate any medicine facts, uses, side effects, warnings, dosages, or storage instructions.
2. ONLY use the information explicitly provided in the drug data section below.
3. If any section's information is NOT in the provided data, write "Information unavailable" for that section. Do NOT make up content. Do NOT use general knowledge.
4. NEVER diagnose any disease, condition, or symptom.
5. NEVER recommend, prescribe, or suggest taking or stopping any medicine.
6. NEVER compare medicines or suggest one is "better" or "worse" than another.
7. NEVER provide dosage instructions beyond what is stated in the provided data.
8. NEVER use the words "safe", "unsafe", "approved", or "prescribed" in any form. These words are FORBIDDEN. Instead, use phrases like "According to the provided FDA data..." or "The drug label states..."
9. Use plain, clear language. Avoid medical jargon. Write at an 8th-grade reading level.
10. When presenting dosage information, ALWAYS attribute it explicitly: use phrases like "The product label states...", "According to the FDA data...", or "The manufacturer's instructions indicate..." Never use prescriptive language like "you should take" or "take this dose."

Your response MUST use exactly these section headings in this order:

Uses
Warnings
Side Effects
Storage
When to Contact a Healthcare Professional

After the last section, include a blank line and then the following text exactly:

This information is for educational purposes only. It does not constitute medical advice. Always consult your doctor or pharmacist before taking any medicine. Read the full patient information leaflet provided with your medicine.`

export function buildExplainPrompt(drug) {
  const fields = []

  fields.push(`Medicine name: ${drug.brandName}`)
  if (drug.genericName) fields.push(`Generic name: ${drug.genericName}`)
  if (drug.activeIngredient) fields.push(`Active ingredient: ${drug.activeIngredient}`)
  if (drug.purpose) fields.push(`Purpose/uses: ${drug.purpose}`)
  if (drug.dosage) fields.push(`Dosage instructions: ${drug.dosage}`)

  if (drug.warnings && drug.warnings.length > 0) {
    fields.push(`Warnings: ${drug.warnings.join(' | ')}`)
  }

  if (drug.sideEffects && drug.sideEffects.length > 0) {
    fields.push(`Side effects: ${drug.sideEffects.join(' | ')}`)
  }

  if (drug.storage) {
    fields.push(`Storage: ${drug.storage}`)
  }

  return `Explain the following medicine in plain language using ONLY the information provided below. If a section has no data, say "Information unavailable" — do not guess.

DRUG DATA (source: FDA via OpenFDA):
${fields.join('\n')}`
}

const SECTION_HEADINGS = [
  { key: 'uses', heading: 'Uses' },
  { key: 'warnings', heading: 'Warnings' },
  { key: 'sideEffects', heading: 'Side Effects' },
  { key: 'storage', heading: 'Storage' },
  { key: 'contactHcp', heading: 'When to Contact a Healthcare Professional' },
]

export function parseExplanation(rawText) {
  const sections = {}
  let disclaimer = ''
  let remaining = rawText.trim()

  for (let i = 0; i < SECTION_HEADINGS.length; i++) {
    const current = SECTION_HEADINGS[i]
    const next = SECTION_HEADINGS[i + 1]

    const currentIdx = remaining.indexOf(current.heading)
    if (currentIdx === -1) {
      sections[current.key] = 'Information unavailable'
      continue
    }

    const contentStart = currentIdx + current.heading.length
    let content

    if (next) {
      const nextIdx = remaining.indexOf(next.heading, contentStart)
      if (nextIdx === -1) {
        content = remaining.slice(contentStart)
      } else {
        content = remaining.slice(contentStart, nextIdx)
      }
    } else {
      content = remaining.slice(contentStart)
    }

    content = content
      .replace(/^[\s:=-]+/, '')
      .replace(/\s+$/, '')
      .trim()

    const disclaimerStart = content.indexOf('This information is for educational purposes')
    if (disclaimerStart !== -1) {
      content = content.slice(0, disclaimerStart).trim()
    }

    sections[current.key] = content || 'Information unavailable'
  }

  const disclaimerMarker = 'This information is for educational purposes only'
  const discIdx = rawText.indexOf(disclaimerMarker)
  if (discIdx !== -1) {
    disclaimer = rawText.slice(discIdx).trim()
  }

  return {
    sections,
    disclaimer,
    raw: rawText,
  }
}

export const INTERACTION_SYSTEM_PROMPT = `You are a medicine safety information assistant. Your ONLY function is to analyze potential concerns when two medicines are taken together, based SOLELY on provided drug data from an official FDA database.

CRITICAL RULES — you MUST follow these exactly:

1. NEVER invent, guess, or fabricate any interaction, concern, side effect, or safety warning.
2. ONLY use the information explicitly provided in the drug data sections below.
3. NEVER use the words "safe", "unsafe", "approved", or "prescribed" in any form. These words are FORBIDDEN.
4. Instead of saying something is "safe" or "unsafe", use phrases like "Based on available medicine information..." or "The provided data indicates..." or "According to the drug information..."
5. If there is insufficient data to assess potential concerns, say "Based on available medicine information, there is insufficient data to identify specific concerns." Do NOT make up content. Do NOT use general knowledge.
6. NEVER recommend, prescribe, or suggest taking, combining, or stopping any medicine.
7. NEVER compare medicines or suggest one is better, safer, or more effective than another. Present concerns neutrally without implying one medicine should be preferred or substituted.
8. NEVER diagnose any condition or disease.
9. ALWAYS recommend consulting a healthcare professional before combining medicines.
10. Use plain, clear language. Avoid medical jargon. Write at an 8th-grade reading level.

Your response MUST use exactly these section headings in this order. If a section has no data from the provided drug information, write "Information unavailable" for that section:

Safety Summary
Potential Concerns
Professional Advice

After the last section, include a blank line and then the following text exactly:

This information is for educational purposes only. It does not constitute medical advice. Always consult your doctor or pharmacist before combining any medicines.`

export function buildInteractionPrompt(drugA, drugB) {
  function formatDrug(label, drug) {
    const parts = []
    parts.push(`${label}: ${drug.brandName}`)
    if (drug.genericName) parts.push(`  Generic name: ${drug.genericName}`)
    if (drug.activeIngredient) parts.push(`  Active ingredient: ${drug.activeIngredient}`)
    if (drug.purpose) parts.push(`  Purpose/uses: ${drug.purpose}`)
    if (drug.dosage) parts.push(`  Dosage: ${drug.dosage}`)
    if (drug.warnings && drug.warnings.length > 0) {
      parts.push(`  Warnings: ${drug.warnings.join(' | ')}`)
    }
    if (drug.sideEffects && drug.sideEffects.length > 0) {
      parts.push(`  Side effects: ${drug.sideEffects.join(' | ')}`)
    }
    return parts.join('\n')
  }

  return `Analyze potential concerns when these two medicines are taken together. Use ONLY the provided data. If data is insufficient, say so clearly. Do NOT use "safe", "unsafe", "approved", or "prescribed" in your response.

DRUG DATA (source: FDA via OpenFDA):

${formatDrug('MEDICINE A', drugA)}

${formatDrug('MEDICINE B', drugB)}`
}

const INTERACTION_SECTION_HEADINGS = [
  { key: 'safetySummary', heading: 'Safety Summary' },
  { key: 'potentialConcerns', heading: 'Potential Concerns' },
  { key: 'professionalAdvice', heading: 'Professional Advice' },
]

export function parseInteractionResponse(rawText) {
  const sections = {}
  let disclaimer = ''
  let remaining = rawText.trim()

  for (let i = 0; i < INTERACTION_SECTION_HEADINGS.length; i++) {
    const current = INTERACTION_SECTION_HEADINGS[i]
    const next = INTERACTION_SECTION_HEADINGS[i + 1]

    const currentIdx = remaining.indexOf(current.heading)
    if (currentIdx === -1) {
      sections[current.key] = 'Information unavailable'
      continue
    }

    const contentStart = currentIdx + current.heading.length
    let content

    if (next) {
      const nextIdx = remaining.indexOf(next.heading, contentStart)
      if (nextIdx === -1) {
        content = remaining.slice(contentStart)
      } else {
        content = remaining.slice(contentStart, nextIdx)
      }
    } else {
      content = remaining.slice(contentStart)
    }

    content = content
      .replace(/^[\s:=-]+/, '')
      .replace(/\s+$/, '')
      .trim()

    const disclaimerStart = content.indexOf('This information is for educational purposes')
    if (disclaimerStart !== -1) {
      content = content.slice(0, disclaimerStart).trim()
    }

    sections[current.key] = content || 'Information unavailable'
  }

  const disclaimerMarker = 'This information is for educational purposes only'
  const discIdx = rawText.indexOf(disclaimerMarker)
  if (discIdx !== -1) {
    disclaimer = rawText.slice(discIdx).trim()
  }

  return {
    sections,
    disclaimer,
    raw: rawText,
  }
}

export const PRESCRIPTION_SYSTEM_PROMPT = `You are a prescription instruction explainer. Your ONLY function is to translate medicine prescription instructions into plain, easy-to-understand English.

CRITICAL RULES — you MUST follow these exactly:

1. ONLY explain exactly what is written. NEVER invent, guess, fabricate, or infer ANY information not explicitly present in the provided text.
2. If the text is unclear, ambiguous, does not contain specific prescription instructions (medicine name + dosage + frequency), asks a question, or seeks advice, you MUST respond with: "Unable to interpret the prescription. Please provide clearer instructions."
3. NEVER recommend, prescribe, or suggest any medicine, dosage, or treatment.
4. NEVER diagnose any condition or disease.
5. NEVER use the words "safe", "unsafe", or "approved" to describe a medicine, dosage, or treatment. Do not endorse or characterize anything as safe.
6. NEVER say a prescription is "correct" or "incorrect." Only explain what it means.
7. NEVER compare medicines or suggest one is better than another.
8. ALWAYS include that the user should follow their doctor's exact instructions.

Your response MUST include all of these section headings. If the information for a section is not present in the text, write "Information unavailable" for that section:

How Often (Frequency)
How Long (Duration)
How to Store
Warnings

After the sections, include a blank line and then:

This information is for educational purposes only. It does not constitute medical advice. Always follow your doctor's or pharmacist's exact instructions. Always consult your doctor or pharmacist if you have questions about your prescription.`

export function buildPrescriptionPrompt(text) {
  return `Translate the following prescription instructions into plain English. Explain ONLY what is written. If the text is unclear, respond with "Unable to interpret the prescription. Please provide clearer instructions."

PRESCRIPTION TEXT:
${text.trim()}`
}

const PRESCRIPTION_SECTION_HEADINGS = [
  { key: 'frequency', heading: 'How Often (Frequency)' },
  { key: 'duration', heading: 'How Long (Duration)' },
  { key: 'storage', heading: 'How to Store' },
  { key: 'warnings', heading: 'Warnings' },
]

export function parsePrescriptionResponse(rawText) {
  const sections = {}
  let disclaimer = ''
  const remaining = rawText.trim()

  if (remaining.startsWith('Unable to interpret')) {
    return {
      sections: null,
      disclaimer: '',
      uninterpretable: true,
      raw: rawText,
    }
  }

  for (let i = 0; i < PRESCRIPTION_SECTION_HEADINGS.length; i++) {
    const current = PRESCRIPTION_SECTION_HEADINGS[i]
    const next = PRESCRIPTION_SECTION_HEADINGS[i + 1]

    const currentIdx = remaining.indexOf(current.heading)
    if (currentIdx === -1) {
      continue
    }

    const contentStart = currentIdx + current.heading.length
    let content

    if (next) {
      const nextIdx = remaining.indexOf(next.heading, contentStart)
      if (nextIdx === -1) {
        content = remaining.slice(contentStart)
      } else {
        content = remaining.slice(contentStart, nextIdx)
      }
    } else {
      content = remaining.slice(contentStart)
    }

    content = content
      .replace(/^[\s:=-]+/, '')
      .replace(/\s+$/, '')
      .trim()

    const disclaimerStart = content.indexOf('Always follow your doctor')
    if (disclaimerStart !== -1) {
      content = content.slice(0, disclaimerStart).trim()
    }

    if (content) {
      sections[current.key] = content
    }
  }

  const disclaimerMarker = 'Always follow your doctor'
  const discIdx = rawText.indexOf(disclaimerMarker)
  if (discIdx !== -1) {
    disclaimer = rawText.slice(discIdx).trim()
  }

  return {
    sections,
    disclaimer,
    uninterpretable: false,
    raw: rawText,
  }
}
