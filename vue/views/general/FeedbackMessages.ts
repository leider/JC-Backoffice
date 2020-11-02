type Variant = "danger" | "success";

export interface FeedbackMessage {
  variant: Variant;
  title: string;
  text: string;
}

class FeedbackMessages {
  notificationFunction?: (feedback: FeedbackMessage) => void;

  addError(title: string, text: string): void {
    if (this.notificationFunction) {
      this.notificationFunction({ variant: "danger", title, text });
    }
  }

  addSuccess(title: string, text: string): void {
    if (this.notificationFunction) {
      this.notificationFunction({ variant: "success", title, text });
    }
  }
}

export const feedbackMessages = new FeedbackMessages();
