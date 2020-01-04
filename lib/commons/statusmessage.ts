import express from "express";

class StatusMessage {
  private req?: express.Request;
  type: string;
  title: string;
  text: string;
  additionalArguments?: string;

  constructor(type: string, title: string, text: string, additionalArguments?: string) {
    this.type = type;
    this.title = title;
    this.text = text;
    this.additionalArguments = additionalArguments;
  }

  kill(): void {
    if (this.req && this.req.session) {
      delete this.req.session.statusmessage;
    }
  }

  putIntoSession(req: express.Request, res?: express.Response): void {
    if (!req.session) {
      return;
    }
    if (!req.session.statusmessage) {
      req.session.statusmessage = this;
    }
    if (res) {
      this.req = req;
      res.locals.statusmessage = this;
    }
  }
}

function statusMessage(type: string, title: string, text: string, additionalArguments?: string): StatusMessage {
  return new StatusMessage(type, title, text, additionalArguments);
}

export default {
  fromObject: function fromObject(object: { type: string; title: string; text: string; additionalArguments?: string }): StatusMessage {
    return statusMessage(object.type, object.title, object.text, object.additionalArguments);
  },

  errorMessage: function errorMessage(title: string, text: string, additionalArguments?: string): StatusMessage {
    return statusMessage("alert-danger", title, text, additionalArguments);
  },

  successMessage: function successMessage(title: string, text: string, additionalArguments?: string): StatusMessage {
    return statusMessage("alert-success", title, text, additionalArguments);
  }
};
