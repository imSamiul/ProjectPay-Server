import { v4 as uuidv4 } from 'uuid';

export function generateUUID() {
  const id = uuidv4();
  return id.toString().substring(0, 8);
}
