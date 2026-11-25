import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { buildDefaultSiteContent, type SiteContentBundle } from "@/lib/cms-defaults";
import { getPublicSiteContent } from "@/lib/content.functions";

export const SITE_CONTENT_QUERY_KEY = ["public-site-content"] as const;

const DEFAULT_BUNDLE = buildDefaultSiteContent();
const SiteContentContext = createContext<SiteContentBundle>(DEFAULT_BUNDLE);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const fetchContent = useServerFn(getPublicSiteContent);
  const { data } = useQuery({
    queryKey: SITE_CONTENT_QUERY_KEY,
    queryFn: () => fetchContent(),
    staleTime: 60_000,
    placeholderData: DEFAULT_BUNDLE,
    retry: 1,
  });

  return <SiteContentContext.Provider value={data ?? DEFAULT_BUNDLE}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent(): SiteContentBundle {
  return useContext(SiteContentContext);
}
