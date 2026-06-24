# Image Upload Configuration

This project now supports uploading product images from local files. Images are hosted on **Cloudinary**, a free image hosting service.

## Setup Instructions

### 1. Create a Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Click "Sign Up for Free"
3. Complete the registration process
4. You'll be directed to your Cloudinary Dashboard

### 2. Get Your Credentials

1. In your Cloudinary Dashboard, look for the "Cloud Name" field (it's displayed prominently at the top)
2. Create an unsigned upload preset:
   - Click on "Settings" (gear icon)
   - Go to "Upload" tab
   - Scroll to "Upload presets"
   - Click "Add upload preset"
   - Set the following:
     - **Name**: `grocery_products` (or any name you prefer)
     - **Unsigned**: Toggle ON (this allows uploads without backend authentication)
     - **Folder**: `grocery/products` (optional - for organization)
   - Click "Save"

### 3. Configure Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=grocery_products
```

**Important**: These are public variables (prefixed with `NEXT_PUBLIC_`), so it's safe to expose them.

### 4. Restart Development Server

```bash
npm run dev
```

## Features

- **Local File Upload**: Upload images directly from your computer
- **URL Support**: Still supports adding images via URL
- **Automatic Validation**: 
  - File type validation (images only)
  - File size limit: 5MB
- **Instant Preview**: See uploaded images immediately
- **Multiple Images**: Add multiple images per product

## Usage

### In Single Product Add/Edit Page
1. Click "Add Product" → "Single Product" (or edit existing product)
2. In the Product Images section:
   - **Add Image from URL**: Enter image URL and click "Add URL"
   - **Or Upload from Computer**: Click "Upload Image" to select from your computer
3. Both methods add the image to your product

### In Bulk Product Upload
For bulk upload, you can still use image URLs in the Excel file. Local file upload in bulk is currently for single products, but you can:
1. Download the template
2. Add image URLs to the images column (semicolon-separated if multiple)
3. Upload the Excel file

Example Excel format with images:
```
name | sku | categoryId | price | stock | images
Milk | SKU001 | category-id | 60 | 100 | https://image1.jpg;https://image2.jpg
```

## Troubleshooting

### "Image upload service not configured"
- Make sure both environment variables are set correctly
- Restart your development server
- Check that the variable names match exactly (case-sensitive)

### "Failed to upload image to Cloudinary"
- Verify your Cloud Name is correct
- Verify your Upload Preset is set to "Unsigned"
- Check that Cloudinary upload preset settings are correct
- Try uploading a smaller image

### Image Not Displaying
- Cloudinary usually takes a few seconds to process images
- Try refreshing the page
- Check that the image URL is accessible

## Security Notes

- Upload Preset must be set to "Unsigned" for this implementation
- Only admins can upload images (authentication is enforced)
- File size is limited to 5MB for performance
- Only image files are accepted

## Free Tier Limits

Cloudinary's free tier includes:
- 25 credits per month (typically allows ~500 image uploads)
- 10GB storage
- 1GB bandwidth per month
- Sufficient for most small to medium e-commerce sites

For more information, visit [Cloudinary Free Plan](https://cloudinary.com/pricing)
