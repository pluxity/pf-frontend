export type InputFieldProps = {
  id: string;
  label: string;
  slider?: boolean;
  value?: number;
  onChange?: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
};

export type SectionFieldProps = {
  id: string;
  title: string;
  fields: InputFieldProps[];
  values?: Record<string, number>;
  onFieldsChange?: (id: string, values: Record<string, number>) => void;
};

export type Position = {
  longitude: number;
  latitude: number;
  height: number;
};

export type Rotation = {
  heading: number;
  pitch: number;
  roll: number;
};

export type Scale = {
  scale: number;
};
