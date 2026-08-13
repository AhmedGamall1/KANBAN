import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "src/common/public.decorator";
import { AuthenticatedRequest } from "src/common/authenticated-request";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly auth: AuthService, private readonly reflector: Reflector) { }


    async canActivate(context: ExecutionContext): Promise<boolean> {
        // the handler override a protected controller
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<AuthenticatedRequest>()
        const token = request.cookies?.['sid'] as string | undefined

        if (!token) {
            throw new UnauthorizedException()
        }

        const user = await this.auth.validateSession(token)

        if (!user) {
            throw new UnauthorizedException();
        }

        request.user = user

        return true
    }
}