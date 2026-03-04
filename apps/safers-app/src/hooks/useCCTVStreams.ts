import { useEffect, useState } from "react";
import { cctvService, type SafersCCTV } from "@/services";

export interface CCTVStreamItem {
  /** 스트림 이름 */
  streamName: string;
  /** 표시 이름 */
  displayName: string;
  /** 소속 현장 ID */
  siteId: number;
  /** 소속 현장 이름 */
  siteName: string;
  /** WHEP 스트림 URL (현장 포트 매핑 적용됨) */
  whepUrl: string;
  /** 원본 데이터 */
  cctv: SafersCCTV;
}

export function useCCTVStreams(siteId?: number) {
  const [items, setItems] = useState<CCTVStreamItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchCCTVs() {
      try {
        setIsLoading(true);
        const cctvs = await cctvService.getCCTVs(siteId);

        if (!cancelled) {
          setItems(
            cctvs.map((c) => ({
              streamName: c.streamName,
              displayName: c.name,
              siteId: c.site.id,
              siteName: c.site.name,
              whepUrl: cctvService.getWHEPUrl(c.streamName, c.site.id),
              cctv: c,
            }))
          );
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchCCTVs();
    return () => {
      cancelled = true;
    };
  }, [siteId]);

  return {
    items,
    isLoading,
    isError: !!error,
    error,
  };
}
