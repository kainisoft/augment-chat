# IAM (Identity and Access Management) Library

A centralized authentication and authorization library for NestJS microservices.

## Features

- JWT-based authentication
- Role-based access control (RBAC)
- Permission-based access control
- Global authentication guard
- Public route exemptions via `@Public()` decorator
- Current user decorator
- Token blacklisting using Redis
- Configurable via environment variables or module options

## Installation

The IAM library is included in the monorepo and doesn't require separate installation. It depends on the Redis library (@app/redis), which should be imported in your application module.

## Usage

### Importing the Module

```typescript
import { Module } from '@nestjs/common';
import { IamModule } from '@app/iam';
import { RedisModule } from '@app/redis';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
    // Import Redis module first
    RedisModule.registerDefault({
      isGlobal: true,
      keyPrefix: 'app:',
      password: process.env.REDIS_PASSWORD,
    }),
    // Then import IAM module
    IamModule.register({
      jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
      refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
      isGlobal: true,
      globalGuards: {
        jwt: true,
        roles: true,
      },
    }),
  ],
})
export class AppModule {}
```

### Authentication

#### Protecting Routes

By default, all routes are protected if you enable the global JWT guard. You can mark specific routes as public:

```typescript
import { Controller, Get, Post } from '@nestjs/common';
import { Public } from '@app/iam';

@Controller('auth')
export class AuthController {
  @Public()
  @Post('login')
  login() {
    // Public route
  }

  @Get('profile')
  getProfile() {
    // Protected route
  }
}
```

#### Accessing the Current User

```typescript
import { Controller, Get } from '@nestjs/common';
import { CurrentUser, JwtPayload } from '@app/iam';

@Controller('users')
export class UsersController {
  @Get('me')
  getMe(@CurrentUser() user: JwtPayload) {
    return { id: user.sub, roles: user.roles };
  }

  @Get('id')
  getUserId(@CurrentUser('sub') userId: string) {
    return { id: userId };
  }
}
```

### Authorization

#### Role-Based Access Control

```typescript
import { Controller, Get } from '@nestjs/common';
import { Roles } from '@app/iam';

@Controller('admin')
export class AdminController {
  @Roles('admin')
  @Get('dashboard')
  getDashboard() {
    // Only accessible to users with 'admin' role
    return { message: 'Admin dashboard' };
  }

  @Roles('admin', 'moderator')
  @Get('reports')
  getReports() {
    // Accessible to users with 'admin' OR 'moderator' role
    return { message: 'Reports' };
  }
}
```

#### Permission-Based Access Control

```typescript
import { Controller, Get, Post, Delete } from '@nestjs/common';
import { Permissions } from '@app/iam';

@Controller('articles')
export class ArticlesController {
  @Permissions('articles:read')
  @Get()
  findAll() {
    // Only accessible to users with 'articles:read' permission
  }

  @Permissions('articles:create')
  @Post()
  create() {
    // Only accessible to users with 'articles:create' permission
  }

  @Permissions('articles:delete')
  @Delete(':id')
  remove() {
    // Only accessible to users with 'articles:delete' permission
  }
}
```

### Token Management

```typescript
import { Injectable } from '@nestjs/common';
import { IamService, TokenType } from '@app/iam';

@Injectable()
export class AuthService {
  constructor(private readonly iamService: IamService) {}

  async login(userId: string, roles: string[], permissions: string[]) {
    // Generate tokens
    const accessToken = await this.iamService.generateAccessToken(userId, {
      roles,
      permissions,
    });

    const refreshToken = await this.iamService.generateRefreshToken(userId, {
      roles,
      permissions,
    });

    return { accessToken, refreshToken };
  }

  async logout(userId: string, sessionId: string) {
    // Revoke token
    await this.iamService.revokeToken(userId, sessionId);
  }

  async validateToken(token: string) {
    // Validate token
    return this.iamService.validateToken(token, TokenType.ACCESS);
  }
}
```

## Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `jwtSecret` | Secret key for JWT signing | Required |
| `jwtExpiresIn` | Access token expiration time | `'15m'` |
| `refreshTokenExpiresIn` | Refresh token expiration time | `'7d'` |
| `isGlobal` | Register the module globally | `false` |
| `globalGuards.jwt` | Register JWT guard globally | `false` |
| `globalGuards.roles` | Register roles guard globally | `false` |

## Testing

To test components that use the IAM library, you can mock the IamService:

```typescript
import { Test } from '@nestjs/testing';
import { IamService } from '@app/iam';

describe('YourService', () => {
  let service: YourService;
  let iamService: IamService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        YourService,
        {
          provide: IamService,
          useValue: {
            generateAccessToken: jest.fn(),
            validateToken: jest.fn(),
            hasRole: jest.fn(),
            hasPermission: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<YourService>(YourService);
    iamService = moduleRef.get<IamService>(IamService);
  });

  it('should generate a token', async () => {
    jest.spyOn(iamService, 'generateAccessToken').mockResolvedValue('token');
    expect(await service.generateToken('user-id')).toBe('token');
  });
});
```
