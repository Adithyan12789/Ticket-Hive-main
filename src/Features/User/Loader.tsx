import { motion } from 'framer-motion';

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-dark-bg/90 backdrop-blur-sm">
      <div className="relative w-24 h-24">
        <motion.div
          className="absolute inset-0 border-4 border-primary-500/30 rounded-full"
        />
        <motion.div
          className="absolute inset-0 border-4 border-t-primary-500 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-4 border-4 border-secondary-500/30 rounded-full"
        />
        <motion.div
          className="absolute inset-4 border-4 border-b-secondary-500 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
        className="mt-6 text-white font-medium tracking-wider"
      >
        Loading Experience...
      </motion.p>
    </div>
  );
}

export default Loader;

