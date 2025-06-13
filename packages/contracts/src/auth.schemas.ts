import {Type, Static, StaticDecodeIsAny} from '@sinclair/typebox';
import { EmailField, IdField, IdParamField, TimestampField, UserIdField, UsernameField } from './user.schemas';
export const PasswordField = Type.String();
export const PwHashField = Type.String();

export const registerUserSchema = Type.Object({
    username: UsernameField,
    email: EmailField,
    password: PasswordField,
});

export type RegisterUser = Static<typeof registerUserSchema>;

export const userCredentialsEntrySchema = Type.Object ({
    user_id: UserIdField,
    username: UsernameField,
    email: EmailField,
    pw_hash: PwHashField,
});

export type UserCredentialsEntry = Static<typeof userCredentialsEntrySchema>;

export const userCredentialsSchema = Type.Object({
    id: IdField,
    user_id: UserIdField,
    username: UsernameField,
    email: EmailField,
    pw_hash: PwHashField,
    created_at: TimestampField,
    updated_at: TimestampField,
});

export type UserCredentials = Static<typeof userCredentialsSchema>;

export const authDataSchema = Type.Object({
    success: Type.Boolean(),
    accessToken: Type.String(),
});

export type AuthData = Static<typeof authDataSchema>;
