import { motion } from "framer-motion";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.5, // الوقت بين كل عنصر والتاني
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.9,
      ease: "easeOut",
    },
  },
};

const StaggerReveal = ({ children }: Props) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div key={index} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        : (
          <motion.div variants={itemVariants}>
            {children}
          </motion.div>
        )}
    </motion.div>
  );
};

export default StaggerReveal;