import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { configProvider } from '../config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [AuthController],
  providers: [configProvider, AuthService, AuthGuard],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
