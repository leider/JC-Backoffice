<template lang="pug">
div
  b-navbar(fixed="top", toggleable="lg", type="dark", variant="dark")
    b-navbar-brand(href="/")
      img(src="/img/logo_weiss.png", alt="Jazzclub")
    b-nav-toggle(target="nav-collapse")
    b-collapse#nav-collapse.align-self-end(is-nav)
      b-navbar-nav
        b-nav-item(v-if="showItem", to="/veranstaltungen", active-class="active")
          b-icon-speaker
          span &nbsp;Veranstaltungen&nbsp;
        b-nav-item(v-if="showItem", to="/programmheft", active-class="active")
          b-icon-calendar2-check
          span &nbsp;Programmheft&nbsp;
        b-nav-item-dropdown(v-if="showItem", data-jcnav="[optionen|ical|image]")
          template(v-slot:button-content)
            b-icon-toggles
            span &nbsp;Optionen
          b-dropdown-item(href="/optionen") Optionen
          b-dropdown-item(href="/optionen/orte") Orte
          b-dropdown-item(href="/optionen/icals") Ferienkalender
          b-dropdown-item(href="/ical/termine") Termine
          b-dropdown-item(href="/optionen/kassenbericht") Kassenberichte
          b-dropdown-item(v-if="showItemSuperuser", to="/imageoverview") Bilder bearbeiten
        b-nav-item(v-if="showItem", to="/gema", active-class="active")
          b-icon-clipboard-data
          span &nbsp;GEMA
        b-nav-item-dropdown(v-if="showItemSuperuser", data-jcnav="mailsender")
          template(v-slot:button-content)
            b-icon-envelope-fill
            span &nbsp;Mails
          b-dropdown-item(href="/mailsender") Regeln
          b-dropdown-item(href="/mailsender/compose") Manuell
          b-dropdown-item(href="/mailsender/emailAddresses") Emailadressen bearbeiten
          b-dropdown-divider
          b-dropdown-item(to="/rundmail") Rundmail
          b-dropdown-item(to="/mailinglisten") Mailinglisten
        b-nav-item(to="/team", active-class="active")
          b-icon-people
          | &nbsp;Team&nbsp;
        b-nav-item-dropdown(data-jcnav="wiki")
          template(v-slot:button-content)
            b-icon-journals
            span &nbsp;Wiki&nbsp;
          b-dropdown-item(v-for="subdir in wikisubdirs", :key="subdir", :href="`/wiki/${subdir}/`") {{ subdir }}
      b-navbar-nav.ml-auto
        b-nav-item-dropdown(v-if="user", right)
          template(v-slot:button-content)
            b-icon-person-circle
            span &nbsp;{{ user.id }}
          b-dropdown-item(href="/logout")
            b-icon-box-arrow-right
            | &nbsp;Abmelden

  .container-fluid.p-0.p-md-auto.mt-md-4
    .row.main
      router-view
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { currentUser, wikisubdirs } from "@/commons/loader";
import Accessrights from "../lib/commons/accessrights";
import User from "../lib/users/user";

@Component({})
export default class App extends Vue {
  private user: User = new User({});
  private wikisubdirs = ["a", "b"];

  created(): void {
    currentUser((user: User) => {
      user.accessrights = new Accessrights(user);
      this.user = user;
    });

    wikisubdirs((subdirs: string[]) => {
      this.wikisubdirs = subdirs;
    });
  }

  get showItem(): boolean {
    const user1 = this.user;
    const accessrights = !!user1 && user1.accessrights;
    return !!accessrights && accessrights.isOrgaTeam;
  }

  get showItemSuperuser(): boolean {
    const user1 = this.user;
    const accessrights = !!user1 && user1.accessrights;
    return !!accessrights && accessrights.isSuperuser;
  }
}
</script>

<style lang="scss">
@import "~rfs/scss";
@import "../frontend/sass/jc-variables";
@import "~bootstrap";
@import "~bootstrap-vue/src/index.scss";

@import "~@fullcalendar/common/main.css";
@import "~@fullcalendar/daygrid/main.css";
@import "~@fullcalendar/bootstrap/main.css";
@import "../frontend/3rd_party_css/flaticon-patched.css";
@import "widgets/vue-multiselect";
@import "markdown";

// colors
$color-ausgaben1: #d50f36;

