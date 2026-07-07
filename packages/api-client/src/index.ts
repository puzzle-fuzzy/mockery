import { treaty } from "@elysia/eden";
import type { App } from "@mockery/api";

export function createApiClient(baseUrl: string) {
  return treaty<App>(baseUrl);
}
