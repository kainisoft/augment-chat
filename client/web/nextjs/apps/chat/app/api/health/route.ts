import { NextRequest, NextResponse } from 'next/server';

/**
 * Health check endpoint for the Next.js frontend
 * This endpoint can be used by Docker health checks and monitoring
 */
export async function GET(request: NextRequest) {
  try {
    // Basic health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'nextjs-chat',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    // Check backend connectivity (optional)
    const backendChecks = await checkBackendServices();

    return NextResponse.json({
      ...health,
      backend: backendChecks,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        service: 'nextjs-chat',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * Check connectivity to backend services
 */
async function checkBackendServices() {
  const services = [
    {
      name: 'graphql',
      url: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
    },
    {
      name: 'auth',
      url: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:4002',
    },
  ];

  const checks = await Promise.allSettled(
    services.map(async (service) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(`${service.url}/health`, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        });

        clearTimeout(timeoutId);

        return {
          name: service.name,
          status: response.ok ? 'healthy' : 'unhealthy',
          url: service.url,
          responseTime: Date.now(),
        };
      } catch (error) {
        return {
          name: service.name,
          status: 'unreachable',
          url: service.url,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    })
  );

  return checks.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value;
    } else {
      return {
        name: services[index].name,
        status: 'error',
        url: services[index].url,
        error: result.reason?.message || 'Check failed',
      };
    }
  });
}
