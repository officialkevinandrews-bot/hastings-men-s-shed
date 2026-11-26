import QRCode from "qrcode";
import type {
  FlyerFocal,
  FlyerPaperMode,
  FlyerPrintSides,
  ResolvedFlyerRenderData,
} from "@/lib/flyer-types";

// Exact ISO A5 Portrait at 300 DPI (148mm x 210mm)
export const FLYER_W = 1748;
export const FLYER_H = 2480;

const BRAND = {
  cream: "#FAF6EE",
  white: "#FFFFFF",
  teal: "#124E4A",
  tealDeep: "#0D3B38",
  blue: "#3DB7D6",
  aquaSoft: "#E5F4F7",
  gold: "#F2C92E",
  ink: "#1A2426",
  muted: "#48595C",
  border: "#D7D1C5",
};

const FONT = '"Atkinson Hyperlegible", "Segoe UI", Arial, sans-serif';
const HEAD_FONT = '"Bricolage Grotesque", "Segoe UI", Arial, sans-serif';

const imageCache = new Map<string, Promise<HTMLImageElement | null>>();

function loadImageCached(url: string): Promise<HTMLImageElement | null> {
  const clean = url.trim();
  if (!clean) return Promise.resolve(null);
  const existing = imageCache.get(clean);
  if (existing) return existing;

  const p = new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    if (/^https?:\/\//i.test(clean)) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = () => {
      imageCache.delete(clean);
      resolve(null);
    };
    img.src = clean;
  });
  imageCache.set(clean, p);
  return p;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function drawWrapped(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  lineH: number,
  align: CanvasTextAlign = "left",
  maxLines = 8,
): number {
  ctx.textAlign = align;
  const words = (text || "").split(/\s+/).filter(Boolean);
  let line = "";
  let curY = y;
  let lineCount = 0;

  for (let i = 0; i < words.length; i++) {
    const test = line ? `${line} ${words[i]}` : words[i]!;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, curY);
      line = words[i]!;
      curY += lineH;
      lineCount += 1;
      if (lineCount >= maxLines - 1) {
        // Fit remainder on final line with ellipsis if needed
        let rem = words.slice(i).join(" ");
        while (rem.length > 3 && ctx.measureText(rem).width > maxW) {
          rem = rem.slice(0, -1);
        }
        ctx.fillText(rem.trim(), x, curY);
        return curY + lineH;
      }
    } else {
      line = test;
    }
  }
  if (line) {
    ctx.fillText(line, x, curY);
    curY += lineH;
  }
  return curY;
}

