import { Body, Controller, Get, HttpException, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
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
    
    @Post('bearer')
    authBearer(@Body("user") user: string, @Body("password") password: string) {

        if(this.authService.validateUser(user, password)) {
            return this.authService.login(user);
        }

        throw new HttpException('Authentication failure', HttpStatus.UNAUTHORIZED)
    }
}
