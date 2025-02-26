import { IsEmail, IsNotEmpty } from 'class-validator';
import { Trim } from '../../../../core/decorators/trim';
import {ApiProperty} from "@nestjs/swagger";

export class PasswordRecoveryDto {
    @ApiProperty({
        nullable: false,
        description: 'must be unique',
    })
    @Trim()
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Invalid email format' })
    email: string;
}