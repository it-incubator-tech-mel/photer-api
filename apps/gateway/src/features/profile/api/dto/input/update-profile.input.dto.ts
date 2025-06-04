import {
  IsDateString,
  IsOptional,
  Length,
  Matches,
  Validate,
} from 'class-validator';
import { MinAge } from '../../../../../core/decorators/custom/min-age.decorator';

export class UpdateProfileDto {
  @Length(6, 30)
  @Matches(/^[a-zA-Z0-9_-]+$/)
  username: string;

  @Length(1, 50)
  @Matches(/^[A-Za-zА-Яа-я]+$/)
  firstName: string;

  @Length(1, 50)
  @Matches(/^[A-Za-zА-Яа-я]+$/)
  lastName: string;

  @IsOptional()
  @IsDateString()
  @Validate(MinAge, [13])
  birthDate?: string;

  @IsOptional()
  country?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  @Length(0, 200)
  aboutMe?: string;
}
