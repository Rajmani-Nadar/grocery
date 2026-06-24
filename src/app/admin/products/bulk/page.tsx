'use client'

import React, { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2, Download, Upload, ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import * as XLSX from 'xlsx'

export default function BulkProductsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadResult, setUploadResult] = useState<{
    success: number
    failed: number
    errors: Array<{ row: number; error: string }>
  } | null>(null)

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
        categoryId: '', // Fill this from your categories
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
        categoryId: '',
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
            categoryId: string
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
            if (!row.categoryId || !row.categoryId.toString().trim()) {
              errors.push({ row: rowNum, error: 'Category ID is required' })
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

            validProducts.push({
              name: row.name.toString().trim(),
              sku: row.sku.toString().trim(),
              description: row.description ? row.description.toString() : '',
              categoryId: row.categoryId.toString().trim(),
              price: parseFloat(row.price),
              discountPrice: row.discountPrice ? parseFloat(row.discountPrice) : null,
              discount: row.discount ? parseInt(row.discount) : null,
              stock: parseInt(row.stock),
              weight: row.weight ? parseFloat(row.weight) : null,
              isFeatured: row.isFeatured === true || row.isFeatured === 1 || row.isFeatured === 'TRUE',
              isActive: row.isActive === true || row.isActive === 1 || row.isActive === 'TRUE',
            })
          })

          if (errors.length > 0 && validProducts.length === 0) {
            toast.error(`All rows have validation errors: ${errors[0].error}`)
            setUploadResult({ success: 0, failed: errors.length, errors })
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
            }),
          })

          const result = await response.json()

          if (!response.ok) {
            toast.error(result.error || 'Failed to upload products')
            return
          }

          setUploadResult({
            success: result.data.successCount,
            failed: result.data.failedCount,
            errors: result.data.errors || [],
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
                <li>Fill in your product details in the spreadsheet</li>
                <li>Make sure all required fields are filled</li>
                <li>Save the file and drag it here or use the upload button</li>
                <li>Review the results and fix any errors</li>
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

            {/* Upload Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-12 text-center transition cursor-pointer ${
                isDragging
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 bg-slate-50 dark:bg-slate-800'
              }`}
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
            </div>

            {/* Required Fields Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Required Fields</h3>
              <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                <li>• <strong>name</strong> - Product name</li>
                <li>• <strong>sku</strong> - Stock Keeping Unit (unique identifier)</li>
                <li>• <strong>categoryId</strong> - Category UUID</li>
                <li>• <strong>price</strong> - Product price (number)</li>
                <li>• <strong>stock</strong> - Quantity in stock (number)</li>
              </ul>
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
                    <p><strong>✓ Successful:</strong> {uploadResult.success} products</p>
                    {uploadResult.failed > 0 && (
                      <p><strong>✗ Failed:</strong> {uploadResult.failed} products</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

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
