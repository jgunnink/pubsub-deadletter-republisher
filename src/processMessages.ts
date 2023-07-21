// This code has been adapted from https://github.com/sirrodgepodge/gcp-pubsub-republish/blob/cf9237ce574ac12b3f8d18c3d1413359ccacd738/index.ts

import { PubSub, Message } from "@google-cloud/pubsub";

export interface RepublishMessagesOptions {
  subscriptionName: string;
  topicName: string;
  timeout?: number;
  maxSimultaneousMessages?: number;
}

const pubSubClient = new PubSub({});

// main function to publish messages from a subscription to a topic
export async function republishMessages(
  subscriptionName: string,
  topicName: string,
  timeout = 3000,
  maxSimultaneousMessages = 20,
): Promise<void> {
  await pullFromSubscriptionAndProcess(
    subscriptionName,
    async (message: Message) => {
      await publishToTopic(topicName, message);
    },
    timeout,
    maxSimultaneousMessages,
  );
}

// there's no API to explicitly pull all messages enqueued in the subscription
// we must instead poll via subscribing as the code below does
async function pullFromSubscriptionAndProcess(
  subscriptionName: string,
  processMessage: (message: Message) => Promise<void>,
  timeout = 3000,
  maxSimultaneousMessages = 20,
): Promise<void> {
  let mostRecentMessageTimestamp = 0;

  const processingMessageIds = new Set<string>();
  const subscription = pubSubClient.subscription(subscriptionName, {
    flowControl: { maxMessages: maxSimultaneousMessages },
  });
  subscription.on("message", async (message: Message) => {
    try {
      console.info(`Received message ${message.id}`);
      mostRecentMessageTimestamp = Date.now();
      processingMessageIds.add(message.id);
      await processMessage(message);
      message.ack();
      console.info(`Processed message ${message.id}`);
    } catch (err) {
      console.error(`Error processing message ${message.id}: ${err}`);
      message.nack();
    } finally {
      processingMessageIds.delete(message.id);
    }
  });

  // initial wait
  await new Promise(resolve => setTimeout(resolve, timeout));

  // wait for the timeout time to be hit since the last message
  // was received, also wait for all message processing to finish,
  // then finish and close the subscription
  while (getTimeSinceMostRecent() < timeout || processingMessageIds.size > 0) {
    await new Promise(resolve => setTimeout(resolve, timeout - getTimeSinceMostRecent()));
  }
  await subscription.close();

  function getTimeSinceMostRecent() {
    return Date.now() - mostRecentMessageTimestamp;
  }
}

// ensure processing messages happens one at a time per topic, otherwise we hit a rate limit with GCP
const promiseQueueMap = new Map<string, Promise<void>>();
async function publishToTopic(topicName: string, message: Message) {
  if (!promiseQueueMap.has(topicName)) {
    promiseQueueMap.set(topicName, Promise.resolve());
  }

  const { id, data, attributes } = message;

  const appendedPromise = promiseQueueMap.get(topicName)!.then(async () => {
    await pubSubClient.topic(topicName).publishMessage({ messageId: id, attributes, data });
  });
  promiseQueueMap.set(topicName, appendedPromise);

  await appendedPromise;
}
