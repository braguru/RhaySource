import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { FiChevronDown } from 'react-icons/fi';
import Button from '../ui/Button';
import './HeroSection.css';

const textContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.22, delayChildren: 1.4 },
  },
};

const textItem = {
  hidden: { y: 28, opacity: 0 },
  visible: {
    y: 0, opacity: 1,
    transition: { duration: 0.75, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function HeroSection() {
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 600], [0, 110]);
  const scrollIndicatorOpacity = useTransform(scrollY, [0, 120], [1, 0]);

  return (
    <section className="hero">
      {/* Background  */}
      <motion.div
        className="hero-background"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        <img src="/assets/images/hero-model.jpg" alt="RhaySource skincare" />
      </motion.div>

      {/* Hero text */}
      <div className="hero-content container">
        <motion.div
          className="hero-text-block"
          variants={textContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.p variants={textItem} className="hero-eyebrow">
            rhaysource skincare
          </motion.p>

          <motion.h2 variants={textItem} className="hero-title">
            PRESTIGE<br />
            <span className="hero-title-accent">
              REDEFINED
            </span>
          </motion.h2>

          <motion.p variants={textItem} className="hero-subtitle">
            Scientifically crafted, masterfully designed formulas
            for skin that commands attention.
          </motion.p>

          <motion.div variants={textItem} className="hero-actions">
            <Link to="/shop">
              <Button variant="primary" className="hero-cta">Explore Collection</Button>
            </Link>
            <Link to="/about">
              <Button variant="secondary" className="hero-cta-secondary">Our Story</Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div className="hero-scroll-cue" style={{ opacity: scrollIndicatorOpacity }}>
        <motion.span
          animate={{ y: [0, 7, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        >
          <FiChevronDown />
        </motion.span>
      </motion.div>
    </section>
  );
}
