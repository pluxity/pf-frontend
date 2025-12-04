import type { ComponentPropsWithoutRef, ComponentRef, Ref } from "react";
import type * as AvatarPrimitive from "@radix-ui/react-avatar";
import type { VariantProps } from "class-variance-authority";
import type { avatarVariants } from "./variants";

export interface AvatarProps
  extends ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    VariantProps<typeof avatarVariants> {
  ref?: Ref<ComponentRef<typeof AvatarPrimitive.Root>>;
}

export interface AvatarImageProps extends ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> {
  ref?: Ref<ComponentRef<typeof AvatarPrimitive.Image>>;
}

export interface AvatarFallbackProps extends ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  ref?: Ref<ComponentRef<typeof AvatarPrimitive.Fallback>>;
}
