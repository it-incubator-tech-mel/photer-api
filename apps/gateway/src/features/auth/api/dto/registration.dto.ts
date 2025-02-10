import { IsBoolean, IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { Trim } from '../../../../core/decorators/trim';

export class RegistrationDto {
    @Length(6, 30, { message: 'Username must be between 6 and 30 characters' })
    @Matches(/^[a-zA-Z0-9_-]{6,30}$/, { message: 'Username can only contain letters, numbers, underscores, and hyphens, and must be between 6 and 30 characters' })
    username: string;

    @Trim()
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;

    @IsString()
    @Trim()
    @IsNotEmpty({ message: 'Password is required' })
    @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).*$/, {
        message: 'Password must include at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    password: string;

    @IsBoolean()
    @IsNotEmpty({ message: 'Consent of service is required' })
    consentOfService: boolean;
}