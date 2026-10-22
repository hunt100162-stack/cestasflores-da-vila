import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const demo = import.meta.glob("@/assets/*.jpg", { eager: true, import: "default" }) as Record<string, string>;
const demoByName: Record<string, string> = {};
for (const [path, url] of Object.entries(demo)) demoByName[path.split("/").pop()!.replace(".jpg", "")] = url;

export const BUCKET = "product-images";

/** Image refs are either "demo:<asset>" (bundled example photos) or a storage path in the product-images bucket. */
export function useImageUrls(refs: string[]) {
  const stored = refs.filter((r) => r && !r.startsWith("demo:"));
  const signed = useQuery({
    queryKey: ["signed", stored],
    enabled: stored.length > 0,
    staleTime: 50 * 60 * 1000,
    queryFn: async () => {
      const { data } = await supabase.storage.from(BUCKET).createSignedUrls(stored, 3600);
      const m: Record<string, string> = {};
      data?.forEach((d) => { if (d.path && d.signedUrl) m[d.path] = d.signedUrl; });
      return m;
    },
  });
  return (ref: string | undefined) => {
    if (!ref) return undefined;
    if (ref.startsWith("demo:")) return demoByName[ref.slice(5)];
    return signed.data?.[ref];
  };
}

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function validateImage(file: { type: string; size: number }): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return "Use imagens JPG, PNG ou WEBP.";
  if (file.size > MAX_IMAGE_BYTES) return "A imagem deve ter no máximo 5 MB.";
  return null;
}