$color-kasse1: #9185be;

$color-allgemein1: #05498c;

$color-hotel1: #66267b;

$color-sonst1: #009285;

$color-ausgaben2: #f07f31;

$color-kasse2: #dea71f;

$color-allgemein2: #4faee3;

$color-hotel2: #e50069;

$color-sonst2: #95c22e;

$color-festival: #9fc442;

$color-livestream: #ff29ac;

$jc_colors: (
  "classix": $color-allgemein2,
  "concert": $gray-600,
  "kooperation": $color-kasse1,
  "ausgaben": $color-ausgaben1,
  "kalkulation": $color-ausgaben1,
  "festival": $color-festival,
  "allgemeines": $color-allgemein1,
  "hotel": $color-hotel1,
  "kasse": $color-kasse1,
  "technik": $color-sonst1,
  "presse": $color-sonst2,
  "session": $color-kasse2,
  "soulcafe": $color-ausgaben2,
  "staff": $color-kasse2,
  "copy": theme-color("secondary"),
  "livestream": $color-livestream,
);

.btn-presse {
  color: $yiq-text-light !important;
}

@mixin color-variant($color) {
  background-color: $color !important;
  border-color: $color !important;
  color: #ffffff !important;
}

@mixin border-variant($color) {
  background-color: #ffffff !important;
  border-color: $color !important;
  color: inherit !important;
}

@each $color, $value in $jc_colors {
  .border-#{$color} {
    @include border-variant($value);
  }
  .color-#{$color} {
    @include color-variant($value);
  }
  .text-#{$color} {
    color: $value;
  }
  .tab-#{$color} {
    color: $value;
    border-color: $value !important;
    border: 1px solid;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
  }
  .btn-#{$color} {
    @include button-variant($value, darken($value, 5%));
  }
}

.logo-festival {
  display: inline-block;
  background-repeat: no-repeat;
  background-image: url("/img/Festival_Icon.png");
  height: 20px;
  width: 24px;
  margin: 3px;
}

.color-reservix {
  @include color-variant(#f8500d);
}

.logo-reservix {
  display: inline-block;
  background-repeat: no-repeat;
  background-image: url("/img/rex_14x14.png");
  height: 14px;
  width: 14px;
}

.color-geplant {
  color: red !important;
}

.main {
  margin-right: auto;
  margin-left: auto;
}

@media print {
  .btn {
    display: none !important;
  }

  a,
  a:visited {
    text-decoration: none !important;
  }

  a[href]:after {
    content: "" !important;
  }
}

@media (min-width: 768px) {
  .popover {
    max-width: 450px;
  }
}

@media (max-width: 767px) {
  .fixed-top {
    position: relative !important;
  }
}

a.inherit-color {
  color: inherit !important;
}

label {
  font-weight: $font-weight-bold;
}

.fc-content {
  /* force events to be one-line tall */
  white-space: normal !important;
}

// wiki page compare *BEGIN*
.compare {
  font-family: Consolas, monospace;
  font-size: 12px;
}

.compare td {
  padding: 0 3px;
  border-top-width: 0;
}

.compare .gd {
  background-color: #ffdddd;
}

.compare .gc {
  color: #999999;
  background-color: #eaf2f5;
}

.compare .gi {
  background-color: #ddffdd;
}

.compare .ln {
  color: #999999;
  background-color: #eaf2f5;
  text-align: right;
  border-bottom-color: transparent;
}

// wiki page compare *END*

.blau {
  color: #118be8;
}

h1 > small {
  display: inline-block;
  color: $text-muted;
}

h2 > small {
  display: inline-block;
  color: $text-muted;
}

h3 > small {
  display: inline-block;
  color: $text-muted;
}

h4 > small {
  display: inline-block;
  color: $text-muted;
}

h5 > small {
  display: inline-block;
  color: $text-muted;
}

h6 > small {
  display: inline-block;
  color: $text-muted;
}

// transform fullcalendar's primary to light button
.fc-toolbar .btn-primary {
  color: #212529;
  background-color: #f8f9fa;
  border-color: #f8f9fa;
}

input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.abc-checkbox label {
  padding-top: 2px;
}

// patch bootstrap btn
.btn {
  white-space: nowrap;
}

.b-form-datepicker > button {
  padding: 0.375rem;
}

.stretched-link::after {
  z-index: 0;
}
</style>
