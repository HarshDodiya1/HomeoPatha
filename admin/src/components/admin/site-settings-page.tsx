"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Plus,
  Trash2,
  Edit,
  AlertCircle,
  Image as ImageIcon,
  Type,
  Loader2,
  Upload,
  X,
  Eye,
  EyeOff,
  GripVertical,
} from "lucide-react"
import { toast } from "sonner"
import { useSiteSettingsStore } from "@/store/site-settings.store"
import { siteSettingsService } from "@/lib/services/site-settings.service"
import { HeroImage, StickyBanner } from "@/types/site-settings"

export function SiteSettingsPage() {
  const {
    heroImages,
    heroImagesLoading,
    heroImagesError,
    stickyBanners,
    stickyBannersLoading,
    stickyBannersError,
    fetchHeroImages,
    createHeroImage,
    updateHeroImage,
    toggleHeroImage,
    deleteHeroImage,
    fetchStickyBanners,
    createStickyBanner,
    updateStickyBanner,
    toggleStickyBanner,
    deleteStickyBanner,
  } = useSiteSettingsStore()

  // Hero Image State
  const [showHeroDialog, setShowHeroDialog] = useState(false)
  const [editingHeroImage, setEditingHeroImage] = useState<HeroImage | null>(null)
  const [heroFormData, setHeroFormData] = useState({
    imageUrl: "",
    title: "",
    subtitle: "",
    isActive: true,
    order: 0,
  })
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false)
  const [heroDeleteId, setHeroDeleteId] = useState<string | null>(null)
  const heroFileInputRef = useRef<HTMLInputElement>(null)

  // Sticky Banner State
  const [showBannerDialog, setShowBannerDialog] = useState(false)
  const [editingBanner, setEditingBanner] = useState<StickyBanner | null>(null)
  const [bannerFormData, setBannerFormData] = useState({
    heading: "",
    linkText: "",
    linkUrl: "",
    isActive: false,
  })
  const [bannerDeleteId, setBannerDeleteId] = useState<string | null>(null)

  // Fetch data on mount
  useEffect(() => {
    fetchHeroImages()
    fetchStickyBanners()
  }, [])

  // ==================== HERO IMAGE HANDLERS ====================

  const handleOpenHeroDialog = (heroImage?: HeroImage) => {
    if (heroImage) {
      setEditingHeroImage(heroImage)
      setHeroFormData({
        imageUrl: heroImage.imageUrl,
        title: heroImage.title,
        subtitle: heroImage.subtitle,
        isActive: heroImage.isActive,
        order: heroImage.order,
      })
    } else {
      setEditingHeroImage(null)
      setHeroFormData({
        imageUrl: "",
        title: "",
        subtitle: "",
        isActive: true,
        order: heroImages.length,
      })
    }
    setShowHeroDialog(true)
  }

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setUploadingHeroImage(true)
      const file = files[0]

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file")
        return
      }

      toast.info("Uploading image...")
      const imageUrl = await siteSettingsService.uploadImage(file)
      setHeroFormData(prev => ({ ...prev, imageUrl }))
      toast.success("Image uploaded successfully")

      if (heroFileInputRef.current) {
        heroFileInputRef.current.value = ""
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image")
    } finally {
      setUploadingHeroImage(false)
    }
  }

  const handleSaveHeroImage = async () => {
    if (!heroFormData.imageUrl) {
      toast.error("Please upload an image")
      return
    }

    try {
      if (editingHeroImage) {
        await updateHeroImage(editingHeroImage._id, heroFormData)
        toast.success("Hero image updated successfully")
      } else {
        await createHeroImage(heroFormData)
        toast.success("Hero image created successfully")
      }
      setShowHeroDialog(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to save hero image")
    }
  }

  const handleToggleHeroImage = async (id: string) => {
    try {
      await toggleHeroImage(id)
      toast.success("Hero image status updated")
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle hero image")
    }
  }

  const handleDeleteHeroImage = async () => {
    if (!heroDeleteId) return
    try {
      await deleteHeroImage(heroDeleteId)
      toast.success("Hero image deleted successfully")
      setHeroDeleteId(null)
    } catch (error: any) {
      toast.error(error.message || "Failed to delete hero image")
    }
  }

  // ==================== STICKY BANNER HANDLERS ====================

  const handleOpenBannerDialog = (banner?: StickyBanner) => {
    if (banner) {
      setEditingBanner(banner)
      setBannerFormData({
        heading: banner.heading,
        linkText: banner.linkText,
        linkUrl: banner.linkUrl,
        isActive: banner.isActive,
      })
    } else {
      setEditingBanner(null)
      setBannerFormData({
        heading: "",
        linkText: "",
        linkUrl: "",
        isActive: false,
      })
    }
    setShowBannerDialog(true)
  }

  const handleSaveBanner = async () => {
    if (!bannerFormData.heading) {
      toast.error("Please enter a heading")
      return
    }

    try {
      if (editingBanner) {
        await updateStickyBanner(editingBanner._id, bannerFormData)
        toast.success("Sticky banner updated successfully")
      } else {
        await createStickyBanner(bannerFormData)
        toast.success("Sticky banner created successfully")
      }
      setShowBannerDialog(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to save sticky banner")
    }
  }

  const handleToggleBanner = async (id: string) => {
    try {
      await toggleStickyBanner(id)
      toast.success("Sticky banner status updated")
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle sticky banner")
    }
  }

  const handleDeleteBanner = async () => {
    if (!bannerDeleteId) return
    try {
      await deleteStickyBanner(bannerDeleteId)
      toast.success("Sticky banner deleted successfully")
      setBannerDeleteId(null)
    } catch (error: any) {
      toast.error(error.message || "Failed to delete sticky banner")
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero Images Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Hero Images
              </CardTitle>
              <CardDescription>
                Manage hero carousel images for the main website. Toggle to show/hide images.
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenHeroDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Image
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {heroImagesError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{heroImagesError}</AlertDescription>
            </Alert>
          )}

          {heroImagesLoading && heroImages.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : heroImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No hero images yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first hero image to display in the carousel
              </p>
              <Button onClick={() => handleOpenHeroDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Image
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {heroImages.map((image) => (
                <Card key={image._id} className="overflow-hidden">
                  <div className="relative aspect-video bg-muted">
                    <img
                      src={image.imageUrl}
                      alt={image.title || "Hero image"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Badge variant={image.isActive ? "default" : "secondary"}>
                        {image.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      {image.title && (
                        <h4 className="font-medium truncate">{image.title}</h4>
                      )}
                      {image.subtitle && (
                        <p className="text-sm text-muted-foreground truncate">
                          {image.subtitle}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={image.isActive}
                            onCheckedChange={() => handleToggleHeroImage(image._id)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {image.isActive ? "Visible" : "Hidden"}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenHeroDialog(image)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setHeroDeleteId(image._id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sticky Banners Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Sticky Banners
              </CardTitle>
              <CardDescription>
                Manage promotional banners. Only one banner can be active at a time.
              </CardDescription>
            </div>
            <Button onClick={() => handleOpenBannerDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Banner
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {stickyBannersError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{stickyBannersError}</AlertDescription>
            </Alert>
          )}

          {stickyBannersLoading && stickyBanners.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : stickyBanners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Type className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No sticky banners yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add your first promotional banner
              </p>
              <Button onClick={() => handleOpenBannerDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Banner
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Heading</TableHead>
                  <TableHead>Link Text</TableHead>
                  <TableHead>Link URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stickyBanners.map((banner) => (
                  <TableRow key={banner._id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {banner.heading}
                    </TableCell>
                    <TableCell className="max-w-[100px] truncate">
                      {banner.linkText || "-"}
                    </TableCell>
                    <TableCell className="max-w-[150px] truncate">
                      {banner.linkUrl || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={banner.isActive}
                          onCheckedChange={() => handleToggleBanner(banner._id)}
                        />
                        <Badge variant={banner.isActive ? "default" : "secondary"}>
                          {banner.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenBannerDialog(banner)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setBannerDeleteId(banner._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Hero Image Dialog */}
      <Dialog open={showHeroDialog} onOpenChange={setShowHeroDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingHeroImage ? "Edit Hero Image" : "Add Hero Image"}
            </DialogTitle>
            <DialogDescription>
              Upload an image for the hero carousel. You can also add a title and subtitle.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Image Preview/Upload */}
            <div className="space-y-2">
              <Label>Image</Label>
              {heroFormData.imageUrl ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={heroFormData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => setHeroFormData(prev => ({ ...prev, imageUrl: "" }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <input
                    ref={heroFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleHeroImageUpload}
                    disabled={uploadingHeroImage}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => heroFileInputRef.current?.click()}
                    disabled={uploadingHeroImage}
                  >
                    {uploadingHeroImage ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Image
                      </>
                    )}
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Recommended: 1920x1080px or larger
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroTitle">Title (Optional)</Label>
              <Input
                id="heroTitle"
                placeholder="e.g., Expert Consultations"
                value={heroFormData.title}
                onChange={(e) => setHeroFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroSubtitle">Subtitle (Optional)</Label>
              <Input
                id="heroSubtitle"
                placeholder="e.g., Connect with certified homeopaths"
                value={heroFormData.subtitle}
                onChange={(e) => setHeroFormData(prev => ({ ...prev, subtitle: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heroOrder">Display Order</Label>
              <Input
                id="heroOrder"
                type="number"
                min="0"
                value={heroFormData.order}
                onChange={(e) => setHeroFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="heroActive">Active</Label>
              <Switch
                id="heroActive"
                checked={heroFormData.isActive}
                onCheckedChange={(checked) => setHeroFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHeroDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveHeroImage} disabled={heroImagesLoading || !heroFormData.imageUrl}>
              {heroImagesLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingHeroImage ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sticky Banner Dialog */}
      <Dialog open={showBannerDialog} onOpenChange={setShowBannerDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingBanner ? "Edit Sticky Banner" : "Add Sticky Banner"}
            </DialogTitle>
            <DialogDescription>
              Create a promotional banner. Only one banner can be active at a time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="bannerHeading">Heading *</Label>
              <Input
                id="bannerHeading"
                placeholder="e.g., Get 20% off on your first consultation"
                value={bannerFormData.heading}
                onChange={(e) => setBannerFormData(prev => ({ ...prev, heading: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bannerLinkText">Link Text (Optional)</Label>
              <Input
                id="bannerLinkText"
                placeholder="e.g., Book Now"
                value={bannerFormData.linkText}
                onChange={(e) => setBannerFormData(prev => ({ ...prev, linkText: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bannerLinkUrl">Link URL (Optional)</Label>
              <Input
                id="bannerLinkUrl"
                placeholder="e.g., /appointments"
                value={bannerFormData.linkUrl}
                onChange={(e) => setBannerFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="bannerActive">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Enabling this will disable other active banners
                </p>
              </div>
              <Switch
                id="bannerActive"
                checked={bannerFormData.isActive}
                onCheckedChange={(checked) => setBannerFormData(prev => ({ ...prev, isActive: checked }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBannerDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveBanner} disabled={stickyBannersLoading || !bannerFormData.heading}>
              {stickyBannersLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingBanner ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Hero Image Confirmation */}
      <AlertDialog open={!!heroDeleteId} onOpenChange={() => setHeroDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hero Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this hero image? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteHeroImage}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Sticky Banner Confirmation */}
      <AlertDialog open={!!bannerDeleteId} onOpenChange={() => setBannerDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sticky Banner</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this sticky banner? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBanner}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
