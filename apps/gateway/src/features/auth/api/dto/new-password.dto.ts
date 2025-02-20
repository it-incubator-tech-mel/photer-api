import { IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator';
import { Trim } from '../../../../core/decorators/trim';
import {ApiProperty} from "@nestjs/swagger";

export class NewPasswordDto {
    @ApiProperty({
        minLength: 6,
        maxLength: 100,
        pattern: '^[a-zA-Z0-9_-]+$',
    })
    @IsString()
    @Trim()
    @IsNotEmpty({ message: 'newPassword is required' })
    @Matches(/^[a-zA-Z0-9_-]+$/, {
        message: 'Username can only contain letters, numbers, underscores, and hyphens'
    })
    newPassword: string;
    @ApiProperty({
        description: 'must be unique',
    })
    @Trim()
    @IsNotEmpty({ message: 'recoveryCode is required' })
    @IsUUID(4, { message: 'UUID not correct' })
    recoveryCode: string
}