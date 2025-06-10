import { Controller, Get, Res, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggingService } from '@app/logging';
import { GraphQLDevelopmentToolsService } from './development-tools.service';
import { FastifyRequest, FastifyReply } from 'fastify';

/**
 * GraphQL Development Controller
 *
 * Provides development endpoints for GraphQL tools, documentation, and examples.
 * Only available in development environment.
 */
@Controller()
export class GraphQLDevelopmentController {
  constructor(
    private readonly configService: ConfigService,
    private readonly loggingService: LoggingService,
    private readonly developmentToolsService: GraphQLDevelopmentToolsService,
  ) {
    this.loggingService.setContext('GraphQLDevelopmentController');
  }

  /**
   * GraphQL Playground - Custom implementation for Apollo Federation Gateway
   */
  @Get('graphql')
  async getGraphQLPlayground(
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    if (!this.developmentToolsService.isDevelopmentMode()) {
      reply.code(404).send({ error: 'Not found' });
      return;
    }

    this.developmentToolsService.logDevelopmentAccess('graphql-playground');

    const playgroundHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>GraphQL Playground</title>
  <link rel="stylesheet" href="//cdn.jsdelivr.net/npm/graphql-playground-react/build/static/css/index.css" />
  <link rel="shortcut icon" href="//cdn.jsdelivr.net/npm/graphql-playground-react/build/favicon.png" />
  <script src="//cdn.jsdelivr.net/npm/graphql-playground-react/build/static/js/middleware.js"></script>
</head>
<body>
  <div id="root">
    <style>
      body {
        background-color: rgb(23, 42, 58);
        font-family: Open Sans, sans-serif;
        height: 90vh;
      }
      #root {
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .loading {
        font-size: 32px;
        font-weight: 200;
        color: rgba(255, 255, 255, .6);
        margin-left: 20px;
      }
      img {
        width: 78px;
        height: 78px;
      }
      .title {
        font-weight: 400;
      }
    </style>
    <img src="//cdn.jsdelivr.net/npm/graphql-playground-react/build/logo.png" alt="">
    <div class="loading"> Loading
      <span class="title">GraphQL Playground</span>
    </div>
  </div>
  <script>
    window.addEventListener('load', function (event) {
      GraphQLPlayground.init(document.getElementById('root'), {
        endpoint: '${req.protocol}://${req.hostname}:${this.configService.get('PORT', 4000)}/api/graphql',
        settings: {
          'editor.theme': 'dark',
          'editor.fontSize': 14,
          'editor.fontFamily': '"Source Code Pro", "Consolas", "Inconsolata", "Droid Sans Mono", "Monaco", monospace',
          'editor.reuseHeaders': true,
          'tracing.hideTracingResponse': false,
          'queryPlan.hideQueryPlanResponse': false,
          'editor.cursorShape': 'line',
          'request.credentials': 'include',
        },
        tabs: [
          {
            name: 'Welcome to API Gateway',
            query: \`# Welcome to the API Gateway GraphQL Playground!
#
# This is a federated GraphQL API that combines:
# - User Service (user management and authentication)
# - Chat Service (messaging and conversations)
#
# Try these example queries:

# 1. Schema introspection
{
  __schema {
    types {
      name
      kind
    }
  }
}

# 2. Get available query types
{
  __schema {
    queryType {
      fields {
        name
        description
      }
    }
  }
}

# 3. Example federation query (when services are ready)
# {
#   users {
#     id
#     username
#     conversations {
#       id
#       title
#     }
#   }
# }\`,
            variables: '{}',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        ]
      })
    })
  </script>
</body>
</html>`;

    reply.type('text/html').send(playgroundHtml);
  }

  /**
   * Get GraphQL schema documentation
   */
  @Get('graphql-dev/docs')
  async getDocumentation(
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    if (!this.developmentToolsService.isDevelopmentMode()) {
      reply.code(404).send({ error: 'Not found' });
      return;
    }

    this.developmentToolsService.logDevelopmentAccess('documentation');

    const documentation = {
      title: 'API Gateway GraphQL Documentation',
      description:
        'Development documentation for the Apollo Federation Gateway',
      version: this.configService.get<string>('APP_VERSION', '1.0.0'),
      environment: this.configService.get<string>('NODE_ENV'),
      services: {
        'user-service': {
          url: this.configService.get<string>('USER_SERVICE_GRAPHQL_URL'),
          description: 'User management and authentication service',
        },
        'chat-service': {
          url: this.configService.get<string>('CHAT_SERVICE_GRAPHQL_URL'),
          description: 'Chat and messaging service',
        },
      },
      federation: {
        enabled: true,
        gateway: 'Apollo Federation v2',
        introspection:
          this.configService.get<string>('GRAPHQL_INTROSPECTION') === 'true',
        playground:
          this.configService.get<string>('GRAPHQL_PLAYGROUND') === 'true',
      },
      schemaDocumentation:
        this.developmentToolsService.getSchemaDocumentation(),
      lastUpdated: new Date().toISOString(),
    };

    reply.type('application/json').send(documentation);
  }

  /**
   * Get example queries for GraphQL Playground
   */
  @Get('graphql-dev/examples')
  async getExamples(
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    if (!this.developmentToolsService.isDevelopmentMode()) {
      reply.code(404).send({ error: 'Not found' });
      return;
    }

    this.developmentToolsService.logDevelopmentAccess('examples');

    const examples = {
      queries: this.developmentToolsService.getExampleQueries(),
      variables: this.developmentToolsService.getExampleVariables(),
      headers: this.developmentToolsService.getDevelopmentHeaders(),
      usage: {
        description:
          'Copy these examples into GraphQL Playground to test the API',
        playground_url: `${req.protocol}://${req.hostname}:${this.configService.get('PORT', 4000)}/graphql`,
        authentication: 'Include Authorization header with valid JWT token',
      },
    };

    reply.type('application/json').send(examples);
  }

  /**
   * Get playground configuration
   */
  @Get('graphql-dev/playground-config')
  async getPlaygroundConfig(
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    if (!this.developmentToolsService.isDevelopmentMode()) {
      reply.code(404).send({ error: 'Not found' });
      return;
    }

    this.developmentToolsService.logDevelopmentAccess('playground-config');

    const config = this.developmentToolsService.getPlaygroundConfig();
    reply.type('application/json').send(config);
  }

  /**
   * Get federation schema information
   */
  @Get('graphql-dev/federation')
  async getFederationInfo(
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    if (!this.developmentToolsService.isDevelopmentMode()) {
      reply.code(404).send({ error: 'Not found' });
      return;
    }

    this.developmentToolsService.logDevelopmentAccess('federation-info');

    const federationInfo = {
      gateway: {
        type: 'Apollo Federation Gateway',
        version: '2.x',
        port: this.configService.get<number>('PORT', 4000),
        endpoint: '/graphql',
      },
      subgraphs: [
        {
          name: 'user-service',
          url: this.configService.get<string>('USER_SERVICE_GRAPHQL_URL'),
          status: 'active', // This could be enhanced with actual health checks
          entities: ['User', 'UserRelationship'],
        },
        {
          name: 'chat-service',
          url: this.configService.get<string>('CHAT_SERVICE_GRAPHQL_URL'),
          status: 'active', // This could be enhanced with actual health checks
          entities: ['Conversation', 'Message'],
        },
      ],
      features: {
        introspection:
          this.configService.get<string>('GRAPHQL_INTROSPECTION') === 'true',
        playground:
          this.configService.get<string>('GRAPHQL_PLAYGROUND') === 'true',
        tracing: this.configService.get<string>('NODE_ENV') === 'development',
        caching: true,
        authentication: true,
      },
      development: {
        hot_reload: true,
        schema_polling: '30 seconds',
        error_details: true,
        query_complexity_limit: this.configService.get<number>(
          'QUERY_COMPLEXITY_LIMIT',
          2000,
        ),
        query_depth_limit: this.configService.get<number>(
          'QUERY_DEPTH_LIMIT',
          15,
        ),
      },
    };

    reply.type('application/json').send(federationInfo);
  }

  /**
   * Get development tools index page
   */
  @Get('graphql-dev')
  async getIndex(
    @Req() req: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    if (!this.developmentToolsService.isDevelopmentMode()) {
      reply.code(404).send({ error: 'Not found' });
      return;
    }

    this.developmentToolsService.logDevelopmentAccess('index');

    const baseUrl = `${req.protocol}://${req.hostname}:${this.configService.get('PORT', 4000)}`;

    const indexPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Gateway - Development Tools</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 2px solid #007acc; padding-bottom: 10px; }
        h2 { color: #555; margin-top: 30px; }
        .tool-link { display: inline-block; margin: 10px 15px 10px 0; padding: 10px 20px; background: #007acc; color: white; text-decoration: none; border-radius: 5px; }
        .tool-link:hover { background: #005a9e; }
        .description { color: #666; margin: 10px 0; }
        .endpoint { background: #f8f8f8; padding: 15px; border-left: 4px solid #007acc; margin: 10px 0; font-family: monospace; }
        .status { color: #28a745; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 API Gateway Development Tools</h1>
        <p class="status">Status: Development Mode Active</p>
        
        <h2>🎮 GraphQL Playground</h2>
        <p class="description">Interactive GraphQL IDE for testing queries and mutations</p>
        <a href="${baseUrl}/graphql" class="tool-link">Open GraphQL Playground</a>
        
        <h2>📚 Documentation & Examples</h2>
        <p class="description">API documentation, example queries, and federation information</p>
        <a href="${baseUrl}/graphql-dev/docs" class="tool-link">API Documentation</a>
        <a href="${baseUrl}/graphql-dev/examples" class="tool-link">Query Examples</a>
        <a href="${baseUrl}/graphql-dev/federation" class="tool-link">Federation Info</a>
        
        <h2>🔧 Development Endpoints</h2>
        <div class="endpoint">
            <strong>GraphQL Endpoint:</strong> ${baseUrl}/graphql<br>
            <strong>Health Check:</strong> ${baseUrl}/health<br>
            <strong>Service Status:</strong> ${baseUrl}/health/detailed
        </div>
        
        <h2>🏗️ Federated Services</h2>
        <div class="endpoint">
            <strong>User Service:</strong> ${this.configService.get<string>('USER_SERVICE_GRAPHQL_URL')}<br>
            <strong>Chat Service:</strong> ${this.configService.get<string>('CHAT_SERVICE_GRAPHQL_URL')}
        </div>
        
        <h2>⚙️ Configuration</h2>
        <div class="endpoint">
            <strong>Environment:</strong> ${this.configService.get<string>('NODE_ENV')}<br>
            <strong>Port:</strong> ${this.configService.get<string>('PORT', '4000')}<br>
            <strong>Introspection:</strong> ${this.configService.get<string>('GRAPHQL_INTROSPECTION', 'true')}<br>
            <strong>Playground:</strong> ${this.configService.get<string>('GRAPHQL_PLAYGROUND', 'true')}
        </div>
        
        <p style="margin-top: 40px; color: #999; font-size: 14px;">
            ⚠️ These development tools are only available in development mode.
        </p>
    </div>
</body>
</html>`;

    reply.type('text/html').send(indexPage);
  }
}
