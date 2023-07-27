import { UserRole } from 'src/schemas';

export class CreateUserDto {
  userId: string;

  privateKey: string;

  walletAddress: string;

  gas: string;

  slippage: string;
}
