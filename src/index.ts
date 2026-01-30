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

				const result = await env.AI.run(MODEL_ID, {
					messages: inputMessages,
					stream: false,
					max_tokens: 4096
				});

				return new Response(JSON.stringify(result), {
					headers: {
						"content-type": "application/json",
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
