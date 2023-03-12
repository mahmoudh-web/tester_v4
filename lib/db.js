import * as dotenv from "dotenv"
dotenv.config()

import { MongoClient } from "mongodb"

const database = () => {
	const client = new MongoClient(process.env.DATABASE_URL)
	const db = client.db("binance")

	return { client, db }
}

export { database }
