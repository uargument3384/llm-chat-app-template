import { Env } from "./types";

const MODEL_ID = "@cf/meta/llama-3.1-8b-instruct-fp8";

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		if (request.method === "OPTIONS") {
			return new Response(null, {
				headers: {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "POST, OPTIONS",
					"Access-Control-Allow-Headers": "Content-Type",
				},
			});
		}

		const url = new URL(request.url);

		if (url.pathname === "/api/chat" && request.method === "POST") {
			try {
				const { messages } = await request.json() as any;
				
				const systemPrompt = "You are a helpful assistant. Use Markdown for formatting.";
				const inputMessages = [
					{ role: "system", content: systemPrompt },
					...messages
				];

				const stream = await env.AI.run(MODEL_ID, {
					messages: inputMessages,
					stream: true,
				});

				return new Response(stream, {
					headers: {
						"content-type": "text/event-stream",
						"cache-control": "no-cache",
						"connection": "keep-alive",
						"Access-Control-Allow-Origin": "*",
					},
				});
			} catch (e: any) {
				return new Response(JSON.stringify({ error: e.message }), { 
					status: 500,
					headers: { "Access-Control-Allow-Origin": "*" }
				});
			}
		}

		return env.ASSETS.fetch(request);
	},
};
