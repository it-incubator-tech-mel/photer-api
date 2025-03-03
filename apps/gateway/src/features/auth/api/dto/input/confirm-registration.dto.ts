import { IsNotEmpty, IsUUID } from 'class-validator';
import { Trim } from '../../../../../core/decorators/trim';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmRegistrationDto {
    @ApiProperty({
        description: 'Code that be sent via Email inside link',
    })
    @Trim()
    @IsNotEmpty({ message: 'Code is required' })
    @IsUUID(4, { message: 'UUID not correct' })
    code: string
}