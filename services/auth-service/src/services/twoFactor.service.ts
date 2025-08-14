import { Value } from '@sinclair/typebox/value';
import {
  BooleanOperationResult,
  BooleanResultHelper,
  ERROR_CODES,
  ResultHelper,
  ServiceError,
  ServiceResult,
  TwoFactorChallengePurpose,
  TwoFactorChallengeRequested,
  TwoFactorInsert,
  TwoFactorUpdate,
  twoFactorEntrySchema,
} from '@transcenders/contracts';
import { DatabaseManager, QueryBuilder } from '@transcenders/server-utils';
import { SQL } from 'sql-template-strings';
import { Database } from 'sqlite';
import { TwoFactorChallengeService } from './twoFactorChallenge.service.js';

export class TwoFactorService {
  static async initiateDatabaseEntry(
    database: Database,
    userId: number,
    email: string,
    force = false,
  ): Promise<void> {
    let twoFactorInsert: TwoFactorInsert;
    if (!force) {
      twoFactorInsert = {
        user_id: userId,
        email: email,
        status: 'pending',
        verified_at: null,
      };
    } else {
      twoFactorInsert = {
        user_id: userId,
        email: email,
        status: 'verified',
        verified_at: new Date().toISOString(),
      };
    }
    const { sql, values } = QueryBuilder.insertReplace('two_factor', twoFactorInsert);
    const result = await database.run(sql, values);
    if (!result.lastID) {
      throw new ServiceError(ERROR_CODES.COMMON.INTERNAL_SERVER_ERROR, {
        reason: 'Failed to init two_factor entry',
      });
    }
  }

  private static async assertRequirements(
    database: Database,
    userId: number,
    requireEntry = false,
  ): Promise<void> {
    const sql = SQL`
        SELECT * FROM two_factor WHERE user_id = ${userId}
    `;
    const row = await database.get(sql.text, sql.values);
    if (!row && requireEntry) {
      throw new ServiceError(ERROR_CODES.AUTH.TWO_FACTOR_ENROLL_REQUIRED);
    }
    if (!row) return;

    Value.Assert(twoFactorEntrySchema, row);
    if (row.status === 'verified') {
      throw new ServiceError(ERROR_CODES.AUTH.TWO_FACTOR_ALREADY_VERIFIED);
    }
  }

  static async enroll(userId: number, code: string) {
    const db = await DatabaseManager.for('AUTH').open();
    return ResultHelper.executeQuery('2fa verify enroll', db, async (database) => {
      await this.assertRequirements(database, userId, true);
      await TwoFactorChallengeService.assertVerify(database, userId, 'enroll', code);

      const update: TwoFactorUpdate = {
        status: 'verified',
      };
      const { sql, values } = QueryBuilder.update(
        'two_factor',
        update,
        `user_id = ${userId} AND status = 'pending'`,
      );
      await database.run(sql, values);
      return BooleanResultHelper.success('2fa verified');
    });
  }

  private static async ensureVerified(database: Database, userId: number) {
    const sql = SQL`
      SELECT * FROM two_factor WHERE user_id = ${userId}
    `;
    const row = await database.get(sql.text, sql.values);
    if (!row) {
      throw new ServiceError(ERROR_CODES.AUTH.TWO_FACTOR_NOT_ENABLED);
    }
    Value.Assert(twoFactorEntrySchema, row);
    if (row.status !== 'verified') {
      throw new ServiceError(ERROR_CODES.AUTH.TWO_FACTOR_NOT_ENABLED);
    }
  }

  private static async requestChallenge(
    userId: number,
    purpose: TwoFactorChallengePurpose,
    email?: string,
  ): Promise<ServiceResult<TwoFactorChallengeRequested>> {
    const db = await DatabaseManager.for('AUTH').open();
    return ResultHelper.executeQuery(`2fa ${purpose} request`, db, async (database) => {
      if (purpose !== 'enroll') {
        await this.ensureVerified(database, userId);
      }
      if (purpose === 'enroll' && email) {
        await this.assertRequirements(database, userId);
        await this.initiateDatabaseEntry(database, userId, email);
      }

      const { code, expiresAt } = await TwoFactorChallengeService.create(database, userId, purpose);
      // TODO: email send using stored email in two_factor
      console.log(`2FA '${purpose}' code for user ${userId}: ${code}`);
      return { expiresAt: +expiresAt };
    });
  }

  static async requestEnroll(userId: number, email: string) {
    return this.requestChallenge(userId, 'enroll', email);
  }

  static async requestStepup(userId: number) {
    return this.requestChallenge(userId, 'stepup');
  }

  static async requestLogin(userId: number) {
    return this.requestChallenge(userId, 'login');
  }

  static async requestDisable(userId: number) {
    return this.requestChallenge(userId, 'disable');
  }

  static async disable(userId: number, code: string) {
    const db = await DatabaseManager.for('AUTH').open();
    return ResultHelper.executeQuery('2fa disable', db, async (database) => {
      const ok = await TwoFactorChallengeService.assertVerify(database, userId, 'disable', code);
      if (!ok) return BooleanResultHelper.failure('wrong or expired code');

      const { sql, values } = QueryBuilder.remove('two_factor', `user_id = ${userId}`);
      const result = await database.run(sql, values);
      const deleted = (result.changes ?? 0) > 0;
      return deleted
        ? BooleanResultHelper.success('2fa disabled')
        : BooleanResultHelper.failure('2fa not disabled');
    });
  }

  static async getEnabled(userId: number) {
    const db = await DatabaseManager.for('AUTH').open();
    return ResultHelper.executeQuery<BooleanOperationResult>('2fa status', db, async (database) => {
      const sql = SQL`
        SELECT status FROM two_factor 
        WHERE user_id = ${userId} AND status = 'verified'
        LIMIT 1
      `;
      const row = await database.get(sql.text, sql.values);
      if (!row) {
        return BooleanResultHelper.failure('not verified');
      }
      return BooleanResultHelper.success('verified');
    });
  }
}
