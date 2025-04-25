export interface ImageInterface {
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
  contacts: Contact[];
  messages: Message[];
}

interface Contact {
  profile: Profile;
  wa_id: string;
}

interface Profile {
  name: string;
}

interface Message {
  from: string;
  id: string;
  timestamp: string;
  type: string;
  image: Image;
}

interface Image {
  caption: string | null;
  mime_type: string;
  sha256: string;
  id: string;
}

interface Metadata {
  display_phone_number: string;
  phone_number_id: string;
}
