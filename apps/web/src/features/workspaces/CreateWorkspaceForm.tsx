import { type FormEvent, useState } from "react"
import { toast } from "sonner"

import { MotionFormField } from "@/components/motion/MotionPrimitives"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SelectMenu } from "@/components/ui/select-menu"
import { useCreateWorkspaceMutation } from "@/features/workspaces/workspaceApi"

type CreateWorkspaceFormProps = {
  onSuccess?: () => void
  onCancel?: () => void
}

export function CreateWorkspaceForm({ onSuccess, onCancel }: CreateWorkspaceFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [visibility, setVisibility] = useState<"private" | "public">("private")
  const [createWorkspace, { isLoading }] = useCreateWorkspaceMutation()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    try {
      const workspace = await createWorkspace({
        name,
        description,
        visibility,
      }).unwrap()
      toast.success(`Workspace "${workspace.name}" created`)
      setName("")
      setDescription("")
      setVisibility("private")
      onSuccess?.()
    } catch {
      toast.error("Could not create workspace")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <MotionFormField>
        <Label htmlFor="workspace-name">Workspace name</Label>
        <Input
          id="workspace-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Engineering helpdesk"
          required
        />
      </MotionFormField>

      <MotionFormField>
        <Label htmlFor="workspace-description">Description</Label>
        <Input
          id="workspace-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What this workspace is for"
        />
      </MotionFormField>

      <MotionFormField>
        <Label htmlFor="workspace-visibility">Visibility</Label>
        <SelectMenu
          id="workspace-visibility"
          value={visibility}
          onChange={(value) => setVisibility(value as "private" | "public")}
          options={[
            { value: "private", label: "Private" },
            { value: "public", label: "Public" },
          ]}
        />
      </MotionFormField>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isLoading || name.trim().length === 0}>
          {isLoading ? "Creating..." : "Create workspace"}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  )
}
