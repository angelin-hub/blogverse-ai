import { motion, AnimatePresence } from 'framer-motion';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();
  return (
    <motion.button onClick={toggleTheme}
      whileHover={{ scale:1.1 }} whileTap={{ scale:0.9 }}
      className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
      style={{ background:'rgba(109,40,217,0.08)', border:'1px solid rgba(109,40,217,0.18)', color:'#6D28D9' }}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        {isDark
          ? <motion.span key="sun"  initial={{rotate:-90,opacity:0}} animate={{rotate:0,opacity:1}} exit={{rotate:90,opacity:0}}  transition={{duration:0.2}}><FiSun  className="w-4 h-4"/></motion.span>
          : <motion.span key="moon" initial={{rotate:90,opacity:0}}  animate={{rotate:0,opacity:1}} exit={{rotate:-90,opacity:0}} transition={{duration:0.2}}><FiMoon className="w-4 h-4"/></motion.span>
        }
      </AnimatePresence>
    </motion.button>
  );
}
