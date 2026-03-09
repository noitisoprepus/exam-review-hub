import { JwtDto } from '../dto/jwt.dto';

export interface RequestWithUser extends Request {
  user: JwtDto;
}
