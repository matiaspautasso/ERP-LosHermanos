import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { EmailModule } from '../email/email.module';
import { PasswordRecoveryListener } from './listeners';

@Module({
  imports: [EmailModule],
  controllers: [AuthController],
  providers: [AuthService, PasswordRecoveryListener],
  exports: [AuthService],
})
export class AuthModule {}
