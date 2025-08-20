import { Static, Type } from '@sinclair/typebox';
import { IdField, TimestampField, UserIdField } from './user.schemas.js';

export const EmailField = Type.String({
  pattern: `^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$`,
});

export const twoFactorEntrySchema = Type.Union(
  [
    Type.Object({
      id: IdField,
      user_id: UserIdField,
      email: EmailField,
      status: Type.Literal('pending'),
      verified_at: Type.Null(),
      created_at: TimestampField,
    }),
    Type.Object({
      id: IdField,
      user_id: UserIdField,
      email: EmailField,
      status: Type.Literal('verified'),
      verified_at: TimestampField,
      created_at: TimestampField,
    }),
  ],
  {
    $id: 'TwoFactorEntry',
    discriminator: 'status',
  },
);

export const twoFactorInsertSchema = Type.Pick(twoFactorEntrySchema, [
  'user_id',
  'email',
  'status',
  'verified_at',
]);

export type TwoFactorEntry = Static<typeof twoFactorEntrySchema>;
export type TwoFactorInsert = Static<typeof twoFactorInsertSchema>;
export type TwoFactorUpdate = Partial<Static<typeof twoFactorInsertSchema>>;

export const twoFactorVerifySchema = Type.Object({
  code: Type.String(),
});
export type TwoFactorVerify = Static<typeof twoFactorVerifySchema>;

export const twoFactorRequestSchema = Type.Object({
  email: EmailField,
});
export type TwoFactorRequest = Static<typeof twoFactorRequestSchema>;

export const TwoFactorChallengePurposeValues = ['enroll', 'login', 'stepup', 'disable'] as const;
export type TwoFactorChallengePurpose = (typeof TwoFactorChallengePurposeValues)[number];
export const twoFactorChallengePurposeSchema = Type.Union(
  TwoFactorChallengePurposeValues.map((v) => Type.Literal(v)),
);

export const twoFactorChallengeRequestSchema = Type.Object({
  purpose: twoFactorChallengePurposeSchema,
});
export type TwoFactorChallengeRequest = Static<typeof twoFactorChallengeRequestSchema>;

export const twoFactorChallengeVerifySchema = Type.Object({
  purpose: twoFactorChallengePurposeSchema,
  code: Type.String(),
});
export type TwoFactorChallengeVerify = Static<typeof twoFactorChallengeVerifySchema>;

export const twoFactorChallengeRequestedSchema = Type.Object({
  expiresAt: Type.Number(),
});
export type TwoFactorChallengeRequested = Static<typeof twoFactorChallengeRequestedSchema>;
