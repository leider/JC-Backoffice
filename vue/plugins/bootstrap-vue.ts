import Vue from "vue";

import { NavbarPlugin } from "bootstrap-vue/src/components/navbar";
import { NavPlugin } from "bootstrap-vue/src/components/nav";

import { ButtonPlugin } from "bootstrap-vue/src/components/button";

import { FormInputPlugin } from "bootstrap-vue/src/components/form-input";
import { FormDatepickerPlugin } from "bootstrap-vue/src/components/form-datepicker";
import { FormCheckboxPlugin } from "bootstrap-vue/src/components/form-checkbox";
import { FormFilePlugin } from "bootstrap-vue/src/components/form-file";
import { FormTextareaPlugin } from "bootstrap-vue/src/components/form-textarea";

import { CollapsePlugin } from "bootstrap-vue/src/components/collapse";

import { ModalPlugin } from "bootstrap-vue/src/components/modal";
import { TabsPlugin } from "bootstrap-vue/src/components/tabs";
import { TooltipPlugin } from "bootstrap-vue/src/components/tooltip";

import { BFormInvalidFeedback } from "bootstrap-vue/src/components/form";

import { IconsPlugin } from "bootstrap-vue/src/icons/";

Vue.use(NavbarPlugin);
Vue.use(NavPlugin);
Vue.use(ButtonPlugin);
Vue.use(FormInputPlugin);
Vue.use(FormDatepickerPlugin);
Vue.use(FormCheckboxPlugin);
Vue.use(FormFilePlugin);
Vue.use(FormTextareaPlugin);
Vue.use(CollapsePlugin);
Vue.use(ModalPlugin);
Vue.use(TabsPlugin);
Vue.use(IconsPlugin);
Vue.use(TooltipPlugin);

Vue.component("BFormInvalidFeedback", BFormInvalidFeedback);
