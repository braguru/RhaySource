import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';
import './ContactForm.css';

const ContactForm = () => {
  const [status, setStatus] = useState('');

  const sendEmail = (e) => {
    e.preventDefault();
    setStatus('Sending...');
    setTimeout(() => {
      setStatus('Message sent successfully. We will be in touch shortly.');
      e.target.reset();
    }, 1500);
  };

  return (
    <motion.form 
      className="contact-form glass" 
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

      <Button variant="primary" type="submit">Submit Inquiry</Button>
      {status && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="form-status">{status}</motion.p>}
    </motion.form>
  );
};

export default ContactForm;
