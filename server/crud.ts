import type { WSContext } from "hono/helpers";
import { DeleteRequest, GetRequest, GetRequestType, ListRequest, SetRequest, UpdateRequest, type DeleteRequestType, type GetResponseType, type SetRequestType, type UpdateRequestType } from "./types.ts";
import { kv } from "./main.ts";
import type { DeleteResponseType, ListRequestType, ListResponseType } from "./types.ts";

export async function get(wsMessage: unknown , ws: WSContext<WebSocket>, requestId: string) {
    // decode message
    let body : GetRequestType;
    try {
        body = GetRequest.parse(wsMessage);
    // deno-lint-ignore no-explicit-any
    } catch (error: any) {
        ws.send(JSON.stringify({ error: error.toString(), requestId }));
        return;
    }

    const value = await kv.get(body.path)
    ws.send(JSON.stringify({ requestId, value } as GetResponseType))
}

export async function list(wsMessage: unknown, ws: WSContext<WebSocket>, requestId: string) {
    // decode message
    let body : ListRequestType;
    try {
        body = ListRequest.parse(wsMessage);
    // deno-lint-ignore no-explicit-any
    } catch (error: any) {
        ws.send(JSON.stringify({ error: error.toString(), requestId }));
        return;
    }

    // if there is no end, return all keys with the prefix body.start
    if (!body.end) {
        const value = await Array.fromAsync(await kv.list({ prefix: body.start }));
        console.log(value, 123123)
        ws.send(JSON.stringify({ requestId, value } as ListResponseType))
        return;
    }

    // if start and end are provided, return keys between start and end
    if (body.start && body.end) {
        const value = await Array.fromAsync(await kv.list({ start: body.start, end: body.end }));
        ws.send(JSON.stringify({ requestId, value } as ListResponseType))
        return;
    }
}

export async function set(wsMessage: unknown, ws: WSContext<WebSocket>, requestId: string) {
    // decode message
    let body: SetRequestType;
    try {
        body = SetRequest.parse(wsMessage);
    // deno-lint-ignore no-explicit-any
    } catch (error: any) {
        ws.send(JSON.stringify({ error: error.toString(), requestId }));
        return;
    }

    await kv.set(body.query.path, body.value)
    ws.send(JSON.stringify({ requestId: requestId } as GetResponseType))
}

export async function update(wsMessage: unknown, ws: WSContext<WebSocket>, requestId: string) {
    // decode message
    let body: UpdateRequestType;
    try {
        body = UpdateRequest.parse(wsMessage);
    // deno-lint-ignore no-explicit-any
    } catch (error: any) {
        ws.send(JSON.stringify({ error: error.toString(), requestId }));
        return;
    }

    // get current value
    const currentValue = await kv.get(body.query.path)
    const newValue = { ...currentValue, ...body.value }
    await kv.set(body.query.path, newValue)
    ws.send(JSON.stringify({ requestId: requestId } as GetResponseType))
}

export async function delete_(wsMessage: unknown, ws: WSContext<WebSocket>, requestId: string) {
    // decode message
    let body : DeleteRequestType;
    // deno-lint-ignore no-explicit-any
    try {
        body = DeleteRequest.parse(wsMessage);
    } catch (error: any) {
        ws.send(JSON.stringify({ error: error.toString(), requestId }));
        return;
    }

    await kv.delete(body.query.path)
    ws.send(JSON.stringify({ requestId: requestId } as DeleteResponseType))
}

