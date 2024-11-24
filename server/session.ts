import type { WSContext } from "hono/helper";
import {z} from "zod";
import { WSMessage, WSMessageTypeEnum } from "./types.ts";
import { delete_, get, list, set, update } from "./crud.ts";
import { watchChanges } from "./listeners.ts";

export const onMessage = (event: MessageEvent, ws: WSContext<WebSocket>) => {
    console.log('data', event.data);
    const wsMessage = WSMessage.parse(JSON.parse(event.data));
    const requestId = wsMessage.requestId;

    // TODO: auth and rules engine to check if user can perform action
    switch (wsMessage.type) {
        case WSMessageTypeEnum.Values.subscribe:
            console.log("subscribe", wsMessage);
            watchChanges(wsMessage.payload, ws, requestId);
            break;
        case WSMessageTypeEnum.Values.get:
            console.log("get", wsMessage);
            get(wsMessage.payload, ws, requestId);
            break;
        case WSMessageTypeEnum.Values.list:
            console.log("list", wsMessage);
            list(wsMessage.payload, ws, requestId);
            break
        case WSMessageTypeEnum.Values.set:
            console.log("set", wsMessage);
            set(wsMessage.payload, ws, requestId);
            break;
        case WSMessageTypeEnum.Values.update:
            console.log("update", wsMessage);
            update(wsMessage.payload, ws, requestId);
            break;
        case WSMessageTypeEnum.Values.delete:
            console.log("delete", wsMessage);
            delete_(wsMessage.payload, ws, requestId);
            break;
        default:
            console.error("Unknown message type", wsMessage);
            ws.send(JSON.stringify({ error: "Unknown message type" }));
            break;
    }
};