import React, { useState } from 'react';
import Button from '../ui/Button';
import './ContactForm.css';

const ContactForm = () => {
  const [status, setStatus] = useState('');

  const sendEmail = (e) => {
    e.preventDefault();
    /* EmailJS/Formspree logic to be inserted here, using import.meta.env.VITE_SERVICE_ID */
    setStatus('Sending...');
    setTimeout(() => {
      setStatus('Message sent successfully. We will be in touch shortly.');
      e.target.reset();
    }, 1500);
  };

  return (
    <section className="contact-wrapper" id="about">
      <div className="container contact-container">
        <div className="contact-info">
          <h2>Get in Touch</h2>
          <p>
            Have questions about your routine or our botanical sourcing? 
            Reach out to our expert formulators.
          </p>
        </div>
        
        <form className="contact-form glass" onSubmit={sendEmail}>
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
          {status && <p className="form-status">{status}</p>}
        </form>
      </div>
    </section>
  );
};

export default ContactForm;
