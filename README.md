# Pubsub Deadletter Republisher

This repo is a cloud function which can be invoked to pull messages from a dead-letter topic and re-publish them to another topic for
processing.

This work is inspired by [Roger Beaman's gcp-pubsub-republish](https://github.com/sirrodgepodge/gcp-pubsub-republish)

It includes:

- Pre built tests using mocha and chai to get started easily.
- Hosting the function locally on port 8080.
- Cloudbuild yaml file for easy integration to continuous delivery if required.
- Github Actions for testing and branch status checks on PR merges.

Requires Node v20 or higher.

## Usage

Once you've deployed your function, call it like so:

```bash
curl -X POST https://<REGION>-<PROJECT_ID>.cloudfunctions.net/republisher \
  -H "Authorization: bearer $(gcloud auth print-identity-token)" \
  -H "Content-Type: application/json" \
  -d '{"subscriptionName": "projects/<PROJECT_ID>/subscriptions/test-queue-deadletter-sub","topicName": "projects/<PROJECT_ID>/topics/test-queue"}'
```

With an output:

```
Successfully republished 266 messages. Process took 7.938 seconds
```

## Notes on usage in Cloud at scale

If you're intending to use this at significant scale, then I would encourage you to consider increasing your memory and CPU count.

At a rough run of a few different instance types, I found that at 128MB (the smallest instance size), with 0.083 vCPUs I got this return
message:

```
Successfully republished 266 messages. Process took 26.84 seconds
```

However, running the same process with 1GB and 1vCPU memory yielded at 7.93 second response time:

```
Successfully republished 266 messages. Process took 7.938 seconds
```

If you're planning to process thousands of messages (or more!), make sure your timeout is long enough, and you can optionally run the same
`curl` call in multiple terminal windows for parallel processing!

You may wish to also consider reviewing the messages before replaying them with message contents and run the message through your code as a
sample test to validate that there aren't bugs with the code! Otherwise your message will just end up back in the dead letter queue in an
infinite loop.

### Local hosting

`npm start` will kick up the server and host your code on port 8080.

You can then run something like:

```bash
curl -X POST http://localhost:8080 \
  -H "Content-Type: application/json" \
  -d '{"subscriptionName": "projects/<PROJECT_ID>/subscriptions/test-queue-deadletter-sub","topicName": "projects/<PROJECT_ID>/topics/test-queue"}'
```

To see how your function would respond once deployed.

### Testing

`npm test` will run all tests in the /tests folder.
