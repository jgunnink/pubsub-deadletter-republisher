import { expect } from "chai";
import * as sinon from "sinon";
import { republish } from "../src/index";
import { Request, Response } from "express";
import { RepublishMessagesOptions } from "../src/processMessages";
import * as republishMessagesFile from "../src/processMessages";

const testBody: RepublishMessagesOptions = {
  subscriptionName: "test-subscription",
  topicName: "test-topic",
};

describe("republish handler", () => {
  it("should return a 201 response", async () => {
    const mockRepublishMessages = sinon.mock(republishMessagesFile);
    const req = { body: testBody };
    const res = { status: sinon.stub(), send: sinon.stub() };
    res.status.returns(res);
    mockRepublishMessages
      .expects("republishMessages")
      .once()
      .withArgs(testBody.subscriptionName, testBody.topicName, undefined, undefined)
      .resolves();

    await republish(req as Request, res as unknown as Response);

    mockRepublishMessages.verify();

    expect(res.status.calledOnceWith(201)).to.be.true;
  });

  it("should return a 400 response if subscriptionName is not provided", async () => {
    const mockRepublishMessages = sinon.mock(republishMessagesFile);
    const req = { body: { topicName: testBody.topicName } };
    const res = { status: sinon.stub(), send: sinon.stub() };
    res.status.returns(res);
    mockRepublishMessages.expects("republishMessages").never();

    await republish(req as Request, res as unknown as Response);

    mockRepublishMessages.verify();

    expect(res.status.calledOnceWith(400)).to.be.true;
  });

  it("should return a 400 response if topicName is not provided", async () => {
    const mockRepublishMessages = sinon.mock(republishMessagesFile);
    const req = { body: { subscriptionName: testBody.subscriptionName } };
    const res = { status: sinon.stub(), send: sinon.stub() };
    res.status.returns(res);
    mockRepublishMessages.expects("republishMessages").never();

    await republish(req as Request, res as unknown as Response);

    mockRepublishMessages.verify();

    expect(res.status.calledOnceWith(400)).to.be.true;
  });

  it("should return a 500 response if republishMessages throws an error", async () => {
    const mockRepublishMessages = sinon.mock(republishMessagesFile);
    const req = { body: testBody };
    const res = { status: sinon.stub(), send: sinon.stub() };
    res.status.returns(res);
    mockRepublishMessages
      .expects("republishMessages")
      .once()
      .withArgs(testBody.subscriptionName, testBody.topicName, undefined, undefined)
      .rejects("test error");

    await republish(req as Request, res as unknown as Response);

    mockRepublishMessages.verify();

    expect(res.status.calledOnceWith(500)).to.be.true;
  });
});
