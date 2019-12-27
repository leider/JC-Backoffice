import nodemailer from 'nodemailer';

export default nodemailer.createTransport(
  require('simple-configure').get('transport-options')
);
