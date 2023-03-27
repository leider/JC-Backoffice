import { Vue } from "vue-property-decorator";

import { NavPlugin } from "bootstrap-vue/src/components/nav";
import { NavbarPlugin } from "bootstrap-vue/src/components/navbar";

import { ButtonPlugin } from "bootstrap-vue/src/components/button";

import { FormPlugin } from "bootstrap-vue/src/components/form";
import { FormCheckboxPlugin } from "bootstrap-vue/src/components/form-checkbox";
import { FormDatepickerPlugin } from "bootstrap-vue/src/components/form-datepicker";
import { FormFilePlugin } from "bootstrap-vue/src/components/form-file";
import { FormInputPlugin } from "bootstrap-vue/src/components/form-input";
import { FormTextareaPlugin } from "bootstrap-vue/src/components/form-textarea";
import { InputGroupPlugin } from "bootstrap-vue/src/components/input-group";

import { AlertPlugin } from "bootstrap-vue/src/components/alert";
import { CollapsePlugin } from "bootstrap-vue/src/components/collapse";
import { LinkPlugin } from "bootstrap-vue/src/components/link";
import { ModalPlugin } from "bootstrap-vue/src/components/modal";
import { OverlayPlugin } from "bootstrap-vue/src/components/overlay";
import { PopoverPlugin } from "bootstrap-vue/src/components/popover";
import { TabsPlugin } from "bootstrap-vue/src/components/tabs";
import { ToastPlugin } from "bootstrap-vue/src/components/toast";
import { TooltipPlugin } from "bootstrap-vue/src/components/tooltip";

import { BFormInvalidFeedback } from "bootstrap-vue/src/components/form";

import { IconsPlugin } from "bootstrap-vue/src/icons/";

Vue.use(NavPlugin);
Vue.use(NavbarPlugin);
Vue.use(ButtonPlugin);
Vue.use(FormPlugin);
Vue.use(FormCheckboxPlugin);
Vue.use(FormDatepickerPlugin);
Vue.use(FormFilePlugin);
Vue.use(FormInputPlugin);
Vue.use(FormTextareaPlugin);
Vue.use(InputGroupPlugin);
Vue.use(IconsPlugin);
Vue.use(AlertPlugin);
Vue.use(CollapsePlugin);
Vue.use(LinkPlugin);
Vue.use(ModalPlugin);
Vue.use(OverlayPlugin);
Vue.use(PopoverPlugin);
Vue.use(TabsPlugin);
Vue.use(ToastPlugin);
Vue.use(TooltipPlugin);

Vue.component("BFormInvalidFeedback", BFormInvalidFeedback);
