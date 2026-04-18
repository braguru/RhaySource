import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import Toast from '../ui/Toast';
import './ContactForm.css';

const ContactForm = ({ dark = false }) => {
  const [sending, setSending] = useState(false);
  const [toast, setToast]     = useState(null);

  const dismissToast = useCallback(() => setToast(null), []);

  const sendEmail = async (e) => {
    e.preventDefault();
    setSending(true);

    const form = e.target;
    const data = {
      name:    form.name.value.trim(),
      email:   form.email.value.trim(),
      message: form.message.value.trim(),
      store:   dark ? 'workspace' : 'skincare',
    };

    try {
      const res  = await fetch('/api/contact', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Server error');

      setToast({ type: 'success', message: 'Message sent! We will be in touch within 24 hours.' });
      form.reset();
    } catch (err) {
      setToast({ type: 'error', message: err.message || 'Something went wrong. Please try again or reach us via WhatsApp.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <motion.form
        className={`contact-form ${dark ? 'contact-form-dark' : 'glass'}`}
        onSubmit={sendEmail}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input type="text" id="name" name="name" required placeholder="Jane Doe" />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input type="email" id="email" name="email" required placeholder="jane@example.com" />
        </div>

        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea id="message" name="message" rows="4" required placeholder="Your inquiry..."></textarea>
        </div>

        <Button variant="primary" type="submit" disabled={sending}>
          {sending ? 'Sending...' : 'Submit Inquiry'}
        </Button>
      </motion.form>

      {toast && (
        <Toast type={toast.type} message={toast.message} onClose={dismissToast} />
      )}
    </>
  );
};

export default ContactForm;
