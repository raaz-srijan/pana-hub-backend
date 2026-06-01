import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { ENV } from "../infrastructure/env";

const JWT_SECRET = ENV.JWT_SECRET
const JWT_REFRESH = ENV.JWT_REFRESH
const JWT_SECRET_TIMEOUT = ENV.JWT_SECRET_TIMEOUT
const JWT_REFRESH_TIMEOUT = ENV.JWT_REFRESH_TIMEOUT

export interface PayloadTypes extends JwtPayload {
    id: string;
    email?: string;
    role?: string;
}


//ACCESS TOKEN (SHORT_TIME)
export function generateAccessToken(payload: PayloadTypes, expiresIn = JWT_SECRET_TIMEOUT as NonNullable<SignOptions["expiresIn"]>) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

//REFRESH TOKEN (COOKIES)
export function generateRefreshToken(payload: PayloadTypes, expiresIn = JWT_REFRESH_TIMEOUT as NonNullable<SignOptions["expiresIn"]>) {
    return jwt.sign(payload, JWT_REFRESH, {expiresIn});
}


//VERIFY ACCESS TOKEN
export function verifyAccessToken(accessToken:string) {
    return jwt.verify(accessToken, JWT_SECRET);
}


//VERIFY REFRESH TOKEN
export function verifyRefreshToken(refreshToken:string) {
    return jwt.verify(refreshToken, JWT_REFRESH);
}