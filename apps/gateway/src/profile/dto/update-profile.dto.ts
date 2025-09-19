import { PartialType } from '@nestjs/swagger';
import { CreateProfileDto } from './create-profile.dto';

/**
 * DTO для обновления профиля пользователя
 *
 * Расширяет CreateProfileDto, делая все поля опциональными
 * для частичного обновления существующего профиля.
 */
export class UpdateProfileDto extends PartialType(CreateProfileDto) {}
