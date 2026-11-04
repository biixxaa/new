import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const { Pool } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

let pool = null;
let isPostgres = false;

// Embedded fallback store in case PostgreSQL is unreachable or credentials unset
const embeddedStore = {
  users: [],
  otp_verifications: [],
  membership_applications: [],
  membership_types: [
    {
      id: 1,
      name: 'Novitiate (Classis I)',
      tier_level: 1,
      description: 'The first awakening. Verification of vessel and initial reception of sacred scrolls.',
      requirements: 'Phone OTP verification and solemn oath',
    },
    {
      id: 2,
      name: 'Illuminatus Minor (Classis II)',
      tier_level: 2,
      description: 'Access to regional conclaves, strategic economic alliances, and philosophical archives.',
      requirements: 'Active novitiate status and council nomination',
    },
    {
      id: 3,
      name: 'Illuminatus Major (Classis III)',
      tier_level: 3,
      description: 'Executive stewardship, voting on global charters, and sovereign network access.',
      requirements: 'Grand Conclave tribunal deliberation',
    },
    {
      id: 4,
      name: 'Rex Summus (Inner Sanctum)',
      tier_level: 4,
      description: 'The apex circle. Reserved for supreme architects of civilization by unanimous invitation.',
      requirements: 'Supreme council decree',
    },
  ],
  admin_users: [],
  sessions: [],
  audit_logs: [],
  nextIds: {
    users: 2,
    otp_verifications: 1,
    membership_applications: 1,
    membership_types: 5,
    admin_users: 2,
    sessions: 1,
    audit_logs: 1,
  },
};

