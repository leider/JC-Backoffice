import nodemailer from "nodemailer";
import conf from "../commons/simpleConfigure";

export default nodemailer.createTransport(conf.get("transport-options") as object);
