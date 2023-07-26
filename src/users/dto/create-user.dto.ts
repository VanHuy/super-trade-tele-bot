import { UserRole } from 'src/schemas';

export class CreateUserDto {
  address: string;

  role: UserRole;
}
