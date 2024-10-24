export interface MessageFromBusiness {
  object: string;
  entry: Entry[];
}

interface Entry {
  id: string;
  changes: Change[];
}

interface Change {
  value: Value;
  field: string;
}

interface Value {
  messaging_product: string;
  metadata: Metadata;
  statuses: Status[];
}

interface Metadata {
  display_phone_number: string;
  phone_number_id: string;
}

interface Status {
  id: string;
  status: string;
  timestamp: string;
  recipient_id: string;
  conversation: Conversation;
  pricing: Pricing;
}

interface Conversation {
  id: string;
  origin: Origin;
}

interface Origin {
  type: string;
}

interface Pricing {
  billable: boolean;
  pricing_model: string;
  category: string;
}
