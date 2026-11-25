import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { compressImageForUpload } from "@/lib/image-compress";
import { uploadAdminMedia } from "@/lib/admin.functions";

interface PhotoUploadButtonProps {
  folder: "gallery" | "site" | "supporters";
  label?: string;
  preservePng?: boolean;
  maxWidth?: number;
  onUploaded: (url: string) => void;
  className?: string;
}

export function PhotoUploadButton({
  folder,
  label = "Choose photo from device",
  preservePng = false,
  maxWidth = 1600,
  onUploaded,
  className,
}: PhotoUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadFn = useServerFn(uploadAdminMedia);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    try {
      const compressed = await compressImageForUpload(file, {
        maxWidth,
        maxHeight: maxWidth,
        preservePng,
      });
      const res = await uploadFn({
        data: {
          base64Data: compressed.base64Data,
          contentType: compressed.contentType,
          fileName: compressed.fileName,
          folder,
        },
      });
      onUploaded(res.url);
      toast.success(`Photo uploaded (${compressed.sizeKB} KB)`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not upload that photo. Please try again.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-primary/50 bg-secondary/50 px-4 py-2.5 text-sm font-bold text-primary transition hover:border-primary hover:bg-secondary disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        <span>{busy ? "Optimising & uploading..." : label}</span>
      </button>
    </div>
  );
}
