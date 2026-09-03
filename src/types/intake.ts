export type IntakeStepId = "brand" | "business" | "audience" | "competition" | "character";

export type IntakeFieldType = "text" | "textarea" | "choice";

export interface IntakeField {
  id: string;
  label: string;
  type: IntakeFieldType;
  placeholder?: string;
  helper?: string;
  options?: string[];
  required?: boolean;
  /** Only rendered when the referenced field currently equals this value. */
  showWhen?: { fieldId: string; equals: string };
}

export interface IntakeStep {
  id: IntakeStepId;
  number: number;
  title: string;
  description: string;
  fields: IntakeField[];
}

export type IntakeValues = Record<string, string>;
