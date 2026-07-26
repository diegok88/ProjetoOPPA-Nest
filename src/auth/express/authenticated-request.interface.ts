export interface AuthenticatedRequest extends Request {
  user: { userId: string; perfil: string };
}
