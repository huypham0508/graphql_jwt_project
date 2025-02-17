import { google } from "googleapis";
import nodemailer from "nodemailer";
import { Otp } from "../../config";
interface MailOptionsType {
  from?: string;
  to: string;
  subject: string;
  text: string;
}

const OAuth2Client = new google.auth.OAuth2(
  Otp.CLIENT_ID,
  Otp.CLIENT_SECRET,
  Otp.REDIRECT_URI
);
OAuth2Client.setCredentials({ refresh_token: Otp.REFRESH_TOKEN });

export default async function sendEmail(mailOptions: MailOptionsType) {
  let ACCESS_TOKEN: any = "";
  mailOptions.from = Otp.MY_EMAIL;

  ACCESS_TOKEN = await OAuth2Client.getAccessToken();

  const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: Otp.MY_EMAIL,
      clientId: Otp.CLIENT_ID,
      clientSecret: Otp.CLIENT_SECRET,
      refreshToken: Otp.REFRESH_TOKEN,
      accessToken: ACCESS_TOKEN,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });

  return new Promise((resolve, reject) => {
    transport.sendMail(mailOptions, (err, info) => {
      if (err) reject(err);
      resolve(info);
    });
  });
}
