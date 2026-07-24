"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2, Search, Plus, Edit, Trash2, HelpCircle, GripVertical, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { useSpecializationsStore } from "@/store/specializations.store"
import { Specialization, AppointmentQuestion } from "@/types/specialization"
import { uploadImageToR2 } from "@/lib/services/upload.service"

const questionTypes = [
  { value: "text", label: "Text Input" },
  { value: "textarea", label: "Text Area" },
  { value: "select", label: "Dropdown Select" },
  { value: "checkbox", label: "Checkbox (Multiple)" },
  { value: "radio", label: "Radio (Single)" },
  { value: "date", label: "Date Picker" },
  { value: "number", label: "Number Input" },
]

export default function SpecializationsPage() {
  const {
    specializations,
    isLoadingSpecializations,
    specializationsError,
    fetchSpecializations,
    createSpecialization,
    updateSpecialization,
    deleteSpecialization,
    questions,
    isLoadingQuestions,
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  } = useSpecializationsStore()

  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("specializations")
  const [mounted, setMounted] = useState(false)

  // Specialization Dialog State
  const [specDialogOpen, setSpecDialogOpen] = useState(false)
  const [editingSpec, setEditingSpec] = useState<Specialization | null>(null)
  const [specForm, setSpecForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    consultationFee: "",
    isActive: true,
    tags: "",
  })
  const [isSubmittingSpec, setIsSubmittingSpec] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // Question Dialog State
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<AppointmentQuestion | null>(null)
  const [questionForm, setQuestionForm] = useState({
    question: "",
    questionType: "text" as AppointmentQuestion["questionType"],
    options: "",
    isRequired: true,
    specializationId: "" as string | null,
    order: "1",
    placeholder: "",
    isActive: true,
  })
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false)

  // Delete Dialog State
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean
    type: "specialization" | "question"
    item: Specialization | AppointmentQuestion | null
  }>({ open: false, type: "specialization", item: null })
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setMounted(true)
    fetchSpecializations()
    fetchQuestions()
  }, [fetchSpecializations, fetchQuestions])

  // Filter specializations
  const filteredSpecializations = specializations.filter((spec) =>
    spec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    spec.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter questions
  const filteredQuestions = questions.filter((q) =>
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // ============ Specialization Handlers ============

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB')
      return
    }

    setIsUploadingImage(true)
    try {
      const url = await uploadImageToR2(file, 'specializations')
      setSpecForm({ ...specForm, imageUrl: url })
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Image upload error:', error)
      toast.error('Failed to upload image')
    } finally {
      setIsUploadingImage(false)
    }
  }

  const removeImage = () => {
    setSpecForm({ ...specForm, imageUrl: "" })
  }

  const openAddSpecDialog = () => {
    setEditingSpec(null)
    setSpecForm({
      name: "",
      description: "",
      imageUrl: "",
      consultationFee: "",
      isActive: true,
      tags: "",
    })
    setSpecDialogOpen(true)
  }

  const openEditSpecDialog = (spec: Specialization) => {
    setEditingSpec(spec)
    setSpecForm({
      name: spec.name,
      description: spec.description,
      imageUrl: spec.imageUrl || "",
      consultationFee: spec.consultationFee.toString(),
      isActive: spec.isActive,
      tags: spec.tags.join(", "),
    })
    setSpecDialogOpen(true)
  }

  const handleSpecSubmit = async () => {
    if (!specForm.name.trim()) {
      toast.error("Name is required")
      return
    }
    if (!specForm.consultationFee || parseFloat(specForm.consultationFee) <= 0) {
      toast.error("Valid consultation fee is required")
      return
    }

    setIsSubmittingSpec(true)
    try {
      const data = {
        name: specForm.name.trim(),
        description: specForm.description.trim(),
        imageUrl: specForm.imageUrl.trim() || null,
        consultationFee: parseFloat(specForm.consultationFee),
        isActive: specForm.isActive,
        tags: specForm.tags.split(",").map((t) => t.trim()).filter(Boolean),
      }

      if (editingSpec) {
        await updateSpecialization(editingSpec._id, data)
        toast.success("Specialization updated successfully")
      } else {
        await createSpecialization(data)
        toast.success("Specialization created successfully")
      }
      setSpecDialogOpen(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to save specialization")
    } finally {
      setIsSubmittingSpec(false)
    }
  }

  // ============ Question Handlers ============

  const openAddQuestionDialog = () => {
    setEditingQuestion(null)
    setQuestionForm({
      question: "",
      questionType: "text",
      options: "",
      isRequired: true,
      specializationId: "",
      order: "1",
      placeholder: "",
      isActive: true,
    })
    setQuestionDialogOpen(true)
  }

  const openEditQuestionDialog = (q: AppointmentQuestion) => {
    setEditingQuestion(q)
    // Extract ID from populated object or use string directly
    let specIdForForm: string = ""
    if (q.specializationId) {
      if (typeof q.specializationId === "object") {
        specIdForForm = q.specializationId._id
      } else {
        specIdForForm = q.specializationId
      }
    }
    setQuestionForm({
      question: q.question,
      questionType: q.questionType,
      options: q.options.join(", "),
      isRequired: q.isRequired,
      specializationId: specIdForForm,
      order: q.order.toString(),
      placeholder: q.placeholder || "",
      isActive: q.isActive,
    })
    setQuestionDialogOpen(true)
  }

  const handleQuestionSubmit = async () => {
    if (!questionForm.question.trim()) {
      toast.error("Question is required")
      return
    }

    const needsOptions = ["select", "checkbox", "radio"].includes(questionForm.questionType)
    if (needsOptions && !questionForm.options.trim()) {
      toast.error("Options are required for this question type")
      return
    }

    setIsSubmittingQuestion(true)
    try {
      const data = {
        question: questionForm.question.trim(),
        questionType: questionForm.questionType,
        options: questionForm.options.split(",").map((o) => o.trim()).filter(Boolean),
        isRequired: questionForm.isRequired,
        specializationId: questionForm.specializationId || null,
        order: parseInt(questionForm.order) || 1,
        placeholder: questionForm.placeholder.trim(),
        isActive: questionForm.isActive,
      }

      if (editingQuestion) {
        await updateQuestion(editingQuestion._id, data)
        toast.success("Question updated successfully")
      } else {
        await createQuestion(data)
        toast.success("Question created successfully")
      }
      setQuestionDialogOpen(false)
    } catch (error: any) {
      toast.error(error.message || "Failed to save question")
    } finally {
      setIsSubmittingQuestion(false)
    }
  }

  // ============ Delete Handlers ============

  const openDeleteDialog = (type: "specialization" | "question", item: Specialization | AppointmentQuestion) => {
    setDeleteDialog({ open: true, type, item })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.item) return

    setIsDeleting(true)
    try {
      if (deleteDialog.type === "specialization") {
        await deleteSpecialization(deleteDialog.item._id)
        toast.success("Specialization deleted successfully")
      } else {
        await deleteQuestion(deleteDialog.item._id)
        toast.success("Question deleted successfully")
      }
      setDeleteDialog({ open: false, type: "specialization", item: null })
    } catch (error: any) {
      toast.error(error.message || "Failed to delete")
    } finally {
      setIsDeleting(false)
    }
  }

  const getSpecializationName = (specId: AppointmentQuestion["specializationId"]) => {
    if (!specId) return "Global (All Specializations)"
    // Handle populated object from API (has _id and name)
    if (typeof specId === "object" && specId !== null) {
      return specId.name || "Unknown"
    }
    // Fallback for string ID (shouldn't happen with current API but keeping for safety)
    const spec = specializations.find((s) => s._id === specId)
    return spec?.name || "Unknown"
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Specializations & Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <TabsList>
                <TabsTrigger value="specializations">Specializations</TabsTrigger>
                <TabsTrigger value="questions">Appointment Questions</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                {activeTab === "specializations" ? (
                  <Button onClick={openAddSpecDialog} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Specialization
                  </Button>
                ) : (
                  <Button onClick={openAddQuestionDialog} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Question
                  </Button>
                )}
              </div>
            </div>

            {/* Specializations Tab */}
            <TabsContent value="specializations">
              {isLoadingSpecializations ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredSpecializations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <p className="text-lg font-medium">No specializations found</p>
                  <p className="text-sm mt-1">Add your first specialization to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Fee</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSpecializations.map((spec) => (
                        <TableRow key={spec._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {spec.imageUrl ? (
                                <img 
                                  src={spec.imageUrl} 
                                  alt={spec.name}
                                  className="h-10 w-10 rounded-md object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                                  <span className="text-muted-foreground text-xs">No img</span>
                                </div>
                              )}
                              <div className="font-medium">{spec.name}</div>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[200px]">
                            <p className="truncate text-sm text-muted-foreground">
                              {spec.description}
                            </p>
                          </TableCell>
                          <TableCell>₹{spec.consultationFee}</TableCell>
                          <TableCell>
                            <Badge variant={spec.isActive ? "default" : "secondary"}>
                              {spec.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {spec.tags.slice(0, 2).map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {spec.tags.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                  +{spec.tags.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditSpecDialog(spec)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteDialog("specialization", spec)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Questions Tab */}
            <TabsContent value="questions">
              {isLoadingQuestions ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <HelpCircle className="h-12 w-12 mb-4" />
                  <p className="text-lg font-medium">No questions found</p>
                  <p className="text-sm mt-1">Add questions that patients will answer when booking</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-8">#</TableHead>
                        <TableHead>Question</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Specialization</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredQuestions
                        .sort((a, b) => a.order - b.order)
                        .map((q) => (
                          <TableRow key={q._id}>
                            <TableCell>
                              <span className="text-muted-foreground">{q.order}</span>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium max-w-[300px]">
                                <p className="truncate">{q.question}</p>
                                {q.options.length > 0 && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Options: {q.options.slice(0, 3).join(", ")}
                                    {q.options.length > 3 && ` +${q.options.length - 3} more`}
                                  </p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {questionTypes.find((t) => t.value === q.questionType)?.label || q.questionType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className={!q.specializationId ? "text-blue-600 font-medium" : ""}>
                                {getSpecializationName(q.specializationId)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant={q.isRequired ? "default" : "secondary"}>
                                {q.isRequired ? "Required" : "Optional"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={q.isActive ? "default" : "secondary"}>
                                {q.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditQuestionDialog(q)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDeleteDialog("question", q)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Add/Edit Specialization Dialog */}
      <Dialog open={specDialogOpen} onOpenChange={setSpecDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingSpec ? "Edit Specialization" : "Add Specialization"}
            </DialogTitle>
            <DialogDescription>
              {editingSpec
                ? "Update the specialization details"
                : "Create a new appointment category"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="spec-name">Name *</Label>
              <Input
                id="spec-name"
                value={specForm.name}
                onChange={(e) => setSpecForm({ ...specForm, name: e.target.value })}
                placeholder="e.g., Cardiology"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spec-description">Description</Label>
              <Textarea
                id="spec-description"
                value={specForm.description}
                onChange={(e) => setSpecForm({ ...specForm, description: e.target.value })}
                placeholder="Brief description of this specialization..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Image (optional)</Label>
              {specForm.imageUrl ? (
                <div className="relative inline-block">
                  <img
                    src={specForm.imageUrl}
                    alt="Specialization"
                    className="h-32 w-32 rounded-lg object-cover border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <label
                    htmlFor="spec-image-upload"
                    className="flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors"
                  >
                    {isUploadingImage ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="mt-2 text-xs text-muted-foreground">Upload Image</span>
                      </>
                    )}
                    <input
                      id="spec-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                    />
                  </label>
                  <div className="text-xs text-muted-foreground">
                    <p>Max size: 5MB</p>
                    <p>Formats: JPG, PNG, GIF</p>
                  </div>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="spec-fee">Consultation Fee (₹) *</Label>
                <Input
                  id="spec-fee"
                  type="number"
                  value={specForm.consultationFee}
                  onChange={(e) => setSpecForm({ ...specForm, consultationFee: e.target.value })}
                  placeholder="500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spec-tags">Tags (comma separated)</Label>
                <Input
                  id="spec-tags"
                  value={specForm.tags}
                  onChange={(e) => setSpecForm({ ...specForm, tags: e.target.value })}
                  placeholder="heart, cardiovascular"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="spec-active"
                checked={specForm.isActive}
                onCheckedChange={(checked) => setSpecForm({ ...specForm, isActive: checked })}
              />
              <Label htmlFor="spec-active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSpecDialogOpen(false)} disabled={isSubmittingSpec || isUploadingImage}>
              Cancel
            </Button>
            <Button onClick={handleSpecSubmit} disabled={isSubmittingSpec || isUploadingImage}>
              {isSubmittingSpec && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingSpec ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Question Dialog */}
      <Dialog open={questionDialogOpen} onOpenChange={setQuestionDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "Edit Question" : "Add Question"}
            </DialogTitle>
            <DialogDescription>
              {editingQuestion
                ? "Update the question details"
                : "Create a new question for appointment booking"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="q-question">Question *</Label>
              <Textarea
                id="q-question"
                value={questionForm.question}
                onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })}
                placeholder="What symptoms are you experiencing?"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="q-type">Question Type *</Label>
                <Select
                  value={questionForm.questionType}
                  onValueChange={(value) =>
                    setQuestionForm({ ...questionForm, questionType: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {questionTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="q-order">Order</Label>
                <Input
                  id="q-order"
                  type="number"
                  value={questionForm.order}
                  onChange={(e) => setQuestionForm({ ...questionForm, order: e.target.value })}
                  placeholder="1"
                />
              </div>
            </div>
            {["select", "checkbox", "radio"].includes(questionForm.questionType) && (
              <div className="space-y-2">
                <Label htmlFor="q-options">Options (comma separated) *</Label>
                <Input
                  id="q-options"
                  value={questionForm.options}
                  onChange={(e) => setQuestionForm({ ...questionForm, options: e.target.value })}
                  placeholder="Option 1, Option 2, Option 3"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="q-spec">Specialization</Label>
              <Select
                value={questionForm.specializationId || "global"}
                onValueChange={(value) =>
                  setQuestionForm({
                    ...questionForm,
                    specializationId: value === "global" ? null : value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select specialization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">Global (All Specializations)</SelectItem>
                  {specializations.map((spec) => (
                    <SelectItem key={spec._id} value={spec._id}>
                      {spec.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Global questions appear for all specializations
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="q-placeholder">Placeholder Text</Label>
              <Input
                id="q-placeholder"
                value={questionForm.placeholder}
                onChange={(e) => setQuestionForm({ ...questionForm, placeholder: e.target.value })}
                placeholder="Enter placeholder text..."
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="q-required"
                  checked={questionForm.isRequired}
                  onCheckedChange={(checked) =>
                    setQuestionForm({ ...questionForm, isRequired: checked })
                  }
                />
                <Label htmlFor="q-required">Required</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="q-active"
                  checked={questionForm.isActive}
                  onCheckedChange={(checked) =>
                    setQuestionForm({ ...questionForm, isActive: checked })
                  }
                />
                <Label htmlFor="q-active">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setQuestionDialogOpen(false)} disabled={isSubmittingQuestion}>
              Cancel
            </Button>
            <Button onClick={handleQuestionSubmit} disabled={isSubmittingQuestion}>
              {isSubmittingQuestion && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingQuestion ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Delete {deleteDialog.type === "specialization" ? "Specialization" : "Question"}
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this {deleteDialog.type}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ ...deleteDialog, open: false })}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
