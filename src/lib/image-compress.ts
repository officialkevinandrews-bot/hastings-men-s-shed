export interface CompressedImagePayload {
  base64Data: string;
  contentType: "image/webp" | "image/jpeg" | "image/png";
  fileName: string;
  width: number;
  height: number;
  sizeKB: number;
}

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/**
 * Automatically resizes and compresses volunteer photos in the browser before upload
 * so large camera photos load fast and stay well under Supabase's 10MB limit.
 */
export async function compressImageForUpload(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; preservePng?: boolean; quality?: number } = {},
): Promise<CompressedImagePayload> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file (JPG, PNG, or WebP).");
  }
  if (file.size > 25 * 1024 * 1024) {
    throw new Error("That file is over 25 MB. Please choose a smaller photo.");
  }

  const maxW = options.maxWidth ?? 1600;
  const maxH = options.maxHeight ?? 1600;
  const quality = options.quality ?? 0.84;

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that image file."));
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Could not open that image. Please try a JPG or PNG file."));
    el.src = dataUrl;
  });

  let targetW = img.naturalWidth || img.width;
  let targetH = img.naturalHeight || img.height;
  const ratio = Math.min(1, maxW / targetW, maxH / targetH);
  targetW = Math.max(1, Math.round(targetW * ratio));
  targetH = Math.max(1, Math.round(targetH * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser couldn't process that image.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const keepPng = Boolean(options.preservePng) && file.type === "image/png";
  const preferredMime: "image/png" | "image/webp" | "image/jpeg" = keepPng ? "image/png" : "image/jpeg";
  let outDataUrl = canvas.toDataURL(preferredMime, keepPng ? undefined : quality);
  let outMime: "image/webp" | "image/jpeg" | "image/png" = preferredMime;

  if (!outDataUrl.startsWith(`data:${preferredMime}`)) {
    outMime = ALLOWED_TYPES.has(file.type) && file.type === "image/png" ? "image/png" : "image/jpeg";
    outDataUrl = canvas.toDataURL(outMime, outMime === "image/png" ? undefined : quality);
  }

  const base64Data = outDataUrl.split(",")[1] ?? "";
  const approxBytes = Math.round((base64Data.length * 3) / 4);
  if (approxBytes > 9.5 * 1024 * 1024) {
    // Re-compress slightly tighter if somehow still huge
    outMime = "image/jpeg";
    outDataUrl = canvas.toDataURL("image/jpeg", 0.72);
  }

  const finalBase64 = outDataUrl.split(",")[1] ?? "";
  const ext = outMime === "image/png" ? "png" : "jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9-_]+/gi, "-").toLowerCase() || "photo";

  return {
    base64Data: finalBase64,
    contentType: outMime,
    fileName: `${baseName}.${ext}`,
    width: targetW,
    height: targetH,
    sizeKB: Math.max(1, Math.round((finalBase64.length * 3) / 4 / 1024)),
  };
}
