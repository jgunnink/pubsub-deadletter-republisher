import { Request, Response } from "express";
import { RepublishMessagesOptions, republishMessages } from "./processMessages";

export const republish = (req: Request, res: Response) => {
  var timer = Date.now();
  console.log("Processor started with process ID: ", timer);
  const args: RepublishMessagesOptions = {
    subscriptionName: req.body.subscriptionName,
    topicName: req.body.topicName,
    timeout: req.body.timeout || undefined,
    maxSimultaneousMessages: req.body.maxSimultaneousMessages || undefined,
  };

  if (!args.subscriptionName || !args.topicName) {
    res.status(400).send("subscriptionName and topicName are required");
    console.log("Processor finished with process ID: ", timer);
  } else {
    republishMessages(args.subscriptionName, args.topicName, args.timeout, args.maxSimultaneousMessages)
      .then(count => {
        console.info(`Successfully republished ${count} messages`);
        timer = (Date.now() - timer) / 1000;
        if (count === 0) {
          res.status(200).send(`No messages to republish. Process took ${timer} seconds \n`);
        } else {
          res.status(202).send(`Successfully republished ${count} messages. Process took ${timer} seconds \n`);
        }
      })
      .catch(err => {
        console.error("Something went wrong processing messages. Error: ", err, ". Process ID: ", timer);
        res.status(500).send(err);
      })
      .finally(() => {
        console.log("Processor finished with process ID: ", timer);
      });
  }
};
