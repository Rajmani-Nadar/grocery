import React from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Upload, X } from 'lucide-react'
import toast from 'react-hot-toast'

type NumericField = number | ''

interface ProductFormProps {
  initialData?: {
    id?: string
    name?: string
    description?: string | null
    price?: number
    discountPrice?: number | null
    discount?: number | null
    stock?: number
    sku?: string
    weight?: number | null
    categoryId?: string
    images?: string[]
    isFeatured?: boolean
    isActive?: boolean
  }
  categories: Array<{ id: string; name: string }>
  onSubmit: (data: any) => Promise<void>
  isLoading: boolean
  submitButtonLabel?: string
}

type ProductFormState = {
  name: string
  description: string
  price: NumericField
  discountPrice: NumericField
  discount: NumericField
  stock: NumericField
  sku: string
  weight: NumericField
  categoryId: string
  images: string[]
  isFeatured: boolean
  isActive: boolean
}

export function ProductForm({
  initialData,
  categories,
  onSubmit,
  isLoading,
  submitButtonLabel = 'Create Product',
}: ProductFormProps) {
  const [formData, setFormData] = React.useState<ProductFormState>(() => {
    const defaults: ProductFormState = {
      name: '',
      description: '',
      price: '',
      discountPrice: '',
      discount: '',
      stock: '',
      sku: '',
      weight: '',
      categoryId: '',
      images: [],
      isFeatured: false,
      isActive: true,
    }
    
    if (!initialData) {
      return defaults
    }
    
    // Merge initialData with defaults, converting null/undefined numeric fields to '' for editing
    return {
      ...defaults,
      ...initialData,
      description: initialData.description ?? '',
      price: initialData.price ?? '',
      discountPrice: initialData.discountPrice ?? '',
      discount: initialData.discount ?? '',
      stock: initialData.stock ?? '',
      weight: initialData.weight ?? '',
      images: initialData.images ?? [],
    }
  })
  const [imageUrl, setImageUrl] = React.useState('')
  const [isUploadingImage, setIsUploadingImage] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState(0)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    let finalValue: any = value

    if (type === 'checkbox') {
      finalValue = checked
    } else if (type === 'number') {
      if (value === '') {
        finalValue = ''
      } else {
        const parsedValue = parseFloat(value)
        finalValue = isNaN(parsedValue) ? '' : Math.max(parsedValue, 0)
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }))
  }

  const handleAddImage = () => {
    if (imageUrl.trim()) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, imageUrl],
      }))
      setImageUrl('')
    }
  }

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget
    const files = input.files
    if (!files) return

    const file = files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB')
      return
    }

    try {
      setIsUploadingImage(true)
      setUploadProgress(0)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      setUploadProgress(100)

      if (!response.ok || !data.success || !data.data?.url) {
        const errorMessage = data?.error || 'Failed to upload image'
        toast.error(errorMessage)
        if (data?.instructions) {
          toast.error(data.instructions)
        }
        input.value = ''
        return
      }

      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, data.data.url],
      }))
      toast.success('Image uploaded successfully!')
      input.value = ''
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Error uploading image. Make sure Cloudinary is configured.')
      input.value = ''
    } finally {
      setIsUploadingImage(false)
      setUploadProgress(0)
    }
  }

  const isFormValid =
    formData.name.trim().length > 0 &&
    formData.sku.trim().length > 0 &&
    formData.categoryId.trim().length > 0 &&
    formData.price !== '' &&
    Number(formData.price) > 0 &&
    formData.stock !== '' &&
    Number(formData.stock) >= 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) {
      return
    }
    await onSubmit(formData)
  }

  React.useEffect(() => {
    if (formData.price !== '' && formData.discountPrice !== '') {
      const price = Number(formData.price)
      const discountPrice = Number(formData.discountPrice)

      if (price > 0 && discountPrice > 0) {
        const discount = Math.round(((price - discountPrice) / price) * 100)
        if (discount !== Number(formData.discount) && !isNaN(discount)) {
          setFormData((prev) => ({ ...prev, discount }))
        }
      }
    }
  }, [formData.price, formData.discountPrice, formData.discount])

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Product Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
            required
            className="w-full px-4 py-2 border border-border rounded-lg bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* SKU */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">SKU</label>
          <input
            type="text"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            placeholder="e.g., PROD-001"
            className="w-full px-4 py-2 border border-border rounded-lg bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Category *</label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-border rounded-lg bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Price (₹) *</label>
          <input
            type="number"
            name="price"
            value={formData.price === '' ? '' : formData.price}
            onChange={handleChange}
            onFocus={(e) => e.currentTarget.select()}
            onClick={(e) => e.currentTarget.select()}
            placeholder="0"
            min="0"
            step="0.01"
            required
            className="w-full px-4 py-2 border border-border rounded-lg bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Discount Price */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Discount Price (₹)</label>
          <input
            type="number"
            name="discountPrice"
            value={formData.discountPrice}
            onChange={handleChange}
            placeholder="0"
            step="0.01"
            className="w-full px-4 py-2 border border-border rounded-lg bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Discount % */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Discount (%)</label>
          <input
            type="number"
            name="discount"
            value={formData.discount}
            onChange={handleChange}
            placeholder="0"
            disabled
            className="w-full px-4 py-2 border border-border rounded-lg bg-slate-100 dark:bg-slate-700 text-foreground focus:outline-none focus:ring-2 focus:ring-primary opacity-50 cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground mt-1">Auto-calculated from prices</p>
        </div>

        {/* Stock */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Stock Quantity *</label>
          <input
            type="number"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            onFocus={(e) => e.currentTarget.select()}
            onClick={(e) => e.currentTarget.select()}
            placeholder="0"
            min="0"
            required
            className="w-full px-4 py-2 border border-border rounded-lg bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Weight (kg)</label>
          <input
            type="number"
            name="weight"
            value={formData.weight === '' ? '' : formData.weight}
            onChange={handleChange}
            onFocus={(e) => e.currentTarget.select()}
            onClick={(e) => e.currentTarget.select()}
            placeholder="0"
            min="0"
            step="0.1"
            className="w-full px-4 py-2 border border-border rounded-lg bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Product description..."
          rows={4}
          className="w-full px-4 py-2 border border-border rounded-lg bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">Product Images</label>
        <div className="space-y-4">
          {/* URL Input */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Add Image from URL</p>
            <div className="flex gap-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className="flex-1 px-4 py-2 border border-border rounded-lg bg-white dark:bg-slate-800 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                type="button"
                onClick={handleAddImage}
                disabled={!imageUrl.trim()}
                variant="outline"
              >
                Add URL
              </Button>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">Mobile Or Upload from Computer</p>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploadingImage}
                className="hidden"
                id="image-file-input"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full gap-2"
                disabled={isUploadingImage}
                onClick={() => document.getElementById('image-file-input')?.click()}
              >
                {isUploadingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading... {uploadProgress}%
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {formData.images.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">Uploaded Images ({formData.images.length})</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={img}
                    alt={`Product ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-border"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Checkboxes */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="isFeatured"
            checked={formData.isFeatured}
            onChange={handleChange}
            className="w-4 h-4 rounded border-border"
          />
          <span className="text-sm text-foreground">Featured Product</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-4 h-4 rounded border-border"
          />
          <span className="text-sm text-foreground">Active</span>
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading || !isFormValid} className="gap-2">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitButtonLabel}
        </Button>
      </div>
    </form>
  )
}
