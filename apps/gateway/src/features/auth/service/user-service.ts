import {Injectable} from "@nestjs/common";
import bcrypt from "bcrypt";
import { User } from '../domain/user.entity';
import {UserRepository} from "../infrastructure/users.repository";

@Injectable()
export class UserService {
    constructor(protected userRepository: UserRepository) {}

    async _generateHash(password: string, salt: string) {
        return bcrypt.hash(password, salt);
    }
    async checkCredentials(
        email: string,
        password: string,
    ): Promise<User | null> {
        const user = await this.userRepository.findByEmail(email);
        if (!user) return null;

        const passwordHash = await this._generateHash(password, user.getPassword());
        if (user.getPassword() !== passwordHash) return null
        return user;
    }
}