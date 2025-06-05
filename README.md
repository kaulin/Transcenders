# Transcenders

A Fastify-based TypeScript project with Docker development and production environments.

## Requirements

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- [Node.js](https://nodejs.org/) (for local development tools)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Getting Started

### Quick Start

The fastest way to get started:

```bash
# Clone the repository (if you haven't already)
git clone https://github.com/kaulin/Transcenders.git
cd Transcenders

# Install dependencies locally (for editor support)
make setup
# or manually: npm ci --include=dev

# Start the development environment
make dev
# or manually: docker compose up -d
```

Visit [http://localhost:3000/ping](http://localhost:3000/ping) to verify the server is running.

### Development Workflow

1. The development container runs with hot-reloading enabled
2. Any changes to source files will automatically restart the server
3. Use `make logs` to see real-time logs from the server
4. Use `make dev-logs` to start with visible logs

## Project Structure

## Developer Guide for Beginners

### Creating Your First Route

The project uses Fastify for route handling. Here's how to add a new route:

1. **Choose where to add your route**: You can add to an existing route file in `src/routes/` or create a new one.

2. **Example: Creating a new route file**:

```typescript
// Create a new file: src/routes/hello.routes.ts
import { FastifyInstance } from 'fastify';

interface HelloResponse {
  message: string;
  timestamp: number;
}

export async function registerHelloRoutes(app: FastifyInstance) {
  // Simple GET route
  app.get<{
    Reply: HelloResponse;
  }>('/hello', async () => {
    return {
      message: 'Hello, Transcenders!',
      timestamp: Date.now()
    };
  });

  // Route with parameters
  app.get<{
    Params: { name: string };
    Reply: HelloResponse;
  }>('/hello/:name', async (request) => {
    const { name } = request.params;
    return {
      message: `Hello, ${name}!`,
      timestamp: Date.now()
    };
  });
}
```

3. **Register your new routes in server.ts**:

```typescript
// In src/server.ts, add the import:
import { registerHelloRoutes } from './routes/hello.routes.js';

// And inside the start function, add:
registerHelloRoutes(app);
```

4. **Test your new route**: Visit http://localhost:3000/hello or http://localhost:3000/hello/YourName

## Debugging

The project is configured for debugging with VS Code. To debug your application:

1. **Ensure the development container is running**:
   ```bash
   make dev
   ```

2. **Open the VS Code debugger tab**: Click on the "Run and Debug" icon in the VS Code sidebar or press `Ctrl+Shift+D` (Windows/Linux) or `Cmd+Shift+D` (Mac)

3. **Start debugging**: Click the green play button or press F5 to start debugging using the pre-configured launch configuration

4. **Set breakpoints**: Click in the gutter next to line numbers to set breakpoints

5. **Debug features available**:
   - Use the debug console to evaluate expressions
   - Inspect variables in the VARIABLES panel
   - View the call stack in the CALL STACK panel
   - Use the debug toolbar to step through code execution

6. **Hot reloading while debugging**: The debugger will automatically reconnect when files change and the server restarts

### Remote Debugging Tips

- The development container exposes port `9229` for the Node.js debugger
- For manual debugging outside VS Code, you can access chrome://inspect or edge://inspect
- To debug from the terminal, use `docker compose exec dev node --inspect-brk=0.0.0.0:9229 dist/server.js`

## Available Commands

- `make dev`: Start the development environment
- `make build`: Build the project
- `make start`: Start the production server
- `make stop`: Stop the development or production server
- `make logs`: View logs from the server
- `make dev-logs`: Start the development server with logs visible
- `make help`: Show all make commands
