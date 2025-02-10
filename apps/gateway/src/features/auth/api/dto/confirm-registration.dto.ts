import { IsNotEmpty, IsUUID } from 'class-validator';
import { Trim } from '../../../../core/decorators/trim';

export class ConfirmRegistrationDto {
    @Trim()
    @IsNotEmpty({ message: 'Code is required' })
    @IsUUID(4, { message: 'UUID not correct' })
    code: string
}