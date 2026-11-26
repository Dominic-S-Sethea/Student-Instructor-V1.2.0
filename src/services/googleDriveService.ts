import type { ComprehensiveUniversityProfile } from '../types';

export interface ExportedDossierFile {
  name: string;
  mimeType: string;
  content: string;
  sizeBytes: number;
  createdTime: string;
}

/**
 * Cloud Google Drive OAuth via Firebase has been retired so the bundle stays
 * lightweight and free of third-party SDK credentials. Dossiers export locally
 * as portable Markdown files ready to upload to any storage provider.
 */
export function isGoogleDriveConfigured(): boolean {
  return false;
}

export function buildUniversityDossierMarkdown(university: ComprehensiveUniversityProfile): string {
  const safeName = university.name || 'University';
  const safeKhmer = university.khmerName || university.abbr || '';
  const generatedDate = new Date().toISOString().slice(0, 10);
  const annualTuition =
    typeof university.annualTuitionUSD === 'number'
      ? `$${university.annualTuitionUSD.toLocaleString()} USD`
      : 'Not specified';
  const totalCost =
    typeof university.totalDegreeCostUSD === 'number'
      ? `$${university.totalDegreeCostUSD.toLocaleString()} USD`
      : 'Not specified';

  const topMajors = Array.isArray(university.majors)
    ? university.majors
        .slice(0, 12)
        .map((m) => `- **${m.name}** (${m.degreeType || 'Degree'})`)
        .join('\n')
    : '';

  return [
    `# ${safeName}${safeKhmer ? ` (${safeKhmer})` : ''}`,
    '',
    '## Comprehensive University Data Infrastructure Dossier',
    `Audited for Cambodia Higher Education Explorer • Generated ${generatedDate}`,
    '',
    `- **Type:** ${university.type || 'Not specified'} | **Founded:** ${university.foundedYear || 'Not specified'} | **Location:** ${university.location || 'Not specified'}`,
    `- **Annual Tuition:** ${annualTuition} | **Estimated 4-Year Tuition:** ${totalCost}`,
    `- **Website:** ${university.website || 'Not specified'}`,
    '',
    university.campusDescription ? `### Overview\n${university.campusDescription}\n` : '',
    topMajors ? `### Featured Academic Programs\n${topMajors}\n` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

export function buildDossierFileName(university: ComprehensiveUniversityProfile): string {
  const slug = (university.abbr || university.name || 'university')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return `${slug || 'university'}_University_Dossier.md`;
}

export function downloadUniversityDossier(university: ComprehensiveUniversityProfile): ExportedDossierFile {
  const name = buildDossierFileName(university);
  const content = buildUniversityDossierMarkdown(university);
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = name;
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
  return {
    name,
    mimeType: 'text/markdown',
    content,
    sizeBytes: blob.size,
    createdTime: new Date().toISOString(),
  };
}

export async function copyUniversityDossier(university: ComprehensiveUniversityProfile): Promise<ExportedDossierFile> {
  const name = buildDossierFileName(university);
  const content = buildUniversityDossierMarkdown(university);
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(content);
  } else {
    throw new Error('Clipboard access is not available in this browser context.');
  }
  return {
    name,
    mimeType: 'text/markdown',
    content,
    sizeBytes: new TextEncoder().encode(content).byteLength,
    createdTime: new Date().toISOString(),
  };
}
