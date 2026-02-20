export interface CarouselCardProps {
  children: React.ReactNode;
  className?: string;
}

export interface CarouselCardHeaderProps {
  className?: string;
  title?: string;
  titleClassName?: string;
  onPrev?: () => void;
  prevClassName?: string;
  onNext?: () => void;
  nextClassName?: string;
  showArrows?: boolean;
}

export interface CarouselCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface CarouselInfoProps {
  children: React.ReactNode;
  className?: string;
}

export interface CarouselInfoImageProps {
  src: string;
  alt?: string;
  className?: string;
}

export interface CarouselInfoTagProps {
  children: React.ReactNode;
  className?: string;
}

export interface CarouselInfoTitleProps {
  children: React.ReactNode;
  className?: string;
}

export interface CarouselInfoDescriptionProps {
  children: React.ReactNode;
  className?: string;
}
