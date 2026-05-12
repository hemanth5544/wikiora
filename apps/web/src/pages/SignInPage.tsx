import { SignIn } from "@clerk/clerk-react"
import { useSearchParams } from "react-router-dom"

import { Eyebrow } from "@/components/typography/Eyebrow"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignInPage() {
  const [searchParams] = useSearchParams()
  const redirectUrl = searchParams.get("redirect_url") ?? "/app"

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-3">
        <Eyebrow>Authentication</Eyebrow>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Access your Wikiora workspaces with Clerk.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl={redirectUrl} />
      </CardContent>
    </Card>
  )
}
