import { createClient } from "redis";

const initialQuestions = await createClient({
    url: `redis://rdb:6379/1`
})
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

const remainingQuestions = await createClient({
    url: `redis://rdb:6379/2`
})
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();

export {initialQuestions, remainingQuestions}