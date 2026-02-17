/**
 * Animation wrapper components for consistent animations across the app
 */

import { motion, AnimatePresence } from 'framer-motion'
import type { ReactNode } from 'react'
import {
  fadeInUp,
  scaleIn,
  staggerContainer,
  staggerItem,
  pageTransition,
  modalOverlay,
  modalContent,
  transitionPresets,
} from '@/lib/animations'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

/**
 * Page transition wrapper - use for route-level components
 */
export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface FadeInProps {
  children: ReactNode
  className?: string
  delay?: number
}

/**
 * Fade in wrapper with optional delay
 */
export function FadeIn({ children, className, delay = 0 }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Fade in from bottom wrapper
 */
export function FadeInUp({ children, className, delay = 0 }: FadeInProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeInUp}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface ScaleInProps {
  children: ReactNode
  className?: string
  delay?: number
}

/**
 * Scale in wrapper for modals, cards, etc.
 */
export function ScaleIn({ children, className, delay = 0 }: ScaleInProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={scaleIn}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

interface StaggerListProps {
  children: ReactNode
  className?: string
  delay?: number
}

/**
 * Stagger list container - wrap list items with StaggerItem
 */
export function StaggerList({ children, className, delay = 0 }: StaggerListProps) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      transition={{ delayChildren: delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

/**
 * Stagger list item - must be used inside StaggerList
 */
export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  )
}

interface AnimatedModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

/**
 * Animated modal wrapper with backdrop
 */
export function AnimatedModal({ isOpen, onClose, children }: AnimatedModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            variants={modalOverlay}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          {/* Content */}
          <motion.div
            variants={modalContent}
            className="relative z-10"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
}

/**
 * Animated card with hover effect
 */
export function AnimatedCard({ children, className, onClick }: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={transitionPresets.normal}
      className={className}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined }}
    >
      {children}
    </motion.div>
  )
}

interface AnimatedButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

/**
 * Animated button with tap effect
 */
export function AnimatedButton({
  children,
  className,
  onClick,
  disabled,
  type = 'button',
}: AnimatedButtonProps) {
  return (
    <motion.button
      type={type}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.1 }}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </motion.button>
  )
}

interface CounterProps {
  value: number
  className?: string
}

/**
 * Animated counter that smoothly transitions numbers
 */
export function AnimatedCounter({ value, className }: CounterProps) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {value}
    </motion.span>
  )
}

interface PresenceProps {
  show: boolean
  children: ReactNode
}

/**
 * Animated presence wrapper for conditional rendering
 */
export function Presence({ show, children }: PresenceProps) {
  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Re-export AnimatePresence for convenience
export { AnimatePresence }
