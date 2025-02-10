import { IsEmail, IsNotEmpty } from 'class-validator';
import { Trim } from '../../../../core/decorators/trim';

export class RegistrationEmailResendingDto {
    @Trim()
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;
}