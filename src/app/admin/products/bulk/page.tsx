'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Download, Upload, ArrowLeft, AlertCircle, CheckCircle, FileArchive, FileSpreadsheet, X, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import JSZip from 'jszip'
import * as XLSX from 'xlsx'

export default function BulkProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [excelFileName, setExcelFileName] = useState('')
  const [zipFileName, setZipFileName] = useState('')
  const [zipImageCount, setZipImageCount] = useState(0)
  const [zipImageFiles, setZipImageFiles] = useState<Record<string, File>>({})
  const [imageUpload, setImageUpload] = useState<{ total: number; uploaded: number; failed: string[]; skipped: number } | null>(null)
  const [uploadedImageUrls, setUploadedImageUrls] = useState<Record<string, string>>({})
  const [imagePreview, setImagePreview] = useState<Array<{ sku: string; imageName: string; status: 'matched' | 'missing' }>>([])
  const [uploadResult, setUploadResult] = useState<{
    total: number
    success: number
    failed: number
    errors: Array<{ row: number; error: string }>
    imagesLinked: number
    missingImages: string[]
  } | null>(null)

  const normalizeImageName = (value: string) => {
    const fileName = value.split(/[\\/]/).pop()?.trim().toLowerCase() || ''
    return fileName.replace(/\.jpeg$/i, '.jpg')
  }

  const uploadImageToCloudinary = async (file: File) => {
    const formData = new FormData()
    formData.append('file', file, file.name)

    if (process.env.NODE_ENV === 'development') {
      console.log('ZIP selected:', file.name)
    }

    try {
      const response = await fetch('/api/upload/image', {
        method: 'POST',
        body: formData,
      })

      if (process.env.NODE_ENV === 'development') {
        console.log('API response status for', file.name, ':', response.status)
      }

      const result = await response.json().catch(() => null)

      if (!response.ok || !result?.success || !result?.data?.url) {
        const message = result?.error || `Cloudinary upload failed for ${file.name}.`
        throw new Error(message)
      }

      const url = result.data.url as string

      if (process.env.NODE_ENV === 'development') {
        console.log('Uploaded Cloudinary URL for', file.name, ':', url)
      }

      return url
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Network connection failed. Please check your connection and try again.')
      }

      throw error
    }
  }

  const extractZipImages = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.zip')) {
      throw new Error('ZIP file required.')
    }

    if (file.size === 0) {
      throw new Error('ZIP is empty.')
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('ZIP selected:', file.name)
    }

    const zip = await JSZip.loadAsync(file)
    const supportedImages: Record<string, File> = {}

    for (const [zipPath, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) continue

      const fileName = zipPath.split('/').pop() || zipPath
      const isSupportedImage = /\.(jpe?g|png|webp)$/i.test(fileName)

      if (!isSupportedImage) continue

      const blob = await zipEntry.async('blob')
      const imageFile = new File([blob], fileName, { type: blob.type || 'image/jpeg' })
      supportedImages[normalizeImageName(fileName)] = imageFile
    }

    if (Object.keys(supportedImages).length === 0) {
      throw new Error('ZIP contains no supported images.')
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Images extracted count:', Object.keys(supportedImages).length)
    }

    return supportedImages
  }

  const uploadZipImages = async (images: Record<string, File>, retryOnly = false) => {
    const imageEntries = Object.entries(images)
    const currentSuccessfulUploads = retryOnly ? { ...uploadedImageUrls } : {}
    const failedNames: string[] = []

    for (const [fileName, imageFile] of imageEntries) {
      if (retryOnly && !imageUpload?.failed?.includes(fileName)) {
        continue
      }

      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('Current filename uploading:', fileName)
        }

        const uploadedUrl = await uploadImageToCloudinary(imageFile)
        currentSuccessfulUploads[normalizeImageName(fileName)] = uploadedUrl
        setUploadedImageUrls({ ...currentSuccessfulUploads })
      } catch (error) {
        failedNames.push(fileName)
        const message = error instanceof Error ? error.message : `Image upload failed for ${fileName}.`

        if (process.env.NODE_ENV === 'development') {
          console.error('Upload error for', fileName, ':', message)
        }

        toast.error(message)
      }

      const uploadedCount = Object.keys(currentSuccessfulUploads).length
      const nextProgress = imageEntries.length ? (uploadedCount / imageEntries.length) * 100 : 0
      setUploadProgress(nextProgress)
      setImageUpload({
        total: imageEntries.length,
        uploaded: uploadedCount,
        failed: failedNames,
        skipped: 0,
      })
    }

    const uploadedCount = Object.keys(currentSuccessfulUploads).length
    setUploadProgress(imageEntries.length ? (uploadedCount / imageEntries.length) * 100 : 0)
    setImageUpload({
      total: imageEntries.length,
      uploaded: uploadedCount,
      failed: failedNames,
      skipped: 0,
    })

    if (imageEntries.length > 0 && failedNames.length === 0) {
      toast.success(`All ${imageEntries.length} images uploaded successfully.`)
    }
  }

  const handleZipSelect = async (file: File) => {
    if (!file) {
      toast.error('ZIP file required.')
      return
    }

    try {
      setIsUploading(true)
      setUploadProgress(0)
      setZipFileName(file.name)
      const images = await extractZipImages(file)
      setZipImageFiles(images)
      setZipImageCount(Object.keys(images).length)
      setUploadedImageUrls({})
      setImageUpload({ total: Object.keys(images).length, uploaded: 0, failed: [], skipped: 0 })
      await uploadZipImages(images)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid ZIP file.'
      setZipFileName('')
      setZipImageCount(0)
      setZipImageFiles({})
      setImageUpload(null)
      setUploadedImageUrls({})
      toast.error(message)
    } finally {
      setIsUploading(false)
    }
  }

  const retryFailedUploads = async () => {
    const failedFiles = imageUpload?.failed ?? []

    if (!failedFiles.length) {
      toast.error('No failed uploads to retry.')
      return
    }

    const retryImages = Object.fromEntries(
      Object.entries(zipImageFiles).filter(([fileName]) => failedFiles.includes(fileName))
    )

    if (Object.keys(retryImages).length === 0) {
      toast.error('No failed uploads to retry.')
      return
    }

    setIsUploading(true)
    try {
      await uploadZipImages(retryImages, true)
    } finally {
      setIsUploading(false)
    }
  }

  if (status === 'loading') {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-center h-96">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </main>
    )
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
    router.push('/auth/login')
    return null
  }

  const downloadTemplate = () => {
    const template = [
      {
        name: 'Milk - 1L',
        sku: 'DRY001',
        description: 'Fresh whole milk 1 liter',
        category: 'Dairy',
        image: 'FRT001.jpg',
        price: 60,
        discountPrice: 50,
        discount: 17,
        stock: 100,
        weight: 1,
        isFeatured: false,
        isActive: true,
      },
      {
        name: 'Butter - 500g',
        sku: 'DRY002',
        description: 'Pure butter 500 grams',
        category: 'Dairy',
        image: 'VEG001.png',
        price: 450,
        discountPrice: 400,
        discount: 11,
        stock: 50,
        weight: 0.5,
        isFeatured: true,
        isActive: true,
      },
    ]

    const ws = XLSX.utils.json_to_sheet(template)
    ws['!cols'] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 30 },
      { wch: 20 },
      { wch: 20 },
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Products')
    XLSX.writeFile(wb, 'product-template.xlsx')
    toast.success('Template downloaded successfully!')
  }

  const parseExcelFile = async (file: File) => {
    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)

          if (jsonData.length === 0) {
            toast.error('No data found in Excel file')
            return
          }

          // Validate data
          const errors: Array<{ row: number; error: string }> = []
          const validProducts: Array<{
            name: string
            sku: string
            description: string
            categoryId?: string
            category?: string
            image?: string
            price: number
            discountPrice: number | null
            discount: number | null
            stock: number
            weight: number | null
            isFeatured: boolean
            isActive: boolean
          }> = []

          jsonData.forEach((row: any, index: number) => {
            const rowNum = index + 2 // +2 because header is row 1
            
            // Validate required fields
            if (!row.name || !row.name.trim()) {
              errors.push({ row: rowNum, error: 'Product name is required' })
              return
            }
            if (!row.sku || !row.sku.trim()) {
              errors.push({ row: rowNum, error: 'SKU is required' })
              return
            }
            if ((!row.categoryId || !row.categoryId.toString().trim()) && (!row.category || !row.category.toString().trim())) {
              errors.push({ row: rowNum, error: 'Category name is required' })
              return
            }
            if (!row.price || isNaN(row.price) || row.price <= 0) {
              errors.push({ row: rowNum, error: 'Valid price is required' })
              return
            }
            if (row.stock === undefined || isNaN(row.stock) || row.stock < 0) {
              errors.push({ row: rowNum, error: 'Valid stock quantity is required' })
              return
            }

            const imageKey = Object.keys(row).find((key) =>
              ['image', 'imageurl', 'image_url', 'images'].includes(key.trim().toLowerCase())
            )
            const imageValue = imageKey ? row[imageKey] : undefined

            validProducts.push({
              name: row.name.toString().trim(),
              sku: row.sku.toString().trim(),
              description: row.description ? row.description.toString() : '',
              ...(row.categoryId && row.categoryId.toString().trim() ? { categoryId: row.categoryId.toString().trim() } : {}),
              ...(row.category && row.category.toString().trim() ? { category: row.category.toString().trim() } : {}),
              ...(imageValue && imageValue.toString().trim() ? { image: imageValue.toString().trim() } : {}),
              price: parseFloat(row.price),
              discountPrice: row.discountPrice ? parseFloat(row.discountPrice) : null,
              discount: row.discount ? parseInt(row.discount) : null,
              stock: parseInt(row.stock),
              weight: row.weight ? parseFloat(row.weight) : null,
              isFeatured: row.isFeatured === true || row.isFeatured === 1 || row.isFeatured === 'TRUE',
              isActive: row.isActive === true || row.isActive === 1 || row.isActive === 'TRUE',
            })
          })

          setImagePreview(validProducts.flatMap((product) => {
            if (!product.image) return []
            const imageName = normalizeImageName(product.image)
            return [{
              sku: product.sku,
              imageName,
              status: uploadedImageUrls[imageName] ? 'matched' as const : 'missing' as const,
            }]
          }))

          if (errors.length > 0 && validProducts.length === 0) {
            toast.error(`All rows have validation errors: ${errors[0].error}`)
            setUploadResult({
              total: jsonData.length,
              success: 0,
              failed: errors.length,
              errors,
              imagesLinked: 0,
              missingImages: [],
            })
            return
          }

          // Upload to API
          setIsUploading(true)
          setUploadProgress(0)

          const response = await fetch('/api/admin/products/bulk', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              products: validProducts,
              uploadedImages: uploadedImageUrls,
            }),
          })

          const result = await response.json()

          if (!response.ok) {
            toast.error(result.error || 'Failed to upload products')
            return
          }

          setUploadResult({
            total: jsonData.length,
            success: result.data.successCount,
            failed: result.data.failedCount,
            errors: result.data.errors || [],
            imagesLinked: result.data.imagesLinked || 0,
            missingImages: result.data.missingImages || [],
          })

          toast.success(
            `Products uploaded! Success: ${result.data.successCount}, Failed: ${result.data.failedCount}`
          )
        } catch (error) {
          console.error('Error parsing Excel:', error)
          toast.error('Error parsing Excel file')
        } finally {
          setIsUploading(false)
        }
      }
      reader.readAsArrayBuffer(file)
    } catch (error) {
      console.error('Error reading file:', error)
      toast.error('Error reading file')
    }
  }

  const handleFileSelect = (file: File) => {
    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      toast.error('Please upload an Excel or CSV file')
      return
    }

    setExcelFileName(file.name)
    parseExcelFile(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/admin/products')}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Bulk Upload Products</h1>
            <p className="text-muted-foreground mt-1">Upload multiple products from an Excel file</p>
          </div>
        </div>

        {/* Main Content */}
        {!uploadResult ? (
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-white dark:bg-slate-800 border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">How to Use</h2>
              <ol className="space-y-2 text-muted-foreground list-decimal list-inside">
                <li>Download the Excel template using the button below</li>
                <li>Enter the category name exactly as it appears in Categories</li>
                <li>Upload the file</li>
                <li>Review imported products and any row errors</li>
              </ol>
            </div>

            {/* Download Template */}
            <div className="flex gap-4">
              <Button
                onClick={downloadTemplate}
                variant="outline"
                className="gap-2 flex-1"
              >
                <Download className="w-4 h-4" />
                Download Template
              </Button>
            </div>

            {/* Upload Areas */}
            <div className="grid gap-6 md:grid-cols-2">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`rounded-3xl border-2 border-dashed p-10 text-center transition ${isDragging ? 'border-primary bg-primary/5' : 'border-border bg-slate-50 hover:border-primary/50 dark:bg-slate-800'}`}
            >
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileInput}
                className="hidden"
                id="file-input"
                disabled={isUploading}
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground mb-1">Drag and drop your Excel file</h3>
                <p className="text-sm text-muted-foreground mb-4">or click to browse</p>
                <Button
                  variant="outline"
                  disabled={isUploading}
                  className="gap-2"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Choose File
                    </>
                  )}
                </Button>
              </label>
              {excelFileName && <p className="mt-3 truncate text-sm font-medium text-emerald-700 dark:text-emerald-300"><FileSpreadsheet className="mr-1 inline h-4 w-4" />{excelFileName}</p>}
            </div>

            <div
              onDrop={(event) => { event.preventDefault(); setIsDragging(false); const file = event.dataTransfer.files[0]; if (file) handleZipSelect(file) }}
              onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              className={`rounded-3xl border-2 border-dashed p-10 text-center transition ${isDragging ? 'border-primary bg-primary/5' : 'border-border bg-slate-50 hover:border-primary/50 dark:bg-slate-800'}`}
            >
              <input type="file" accept=".zip,application/zip" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) handleZipSelect(file) }} className="hidden" id="zip-input" disabled={isUploading} />
              <label htmlFor="zip-input" className="cursor-pointer"><FileArchive className="mx-auto mb-4 h-12 w-12 text-emerald-600" /><h3 className="mb-1 text-lg font-semibold text-foreground">Upload image ZIP</h3><p className="mb-4 text-sm text-muted-foreground">JPG, PNG, or WEBP files</p><Button type="button" variant="outline" disabled={isUploading} className="gap-2" onClick={() => document.getElementById('zip-input')?.click()}><FileArchive className="h-4 w-4" />Choose ZIP File</Button>{zipFileName && <p className="mt-3 truncate text-sm font-medium text-emerald-700 dark:text-emerald-300">{zipFileName} · {zipImageCount} images detected</p>}</label>
            </div>
            </div>

            {imageUpload && <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900 dark:bg-emerald-950/20"><div className="flex items-center justify-between gap-3 text-sm font-semibold text-foreground"><div className="flex items-center gap-2"><span>Uploading Images</span>{imageUpload.uploaded === imageUpload.total && imageUpload.total > 0 ? <CheckCircle className="h-5 w-5 text-emerald-600 animate-pulse" /> : <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />}</div><span>{imageUpload.uploaded} / {imageUpload.total} uploaded</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-900/50"><div className="h-full rounded-full bg-emerald-600 transition-all" style={{ width: `${uploadProgress || (imageUpload.total ? (imageUpload.uploaded / imageUpload.total) * 100 : 0)}%` }} /></div><div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground"><span>Images Uploaded: {imageUpload.uploaded}</span><span>Failed Uploads: {imageUpload.failed.length}</span><span>Skipped Files: {imageUpload.skipped}</span></div>{Object.keys(uploadedImageUrls).length > 0 && <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">Cloudinary URLs stored for {Object.keys(uploadedImageUrls).length} image(s).</p>}{imageUpload.failed.length > 0 && <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-left dark:border-red-900 dark:bg-red-950/20"><p className="mb-2 text-sm font-medium text-red-700 dark:text-red-300">Failed files</p><ul className="list-disc space-y-1 pl-5 text-sm text-red-700 dark:text-red-300">{imageUpload.failed.map((fileName) => <li key={fileName}>{fileName}</li>)}</ul><Button type="button" variant="outline" className="mt-3 gap-2 border-red-200 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/30" onClick={retryFailedUploads}><RefreshCw className="h-4 w-4" />Retry failed uploads</Button></div>}</div>}

            {/* Required Fields Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Required Fields</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• <strong>name</strong> - Product name</li>
                <li>• <strong>sku</strong> - Stock Keeping Unit (unique identifier)</li>
                <li>• <strong>category</strong> - Existing category name (example: Fruits, Vegetables, Dairy, Machines)</li>
                <li>• <strong>price</strong> - Product price (number)</li>
                <li>• <strong>stock</strong> - Quantity in stock (number)</li>
              </ul>
              <p className="mt-3 text-sm text-blue-800 dark:text-blue-300">Category names are matched automatically. No database ID is required.</p>
            </div>

            {/* Optional Fields Info */}
            <div className="bg-slate-100 dark:bg-slate-800 border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-2">Optional Fields</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>description</strong> - Product description</li>
                <li>• <strong>discountPrice</strong> - Discounted price</li>
                <li>• <strong>discount</strong> - Discount percentage</li>
                <li>• <strong>weight</strong> - Product weight in kg</li>
                <li>• <strong>isFeatured</strong> - Featured product (TRUE/FALSE)</li>
                <li>• <strong>isActive</strong> - Active status (TRUE/FALSE)</li>
              </ul>
            </div>
          </div>
        ) : (
          /* Upload Result */
          <div className="space-y-6">
            <div className={`border rounded-lg p-6 ${
              uploadResult.failed === 0
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : uploadResult.success === 0
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            }`}>
              <div className="flex items-start gap-4">
                {uploadResult.failed === 0 ? (
                  <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Upload Complete</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Total Rows:</strong> {uploadResult.total}</p>
                    <p><strong>Successfully Imported:</strong> {uploadResult.success} products</p>
                    <p><strong>Failed Rows:</strong> {uploadResult.failed}</p>
                    <p><strong>Images Linked:</strong> {uploadResult.imagesLinked}</p>
                    <p><strong>Missing Images:</strong> {uploadResult.missingImages.length}</p>
                    <p><strong>Failed Uploads:</strong> {imageUpload?.failed.length ?? 0}</p>
                  </div>
                </div>
              </div>
            </div>

            {imagePreview.length > 0 && (
              <div className="overflow-hidden rounded-lg border border-border bg-white dark:bg-slate-800">
                <div className="border-b border-border p-5">
                  <h3 className="text-lg font-semibold text-foreground">Image Import Preview</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase text-muted-foreground dark:bg-slate-900">
                      <tr><th className="px-5 py-3">SKU</th><th className="px-5 py-3">Excel Image</th><th className="px-5 py-3">Status</th></tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {imagePreview.map((preview) => (
                        <tr key={`${preview.sku}-${preview.imageName}`}>
                          <td className="px-5 py-3 font-medium">{preview.sku}</td>
                          <td className="px-5 py-3">{preview.imageName}</td>
                          <td className={`px-5 py-3 font-medium ${preview.status === 'matched' ? 'text-emerald-600' : 'text-red-600'}`}>
                            {preview.status === 'matched' ? 'Matched' : 'Missing'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {uploadResult.missingImages.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
                <p className="font-semibold">Unmatched image filenames</p>
                <p className="mt-1">{uploadResult.missingImages.join(', ')}</p>
              </div>
            )}

            {/* Error Details */}
            {uploadResult.errors.length > 0 && (
              <div className="bg-white dark:bg-slate-800 border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Error Details</h3>
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {uploadResult.errors.map((err, idx) => (
                    <div key={idx} className="text-sm p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                      <p className="font-medium text-red-900 dark:text-red-200">Row {err.row}</p>
                      <p className="text-red-800 dark:text-red-300">{err.error}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setUploadResult(null)
                  window.location.reload()
                }}
                className="flex-1"
              >
                Upload Another File
              </Button>
              <Button
                onClick={() => router.push('/admin/products')}
                variant="outline"
                className="flex-1"
              >
                Back to Products
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
