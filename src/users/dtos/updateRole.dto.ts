import { IsEnum } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateRoleDto {
  @IsEnum(UserRole, {
    message: 'Role must be one of: author, buyer, publisher, admin, super_admin',
  })
  role: UserRole;
}