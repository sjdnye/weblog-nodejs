const nodeMailer = require("nodemailer");
const smtpTransport = require("nodemailer-smtp-transport");

const transporterDetails = smtpTransport({
    host: "mail.sjdnye.dev",
    port: 465,
    secure: true,
    auth: {
        user: "toplearn@sjdnye.dev",
        pass: "nodejs1990sjdnye",
    },
    tls: {
        rejectUnauthorized: false,
    },
});

exports.sendEmail = (email, fullname, subject, message) => {
    const transporter = nodeMailer.createTransport(transporterDetails);
    transporter.sendMail({
        from: "toplearn@sjdnye.dev",
        to: email,
        subject: subject,
        html: `<h1> سلام ${fullname}</h1>
            <p>${message}</p>`,
    });
};
