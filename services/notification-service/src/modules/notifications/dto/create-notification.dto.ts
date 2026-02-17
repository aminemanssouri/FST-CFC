import { IsEmail, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @IsString()
  @IsNotEmpty()
  templateKey!: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsEmail()
  recipient!: string;

  @IsObject()
  payload!: Record<string, unknown>;
}