// Seed embedded admin
async function seedEmbeddedAdmin() {
  const hash = await bcrypt.hash('SanctumSecret2026!', 10);
  const adminUser = {
    id: 1,
    full_name: 'Grand Master Scribe',
    phone_number: '+251900000000',
    carrier: 'Ethio Telecom',
    password_hash: hash,
    role: 'ADMIN',
    status: 'ACTIVE',
    is_phone_verified: true,
    membership_type_id: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  embeddedStore.users.push(adminUser);
  embeddedStore.admin_users.push({
    id: 1,
    user_id: 1,
    permissions: ['MANAGE_USERS', 'MANAGE_APPLICATIONS', 'VIEW_STATS', 'SYSTEM_SETTINGS'],
    created_at: new Date().toISOString(),
  });
}

export async function initDb() {
  const connectionString =
    process.env.DATABASE_URL ||
    (process.env.PGPASSWORD
      ? `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD}@${process.env.PGHOST || 'localhost'}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE || 'illuminati_db'}`
      : null);

  if (connectionString) {
    try {
      pool = new Pool({
        connectionString,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 3000,
      });

      const client = await pool.connect();
      console.log('🏛️  [Database] Successfully connected to PostgreSQL Server.');

      const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
      await client.query(schemaSql);

      const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
      await client.query(seedSql);

      client.release();
      isPostgres = true;
      return;
    } catch (err) {
      console.warn('⚠️  [Database] PostgreSQL connection not established:', err.message);
      console.log('🔄  [Database] Activating Resilient High-Performance Embedded Store Mode.');
      isPostgres = false;
    }
  } else {
    console.log('ℹ️  [Database] DATABASE_URL not set. Running in Embedded Relational Mode.');
    isPostgres = false;
  }

  await seedEmbeddedAdmin();
}

/**
 * Universal Query Executor with parameterized SQL support ($1, $2, ...)
 */
export async function query(sql, params = []) {
  if (isPostgres && pool) {
    return pool.query(sql, params);
  }

  // --- Embedded Query Handling (Fallback) ---
  const trimmed = sql.trim();
  const lower = trimmed.toLowerCase();

  // SELECT membership_types
  if (lower.startsWith('select') && lower.includes('from membership_types')) {
    return { rows: [...embeddedStore.membership_types] };
  }

  // SELECT users by phone_number
  if (lower.includes('from users') && (lower.includes('where phone_number = $1') || lower.includes('where u.phone_number = $1'))) {
    const phone = params[0];
    const user = embeddedStore.users.find((u) => u.phone_number === phone);
    if (!user) return { rows: [] };
    const tier = embeddedStore.membership_types.find((t) => t.id === user.membership_type_id);
    const app = embeddedStore.membership_applications.find((a) => a.user_id === user.id);
    return {
      rows: [
        {
          ...user,
          membership_tier: tier?.name || 'Novitiate (Classis I)',
          application_status: app?.status || 'PENDING',
        },
      ],
    };
  }

  // SELECT user by id
  if (lower.includes('from users') && lower.includes('where u.id = $1') || (lower.includes('from users') && lower.includes('where id = $1'))) {
    const id = Number(params[0]);
    const user = embeddedStore.users.find((u) => u.id === id);
    if (!user) return { rows: [] };
    const tier = embeddedStore.membership_types.find((t) => t.id === user.membership_type_id);
    const app = embeddedStore.membership_applications.find((a) => a.user_id === user.id);
    return {
      rows: [
        {
          ...user,
          membership_tier: tier?.name || 'Novitiate (Classis I)',
          application_status: app?.status || 'PENDING',
        },
      ],
    };
  }

  // INSERT INTO users
  if (lower.startsWith('insert into users')) {
    const [fullName, phoneNumber, carrier, passwordHash, role, status, isPhoneVerified, membershipTypeId] = params;
    const existing = embeddedStore.users.find((u) => u.phone_number === phoneNumber);
    if (existing) {
      const err = new Error('duplicate key value violates unique constraint "users_phone_number_key"');
      err.code = '23505';
      throw err;
    }
    const id = embeddedStore.nextIds.users++;
    const newUser = {
      id,
      full_name: fullName,
      phone_number: phoneNumber,
      carrier,
      password_hash: passwordHash,
      role: role || 'MEMBER',
      status: status || 'ACTIVE',
      is_phone_verified: !!isPhoneVerified,
      membership_type_id: membershipTypeId || 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    embeddedStore.users.push(newUser);

    // Create default membership application
    const appId = embeddedStore.nextIds.membership_applications++;
    embeddedStore.membership_applications.push({
      id: appId,
      user_id: id,
      membership_type_id: 1,
      status: 'PENDING',
      notes: 'Initial petition inscribed via verified phone sigil.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    return { rows: [newUser] };
  }

  // UPDATE users set is_phone_verified = true
  if (lower.startsWith('update users') && lower.includes('is_phone_verified = $1') && lower.includes('where phone_number = $2')) {
    const [isVerified, phone] = params;
    const user = embeddedStore.users.find((u) => u.phone_number === phone);
    if (user) {
      user.is_phone_verified = isVerified;
      user.updated_at = new Date().toISOString();
      return { rows: [user] };
    }
    return { rows: [] };
  }

  // UPDATE users status (Suspend / Activate)
  if (lower.startsWith('update users') && lower.includes('status = $1') && lower.includes('where id = $2')) {
    const [newStatus, id] = params;
    const user = embeddedStore.users.find((u) => u.id === Number(id));
    if (user) {
      user.status = newStatus;
      user.updated_at = new Date().toISOString();
      return { rows: [user] };
    }
    return { rows: [] };
  }

  // OTP queries: INSERT INTO otp_verifications
  if (lower.startsWith('insert into otp_verifications')) {
    const [phoneNumber, otpHash, salt, expiresAt] = params;
    const id = embeddedStore.nextIds.otp_verifications++;
    const record = {
      id,
      phone_number: phoneNumber,
      otp_hash: otpHash,
      salt,
      attempts: 0,
      max_attempts: 5,
      expires_at: expiresAt,
      is_used: false,
      created_at: new Date().toISOString(),
    };
    embeddedStore.otp_verifications.push(record);
    return { rows: [record] };
  }

  // SELECT latest active OTP
  if (lower.includes('from otp_verifications') && lower.includes('where phone_number = $1')) {
    const phone = params[0];
    const records = embeddedStore.otp_verifications
      .filter((o) => o.phone_number === phone && !o.is_used)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    return { rows: records.slice(0, 1) };
  }

  // UPDATE otp_verifications (increment attempts / mark used)
  if (lower.startsWith('update otp_verifications')) {
    const id = Number(params[params.length - 1]);
    const record = embeddedStore.otp_verifications.find((o) => o.id === id);
    if (record) {
      if (lower.includes('is_used = true')) {
        record.is_used = true;
      }
      if (lower.includes('attempts = attempts + 1')) {
        record.attempts += 1;
      }
      return { rows: [record] };
    }
    return { rows: [] };
  }

  // SELECT membership_applications for user
  if (lower.includes('from membership_applications') && lower.includes('where user_id = $1')) {
    const userId = Number(params[0]);
    const apps = embeddedStore.membership_applications.filter((a) => a.user_id === userId);
    return { rows: apps };
  }

  // UPDATE membership_applications status
  if (lower.startsWith('update membership_applications') && lower.includes('status = $1')) {
    const [newStatus, notes, reviewerId, appId] = params;
    const app = embeddedStore.membership_applications.find((a) => a.id === Number(appId) || a.user_id === Number(appId));
    if (app) {
      app.status = newStatus;
      if (notes) app.notes = notes;
      if (reviewerId) app.reviewed_by = reviewerId;
      app.reviewed_at = new Date().toISOString();
      app.updated_at = new Date().toISOString();
      return { rows: [app] };
    }
    return { rows: [] };
  }

  // Admin stats
  if (lower.includes('count(*)') && lower.includes('from users')) {
    const totalUsers = embeddedStore.users.length;
    const pendingApps = embeddedStore.membership_applications.filter((a) => a.status === 'PENDING' || a.status === 'UNDER_REVIEW').length;
    const approvedMembers = embeddedStore.membership_applications.filter((a) => a.status === 'APPROVED').length;
    const smsDelivered = embeddedStore.otp_verifications.length;
    return {
      rows: [
        {
          total_users: totalUsers,
          pending_apps: pendingApps,
          approved_members: approvedMembers,
          sms_delivered: smsDelivered,
        },
      ],
    };
  }

  // Admin users list
  if (lower.includes('from users u') && (lower.includes('left join membership_types') || lower.includes('left join membership_applications'))) {
    let rows = embeddedStore.users.map((u) => {
      const tier = embeddedStore.membership_types.find((t) => t.id === u.membership_type_id);
      const app = embeddedStore.membership_applications.find((a) => a.user_id === u.id);
      return {
        id: u.id,
        fullName: u.full_name,
        phoneNumber: u.phone_number,
        carrier: u.carrier,
        role: u.role,
        status: u.status,
        isPhoneVerified: u.is_phone_verified,
        membershipTier: tier?.name || 'Novitiate',
        applicationId: app?.id || null,
        applicationStatus: app?.status || 'PENDING',
        createdAt: u.created_at,
      };
    });

    // Handle search query
    if (params && params[0]) {
      const q = String(params[0]).toLowerCase();
      rows = rows.filter((r) => r.fullName.toLowerCase().includes(q) || r.phoneNumber.includes(q));
    }

    return { rows };
  }

  // INSERT INTO audit_logs
  if (lower.startsWith('insert into audit_logs')) {
    const [actorId, action, targetType, targetId, details, ip] = params;
    const log = {
      id: embeddedStore.nextIds.audit_logs++,
      actor_id: actorId,
      action,
      target_type: targetType,
      target_id: targetId,
      details,
      ip_address: ip,
      created_at: new Date().toISOString(),
    };
    embeddedStore.audit_logs.push(log);
    return { rows: [log] };
  }

  return { rows: [] };
}

export function isUsingPostgres() {
  return isPostgres;
}

export default {
  query,
  initDb,
  isUsingPostgres,
};
