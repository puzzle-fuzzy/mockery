import { cors } from "@elysiajs/cors";
import { Elysia } from "elysia";
import { config } from "@mockery/config";
import {
  createProjectSitePath,
  createStoragePaths,
  ensureReleaseArtifactReady,
  switchCurrentReleaseLink,
} from "@mockery/storage";
import { authModule, hashRefreshToken } from "./modules/auth";
import { EmailService } from "./modules/email/service";
import { membersModule } from "./modules/members";
import { invitationsModule } from "./modules/invitations";
import { deploymentsModule } from "./modules/deployments";
import { organizationsModule } from "./modules/organizations";
import { projectDetailsModule, projectsModule } from "./modules/projects";
import { releasesModule } from "./modules/releases";
import { uploadDetailsModule, uploadsModule } from "./modules/uploads";
import { sitePreviewModule } from "./modules/site-preview";
import { testModule } from "./modules/test";
import { getDb } from "./db/client";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import { createDrizzleAuthRepository } from "./modules/auth/drizzle-repository";
import { createDrizzleAuditRepository } from "./modules/audit/drizzle-repository";
import { createDrizzleOrganizationsRepository } from "./modules/organizations/drizzle-repository";
import { createDrizzleProjectsRepository } from "./modules/projects/drizzle-repository";
import { createDrizzleReleasesRepository } from "./modules/releases/drizzle-repository";
import { createDrizzleUploadsRepository } from "./modules/uploads/drizzle-repository";
import { createDrizzleSitePreviewRepository } from "./modules/site-preview/drizzle-repository";
import { createDrizzleDeploymentsRepository } from "./modules/deployments/drizzle-repository";
import { createDrizzleReleaseProcessingRepository } from "./modules/release-processing/drizzle-repository";
import { createDrizzleMembersRepository } from "./modules/members/drizzle-repository";
import { createDrizzleInvitationsRepository } from "./modules/invitations/drizzle-repository";

export interface CreateAppOptions {
  storageRoot?: string;
  exposeTestRoutes?: boolean;
  db?: NodePgDatabase<any>;
}

export function createApp(options: CreateAppOptions = {}) {
  const db = options.db ?? getDb();
  const storagePaths = createStoragePaths(options.storageRoot ?? config.storageRoot);

  const api = new Elysia()
    .use(cors({
      origin: /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      maxAge: 86400,
    }))
    .get("/_health", () => ({
      status: "ok",
      service: "mockery-api",
    }));

  const deploymentStorage = {
    createProjectSitePath: (projectSlug: string) => createProjectSitePath(storagePaths, projectSlug),
    ensureReleaseArtifactReady,
    switchCurrentReleaseLink,
  };

  const authRepository = createDrizzleAuthRepository(db);
  const auditRepository = createDrizzleAuditRepository(db);
  const organizationsRepository = createDrizzleOrganizationsRepository(db);
  const projectsRepository = createDrizzleProjectsRepository(db);
  const releasesRepository = createDrizzleReleasesRepository(db);
  const uploadsRepository = createDrizzleUploadsRepository(db);
  const sitePreviewRepository = createDrizzleSitePreviewRepository(db);
  const deploymentsRepository = createDrizzleDeploymentsRepository(db);
  const releaseProcessingRepository = createDrizzleReleaseProcessingRepository(db);
  const membersRepositoryForModule = createDrizzleMembersRepository(db);
  const invitationsRepository = createDrizzleInvitationsRepository(db);
  const emailService = new EmailService({ appBaseUrl: config.appUrl });

  const sessionRepository = authRepository;
  const membersRepository = organizationsRepository;

  if (options.exposeTestRoutes) {
    api.use(testModule({
      auditRepository,
      organizationsRepository,
      releasesRepository,
    }));
  }

  return api
    .use(authModule({ authRepository, auditRepository }))
    .use(organizationsModule({ organizationsRepository, sessionRepository, hashRefreshToken }))
    .use(projectsModule({ sessionRepository, membersRepository, projectsRepository, hashRefreshToken }))
    .use(projectDetailsModule({ sessionRepository, membersRepository, projectsRepository, hashRefreshToken }))
    .use(releasesModule({ sessionRepository, projectsRepository, membersRepository, releasesRepository, hashRefreshToken }))
    .use(deploymentsModule({
      sessionRepository, projectsRepository, membersRepository, releasesRepository,
      deploymentsRepository, auditRepository, hashRefreshToken, storage: deploymentStorage,
    }))
    .use(uploadsModule({
      sessionRepository, projectsRepository, membersRepository, uploadsRepository,
      hashRefreshToken, storagePaths,
    }))
    .use(uploadDetailsModule({
      sessionRepository, projectsRepository, membersRepository, uploadsRepository,
      releaseProcessingRepository, hashRefreshToken, storagePaths,
    }))
    .use(sitePreviewModule({ repository: sitePreviewRepository }))
    .use(membersModule({
      sessionRepository,
      membersRepository: membersRepositoryForModule,
      organizationsRepository,
      hashRefreshToken,
    }))
    .use(invitationsModule({
      sessionRepository,
      authRepository,
      organizationsRepository,
      invitationsRepository,
      emailService,
      invitationBaseUrl: config.appUrl,
      hashRefreshToken,
      hashToken: (token: string) => hashRefreshToken(token),
      randomToken: () => crypto.randomUUID(),
    }));
}

export const app = createApp();

export type App = typeof app;

if (import.meta.main) {
  app.listen(config.apiPort);
  console.log(`Mockery API listening on http://localhost:${config.apiPort}`);
}
