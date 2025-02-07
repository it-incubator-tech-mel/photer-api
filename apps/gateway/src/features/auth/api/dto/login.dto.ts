import {IsEmail, Length, Matches} from "class-validator";

export class LoginDto {
    @IsEmail()
    email: string;
    @Length(6, 20)
    @Matches(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[!"#$%&'()*+,\-.\/:;<=>?@[\\]^_`{|}~])[0-9A-Za-z!"#$%&'()*+,\-.\/:;<=>?@[\\]^_`{|}~]$/)
    password: string;
}