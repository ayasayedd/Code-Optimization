import { motion } from "framer-motion";

const ScrollReveal = ({ children }: { children: React.ReactNode }) => {
return (
    <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    viewport={{ once: true, amount: 0.2 }}
    >
    {children}
    </motion.div>
);
};

export default ScrollReveal;
