import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @IsNotEmpty()
  key!: string;

  @IsString()
  @IsIn(['email'])
  channel!: 'email';

  @IsString()
  @IsNotEmpty()
  language!: string;

  @IsString()
  @IsNotEmpty()
  subjectTemplate!: string;

  @IsString()
  @IsNotEmpty()
  bodyTemplate!: string;
}
