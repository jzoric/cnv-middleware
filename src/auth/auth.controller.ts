import { Body, Controller, Get, HttpException, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthUser } from './user.decorator';
import { AuthService } from './auth.service';
import { BasicAuthUserPasswordDTO } from './basicAuthUserPasswordDTO';

@ApiTags('api/auth')
@Controller('api/auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {

    }

    @ApiBody({
        type: BasicAuthUserPasswordDTO
    })

    @Get('renew')
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    renew(@AuthUser() user: any){
        console.log(user);
    }
    
    @Post('bearer')
    authBearer(@Body("user") user: string, @Body("password") password: string) {

        if(this.authService.validateUser(user, password)) {
            return this.authService.login(user);
        }

        throw new HttpException('Authentication failure', HttpStatus.UNAUTHORIZED)
    }
}
