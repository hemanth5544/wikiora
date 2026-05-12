import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { toast } from "sonner"

import { MotionPage } from "@/components/motion/MotionPrimitives"
import { PageIntro } from "@/components/templates/PageIntro"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAcceptInviteMutation } from "@/features/workspaces/inviteApi"

export default function AcceptInvitePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const [acceptInvite, { isLoading }] = useAcceptInviteMutation()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setErrorMessage("This invite link is missing a token.")
    }
  }, [token])

  async function handleAccept() {
    if (!token) {
      return
    }

    setErrorMessage(null)

    try {
      const workspace = await acceptInvite({ token }).unwrap()
      toast.success(`Joined ${workspace.name}`)
      navigate("/app/workspaces", { replace: true })
    } catch {
      setErrorMessage("This invite could not be accepted. Sign in with the invited email and try again.")
      toast.error("Could not accept invite")
    }
  }

  return (
    <MotionPage>
      <PageIntro
        eyebrow="Invites"
        title="Accept workspace invite"
        description="Use the same email address that received the invite."
      />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Join workspace</CardTitle>
          <CardDescription>
            {token
              ? "Confirm to add this workspace to your account."
              : "Open the invite link from your email to continue."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {errorMessage ? <p className="type-body-sm text-destructive">{errorMessage}</p> : null}
          <Button type="button" disabled={!token || isLoading} onClick={handleAccept}>
            {isLoading ? "Accepting..." : "Accept invite"}
          </Button>
        </CardContent>
      </Card>
    </MotionPage>
  )
}
