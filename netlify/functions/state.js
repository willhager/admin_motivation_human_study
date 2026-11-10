import { ObjectId } from "mongodb";
import { getClientPromise } from "./lib/mongo.js";

const sendJson = (statusCode, body) => ({
  statusCode,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

const STATE_ID = new ObjectId("6ad678f761b961446f4150af");

export const handler = async (event) => {
  const method = event.httpMethod;

  try {
    const client = await getClientPromise();
    const collection = client.db("human_study_website").collection("state");

    if (method === "GET") {
      const state = await collection.findOne({ _id: STATE_ID });
      if (!state) return sendJson(404, { error: "State object not found." });
      return sendJson(200, state);
    }

    if (method === "PATCH") {
      let body = {};
      try {
        body = event.body ? JSON.parse(event.body) : {};
      } catch {
        return sendJson(400, { error: "Invalid JSON." });
      }

      if (body.action === "uid") {
        const { uID } = body;
        if (typeof uID !== "string" || !uID.trim()) {
          return sendJson(400, { error: "uID is required." });
        }

        const updated = await collection.findOneAndUpdate(
          { _id: STATE_ID },
          [
            { $set: { arrivedIDs: { $setUnion: [{ $ifNull: ["$arrivedIDs", []] }, [uID]] } } },
            { $set: { arrived: { $size: "$arrivedIDs" } } },
          ],
          { returnDocument: "after" }
        );
        const doc = updated?.value ?? updated;
        if (!doc) return sendJson(404, { error: "State object not found." });
        return sendJson(200, doc);
      }

      if (body.action === "inConversation") {
        const { inConversation } = body;
        if (typeof inConversation !== "boolean") {
          return sendJson(400, { error: "inConversation (boolean) is required." });
        }

        const updated = await collection.findOneAndUpdate(
          { _id: STATE_ID },
          { $set: { inConversation } },
          { returnDocument: "after" }
        );
        const doc = updated?.value ?? updated;
        if (!doc) return sendJson(404, { error: "State object not found." });
        return sendJson(200, doc);
      }

      if (body.action === "active") {
        const {active} = body;
        if (typeof active !== "boolean") {
          return sendJson(400, { error: "active (boolean) is required."});
        }

        const updated = await collection.findOneAndUpdate(
          {_id: STATE_ID},
          { $set: {active} },
          {returnDocument: "after"}
        );
        const doc = updated?.value ?? updated;
        if (!doc) return sendJson(404, {error: "State object not found"});
        return sendJson(200, doc)
      }

      if (body.action === "participants") {
        const {participants} = body;

        const updated = await collection.findOneAndUpdate(
          {_id: STATE_ID},
          { $set: {participants} },
          {returnDocument: "after"}
        );
        const doc = updated?.value ?? updated;
        if (!doc) return sendJson(404, {error: "State object not found"});
        return sendJson(200, doc)
      }

      if (body.action === "indemographic") {
        const {inDemographic} = body;
        if (typeof inDemographic !== "boolean") {
          return sendJson(400, { error: "active (boolean) is required."});
        }

        const updated = await collection.findOneAndUpdate(
          {_id: STATE_ID},
          { $set: {inDemographic} },
          {returnDocument: "after"}
        );
        const doc = updated?.value ?? updated;
        if (!doc) return sendJson(404, {error: "State object not found"});
        return sendJson(200, doc)
      }

      if (body.action === "newstudy") {
        const updated = await collection.findOneAndUpdate(
          {_id: STATE_ID},
          { $set: {
            policy: body.policy,
            condition: body.condition,
            participants: body.participants,
            arrived: body.arrived,
            arrivedIDs: body.arrivedIDs,
            inDemographic: body.inDemographic,
            inConversation: body.inConversation,
            id: body.id
          }},
          {returnDocument: "after"}
        );
        const doc = updated?.value ?? updated;
        if (!doc) return sendJson(404, {error: "State object not found"});
        return sendJson(200, doc);
      }

      return sendJson(400, { error: "Unknown action." });
    }

    return sendJson(405, { error: `Method ${method} not allowed.` });
  } catch (error) {
    console.error(error);
    return sendJson(500, { error: `Failed to ${method} state.` });
  }
};