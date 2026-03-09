import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '../interfaces/request-with-user.interface';
import { JwtDto } from '../dto/jwt.dto';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): JwtDto => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
