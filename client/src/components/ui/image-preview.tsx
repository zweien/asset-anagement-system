import { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { LazyImage } from './lazy-image'

interface ImagePreviewProps {
  src: string
  alt: string
  thumbnailClassName?: string
}

export function ImagePreview({ src, alt, thumbnailClassName }: ImagePreviewProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="cursor-pointer hover:opacity-80 transition-opacity">
          <LazyImage src={src} alt={alt} className={thumbnailClassName} />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <img src={src} alt={alt} className="w-full h-auto object-contain" />
      </DialogContent>
    </Dialog>
  )
}
