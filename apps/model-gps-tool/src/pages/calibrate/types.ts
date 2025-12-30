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
};

export type Scale = {
  scale: number;
};

export type BoundingBoxInfo = {
  south: number;
  east: number;
  north: number;
  west: number;
};

export type GLTFJson = {
  scenes?: Array<{ nodes?: number[] }>;
  nodes?: Array<{
    mesh?: number;
    children?: number[];
    scale?: number[];
  }>;
  meshes?: Array<{ primitives?: Array<{ attributes: { POSITION?: number } }> }>;
  accessors?: Array<{ min?: number[]; max?: number[] }>;
};
