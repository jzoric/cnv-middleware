import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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
        console.log(user, password)
        if(this.authService.validateUser(user, password)) {
            return this.authService.login(user);
        }

        return '';
    }
}
