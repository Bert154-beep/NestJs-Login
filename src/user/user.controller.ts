import { Controller, UseGuards } from '@nestjs/common';
import { User } from 'src/auth/Schemas/user.schema';
import { Get } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';


@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
    constructor(){}
    @Get('getUser')
    getUser(@GetUser() user: User){
        return user;
    }
    


}
