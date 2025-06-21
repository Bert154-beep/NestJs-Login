import { ForbiddenException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { UserDocument, User } from "../Schemas/user.schema";
import { Model } from 'mongoose';
import { InjectModel } from "@nestjs/mongoose";


@Injectable()
export class JwtStrategy extends PassportStrategy(
    Strategy,
    'jwt'
){
    constructor(private config: ConfigService, private jwt: JwtService, @InjectModel(User.name) private userModel: Model<UserDocument> ){
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: config.get<string>('JWT_SECRET')!
        })
    }
    
    
    async validate(payload: {sub: number, email: string}){
        const user = await this.userModel.findOne({_id: payload.sub}).select('-password')
        return user;
        
    }
}