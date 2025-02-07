import {IsEmail, Length, Matches} from "class-validator";

export class RegistrationDto {
    @Length(6, 30)
    @Matches(/^[a-zA-Z0-9_-]$/)
    username: string;
    @IsEmail()
    email: string;
    @Length(6, 20)
    @Matches(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!"#$%&'()*+,\-.\/:;<=>?@[\\]^_`{|}~])[0-9A-Za-z!"#$%&'()*+,\-.\/:;<=>?@[\\]^_`{|}~]$/)
    password: string;
    ConsentOfService: boolean;
}