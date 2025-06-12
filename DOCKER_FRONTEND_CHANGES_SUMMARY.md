# Docker Frontend Configuration Changes Summary

## Overview
This document summarizes the changes made to update the Next.js frontend Docker configuration with new port allocation and renamed applications.

## Changes Made

### 1. Port Allocation Updates
**Previous Configuration:**
- Next.js Web App: Port 3000
- Next.js Docs App: Port 3001
- Grafana: Port 3002 (moved to avoid conflict)

**New Configuration:**
- Next.js Chat App: Port 5100 (external), 5000 (internal)
- Next.js Docs App: Port 5101 (external), 5001 (internal)
- Grafana: Port 3001 (back to original)

### 2. Application Renaming
**Previous Structure:**
```
client/web/nextjs/apps/web/     # Main web application
```

**New Structure:**
```
client/web/nextjs/apps/chat/    # Main chat application
```

## Files Modified

### Directory Structure Changes
1. **Renamed Directory:**
   - `client/web/nextjs/apps/web/` → `client/web/nextjs/apps/chat/`

2. **Renamed Docker Files:**
   - `docker/Dockerfiles/nextjs-web.Dockerfile` → `docker/Dockerfiles/nextjs-chat.Dockerfile`
   - `docker/config/nextjs-web/` → `docker/config/nextjs-chat/`
   - `docker/config/nextjs-web/nextjs-web.env` → `docker/config/nextjs-chat/nextjs-chat.env`

### Configuration File Updates

#### Package.json Files
1. **client/web/nextjs/apps/chat/package.json**
   - Changed name from "web" to "chat"
   - Updated dev script port from 3000 to 5000

2. **client/web/nextjs/apps/docs/package.json**
   - Updated dev script port from 3001 to 5001

#### Docker Configuration
3. **docker/Dockerfiles/nextjs-chat.Dockerfile**
   - Updated package.json copy paths (web → chat)
   - Changed exposed ports (3000 → 5000, 3001 → 5001)
   - Updated working directory (apps/web → apps/chat)

4. **docker-compose.yml**
   - Renamed service: nextjs-web → nextjs-chat
   - Updated Dockerfile path
   - Changed port mappings (3000:3000 → 5100:5000, 3001:3001 → 5101:5001)
   - Updated environment file path
   - Changed volume name (nextjs-web-node-modules → nextjs-chat-node-modules)
   - Updated health check port (3000 → 5000)
   - Reverted Grafana port (3002 → 3001)

#### Environment Configuration
5. **docker/config/nextjs-chat/nextjs-chat.env**
   - Updated NEXTAUTH_URL from localhost:3000 to localhost:5100

6. **client/web/nextjs/apps/chat/.env.docker**
   - Added PORT=5000 configuration

#### Development Scripts
7. **docker/scripts/dev.sh**
   - Added "chat" as alias for frontend commands
   - Updated build commands to use nextjs-chat service
   - Added help text for chat commands

8. **docker/scripts/test-frontend.sh**
   - Updated required files paths (web → chat)
   - Changed service name checks (nextjs-web → nextjs-chat)
   - Updated port checks (3000 → 5000)
   - Updated volume name checks
   - Updated URL references in output

#### Documentation Updates
9. **README Files**
   - **client/web/nextjs/README.md**: Updated app descriptions
   - **client/web/nextjs/apps/chat/README.md**: Updated localhost URL
   - **client/web/nextjs/apps/docs/README.md**: Updated localhost URL

10. **docker/README-FRONTEND.md**
    - Updated architecture diagram
    - Changed all port references
    - Updated service names and paths
    - Updated troubleshooting commands

11. **docker/README.md**
    - Updated Dockerfile references
    - Updated configuration directory references

#### Application Code
12. **client/web/nextjs/apps/chat/app/page.tsx**
    - Updated port display (3000 → 5000)
    - Updated service links (Grafana 3002 → 3001, Docs 3001 → 5001)

13. **client/web/nextjs/apps/chat/app/api/health/route.ts**
    - Updated service name (nextjs-web → nextjs-chat)

14. **client/web/nextjs/NEXTJS_IMPLEMENTATION_PLAN.md**
    - Updated development server comment

## New Access Points

After these changes, the applications are accessible at:

- **Next.js Chat Application**: http://localhost:5100
- **Next.js Documentation**: http://localhost:5101
- **GraphQL Playground**: http://localhost:4000/graphql
- **WebSocket Gateway**: ws://localhost:4001
- **Grafana Dashboard**: http://localhost:3001

## Development Commands

All existing development commands continue to work, with additional aliases:

```bash
# Start frontend (all these commands are equivalent)
./docker/scripts/dev.sh frontend
./docker/scripts/dev.sh web
./docker/scripts/dev.sh chat

# Build frontend (all these commands are equivalent)
./docker/scripts/dev.sh build:frontend
./docker/scripts/dev.sh build:web
./docker/scripts/dev.sh build:chat

# View logs
./docker/scripts/dev.sh logs nextjs-chat

# Test setup
./docker/scripts/test-frontend.sh
```

## Benefits of Changes

1. **Port Conflict Resolution**: Moving to 5000+ range avoids conflicts with common development tools
2. **Clear Naming**: "chat" better reflects the application's purpose
3. **Grafana Accessibility**: Restored to standard port 3001
4. **Backward Compatibility**: Existing commands still work with aliases
5. **Consistent Documentation**: All references updated for clarity

## Verification

To verify the changes work correctly:

1. Run the test script: `./docker/scripts/test-frontend.sh`
2. Start the services: `./docker/scripts/dev.sh chat`
3. Access the applications at the new URLs
4. Confirm hot reload functionality works
5. Verify backend connectivity through health checks

The implementation maintains all existing functionality while providing clearer naming and better port allocation.
