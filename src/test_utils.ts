import type { RequestHandler } from "msw";
import * as msw from "msw/node";

export function startMockServer(handlers: RequestHandler[]): msw.SetupServer {
    const server = msw.setupServer(...handlers);
    server.listen({ onUnhandledRequest: "error" });
    return server;
}
