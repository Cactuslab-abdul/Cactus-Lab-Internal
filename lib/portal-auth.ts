// Maps client email addresses to their portal slug.
// Add a new line here for each new client.
export const CLIENT_EMAIL_MAP: Record<string, string> = {
  "raveena@petsdelight.com": "pets-delight",
  // "contact@crystalline.ae": "crystalline",  ← uncomment when Crystalline is ready
};

export function slugForEmail(email: string): string | null {
  return CLIENT_EMAIL_MAP[email.toLowerCase().trim()] ?? null;
}

export function isClientEmail(email: string): boolean {
  return slugForEmail(email) !== null;
}
