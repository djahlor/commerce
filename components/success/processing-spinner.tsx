"use client"

import { CSSProperties } from 'react'

interface ProcessingSpinnerProps {
  size?: number
  color?: string
  className?: string
  thickness?: number
}

export default function ProcessingSpinner({
  size = 50,
  color = '#0070f3',
  className = '',
  thickness = 4
}: ProcessingSpinnerProps) {
  const spinnerStyle: CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderWidth: `${thickness}px`,
    borderColor: `${color}20`, // Very light version of the color
    borderTopColor: color, // Full color for the spinning part
    borderRadius: '50%',
    borderStyle: 'solid',
    animation: 'spin 1s linear infinite'
  }

  return (
    <div className={`inline-block ${className}`}>
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={spinnerStyle} />
    </div>
  )
} 