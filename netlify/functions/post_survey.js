import { ObjectId } from 'mongodb';

import { getClientPromise } from './lib/mongo.js';

const sendJson = (statusCode, body) => ({
    statusCode,
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(body)
});

export const handler = async (event) => {
    const method = event.httpMethod;
    const client = await getClientPromise();
    const collection = () => client.db("human_study_website").collection("post_survey")

    try {

        if(method === "GET") {
            const items = await collection().find({}).toArray();
            return sendJson(200, items);
        }
        
        if(method === "POST"){
            const body = event.body ? JSON.parse(event.body) : {};
            const result = await collection().insertOne(body)
            return sendJson(201, result);
        }

        if(method === "DELETE"){
            const id = event.queryStringParameters?.id;
            if(!id) return sendJson(400, {error: "Missing ID query parametery"});
            await collection().deleteOne({_id : new ObjectId(id)});
            return sendJson(200, {success : true});
        }

        if (method === "PATCH") {
            const id = event.queryStringParameters?.id;
            if (!id) return sendJson(400, { error: "Missing ID query parameter" });
            const body = event.body ? JSON.parse(event.body) : {};
            const result = await collection().updateOne(
                { _id: new ObjectId(id) },
                { $set: body }
            );
            return sendJson(200, result);
        }

        return sendJson(405, {error: `Method ${method} not allowed.`})
    }

    catch (error){
        console.error(error);
        return sendJson(500, {error: `Failed to ${method} pages`});
    }
}
