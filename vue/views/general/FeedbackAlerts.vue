<template lang="pug">
div
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { FeedbackMessage, feedbackMessages } from "@/views/general/FeedbackMessages";

@Component
export default class FeedbackAlerts extends Vue {
  messages = feedbackMessages;

  mounted() {
    this.messages.notificationFunction = (feedback: FeedbackMessage) => {
      this.$bvToast.toast(feedback.text || "---", {
        title: feedback.title,
        variant: feedback.variant,
      });
    };
  }
}
</script>
