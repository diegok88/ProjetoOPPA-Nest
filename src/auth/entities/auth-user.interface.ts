export interface JwtPayload {
  sub: string;
  perfil: string;
  empresa: string;
  versaoToken: number;
}

export interface AuthUser {
  userId: string;
  perfil: string;
  empresa: string;
  versaoToken: number;
}
