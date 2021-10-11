import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Inject } from '@nestjs/common';
import { AuthService } from './auth.service';

export function Auth() {

    const authService: AuthService = this.authService;

    return applyDecorators(
        ApiBearerAuth(),
        UseGuards(JwtAuthGuard)
    );

    
    
}
