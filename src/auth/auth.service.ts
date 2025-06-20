import { BadRequestException, Body, ConflictException, ForbiddenException, Injectable } from "@nestjs/common";
import { AuthDto } from "./dto";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from 'bcryptjs'
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "./Schemas/user.schema";
import { Model } from 'mongoose';
import { JwtService } from "@nestjs/jwt";


@Injectable()
export class AuthService{
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>  , private config: ConfigService, private jwt: JwtService){}

    async signup(dto: AuthDto){
        try {
            const {password, email, username} = dto

            const hashedPassword = await bcrypt.hash(password, 10)

            const existingUser = await this.userModel.findOne({email})

            if(existingUser){
                throw new ForbiddenException("User Already Exists!")
            }

            const newUser = await this.userModel.create({
                email,
                username,
                password: hashedPassword
            })

            const SavedUser = await newUser.save();

        } catch (error) {
            console.log("An Error Occured!", error)
            throw new BadRequestException("Sign Up Failed! Try Again")
        }


    }

    async signin(dto: AuthDto){
        const {email, password} = dto

        const user = await this.userModel.findOne({email})

        if(!user){
            throw new ForbiddenException("User Not Found!")
        }

        const isMatch = await bcrypt.compare(password, user.password)

        if(!isMatch){
            throw new ForbiddenException("Invalid Credentials")
        }

        return this.signToken(user.id, user.email)
    }

    async signToken(
        userId: number,
        email: string,
    ): Promise<{access_token: string}>{
        const payload = {
            sub: userId,
            email,
        }

        const secret = this.config.get('JWT_SECRET')
        
        const token = await this.jwt.signAsync(
            payload,
            {
                expiresIn: '15m',
                secret: secret
            }
        )

        return {
            access_token: token
        }
    }
    
}