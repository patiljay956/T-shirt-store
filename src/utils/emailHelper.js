import nodemailer from "nodemailer";

const mailHelper = async (options) => {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        // secure: false, // Use `true` for port 465, `false` for all other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });

    const mail = {
        from: "patiljay956@gmail.com", // sender address
        to: options.toEmail, // list of receivers
        subject: options.subject, // Subject line
        text: options.message, // plain text body
        html: `<a>${options.url}</a>`,
    };

    await transporter.sendMail(mail);
};

export { mailHelper };
