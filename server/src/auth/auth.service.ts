import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from '../users/users.repository';
import { SignInInput } from './dto/sign-in.input';
import { SignUpInput } from './dto/sign-up.input';

@Injectable()
export class AuthService {
  constructor(
    private usersRepository: UsersRepository,
    private jwtService: JwtService,
  ) {}

  async signIn(signInInput: SignInInput) {
    const user = await this.validateUser(signInInput.email, signInInput.password);
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(user.id),
      this.createRefreshToken(user.id),
    ]);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  private async createAccessToken(userId: string) {
    const payload = { sub: userId, type: 'access' };

    return this.jwtService.signAsync(payload, { expiresIn: '15m' });
  }

  private async createRefreshToken(userId: string) {
    const payload = { sub: userId, type: 'refresh' };

    return this.jwtService.signAsync(payload, { expiresIn: '1d' });
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.usersRepository.findById(payload.sub);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const [newAccessToken, newRefreshToken] = await Promise.all([
        this.createAccessToken(user.id),
        this.createRefreshToken(user.id),
      ]);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async register(signUpInput: SignUpInput) {
    // Check if user already exists
    const existingUser = await this.usersRepository.findByEmail(signUpInput.email);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(signUpInput.password, 10);

    // Create user
    const user = await this.usersRepository.create({
      email: signUpInput.email,
      username: signUpInput.username,
      password: hashedPassword,
      avatarUrl: signUpInput.avatarUrl,
    });

    // Generate tokens
    const [accessToken, refreshToken] = await Promise.all([
      this.createAccessToken(user.id),
      this.createRefreshToken(user.id),
    ]);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }
}
