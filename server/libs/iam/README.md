# Security Library (Identity and Access Management)

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

The Security library is included in the monorepo and doesn't require separate installation. It depends on the Redis library (@app/redis), which should be imported in your application module.

## Usage

### Importing the Module

```typescript
import { Module } from '@nestjs/common';
import { SecurityModule } from '@app/security';
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
    // Then import Security module
    SecurityModule.register(
      {
        jwtModuleOptions: {
          secret: process.env.JWT_SECRET || 'your-secret-key',
          signOptions: {
            expiresIn: process.env.JWT_EXPIRES_IN || '15m',
          },
        },
        isGlobal: true,
      },
      {
        isGlobal: true,
        maxAttempts: 10,
        windowSeconds: 60,
        blockSeconds: 60,
      },
    ),
  ],
})
export class AppModule {}
```

### Authentication

#### Protecting Routes

By default, all routes are protected if you enable the global JWT guard. You can mark specific routes as public:

```typescript
import { Controller, Get, Post } from '@nestjs/common';
import { Public } from '@app/security';

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
import { CurrentUser, JwtPayload } from '@app/security';

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
import { Roles } from '@app/security';

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
import { Permissions } from '@app/security';

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
import { SecurityService, TokenType } from '@app/security';

@Injectable()
export class AuthService {
  constructor(private readonly securityService: SecurityService) {}

  async login(userId: string, roles: string[], permissions: string[]) {
    // Generate tokens
    const accessToken = await this.securityService.generateAccessToken(userId, {
      roles,
      permissions,
    });

    const refreshToken = await this.securityService.generateRefreshToken(userId, {
      roles,
      permissions,
    });

    return { accessToken, refreshToken };
  }

  async logout(userId: string, sessionId: string) {
    // Revoke token
    await this.securityService.revokeToken(userId, sessionId);
  }

  async validateToken(token: string) {
    // Validate token
    return this.securityService.validateToken(token, TokenType.ACCESS);
  }
}
```

## Configuration Options

### Auth Guard Options
| Option | Description | Default |
|--------|-------------|---------|
| `jwtModuleOptions.secret` | Secret key for JWT signing | Required |
| `jwtModuleOptions.signOptions.expiresIn` | Access token expiration time | `'15m'` |
| `isGlobal` | Register the module globally | `false` |

### Rate Guard Options
| Option | Description | Default |
|--------|-------------|---------|
| `isGlobal` | Register the rate guard globally | `false` |
| `maxAttempts` | Maximum attempts per window | `10` |
| `windowSeconds` | Time window in seconds | `60` |
| `blockSeconds` | Block duration in seconds | `60` |

## Testing

To test components that use the Security library, you can mock the SecurityService:

```typescript
import { Test } from '@nestjs/testing';
import { SecurityService } from '@app/security';

describe('YourService', () => {
  let service: YourService;
  let securityService: SecurityService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        YourService,
        {
          provide: SecurityService,
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
    securityService = moduleRef.get<SecurityService>(SecurityService);
  });

  it('should generate a token', async () => {
    jest.spyOn(securityService, 'generateAccessToken').mockResolvedValue('token');
    expect(await service.generateToken('user-id')).toBe('token');
  });
});
```
