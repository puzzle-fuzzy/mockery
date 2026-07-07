import { Elysia } from "elysia";
import type { MemberRole } from "../permissions/model";

/**
 * Test-only backdoor routes (prefixed `/_api/__test/...`).
 *
 * These exist so the integration suite can drive state that isn't exposed by
 * the public API — reading audit logs, forcing a member's role, or pinning a
 * release into a given status. Extracted out of the composition root so the
 * main `createApp` stays focused on wiring; mount it only when
 * `exposeTestRoutes` is set.
 */

interface TestRepositories {
  auditRepository: { listAuditLogsForTest(): Promise<unknown[]> };
  organizationsRepository: {
    setMemberRoleForTest(input: {
      organizationId: string;
      userId: string;
      role: MemberRole;
    }): Promise<void>;
  };
  releasesRepository: {
    setReleaseStateForTest(input: {
      releaseId: string;
      status: "uploading" | "processing" | "ready" | "active" | "failed" | "archived" | "deleted";
      archived: boolean;
    }): Promise<void>;
  };
}

export function testModule(repositories: TestRepositories) {
  return new Elysia({ name: "test-module" })
    .get("/_api/__test/auditLogs", async () => ({
      auditLogs: await repositories.auditRepository.listAuditLogsForTest(),
    }))
    .put("/_api/__test/memberRole", async ({ body }) => {
      await repositories.organizationsRepository.setMemberRoleForTest(
        body as { organizationId: string; userId: string; role: MemberRole },
      );
      return { ok: true };
    })
    .put("/_api/__test/releaseState", async ({ body }) => {
      await repositories.releasesRepository.setReleaseStateForTest(
        body as {
          releaseId: string;
          status: "uploading" | "processing" | "ready" | "active" | "failed" | "archived" | "deleted";
          archived: boolean;
        },
      );
      return { ok: true };
    });
}