function drawFitSingleLine(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxW: number,
  baseSize: number,
  minSize: number,
  fontFamily: string,
  weight = "bold",
) {
  let size = baseSize;
  ctx.font = `${weight} ${size}px ${fontFamily}`;
  while (size > minSize && ctx.measureText(text).width > maxW) {
    size -= 2;
    ctx.font = `${weight} ${size}px ${fontFamily}`;
  }
  ctx.fillText(text, x, y);
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number,
  y: number,
  w: number,
  h: number,
  focal: FlyerFocal,
) {
  if (!img || !img.naturalWidth || !img.naturalHeight) {
    ctx.fillStyle = "#E5E0D5";
    ctx.fillRect(x, y, w, h);
    return;
  }
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  const targetRatio = w / h;
  const imgRatio = iw / ih;

  let sx = 0;
  let sy = 0;
  let sw = iw;
  let sh = ih;

  if (imgRatio > targetRatio) {
    // Wider than box -> crop horizontally
    sw = ih * targetRatio;
    if (focal === "left") sx = 0;
    else if (focal === "right") sx = iw - sw;
    else sx = (iw - sw) / 2;
  } else {
    // Taller than box -> crop vertically
    sh = iw / targetRatio;
    if (focal === "top") sy = 0;
    else if (focal === "upper") sy = Math.min(ih - sh, ih * 0.1);
    else if (focal === "bottom") sy = ih - sh;
    else sy = (ih - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
}

function drawTopStripe(ctx: CanvasRenderingContext2D) {
  const stripeH = 22;
  ctx.fillStyle = BRAND.teal;
  ctx.fillRect(0, 0, FLYER_W / 3, stripeH);
  ctx.fillStyle = BRAND.blue;
  ctx.fillRect(FLYER_W / 3, 0, FLYER_W / 3, stripeH);
  ctx.fillStyle = BRAND.gold;
  ctx.fillRect((2 * FLYER_W) / 3, 0, FLYER_W / 3 + 2, stripeH);
}

function drawSubtlePaperTexture(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = BRAND.cream;
  ctx.fillRect(0, 0, FLYER_W, FLYER_H);
  ctx.fillStyle = "rgba(18, 78, 74, 0.045)";
  for (let x = 20; x < FLYER_W; x += 28) {
    for (let y = 36; y < FLYER_H; y += 28) {
      ctx.fillRect(x, y, 2, 2);
    }
  }
}

function drawRoundedPhotoCard(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  focal: FlyerFocal,
  caption: string,
) {
  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.shadowColor = "rgba(13, 59, 56, 0.22)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.clip();
  drawCoverImage(ctx, img, x, y, w, h, focal);

  if (caption.trim()) {
    const barH = 66;
    const grad = ctx.createLinearGradient(0, y + h - barH - 20, 0, y + h);
    grad.addColorStop(0, "rgba(10, 32, 30, 0)");
    grad.addColorStop(0.35, "rgba(10, 32, 30, 0.78)");
    grad.addColorStop(1, "rgba(10, 32, 30, 0.94)");
    ctx.fillStyle = grad;
    ctx.fillRect(x, y + h - barH - 20, w, barH + 20);

    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    drawFitSingleLine(ctx, caption, x + 26, y + h - 30, w - 52, 24, 17, FONT);
  }
  ctx.restore();

  ctx.save();
  roundRect(ctx, x, y, w, h, r);
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#FFFFFF";
  ctx.stroke();
  ctx.restore();
}

export async function renderFlyerFrontToCanvas(
  canvas: HTMLCanvasElement,
  data: ResolvedFlyerRenderData,
  scale = 1,
): Promise<void> {
  const { doc, logoUrl } = data;
  const f = doc.front;

  const [logoImg, mainImg, leftImg, rightImg] = await Promise.all([
    loadImageCached(logoUrl),
    loadImageCached(f.mainPhotoUrl),
    loadImageCached(f.craftLeftUrl),
    loadImageCached(f.craftRightUrl),
  ]);

  canvas.width = Math.round(FLYER_W * scale);
  canvas.height = Math.round(FLYER_H * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.save();
  ctx.scale(scale, scale);

  drawSubtlePaperTexture(ctx);
  drawTopStripe(ctx);

  const pad = 86;

  // Header row: Logo left + 2 pills right
  if (logoImg && logoImg.naturalWidth && logoImg.naturalHeight) {
    const lAspect = logoImg.naturalWidth / logoImg.naturalHeight;
    let lw = 540;
    let lh = Math.round(lw / lAspect);
    if (lh > 225) {
      lh = 225;
      lw = Math.round(lh * lAspect);
    }
    ctx.drawImage(logoImg, pad, 64, lw, lh);
  }

  const pillW = 630;
  const pillX = FLYER_W - pad - pillW;
  roundRect(ctx, pillX, 82, pillW, 64, 32);
  ctx.fillStyle = BRAND.teal;
  ctx.fill();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#FFFFFF";
  drawFitSingleLine(ctx, f.topPill1, pillX + pillW / 2, 114, pillW - 44, 26, 18, FONT);

  roundRect(ctx, pillX, 162, pillW, 60, 30);
  ctx.fillStyle = BRAND.gold;
  ctx.fill();
  ctx.fillStyle = BRAND.ink;
  drawFitSingleLine(ctx, f.topPill2, pillX + pillW / 2, 192, pillW - 44, 26, 18, FONT);

  ctx.fillStyle = BRAND.border;
  ctx.fillRect(pad, 315, FLYER_W - pad * 2, 3);

  // Hero headline
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = BRAND.teal;
  drawFitSingleLine(ctx, f.eyebrow, pad, 376, FLYER_W - pad * 2, 27, 18, FONT);

  ctx.fillStyle = BRAND.ink;
  drawFitSingleLine(ctx, f.headlineLine1, pad, 474, FLYER_W - pad * 2, 86, 52, HEAD_FONT);
  ctx.fillStyle = BRAND.teal;
  drawFitSingleLine(ctx, f.headlineLine2, pad, 568, FLYER_W - pad * 2, 86, 52, HEAD_FONT);

  ctx.fillStyle = BRAND.muted;
  ctx.font = `32px ${FONT}`;
  drawWrapped(ctx, f.intro, pad, 632, FLYER_W - pad * 2, 44, "left", 3);

  // 3-Photo Editorial Collage
  drawRoundedPhotoCard(
    ctx,
    mainImg,
    pad,
    746,
    FLYER_W - pad * 2,
    540,
    26,
    f.mainPhotoFocal,
    f.mainPhotoCaption,
  );

  const halfW = (FLYER_W - pad * 2 - 36) / 2;
  drawRoundedPhotoCard(
    ctx,
    leftImg,
    pad,
    1318,
    halfW,
    490,
    26,
    f.craftLeftFocal,
    f.craftLeftCaption,
  );
  drawRoundedPhotoCard(
    ctx,
    rightImg,
    pad + halfW + 36,
    1318,
    halfW,
    490,
    26,
    f.craftRightFocal,
    f.craftRightCaption,
  );

  // Deep Teal Mental Health & Social Isolation Panel
  const panelY = 1844;
  const panelH = 492;
  ctx.save();
  roundRect(ctx, pad, panelY, FLYER_W - pad * 2, panelH, 28);
  ctx.fillStyle = BRAND.tealDeep;
  ctx.shadowColor = "rgba(13, 59, 56, 0.25)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 10;
  ctx.fill();
  ctx.restore();

  roundRect(ctx, pad, panelY, 18, panelH, 9);
  ctx.fillStyle = BRAND.gold;
  ctx.fill();

  const px = pad + 54;
  const pw = FLYER_W - pad * 2 - 96;

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = BRAND.gold;
  drawFitSingleLine(ctx, f.wellbeingEyebrow, px, panelY + 58, pw, 26, 18, FONT);

  ctx.fillStyle = "#FFFFFF";
  drawFitSingleLine(ctx, f.wellbeingHeading, px, panelY + 120, pw, 48, 30, HEAD_FONT);

  ctx.fillStyle = "#E6F2F3";
  ctx.font = `30px ${FONT}`;
  const yAfterP1 = drawWrapped(ctx, f.wellbeingPara1, px, panelY + 178, pw, 42, "left", 3);
  drawWrapped(ctx, f.wellbeingPara2, px, yAfterP1 + 14, pw, 42, "left", 3);

  const pills = [f.pill1, f.pill2, f.pill3];
  const pGap = 24;
  const eachW = (pw - pGap * 2) / 3;
  pills.forEach((txt, idx) => {
    const bx = px + idx * (eachW + pGap);
    const by = panelY + panelH - 86;
    roundRect(ctx, bx, by, eachW, 56, 28);
    ctx.fillStyle = "rgba(255, 255, 255, 0.14)";
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(242, 201, 46, 0.55)";
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = BRAND.gold;
    drawFitSingleLine(ctx, txt, bx + eachW / 2, by + 28, eachW - 28, 25, 17, FONT);
  });

  // Front Gold Footer Bar
  ctx.fillStyle = BRAND.gold;
  ctx.fillRect(0, FLYER_H - 102, FLYER_W, 102);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = BRAND.ink;
  drawFitSingleLine(ctx, f.footerBar, FLYER_W / 2, FLYER_H - 51, FLYER_W - 80, 30, 18, FONT);

  ctx.restore();
}

export async function renderFlyerBackToCanvas(
  canvas: HTMLCanvasElement,
  data: ResolvedFlyerRenderData,
  scale = 1,
): Promise<void> {
  const { doc, schedule, joiningFee, sessionFee, addressLines, phone, email, commissionsFooter, supporters } = data;
  const b = doc.back;

  const qrTargetUrl = b.qrUrl.trim() || "https://www.hastingsmenshed.org.uk/";
  const qrDataUrl = await QRCode.toDataURL(qrTargetUrl, {
    errorCorrectionLevel: "H",
    width: 600,
    margin: 2,
    color: { dark: "#0D3B38", light: "#FFFFFF" },
  });

  const [extImg, qrImg, ...supImgs] = await Promise.all([
    loadImageCached(b.exteriorPhotoUrl),
    loadImageCached(qrDataUrl),
    ...supporters.map((s) => loadImageCached(s.logoUrl)),
  ]);

  canvas.width = Math.round(FLYER_W * scale);
  canvas.height = Math.round(FLYER_H * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.save();
  ctx.scale(scale, scale);

  drawSubtlePaperTexture(ctx);
  drawTopStripe(ctx);

  const pad = 82;

  // Top Header
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = BRAND.teal;
  drawFitSingleLine(ctx, b.eyebrow, pad, 92, FLYER_W - pad * 2, 26, 18, FONT);

  ctx.fillStyle = BRAND.ink;
  drawFitSingleLine(ctx, b.heading, pad, 170, FLYER_W - pad * 2, 68, 42, HEAD_FONT);

  ctx.fillStyle = BRAND.muted;
  ctx.font = `29px ${FONT}`;
  drawWrapped(ctx, b.intro, pad, 220, FLYER_W - pad * 2, 40, "left", 2);

  // Two-column main grid
  const colGap = 40;
  const leftW = 840;
  const rightW = FLYER_W - pad * 2 - leftW - colGap;
  const leftX = pad;
  const rightX = pad + leftW + colGap;
  const gridY = 312;

  // LEFT 1: Opening Times Card
  const hoursH = 540;
  ctx.save();
  roundRect(ctx, leftX, gridY, leftW, hoursH, 24);
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(13, 59, 56, 0.12)";
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 6;
  ctx.fill();
  ctx.restore();
  roundRect(ctx, leftX, gridY, leftW, hoursH, 24);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = BRAND.border;
  ctx.stroke();

  ctx.save();
  roundRect(ctx, leftX, gridY, leftW, 76, 24);
  ctx.clip();
  ctx.fillStyle = BRAND.teal;
  ctx.fillRect(leftX, gridY, leftW, 76);
  ctx.restore();
  ctx.fillStyle = BRAND.teal;
  ctx.fillRect(leftX, gridY + 46, leftW, 30);

  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#FFFFFF";
  drawFitSingleLine(ctx, b.hoursTitle, leftX + 34, gridY + 38, leftW - 68, 31, 22, HEAD_FONT);

  let sy = gridY + 114;
  const displaySchedule = schedule.slice(0, 7);
  for (let i = 0; i < displaySchedule.length; i++) {
    const row = displaySchedule[i]!;
    ctx.textAlign = "left";
    ctx.fillStyle = row.isOpen ? BRAND.ink : "#8C999B";
    ctx.font = `bold 27px ${FONT}`;
    ctx.fillText(row.day, leftX + 34, sy);

    ctx.fillStyle = row.isOpen ? BRAND.teal : "#8C999B";
    ctx.font = `bold 26px ${FONT}`;
    ctx.fillText(row.hours, leftX + 235, sy);

    if (row.note) {
      ctx.textAlign = "right";
      ctx.fillStyle = BRAND.muted;
      drawFitSingleLine(ctx, row.note, leftX + leftW - 32, sy, 260, 23, 17, FONT);
    }

    if (i < displaySchedule.length - 1) {
      ctx.fillStyle = "#ECE7DD";
      ctx.fillRect(leftX + 30, sy + 28, leftW - 60, 2);
    }
    sy += 62;
  }

  // LEFT 2: Fees Gold Card
  const feesY = gridY + hoursH + 26;
  const feesH = 190;
  roundRect(ctx, leftX, feesY, leftW, feesH, 24);
  ctx.fillStyle = BRAND.gold;
  ctx.fill();

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = BRAND.ink;
  drawFitSingleLine(ctx, b.feesTitle, leftX + 34, feesY + 46, leftW - 68, 28, 20, FONT);

  ctx.fillStyle = BRAND.tealDeep;
  drawFitSingleLine(ctx, joiningFee, leftX + 34, feesY + 112, 108, 54, 34, HEAD_FONT);
  ctx.fillStyle = BRAND.ink;
  ctx.font = `bold 25px ${FONT}`;
  ctx.fillText(b.joiningFeeLabel, leftX + 148, feesY + 94);
  ctx.font = `22px ${FONT}`;
  ctx.fillText(b.joiningFeeSub, leftX + 148, feesY + 124);

  ctx.fillStyle = "rgba(26, 36, 38, 0.24)";
  ctx.fillRect(leftX + 414, feesY + 60, 3, 74);

  ctx.fillStyle = BRAND.tealDeep;
  drawFitSingleLine(ctx, sessionFee, leftX + 440, feesY + 112, 76, 54, 34, HEAD_FONT);
  ctx.fillStyle = BRAND.ink;
  ctx.font = `bold 25px ${FONT}`;
  ctx.fillText(b.sessionFeeLabel, leftX + 518, feesY + 94);
  ctx.font = `21px ${FONT}`;
  ctx.fillText(b.sessionFeeSub, leftX + 518, feesY + 124);

  ctx.font = `italic 21px ${FONT}`;
  ctx.fillText(b.feesFootnote, leftX + 34, feesY + 168);

  // LEFT 3: Where to Find Us + Exterior Thumbnail
  const locY = feesY + feesH + 26;
  const locH = 318;
  roundRect(ctx, leftX, locY, leftW, locH, 24);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = BRAND.border;
  ctx.stroke();

  ctx.save();
  roundRect(ctx, leftX + 24, locY + 27, 290, 256, 16);
  ctx.clip();
  drawCoverImage(ctx, extImg, leftX + 24, locY + 27, 290, 256, b.exteriorPhotoFocal);
  ctx.restore();

  const lx = leftX + 338;
  const lwText = leftW - 362;
  ctx.fillStyle = BRAND.teal;
  ctx.font = `bold 26px ${FONT}`;
  ctx.fillText(b.locationTitle, lx, locY + 54);

  ctx.fillStyle = BRAND.ink;
  let ay = locY + 94;
  addressLines.slice(0, 3).forEach((line, idx) => {
    ctx.font = idx === 0 ? `bold 26px ${FONT}` : `24px ${FONT}`;
    drawFitSingleLine(ctx, line, lx, ay, lwText, idx === 0 ? 26 : 24, 18, FONT, idx === 0 ? "bold" : "normal");
    ay += idx === 0 ? 34 : 32;
  });

  ctx.fillStyle = BRAND.muted;
  ctx.font = `21px ${FONT}`;
  drawWrapped(ctx, b.parkingNote, lx, locY + 198, lwText, 27, "left", 4);

  // RIGHT 1: Scannable QR Code Card
  const qrCardH = 770;
  ctx.save();
  roundRect(ctx, rightX, gridY, rightW, qrCardH, 26);
  ctx.fillStyle = "#FFFFFF";
  ctx.shadowColor = "rgba(13, 59, 56, 0.16)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 8;
  ctx.fill();
  ctx.restore();
  roundRect(ctx, rightX, gridY, rightW, qrCardH, 26);
  ctx.lineWidth = 5;
  ctx.strokeStyle = BRAND.teal;
  ctx.stroke();

  roundRect(ctx, rightX + 36, gridY + 30, rightW - 72, 58, 29);
  ctx.fillStyle = BRAND.teal;
  ctx.fill();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = BRAND.gold;
  drawFitSingleLine(ctx, b.qrPillText, rightX + rightW / 2, gridY + 59, rightW - 104, 25, 17, FONT);

  if (qrImg) {
    const qrSize = 480;
    ctx.drawImage(qrImg, rightX + (rightW - qrSize) / 2, gridY + 114, qrSize, qrSize);
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = BRAND.tealDeep;
  drawFitSingleLine(ctx, b.qrDisplayUrl, rightX + rightW / 2, gridY + 648, rightW - 56, 34, 22, HEAD_FONT);

  ctx.fillStyle = BRAND.muted;
  ctx.font = `24px ${FONT}`;
  drawWrapped(ctx, b.qrHelpText, rightX + rightW / 2, gridY + 694, rightW - 70, 33, "center", 2);

  // RIGHT 2: Direct Contact Details Card
  const contactY = gridY + qrCardH + 26;
  const contactH = 296;
  roundRect(ctx, rightX, contactY, rightW, contactH, 24);
  ctx.fillStyle = BRAND.tealDeep;
  ctx.fill();

  ctx.textAlign = "left";
  ctx.fillStyle = BRAND.gold;
  drawFitSingleLine(ctx, b.contactTitle, rightX + 36, contactY + 52, rightW - 72, 26, 18, FONT);

  ctx.fillStyle = "#FFFFFF";
  drawFitSingleLine(ctx, `Tel:  ${phone}`, rightX + 36, contactY + 106, rightW - 72, 31, 22, FONT);
  ctx.font = `23px ${FONT}`;
  ctx.fillStyle = "#C7E2E5";
  ctx.fillText(b.phoneHoursNote, rightX + 36, contactY + 140);

  ctx.fillStyle = "#FFFFFF";
  drawFitSingleLine(ctx, email, rightX + 36, contactY + 198, rightW - 72, 28, 20, FONT);

  roundRect(ctx, rightX + 36, contactY + 224, rightW - 72, 50, 25);
  ctx.fillStyle = "#1877F2";
  ctx.fill();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#FFFFFF";
  drawFitSingleLine(ctx, b.facebookText, rightX + rightW / 2, contactY + 249, rightW - 104, 22, 16, FONT);

  // MIDDLE TWO-COLUMN SERVICE CARDS
  const midY = 1434;
  const midH = b.showSupporters ? 310 : 500;
  const midHalfW = (FLYER_W - pad * 2 - 36) / 2;

  roundRect(ctx, pad, midY, midHalfW, midH, 24);
  ctx.fillStyle = "#FFFFFF";
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = BRAND.teal;
  ctx.stroke();

  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = BRAND.teal;
  drawFitSingleLine(ctx, b.commissionsTitle, pad + 32, midY + 52, midHalfW - 64, 27, 19, FONT);

  ctx.fillStyle = BRAND.ink;
  ctx.font = `25px ${FONT}`;
  drawWrapped(ctx, b.commissionsBody, pad + 32, midY + 96, midHalfW - 64, 35, "left", 5);

  ctx.fillStyle = BRAND.teal;
  drawFitSingleLine(ctx, commissionsFooter, pad + 32, midY + midH - 32, midHalfW - 64, 25, 18, FONT);

  const midRightX = pad + midHalfW + 36;
  roundRect(ctx, midRightX, midY, midHalfW, midH, 24);
  ctx.fillStyle = BRAND.aquaSoft;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = BRAND.blue;
  ctx.stroke();

  ctx.fillStyle = BRAND.tealDeep;
  drawFitSingleLine(ctx, b.referralsTitle, midRightX + 32, midY + 52, midHalfW - 64, 27, 19, FONT);

  ctx.fillStyle = BRAND.ink;
  ctx.font = `25px ${FONT}`;
  drawWrapped(ctx, b.referralsBody, midRightX + 32, midY + 96, midHalfW - 64, 35, "left", 5);

  ctx.fillStyle = BRAND.tealDeep;
  drawFitSingleLine(ctx, b.referralsFooter, midRightX + 32, midY + midH - 32, midHalfW - 64, 25, 18, FONT);

  // BOTTOM SUPPORTERS 8-LOGO GRID
  if (b.showSupporters && supporters.length > 0) {
    const supY = 1776;
    const supH = 594;
    roundRect(ctx, pad, supY, FLYER_W - pad * 2, supH, 24);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = BRAND.border;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = BRAND.teal;
    drawFitSingleLine(ctx, b.supportersHeading, FLYER_W / 2, supY + 48, FLYER_W - pad * 2 - 48, 27, 18, FONT);

    const cols = 4;
    const sCardW = 354;
    const sCardH = 230;
    const sGapX = 28;
    const sGapY = 26;
    const sStartX = (FLYER_W - (cols * sCardW + (cols - 1) * sGapX)) / 2;
    const sStartY = supY + 76;

    supporters.slice(0, 8).forEach((sup, idx) => {
      const col = idx % cols;
      const row = Math.floor(idx / cols);
      const cx = sStartX + col * (sCardW + sGapX);
      const cy = sStartY + row * (sCardH + sGapY);
      const img = supImgs[idx] ?? null;

      roundRect(ctx, cx, cy, sCardW, sCardH, 16);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#E6E0D4";
      ctx.stroke();

      if (img && img.naturalWidth && img.naturalHeight) {
        const maxW = sCardW - 36;
        const maxH = 148;
        const asp = img.naturalWidth / img.naturalHeight;
        let dw = maxW;
        let dh = maxW / asp;
        if (dh > maxH) {
          dh = maxH;
          dw = maxH * asp;
        }
        ctx.drawImage(img, cx + (sCardW - dw) / 2, cy + 16 + (maxH - dh) / 2, dw, dh);
      }

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = BRAND.muted;
      drawFitSingleLine(ctx, sup.name, cx + sCardW / 2, cy + sCardH - 26, sCardW - 24, 19, 14, FONT);
    });
  }

  // Bottom dark teal charity legal strip
  ctx.fillStyle = BRAND.tealDeep;
  ctx.fillRect(0, FLYER_H - 82, FLYER_W, 82);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `bold 23px ${FONT}`;
  ctx.fillText(
    "Hastings & St Leonards Men's Shed CIO  •  Registered Charity No. 1175075  •  100% Volunteer-Run",
    FLYER_W / 2,
    FLYER_H - 41,
  );

  ctx.restore();
}

async function renderSideDataUrl(data: ResolvedFlyerRenderData, side: "front" | "back"): Promise<string> {
  const c = document.createElement("canvas");
  if (side === "front") {
    await renderFlyerFrontToCanvas(c, data, 1);
  } else {
    await renderFlyerBackToCanvas(c, data, 1);
  }
  return c.toDataURL("image/jpeg", 0.94);
}

async function renderSidePngDataUrl(data: ResolvedFlyerRenderData, side: "front" | "back"): Promise<string> {
  const c = document.createElement("canvas");
  if (side === "front") {
    await renderFlyerFrontToCanvas(c, data, 1);
  } else {
    await renderFlyerBackToCanvas(c, data, 1);
  }
  return c.toDataURL("image/png");
}

function safeFileSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "hastings-mens-shed-flyer";
}

export async function downloadFlyerPng(data: ResolvedFlyerRenderData, side: "front" | "back"): Promise<void> {
  const url = await renderSidePngDataUrl(data, side);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeFileSlug(data.doc.name)}-${side}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function downloadFlyerPdf(
  data: ResolvedFlyerRenderData,
  sides: FlyerPrintSides,
  paper: FlyerPaperMode,
): Promise<void> {
  const [{ jsPDF }, images] = await Promise.all([
    import("jspdf"),
    Promise.all((sides === "both" ? (["front", "back"] as const) : [sides]).map((s) => renderSideDataUrl(data, s))),
  ]);

  if (paper === "a5") {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5", compress: true });
    images.forEach((imgUrl, idx) => {
      if (idx > 0) pdf.addPage("a5", "portrait");
      pdf.addImage(imgUrl, "JPEG", 0, 0, 148, 210, undefined, "FAST");
    });
    pdf.save(`${safeFileSlug(data.doc.name)}-a5-${sides}.pdf`);
    return;
  }

  if (paper === "a4-2up") {
    // 2 exact A5 flyers side by side on A4 Landscape (297mm x 210mm)
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4", compress: true });
    images.forEach((imgUrl, idx) => {
      if (idx > 0) pdf.addPage("a4", "landscape");
      pdf.addImage(imgUrl, "JPEG", 0, 0, 148.5, 210, undefined, "FAST");
      pdf.addImage(imgUrl, "JPEG", 148.5, 0, 148.5, 210, undefined, "FAST");
      // Subtle centre cut guide
      pdf.setDrawColor(190, 190, 190);
      pdf.setLineWidth(0.2);
      pdf.line(148.5, 0, 148.5, 210);
    });
    pdf.save(`${safeFileSlug(data.doc.name)}-2up-a4-${sides}.pdf`);
    return;
  }

  // A4 Poster (scales A5 artwork cleanly up to full A4 Portrait 210mm x 297mm)
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  images.forEach((imgUrl, idx) => {
    if (idx > 0) pdf.addPage("a4", "portrait");
    pdf.addImage(imgUrl, "JPEG", 0, 0, 210, 297, undefined, "FAST");
  });
  pdf.save(`${safeFileSlug(data.doc.name)}-a4-poster-${sides}.pdf`);
}

export async function printFlyerDirect(
  data: ResolvedFlyerRenderData,
  sides: FlyerPrintSides,
  paper: FlyerPaperMode,
): Promise<void> {
  const pages: Array<"front" | "back"> = sides === "both" ? ["front", "back"] : [sides];
  const images = await Promise.all(pages.map((s) => renderSideDataUrl(data, s)));

  const pageCss =
    paper === "a5"
      ? "@page { size: A5 portrait; margin: 0; }"
      : paper === "a4-2up"
        ? "@page { size: A4 landscape; margin: 0; }"
        : "@page { size: A4 portrait; margin: 0; }";

  const bodyHtml = images
    .map((src) => {
      if (paper === "a4-2up") {
        return `<div class="sheet two-up"><img src="${src}" /><div class="cut"></div><img src="${src}" /></div>`;
      }
      return `<div class="sheet single"><img src="${src}" /></div>`;
    })
    .join("");

  const safeTitle = data.doc.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>${safeTitle}</title>
<style>
  ${pageCss}
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .sheet { page-break-after: always; break-after: page; overflow: hidden; }
  .sheet:last-child { page-break-after: auto; break-after: auto; }
  .sheet.single { width: 100vw; height: 100vh; }
  .sheet.single img { width: 100%; height: 100%; object-fit: contain; display: block; }
  .sheet.two-up { width: 297mm; height: 210mm; display: flex; flex-direction: row; align-items: stretch; }
  .sheet.two-up img { width: 148.5mm; height: 210mm; object-fit: fill; display: block; }
  .sheet.two-up .cut { width: 0; border-left: 0.3mm dashed #bbb; }
</style>
</head>
<body>${bodyHtml}</body>
</html>`;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument;
  const win = iframe.contentWindow;
  if (!doc || !win) {
    iframe.remove();
    throw new Error("Your browser blocked the print view. Please use Download PDF instead.");
  }

  doc.open();
  doc.write(html);
  doc.close();

  await new Promise<void>((resolve) => {
    const imgs = Array.from(doc.querySelectorAll("img"));
    let loaded = 0;
    const finish = () => {
      loaded += 1;
      if (loaded >= imgs.length) resolve();
    };
    if (imgs.length === 0) {
      resolve();
      return;
    }
    imgs.forEach((im) => {
      if (im.complete) finish();
      else {
        im.onload = finish;
        im.onerror = finish;
      }
    });
    setTimeout(resolve, 1500);
  });

  win.focus();
  win.print();
  setTimeout(() => iframe.remove(), 60_000);
}
