import { useEffect, useState } from "react";
import { cctvService, type CCTVPath } from "@/services";

export function useCCTVStreams() {
  const [paths, setPaths] = useState<CCTVPath[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchPaths = async () => {
      try {
        setIsLoading(true);
        const response = await cctvService.getPaths();

        // cancelled 플래그를 체크하여 컴포넌트가 언마운트되었거나
        // effect가 재실행되었을 때 state 업데이트를 방지
        if (!cancelled) {
          setPaths(response.items);
          setItemCount(response.itemCount);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
          setPaths([]);
          setItemCount(0);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchPaths();

    // cleanup 함수: 컴포넌트 언마운트 시 또는 effect 재실행 시 호출
    return () => {
      cancelled = true;
    };
  }, []);

  return {
    paths,
    itemCount,
    isLoading,
    isError: !!error,
    error,
    getHLSUrl: cctvService.getHLSUrl,
    getWHEPUrl: cctvService.getWHEPUrl,
  };
}
