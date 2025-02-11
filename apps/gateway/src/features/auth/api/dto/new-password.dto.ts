import { IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator';
import { Trim } from '../../../../core/decorators/trim';

export class NewPasswordDto {
    @IsString()
    @Trim()
    @IsNotEmpty({ message: 'newPassword is required' })
    @Matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]).*$/, {
        message: 'newPassword must include at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    newPassword: string;

    @Trim()
    @IsNotEmpty({ message: 'recoveryCode is required' })
    @IsUUID(4, { message: 'UUID not correct' })
    recoveryCode: string
}