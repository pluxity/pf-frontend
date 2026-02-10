import { useEffect, useRef, useState } from "react";
import { cctvService, type CCTVPath } from "@/services";

export function useCCTVStreams() {
  const [paths, setPaths] = useState<CCTVPath[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchPaths = async () => {
      try {
        setIsLoading(true);
        const response = await cctvService.getPaths();
        setPaths(response.items);
        setItemCount(response.itemCount);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setPaths([]);
        setItemCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaths();
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
