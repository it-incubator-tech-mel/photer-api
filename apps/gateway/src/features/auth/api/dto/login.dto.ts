import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { Trim } from '../../../../core/decorators/trim';
import {ApiProperty} from "@nestjs/swagger";

export class LoginDto {
    @ApiProperty({
        minLength: 5,
        maxLength: 500,
        pattern: '^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$',
        example: 'user@example.com',
        description: 'must be unique'
    })
    @Trim()
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @ApiProperty({
        minLength: 6,
        maxLength: 20,
    })
    @IsString()
    @Trim()
    @IsNotEmpty({ message: 'Password is required' })
    @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
    @Matches(/^[a-zA-Z0-9_-]+$/, {
        message: 'Username can only contain letters, numbers, underscores, and hyphens'
    })
    password: string;
}