import { AuthMeOutputDto } from '../../api/dto/output/auth-me.dto';

export class UserMapper {
  static toAuthMeOutput(user): AuthMeOutputDto {
    return new AuthMeOutputDto(user.id, user.email);
  }
}
