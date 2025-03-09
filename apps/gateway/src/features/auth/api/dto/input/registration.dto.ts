import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { Trim } from '../../../../../core/decorators/trim';
import { ApiProperty } from '@nestjs/swagger';

export class RegistrationDto {
    @ApiProperty({
        minLength: 6,
        maxLength: 30,
        pattern: '^[a-zA-Z0-9_-]*$',
        description: 'must be unique',
    })
    @Length(6, 30, { message: 'Username must be between 6 and 30 characters' })
    @Matches(/^[a-zA-Z0-9_-]*$/, { message: 'Username can only contain letters, numbers, underscores, and hyphens' })
    username: string;

    @ApiProperty({
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