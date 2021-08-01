type Variant = "danger" | "success" | "warning";

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

  addWarning(title: string, text: string): void {
    if (this.notificationFunction) {
      this.notificationFunction({ variant: "warning", title, text });
    }
  }

  addSuccess(title: string, text: string): void {
    if (this.notificationFunction) {
      this.notificationFunction({ variant: "success", title, text });
    }
  }
}

export const feedbackMessages = new FeedbackMessages();
