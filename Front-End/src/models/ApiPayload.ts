export interface ApiPayload<T = unknown> {
  data: T | null;
  error: string | null;
}
