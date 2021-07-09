type Protocol = "http" | "https";

export function isProtocol(input: any): input is Protocol {
  return /^https?/.test(input);
}
