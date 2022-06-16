import nodemailer from 'nodemailer';
import mailgunTransport from 'nodemailer-mailgun-transport';
import dotenv from 'dotenv';

dotenv.config();

export default nodemailer.createTransport(mailgunTransport({
    auth: {
        domain: `${process.env.MAILGUN_DOMAIN}`,
        api_key: `${process.env.MAILGUN_API_KEY}` // private key
    }
}));