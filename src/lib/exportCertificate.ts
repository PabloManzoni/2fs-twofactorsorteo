/**
 * Builds a portable SVG certificate of the verdict so the result can be
 * downloaded or shared. Uses system-font fallbacks so the file renders even
 * on machines that don't have Fraunces / Inter / JetBrains Mono installed.
 */

export interface CertificateData {
  winner: string;
  certNumber: string;
  participants: string[];
  outNames: string[];
  date: string;
  verdictBadge: string;
  stampLabel: string;
  bodyText: string;
  coda: string;
  thisIsToCertify: string;
  sorteoLine: string;
  title: string;
  participantsLabel: string;
  isStruck: boolean;
  isChosen: boolean;
}

const W = 800;
const H = 1100;

const COLORS = {
  paper: "#F4F1EC",
  paperRule: "#D6CFC0",
  ink: "#141110",
  inkMuted: "#6B6560",
  accent: "#C8442A",
  success: "#4A6B3E",
};

const FONT_DISPLAY = "Fraunces, 'Times New Roman', Georgia, serif";
const FONT_UI = "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif";
const FONT_MONO = "'JetBrains Mono', ui-monospace, 'SF Mono', Menlo, monospace";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildCertificateSvg(d: CertificateData): string {
  const [first, ...rest] = d.winner.split(" ");
  const surname = rest.join(" ");
  const nameColor = d.isChosen ? COLORS.ink : COLORS.ink;
  const strikeAttrs = d.isStruck ? ` text-decoration="line-through" text-decoration-color="${COLORS.accent}"` : "";
  const badgeColor = d.isChosen ? COLORS.success : COLORS.accent;

  // Stamp — concentric circles + circular textPath. Mirrors src/components/ui/Stamp.tsx.
  const stampCx = W - 130;
  const stampCy = H - 200;
  const stampR = 64;

  // Participants list at the bottom — comma-separated, struck-out for outNames.
  const partLines: string[] = [];
  let lineBuf = "";
  for (let i = 0; i < d.participants.length; i++) {
    const name = d.participants[i];
    const isOut = d.outNames.includes(name);
    const piece = isOut ? `<tspan text-decoration="line-through" fill="${COLORS.inkMuted}">${escapeXml(name)}</tspan>` : escapeXml(name);
    const sep = i < d.participants.length - 1 ? " · " : "";
    if (lineBuf.length + name.length + 3 > 60) {
      partLines.push(lineBuf);
      lineBuf = "";
    }
    lineBuf += piece + sep;
  }
  if (lineBuf) partLines.push(lineBuf);

  const participantTspans = partLines
    .map((line, i) => `<tspan x="${W / 2}" dy="${i === 0 ? 0 : 20}">${line}</tspan>`)
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="${FONT_UI}">
  <rect width="${W}" height="${H}" fill="${COLORS.paper}"/>

  <!-- Corner diamonds -->
  <g fill="${COLORS.ink}">
    <rect x="42" y="42" width="10" height="10" transform="rotate(45 47 47)"/>
    <rect x="${W - 52}" y="42" width="10" height="10" transform="rotate(45 ${W - 47} 47)"/>
    <rect x="42" y="${H - 52}" width="10" height="10" transform="rotate(45 47 ${H - 47})"/>
    <rect x="${W - 52}" y="${H - 52}" width="10" height="10" transform="rotate(45 ${W - 47} ${H - 47})"/>
  </g>

  <!-- Outer rule -->
  <rect x="60" y="60" width="${W - 120}" height="${H - 120}" fill="none" stroke="${COLORS.ink}" stroke-width="1.5"/>
  <rect x="68" y="68" width="${W - 136}" height="${H - 136}" fill="none" stroke="${COLORS.ink}" stroke-width="0.5"/>

  <!-- Title -->
  <text x="${W / 2}" y="140" text-anchor="middle" font-family="${FONT_MONO}" font-size="14" font-weight="600" letter-spacing="6" fill="${COLORS.accent}">${escapeXml(d.title)}</text>

  <!-- Sorteo line -->
  <text x="${W / 2}" y="170" text-anchor="middle" font-family="${FONT_MONO}" font-size="12" letter-spacing="2" fill="${COLORS.inkMuted}">${escapeXml(d.sorteoLine)}</text>

  <!-- Flourish -->
  <line x1="180" y1="210" x2="380" y2="210" stroke="${COLORS.inkMuted}" stroke-width="1"/>
  <line x1="180" y1="214" x2="380" y2="214" stroke="${COLORS.inkMuted}" stroke-width="1"/>
  <text x="${W / 2}" y="220" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="22" fill="${COLORS.accent}">❦</text>
  <line x1="420" y1="210" x2="620" y2="210" stroke="${COLORS.inkMuted}" stroke-width="1"/>
  <line x1="420" y1="214" x2="620" y2="214" stroke="${COLORS.inkMuted}" stroke-width="1"/>

  <!-- This is to certify -->
  <text x="${W / 2}" y="280" text-anchor="middle" font-family="${FONT_DISPLAY}" font-style="italic" font-size="22" fill="${COLORS.ink}">${escapeXml(d.thisIsToCertify)}</text>

  <!-- Verdict badge -->
  <text x="${W / 2}" y="335" text-anchor="middle" font-family="${FONT_MONO}" font-size="13" font-weight="600" letter-spacing="3" fill="${badgeColor}">${escapeXml(d.verdictBadge)}</text>

  <!-- Winner first name -->
  <text x="${W / 2}" y="430" text-anchor="middle" font-family="${FONT_DISPLAY}" font-size="86" font-weight="700" letter-spacing="-2" fill="${nameColor}"${strikeAttrs}>${escapeXml(first)}</text>
  ${surname ? `<text x="${W / 2}" y="475" text-anchor="middle" font-family="${FONT_DISPLAY}" font-style="italic" font-size="32" fill="${COLORS.inkMuted}"${strikeAttrs}>${escapeXml(surname)}.</text>` : ""}

  <!-- Body text -->
  <text x="${W / 2}" y="${surname ? 560 : 530}" text-anchor="middle" font-family="${FONT_DISPLAY}" font-style="italic" font-size="22" fill="${COLORS.ink}">${escapeXml(d.bodyText)}</text>

  <!-- Coda -->
  <text x="${W / 2}" y="${surname ? 595 : 565}" text-anchor="middle" font-family="${FONT_DISPLAY}" font-style="italic" font-size="16" fill="${COLORS.inkMuted}">${escapeXml(d.coda)}</text>

  <!-- Inner separator -->
  <line x1="280" y1="${H - 340}" x2="${W - 280}" y2="${H - 340}" stroke="${COLORS.paperRule}" stroke-width="1"/>

  <!-- Participants -->
  <text x="${W / 2}" y="${H - 300}" text-anchor="middle" font-family="${FONT_MONO}" font-size="11" letter-spacing="2" fill="${COLORS.inkMuted}">${escapeXml(d.participantsLabel)}</text>
  <text text-anchor="middle" font-family="${FONT_DISPLAY}" font-style="italic" font-size="14" fill="${COLORS.ink}">
    <tspan x="${W / 2}" y="${H - 275}">${participantTspans}</tspan>
  </text>

  <!-- Date -->
  <text x="100" y="${H - 100}" font-family="${FONT_MONO}" font-size="11" letter-spacing="2" fill="${COLORS.inkMuted}">${escapeXml(d.date.toUpperCase())}</text>

  <!-- Stamp -->
  <g transform="translate(${stampCx} ${stampCy}) rotate(8)">
    <circle r="${stampR}" fill="none" stroke="${COLORS.accent}" stroke-width="1.5"/>
    <circle r="${stampR - 8}" fill="none" stroke="${COLORS.accent}" stroke-width="0.8"/>
    <circle r="${stampR - 16}" fill="none" stroke="${COLORS.accent}" stroke-width="0.5"/>
    <defs>
      <path id="stamp-path-${d.certNumber}" d="M 0,0 m -${stampR - 12},0 a ${stampR - 12},${stampR - 12} 0 1,1 ${(stampR - 12) * 2},0 a ${stampR - 12},${stampR - 12} 0 1,1 -${(stampR - 12) * 2},0"/>
    </defs>
    <text font-family="${FONT_MONO}" font-size="8" letter-spacing="2" fill="${COLORS.accent}">
      <textPath href="#stamp-path-${d.certNumber}" startOffset="0">${escapeXml(d.stampLabel)}</textPath>
    </text>
    <text text-anchor="middle" font-family="${FONT_DISPLAY}" font-style="italic" font-weight="700" font-size="14" fill="${COLORS.accent}" y="-4">Nº</text>
    <text text-anchor="middle" font-family="${FONT_MONO}" font-weight="700" font-size="16" fill="${COLORS.accent}" y="14">${escapeXml(d.certNumber)}</text>
  </g>
</svg>`;
}

function buildBlob(svg: string): Blob {
  return new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
}

function buildFilename(d: CertificateData): string {
  const safeName = d.winner.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
  return `2fs-oraculo-${d.certNumber}-${safeName || "veredicto"}.svg`;
}

/** Triggers a download of the certificate SVG. */
export function downloadCertificate(d: CertificateData): void {
  const svg = buildCertificateSvg(d);
  const blob = buildBlob(svg);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = buildFilename(d);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Native share if the browser supports it with files (mobile/PWA), otherwise
 * fall back to download. Returns the strategy used so the caller can update UI.
 */
export async function shareCertificate(
  d: CertificateData,
  shareTitle: string,
  shareText: string,
): Promise<"shared" | "downloaded"> {
  const svg = buildCertificateSvg(d);
  const blob = buildBlob(svg);
  const filename = buildFilename(d);
  const file = new File([blob], filename, { type: "image/svg+xml" });

  // Some browsers expose navigator.share without canShare, or canShare without files. Probe both.
  const nav = navigator as Navigator & { canShare?: (data?: ShareData) => boolean };
  if (typeof nav.share === "function" && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: shareTitle, text: shareText });
      return "shared";
    } catch {
      // User cancelled or browser rejected — fall through to download.
    }
  }
  downloadCertificate(d);
  return "downloaded";
}
