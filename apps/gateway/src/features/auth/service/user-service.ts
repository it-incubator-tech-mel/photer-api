import {Injectable} from "@nestjs/common";
import {UsersRepository} from "../infrastructure/users.repository";
import bcrypt from "bcrypt";
import {UserType} from "../api/dto/User-type";

@Injectable()
export class UserService {
    constructor(protected usersRepository: UsersRepository) {}

    async _generateHash(password: string, salt: string) {
        return bcrypt.hash(password, salt);
    }
    async checkCredentials(
        email: string,
        password: string,
    ): Promise<UserType | null> {
        const user = await this.usersRepository.findByEmail(email);
        if (!user) return null;

        const passwordHash = await this._generateHash(password, user.password);
        if (user.password !== passwordHash) return null
        return user;
    }
}