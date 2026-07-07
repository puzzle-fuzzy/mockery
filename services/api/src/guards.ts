import type { AuthRepository } from "./modules/auth/service";

/**
 * Shared authentication + authorization helpers.
 *
 * Historically (zipship v1) every protected service duplicated two pieces of
 * boilerplate: a module-level `parseBearerToken` function and a private
 * `findSession`/`requireCurrentUser` method. This module centralizes them so
 * services only express *what* they need (a session, a membership, a
 * permission) instead of re-implementing the bearer-parsing dance.
 *
 * Services stay pure: they receive `sessionRepository`/`hashRefreshToken`/
 * `now` via their constructor options and pass them through here. Their public
 * method signatures and the `Result | ServiceError` return convention are
 * unchanged.
 */

/** Parse an `Authorization: Bearer <token>` header. Returns null when absent/malformed. */
export function parseBearerToken(authorization: string | undefined): string | null {
  if (!authorization) return null;
  const [scheme, token] = authorization.split(" ");
  if (!scheme || scheme.toLowerCase() !== "bearer" || !token) return null;
  return token;
}

/** The minimal shape a service needs to resolve a session from headers. */
export interface SessionResolver {
  sessionRepository: Pick<AuthRepository, "findSessionByRefreshTokenHash">;
  hashRefreshToken: (token: string) => Promise<string>;
  now: () => Date;
}

/**
 * Resolve the current session from request headers, or return null when the
 * header is missing, malformed, or refers to an invalid/expired/revoked session.
 */
export async function resolveSession(
  deps: SessionResolver,
  headers: { authorization?: string },
) {
  const token = parseBearerToken(headers.authorization);
  if (!token) return null;
  return deps.sessionRepository.findSessionByRefreshTokenHash(
    await deps.hashRefreshToken(token),
    deps.now(),
  );
}
