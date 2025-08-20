import {
  AuthConfig,
  ERROR_CODES,
  ServiceError,
  TwoFactorChallengePurpose,
} from '@transcenders/contracts';
import bcrypt from 'bcrypt';
import { SQL } from 'sql-template-strings';
import { Database } from 'sqlite';

export class TwoFactorChallengeService {
  static async prune(database: Database, userId: number) {
    const sql = SQL`
      DELETE FROM two_factor_challenges
      WHERE user_id = ${userId}
        AND (expires_at < ${new Date().toISOString()} OR consumed_at IS NOT NULL)
    `;
    await database.run(sql.text, sql.values);
  }

  static async create(
    database: Database,
    userId: number,
    purpose: TwoFactorChallengePurpose,
  ): Promise<{ code: string; expiresAt: Date }> {
    await this.prune(database, userId);
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const code_hash = await bcrypt.hash(code, 12);
    const expiresAt = new Date(Date.now() + AuthConfig.TWO_FACTOR_CODE_EXPIRE_MS);

    const insert = SQL`
      INSERT INTO two_factor_challenges (user_id, purpose, code_hash, expires_at)
      VALUES (${userId}, ${purpose}, ${code_hash}, ${expiresAt.toISOString()})
    `;
    await database.run(insert.text, insert.values);
    return { code, expiresAt };
  }

  static async assertVerify(
    database: Database,
    userId: number,
    purpose: TwoFactorChallengePurpose,
    code: string,
  ): Promise<boolean> {
    const select = SQL`
      SELECT * FROM two_factor_challenges
      WHERE user_id = ${userId}
        AND purpose = ${purpose}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const row = await database.get(select.text, select.values);
    if (!row) throw new ServiceError(ERROR_CODES.AUTH.TWO_FACTOR_NO_CHALLENGE);

    const nowIso = new Date().toISOString();
    if (row.consumed_at) {
      throw new ServiceError(ERROR_CODES.AUTH.TWO_FACTOR_CHALLENGE_CONSUMED);
    }
    if (row.expires_at <= nowIso) {
      throw new ServiceError(ERROR_CODES.AUTH.TWO_FACTOR_CHALLENGE_EXPIRED);
    }

    const ok = await bcrypt.compare(code, row.code_hash);
    if (!ok) {
      throw new ServiceError(ERROR_CODES.AUTH.TWO_FACTOR_WRONG_CODE);
    }

    const consume = SQL`
      UPDATE two_factor_challenges
      SET consumed_at = ${nowIso}
      WHERE id = ${row.id}
    `;
    await database.run(consume.text, consume.values);
    return true;
  }
}
