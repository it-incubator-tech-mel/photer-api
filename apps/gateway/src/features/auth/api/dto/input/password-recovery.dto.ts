import { IsEmail, IsNotEmpty } from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";
import {Trim} from "../../../../../core/decorators/trim";

export class PasswordRecoveryDto {
    @ApiProperty({
        pattern: '^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$',
        example: 'user@example.com',
        description: 'Email of registered user',
    })
    @Trim()
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @ApiProperty({
        maxLength: 100,
        description: 'Google recaptchaValue',
    })
    recaptchaValue: string
}