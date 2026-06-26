import { randomBytes, createHash } from 'node:crypto';
import { ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { apiKeys, getDb, memberships, organizations, users, withoutOrg } from '@varys/db';
import { and, eq, isNull } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { CONFIG, type AppConfig } from '../config';
import type { Principal } from './principal';

export interface AuthTokens {
  accessToken: string;
  orgId: string;
  userId: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    @Inject(CONFIG) private readonly config: AppConfig,
  ) {}

  /** Register a new organization with an owner user. */
  async register(email: string, password: string, orgName: string): Promise<AuthTokens> {
    const db = getDb();
    return withoutOrg(async (tx) => {
      const existing = await tx.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
      if (existing.length) throw new ConflictException('Email already registered');

      const [org] = await tx
        .insert(organizations)
        .values({ name: orgName, slug: slugify(orgName) })
        .returning({ id: organizations.id });
      const passwordHash = await bcrypt.hash(password, 10);
      const [user] = await tx.insert(users).values({ email, passwordHash }).returning({ id: users.id });
      await tx.insert(memberships).values({ orgId: org.id, userId: user.id, role: 'OWNER' });

      return this.issue(user.id, org.id, 'OWNER');
    }, db);
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const db = getDb();
    return withoutOrg(async (tx) => {
      const [user] = await tx.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const [membership] = await tx
        .select()
        .from(memberships)
        .where(eq(memberships.userId, user.id))
        .limit(1);
      if (!membership) throw new UnauthorizedException('No organization membership');
      return this.issue(user.id, membership.orgId, membership.role);
    }, db);
  }

  /** Verify a JWT and return the principal. */
  verifyJwt(token: string): Principal {
    try {
      const payload = this.jwt.verify<{ sub: string; org: string; role: string }>(token, {
        secret: this.config.JWT_SECRET,
      });
      return { actorId: payload.sub, orgId: payload.org, role: payload.role, type: 'user' };
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /** Resolve an API key (`prefix.secret`) to a principal. */
  async verifyApiKey(raw: string): Promise<Principal> {
    const [prefix, secret] = raw.split('.');
    if (!prefix || !secret) throw new UnauthorizedException('Malformed API key');
    const db = getDb();
    const hashed = createHash('sha256').update(raw).digest('hex');
    return withoutOrg(async (tx) => {
      const [key] = await tx
        .select()
        .from(apiKeys)
        .where(and(eq(apiKeys.prefix, prefix), isNull(apiKeys.revokedAt)))
        .limit(1);
      if (!key || key.hashedKey !== hashed) throw new UnauthorizedException('Invalid API key');
      await tx.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, key.id));
      return { actorId: key.id, orgId: key.orgId, role: 'DEVELOPER', type: 'api_key' };
    }, db);
  }

  /** Mint a new API key for an org; returns the one-time raw key. */
  async createApiKey(orgId: string, name: string, createdBy: string): Promise<{ id: string; rawKey: string }> {
    const prefix = randomBytes(6).toString('hex');
    const secret = randomBytes(24).toString('hex');
    const rawKey = `${prefix}.${secret}`;
    const hashedKey = createHash('sha256').update(rawKey).digest('hex');
    const db = getDb();
    const [row] = await withoutOrg(
      (tx) => tx.insert(apiKeys).values({ orgId, name, prefix, hashedKey, createdBy }).returning({ id: apiKeys.id }),
      db,
    );
    return { id: row.id, rawKey };
  }

  private issue(userId: string, orgId: string, role: string): AuthTokens {
    const accessToken = this.jwt.sign(
      { sub: userId, org: orgId, role },
      { secret: this.config.JWT_SECRET, expiresIn: this.config.JWT_ACCESS_TTL },
    );
    return { accessToken, orgId, userId };
  }
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 100) || `org-${randomBytes(4).toString('hex')}`
  );
}
