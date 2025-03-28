export interface TemplatesMessage {
  messaging_product: string;
  to: string;
  type: string;
  template: Template;
}

export interface Template {
  name: string;
  language: Language;
}

export interface Language {
  code: string;
}
