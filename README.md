# Pubsub Deadletter Republisher

This repo is a cloud function which can be invoked to pull messages from a dead-letter topic and re-publish them to another topic for
processing.

This work is inspired by [Roger Beaman's gcp-pubsub-republish](https://github.com/sirrodgepodge/gcp-pubsub-republish)

It includes:

- Pre built tests using mocha and chai to get started easily.
- Hosting the function locally on port 8080.
- Cloudbuild yaml file for easy integration to continuous delivery if required.
- Github Actions for testing and branch status checks on PR merges.

## Usage

### Local hosting

`npm start` will kick up the server and host your code on port 8080.

You can then run something like:

```bash
curl -X POST -H "Content-Type: application/json" \
    -d '{"message": "Hello my friend"}' \
    http://localhost:8080
```

To see how your function would respond once deployed.

### Testing

`npm test` will run all tests in the /tests folder.
