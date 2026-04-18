import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const LOGO_PATHS = {
    skincare:  join(__dirname, '../../src/assets/logos/logo-full.png'),
    workspace: join(__dirname, '../../src/assets/logos/logo-full.png')
};

function createTransport() {
    return nodemailer.createTransport({
        host:   process.env.SMTP_HOST,
        port:   Number(process.env.SMTP_PORT),
        secure: process.env.SMTP_PORT === '465',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });
}

function loadTemplate(name) {
    return readFileSync(join(__dirname, '../templates', name), 'utf8');
}

function fill(template, data) {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? '—');
}

export async function sendEnquiry(data) {
    const store     = data.store === 'workspace' ? 'workspace' : 'skincare';
    const transport = createTransport();

    // Use cid:logo in templates, and provide the attachment here
    const templateData = { ...data };

    const enquiryHtml      = fill(loadTemplate(`${store}-enquiry.html`), templateData);
    const confirmationHtml = fill(loadTemplate(`${store}-confirmation.html`), templateData);

    const subjects = {
        skincare:  { enquiry: `New Skincare Enquiry — ${data.name}`, confirmation: 'We received your message — RhaySource' },
        workspace: { enquiry: `New Workspace Enquiry — ${data.name}`, confirmation: 'We received your enquiry — RhaySource Workspace' },
    };

    const logoAttachment = {
        filename: store === 'workspace' ? 'logo-workspace.png' : 'logo.png',
        path:     LOGO_PATHS[store],
        cid:      'logo' // Matches <img src="cid:logo"> in templates
    };

    await Promise.all([
        transport.sendMail({
            from:    `RhaySource <${process.env.SMTP_FROM}>`,
            to:      process.env.SMTP_TO,
            subject: subjects[store].enquiry,
            html:    enquiryHtml,
            attachments: [logoAttachment]
        }),
        transport.sendMail({
            from:    `RhaySource <${process.env.SMTP_FROM}>`,
            to:      data.email,
            replyTo: process.env.SMTP_FROM,
            subject: subjects[store].confirmation,
            html:    confirmationHtml,
            attachments: [logoAttachment]
        }),
    ]);
}
