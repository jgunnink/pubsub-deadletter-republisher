import { Request, Response } from "express";
import { RepublishMessagesOptions, republishMessages } from "./processMessages";

export const republish = (req: Request, res: Response) => {
  console.log("Processor started");
  const args: RepublishMessagesOptions = {
    subscriptionName: req.body.subscriptionName,
    topicName: req.body.topicName,
    timeout: req.body.timeout || undefined,
    maxSimultaneousMessages: req.body.maxSimultaneousMessages || undefined,
  };

  if (!args.subscriptionName || !args.topicName) {
    res.status(400).send("subscriptionName and topicName are required");
    console.log("Processor finished");
  } else {
    republishMessages(args.subscriptionName, args.topicName, args.timeout, args.maxSimultaneousMessages)
      .then(count => {
        console.info(`Successfully republished ${count} messages`);
        res.status(202).send(`Successfully republished ${count} messages\n`);
      })
      .catch(err => {
        console.error(err);
        res.status(500).send(err);
      })
      .finally(() => {
        console.log("Processor finished");
      });
  }
};
