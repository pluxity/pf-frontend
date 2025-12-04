import type { ComponentPropsWithoutRef } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export type TooltipProviderProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>;
export type TooltipProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>;
export type TooltipTriggerProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>;
export type TooltipContentProps = ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>;
