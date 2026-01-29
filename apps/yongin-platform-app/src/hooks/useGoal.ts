import useSWR from "swr";
import { goalService } from "@/services";

const GOAL_KEY = "/goals";

export function useGoal() {
  const { data, error, isLoading } = useSWR(GOAL_KEY, () => goalService.getAll());

  return {
    goals: data ?? [],
    isLoading,
    isError: !!error,
    error,
  };
}
