import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService, JwtSignOptions } from '@nestjs/jwt';
import { JwtConfig } from '../../config/jwt.config';

export class AccessTokenPayload {
    userId: number;
}

export class RefreshTokenPayload extends AccessTokenPayload {
    deviceId: string;
    iat?: number;
    exp?: number;
}

@Injectable()
export class JwtServiceProvider {
    constructor(
        private nestJwtService: NestJwtService,
        private jwtConfig: JwtConfig
    ) {}

    async generateAccessToken(payload: AccessTokenPayload): Promise<string> {
        const options: JwtSignOptions = {
            expiresIn: this.jwtConfig.jwtAccessExpirationTime,
        };

        return this.nestJwtService.signAsync(payload, options);
    }

    async generateRefreshToken(payload: RefreshTokenPayload): Promise<string> {
        const options: JwtSignOptions = {
            expiresIn: this.jwtConfig.jwtRefreshExpirationTime,
        };

        return this.nestJwtService.signAsync(payload, options);
    }

    async verify<T extends object = any>(token: string): Promise<T> {
        return this.nestJwtService.verify<T>(token);
    }

    async decode<T extends object = any>(token: string): Promise<T | null> {
        return this.nestJwtService.decode(token) as T | null;
    }
}